#!/usr/bin/env node
// @purpose Monte-Carlo balance simulator for the V2 chase loop (gap, patience, hazards, combo, mob finish). Pure JS, no game engine.
// Run: node scripts/balance/sim.mjs [--runs=3000] [--json]
// This is a MODEL (abstract px/s units) used to pick starting numbers and to define the win-rate bands the in-engine bot test (V2-40) must reproduce. Real playtests override it.

const argv = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const RUNS = Number(argv.runs ?? 3000);

// ---------- Tunables (candidate values for src/config/balance.v2.ts) ----------
export const P = {
  dt: 0.05,
  runSec: 100,                 // time for villain to reach safehouse unhindered
  v0: 300,                     // px/s abstract base speed
  chaserBase: 0.997,            // chaser cruising speed as a fraction of villain's base
  rampPct: 0.247,               // villain speed grows +22 % over the run
  startGap: 380, meleeRange: 220, chappalRange: 560, escapeGap: 900, escapeSec: 6,
  dash: { mult: 0.613, sec: 0.45, cd: 2.5, stamina: 25 },
  stamina: { max: 100, regen: 15 },
  patience: { max: 100, hazardCost: 7.48, farDrain: 0.68, closeRegen: 1.0, innocentCost: 10 },
  hazardSlow: { mult: 0.6, sec: 1.0 },
  stagger: { mult: 0.8, sec: 0.2 },         // tiny juice-only slow after each landed hit
  surge: { prob: 0.467, mult: 1.252, sec: 1.600 }, // villain panics and sprints after being hit -> forces re-approach cycles
  bossHpMul: 0.736,                           // boss effective HP = archetype HP x hpScale x bossHpMul
  assist: { afterSec: 2.58, boost: 0.261 },     // rubber-band: far from villain > afterSec => chaser gets +boost speed (adrenaline). Dynamic-difficulty catch-up for new players
  speedCompress: 0.116,                       // archetype speedMultiplier effect is compressed so no villain is un-catchable / trivial
  hpScale: 1.927,                             // effective HP = archetype HP x hpScale (lobby still shows base)
  closeBonus: 0.25,
  combo: { timeout: 2.5, tiers: [[20, 2.0], [10, 1.5], [5, 1.25]] },
  rage: { perHit: 8, ultAt: 100, ultDamage: 350, ultStagger: 1.2 },
  mob: { hpGate: 0.30, moodGate: 70, minSec: 25, resolveSec: 2.6 },
  mood: { base: 55, perHit: 3, innocent: -15, decay: 2 },
  weapons: {
    slap:    { dmg: 15, cd: 0.3, st: 6,  melee: true },
    punch:   { dmg: 30, cd: 0.5, st: 10, melee: true },
    kick:    { dmg: 55, cd: 0.8, st: 16, melee: true },
    chappal: { dmg: 85, cd: 1.2, st: 18, melee: false },
  },
};

export const ARCHETYPES = {
  phoneSnatcher: { hp: 650, speed: 1.2, dodge: 0.35 },   // raw lobby speedMultiplier; compressed by P.speedCompress at runtime
  pickpocket:    { hp: 550, speed: 1.25, dodge: 0.45 },
  cableChor:     { hp: 950, speed: 0.9, dodge: 0.15 },
  manholeChor:   { hp: 1100, speed: 0.85, dodge: 0.10 },
  boss:          { hp: 1600, speed: 1.0, dodge: 0.20 },
};

export const MAPS = {
  beginner: { hazardEvery: 7.76, counterEvery: 9.0, innocentRisk: 1.0 },   // Mirpur-like
  medium:   { hazardEvery: 3.61, counterEvery: 7.5, innocentRisk: 1.3 },
  hard:     { hazardEvery: 5.26, counterEvery: 8.47, innocentRisk: 1.6 },   // Old Dhaka / Haor-like
};

// skill models: how a human of that level behaves
export const SKILLS = {
  masher:  { avoid: 0.30, reaction: 1.4, innocent: 0.070, dashProb: 0.05, dashWhenGap: 0, useRange: false, rangeAware: 0, spamRate: 6.0, usesChappal: 0.2, taunts: 0 }, // never learns: presses everything, ignores range
  novice:  { avoid: 0.58, reaction: 0.9, innocent: 0.035, dashProb: 0.35, dashWhenGap: 300, useRange: false, rangeAware: 0.8, spamRate: 3.5, usesChappal: 0.5, taunts: 0 },
  average: { avoid: 0.72, reaction: 0.55, innocent: 0.022, dashProb: 0.6, dashWhenGap: 260, useRange: true, rangeAware: 1, spamRate: 2.2, usesChappal: 0.7, taunts: 0.2 },
  expert:  { avoid: 0.93, reaction: 0.22, innocent: 0.007, dashProb: 0.95, dashWhenGap: 235, useRange: true, rangeAware: 1, spamRate: 2.0, usesChappal: 1.0, taunts: 0.5 },
};

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function comboMult(c) { for (const [n, m] of P.combo.tiers) if (c >= n) return m; return 1; }

