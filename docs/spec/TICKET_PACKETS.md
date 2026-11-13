# TICKET_PACKETS.md — Build-ready packets for the crowd / voice / finale / dialect features (v1.1)

**How to use:** each packet is the *complete* brief for one ticket. Read: the packet → the spec sections it names → `docs/spec/ANTI_HALLUCINATION.md` (R1–R12) → build. If anything is missing or contradictory → **STOP and ask** (R12).
**v1.1 (2026-11-13)** incorporates the adversarial review: shared contracts now have owners, the order is acyclic, tests have one deadline set, voice selection is by trigger.

## 0. Prerequisites owned by earlier waves (do not re-create here)
| Needed by packets | Created by | Contract (exact) |
|---|---|---|
| `window.__game` test hook, `?test=1&seed=N`, `rng` | **V2-01** | `src/game/testHook.ts` [NEW] installed from `src/game/createGame.ts` only when `?test=1`: `window.__game = { seed, step(ms), getState(), registerState(name, fn), debug: { register(name, fn), call(name, ...a), list() } }`. `getState()` returns `{ fps, time, hp, maxHp, combo, villain:{x,y,lane}, chaser:{x,y,lane}, gap, patience, npcCount, crowdMood }`; fields not yet implemented are `null`; later tickets add providers via `registerState`. Each later ticket registers **only its own** `debug.*` functions (one line each) — nobody else edits `testHook.ts`. `src/lib/rng.ts` [NEW]: `rng.next()`, `rng.chance(p)`, `rng.pick(arr)`, `rng.range(a,b)`, wrapping Phaser's seedable `Phaser.Math.RND` (game-config `seed`, see `node_modules/phaser/skills/geometry-and-math/SKILL.md`); V2-01 migrates `Math.random` in `SpawnSystem`, `Villain`, `DialogueSystem`, `CombatSystem`; cosmetic randomness elsewhere (weather particles) may stay and is listed in the ticket. |
| Patience, speed-modifier, gap | **V2-04** | store: `patience: number`, `drainPatience(n)`, `restorePatience(n)`; `slowChaser(mult, sec)`; `getState().gap/patience` providers |
| Full `MapDefinition` **including** `crowd`, `voice`, `dialect` blocks + Zod validation + `src/maps/registry.ts` [NEW] | **V2-16** | per `docs/GAME_PLAN_V2.md §5.1` + `docs/spec/MAP_SCENARIOS.md §1` + `docs/spec/LOCALIZATION_AND_DIALECTS.md §4`. Later tickets may only *use* these types. |
| Map art + `crowd` DATA (schema-valid) for M1–M3 | **V2-17** | AC limited to "validates against schema, art/hazards/set-piece per Map-Done"; living-street *behaviour* acceptance lives in V2-33b |

**Mandatory order (acyclic):** `V2-34 → V2-31 → V2-32 → V2-37a → V2-33 → V2-33b → V2-35 → V2-36 → V2-37b → V2-38 → V2-39`; `V2-40a` (bot harness) right after V2-06; `V2-40` (balance port) after V2-05; `V2-41` (phase 2) post-launch. V2-31 additionally **depends on V2-17** (maps exist to host crowds) and V2-04. All are sequential (shared bus/store/audio). Fan-out: none.
**Definition of done for every packet:** gates green + EVIDENCE block (ANTI_HALLUCINATION §5) + `npm run spec:verify` OK + `npm run spec:facts` diff shows only intended additions + (UI/art) REVIEW_LOOP passed.

## Packet template
```
### V2-NN — <title>   [wave] [tags] [depends: …] [size]
GOAL · READ (≤ 6) · TOUCH · DON'T TOUCH · CREATE · CONTRACT · AC (testable) · PROOF · OUT OF SCOPE
```

---

