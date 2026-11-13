# ROADMAP.md — Tickets

## Now (unblocked, in priority order)
*Phase 1 + 2 shipped. **V2 overhaul** below is the active work — read `docs/GAME_AUDIT.md` (why) and `docs/GAME_PLAN_V2.md` (what). Start with `docs/HANDOFF_PROMPT.md`.*

### V2 — Proper game plan (created 2026-11-13). Waves run in order; see GAME_PLAN_V2 §13 for parallelism rules.

**W0 — Stabilise (sequential; touches shared files)**
- [ ] V2-00 — Fix unscrollable lobby / unreachable map picker [app:web][tags:ui,bug,S0][audit:M-01,U-04] — AC: at 1280×720, 1920×1080, 844×390 every lobby section incl. Map selector is reachable by wheel, touch and keyboard; screenshot proof; Playwright asserts Map heading `getBoundingClientRect().top` becomes < viewport height after scrolling.
- [ ] V2-01 — `src/config/layout.ts` + deterministic test hook [app:web][tags:arch,test][audit:T-01,M-04] — AC: all lane Y/HUD zones read from layout.ts (grep finds no `LANES_Y` literals elsewhere); `?test=1` gives fixed-step loop and read-only `window.__game.getState()` (positions, hp, gap); works under software GL.
- [ ] V2-02 — `EntityMotion` (home/offset spring/lane/jump channels + clamp) and knockback fix [app:web][tags:game,bug,S0][audit:C-01,C-03] — AC: Vitest: 500 random impulses → |offset| < 1 px within 400 ms and x∈[60,1220]; Playwright (test hook): 60 s auto-attack keeps villain & chaser x∈[0,1280]; no direct `rig.x/y =` writes outside EntityMotion (lint rule or grep gate).

**W1 — Core loop (sequential)**
- [ ] V2-03 — Player controls: lanes, dash, jump [tags:game][audit:G-02] — AC: keyboard + swipe + on-screen; chaser no longer mirrors villain lane; unit tests for lane/jump state machine.
- [ ] V2-04 — Gap, Patience & fail states [tags:game][audit:G-01,G-03] — AC: GapSystem zones; melee only in range; escape and patience-zero both reach a Lose result; tuned so a mashing-only player loses.
- [ ] V2-05 — Telegraphed hazards, villain counter-moves, wire archetype stats (HP/speed/dodge), remove hidden boss override [tags:game][audit:G-04,G-05,G-06] — AC: each hazard has telegraph+counter+cost; each archetype has its counter-move; boss is an explicit final stage.
- [ ] V2-06 — Run structure, distance bar, stars, persistence v1, Result screen skeleton [tags:game,ui][audit:G-07,G-08] — AC: 1–3 stars rules in plan §2.6; localStorage migration test; daily reward outlier fixed.

**W2 — Characters (rig fix first; archetype redraws file-disjoint → parallel, cap 5)**
- [ ] V2-07 — Instrument + fix rig pose math; pose-sheet gate at `/dev/characters?frames=1` [tags:art,game][audit:C-02] — AC: silhouette test passes (bbox ≤160×220, head within ±14 px of neck joint) for every pose; dev route gated out of production.
- [ ] V2-08 — Chaser redraw to art direction (DESIGN §1, PLAN §4.1) [tags:art,design][audit:C-02,C-04]
- [ ] V2-09…V2-15 — Redraw + counter-move gag + mask/hood slots, one ticket per archetype: 09 Phone Snatcher · 10 Pickpocket · 11 Cable Chor · 12 Manhole Chor · 13 Eid-Market Chor · 14 Chicken Chor · 15 Chor-er Sardar (boss) [tags:art,design][audit:C-02,C-05] — AC each: pose sheet + in-game screenshots at 3 viewports; `/design-review` ≥ 8/10.

**W3 — Map framework**
- [ ] V2-16 — `MapDefinition` + `src/maps/registry.ts` + generic layer-driven `ParallaxSystem`; delete all `mapId` branches; map owns time-of-day [tags:arch,game][audit:M-02,M-03] — AC: adding a dummy map = 1 folder + 1 registry line, nothing else; architect-reviewer APPROVE first (shared contract).
- [ ] V2-17 — Rework maps 1–3 (Mirpur 10, Farmgate, New Market) onto the framework with real layers/landmarks/set-pieces/hazards [tags:art,design][audit:M-02,M-04] — AC: Map Done-definition (PLAN §5.3) for each.

