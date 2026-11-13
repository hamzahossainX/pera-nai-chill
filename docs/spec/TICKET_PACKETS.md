# TICKET_PACKETS.md — Build-ready packets for the crowd / voice / finale features

**How to use:** each packet is the *complete* brief for one ticket. The builder reads: the packet → the spec sections it names → `docs/spec/ANTI_HALLUCINATION.md` (rules R1–R12) → starts. Nothing else is needed; if something is missing, **STOP and ask** (R12).
**Order is mandatory and sequential** (they share `src/game/bus.ts` types, `useGameStore` settings and `audio.ts`): `V2-34 → V2-31 → V2-32 → V2-33 → V2-35 → V2-36 → V2-37`. All start **after Wave 0 and the map framework (V2-16)**, except V2-34 which needs only Wave 0. Fan-out: none (single agent).
**Every packet's definition of done:** gates green + EVIDENCE block (ANTI_HALLUCINATION §5) + `node scripts/audit/verify-spec-refs.mjs` OK + `API_FACTS.md` regenerated and its diff shows *only* intended additions + (UI/art) REVIEW_LOOP passed.

---

## Packet template (copy for new tickets)
```
### V2-NN — <title>        [wave] [tags] [depends: …] [size: S|M|L]
GOAL: one sentence a stranger could verify.
READ (≤ 6): <spec sections> · <existing files> · node_modules/phaser/skills/<topic>/SKILL.md
TOUCH: <paths allowed>            DON'T TOUCH: <shared paths owned by other tickets>
CREATE: <new files, each tagged [NEW]>
CONTRACT: <exact types/signatures/events to implement>
AC: 1… 2… (each testable; says how)
PROOF: <exact commands>
OUT OF SCOPE: <the tempting extras>
```

---

### V2-34 — Voice engine (tiers, babble synth, rules, settings) `[W3b] [audio,arch] [depends: W0] [size: L]`
**GOAL:** `voiceService.say(lineId, opts)` plays a line via clip → TTS → babble fallback on a **separate voice bus** that never starves SFX, with priority/cooldown/duck rules.
**READ:** `docs/spec/VOICE_AND_SFX_SPEC.md` (all) · `src/services/audio.ts` (esp. `play`, `duckBgm`, `maxSimultaneousVoices`, the `AudioContext` ownership) · `docs/spec/voice/voice_lines.csv` · `node_modules/phaser/skills/audio-and-sound/SKILL.md` (for contrast — we use raw WebAudio, not Phaser audio) · `src/store/useGameStore.ts` (settings shape).
**TOUCH:** `src/services/audio.ts` (add `getContext()` only + new SFX cases from VOICE §8) · `src/store/useGameStore.ts` (add settings fields only) · `src/config/` (new files) · `src/__tests__/`.
**DON'T TOUCH:** `src/game/**`, `src/components/**`, `bus.ts`.
**CREATE:** `src/services/voice.ts` [NEW] · `src/config/voiceProfiles.ts` [NEW] · `src/config/voiceLines.generated.ts` [NEW] (generated) · `scripts/voice/build-voice-manifest.mjs` [NEW] (CSV → generated TS) · `scripts/voice/validate-voice.mjs` [NEW] · `src/__tests__/voice.test.ts` [NEW].
**CONTRACT:**
```ts
export type VoiceMode = "off" | "babble" | "clips" | "tts";
export interface SayOptions { speaker?: string; pan?: number; priority?: 0|1|2|3|4; distance?: number /*0..1 attenuation*/; rate?: number }
export interface VoiceService {
  say(lineId: string, opts?: SayOptions): void;
  sayFromPool(pool: string, opts?: SayOptions): string | null;   // returns chosen lineId, no immediate repeat
  preload(packId: string): Promise<void>;                        // lazy clip pack; resolves even on 404 (fallback)
  setMode(mode: VoiceMode): void; setVolume(v: number): void;
  readonly activeCount: number;
}
export const voiceService: VoiceService;
```
Settings added to `GameSettings`: `voice: VoiceMode` (default `"babble"`), `voiceVolume: number` (default 0.8), `subtitleSize: "S"|"M"|"L"` (default `"M"`), `calmMode: boolean` (default false). Existing settings untouched.
**AC:**
1. Resolution order proven by unit tests with a fake `AudioContext`/`speechSynthesis`: clip present → clip; else `tts` mode + bn voice → TTS; else babble.
2. Never > 3 concurrent voices; priorities preempt lowest; crowd rate limits (≥1.2 s gap, ≤4 per 10 s) and 20-line no-repeat enforced (tests with fake timers).
3. Starting 6 synth SFX while 3 voices play: all SFX still accepted (voice bus separate) — test asserts `audioService` active-voice counter unaffected by voice playback.
4. `say` duckBgm(true) for P0–P2 and releases +150 ms after end (spy on `audioService.duckBgm`).
5. Babble: syllable count = `clamp(round(bn.length/3),3,14)`; pitch contour rises on `?`, falls on `!`/`।`; all tunables come from `voiceProfiles.ts` (grep: no numeric literal tuning in `voice.ts` except array/loop bounds).
6. `node scripts/voice/build-voice-manifest.mjs` regenerates `voiceLines.generated.ts` from the CSV; `node scripts/voice/validate-voice.mjs` exits 0 on the current CSV and exits 1 when a row's `maxDurMs > 2300` or an id is duplicated (test with temp CSV).
7. With `voice: "off"` nothing plays and no errors; with autoplay locked (`ctx.state !== "running"`) calls are silent no-ops.
**PROOF:** `npx tsc --noEmit && npm run lint && npm run test` · `node scripts/voice/validate-voice.mjs` · `node scripts/audit/gen-api-facts.mjs`.
**OUT OF SCOPE:** recording/importing real clips (V2-35), wiring to game events (V2-35), UI settings screens (V2-24/25), any change to `DialogueSystem`.

