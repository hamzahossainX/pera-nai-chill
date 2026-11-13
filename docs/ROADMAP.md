# ROADMAP.md — Tickets

## Now (unblocked, in priority order)
*Phase 1 + 2 shipped. **V2 overhaul** below is the active work — read `docs/GAME_AUDIT.md` (why) and `docs/GAME_PLAN_V2.md` (what). Start with `docs/HANDOFF_PROMPT.md`.*

### V2 — Proper game plan (created 2026-11-13). Waves run in order; see GAME_PLAN_V2 §13 for parallelism rules.

**W0 — Stabilise (sequential; touches shared files)**
- [x] V2-00 — Fix unscrollable lobby / unreachable map picker [app:web][tags:ui,bug,S0][audit:M-01,U-04] (tag: v2-00-done) — AC: at 1280×720, 1920×1080, 844×390 every lobby section incl. Map selector is reachable by wheel, touch and keyboard; screenshot proof; Playwright asserts Map heading `getBoundingClientRect().top` becomes < viewport height after scrolling.
- [x] V2-01 — `src/config/layout.ts` [NEW] + deterministic test hook + seeded RNG [app:web][tags:arch,test][audit:T-01,M-04] (tag: v2-01-done) — AC: all lane Y/HUD zones read from layout.ts (grep finds no `LANES_Y` literals elsewhere); `src/game/testHook.ts` [NEW] installed only under `?test=1`: `window.__game = { seed, step(ms), getState(), registerState(name,fn), debug:{register,call,list} }` with the exact `getState()` shape in `docs/spec/TICKET_PACKETS.md §0` (unimplemented fields = `null`); `src/lib/rng.ts` [NEW] wraps Phaser's seedable RND, `?seed=N` supported, and `Math.random` is migrated in SpawnSystem/Villain/DialogueSystem/CombatSystem; works under software GL.
- [x] V2-02 — `EntityMotion` (home/offset spring/lane/jump channels + clamp) and knockback fix [app:web][tags:game,bug,S0][audit:C-01,C-03] (tag: v2-02-done) — AC: Vitest: 500 random impulses → |offset| < 1 px within 400 ms and x∈[60,1220]; Playwright (test hook): 60 s auto-attack keeps villain & chaser x∈[0,1280]; no direct `rig.x/y =` writes outside EntityMotion (lint rule or grep gate).

**W1 — Core loop (sequential)**
- [x] V2-03 — Player controls: lanes, dash, jump [tags:game][audit:G-02] (tag: v2-03-done) — AC: keyboard + swipe + on-screen; chaser no longer mirrors villain lane; unit tests for lane/jump state machine; **input flows through a `ControlSource` abstraction emitting typed input commands (`KeyboardTouchSource`, `BotSource`); gameplay never reads keyboard/touch directly** (V3 forward-compat, `docs/spec/MULTIPLAYER_V3.md §8`).
- [x] V2-04 — Gap, Patience & fail states [tags:game][audit:G-01,G-03] (tag: v2-04-done) — AC: GapSystem zones; melee only in range; escape and patience-zero both reach a Lose result; **store API `patience`, `drainPatience`, `restorePatience`, `slowChaser(mult,sec)` + `getState().gap/patience` providers**; tuned so a mashing-only player loses (confirmed by V2-40a bot).
- [ ] V2-05 — Telegraphed hazards, villain counter-moves, wire archetype stats (HP/speed/dodge), remove hidden boss override [tags:game][audit:G-04,G-05,G-06] — AC: each hazard has telegraph+counter+cost; each archetype has its counter-move; boss is an explicit final stage.
- [ ] V2-06 — Run structure, distance bar, stars, persistence v1, Result screen skeleton [tags:game,ui][audit:G-07,G-08] — AC: 1–3 stars rules in plan §2.6; localStorage migration test; daily reward outlier fixed; **run rules are data: `RunRules { mode: "stage"|"timeAttack"|"hunt"; timeLimitSec: number|null; lives; winCondition }` with stage mode = `timeLimitSec: null`** (V3 forward-compat; no timer UI yet).

**W2 — Characters (rig fix first; archetype redraws file-disjoint → parallel, cap 5)**
- [ ] V2-07 — Instrument + fix rig pose math; pose-sheet gate at `/dev/characters?frames=1` [tags:art,game][audit:C-02] — AC: silhouette test passes (bbox ≤160×220, head within ±14 px of neck joint) for every pose; dev route gated out of production.
- [ ] V2-08 — Chaser redraw to art direction (DESIGN §1, PLAN §4.1) [tags:art,design][audit:C-02,C-04]
- [ ] V2-09…V2-15 — Redraw + counter-move gag + mask/hood slots, one ticket per archetype: 09 Phone Snatcher · 10 Pickpocket · 11 Cable Chor · 12 Manhole Chor · 13 Eid-Market Chor · 14 Chicken Chor · 15 Chor-er Sardar (boss) [tags:art,design][audit:C-02,C-05] — AC each: pose sheet + in-game screenshots at 3 viewports; `/design-review` ≥ 8/10.

**W3 — Map framework**
- [ ] V2-16 — `MapDefinition` **including `crowd`, `voice`, `dialect` blocks (MAP_SCENARIOS §1, LOCALIZATION §4) with Zod validation** + `src/maps/registry.ts` [NEW] + generic layer-driven `ParallaxSystem`; delete all `mapId` branches; map owns time-of-day [tags:arch,game][audit:M-02,M-03] — AC: adding a dummy map = 1 folder + 1 registry line, nothing else; a map missing/violating `crowd`/`voice` fails validation; architect-reviewer APPROVE first (shared contract).
- [ ] V2-17 — Rework maps 1–3 (Mirpur 10, Farmgate, New Market) onto the framework with real layers/landmarks/set-pieces/hazards **(M1–M3 get `crowd`/`voice` *data* that validates against the schema; their living-street *behaviour* acceptance is V2-33b)** [tags:art,design][audit:M-02,M-04] — AC: Map Done-definition (PLAN §5.3) for each.

