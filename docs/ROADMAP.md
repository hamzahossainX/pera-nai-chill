# ROADMAP.md — Tickets

## Now (unblocked, in priority order)
*All Phase 1 MVP tickets are complete and verified!*

## Later (Phase 2 — Optional Backend)
- [ ] T-101 — Supabase World Events Realtime Channel [app:web][tags:backend,supabase]
- [ ] T-102 — High-Score Anti-Cheat Edge Function [app:web][tags:backend,security]

## Done
- [x] T18 — Monsoon Waterlogging Event, Pickups & Counter-Buffs: `evt_waterlogging`, `WaterloggingEffect`, paper boats, Daab / Mask pickups (`commit pending`)
- [x] T17 — Selectable Dhaka Scenarios & Maps: Mirpur 10, Farmgate, New Market, custom procedural skies, signboards, potholes (`commit pending`)
- [x] T16 — Reactive Comic Face Props: spinning dizzy stars, plaster band-aid, anime tears, popped shocked eyes (`commit pending`)
- [x] T15 — Wanted Reason / Crime Tags & HUD Banner: 6 hilarious Dhaka reasons, bounty badges, Lobby selector (`commit pending`)
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
