# LOG.md — Shipped Work History

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
