# LOG.md — Shipped Work History

## 2026-11-14 — V2-05: Telegraphed hazards, villain counter-moves & stats wiring (G-04, G-05, G-06)
- Extended `Obstacle.ts`: 700ms warning telegraph banner prior to arrival at chaser (`"⚠ লাফ দিন! (JUMP)"` for low hazards or `"⚠ লেন বদলান! (LANE)"` for solid barriers), `isLowHazard()`, `getPatienceCost()` (8, 12, 15), `getSlowMultiplier()` (0.8, 0.7, 0.65), `getSlowDurationSec()` (1.2, 1.5, 1.8).
- Updated `SpawnSystem.ts`: Fixed G-06 villain auto-trip bug; villain vaults by default and only trips if stunned or lured (`HIT_STUN`/`TRIPPED`). Jump counters low hazards (potholes, bricks, fake-wallets). Uncountered hazards drain patience, slow chaser, and trigger stumble.
- Updated `Villain.ts`: Added `isDodging`, `hasShield`, `dodge()`, and `executeCounterMove()`. Implemented archetype counters: Phone Snatcher (zig-zag lane change + dodge), Pickpocket (drops fake wallet trap), Cable Chor (wire coil), Manhole Chor (shield), Eid Market Chor (shopping bag toss), Chicken Chor (dodge roll), Chor Sardar (goon summon).
- Updated `CombatSystem.ts`: Wired villain dodge rate per archetype. Shield blocks attacks. Added Kick hazard counter (breaks obstacle in front and restores +4 patience).
- Updated `useGameStore.ts`: Added `isBossStage`, `setIsBossStage`. Scaled boss HP by 1.6x (`villainConfig.baseHp * 1.6` for boss stage or Chor Sardar).
- Updated `RunScene.ts`: Removed hidden boss override on 3rd run.
- Added unit tests in `src/__tests__/hazards_and_archetypes.test.ts` (12 tests passing). Total test suite: 78/78 passing.
- Updated Playwright e2e tests (`e2e/test-hook.spec.ts`, `e2e/lobby-scroll.spec.ts`) for archetype HP and viewport robustness.
- All gates green (tsc, lint, vitest 78/78, pattern:check, spec:verify, next build, playwright 22/22).

## 2026-11-13 — V2-04: Gap, Patience & fail states (G-01, G-03)
- Created `src/game/systems/GapSystem.ts` [NEW] tracking `gap = villain.rig.x - chaser.rig.x`, zones (`CLOSE < 220`, `MID 220-560`, `FAR 560-900`, `ESCAPE >= 900`), and dynamic entity positioning sliding within arena window `[120, 1160]`.
- Implemented melee range rule: melee attacks only hit when `gap <= 220` and `laneDelta <= 1`.
- Added mashing miss penalty: missed melee attacks drain 4 patience and reset combo, ensuring a mindless mashing player runs out of patience and loses.
- Added close-zone melee bonus: +25% damage, camera shake, and patience restoration on in-range hits.
- Added Zustand store API: `patience`, `drainPatience`, `restorePatience`, `slowChaser(mult, sec)`, `setGap`, and `triggerLose(reason)` supporting fail states (`"patience_zero"`, `"escaped"`).
- Extended HUD with color-coded sweat-drop Patience bar (`💧 PATIENCE (ধৈর্য) XX%`) and live gap warning banners.
- Extended `GameOverScreen.tsx` handling `"OUT OF PATIENCE!"` (`"হাল ছেড়ে দিলে?!"`) and `"TARGET ESCAPED!"` (`"পালাইছে!"`).
- Unified `AppShell.tsx` rendering to keep `GameHost` continuously mounted across `PLAYING`, `PAUSED`, and `GAME_OVER` without destroying the Phaser WebGL context.
- Registered test hook providers `getState().gap` and `getState().patience` and debug methods (`setGap`, `drainPatience`, `slowChaser`).
- Unit tests: `src/__tests__/gap_and_patience.test.ts` (10 tests passing).
- E2E tests: `e2e/fail-states.spec.ts` (4 tests passing across Desktop and Mobile viewports).
- All gates green (tsc, lint, vitest 66/66, pattern:check, spec:verify, next build, playwright 22/22).

