# REVIEW_LOOP.md — Reviewing a design again and again until it is actually good

**Goal:** the builder can iterate on a visual/UX design repeatedly without drifting, with objective stopping rules. **No new dependencies** — uses Playwright (already installed) for screenshots and image-snapshot diffs.

## 1. The loop (every UI / art / map / character ticket)

```
 BUILD ─▶ CAPTURE ─▶ SELF-REVIEW (rubric) ─▶ score ≥ gate? ──yes──▶ LOCK golden frames ─▶ JUDGE REVIEW
   ▲                                              │no
   └────────────── FIX the top 3 findings ◀───────┘      (max 3 rounds, then ESCALATE to owner)
```
- **Round cap:** 3 build-review rounds per ticket. After round 3 without passing, stop and post the review packet to the owner with 2 options (don't grind).
- **Fix discipline:** each round fixes **only the top 3 findings** (highest severity × visibility). Don't restyle everything; that is how designs regress.
- **Review as a different person:** before scoring, write the finding list *as if you were a skeptical gamer reading a one-star review of this screenshot* — not as the author.

## 2. Capture protocol (deterministic)

1. Start dev server; use `?test=1&seed=1234` (V2-01 hook) so crowds/hazards are reproducible.
2. `node scripts/audit/capture-audit.js` (extend it per ticket) → saves to `docs/screens/v2/<ticket>/round-<n>/`:
   `1280x720`, `844x390`, `1024x768` (+ `1920x1080` smoke), each at **t = 5 s, 20 s, and at the scripted peak moment** (e.g. mob at t0+1.2 s).
3. GPU or software? Run `node scripts/audit/fps-and-hits.js` first; if fps < 30, **timing screenshots are unreliable** — use the fixed-step hook to advance the sim by N ms and then capture, and say so in the packet.
4. Also capture a 6-frame **contact sheet** (every 500 ms) for animation tickets.

## 3. The rubric (score each 0–5; weights → total /10)

| # | Criterion | Weight | 5 = | 0 = |
|---|---|---|---|---|
| 1 | **Readability** — can I tell what is happening in 1 s at 844×390? | 2.0 | hero, villain, hazard, crowd all instantly legible | confusing blob |
| 2 | **Layout law** — layout.ts zones, no UI over lane feet, no dead band > 80 px, no clipped text | 2.0 | zero violations | multiple |
| 3 | **Art coherence** — one visual language (DESIGN §1), outlines/palette consistent | 1.5 | indistinguishable "same artist" | mixed styles |
| 4 | **Distinctness** — map/character/NPC clearly different from siblings (64 px greyscale test) | 1.5 | instant | near-duplicate |
| 5 | **Comedy/charm** — the staged gag lands visually (pose, timing, props, bubble) | 1.0 | makes me smile | flat |
| 6 | **Motion quality** — no teleports, jitter, drift, tangled limbs (contact sheet) | 1.0 | smooth, readable arcs | broken |
| 7 | **Safety/tone** — PG slapstick, no gore, no ethnic/religious/political/regional jab, **no line, caption or sound celebrates or encourages hitting a person**, no dialect mockery (CROWD §9.3, LOCALIZATION §9) | 0.5 (gate) | clean | **auto-fail** |
| 8 | **Perf** — fps budget met (GPU browser) | 0.5 | ≥ 55 fps | < 40 |
**Gate to pass: total ≥ 8.0/10 AND criterion 7 = 5 AND criteria 1 & 2 ≥ 4.** Any criterion ≤ 2 forces another round regardless of total.

## 4. Review packet (write to `docs/reviews/<ticket>-r<n>.md` [NEW dir])

```
# Review — <ticket> round <n>
Build: <sha>   Seed: 1234   Renderer: GPU|software(fps=…)
Screens: <paths>
Scores: 1=_ 2=_ 3=_ 4=_ 5=_ 6=_ 7=_ 8=_  → total _/10  → PASS|FAIL
Findings (severity S0/S1/S2 · visibility · where · evidence path):
  F1 …  F2 …  F3 … (top 3 get fixed this round; the rest are logged)
Fix plan (≤ 3 bullets): …
Delta vs previous round: <what visibly improved / regressed, with side-by-side path>
```

## 5. Regression locking (so a passed design stays passed)
After PASS, store **golden frames** in `e2e/__screenshots__/…` via Playwright `toHaveScreenshot` (seeded, fixed-step, masked regions for FPS/time) with `maxDiffPixelRatio ≤ 0.02`. Any later ticket that changes a golden frame must justify it in its EVIDENCE block and refresh the frame in the same commit with before/after paths.

## 6. Judge pass (the architect session re-runs)
Judge runs: `node scripts/audit/verify-spec-refs.mjs`, regenerates `API_FACTS.md`, re-captures with the same seed, compares to the builder's frames, re-scores independently. **Disagreement of > 1.5 points** on any criterion → the lower score stands and the builder gets one more round.

## 7. Per-asset quick checks (cheap, run every time)
- **Character:** pose sheet bbox ≤ 160×220; head centre within ±14 px of the neck joint (GAME_PLAN §4.4); no body part crosses another's z-order incorrectly.
- **Map:** 64 px greyscale thumbnail vs the other maps; ≥ 6 layers; no dead band; sign text ≥ 18 px.
- **NPC set:** ≥ 12 distinct activities visible across 3 seeds; ≤ 2 same-activity within 400 px; no NPC overlapping HUD.
- **UI:** tap targets ≥ 48 px (measure via `getBoundingClientRect` in a Playwright check); focus ring visible; text ≥ 14 px; Bangla glyph test strings render ("ফ্র", "ক্ষ", "র‍্যা").
- **Mob:** timeline matches CROWD §9.2 within ±100 ms (fixed-step test); ends with police line.
