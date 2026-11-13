#!/usr/bin/env node
// @purpose Anti-hallucination gate: every existing-file path and bus event named in the spec docs must really exist (or be tagged [NEW]).
// Run: node scripts/audit/verify-spec-refs.mjs        exit 1 on any unknown reference
// Spec authoring rules this enforces:
//   - A backticked path under src/ public/ docs/ scripts/ e2e/ .claude/ that EXISTS today is fine.
//   - A path that does NOT exist yet must be declared with [NEW] immediately after it AT LEAST ONCE in the spec pack (e.g. `src/game/systems/CrowdSystem.ts` [NEW]); later mentions need no tag.
//   - Placeholders (<id>, *, {a,b}) and URLs are skipped.
//   - A backticked bus event like `crowd:pileOn` must exist in src/game/bus.ts, or be followed by [NEW].
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const specFiles = [
  ...fs.readdirSync("docs/spec").filter((f) => f.endsWith(".md")).map((f) => `docs/spec/${f}`),
  "docs/GAME_PLAN_V2.md",
  "docs/HANDOFF_PROMPT.md",
  "docs/ROADMAP.md",
  "docs/GDD.md",
  "docs/PRODUCTION_PLAN.md",
  "docs/OVERNIGHT_RUN.md",
  "docs/overnight/BUILDER_PROMPT.md",
];
const bus = fs.readFileSync("src/game/bus.ts", "utf8");
const busEvents = new Set([...bus.matchAll(/"([a-zA-Z]+(?::[a-zA-Z]+)?)":/g)].map((m) => m[1]));

// Namespaces owned by the event bus. Add a new namespace here when a spec introduces one.
const BUS_NAMESPACES = new Set(["weapon", "event", "game", "debug", "player", "combat", "villain", "loader", "fps", "crowd", "voice", "mob", "npc", "announcer", "hit", "combo"]);
let branches = new Set();
try { branches = new Set(execSync("git for-each-ref --format='%(refname:short)' refs/heads refs/remotes", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean).flatMap((b) => [b, b.replace(/^origin\//, "")])); } catch { /* not a git repo */ }
// Local-only tooling folders are not part of the shared repo; references to them are never verified.
const LOCAL_ONLY = /^(?:\.claude|\.agents|\.agent|\.gemini|\.antigravity)(?:\/|$)/;
const PATH_RE = /^(?:src|public|docs|scripts|e2e|\.claude|\.agents)\/[\w./@()\-\[\]]+$/;
const problems = [];
let checked = 0;

// Pass 1: anything declared [NEW] / [NEW EVENT] in ANY spec file counts as declared for the whole pack
// (declare once where it is specified; later mentions need no tag).
const declaredNew = new Set();
for (const file of specFiles) {
  if (!fs.existsSync(file)) continue;
  for (const m of fs.readFileSync(file, "utf8").matchAll(/`([^`]+)`\s*\[NEW(?: EVENT)?\]/g)) declaredNew.add(m[1].trim().replace(/:(\d+)(-\d+)?$/, ""));
}

for (const file of specFiles) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/`([^`]+)`(\s*\[NEW(?: EVENT)?\])?/g)) {
      let tok = m[1].trim();
      const isNew = !!m[2];
      // strip :line suffix and trailing punctuation
      tok = tok.replace(/:(\d+)(-\d+)?$/, "").replace(/[),.;]+$/, "");
      if (/[<*{}]|https?:/.test(tok) || /\bNN\b/.test(tok) || branches.has(tok) || LOCAL_ONLY.test(tok)) continue;
      if (PATH_RE.test(tok)) {
        checked++;
        if (!isNew && !declaredNew.has(tok) && !fs.existsSync(path.join(root, tok))) problems.push(`${file}:${i + 1}  missing path  ${tok}   (tag [NEW] if it should be created)`);
        continue;
      }
      if (/^[a-z]+:[a-zA-Z]+$/.test(tok) && BUS_NAMESPACES.has(tok.split(":")[0])) {
        checked++;
        if (!isNew && !declaredNew.has(tok) && !busEvents.has(tok)) problems.push(`${file}:${i + 1}  unknown bus event  ${tok}   (tag [NEW EVENT] if you are adding it)`);
      }
    }
  });
}

console.log(`verify-spec-refs: checked ${checked} references in ${specFiles.length} files`);
if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} unresolved reference(s) — fix the doc or tag [NEW].`);
  process.exit(1);
}
console.log("OK — every referenced path/event exists or is tagged [NEW].");
