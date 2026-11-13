# PRODUCTION_PLAN.md — From plan to a shippable, fun game

**Date:** 2026-11-13 · **Owner:** the user (product owner) · **Judge:** system-architect session · **Builder:** Antigravity (or any AI following `docs/spec/`).
Companion: `docs/GDD.md` (what/why), `docs/ROADMAP.md` (tickets), `docs/spec/` (contracts).

## 1. Principles
1. **Vertical slice first.** Build **one** map completely (Mirpur 10 + Phone Snatcher + chaser + crowd + voice babble + pile-on + HUD) before touching the other 7. If the slice isn't fun, more content won't fix it.
2. **Fun gates, not just feature gates.** Every milestone ends with a *human playtest* with a pass bar (§6), not only green tests.
3. **Judge between waves.** The judge session re-audits after every wave (`playtest-audit`); the builder never self-certifies.
4. **Cut scope before quality.** If time slips: drop maps 6–8 (keep the framework), then F-items, never the safety/consent work or the fun gates.
5. **Everything is in files.** State lives in ROADMAP/LOG/DECISIONS/memory, so any session can resume.

## 2. Milestones (each has an exit gate)

| M | Name | Contains (tickets) | Exit gate (all must pass) |
|---|---|---|---|
| **M0** | Stabilise | W0: V2-00 lobby scroll · V2-01 layout/test-hook/seed RNG · V2-02 EntityMotion | S0 bugs M-01, C-01 fixed with proof; entities-in-bounds e2e green; judge re-audit |
| **M1** | **Playable core** ("is the chase fun?") | W1: V2-03 controls · V2-04 gap/patience/fail · V2-05 hazards+counters+stats · V2-06 run/stars/persistence · V2-40a bot harness | masher 0 % / average 65–85 % in the **real engine bot**; **Playtest #1** (3 players, grey-box art OK) passes §6 bars |
| **M2** | Characters | W2: V2-07..V2-15 | pose-sheet silhouette gate; rubric ≥ 8 per archetype; no limb tangle; faces mount correctly |
| **M3** | **Vertical slice** ("is it a *place* with a *street*?") | W3: V2-16 framework · V2-17 maps 1–3 · W3b: V2-34, 31, 32, **37a**, 33, 35, 36, 37b, 38 (std only) | Mirpur slice complete: crowd, mob finisher, babble voices, tutorial run; **Playtest #2** (5 players) passes; judge re-audit; perf ≥ 55 fps |
| **M4** | Content complete | W4: maps 4–8 · V2-39 dialect gag · V2-40 dialect phase 1 (owner/natives) | 8 maps pass Map-Done; ≥ 3 dialects live for M4–M8 with `reviewed` status; recorded clips for priority-1 lines |
| **M5** | UI/UX + polish | W5: V2-23..25 | all screens pass rubric at 3 viewports; a11y checks; **Playtest #3** (8 players, ≥ 2 on low-end phones) |
| **M6** | Release candidate → launch | W6: V2-26..30 | release checklist (§8) all ✅; zero S0/S1; owner sign-off |

Post-launch (**M7**): phase-2 dialect regions & maps (V2-41), F-items, seasonal skins.

## 3. Effort & schedule (rough, ±50 %; "builder-days" = one focused AI-builder working day incl. self-review)
W0 2 · W1 5 · W2 6 (parallel ≤ 5 agents → ~3 elapsed) · W3 6 · W3b 9 · W4 8 (parallel → ~4 elapsed) · W5 5 · W6 4 ≈ **45 builder-days**, **≈ 30 elapsed days** with the allowed parallelism. Owner-side work runs in parallel: Bangla proof-read (≈ 2 h), voice recording (≈ 2–4 h), dialect leads (≈ 1–2 h per dialect per round), playtest recruiting. Judge re-audits ≈ ½ day each × 7.
Re-plan at M1 using the *actual* velocity; don't trust this table beyond M1.

## 4. Roles & responsibilities
| Role | Does | Must not |
|---|---|---|
| **Owner** | decisions D1–D11, Bangla proof-read, recordings & consent, recruits dialect natives and playtesters, final sign-off | accept "done" without screenshots/evidence |
| **Judge** (this architect session) | specs, re-audits, spec changes, review scoring, risk register | write feature code |
| **Builder** (Antigravity) | implement tickets in order; EVIDENCE block; review loop | edit specs, add dependencies, skip gates, invent names |
| **Native dialect leads** | write/review dialect lines, record clips | — |
| **Playtesters** | play blind, think aloud | be coached |

## 5. Definition of Done
- **Ticket:** AC met with evidence · gates green · `verify-spec-refs` OK · API_FACTS diff = intended additions · review rubric passed (UI/art) · memory/LOG updated · ROADMAP `[x]` + commit.
- **Wave:** all tickets done · judge re-audit section added to `GAME_AUDIT.md` · `playtest-audit` checklist run · no new S0/S1.
- **Milestone:** exit gate row in §2 satisfied.
- **Release:** §8.

