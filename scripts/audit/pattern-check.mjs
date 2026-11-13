#!/usr/bin/env node
// @purpose Mechanical design-pattern ratchet: counts known anti-patterns in src/ and FAILS if any count rises above scripts/audit/pattern-baseline.json.
// Run: npm run pattern:check            (exit 1 on regression)
//      node scripts/audit/pattern-check.mjs --update-baseline   (only the judge/owner or a ticket that REMOVES violations may lower it; never raise it)
//      node scripts/audit/pattern-check.mjs --verbose            (list offending file:line)
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const walk = (dir) => fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => { const rel = path.join(dir, e.name); return e.isDirectory() ? walk(rel) : [rel]; }) : [];
const files = walk("src").filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes("__tests__"));
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const inDir = (f, d) => f.startsWith(d + path.sep) || f.startsWith(d + "/");

// Each check: id, description, target-state rule, matcher(file, lines) -> array of {line}
const CHECKS = [
  { id: "P01_math_random_in_game", why: "Gameplay randomness must use the seeded rng (src/lib/rng.ts) so seeds reproduce runs (ANTI_HALLUCINATION R10).",
    scope: (f) => inDir(f, "src/game") || inDir(f, "src/services"), re: /Math\.random\s*\(/ },
  { id: "P02_direct_entity_position_write", why: "Entity x/y must only change through EntityMotion channels (GAME_PLAN §4.4); direct writes caused the knockback drift bug (audit C-01).",
    scope: (f) => inDir(f, "src/game") && !/EntityMotion/.test(f), re: /\b(?:rig|this)\.(?:x|y)\s*(?:\+|-)?=(?!=)|\bx:\s*(?:targetX|this\.x\s*[+-])/ },
  { id: "P03_lane_literals_outside_layout", why: "Lane/zone numbers live in src/config/layout.ts (DESIGN §7); no ad-hoc lane arrays.",
    scope: (f) => !/src[\\/]config[\\/](layout|balance)\.ts$/.test(f), re: /\bLANES_Y\b|\bLANE_SCALES\b/ },
  { id: "P04_bus_on_without_off", why: "Every gameBus.on needs a matching off in the same file (StrictMode/scene restart leaks).",
    custom: (f, src) => { const on = (src.match(/gameBus\.on\(/g) || []).length, off = (src.match(/gameBus\.off\(/g) || []).length; return on > off ? [{ line: 1, note: `on=${on} off=${off}` }] : []; } },
  { id: "P05_any_type", why: "No `any` — use real types (strict TS).", scope: () => true, re: /:\s*any\b|\bas any\b|<any>/ },
  { id: "P06_console_log", why: "No debug prints in shipped code (console.warn/error with context are OK).", scope: () => true, re: /console\.(?:log|debug|info)\s*\(/ },
  { id: "P07_settimeout_in_game", why: "Use scene.time.delayedCall (pausable, scene-scoped) instead of setTimeout inside src/game.", scope: (f) => inDir(f, "src/game"), re: /\bsetTimeout\s*\(/ },
  { id: "P08_hex_literals_in_systems", why: "Colours come from tokens/map palettes, not literals inside systems (DESIGN §2). Art-definition files are exempt.",
    scope: (f) => inDir(f, "src/game/systems") || inDir(f, "src/game/entities"), re: /0x[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{6}\b/ },
  { id: "P09_file_over_800_lines", why: "Large files hide coupling; split by domain (BootScene is the known offender).",
    custom: (f, src) => (src.split("\n").length > 800 ? [{ line: 1, note: `${src.split("\n").length} lines` }] : []) },
  { id: "P10_unguarded_localstorage", why: "localStorage must be wrapped in try/catch (private mode / blocked storage).",
    custom: (f, src) => { const out = []; src.split("\n").forEach((l, i) => { if (/localStorage\.(?:get|set|remove)Item/.test(l)) { const ctx = src.split("\n").slice(Math.max(0, i - 4), i + 1).join("\n"); if (!/try\s*\{|catch/.test(ctx) && !/try\s*\{/.test(src.split("\n").slice(Math.max(0, i - 8), i).join("\n"))) out.push({ line: i + 1 }); } }); return out; } },
];

const counts = {}, detail = {};
for (const c of CHECKS) { counts[c.id] = 0; detail[c.id] = []; }
for (const f of files) {
  const src = read(f); const lines = src.split("\n");
  for (const c of CHECKS) {
    let hits = [];
    if (c.custom) hits = c.custom(f, src);
    else if (c.scope(f)) lines.forEach((l, i) => { if (c.re.test(l) && !/pattern-ok/.test(l)) hits.push({ line: i + 1 }); });
    counts[c.id] += hits.length;
    for (const h of hits) detail[c.id].push(`${f}:${h.line}${h.note ? " (" + h.note + ")" : ""}`);
  }
}

const baselinePath = path.join(root, "scripts/audit/pattern-baseline.json");
if (args.has("--update-baseline")) {
  fs.writeFileSync(baselinePath, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), counts }, null, 2) + "\n");
  console.log("baseline written:", JSON.stringify(counts));
  process.exit(0);
}
const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, "utf8")).counts : null;
let failed = false;
console.log("pattern-check (lower is better; may never exceed baseline):");
for (const c of CHECKS) {
  const base = baseline ? baseline[c.id] ?? 0 : 0;
  const now = counts[c.id];
  const status = now > base ? "❌ REGRESSION" : now < base ? "⬇ improved (lower the baseline)" : "= same";
  console.log(`  ${c.id.padEnd(36)} now=${String(now).padStart(3)} baseline=${String(base).padStart(3)}  ${status}`);
  if (now > base) { failed = true; console.log(`     why: ${c.why}`); detail[c.id].slice(0, 12).forEach((d) => console.log("     " + d)); }
  else if (args.has("--verbose")) detail[c.id].forEach((d) => console.log("     " + d));
}
if (failed) { console.error("\nFAIL: new pattern violations introduced. Fix them (or add `// pattern-ok: <reason>` on the line for a justified exception)."); process.exit(1); }
console.log("OK — no new pattern violations.");
