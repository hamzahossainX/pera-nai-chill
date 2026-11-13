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

## DEC-008 — 2026-11-13 — Living streets: crowd/NPC system, voice tiers, cartoon pile-on (spec pack)
**What:** Adopt `docs/spec/` (CROWD_AND_NPC_SPEC, VOICE_AND_SFX_SPEC, MAP_SCENARIOS, TICKET_PACKETS, REVIEW_LOOP, ANTI_HALLUCINATION, FEATURE_BACKLOG). New wave W3b (V2-31…V2-37). Voices: three tiers with automatic fallback (recorded clips → browser TTS → WebAudio babble) on a separate voice bus; crowd = lightweight pooled NPCs (≤ 28 actors) with a state machine, stance/mood model and an innocent-bystander penalty; finale = 2.6 s cartoon pile-on that always ends with the police "law" punchline.
**Why:** Owner brief (crowd reacts, argues, joins a 10–15-person pile-on; ambient singers/guitarists/tea-sippers/joggers; funny Bangladeshi voices). The game currently has no sample/TTS audio and no NPCs (API_FACTS §4).
**Alternatives considered:** (a) AI-cloned/ TTS-generated voices as primary — rejected: rights/consent risk and cost, quality unknown; kept TTS as opt-in tier. (b) Full 15-slot rigs per NPC — rejected: perf. (c) Realistic mob violence — rejected: tone/safety; slapstick-only with guardrails (CROWD §9.3). (d) Downloading third-party agent skills — rejected (DEC-007); the Phaser package already ships 28 first-party skill guides, referenced instead.
**Door type:** two-way for content/art; the bus event names and `MapDefinition.crowd/voice` schema are contract-level (change via SPEC_CHANGE_REQUEST).
**Safety guards added:** consent gate for face uploads + Friendly mode (V2-37), Calm mode, PG line policy, no cloning/viral-clip copying.
**Anti-hallucination infrastructure:** generated `docs/spec/API_FACTS.md`, `scripts/audit/verify-spec-refs.mjs` (rejects invented paths/events — negative-tested), `npm run spec:facts` / `spec:verify`, spec pointer block in CLAUDE.md/AGENTS.md/GEMINI.md.

## DEC-009 — 2026-11-13 — Voice sourcing, dialect process, GDD + production plan, spec v1.1
**What:** (1) The AI cannot generate real voices; production voices are **recorded by the owner/friends/natives**, with TTS and babble as automatic fallbacks (AUDIO_SOURCING). A connected Artlist account has TTS models but no Bengali library voices, no purchasable credits and 3 free generations — nothing was generated or spent. (2) Regional dialects are **native-authored only**; the system (resolver, CSV v2, translation sheet, release gate) is specified, the words are not AI-written (LOCALIZATION_AND_DIALECTS). (3) `docs/GDD.md` is the design source of truth; `docs/PRODUCTION_PLAN.md` defines milestones M0–M6 with fun/playtest gates and a vertical-slice-first rule. (4) Balance candidate numbers come from a Monte-Carlo model (`scripts/balance/`); known caveats recorded in GDD §9. (5) The spec pack was adversarially reviewed and patched to **v1.1**: acyclic ticket order, owned test-hook contract, one pile-on deadline set, trigger-based voice selection, ref-counted ducking, loop API, safer mob wording.
**Why:** owner asked for a production-level plan that makes a genuinely fun game with working regional language; reviewer found 4 blockers and ~20 majors that would have forced the builder to guess.
**Alternatives:** AI/TTS voices as primary (rejected: quality, dialects, rights); AI-drafted dialect lines (rejected: hallucination/offence risk); content-first build order (rejected: vertical slice first).
**Door type:** two-way (docs); the ticket order and test-hook contract are contract-level.

## DEC-010 — 2026-11-13 — Multiplayer "Hunt Mode" is PARKED as next scope (V3)
**What:** Owner's idea — 2 hunters vs 1 human target, selectable countdown (2/3/5/10 min, custom up to 50), shared life pool, target evasion kit — is recorded in `docs/spec/MULTIPLAYER_V3.md` and ROADMAP "Next scope — V3". **No V3 code in V2.** V2 honours three cheap forward-compat constraints: `ControlSource` input abstraction (V2-03), `RunRules` data incl. `timeLimitSec` (V2-06), determinism/test hook (V2-01/02).
**Why:** owner explicitly wants V2 finished first; the idea touches architecture (networking, privacy, DEC-003) so it needs LAW-level approval (signalling, TURN budget, friends-only) before any work. The target being a *real player choosing their own face* resolves the face-consent problem by construction.
**Alternatives:** build multiplayer inside V2 (rejected: scope/risk); keep "WON'T" (rejected: owner wants it).
**Door type:** two-way while parked; networking model is one-way once built (option A recommended).

## DEC-011 — 2026-11-13 — Overnight unattended build protocol + pattern ratchet
**What:** `docs/OVERNIGHT_RUN.md` defines a copy-paste prompt and protocol for the builder AI to work up to 10 h unattended on branch `v2/build` (from `docs/v2-audit-and-plan`), Queue A = W0+W1+bot/balance (stop at M1 candidate), Queue B = V2-34, V2-37a, V2-07 (only if time), with evidence per ticket, heartbeat, morning report, and strict failure/stay-in-lane rules (no push/deploy/deps). `docs/spec/ARCHITECTURE_PATTERNS.md` + `scripts/audit/pattern-check.mjs` (ratchet, baseline `scripts/audit/pattern-baseline.json`, `npm run pattern:check`) guard the design patterns mechanically; `verify-spec-refs` now also covers GDD/PRODUCTION_PLAN/OVERNIGHT_RUN and ignores git branch names.
**Why:** owner will sleep with the laptop on; unattended runs fail by drifting, hallucinating or silently stalling — each gets a mechanical or procedural counter. Queue stops before anything needing human judgement (maps, art direction, dialects, contract approval, playtests).
**Alternatives:** unbounded "build everything" run (rejected: later waves need owner/judge decisions); Claude-judge running overnight (not requested).
**Door type:** two-way.

