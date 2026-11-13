# GAME_AUDIT.md — Gamer-eye Audit of Pera Nai Chill (Dhaka Rage Runner)

**Date:** 2026-11-13 · **Baseline commit:** `3899745` (master) · **Auditor:** system-architect session (read-only; no game code changed)
**Companion docs:** `docs/GAME_PLAN_V2.md` (the fix plan) · `docs/HANDOFF_PROMPT.md` (paste into the next AI session)
**Evidence:** `docs/audit/screens/*.png` (captured today with Playwright against `next dev`)

## 0. How to read this

Every finding carries an evidence tag so the next session knows how far to trust it:

| Tag | Meaning |
|---|---|
| **[V]** | Verified at runtime today (script + numbers or screenshot) |
| **[C]** | Verified by reading the code; behaviour follows directly from the code |
| **[O]** | Observed in screenshots; root cause is a hypothesis — the fixer must confirm |
| **[?]** | Not verified — listed so it gets checked, not assumed |

Severity: **S0** = game is broken or the feature is effectively absent · **S1** = major quality gap · **S2** = polish.

**Limits of this audit (be honest):** the headless browser here renders WebGL in software at ~1.5 fps (`requestAnimationFrame` measured), so *timing-dependent runtime behaviour in Phaser* (combat hit chains, events, boss run, audio) could not be exercised reliably. Those items are code-verified `[C]` or marked `[?]`. The next session must use a GPU-backed browser (see HANDOFF §Tooling) before it claims any gameplay fix works.

**Health of gates today** (run 2026-11-13): `npx tsc --noEmit` clean · `npm run lint` clean · `npm run test` 37/37 pass. Green gates do **not** mean the game is good — all 37 tests cover store/config only; no scene, rig, layout or map is tested.

---

## 1. Executive summary (the five root causes)

1. **There is no real game loop.** The player cannot move, the chaser auto-follows the villain's lane, the gap between them never changes, nothing can hurt the player, and the only way a run ends is the villain's HP hitting zero. It is a button-masher with a health bar, not a chase game. (G-01..G-06)
2. **There are no maps — only three palette swaps, and the map picker is unreachable.** The lobby cannot scroll, so the Map selector (y≈1320 px) is off-screen on every viewport tested. Even if reached, all three "maps" share the same skyline, metro track, road and props; only sign text and tint differ. (M-01, M-02)
3. **Characters are structurally unstable.** A knockback bug lets the villain drift off the right edge of the world ("character leaves the map"), and in-game poses look hunched/tangled compared with the lobby preview. (C-01..C-03)
4. **The layout was never designed against the 720 px canvas.** HUD, weapon dock, ticker and lanes fight for the same pixels; on a landscape phone the UI covers most of the playfield. (U-01, U-02)
5. **No design law exists.** `docs/DESIGN.md` is still the empty template, so every screen is ad-hoc. (U-03)

---

## 2. Gameplay & game-design findings