## 2026-11-13 — V2-03: Player controls, dash, jump & ControlSource abstraction (G-02)
- Created `src/game/input/ControlSource.ts` [NEW] defining input command contract (`LANE_UP`, `LANE_DOWN`, `JUMP`, `DASH`, `ATTACK`, `ULTIMATE`, `TAUNT`) and `ControlSource` interface (V3 forward-compat constraint #1).
- Created `src/game/input/KeyboardTouchSource.ts` [NEW] handling keyboard bindings (W/S, Arrows, Space, Shift, 1-4, E, T), canvas touch swipe gestures, and UI bus commands.
- Created `src/game/input/BotSource.ts` [NEW] providing programmatic command emission, delay queuing, and step updates for bot harness (V2-40a) and headless tests.
- Created `src/components/game/TouchControls.tsx` [NEW] with responsive thumb clusters (Left: Lane Up/Down; Right: Jump/Dash) mounted in `AppShell.tsx`.
- Updated `Chaser.ts` with autonomous player movement: `setLane(lane)`, `laneUp()`, `laneDown()` (clamped to 3 lanes [0, 2]), `jump()` (520ms airtime, double-jump lockout), and `dash()` (2500ms cooldown, 25 stamina cost, +90px forward impulse).
- Decoupled `RunScene.ts` loop: removed `chaser.followLane(villain.currentLane)` (fixed G-02), attached `ControlSource`, and wired command dispatcher.
- Updated `testHook.ts` with debug command helpers (`command`, `laneUp`, `laneDown`, `jump`, `dash`) and exposed `isJumping`/`isDashing` in `getState().chaser`.
- Unit tests: `src/__tests__/player_controls.test.ts` (6 tests passing).
- E2E tests: `e2e/player-controls.spec.ts` (2 tests passing across Desktop and Mobile viewports).
- All gates green (tsc, lint, vitest 56/56, pattern:check, spec:verify, next build, playwright 18/18).

- Created `src/game/motion/EntityMotion.ts` [NEW] as single owner of entity positions `(x, y)`:
  - Channels: `homeX`, `offsetX` (sub-stepped damped harmonic oscillator spring-back), `laneY` (smooth exponential lerp), `jumpY` (normalized parabolic vertical arc for jumps/vaults), `extraY` (vertical trip/death offset), and bounding clamp to `[minX, maxX] = [60, 1220]`.
- Integrated `EntityMotion` into `CharacterRig.ts` (`motion` member instantiated in constructor, updated per frame in `update`).
- Fixed C-01 (villain knockback drift bug): replaced direct `x: targetX` tween in `triggerHitStun` with `motion.applyImpulse(knockbackX)`, which auto-recovers to home position within 400 ms.
- Fixed C-03 (vault snapback bug): replaced `this.rig.y = currentY` snapback in `Villain.vault()` with `this.rig.motion.vault(50, 400)`. Lane changes during vaults now transition smoothly without snapping back or teleporting.
- Replaced direct tween `y: targetY` in `Villain.setLane` and `Chaser.followLane` with `this.rig.motion.setLaneY(targetY)`.
- Replaced direct `this.x -= ...` in `Obstacle.ts` and `PickupItem.ts` with `this.setX(...)`.
- Reduced pattern violation `P02_direct_entity_position_write` from 5 to 0; lowered baseline in `scripts/audit/pattern-baseline.json`.
- Added unit tests in `src/__tests__/entity_motion.test.ts` (3 tests: 500 impulses bounds check, spring recovery in < 400 ms, vault/lane-change independence).
- Added e2e test in `e2e/knockback-drift.spec.ts` (simulates 60s of continuous attacks, proving villain and chaser stay strictly within `[0, 1280]` and villain springs back to ~880).
- All gates green (tsc, lint, vitest 50/50, pattern:check, spec:verify, next build, playwright 16/16).

- Created `src/config/layout.ts` [NEW] with canvas zones (HUD, SKY, SIDEWALK, PLAY_ZONE, FOOT_ZONE), lanes (`[450, 515, 580]`), and scales (`[0.88, 1.0, 1.12]`).
- Migrated all `LANES_Y` and `LANE_SCALES` consumers in `src/game/` (`Chaser.ts`, `Villain.ts`, `Obstacle.ts`, `PickupItem.ts`, `SpawnSystem.ts`). Pattern ratchet P03 dropped from 18 to 0!
- Created `src/lib/rng.ts` [NEW] wrapping/matching Phaser's seedable Alea PRNG (`next`, `chance`, `pick`, `range`, `between`, `init`). Migrated 21 `Math.random` calls in `SpawnSystem`, `Villain`, `DialogueSystem`, `CombatSystem`. Pattern ratchet P01 dropped from 63 to 43.
- Created `src/game/testHook.ts` [NEW] installed when `?test=1` with `seed`, `step(ms)`, `getState()`, `registerState(name, fn)`, and `debug.{register, call, list}` matching spec.
- Added comprehensive unit tests in `src/__tests__/layout_and_rng.test.ts` (10 tests) and e2e test in `e2e/test-hook.spec.ts` (4 tests). All 47 vitest tests and 14 Playwright tests passed.

## 2026-11-13 — V2-00: Fix unscrollable lobby / unreachable map picker (M-01, U-04)
- Fixed lobby scroll container in `src/components/shell/AppShell.tsx`: bounded height via `h-dvh max-h-dvh overflow-y-auto` with `tabIndex={0}` so the lobby container clientHeight is constrained to the viewport and properly scrolls.
- Fixed `e2e/smoke.spec.ts` tap-to-start locator and mobile orientation bypass.
- Added `e2e/lobby-scroll.spec.ts` testing 1280x720, 1920x1080, 1024x768, and 844x390 viewports with wheel, keyboard, and touch scrolling.
- Verified Map heading `getBoundingClientRect().top` reduces from ~1320px to `< viewport height`. Captured screenshots in `docs/screens/v2/00/`.
- All gates green (tsc, lint, vitest 37/37, pattern:check, spec:verify, playwright 8/8).

## 2026-11-13 — Multiplayer parked (V3), overnight run protocol, pattern ratchet (docs/tooling only)
- `docs/spec/MULTIPLAYER_V3.md` (parked Hunt Mode spec) + ROADMAP "Next scope — V3"; V2-03 gains `ControlSource`, V2-06 gains `RunRules` forward-compat ACs; FEATURE_BACKLOG/GDD/README updated.
- `docs/OVERNIGHT_RUN.md` (launch steps, paste-in prompt, queue, failure policy, morning checklist) + `docs/overnight/{PROGRESS,QUESTIONS,MORNING_REPORT_TEMPLATE,evidence/}`.
- `docs/spec/ARCHITECTURE_PATTERNS.md` + `scripts/audit/pattern-check.mjs` (+ baseline: P01 63, P02 5, P03 18, P06 1, P08 48, P09 2; others 0; negative-tested) + `npm run pattern:check`.
- `verify-spec-refs.mjs`: covers more docs, ignores branch names/`NN` placeholders.
- No game code changed.

## 2026-11-13 — GDD, production plan, dialect system, audio sourcing, balance model, spec v1.1 (docs/tooling only)
- New: `docs/GDD.md`, `docs/PRODUCTION_PLAN.md`, `docs/spec/LOCALIZATION_AND_DIALECTS.md` (+ `dialect/translation_sheet.csv`, 124 rows × 8 dialect columns), `docs/spec/AUDIO_SOURCING.md` (+ `docs/audio/ASSET_LEDGER.csv`), `scripts/balance/{sim,tune,assist}.mjs` (+ `tuned.json`).
- Voice CSV v2: 124 lines, 22 speakers, columns `dialect, base_id, priority, group, review`; unsafe/unclear lines rewritten (mob chaos lines, lane tips, brand/anthem mentions); copy rows added for bump/innocent/heckle/dialect-gap/boatman.
- **Spec v1.1** after adversarial review: CROWD (states, single visibility rule, pile-on timeline with HP floor and shared `playArrestFinale`, safety wording), VOICE (mode table, trigger-based selection, ref-counted ducking, loops API, full babble table), TICKET_PACKETS rewritten (owned test-hook, acyclic order, V2-37a before pile-on, V2-33b, V2-38…41), MAP_SCENARIOS, ANTI_HALLUCINATION (rng owner, dead events), REVIEW_LOOP (no-celebrate rule), API_FACTS generator (flags declared-but-never-emitted events; bgm vs play keys; scenes), audit T-07.
- Balance model result (candidate): masher 0 %, average 82/77/65/21 %, expert 98–100/81 % (beginner/medium/boss); novice needs assist (2 → 40 % across L0→L3). Caveats in GDD §9.
- No game code changed.

## 2026-11-13 — Spec pack for crowd, voices & living-street maps (docs/tooling only)
- `docs/spec/`: README (read order), ANTI_HALLUCINATION (12 rules + preflight + evidence block), CROWD_AND_NPC_SPEC, VOICE_AND_SFX_SPEC (+ `voice/voice_lines.csv`, 116 draft Bangla lines), MAP_SCENARIOS (8 maps as living streets), REVIEW_LOOP (rubric, ≤3 rounds, golden frames), TICKET_PACKETS (V2-31…V2-37), FEATURE_BACKLOG (F-M1…F-20), generated API_FACTS.
- Tooling: `scripts/audit/gen-api-facts.mjs`, `scripts/audit/verify-spec-refs.mjs` (negative-tested), npm scripts `spec:facts`, `spec:verify`.
- ROADMAP W3b added; GAME_PLAN_V2 §5.1/§12/§14 extended (D8–D11); HANDOFF_PROMPT + CLAUDE/AGENTS/GEMINI entry files point to the pack. Key discovery: Phaser 4 ships 28 first-party skill guides in `node_modules/phaser/skills` (referenced as mandatory reading).
- No game code changed.

## 2026-11-13 — V2 audit & game plan (docs only, no game code changed)
- **Gamer-eye audit** of baseline `3899745`: `docs/GAME_AUDIT.md` — 40+ findings with IDs and evidence tags. Headline verified facts: lobby cannot scroll so the Map picker (y≈1320) is unreachable at 1280×720 / 1920×1080 / 844×390 (M-01); the 3 maps are palette swaps (M-02); villain knockback is never undone so he drifts off-world (C-01, code-verified); no player movement, no gap, no fail state (G-01..G-03); HUD covers lanes on phones (U-01).
- **Plan:** `docs/GAME_PLAN_V2.md` (core loop, layout zones, character spec, `MapDefinition` framework, 8 Bangladesh maps, UI rebuild, cleanup list), `docs/DESIGN.md` filled (was an empty template), `docs/ROADMAP.md §V2` tickets V2-00..V2-30.
- **Handoff:** `docs/HANDOFF_PROMPT.md` (paste into a new session). New local skills: `map-authoring`, `playtest-audit`. Repro scripts in `scripts/audit/`. Evidence in `docs/audit/screens/`. `.claude/launch.json` added for the dev server.
- **Gates (unchanged code):** tsc clean · lint clean · vitest 37/37.
- **Caveat:** headless Chromium here runs WebGL at ~1.5 fps (software GL) → runtime Phaser behaviour (combat chains, events, boss) was code-verified, not played.

## 2026-11-10 — Phase 1.5 Game Design Polish & Feature Expansion
- **Pre-Game Wanted Reason / Crime Tags (`src/config/crimes.ts`)**:
  - Curated 6 clean, hilarious, highly relatable Dhaka reasons (bKash money borrow & block, sleeping through group project, stealing big mutton roast at wedding, pretending no change at tea stall, trolling boss in company group chat, running away from rickshaw mama).
  - Added live Wanted Poster badge in Lobby preview and Wanted status banner on in-game HUD.
- **Dynamic Reactive Cartoon Face Props (`CharacterRig.ts`, `BootScene.ts`)**:
  - Overlaid procedural comic props on the uploaded target face:
    - Orbiting spinning dizzy stars on trip and defeat.
    - Comic cross band-aid / plaster and popped cartoon eyes on critical hits.
    - Anime crying water streams on low health.
- **Selectable Dhaka Scenarios & Map Variety (`src/config/maps.ts`, `MapSelector.tsx`)**:
  - 3 selectable Dhaka zones with custom procedural skies, landmark neon signboards, and route badges:
    1. Mirpur 10 Digging & Metro Rail Zone (`mirpur`)
    2. Farmgate Rush Hour (`farmgate`)
    3. New Market Shopping Chaos (`newmarket`)
  - Scenario-weighted hazards (construction potholes & digging trenches, moving rickshaws, packed crowd blockades).
- **Monsoon Waterlogging Event & Pickups (`events.json`, `WaterloggingEffect`, `PickupItem.ts`)**:
  - Added `evt_waterlogging`: flooded road layer, drifting origami paper boats, splashing foot particles, and 60 ৳ hooded rickshaw bypass bribe.
  - Interactive lane pickups: Daab (তাজা ডাবের পানি — cures pollution cough), N95 Mask (smog immunity), Biriyani (rage & stamina), Tong Cha, and Taka bags.
- **Slapstick Polish & Finisher**:
  - Comic Bengali sound words ("ঠাস!", "ধুম!", "ধপাস!", "চড়াত!", "দড়াম!", "বোম!").
  - Dramatic slow-mo finisher (0.25x timeScale, camera zoom & shake, 360 comic spin).
- **Verification**: 33 Vitest tests passing, 0 TypeScript errors, 0 ESLint warnings, static build green.

## 2026-11-10 — Phase 1 MVP Launch: Pera Nai Chill (Dhaka Rage Runner)
- **Framework & Genesis Integration**: Successfully initialized A-Team v7 portable framework and integrated `GENESIS.md` with Antigravity skills.
- **T00–T14 Implementation Complete**:
  - Built full client-side 2D action runner web application with Next.js 16 (App Router), TypeScript, Tailwind CSS, Phaser 4, Zustand, Framer Motion, and GSAP.
  - Zero server dependencies for Phase 1. 100% on-device face privacy using MediaPipe FaceDetector + CPU fallback + offscreen cartoonifier.
  - 5-layer 60 FPS parallax scrolling system across 3 traffic lanes.
  - Jointed character puppet rigs with mathematical run cycles and dynamic face skinning.
  - Combat system with slap, punch, kick, parabolic flying chappal projectiles, and ultimate 10-chappal slow-mo storm.
  - Full Dhaka urban event simulator: Loadshedding (blackout with glowing comic eyes), AQI 450+ Smog, and Strike blockade with barricades, burning tires, and Taka bribe clearance.
  - Complete zero-dependency procedural WebAudio sound synthesizer for all game SFX and fanfare.
  - God-mode debug panel (`?debug=1`), scripted demo showcase (`?demo=1`), orientation guard for mobile, and PWA offline service worker caching.
  - All 27 Vitest unit tests passing, clean TypeScript check, zero ESLint warnings, production build verified.