**W4 — New maps (one ticket per map folder → parallel, cap 5)**
- [ ] V2-18 Old Dhaka Chawkbazar Iftar Rush · [ ] V2-19 Sadarghat Launch Terminal · [ ] V2-20 Cox's Bazar Beach · [ ] V2-21 Sreemangal Tea Garden · [ ] V2-22 Haor Village Haat (Monsoon) [tags:art,design,content] — AC each: Map Done-definition (PLAN §5.3) incl. Bangla copy flagged for owner proof-read.

**W5 — UI/UX rebuild (sequential; after mechanics settle)**
- [ ] V2-23 — Home + Setup stepper (Face/Villain · Map carousel · Loadout) [tags:ui,design][audit:U-05,M-01]
- [ ] V2-24 — In-run HUD + thumb-zone controls; remove dock/ticker overlap; ≤ 22 % UI area at 844×390 [tags:ui,design][audit:U-01,U-02]
- [ ] V2-25 — Result (stars/next map), Shop (cosmetics only), Settings, Achievements restyle [tags:ui][audit:U-07]

**W6 — QA & release gate**
- [ ] V2-26 Playwright suite on GPU Chrome (movement bounds, map reachability, per-map smoke, HUD overlap assertions) · [ ] V2-27 perf pass vs PLAN §10 budget · [ ] V2-28 repo cleanup (docs/archive, stray files, unused SVGs) · [ ] V2-29 a11y + Bangla typography review · [ ] V2-30 final 10-minute gamer playtest (PLAN §11) → `/ship`

## Later (Phase 2 — Optional Backend)
- [ ] T-101 — Supabase World Events Realtime Channel [app:web][tags:backend,supabase]
- [ ] T-102 — High-Score Anti-Cheat Edge Function [app:web][tags:backend,security]