| ID | Sev | Tag | Finding | Evidence |
|---|---|---|---|---|
| G-01 | S0 | C | **No fail state.** Chaser has no HP/patience; the villain cannot escape; only `villainHp → 0` ends a run (`useGameStore.inflictDamage` → `GAME_OVER`). Obstacles never hurt the player except potholes draining 6 stamina. There is nothing to lose. | `SpawnSystem.ts:138-160`, `useGameStore.ts:217-235` |
| G-02 | S0 | C | **Player has no movement.** `RunScene.update` calls `chaser.followLane(villain.currentLane)` every frame, so the chaser mirrors the AI. No lane input exists anywhere (`grep setLane/Arrow/swipe` → only the villain AI). Only input = weapon buttons/hotkeys. | `RunScene.ts:287`, `WeaponDock.tsx:105-124` |
| G-03 | S0 | C | **The chase is static.** Chaser is created at `x=320`, villain at `x=880` and neither ever approaches. Melee weapons (slap/punch/kick) "hit" via a `delayedCall` 560 px away from the target — the animation plays at the chaser, the damage lands on the villain with no contact. | `Chaser.ts:21`, `Villain.ts:33`, `CombatSystem.ts:200-224` |
| G-04 | S1 | C | **Archetype stats are decoration.** Lobby shows `HP`, `SPD`, `DODGE` bars per villain, but `baseHp`, `speedMultiplier`, `dodgeRate` are referenced only by the lobby/dev UI. Every villain gets `INITIAL_VILLAIN_HP = 1000`; no dodge roll exists; speed is ignored. | grep: only `VillainPreview.tsx`, `dev/characters/page.tsx` read them |
| G-05 | S1 | C | **Boss run is a hidden override.** Every 3rd run (localStorage counter) force-replaces the chosen archetype with `chorSardar` and sets HP to **500** — half of a normal villain, while the lobby advertises the boss at 1600. A "boss" that is easier than a pickpocket. | `RunScene.ts:41-56` |
| G-06 | S1 | C | **Obstacles are rewards, not hazards.** Barricade/brick/crowd trip the *villain* (helping the player). Chaser only reacts to potholes. No jump/slide/dodge verb exists, so there is nothing to master. | `SpawnSystem.ts:107-135` |
| G-07 | S1 | C | **Run has no objective or progression.** No distance, no stars, no per-map goal, no escalating villain behaviour beyond a speed ramp (`DifficultySystem`, 320→480 px/s). Win = bar empty; reward = fixed +500 Taka. | `RunScene.ts:178` |
| G-08 | S2 | ? | Daily Challenge showed `+৳5000` today vs `+৳450` in the 2026-11-11 baseline screenshot while shop items cost 250–1500; check reward tuning and whether the economy trivialises the shop. | `dailyChallenge.ts:30` |
| G-09 | S2 | C | Pre-run "crime" tags and chappal variety pickers add choices that do not change play (cosmetic text only). Decision overload before the first run. | lobby page text |

---

## 3. Maps & world findings

| ID | Sev | Tag | Finding | Evidence |
|---|---|---|---|---|
| M-01 | **S0** | **V** | **The lobby cannot scroll, so the Map selector (and crime picker, weapon selector) is unreachable.** Measured at 1280×720, 1920×1080 and 844×390: root container `clientHeight == scrollHeight == 2338`, `overflow-y:auto` but never constrained; `<body class="overflow-hidden h-full">` clips it; 6× mouse-wheel moved nothing; Map heading sits at `y=1320`. A real player simply never sees a map choice. This is very likely why "there are no maps". Fix = give the lobby a bounded scroll container (`h-dvh overflow-y-auto`) **or** (preferred) replace it with the stepper in GAME_PLAN_V2 §7. | `AppShell.tsx:95`, `layout.tsx:61`; script output in HANDOFF §Evidence |
| M-02 | **S0** | **V/C** | **Maps are palette swaps.** In `run-{mirpur,farmgate,newmarket}-t5-1280x720.png` the far skyline, the elevated *metro track + train* (even in Farmgate and New Market), the road texture, the lane lines and the street-prop pool are identical. Only the billboard text/colour, sky tint and obstacle weights change. `MapScenario.roadKey` is never read; `ParallaxSystem` hard-codes sky/near keys with `if/else` and the `id` union is closed to 3 values — adding a map needs edits in 5+ files. | `ParallaxSystem.ts:51-66, 85-102`, `maps.ts`, `props.ts` (shared pool), `SpawnSystem.ts:70-82` |
| M-03 | S1 | O | All three maps rendered **night-like with a crescent moon** in my captures, including "noon" Mirpur. Probably an override (daily challenge = NIGHT today, or the lobby time-of-day picker/`TimeOfDaySystem` progression) fighting `MapScenario.timeOfDay`. Needs root cause; either way no map reads as its intended time of day. | all `run-*` screenshots; `TimeOfDaySystem.ts`, `DailyChallengeCard.tsx` |
| M-04 | S1 | O | **No "place".** The scene is a single repeated billboard strip at y≈280–350 with a dead dark band y≈150–280 above it and an empty road below y≈560. No landmark, no mid-ground, no ground-surface variety, no foreground. It reads as a bus-stop row, not Mirpur 10 / Farmgate / New Market. | screenshots |
| M-05 | S1 | C | Planned expansion never shipped: `docs/issues-found.md` plans Phase D (bug hunt) and **Phase E (8 data-driven maps)**; git log shows only FIX-A/B/C landed. | `git log`, `issues-found.md §5` |
| M-06 | S2 | C | The billboard copy strip is dense small bilingual text; at 1280 px it is unreadable noise and competes with gameplay. | screenshots |

