#!/usr/bin/env node
// @purpose Random-search tuner: finds sim parameters whose win-rate/duration bands match the GDD fun targets. Writes scripts/balance/tuned.json.
// Run: node scripts/balance/tune.mjs [--iters=400]
import fs from "node:fs";
import { P, MAPS, evaluate } from "./sim.mjs";

const argv = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const ITERS = Number(argv.iters ?? 400);
export const TARGETS = [
  { arch: "phoneSnatcher", map: "beginner", win: { novice: 0.42, average: 0.82, expert: 0.96 } },
  { arch: "manholeChor",   map: "medium",   win: { novice: 0.22, average: 0.62, expert: 0.90 } },
  { arch: "boss",          map: "hard",     win: { novice: 0.05, average: 0.38, expert: 0.72 } },
];
const WIN_DUR = [50, 92]; // seconds, for winning runs of the 'average' player

// parameter search space [min,max]
const SPACE = {
  "surge.prob": [0.15, 0.6], "surge.mult": [1.15, 1.6], "surge.sec": [0.6, 1.6],
  hpScale: [1.5, 8], "assist.boost": [0.05, 0.4], "assist.afterSec": [1.5, 5], bossHpMul: [0.45, 1.0], rampPct: [0.1, 0.4], speedCompress: [0.1, 0.5],
  "patience.farDrain": [0.5, 3], "map.beginner.hazardEvery": [5, 9], "map.medium.hazardEvery": [3.5, 6.5], "map.hard.hazardEvery": [3, 5.5], "map.hard.counterEvery": [5, 9], "patience.hazardCost": [6, 14], "dash.mult": [0.4, 0.9], chaserBase: [0.95, 1.03],
};
const root = (k) => (k.startsWith("map.") ? [MAPS, k.slice(4)] : [P, k]);
const get = (k0) => { const [o, k] = root(k0); return k.split(".").reduce((x, p) => x[p], o); };
const set = (k0, v) => { const [o, k] = root(k0); const ks = k.split("."); const last = ks.pop(); ks.reduce((x, p) => x[p], o)[last] = v; };

function score(runs) {
  let err = 0, detail = [];
  for (const T of TARGETS) for (const sk of ["novice", "average", "expert"]) {
    const r = evaluate(T.arch, T.map, sk, runs);
    err += (r.win - T.win[sk]) ** 2 * 10;
    if (sk === "average" && r.win > 0.05) { const d = r.avgWinDur; if (d < WIN_DUR[0]) err += ((WIN_DUR[0] - d) / 15) ** 2; if (d > WIN_DUR[1]) err += ((d - WIN_DUR[1]) / 15) ** 2; }
    detail.push({ ...r });
  }
  return { err, detail };
}

let best = { err: Infinity }, bestParams = null;
const rnd = (a, b) => a + Math.random() * (b - a);
// start from current P
const snapshot = () => Object.fromEntries(Object.keys(SPACE).map((k) => [k, get(k)]));
bestParams = snapshot(); best = score(250);
for (let i = 0; i < ITERS; i++) {
  const cand = { ...bestParams };
  // perturb 2-3 params around best (local search) with occasional global jumps
  const keys = Object.keys(SPACE); const n = 1 + Math.floor(Math.random() * 3);
  for (let j = 0; j < n; j++) { const k = keys[Math.floor(Math.random() * keys.length)]; const [lo, hi] = SPACE[k]; cand[k] = Math.random() < 0.15 ? rnd(lo, hi) : Math.min(hi, Math.max(lo, cand[k] + (Math.random() - 0.5) * (hi - lo) * 0.25)); }
  for (const k in cand) set(k, cand[k]);
  const sc = score(250);
  if (sc.err < best.err) { best = sc; bestParams = cand; }
  else for (const k in bestParams) set(k, bestParams[k]);
}
for (const k in bestParams) set(k, bestParams[k]);
const final = score(4000);
fs.writeFileSync(new URL("./tuned.json", import.meta.url), JSON.stringify({ params: bestParams, err: final.err, results: final.detail.map((r) => ({ arch: r.arch, map: r.map, skill: r.skill, win: +r.win.toFixed(3), avgWinDur: +r.avgWinDur.toFixed(1), avgPatience: +r.avgPatience.toFixed(1), hits: +r.hits.toFixed(1), innocents: +r.innocents.toFixed(2), causes: r.causes })) }, null, 1));
console.log("tuned params:", JSON.stringify(Object.fromEntries(Object.entries(bestParams).map(([k, v]) => [k, +v.toFixed(3)]))));
console.log("final error:", final.err.toFixed(4));
for (const r of final.detail) console.log(`${r.arch.padEnd(13)} ${r.map.padEnd(8)} ${r.skill.padEnd(8)} win ${(r.win * 100).toFixed(0).padStart(3)}%  winDur ${r.avgWinDur.toFixed(0)}s  patience ${r.avgPatience.toFixed(0)}  causes ${JSON.stringify(r.causes)}`);