export function runOnce(rng, arch, map, skill) {
  const A0 = ARCHETYPES[arch], M = MAPS[map], S = SKILLS[skill];
  const A = { ...A0, speed: 1 + (A0.speed - 1) * P.speedCompress };
  let t = 0, gap = P.startGap, hp = A.hp * P.hpScale * (arch === "boss" ? P.bossHpMul : 1), patience = P.patience.max, stamina = P.stamina.max, mood = P.mood.base, rage = 0, combo = 0, lastHit = -99;
  let farAssistT = 0, surgeT = 0, dashT = 0, dashCd = 0, slowT = 0, stagT = 0, farT = 0, hits = 0, innocents = 0, nextHazard = M.hazardEvery * (0.5 + rng()), nextCounter = M.counterEvery * (0.6 + rng()), mobAt = null;
  const cd = {}; for (const k in P.weapons) cd[k] = 0;
  let misalignT = 0, nextLane = 4.5 * (0.7 + rng() * 0.6), progress = 0;
  let ult = false;

  while (t < 140) {
    const dt = P.dt; t += dt;
    // villain speed & progress
    const ramp = 1 + P.rampPct * (t / P.runSec);
    let vv = P.v0 * A.speed * ramp * (stagT > 0 ? P.stagger.mult : 1) * (surgeT > 0 ? P.surge.mult : 1);
    let vc = P.v0 * P.chaserBase * (slowT > 0 ? P.hazardSlow.mult : 1) * (dashT > 0 ? 1 + P.dash.mult : 1) * (farAssistT > P.assist.afterSec ? 1 + P.assist.boost : 1);
    // gap dynamics: chaser speed relative to villain; villain is slightly fast so player must act
    gap += (vv - vc) * dt;
    gap = Math.max(40, gap);
    progress += (A.speed * ramp * (stagT > 0 ? P.stagger.mult : 1) * (surgeT > 0 ? P.surge.mult : 1)) * dt / P.runSec; // 0..1; reaches 1 at runSec for an unhindered villain with speed factor 1
    // timers
    if (dashT > 0) dashT -= dt; if (dashCd > 0) dashCd -= dt; if (slowT > 0) slowT -= dt; if (stagT > 0) stagT -= dt; if (surgeT > 0) surgeT -= dt; if (misalignT > 0) misalignT -= dt;
    for (const k in cd) if (cd[k] > 0) cd[k] -= dt;
    stamina = Math.min(P.stamina.max, stamina + P.stamina.regen * dt);
    mood += (P.mood.base - mood) * Math.min(1, P.mood.decay * dt / 20);
    if (t - lastHit > P.combo.timeout) combo = 0;
    // zones
    if (gap > P.chappalRange) { patience -= P.patience.farDrain * dt; } else if (gap < P.meleeRange) { patience = Math.min(P.patience.max, patience + P.patience.closeRegen * dt); }
    farT = gap > P.escapeGap ? farT + dt : 0;
    farAssistT = gap > P.chappalRange ? farAssistT + dt : 0;
    // villain lane changes -> misalignment window
    nextLane -= dt; if (nextLane <= 0) { nextLane = 4.5 * (0.7 + rng() * 0.6); if (rng() < 0.6) misalignT = S.reaction; }
    // hazards (map) and villain counter-moves
    nextHazard -= dt;
    if (nextHazard <= 0) { nextHazard = M.hazardEvery * (0.6 + rng() * 0.8); if (rng() > S.avoid) { patience -= P.patience.hazardCost; slowT = P.hazardSlow.sec; combo = 0; } }
    nextCounter -= dt;
    if (nextCounter <= 0) { nextCounter = M.counterEvery * (0.7 + rng() * 0.6); if (rng() > S.avoid) { patience -= P.patience.hazardCost; slowT = P.hazardSlow.sec; combo = 0; } }
    // dash decision
    if (dashCd <= 0 && stamina >= P.dash.stamina && dashT <= 0) {
      const want = S.dashWhenGap > 0 ? gap > S.dashWhenGap : (S.rangeAware ? gap > 250 : rng() < 0.4);
      if (want && rng() < S.dashProb * dt * 4) { dashT = P.dash.sec; dashCd = P.dash.cd; stamina -= P.dash.stamina; }
    }
    // attack decisions
    const aligned = misalignT <= 0 ? 1 : 0.2;
    for (const [name, w] of Object.entries(P.weapons)) {
      if (cd[name] > 0 || stamina < w.st) continue;
      const inRange = w.melee ? gap <= P.meleeRange : gap <= P.chappalRange;
      const weaponPref = name === "chappal" ? S.usesChappal : 1;
      let press;
      const aware = S.useRange || rng() < (S.rangeAware ?? 0);
      if (aware) press = inRange && rng() < Math.min(1, S.spamRate * dt * 2.2) * weaponPref * (name === "kick" ? 1.0 : name === "punch" ? 0.7 : name === "slap" ? 0.5 : 1);
      else press = rng() < S.spamRate * dt * 0.35;   // masher: presses buttons regardless of range
      if (!press) continue;
      stamina -= w.st; cd[name] = w.cd;
      if (!inRange) continue;                         // wasted
      if (rng() > aligned) { combo = 0; continue; }   // lane mismatch miss
      if (rng() < S.innocent * M.innocentRisk) {      // bonked an innocent
        innocents++; patience -= P.patience.innocentCost; slowT = Math.max(slowT, 1.0); combo = 0; mood += P.mood.innocent; continue;
      }
      if (rng() < A.dodge) { combo = 0; continue; }   // villain dodged
      const mult = comboMult(combo) * (gap < P.meleeRange ? 1 + P.closeBonus : 1);
      hp -= w.dmg * mult; combo++; hits++; lastHit = t; mood += P.mood.perHit; rage += P.rage.perHit; stagT = Math.max(stagT, P.stagger.sec); if (rng() < P.surge.prob) surgeT = P.surge.sec;
    }
    // ultimate
    if (rage >= P.rage.ultAt && !ult && (S.useRange || rng() < 0.01)) { hp -= P.rage.ultDamage; rage = 0; stagT = P.rage.ultStagger; }
    // mob finisher
    mood = Math.max(0, Math.min(100, mood));
    if (mobAt === null && hp > 0 && hp / (A.hp * P.hpScale * (arch === "boss" ? P.bossHpMul : 1)) <= P.mob.hpGate && mood >= P.mob.moodGate && t >= P.mob.minSec && rng() < 0.9 * dt * 2) mobAt = t + P.mob.resolveSec;
    if (mobAt !== null && t >= mobAt) { return { win: true, t, cause: "mob", patience, hits, innocents }; }
    if (hp <= 0) return { win: true, t, cause: "kill", patience, hits, innocents };
    if (patience <= 0) return { win: false, t, cause: "patience", patience: 0, hits, innocents };
    if (farT >= P.escapeSec) return { win: false, t, cause: "escaped(gap)", patience, hits, innocents };
    if (progress >= 1) return { win: false, t, cause: "safehouse", patience, hits, innocents };
  }
  return { win: false, t, cause: "timeout", patience, hits, innocents };
}