---

## 4. Character findings

| ID | Sev | Tag | Finding | Evidence |
|---|---|---|---|---|
| C-01 | **S0** | **C** | **Knockback is never undone → the villain leaves the map.** `CharacterRig.triggerHitStun` tweens `x: this.x + knockbackX` (20/35/45/60/70 px per hit) with no home-X, no clamp, no spring-back, and `triggerDead` adds `+60`. Nothing else ever writes `rig.x`. After ~20 slaps (20 px each) the villain's x exceeds the 1280 px world; banana/leather chappal (60–70 px) get there in ~7. This is the user's "character exits the map" report. *(Runtime repro blocked by 1.5 fps headless; code path is unambiguous.)* | `CharacterRig.ts:433-495, 525`, `Villain.ts:33` (only place x is set) |
| C-02 | S0 | O | **In-game characters look broken vs the lobby preview.** Chaser leans ~25° forward with limbs piled over the torso, head offset from the neck, orange hand/prop blob across the chest; villain reads as a dark hooded ring with the face texture clipped by the hood and the mask halves covering the face. The lobby preview shows a clean standing figure — in-game pose math is what regressed. Not "upgraded 2D" quality. Root cause unknown (hunch/lean values, secondary-motion impulses, pivot offsets, scale tweens) — **fixer must instrument the rig**, not guess. | `run-mirpur-t5-1280x720.png` vs `lobby-top-*`; `CharacterRig.ts` (748 lines), `villains.ts runStyle.hunch` |
| C-03 | S1 | C | **y/rotation snapshotting races lane tweens.** `Villain.vault()` captures `currentY` then restores `rig.y = currentY` on complete; if the AI lane tween ran during the 400 ms vault the rig snaps back to the *old* lane. `hideBehindVehicle` similarly uses `scaleY*0.8` yoyo against a scale that the lane tween also writes. Produces visible teleports/jitter. | `Villain.ts:78-130` |
| C-04 | S1 | C | **Art pipeline split in two quality tiers.** Characters = generated flat-vector SVG part kits (`scripts/generate-character-svgs.js` → `public/assets/characters/*`); everything else (backgrounds, props, FX, obstacles) = procedural canvas drawn at boot in a 2210-line `BootScene.ts`. Different visual languages, slow boot, near-impossible to art-direct. | `BootScene.ts`, `public/assets/characters/` |
| C-05 | S2 | C | Rig has 15 slots but only one archetype has `hood_*`/`mask_*` slots; other archetypes' accessories are single props. Mask-slip (66%/33% HP) cannot show for most archetypes. | asset listing |

---

## 5. UI / UX findings

| ID | Sev | Tag | Finding | Evidence |
|---|---|---|---|---|
| U-01 | S1 | V | **HUD + dock cover the playfield on phones.** At 844×390 (landscape phone) the player card, flame meter, Taka/stamina panel, 6-button weapon dock and taunt button occupy roughly half the screen; the lane area is a thin strip and the chaser's feet sit under the dock tooltip. Even at 1280×720 the dock (y≥620) overlaps the bottom lane region. | `run-mobile-landscape.png`, `WeaponDock.tsx` (`bottom-4`, `h-20`) |
| U-02 | S1 | O | **Bottom-left is a collision zone:** stamina bar, Taka card, the news ticker ("BREAKING NEWS", text clipped under the red tag) and the Next.js dev badge all stack there; the stamina label renders as "…INA 100%". The ticker's English subtitle is truncated mid-word. (Dev badge is dev-only; ticker/stamina collision is real.) | all `run-*` screenshots |
| U-03 | **S0** | C | **No design law.** `docs/DESIGN.md` is the untouched auto-created template (`<!-- draft: auto-created -->`, all sections `_<…>_`). CLAUDE.md makes DESIGN.md mandatory before UI work, so every screen so far was built without tokens, a banned-defaults list, breakpoints or motion rules. (Filled in this session — see `docs/DESIGN.md`.) | `docs/DESIGN.md` |
| U-04 | S1 | V | **Portrait phones:** `OrientationGuard` blocks play (acceptable), but "Play in portrait anyway" drops the user into the unscrollable lobby (M-01) — no map, no weapons, only Start. | `lobby-mobile-portrait.png` |
| U-05 | S1 | O | **Lobby is one tall column of 6 panels** (daily card, face, preview, archetype list, time/weather, crime, map, weapons, chappals) with a fixed Start footer covering content. First-time players face ~25 choices before pressing Start. | page text dump |
| U-06 | S2 | ? | Archetype/crime cards were `div+onClick` without semantics in the Phase A report (Issue §4B); not re-verified after Phase B/C. | `issues-found.md` |
| U-07 | S2 | C | No result screen depth: `GameOverScreen` (160 lines) has no stars, no next-map CTA, no per-map record. | `GameOverScreen.tsx` |

