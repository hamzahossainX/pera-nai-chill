# LOG.md — Shipped Work History

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