**W3b — Living streets: crowd, voice, finale, dialects (sequential; shared bus/store/audio). Full packets: `docs/spec/TICKET_PACKETS.md`. Mandatory order: V2-34 → V2-31 → V2-32 → V2-37a → V2-33 → V2-33b → V2-35 → V2-36 → V2-37b → V2-38 → V2-39.**
- [ ] V2-34 — Voice engine: mode table, babble synth, separate voice bus, concurrency/rate rules, ref-counted ducking, `startLoop`, settings persistence, CSV→manifest + validator [tags:audio,arch][spec:VOICE_AND_SFX_SPEC] — needs V2-01
- [ ] V2-31 — NPC framework, ambient layer & BubbleSystem (pooled NPCs, kit-bash atlas ≤ 24 walkers, 19+ activities, budgets ≤ 28 actors) [tags:game,art][spec:CROWD §1–4,§10] — needs V2-01/04/17/34
- [ ] V2-32 — Reactions, crowd mood (bus-only), innocent-bystander rule (melee+projectile+animals), scenario runner S1/S2/S4–S7, viral meter [tags:game][spec:CROWD §5–8,§11] — needs V2-31/03/04
- [ ] V2-37a — Consent gate + Friendly exports (**before** the pile-on) [tags:ui,safety][spec:FEATURE_BACKLOG F-01]
- [ ] V2-33 — Cartoon pile-on finisher with one deadline set (villain:dead t0+2600, GameOver t0+3800), shared `RunScene.playArrestFinale` [tags:game,art][spec:CROWD §9]
- [ ] V2-33b — Living-street acceptance for M1–M3 (MAP_SCENARIOS §3) [tags:game,content]
- [ ] V2-35 — Voice integration: CSV single source for DialogueSystem, `hit` subscription fix, trigger-coverage check, SFX, clip import, SW cache [tags:audio,game][spec:VOICE §3,§5,§7]
- [ ] V2-36 — Cricket-commentary announcer (`AnnouncerSystem`, ticker slot reserved in layout.ts) [tags:game,audio]
- [ ] V2-37b — Settings UI: voice, subtitles, Calm mode, Friendly toggle [tags:ui]
- [ ] V2-38 — Localization engine (dialect resolver, per-map mix, subtitle modes, CSV v2, import + release gate) [tags:audio,game,ui][spec:LOCALIZATION_AND_DIALECTS]
- [ ] V2-39 — Dialect-gap gag `S8_ki_koila` [tags:game,content]
- [ ] V2-40a — In-engine bot harness (after V2-06) · [ ] V2-40 — Balance port (`src/config/balance.v2.ts`, assist ladder, bands from GDD §7, masher = 0 %, monotonic hazard cadence) [tags:test,game][spec:GDD §9]
- [ ] V2-40c — **Owner/native content task (not AI):** dialect packs phase 1 (Dhakaiya, Chittagonian, Sylheti) via `docs/spec/dialect/translation_sheet.csv`; record clips; fill `docs/audio/ASSET_LEDGER.csv`
- [ ] V2-41 — Post-launch: phase-2 regions (maps + dialects `mym`,`noa`,`bar`,`rng`,`khl`)

**W4 — New maps (one ticket per map folder → parallel, cap 5)**
- [ ] V2-18 Old Dhaka Chawkbazar Iftar Rush · [ ] V2-19 Sadarghat Launch Terminal · [ ] V2-20 Cox's Bazar Beach · [ ] V2-21 Sreemangal Tea Garden · [ ] V2-22 Haor Village Haat (Monsoon) [tags:art,design,content] — AC each: Map Done-definition (PLAN §5.3) **plus** its `crowd`/`voice` plan and all scenario beats of `docs/spec/MAP_SCENARIOS.md §3` (incl. the map-specific `M#_*` scenario and mob trigger); Bangla copy flagged for owner proof-read.

**W5 — UI/UX rebuild (sequential; after mechanics settle)**
- [ ] V2-23 — Home + Setup stepper (Face/Villain · Map carousel · Loadout) [tags:ui,design][audit:U-05,M-01]
- [ ] V2-24 — In-run HUD + thumb-zone controls; remove dock/ticker overlap; ≤ 22 % UI area at 844×390 [tags:ui,design][audit:U-01,U-02]
- [ ] V2-25 — Result (stars/next map), Shop (cosmetics only), Settings, Achievements restyle [tags:ui][audit:U-07]

**W6 — QA & release gate**
- [ ] V2-26 Playwright suite on GPU Chrome (movement bounds, map reachability, per-map smoke, HUD overlap assertions) · [ ] V2-27 perf pass vs PLAN §10 budget · [ ] V2-28 repo cleanup (docs/archive, stray files, unused SVGs) · [ ] V2-29 a11y + Bangla typography review · [ ] V2-30 final 10-minute gamer playtest (PLAN §11) → `/ship`

## Next scope — V3 (PARKED until V2 reaches M6; recorded 2026-11-13 from the owner)
- [ ] **V3 Hunt Mode** — 2 hunters vs 1 human target with a selectable countdown (2/3/5/10 min, custom up to 50), shared life pool, target evasion kit, local shared-screen first then online (WebRTC, friends-only). Full parked spec: `docs/spec/MULTIPLAYER_V3.md` (tickets V3-00…V3-09 sketched there). **Do not start; V2 only honours the three forward-compat constraints (ControlSource in V2-03, RunRules in V2-06, determinism in V2-01/02).**

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
