# PROGRESS — overnight heartbeat (builder appends; newest at bottom)

| time (`date -Is`) | elapsed | ticket | state | last gates | next action / notes |
|---|---|---|---|---|---|
| 2026-11-13T14:24:21+06:00 | 0h | — | bootstrap | — | Start overnight run on branch `v2/build` |
| 2026-11-13T15:00:11+06:00 | 0.6h | — | baseline | tsc ✅ · lint ✅ · test ✅ (37/37) · pattern:check ✅ (P01=63, P02=5, P03=18) · spec:verify ✅ (410 refs) | Headless GL measured at rAF fps=15 (Software GL detected). Playwright chromium installed. Ready for V2-00. |

### V2-00 → started 2026-11-13T15:12:46+06:00
Plan:
1. Fix lobby container in `src/components/shell/AppShell.tsx`: change `min-h-screen` to `h-dvh max-h-dvh overflow-y-auto` with `tabIndex={0}` to constrain height to viewport and allow scrolling via wheel, touch, and keyboard.
2. Fix `e2e/smoke.spec.ts` tap-to-start locator wait.
3. Add `e2e/lobby-scroll.spec.ts` to test at 1280x720, 1920x1080, and 844x390 that scrolling (wheel, touch, keyboard) reduces `map.getBoundingClientRect().top` to < viewport height.
4. Capture screenshots for evidence under `docs/screens/v2/00/`.
5. Run all gates: tsc, lint, test, pattern:check, spec:verify, playwright test.
TOUCH:
- `src/components/shell/AppShell.tsx`
- `e2e/smoke.spec.ts`
- `e2e/lobby-scroll.spec.ts`
- `docs/screens/v2/00/*`
- `docs/overnight/evidence/V2-00.md`
DON'T TOUCH:
- `src/game/**`, `src/store/**`, `src/config/**` (other than standard doc updates)

| 2026-11-13T16:08:00+06:00 | 1.7h | V2-00 | done | tsc ✅ · lint ✅ · test ✅ (37/37) · build ✅ · playwright ✅ (8/8) · pattern:check ✅ · spec:verify ✅ | Completed V2-00. Tagged v2-00-done. Next: V2-01.

### V2-01 → started 2026-11-13T16:26:25+06:00
Plan:
1. Create `src/config/layout.ts` [NEW] with CANVAS_WIDTH/HEIGHT, HUD/SKY/SIDEWALK/PLAY_ZONE/FOOT_ZONE, LANES_Y: [450, 515, 580], LANE_SCALES: [0.88, 1.0, 1.12], and lane helper functions.
2. Update `src/config/balance.ts` to derive LANES_Y/LANE_SCALES and canvas dimensions from `layout.ts`.
3. Create `src/lib/rng.ts` [NEW] with Alea PRNG wrapping/matching Phaser RND (`next`, `chance`, `pick`, `range`, `between`, `init`).
4. Migrate all `Math.random` in `SpawnSystem`, `Villain`, `DialogueSystem`, `CombatSystem` to `rng`.
5. Migrate all `BALANCE.LANES_Y` and `BALANCE.LANE_SCALES` consumers to `getLaneY` and `getLaneScale` from `layout.ts`.
6. Create `src/game/testHook.ts` [NEW] with `window.__game = { seed, step, getState, registerState, debug }` matching `TICKET_PACKETS.md §0`.
7. Wire `testHook.ts` into `src/game/createGame.ts` when `?test=1`.
8. Write unit tests in `src/__tests__/layout_and_rng.test.ts` [NEW] and e2e test in `e2e/test-hook.spec.ts` [NEW].
9. Run all gates, update pattern ratchet baseline for P01 and P03, compile evidence, commit and tag `v2-01-done`.
TOUCH:
- `src/config/layout.ts` [NEW]
- `src/config/balance.ts`
- `src/lib/rng.ts` [NEW]
- `src/game/testHook.ts` [NEW]
- `src/game/createGame.ts`
- `src/game/entities/Chaser.ts`
- `src/game/entities/Villain.ts`
- `src/game/entities/Obstacle.ts`
- `src/game/entities/PickupItem.ts`
- `src/game/systems/SpawnSystem.ts`
- `src/game/systems/DialogueSystem.ts`
- `src/game/systems/CombatSystem.ts`
- `src/__tests__/layout_and_rng.test.ts` [NEW]
- `e2e/test-hook.spec.ts` [NEW]
- `scripts/audit/pattern-baseline.json`
- `docs/overnight/evidence/V2-01.md`
DON'T TOUCH:
- `CharacterRig.ts`, other systems, components

| 2026-11-13T16:55:17+06:00 | 2.5h | V2-01 | done | tsc ✅ · lint ✅ · test ✅ (47/47) · build ✅ · playwright ✅ (14/14) · pattern:check ✅ (P01:43, P03:0) · spec:verify ✅ | Completed V2-01. Tagged v2-01-done. Next: V2-02.
