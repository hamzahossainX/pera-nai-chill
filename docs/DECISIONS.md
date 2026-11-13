# DECISIONS.md — Dated Log of Non-Obvious Choices

Format: `## DEC-### — YYYY-MM-DD — <title>` then **What / Why / Alternatives considered / Consequences**.

## DEC-001 — 2026-11-10 — Adopted A-Team v7 (portable edition)
**What:** Installed the A-Team multi-agent framework (skills, reviewer subagents, gates, docs/memory protocol).
**Why:** Consistent, gated, resumable engineering workflow across sessions.
**Consequences:** Run `/adapt` to bind it to this stack; work flows through ROADMAP tickets + the §5 review stage.

## DEC-002 — 2026-11-10 — Zero-Remote-Dependency WebAudio Procedural Synthesizer
**What:** Handcrafted dynamic WebAudio oscillators, biquad filters, and noise bursts instead of relying on external MP3 audio file downloads.
**Why:** Remote CDN audio files can fail on spotty Bangladeshi mobile connections (3G/4G). A procedural synth ensures 100% reliability, instant zero-latency loading, and 0 bytes audio download.
**Alternatives considered:** Howler.js with bundled MP3s. Rejected due to asset download latency and CORS risk.
**Consequences:** Instant sound unlock, zero missing audio assets.

## DEC-003 — 2026-11-10 — 100% Local On-Device Face Processing
**What:** MediaPipe BlazeFace Short Range running in WebAssembly/WebGL with offline CPU bounding-box fallback and HTML5 canvas cartoonification.
**Why:** Satirical games using real user photos carry immense privacy risks. Processing strictly in-memory ensures zero biometric data leaks, zero GDPR/cloud compliance issues, and zero server hosting costs.
**Alternatives considered:** Server-side Face API / Python Flask microservice. Rejected for privacy, hosting costs, and latency.
**Consequences:** Photos never leave device memory, discarded on browser reload.

## DEC-004 — 2026-11-10 — React Shell ↔ Phaser 4 Event Bus Architecture
**What:** Decoupled game engine (`RunScene`, `ParallaxSystem`, `CombatSystem`) from UI (`HudOverlay`, `WeaponDock`, `EventBanner`) using a typed `mitt` event bus and Zustand store with `subscribeWithSelector`.
**Why:** High-frequency 60 FPS calculations (positions, particles, angles) must stay inside WebGL without triggering React re-renders. Low-frequency state (HP, Taka, combo, active event) syncs throttled at 10 Hz.
**Consequences:** Rock-solid 60 FPS on mobile browsers without React render stalls.

## DEC-005 — 2026-11-10 — Procedural Dhaka Parallax & Rig Textures in BootScene
**What:** Sky gradients, neon billboards, street cables, roads, jointed character limbs, and pickups are rendered to textures programmatically using Phaser Graphics.
**Why:** Eliminates network blocking during game boot, reduces bundle size to <1.5MB gzip, and establishes a consistent comic/rickshaw-art visual language.
**Consequences:** Tier-0 assets always work out-of-the-box on every device.

## DEC-006 — 2026-11-13 — V2 overhaul: real chase loop, data-driven maps, design law
**What:** Adopt `docs/GAME_PLAN_V2.md`: (1) player-controlled lanes/dash/jump with a Gap + Patience fail model; (2) `MapDefinition` folders + generic layer-driven parallax replace all `mapId` branches; (3) `src/config/layout.ts` and `EntityMotion` become the only owners of zones and entity positions; (4) DESIGN.md is law; (5) 8 Bangladesh maps; (6) thumb-zone controls replace the centred weapon dock. Door type: **two-way for art/UI, one-way-ish for the MapDefinition contract** (architect-reviewer gate at V2-16).
**Why:** Audit shows the game is a button-masher (no movement/fail state), has no reachable or distinct maps, lets entities leave the world, and has no design law (GAME_AUDIT §1).
**Alternatives considered:** (a) patch visuals only — rejected, mechanics are the root cause; (b) rewrite in another engine — rejected, Phaser/Next split (DEC-004) is sound; (c) sprite-sheet characters first — kept as fallback D1-B after two failed silhouette gates.
**Defaults pending owner [CONFIRM]:** D1–D7 in GAME_PLAN_V2 §12.
**Consequences:** Stage-based runs with stars replace the endless fight; banana/can hotkeys become pickups; hidden every-3rd-run boss removed.

## DEC-007 — 2026-11-13 — Wrote project-local skills instead of downloading third-party ones
**What:** Added `map-authoring` and `playtest-audit` locally; did not install internet skills.
**Why:** Unreviewed third-party skill files are executable instructions for the agent (supply-chain/prompt-injection surface) and the repo's existing skills already cover rig, Phaser integration, juice, Bangla copy, events and audio. The gaps (map pipeline, judge procedure) were project-specific anyway.
**Consequences:** If a specific public skill is wanted later, review its text first, then vendor it under `.claude/skills/`.