## Done
- [x] P2-14 — Performance Pass & Polish: Timestep clamping, particle pooling, auto-quality fallback, audit docs (`commit 764ada5`)
- [x] P2-13 — Audio Engine Upgrade: Dynamic slapstick BGM sequencer, situational lowpass/bandpass filters, vehicle Doppler stereo panning (`commit 8e13f75`)
- [x] P2-12 — Local Shop, Achievements, Daily Challenge & Wanted Poster: 100% offline Canvas export, localStorage persistence (`commit 85a0daf`)
- [x] P2-11 — Street Interactions, New Weapons, Boss Chase & Caught Sequence: Banana peel trap, soda can kick, Chor-er Sardar boss, Havildar Mama (`commit afc49d2`)
- [x] P2-10 — Dialogue Speech Bubbles, Taunt System, Ticker & Combo Names: Poetic bilingual lines, Dhaka TV ticker, taunt morale drain (`commit bb19bb4`)
- [x] P2-09 — Event x Time-of-Day Cross-Interactions: Night loadshedding darkness & flashlight beam, smog halos, burning tyre light pools (`commit bf7fe29`)
- [x] P2-08 — Weather System & Urban Flood Event: Rain drops, puddles, lightning, fog, floating chappals, -25% flood wading speed penalty (`commit e836ea0`)
- [x] P2-07 — Time-of-Day Progression & Ambient Lighting: Dawn, Noon, Sunset, Night phases, stars, crescent moon, street lamps (`commit 43fc0f4`)
- [x] P2-06 — Street Kit-Bash Parallax & Vehicles: MRT-6 metro track & train, perched crows, tea stalls, rickshaws, CNGs, buses, bikes (`commit 7ca85fa`)
- [x] P2-05 — Lobby Archetype Carousel & Dress-up Preview: Live running preview wearing uploaded face, stats, time & weather pickers (`commit 71d320d`)
- [x] P2-04 — Aam-Janata Hero Chaser Rig & Chappal Variety Framework: Bata, leather, gold chappals, attack impact frames, dash dust (`commit 7f31e43`)
- [x] P2-03 — Dynamic Mask-Slip & Reactive Expressions: Slips at 66% HP, falls at 33% HP, dizzy stars, crying tears, archetype defeats (`commit d219aae`)
- [x] P2-02 — 7 Distinct Dhaka Archetypes & Secondary Motion: Snatcher, Pickpocket, Cable, Manhole, Eid Market, Chicken Chor, Sardar (`commit 676e140`)
- [x] P2-01 — Layered SVG Slot Rig Architecture: 15-slot standardized rig, Phone Snatcher vector SVG kit, procedural fallbacks (`commit 6176e6e`)
- [x] P2-00 — Performance Baseline Audit: Codebase inspection, baseline report in `docs/perf-baseline.md` (`commit 765d9fb`)
- [x] T18 — Monsoon Waterlogging Event, Pickups & Counter-Buffs: `evt_waterlogging`, `WaterloggingEffect`, paper boats, Daab / Mask pickups (`commit a97c634`)
- [x] T17 — Selectable Dhaka Scenarios & Maps: Mirpur 10, Farmgate, New Market, custom procedural skies, signboards, potholes (`commit a97c634`)
- [x] T16 — Reactive Comic Face Props: spinning dizzy stars, plaster band-aid, anime tears, popped shocked eyes (`commit a97c634`)
- [x] T15 — Wanted Reason / Crime Tags & HUD Banner: 6 hilarious Dhaka reasons, bounty badges, Lobby selector (`commit a97c634`)
- [x] T00 — Scaffolding: Next.js App Router, Phaser 4, Tailwind CSS, project layout (`commit a42773e`)
- [x] T01 — State, Event Bus & Config: `useGameStore`, typed mitt `gameBus`, weapons, villains, Zod validated `eventService` (`commit 877c069`)
- [x] T02 — Boot & Loading Screen: weighted progress, road track, tip rotation, WebAudio unlock (`commit d578c60`)
- [x] T03 — Face Pipeline & Lobby: MediaPipe detector with CPU fallback, circular cartoonify, caricature generator, `FaceUploader`, `VillainPreview`, `WeaponSelector`, `SettingsSheet` (`commit c47b710`)
- [x] T04 — Phaser Host & 5-Layer Parallax: `GameHost`, `createGame`, procedural textures in `BootScene`, 0-allocation TileSprite parallax scrolling (`commit 7fec178`)
- [x] T05 — Character Rig & Procedural Run Cycle: 2D jointed mathematical run cycle, `Villain` with 3-lane AI dodging, `Chaser` silhouette (`commit dc2b14f`)
- [x] T06 — Combat System, Projectiles & Weapon Dock: Melee attacks, parabolic flying chappal, hit reactions, comic floating text bursts, `WeaponDock` (`commit 6db5c45`)
- [x] T07 — HUD Overlay & Game Flow: Dual HP bar with damage lag trail, flame rage meter, combo popups, pause modal, `GameOverScreen` (`commit c54d831`)
- [x] T08 — World Event Engine & Bribe Mechanics: `EventSystem` scheduler, effect registry, speed modifiers, `EventBanner` ticker, `BribeButton` with Taka deduction (`commit fbf415a`)
- [x] T09 — Loadshedding & Pollution Visuals: `BlackoutEffect` with glowing eyes mask, `SmogEffect` AQI 450+ particles and cough status (`commit f82391a`)
- [x] T10 — Strike Event & Obstacle Spawner: `Obstacle` pool, barricades, burning tires, thrown bricks, villain tripping, combo bonus (`commit 70dcebd`)
- [x] T11 — Audio System & WebAudio Synth: `audioService` oscillator/noise sound generators for all SFX, pitch randomisation, voice capping, BGM ducking (`commit c281bfc`)
- [x] T12 — Difficulty Ramp, Power-up Pickups & Villain Variants: `DifficultySystem` (320 -> 480 px/s over 120s), procedural pickups (biriyani, cha, taka, helmet), 3 villain variants, ultimate slow-mo storm (`commit ecb521e`)
- [x] T13 — Debug God-Mode Bar & Demo Showcase: Collapsible dev panel (`?debug=1` / 5 logo taps), timeScale slider, cheat buttons, scripted showcase (`?demo=1`) (`commit 3ed47b9`)
- [x] T14 — Polish Checklist, PWA Manifest, Service Worker & Documentation: `manifest.json`, `sw.js`, SVG icons, `OrientationGuard`, `WeaponDock` tutorial prompt, `CREDITS.md`, `README.md`, Playwright smoke test (`commit 0e1dae5`)