### V2-31 — NPC framework & ambient layer `[W3b] [game,art] [depends: V2-01,02,16,34] [size: L]`
**GOAL:** pooled lightweight NPCs live on the balcony/sidewalk/road layers doing the ambient activities of CROWD §4 per the map's `crowd` plan, within the §10 budgets, deterministically seedable.
**READ:** `docs/spec/CROWD_AND_NPC_SPEC.md §1–4, §10, §12` · `docs/spec/MAP_SCENARIOS.md §1` · `src/config/layout.ts` [NEW] (from V2-01) · `src/game/scenes/RunScene.ts` (system wiring pattern & cleanup) · `src/game/systems/ParallaxSystem.ts` (object pooling pattern) · `node_modules/phaser/skills/groups-and-containers/SKILL.md`, `.../animations/SKILL.md`, `.../sprites-and-images/SKILL.md`.
**TOUCH:** `src/game/scenes/RunScene.ts` (add 4 lines to construct/update/destroy `CrowdSystem`) · `src/game/bus.ts` (add the six `crowd:*` events exactly as CROWD §12) · `src/maps/registry.ts` [NEW] (created by V2-16; extend its schema with the `crowd`/`voice` blocks per MAP_SCENARIOS §1) · `src/config/` · `src/__tests__/`.
**DON'T TOUCH:** `CharacterRig.ts`, `Villain.ts`, `Chaser.ts`, `CombatSystem.ts`, `voice.ts`.
**CREATE:** `src/config/npcs.ts` [NEW] (archetypes, activities) · `src/game/systems/CrowdSystem.ts` [NEW] · `src/game/entities/Npc.ts` [NEW] · `src/lib/rng.ts` [NEW] (seeded RNG from `?seed=`) · `public/assets/npc/*.svg` [NEW] (≥ 60 parts: 5 bodies, 8 outfits, ≥ 10 headgear/props) + atlas build at preload · tests.
**CONTRACT:** `NpcArchetype`, activity table exactly as CROWD §3.1/§4; `CrowdSystem` public API: `constructor(scene, plan: MapCrowdPlan)`, `update(time, delta, scrollSpeed)`, `getLiveCount(): number`, `spawnNpc(id, layer, x, activity?)`, `destroy()`. State machine implements **only** the AMBIENT state here (others stubbed with the legal-transition table + tests) — reactions come in V2-32.
**AC:**
1. On each of the 3 reworked maps (V2-17), a 60 s seeded run (`?test=1&seed=1234`) shows ≥ 12 distinct activities across 3 seeds; live NPC count ≤ 28 at every sampled frame (`window.__game.getState().npcCount`).
2. No per-frame allocation in `CrowdSystem.update` (code review + a unit test with `Object.freeze`d arrays / counting allocator helper) and pools never grow beyond 28 sprites.
3. NPC silhouettes distinct from chaser/villain palettes (review rubric criterion 4).
4. Same seed ⇒ identical spawn sequence (unit test on `rng.ts` + spawn log).
5. `destroy()` removes all sprites/listeners (StrictMode double-mount safe): test mounts/destroys twice, asserts `scene.children.length` returns to baseline.
6. FPS ≥ 55 on GPU browser with 28 NPCs (record number); under software GL record "not measurable".
**PROOF:** unit + `npx playwright test e2e/crowd-ambient.spec.ts` [NEW] (uses fixed-step hook) · screenshots per REVIEW_LOOP.
**OUT OF SCOPE:** reactions, mood, scenarios, mob, voices (later packets).

