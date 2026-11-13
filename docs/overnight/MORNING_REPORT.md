# MORNING REPORT — overnight build run

> Builder: fill every section honestly. Unknown/unrun = `NOT VERIFIED`. No marketing language.

**Run:** started `2026-11-13T14:24:21+06:00` · ended `<date -Is>` · elapsed `<h>` · branch `v2/build` @ `<sha>` · renderer: `software GL (fps=15)`

## 1. Summary (5 lines max)
- Done: … · Parked: … · Not started: … · Biggest risk found: … · First thing the owner should look at: …

## 2. Ticket table
| Ticket | Status (done / done-with-caveats / parked / not started) | Commit / tag | Evidence | Gates | Review score | NOT VERIFIED / ⚠ default-assumed |
|---|---|---|---|---|---|---|
| V2-00 | done | tag: v2-00-done | docs/overnight/evidence/V2-00.md | tsc ✅ · lint ✅ · test ✅ (37) · build ✅ · playwright ✅ (8) | n/a | none |
| V2-01 | done | tag: v2-01-done | docs/overnight/evidence/V2-01.md | tsc ✅ · lint ✅ · test ✅ (47) · build ✅ · playwright ✅ (14) | n/a | none |
| V2-02 | done | tag: v2-02-done | docs/overnight/evidence/V2-02.md | tsc ✅ · lint ✅ · test ✅ (50) · build ✅ · playwright ✅ (16) | n/a | none |

## 3. Audit findings status (proof required)
| Finding | ✅ fixed / ❌ open / ⚠ partial | Proving artefact (test name / command / screenshot) |
|---|---|---|
| M-01 lobby unreachable map picker | ✅ fixed | `e2e/lobby-scroll.spec.ts` + screenshots `docs/screens/v2/00/*` |
| C-01 villain knockback drift | ✅ fixed | `src/__tests__/entity_motion.test.ts` + `e2e/knockback-drift.spec.ts` |
| G-01..G-06 loop gaps | | |

## 4. Gates snapshot (paste last lines)
`tsc` · `lint` · `test` (N passed) · `build` · `playwright` · `pattern:check` (counts vs baseline) · `spec:verify`

## 5. Pattern audits
Links to `PATTERN_AUDIT_*.md`; ratchet counts before → after: P01 … P10.

## 6. Balance bot results (V2-40a/40)
| Archetype/map | masher | novice | average | expert | target band |
|---|---|---|---|---|---|
Notes on deviations from GDD §7 and what was tuned.

## 7. How to try it (commands + what to click)
…

## 8. Decisions taken (defaulted numbers/choices) — each logged in DECISIONS.md
…

## 9. Questions for the owner (from QUESTIONS.md, with recommended option)
…

## 10. Regressions / new problems discovered (added to GAME_AUDIT? y/n)
…

## 11. What I did NOT do (confirm)
No push · no deploy · no master changes · no new dependencies · no spec edits · no network/paid tools.

## 12. Recommended next step
Judge re-audit of waves …; then …