### V2-34 — Voice engine (modes, babble synth, rules, settings persistence, loops, ducking) `[W3b] [audio,arch] [depends: V2-01] [L]`
**GOAL:** `voiceService` plays lines via clip → TTS → babble per the mode table on a **separate voice bus** that never starves SFX; settings persist; BGM ducking is ref-counted; looped SFX have their own API.
**READ:** `docs/spec/VOICE_AND_SFX_SPEC.md` (all, esp. §1 mode table, §2 profiles, §4 rules, §8 loops) · `src/services/audio.ts` · `docs/spec/voice/voice_lines.csv` · `src/store/useGameStore.ts` (`GameSettings`) · `src/lib/storage.ts` · `node_modules/phaser/skills/audio-and-sound/SKILL.md` (contrast only — we use raw WebAudio).
**TOUCH:** `src/services/audio.ts` — add **only**: `getContext(): AudioContext | null`, `getActiveVoiceCount(): number` (read-only), `startLoop(name, opts): {stop()}` (≤ 2 loops, outside the 6 slots), ref-counted `duck(id)`/`release(id)` with `duckBgm(bool)` kept as a wrapper, and the new one-shot/loop synth cases (VOICE §8) · `src/store/useGameStore.ts` (add settings fields + versioned persistence `pnc.settings.v1`, try/catch) · `src/lib/storage.ts` · `src/config/` · `src/__tests__/` · `src/game/testHook.ts` (**one** `debug.register("sayLine", …)` line).
**DON'T TOUCH:** `src/game/**` (other than the hook line), `src/components/**`, `src/game/bus.ts`.
**CREATE:** `src/services/voice.ts` [NEW] · `src/config/voiceProfiles.ts` [NEW] (the full table from VOICE §2) · `src/config/voiceLines.generated.ts` [NEW] (generated) · `scripts/voice/build-voice-manifest.mjs` [NEW] (CSV → typed lines indexed by id/trigger/pool + `packs` with size budgets) · `scripts/voice/validate-voice.mjs` [NEW] · `src/__tests__/voice.test.ts` [NEW] · `src/__tests__/audio_loops_duck.test.ts` [NEW].
**CONTRACT:**
```ts
export type VoiceMode = "off" | "babble" | "clips" | "tts";
export interface SayOptions { speaker?: string; pool?: string; pan?: number; distance?: number /*0..1*/; rate?: number }
export interface VoiceService {
  say(lineId: string, opts?: SayOptions): void;
  sayByTrigger(trigger: string, opts?: SayOptions): string | null;   // random row with that exact trigger (filter by speaker/pool), no immediate repeat; returns id
  sayFromPool(pool: string, opts?: SayOptions): string | null;
  preload(packId: string): Promise<void>;                            // resolves even on 404 (fallback)
  setMode(m: VoiceMode): void; setVolume(v: number): void; readonly activeCount: number;
}
```
New `GameSettings` fields (defaults): `voice: "babble"`, `voiceVolume: 0.8`, `subtitleSize: "M"`, `calmMode: false`, `dialectMode: "auto"`, `dialectSubtitle: "both"`; existing `reducedMotion` stays; **Calm mode ⊇ reducedMotion** (enabling Calm sets both effects; disabling Calm does not clear a user's own reducedMotion).
**AC:**
1. Mode table of VOICE §1 proven with a fake `AudioContext`/`speechSynthesis` (all 12 cells).
2. Concurrency: ≤ 3 total, ≤ 2 crowd-group, mob = 1 slot; priority preemption; crowd-only rate limit (≥ 1.2 s, ≤ 4/10 s); announcer ≤ 1/8 s; 20-line no-repeat (fake timers).
3. SFX not starved: with 3 voices active, 6 sequential `audioService.play()` calls are accepted exactly as without voices (`getActiveVoiceCount()` behaviour test).
4. Ducking: Chappal-Storm-style `duck("ult")` + voice `duck("v1")`; releasing the voice does **not** un-duck while `"ult"` is held (ref-count test).
5. Loops: third `startLoop` is rejected/queued; loops don't consume one-shot slots.
6. `getContext()` is `null` before unlock and every `say*` is a silent no-op then.
7. Babble per VOICE §6 (syllables `clamp(round(bn.length/3),3,14)`; contour; all tunables from `voiceProfiles.ts`).
8. Manifest script: regenerates typed lines from the CSV; `packs` sizes enforced (fails over budget); `validate-voice.mjs` exits 0 on the CSV, exits 1 on duplicate id / `maxDurMs > 2300` / bad `priority`/`group` (tested with temp CSVs); `--release` mode rejects non-shippable dialect rows (LOCALIZATION §3).
9. Settings persist across reload (test with a fake storage) and survive corrupt JSON (falls back to defaults).
**PROOF:** `npx tsc --noEmit && npm run lint && npm run test` · `node scripts/voice/validate-voice.mjs` · `npm run spec:facts`.
**OUT OF SCOPE:** wiring to game events/bubbles/dialogue (V2-35), recording clips, settings *screens* (V2-37b), dialect resolver (V2-38).

### V2-31 — NPC framework, ambient layer & BubbleSystem `[W3b] [game,art] [depends: V2-01, V2-04, V2-17, V2-34] [L]`
**GOAL:** pooled NPCs live on balcony/sidewalk/road layers doing the ambient activities, within budgets, deterministic by seed; a pooled `BubbleSystem` shows crowd speech.
**READ:** `docs/spec/CROWD_AND_NPC_SPEC.md §1–4, §10, §12` · `docs/spec/MAP_SCENARIOS.md §1` · `src/config/layout.ts` [NEW] · `src/game/scenes/RunScene.ts` (wiring/cleanup pattern) · `src/game/systems/ParallaxSystem.ts` (pooling pattern) · `node_modules/phaser/skills/groups-and-containers/SKILL.md`, `.../animations/SKILL.md`, `.../text-and-bitmaptext/SKILL.md`.
**TOUCH:** `src/game/scenes/RunScene.ts` (≈ 4 lines: construct/update/destroy `CrowdSystem` + `BubbleSystem`; later V2-33 adds its own call) · `src/game/bus.ts` (add the six `crowd:*` events exactly as CROWD §12) · `src/config/` · `src/game/testHook.ts` (register `npcCount` state provider + `debug.spawnNpc`) · tests.
**DON'T TOUCH:** `CharacterRig.ts`, `Villain.ts`, `Chaser.ts`, `CombatSystem.ts`, `voice.ts`, `src/maps/registry.ts` (schema owned by V2-16).
**CREATE:** `src/config/npcs.ts` [NEW] · `src/game/systems/CrowdSystem.ts` [NEW] · `src/game/systems/BubbleSystem.ts` [NEW] (pooled Phaser text with a **literal** font family `'Hind Siliguri'`, not a CSS variable; lifetime `max(2000, maxDurMs + 300)`; ≤ 4 visible; ≥ 18 logical px) · `src/game/entities/Npc.ts` [NEW] · `public/assets/npc/` [NEW] (SVG parts, ≥ 23 parts: 5 bodies, 8 outfits, ≥ 10 headgear/props) + on-demand atlas composition (CROWD §3.2) · tests.
**CONTRACT:** `NpcArchetype` and activity table per CROWD §3.1/§4 (add ids `film`, `point` to `ACTIVITIES`; define the `carryLoad`/`kidsMarbles` variants as separate ids `carryLoadTea`, `marblesPuddle`); `CrowdSystem(scene, plan: MapCrowdPlan)` with `update(time, delta, scrollSpeed)`, `getLiveCount()`, `spawnNpc(id, layer, x, activity?)`, `destroy()`; `BubbleSystem.show(speakerSprite, line: {bn,en}, opts)`. Only the AMBIENT state is implemented here; the state table + legal-transition test exist for all states.
**AC:**
1. On each of M1–M3 (V2-17), a 60 s seeded run shows ≥ 12 distinct activities **across 3 seeds** (and ≥ 6 in any one run on low-density maps); `getState().npcCount ≤ 28` at every sampled frame.
2. No per-frame allocation in `CrowdSystem.update` (review + counting test); pools never exceed 28 sprites; atlas pages within the CROWD §10 limits.
3. Same seed ⇒ identical spawn sequence (unit test using `rng`).
4. `destroy()` removes all sprites/listeners (StrictMode double-mount safe): mount/destroy twice → `scene.children.length` back to baseline.
5. `calmMode` halves density (×0.5) — unit test on the density function.
6. Bubble geometry: ≤ 4 visible, never overlapping the HUD band or lane feet at 844×390 (Playwright geometry check).
7. FPS ≥ 55 on GPU Chrome with 28 NPCs (record); under software GL record "not measurable".
**OUT OF SCOPE:** reactions, mood, scenarios, pile-on, voice playback.

### V2-32 — Reactions, mood, innocent-hit rule, scenario runner `[W3b] [game] [depends: V2-31, V2-03, V2-04] [L]`
**GOAL:** bystanders notice/react per stance; mood evolves (bus event only); hitting an innocent penalises the player; ScenarioRunner plays S1,S2,S4–S7 + map `M#_*` beats; viral meter works.
**READ:** `CROWD_AND_NPC_SPEC.md §3.3, §5–8, §11–13` · `MAP_SCENARIOS.md §2–3` · `src/game/systems/CombatSystem.ts` (`applyHit`) · `src/game/entities/Projectile.ts` · `src/game/systems/SpawnSystem.ts` (telegraph pattern) · `src/store/useGameStore.ts` (patience API from V2-04).
**TOUCH:** `CrowdSystem.ts`, `Npc.ts`, `src/config/scenarios.ts` [NEW], `src/game/systems/ScenarioRunner.ts` [NEW], `CombatSystem.ts` (add the innocent-hit position test via `CrowdSystem.checkInnocentHit(x,y,r)`), `Projectile.ts` (overlap hook for projectiles), `src/game/testHook.ts` (register `hitNpc`, `runScenario`, `crowdMood` provider), tests.
**DON'T TOUCH:** rigs, `voice.ts`, map art, `useGameStore.ts` shape (mood is **not** a store field).
**AC:**
1. State-machine tests: forbidden transitions throw; per-NPC `reactCooldownMs` obeyed; the single visibility rule (CROWD §3.3) used everywhere.
2. Mood arithmetic table (CROWD §7) incl. decay; mood published only through `crowd:mood` at ≤ 10 Hz (emission-rate test).
3. Innocent hit (melee **and** projectile **and** animal hazard): NPC `BONKED`, patience −10, speed −15 % 1.0 s, combo reset, mood −15, `crowd:innocentHit`; 3 innocents ⇒ 6-NPC mini-mob charges the chaser for 2.5 s (seeded e2e via `debug.hitNpc`).
4. Telegraph: crossing NPCs show shadow + `!` ≥ 500 ms before entering a lane (fixed-step test).
5. Every scenario template runs via `debug.runScenario(id)` and emits only documented events/ids ⊆ CSV (`say` steps reference **line ids**, never pools).
6. Viral meter per CROWD §8 (unit test); disabled in `calmMode`.
7. Staging review (REVIEW_LOOP round ≥ 2) for S1, S2, S7 using `BubbleSystem` from V2-31 (voices not required).
**OUT OF SCOPE:** the pile-on (V2-33), voice playback wiring (V2-35).

### V2-37a — Consent gate & Friendly mode (**before** the pile-on ships) `[W3b] [ui,safety] [depends: V2-34] [S]`
**GOAL:** no real face reaches the pile-on without consent; exports can be made face-safe.
**READ:** `docs/spec/FEATURE_BACKLOG.md F-01` · `docs/DESIGN.md` · `src/components/lobby/FaceUploader.tsx` · `src/components/game/WantedPosterModal.tsx` · DEC-003.
**TOUCH:** `FaceUploader.tsx`, `WantedPosterModal.tsx` (export path), `src/store/useGameStore.ts` (add `faceConsent`, `friendlyExports` only), `src/config/copy.ts` [NEW] (UI strings), tests.
**AC:** 1. First photo/camera use shows the consent sheet (Bangla primary): "নিজের বা বন্ধুর অনুমতি নিয়ে ছবি দিন। ছবি আপনার ডিভাইসের বাইরে যায় না।" with Accept/Cancel; acceptance persisted (try/catch); cancel aborts the upload. 2. **Friendly exports default ON**: poster/meme/highlight exports replace the uploaded face and the `targetName` with the generic cartoon + default name unless the user turns it off. 3. Real `<button>`s ≥ 48 px, focus ring; `/design-review` ≥ 8 at the 3 viewports. 4. In-game, a Friendly-mode toggle (default OFF in play, ON in exports) is reachable from the Setup stepper later (V2-37b).

### V2-33 — Cartoon pile-on finisher `[W3b] [game,art] [depends: V2-32, V2-37a] [M]`
**GOAL:** the CROWD §9 pile-on with the single deadline set; the arrest finale is shared, not duplicated.
**READ:** `CROWD_AND_NPC_SPEC.md §9` (v1.1) · `src/game/scenes/RunScene.ts` (`handleVillainDead`) · `src/store/useGameStore.ts` (`inflictDamage`, `villain:dead`, 1200 ms GameOver `setTimeout`) · `src/game/systems/FxSystem.ts` · `node_modules/phaser/skills/tweens/SKILL.md`, `.../particles/SKILL.md`, `.../time-and-timers/SKILL.md`.
**TOUCH:** `CrowdSystem.ts` (`startMob()`), `src/game/fx/MobCloud.ts` [NEW], `src/game/scenes/RunScene.ts` (**refactor** `handleVillainDead` into public `playArrestFinale({ withPolice })`; add mob call-in; set `tweens.timeScale` where scene slow-mo is used), `src/config/scenarios.ts`, `src/game/testHook.ts` (`debug.triggerMob`), tests.
**DON'T TOUCH:** `inflictDamage` semantics, rigs, `bus.ts` types (events exist from V2-31).
**AC (single deadline set):**
1. Fixed-step timeline: `crowd:mobStart` t0 · `crowd:mobEnd` t0+2100±100 · `villain:dead` **once** at t0+2600±100 · GameOver visible by t0+3800±150; policeman and stamp spawn **exactly once** (spy count).
2. Villain HP never reaches 0 before t0+2600 (floor of 1) — test asserts `getState().hp ≥ 1` until then.
3. Arming per CROWD §9.1: fires only when HP ≤ 30 %, mood ≥ 70, run ≥ 25 s, ≥ 6 eligible NPCs, never twice; `setPiece` only arms; 12 s fallback bump works (seeded tests for each).
4. Size `clamp(8 + round(mood/15), 8, 15)`; `canJoinMob:false` NPCs (incl. religious-attire NPCs) never join (test over a full roster).
5. Visual: ≤ 6 poke-out sprites, attached to the cloud, never on the ground; no blood/wounds; REVIEW rubric criterion 7 = 5 **and** "no line celebrates beating a person" check passes (contact sheet + CSV audit).
6. Calm mode behaviour per CROWD §9.3.
7. FPS ≥ 55 during the pile-on on GPU Chrome (record).
**OUT OF SCOPE:** Result-screen replay (F-13), new weapons.

### V2-33b — Living-street acceptance for M1–M3 `[W3b] [game,content] [depends: V2-33] [M]`
**GOAL:** maps 1–3 satisfy `docs/spec/MAP_SCENARIOS.md §3` (vignettes, S1 pointers, map-specific scenario, pile-on trigger, innocent rule, babble fallback).
**TOUCH:** `src/maps/mirpur|farmgate|newmarket/` data (`crowd`, `voice`, vignettes), `src/config/scenarios.ts` (`M1_trench_peek`, `M2_bag_rain`, `M3_power_flicker`), tests, screenshots.
**AC:** every row of MAP_SCENARIOS §3 table passes per map with the stated test; REVIEW_LOOP rubric ≥ 8; judge re-audit.

### V2-35 — Voice integration (CSV is the single source), crowd SFX, clip pipeline `[W3b] [audio,game] [depends: V2-34, V2-33b] [M]`
**GOAL:** every CSV trigger has a live call site; hero/villain bubbles and voices come from the same CSV line; the clip pipeline and caching work with zero clips and with sample clips.
**READ:** `VOICE_AND_SFX_SPEC.md §3, §5, §7` · `src/game/systems/DialogueSystem.ts` · `src/config/dialogue.ts` · `public/sw.js` · `docs/spec/API_FACTS.md §2` (never-emitted events).
**TOUCH:** `DialogueSystem.ts` (**rewrite `triggerLine` to pick a CSV line**: bubble text = manifest `bn/en`, plus voice; keep `DIALOGUE_GROUPS` only for lines not yet in the CSV and mark them deprecated), `RunScene.ts` (emit `chase_start` call-site), `CrowdSystem.ts`/`ScenarioRunner.ts` (voice calls), `public/sw.js` (cache rule `/assets/voice/` cache-first), `scripts/voice/import-voice.mjs` [NEW], `scripts/voice/check-trigger-coverage.mjs` [NEW], tests.
**DON'T TOUCH:** `bus.ts` (no new events), voice engine internals.
**AC:** 1. Subscribe to bus **`hit`** (not `combat:hit`); the dialogue-on-hit that never fired before now fires (e2e with spy). 2. `check-trigger-coverage.mjs` exits 0: every trigger in the CSV has a `sayByTrigger("<trigger>"` (or `sayFromPool`) call site; unknown triggers fail. 3. Bubble and voice use the **same line id** (assert via the recorded `say` call and the bubble text). 4. With `/assets/voice/` blocked (Playwright route abort) → babble + bubbles; with 2 dummy `.ogg` test clips → clips (spy). 5. Slow-mo lowers voice rate (≥ 0.6 clamp). 6. SW caches clips; offline reload plays a cached clip (e2e `context.setOffline`). 7. Import script normalises (ffmpeg) and writes a ledger row (tested with fixture audio; skipped with a clear message if `ffmpeg` is absent). 8. New one-shot/loop SFX exist in `audioService` and in regenerated `API_FACTS.md`, each ≤ 400 ms (loops via `startLoop`).

### V2-36 — Cricket-commentary announcer `[W3b] [game,audio] [depends: V2-35] [S]`
**GOAL:** `AnnouncerSystem` reacts to hits, combo tiers (3/7/10), gap, pile-on, innocents and events with CSV `announcer` lines.
**TOUCH:** `src/game/systems/AnnouncerSystem.ts` [NEW], `src/config/layout.ts` (reserve a **ticker slot** rect; no restyling — the ticker/HUD restyle belongs to V2-24), tests.
**AC:** 1. Each trigger (`hit`, `combo_7`, `combo_10`, `gap_far`, `mob_start`, `innocent_hit`, `event_loadshedding`) fires in a seeded e2e. 2. ≤ 1 line / 8 s (fake timers). 3. Subtitle drawn in the reserved slot, never over HUD/lanes at 844×390. 4. `calmMode` mutes it. 5. `combo_7` fires when the count **first reaches 7**.

### V2-37b — Settings UI: voice, subtitles, Calm mode, Friendly toggle `[W3b/W5] [ui] [depends: V2-37a, V2-35] [S–M]`
**GOAL:** the user-facing settings that V2-34 persists. (V2-25 only *restyles* this screen later.)
**TOUCH:** `src/components/lobby/SettingsSheet.tsx`, `src/config/copy.ts`, tests.
**AC:** Voice mode, Volume, Subtitle size (S/M/L), Calm mode, Friendly toggle exposed; apply **live**; persist across reload; Calm mode ⊇ reducedMotion per V2-34; real `<button>`s ≥ 48 px with focus rings; `/design-review` ≥ 8 at 3 viewports; Dialect controls arrive in V2-38.

### V2-38 — Localization engine: dialects `[W3b] [audio,game,ui] [depends: V2-37b] [M]`
**GOAL:** `resolveLine` chain, per-map dialect mix, subtitle modes, CSV v2 columns, importer, release gate — **no dialect text authored by AI**.
**READ:** `docs/spec/LOCALIZATION_AND_DIALECTS.md` (all) · `docs/spec/voice/voice_lines.csv` · `docs/spec/dialect/translation_sheet.csv`.
**CREATE:** `src/services/dialect.ts` [NEW] (`resolveLine`) · `scripts/voice/import-dialect-sheet.mjs` [NEW] · extend `validate-voice.mjs` · tests · glyph-torture Playwright test.
**TOUCH:** `voice.ts`/manifest build (accept `@dialect` rows), `SettingsSheet.tsx` (Dialect mode + subtitle), `BubbleSystem.ts` (render per subtitle mode), `src/maps/*/map.ts` (`dialect` block data only).
**AC:** LOCALIZATION §10 items 1–6.

### V2-39 — Dialect-gap gag (`S8_ki_koila`) `[W3b/W4] [game,content] [depends: V2-38] [S]`
**GOAL:** locals say a dialect line; hero answers "কী কইলা?" (CSV `hero_whatsay_*`); a gloss pop-up shows the standard meaning; NPC then gives a lane tip.
**AC:** scenario runs on M6/M7/M8 once per run (`once:true`); gloss pop-up ≤ 1.5 s, never over HUD; falls back gracefully when no dialect row exists (shows std line, skips gloss); seeded e2e.

### V2-40a — In-engine bot harness `[W1] [test] [depends: V2-06] [M]`  ·  V2-40 — Balance port `[W1/W3] [game,test] [depends: V2-05, V2-40a] [M]`
**GOAL:** reproduce `scripts/balance/sim.mjs` skill bands in the **real engine** via `?test=1` bots (masher/novice/average/expert), and move all tunables into `src/config/balance.v2.ts` [NEW].
**AC:** (40a) bot runner executes N seeded runs headless-safe via fixed-step `window.__game.step`; (40) bands from `docs/GDD.md §7` reproduced within ±10 points, **masher = 0 %**, hazard cadence **monotonic with map difficulty** (unit test on config), assist ladder (L0–L3) implemented and measured, report written to `docs/balance/BALANCE_REPORT.md` [NEW].

### V2-41 — Phase-2 regions (post-launch; ticket when scheduled)
New maps + dialect packs for `mym`, `noa`, `bar`, `rng`, `khl` (LOCALIZATION §2), each with a native lead; same Map-Done and dialect gates.
