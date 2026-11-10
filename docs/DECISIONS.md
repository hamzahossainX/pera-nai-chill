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
