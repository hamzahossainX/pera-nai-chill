# Lobby simplification review — 2026-11-14

Base: feat/frontend-ui-ux @ 29086b7. Scope: incremental frontend subset of V2-23.

## Direction

Dhaka comic title and character preview remain the focal point. Bangla-first copy, outlined navy panels, amber selection, one enamel Start action. Layout: header → short instruction → [villain | routes + daily] → optional extras → fixed selection/Start bar. On portrait phones these stack in that order.

## Round 1

Fresh captures: `docs/screens/lobby-polish-2026-11-14/round-1/`. Skeptical review: preview badges collide on portrait; extra loadout columns compress labels; header/intro push main choices too low. Main controls pass 48px geometry; keyboard and launch behavior pass five sizes.

## Round 2

Fresh captures: `docs/screens/lobby-polish-2026-11-14/round-2/`. Moved archetype badge below puppet, made optional panels full width, reduced panel/card spacing. Remaining findings: navigation icons shrink on narrow phones; shorter puppet frame clips headroom.

## Final pass

Fresh captures and check results: `docs/screens/lobby-polish-2026-11-14/final/`. Fixed icon shrink and restored puppet headroom; reduced intro spacing. Browser assertions rerun against final source. Optional panels remain visually older than the new core lobby; broader restyling is still a separate work item.

This is a scoped UI review, not a scored map/character/performance approval. No seeded gameplay peak captures, golden snapshot thresholds, measured FPS, or independent judge pass were claimed. Physical-device touch and native Bangla proofreading remain pending. No new map/art content or game rules.
