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

### V2-02 → started 2026-11-13T17:02:22+06:00
Plan:
1. Create `src/game/motion/EntityMotion.ts` [NEW] with channels: `homeX`, `offsetX` (damped spring-back), `laneY` (smooth transition), `jumpY` (vault/jump parabolic arc), and clamp to `[minX, maxX] = [60, 1220]`.
2. Write unit tests in `src/__tests__/entity_motion.test.ts` [NEW] asserting:
   - 500 random impulses: `x` strictly remains in `[60, 1220]`.
   - After any impulse: `|offsetX| < 1 px` within 400 ms.
   - Lane change during jump does not snap back or teleport.
3. Integrate `EntityMotion` into `CharacterRig.ts` (`motion` member, updated each frame).
4. Remove direct position tweens and writes in `CharacterRig.ts` (`triggerHitStun`, `triggerDead`), `Villain.ts` (`vault` old Y restore), `Obstacle.ts` (`setX`), and `PickupItem.ts` (`setX`).
5. Write Playwright test in `e2e/knockback-drift.spec.ts` [NEW] verifying 60s auto-attack keeps villain and chaser within `[0, 1280]`.
6. Pattern ratchet: P02 drops from 5 to 0. Update baseline in `scripts/audit/pattern-baseline.json`.
7. Run all gates, generate facts & inventory, write evidence, commit, and tag `v2-02-done`.
TOUCH:
- `src/game/motion/EntityMotion.ts` [NEW]
- `src/game/entities/CharacterRig.ts`
- `src/game/entities/Villain.ts`
- `src/game/entities/Obstacle.ts`
- `src/game/entities/PickupItem.ts`
- `src/__tests__/entity_motion.test.ts` [NEW]
- `e2e/knockback-drift.spec.ts` [NEW]
- `scripts/audit/pattern-baseline.json`
- `docs/overnight/evidence/V2-02.md`
| 2026-11-13T17:02:22+06:00 | 1.5h | V2-02 | done | tsc ✅ · lint ✅ · test ✅ (50/50) · build ✅ · playwright ✅ (16/16) · pattern:check ✅ (P02:0) · spec:verify ✅ | Completed V2-02. Tagged v2-02-done. Next: Pattern Audit #1.
| 2026-11-13T18:36:00+06:00 | 0.2h | Audit #1 | done | 10-point checklist PASS · P01: 43, P02: 0, P03: 0 · committed ff2d97b | Pattern Audit #1 completed.
| 2026-11-13T18:42:00+06:00 | 1.2h | V2-03 | done | tsc ✅ · lint ✅ · test ✅ (56/56) · build ✅ · playwright ✅ (18/18) · pattern:check ✅ · spec:verify ✅ | Completed V2-03. Tagged v2-03-done. Next: V2-04.

### V2-04 → started 2026-11-13T19:58:00+06:00
Plan:
1. Implement `GapSystem` (`CLOSE`, `MID`, `FAR`, `ESCAPE`), melee range check (melee only allowed at `gap <= MELEE_RANGE` and same/adjacent lane).
2. Wire Chaser "Patience" (sweat-drop bar / 0-100) into store: `patience`, `drainPatience(amount)`, `restorePatience(amount)`, `slowChaser(mult, sec)`.
3. Wire Fail States:
   - Escape (gap reaches `ESCAPE_DISTANCE` / 750px) -> Lose result.
   - Patience exhaustion (patience reaches 0) -> Lose result ("হাল ছেড়ে দিলাম").
4. Register `getState().gap` and `getState().patience` providers in `testHook.ts`.
5. Unit tests + Playwright e2e proving mashing-only player loses.
6. Run all gates, write evidence `V2-04.md`, commit and tag `v2-04-done`.
TOUCH:
- `src/game/systems/GapSystem.ts` [NEW]
- `src/game/scenes/RunScene.ts`
- `src/game/systems/CombatSystem.ts`
- `src/store/useGameStore.ts`
- `src/game/testHook.ts`
- `src/__tests__/gap_and_patience.test.ts` [NEW]
- `e2e/fail-states.spec.ts` [NEW]
- `docs/overnight/evidence/V2-04.md`

| 2026-11-14T00:20:00+06:00 | 1.3h | V2-04 | done | tsc ✅ · lint ✅ · test ✅ (66/66) · build ✅ · playwright ✅ (22/22) · pattern:check ✅ · spec:verify ✅ | Completed V2-04. Tagged v2-04-done. Next: V2-05.

### V2-05 → started 2026-11-14T00:21:00+06:00
Plan:
1. Wire archetype stats (`baseHp`, `speedMultiplier`, `dodgeRate`) from `src/config/villains.ts` into `Villain.ts` and `CombatSystem.ts` (dodge rate triggers animated side-step roll + "ডজ!" comic text, negating one attack with 150ms wiggle telegraph).
2. Wire telegraphed hazards in `SpawnSystem.ts` / `Obstacle.ts`: 700ms warning arrow/shadow indicator, explicit counter (jump for potholes/puddles/barricades, lane-change, or kick for breakables), and cost (patience -8..-15 + slowChaser).
3. Implement villain counter-moves per archetype (G-04/C-05 table in PLAN §4.3):
   - Phone Snatcher: zig-zags every 2s (high dodge)
   - Pickpocket: drops fake wallet bait (patience -8 if collided)
   - Cable Chor: swings wire coil hazard in his lane
   - Manhole Chor: raises manhole cover shield (blocks one chappal)
   - Eid-Market Chor: tosses shopping bags (slows chaser)
   - Chicken Chor: chicken flies out, obscuring view for 1s
   - Chor-er Sardar: boss stage encounter with 2 goon spawns and phase 2 speed doubling.
4. Remove hidden boss override on 3rd run from `RunScene.ts` (`runCount % 3 === 0`); boss becomes explicit selectable stage encounter.
5. Unit tests + Playwright e2e verification.
6. Run all gates, write evidence `V2-05.md`, commit and tag `v2-05-done`.


