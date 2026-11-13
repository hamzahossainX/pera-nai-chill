#!/usr/bin/env node
// @purpose Shows how the adaptive-assist ladder lifts novice win-rates (reads scripts/balance/tuned.json). Run: node scripts/balance/assist.mjs
import fs from "node:fs";
import { P, MAPS, evaluate } from "./sim.mjs";
const tuned = JSON.parse(fs.readFileSync(new URL("./tuned.json", import.meta.url), "utf8")).params;
const setp = (k0, v) => { const root = k0.startsWith("map.") ? [MAPS, k0.slice(4)] : [P, k0]; const ks = root[1].split("."); const last = ks.pop(); ks.reduce((o, p) => o[p], root[0])[last] = v; };
for (const [k, v] of Object.entries(tuned)) setp(k, v);
const base = { cost: P.patience.hazardCost, hp: P.hpScale, boss: P.bossHpMul };
// assist ladder: [patience-cost x, villain-HP x, label]
const LADDER = [[1, 1, "L0 none"], [0.6, 0.85, "L1 (after 1 loss)"], [0.4, 0.7, "L2 (after 2 losses)"], [0.25, 0.55, "L3 (after 3 losses)"]];
const out = [];
for (const [cm, hm, label] of LADDER) {
  P.patience.hazardCost = base.cost * cm; P.hpScale = base.hp * hm;
  const row = { label };
  for (const sk of ["masher", "novice", "average"]) { const r = evaluate("phoneSnatcher", "beginner", sk, 3000); row[sk] = +(r.win * 100).toFixed(0); }
  out.push(row);
}
console.table(out);