## 6. Playtest plan (the "is it fun?" gate)
- **Who:** 3 / 5 / 8 players at M1 / M3 / M5; mix of Bangla-first casual players, ≥ 1 non-gamer, ≥ 2 on low-end Android at M5; **not** the owner or builder; no coaching.
- **Script (15 min):** 1 min consent + "think aloud" → free play first run (no help) → 3 more runs → 4-question interview. Observer fills the sheet below; optional screen recording only with consent.
- **Observation sheet (per player):** time to first successful hit · did they discover dash/jump unaided · losses & the cause they *named* · number of retries without being asked · laughs/smiles (count + trigger) · moments of confusion (timestamp) · first thing they'd change.
- **Interview:** "What was the goal?" · "What made you lose?" · "What was the funniest moment?" · "Would you play again / show a friend?"
- **Pass bars:** M1 — ≥ 2/3 get a first hit within 45 s without help, ≥ 2/3 retry unprompted, ≥ 2/3 can name a loss cause. M3 — ≥ 4/5 laugh at least once at the crowd/pile-on, ≥ 4/5 identify the goal unaided, ≥ 3/5 say "play again", 0 report feeling uncomfortable. M5 — fps ≥ 45 on every low-end phone, ≥ 6/8 finish a run to the result screen, ≥ 6/8 "show a friend".
- Findings go to `docs/playtests/PT<n>.md` [NEW dir] with top-5 fixes; the judge turns them into tickets.

## 7. QA strategy
| Layer | Tooling | Cadence |
|---|---|---|
| Unit (pure logic: state machines, mood, resolver, balance model) | Vitest | every commit |
| Deterministic e2e (movement bounds, scenarios, mob timeline, HUD overlap, reachability) | Playwright + `?test=1&seed=N` fixed-step | every ticket |
| Visual regression | Playwright `toHaveScreenshot` golden frames | per UI ticket |
| Balance | `scripts/balance/sim.mjs` + in-engine bot (V2-40) | per balance change |
| Performance | GPU Chrome profile; fps/frame-time asserts | per wave |
| Device matrix | desktop Chrome/Firefox/Edge; Android mid & low; iOS Safari 16+ | M3, M5, M6 |
| Content | `validate-voice`, `verify-spec-refs`, ledger check, glyph-torture render | CI + release |
| Manual exploratory | `playtest-audit` checklist | each wave |
**Bug severities:** S0 crash/unplayable/entities off-world/unsafe content · S1 core feature broken or UI covers play · S2 polish. Release needs 0 S0/S1.

## 8. Release checklist (M6)
- [ ] Gates: `npx tsc --noEmit`, lint, unit, e2e (GPU), `npm run build`.
- [ ] Perf: ≥ 55 fps desktop / ≥ 45 fps mid Android; first load < 4 s on throttled 4G; bundle/asset budgets (voice ≤ 3 MB initial).
- [ ] PWA: manifest, offline works after first load, service-worker cache versioning verified, update flow tested.
- [ ] Assets: **ledger complete** (every non-synth file + consent), `CREDITS.md` updated, licences verified.
- [ ] Content: Bangla std lines proof-read (owner); dialect rows `reviewed+`; validators pass with `--release`; content/tone rubric criterion 7 = 5 on every map.
- [ ] Privacy/legal: in-app privacy note (photos stay on device), consent gate live, Friendly mode, no real brands/people, no tracking; age-suitability self-check (cartoon slapstick, PG).
- [ ] Accessibility: Calm mode, subtitle sizes, keyboard path, contrast AA, reduced-motion.
- [ ] Docs: GAME_AUDIT final re-audit; LOG; DECISIONS; README; known-issues list.
- [ ] Deployment: Vercel **preview** deploy verified by owner on real phones → owner explicit OK → production promote (never auto). Rollback plan: previous deployment alias kept; one-click promote of last good.
- [ ] Post-launch: feedback channel (a visible "মতামত দিন" mailto/link, no tracking), issue triage template.

## 9. Branching & delivery
`master` stable. One branch per ticket `t-v2-NN-slug`; merge only with gates + EVIDENCE + judge OK; waves integrate via `.claude/scripts/worktree.sh integrate` (shared-contract tickets first). **Never push `master` or deploy without the owner's explicit approval.** Conventional commits.

## 10. Risk register (top 12)
| # | Risk | P | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Core loop not fun | M | critical | vertical slice + M1 playtest before content; sim + bot | judge |
| R2 | Builder AI hallucinates / drifts | H | high | spec pack, API_FACTS, verify-spec-refs, EVIDENCE, spec lock, small tickets, judge re-audit | judge |
| R3 | Software-GL/headless can't validate gameplay | H | med | test hook + fixed-step; GPU Chrome for perf; builder must state "not verified" | builder |
| R4 | Character art quality misses the bar | M | high | pose-sheet gate; fallback to sprite sheets after 2 failed gates | builder/owner |
| R5 | Dialect quality/offence | M | high | native-only authoring, second reviewer, veto rule, fallback to std | owner |
| R6 | Voice recording logistics slip | M | med | babble tier works with zero clips; priority-1 lines first | owner |
| R7 | Pile-on read as glorifying violence | L–M | high | caps, police punchline, line rewrite, consent gate, Calm mode, rubric auto-fail | judge |
| R8 | Performance on low-end phones | M | high | NPC cap 28, pooled sprites, atlas budget, auto-quality; M5 device tests | builder |
| R9 | Scope creep (F-list) | H | med | F-items need a ticket; backlog is read-only for builder | judge |
| R10 | Spec itself wrong/contradictory | M | high | adversarial spec review (done once → v1.1), SPEC_CHANGE_REQUEST flow | judge |
| R11 | Licensing of any downloaded/generated audio | L | high | ledger + release gate; synth/recorded preferred | owner |
| R12 | Single-person bottlenecks (owner time for recordings/playtests) | M | med | batch tasks, checklists in AUDIO_SOURCING §5 | owner |

## 11. Cadence
Builder session ≤ 3 tickets, then closes (memory + LOG). Judge re-audit after each wave (≈ 3–5 days). Weekly owner check-in: demo build link + screenshots + open decisions. Playtests at M1/M3/M5. Re-plan at M1 with real velocity.
