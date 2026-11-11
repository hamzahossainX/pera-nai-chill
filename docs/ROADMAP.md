# ROADMAP.md — Tickets

## Now (unblocked, in priority order)
*All Phase 1 MVP tickets are complete and verified!*

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