export function evaluate(arch, map, skill, runs = RUNS, seed = 1234) {
  const rng = mulberry32(seed + arch.length * 7 + map.length * 13 + skill.length * 17);
  let wins = 0, dur = 0, durWin = 0, pat = 0, hits = 0, inn = 0; const causes = {};
  for (let i = 0; i < runs; i++) {
    const r = runOnce(rng, arch, map, skill);
    if (r.win) { wins++; durWin += r.t; }
    dur += r.t; pat += r.patience; hits += r.hits; inn += r.innocents; causes[r.cause] = (causes[r.cause] || 0) + 1;
  }
  return { arch, map, skill, win: wins / runs, avgDur: dur / runs, avgWinDur: wins ? durWin / wins : 0, avgPatience: pat / runs, hits: hits / runs, innocents: inn / runs, causes: Object.fromEntries(Object.entries(causes).map(([k, v]) => [k, +(v / runs).toFixed(3)])) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = [];
  for (const [arch, map] of [["phoneSnatcher", "beginner"], ["pickpocket", "beginner"], ["cableChor", "medium"], ["manholeChor", "medium"], ["boss", "hard"], ["phoneSnatcher", "hard"]])
    for (const skill of ["masher", "novice", "average", "expert"]) rows.push(evaluate(arch, map, skill));
  if (argv.json) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
  console.log("archetype      map       skill    win%   avgDur  winDur  patience hits innoc  causes");
  for (const r of rows) console.log(`${r.arch.padEnd(14)} ${r.map.padEnd(9)} ${r.skill.padEnd(8)} ${(r.win * 100).toFixed(0).padStart(4)}%  ${r.avgDur.toFixed(0).padStart(5)}s  ${r.avgWinDur.toFixed(0).padStart(5)}s  ${r.avgPatience.toFixed(0).padStart(6)}  ${r.hits.toFixed(0).padStart(4)} ${r.innocents.toFixed(1).padStart(5)}  ${JSON.stringify(r.causes)}`);
}