### V2-32 — Reactions, mood, innocent-hit rule, scenarios `[W3b] [game] [depends: V2-31] [size: L]`
**GOAL:** bystanders notice and react per stance, crowd mood evolves, hitting an innocent penalises the player, and the scenario runner plays templates S1,S2,S4,S5,S6,S7 + each map's `M#_*` beats.
**READ:** `CROWD_AND_NPC_SPEC.md §3.3, §5–8, §11–13` · `MAP_SCENARIOS.md §2–3` · `src/game/systems/CombatSystem.ts` (`applyHit`, projectile overlap) · `src/game/systems/SpawnSystem.ts` (hazard telegraph pattern) · `src/store/useGameStore.ts` (patience/combo actions — Patience from V2-04).
**TOUCH:** `CrowdSystem.ts`, `Npc.ts`, `src/config/scenarios.ts` [NEW], `src/game/systems/ScenarioRunner.ts` [NEW], `CombatSystem.ts` (**only** to emit/consume innocent-hit overlap via a new `CrowdSystem.checkInnocentHit(x,y,r)`), `bus.ts` (no new events beyond CROWD §12), tests.
**DON'T TOUCH:** rigs, `voice.ts`, map art.
**AC:**
1. State machine tests: forbidden transitions throw; every reaction obeys `reactCooldownMs`; stance distribution follows mood bands (table-driven unit test).
2. Mood arithmetic per CROWD §7 (table test incl. decay to base at 2 pts/s).
3. Innocent hit ⇒ NPC `BONKED`, patience −10, speed −15 % for 1.0 s, combo reset, mood −15, event `crowd:innocentHit` (e2e via `window.__game.debug.hitNpc()`); 3 innocents in a run ⇒ mini-mob of 6 NPCs charges the chaser for 2.5 s (e2e).
4. Telegraph: crossing NPCs show shadow + `!` ≥ 500 ms before entering a lane (frame-step test).
5. Each scenario template runs end-to-end via `window.__game.debug.runScenario(id)` and emits the documented events/lines (assert recorded `say` calls ids ⊆ CSV).
6. Viral meter per CROWD §8 (unit test) — disabled in `calmMode`.
**PROOF:** unit + e2e + review packet (round ≥ 2) for the comedy staging of S1, S2, S7.
**OUT OF SCOPE:** the pile-on (V2-33), voice playback wiring (V2-35).

### V2-33 — Pile-on finisher (cartoon mob) `[W3b] [game,art] [depends: V2-32] [size: M]`
**GOAL:** the 2.6 s mob choreography of CROWD §9.2, triggered per map, ending in the existing police-stamp finale.
**READ:** `CROWD_AND_NPC_SPEC.md §9` · `src/game/scenes/RunScene.ts` (`handleVillainDead`: slow-mo, policeman, stamp, coin shower) · `src/game/systems/FxSystem.ts` · `node_modules/phaser/skills/tweens/SKILL.md`, `.../particles/SKILL.md`, `.../time-and-timers/SKILL.md`.
**TOUCH:** `CrowdSystem.ts` (add `startMob()`), `src/game/fx/MobCloud.ts` [NEW], `RunScene.ts` (call-in only), `src/config/scenarios.ts`, tests.
**DON'T TOUCH:** `useGameStore.inflictDamage` semantics (mob drains HP through a normal damage call sequence), rigs.
**AC:**
1. Timeline matches §9.2 within ±100 ms in a fixed-step test (events: `crowd:mobStart` at t0, `crowd:mobEnd` ≈ t0+2100, `villain:dead` ≤ t0+2800).
2. Mob size = `clamp(8 + round(mood/15), 8, 15)`; never < 25 s into the run; never twice per run (unit tests).
3. Visual: ≤ 6 limb sprites simultaneously; cloud hides the villain's rig only after the first 550 ms; **no blood/wounds; no kicking a downed figure** (review rubric criterion 7 must be 5).
4. Ends with policeman + stamp (reuse existing code path) and the police line voice event (`pol_law_01`) is requested via the bus/voice hook (stubbed until V2-35).
5. Works under `calmMode` (single "ঠাস!" + reduced cloud, no shake).
6. FPS ≥ 55 during the mob on GPU browser (record).
**PROOF:** e2e forcing `window.__game.debug.triggerMob()`; contact-sheet screenshots (6 frames) per REVIEW_LOOP; review round ≥ 2.
**OUT OF SCOPE:** new weapons, new Result-screen replay (F-13).