---

## 6. Technical & process findings

| ID | Sev | Tag | Finding |
|---|---|---|---|
| T-01 | S1 | V | **Cannot test gameplay headlessly.** Software-GL Chromium measured 1.5 fps; Phaser timers/tweens barely advance, so Playwright e2e can't validate combat/events. Need a GPU Chrome profile or a deterministic test hook (`?test=1` fixed-step loop + `window.__game` read-only state). |
| T-02 | S1 | C | Tests are 37 unit tests on store/config; zero scene/rig/layout/map tests; e2e = one smoke test that only checks the canvas mounts. Every bug above shipped under green gates. |
| T-03 | S1 | C | `BootScene.ts` is a 2210-line monolith generating every texture at boot (load time + merge conflicts). No asset manifest. |
| T-04 | S1 | C | Doc drift & clutter: `STACK.md` says "Phase 1 Complete"; root has 5 overlapping planning files (`peranaichill.md`, `DHAKA_RAGE_RUNNER_BLUEPRINT.md`, `PHASE2_UPGRADE_PLAN.md`, `SKILLS_BOOTSTRAP.md`, `GENESIS.md`) plus stray `Hr.jpg/Hr2.jpg/Hr3.jpg`, `The_A_Stack.zip`, unused Next starter SVGs in `public/`. |
| T-05 | S2 | C | `/dev/characters` (589 lines) ships in the production route tree; gate it behind `NODE_ENV !== "production"` or a flag. |
| T-06 | S2 | C | `STACK.md §5` says offline-first with *zero* asset downloads, but MediaPipe model/WASM loads remotely at first face use — verify and document the real network boundary. |

---

## 7. What is genuinely good (keep it)

- Clean separation: React shell ↔ Phaser via typed `mitt` bus + throttled Zustand (DEC-004). Keep.
- 100 % on-device face privacy (DEC-003). Keep — it is a real selling point.
- Bilingual comic copy voice, Dhaka satire (loadshedding, strike, waterlogging, smog) and the event engine are charming and data-driven (`events.json`, Zod-validated).
- Procedural WebAudio SFX means zero audio downloads.
- Scene lifecycle guards (`this.scene?.…`) added in the Phase A fix are the right pattern.

## 8. Evidence index (`docs/audit/screens/`)

| File | Shows |
|---|---|
| `run-mirpur-t5-1280x720.png`, `run-farmgate-t5-…`, `run-newmarket-t8-…` | M-02 identical maps; C-02 hunched characters; U-02 bottom-left collision |
| `run-mirpur-combat-1280x720.png` | combat state; dock cooldown overlays; villain mask state |
| `run-mobile-landscape.png` (844×390) | U-01 UI covering playfield |
| `run-ipad-4x3.png` (1024×768) | letterbox + dead band between skyline and road |
| `lobby-top-1280x720.png`, `lobby-after-wheel-1280x720.png` | M-01 no scroll after 6 wheel events |
| `lobby-mobile-portrait.png` | U-04 orientation guard |
| `drift-after-16/32-slaps.png` | **Inconclusive** (software GL, only 1 hit registered — HP 985/1000); kept only as a record of the repro attempt |