### V2-35 — Voice integration, SFX additions, clip pipeline `[W3b] [audio,game] [depends: V2-34, V2-32, V2-33] [size: M]`
**GOAL:** all trigger→pool mappings of VOICE §3 are live; crowd SFX exist; the clip import/lazy-load/caching pipeline works with zero clips (babble) and with sample clips.
**READ:** `VOICE_AND_SFX_SPEC.md §3, §5, §7, §8` · `src/game/systems/DialogueSystem.ts` · `public/sw.js` · `src/game/bus.ts`.
**TOUCH:** `src/game/systems/DialogueSystem.ts` (route lines to voice **without** changing bubble behaviour), `src/game/systems/BubbleSystem.ts` [NEW], `CrowdSystem.ts` (voice calls), `src/services/audio.ts` (new SFX cases only), `public/sw.js` (cache rule for `/assets/voice/`), `scripts/voice/import-voice.mjs` [NEW], tests.
**AC:**
1. Table-driven test: for every CSV row with a `trigger`, some code path calls `voiceService.say/sayFromPool` with that trigger (static check script `scripts/voice/check-trigger-coverage.mjs` [NEW] exits 0).
2. Max 4 bubbles visible; bubbles never overlap HUD or lane feet (Playwright geometry check at 844×390).
3. With `/assets/voice/` blocked (Playwright route abort) the game still plays babble and shows all bubbles; with 2 dummy `.ogg` test clips present they play instead (assert via spy).
4. Slow-mo (Chappal Storm) lowers voice rate (spy asserts `rate` option scaled).
5. New SFX keys exist in `audioService` and appear in regenerated `API_FACTS.md`; each ≤ 400 ms (loops 2–4 s seamless) and respect the 6-voice cap.
6. `public/sw.js` caches voice clips cache-first; offline reload plays cached clip (manual note + e2e with `context.setOffline`).
**OUT OF SCOPE:** recording the real clips (owner task, VOICE §5).

### V2-36 — Cricket-commentary announcer `[W3b] [game,audio] [depends: V2-35] [size: S]`
**GOAL:** an `announcer` speaker reacts to hits, combo tiers, gap, mob, innocents and events with the CSV lines, rate-limited to ≤ 1 per 8 s, subtitle in a top-centre ticker slot (not over lanes).
**READ:** VOICE §3, `docs/spec/voice/voice_lines.csv` (`announcer` rows), `src/config/dialogue.ts` (`COMBO_NAMES`, `COMMENTATOR_TICKER`).
**TOUCH:** `src/game/systems/DialogueSystem.ts` or new `AnnouncerSystem.ts` [NEW], `src/components/game/` ticker component (restyle per DESIGN §7), tests.
**AC:** 1. Triggers per CSV (`hit`, `combo_7/10`, `gap_far`, `mob_start`, `innocent_hit`, `event_loadshedding`) each fire in a seeded e2e. 2. ≤ 1 announcer line / 8 s (fake-timer test). 3. Ticker never overlaps the HUD or lanes at 844×390 (geometry test). 4. `calmMode` mutes it.

### V2-37 — Safety & access: face-consent gate, Calm mode, voice/subtitle settings UI `[W3b/W5] [ui,safety] [depends: V2-34] [size: S–M]`
**GOAL:** responsible-design guards required by the mob finisher: a one-time consent screen before photo upload, a Calm mode, and the voice/subtitle settings.
**READ:** `docs/spec/FEATURE_BACKLOG.md F-01, F-12` · `docs/DESIGN.md` · `src/components/lobby/FaceUploader.tsx`, `src/components/lobby/SettingsSheet.tsx`, `docs/DECISIONS.md` (DEC-003 privacy).
**TOUCH:** the two lobby components above, `src/store/useGameStore.ts` (settings fields from V2-34 already exist), copy in `src/config/`, tests.
**AC:** 1. First upload/camera attempt shows consent (Bangla primary): "নিজের বা বন্ধুর অনুমতি নিয়ে ছবি দিন। ছবি ফোনের বাইরে যায় না।" with Accept/Cancel; acceptance stored (try/catch localStorage); cancel aborts. 2. "Friendly mode" toggle swaps any uploaded face for the default cartoon in exported images. 3. Settings expose Voice mode, Volume, Subtitle size, Calm mode; changes apply live (no reload). 4. Calm mode: density ×0.5, mob → single "ঠাস!" + no shake/flash, announcer & crowd voices off. 5. All controls are real `<button>`s ≥ 48 px with focus rings; `/design-review` ≥ 8/10 at the three viewports.
