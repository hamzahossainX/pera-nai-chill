# VOICE_AND_SFX_SPEC.md — Funny Bangladeshi voices ("তোরে মাইর দিমু!") done right

**Status:** SPEC v1.1 (2026-11-13, after adversarial review) · **Source of truth for the words:** `docs/spec/voice/voice_lines.csv` (124 draft lines, 22 speakers, 53 pools — **owner proof-reads before release**)
**Verified starting point** (`docs/spec/API_FACTS.md §4`): the game has **no sample playback and no TTS** — `src/services/audio.ts` (`audioService`) is 100 % WebAudio synth with `maxSimultaneousVoices = 6` shared by *all* SFX. Voices therefore need **new infrastructure** that must not starve SFX.
**Depends on:** nothing in W0; hooks into DialogueSystem (`src/game/systems/DialogueSystem.ts`) and the crowd system (`docs/spec/CROWD_AND_NPC_SPEC.md`).

---

## 1. How voices are actually produced — decision (owner: D8)

You asked "how will we use these voices?". Three legitimate sources; the game uses all three as **tiers with automatic fallback**, so it works on day 1 and gets better as you add recordings:

| Tier | What | Quality | Offline | Cost/risk | Status |
|---|---|---|---|---|---|
| **T1 — Real recorded clips** | You + friends record the lines in `voice_lines.csv` on a phone | **Best (funniest)** — real accents, real timing | yes (cached by the PWA) | free; **you own the rights**; ~2–3 hrs for all std lines | **Recommended primary** |
| **T2 — Browser TTS** | `speechSynthesis` with a Bengali (`bn-BD`/`bn-IN`) voice if the device has one | robotic, varies by device | device-dependent | free; zero assets; must feature-detect | opt-in toggle "Robot voices" |
| **T3 — Babble synth + text bubble** | WebAudio "formant babble" per speaker (pitch/rhythm differ) + the line shown as a bubble | cartoon gibberish (Animal-Crossing style) — still funny, always works | yes | zero assets | **Always on** — the guaranteed baseline |

**Mode semantics (`settings.voice`) — exact table:**
| mode | clip exists | no clip | TTS available |
|---|---|---|---|
| `off` | silent | silent | silent (bubbles still shown) |
| `babble` | **babble** (clips ignored) | babble | babble |
| `clips` (default once any clip is shipped) | **clip** | babble | babble |
| `tts` | **clip** | **TTS** (`std` lines only; dialect lines → babble) | TTS |
Default is `babble` until the first clip pack ships, then `clips`. **The text bubble is always shown** (accessibility, sound-off play), whatever the mode.

> **Not allowed (hard rules):** (1) copying real viral meme audio, movie/TV/song clips or celebrity soundalikes; (2) cloning any real person's voice (no voice-cloning tools on anyone's voice without their written consent); (3) using AI-generated audio unless its tool licence permits shipping in a game and the file is committed with its licence note in `CREDITS.md`. The catalogue lines are original or common idioms ("ধর ধর", "ঠান্ডা হন ভাই").

## 2. Who speaks — the cast (22 speaker ids in the CSV; all have a babble profile)

`hero`, `villain`, `bystander_pro`, `bystander_phone`, `bystander_mediator`, `aunty`, `uncle`, `rickshawala`, `boatman`, `hawker`, `conductor`, `coolie`, `jogger`, `student`, `kid`, `singer`, `guitarist`, `bargain`, `reel_maker`, `mob` (group shout, **one** voice slot), `policeman` ("Havildar Mama", deadpan), `announcer` (cricket-commentary parody).
**Group/priority columns (CSV `group`, `priority`):** `group ∈ crowd|hero|villain|mob|announcer|police`; `priority` 0 (arrest/finale: `villain_dead`, `mob_end`, police) · 1 hero/villain · 2 mob · 3 crowd reactions & announcer · 4 ambient. The engine uses these columns — it does not infer them.

Babble profiles live in `src/config/voiceProfiles.ts` [NEW] — **complete default table (all speakers)** `{pitchHz, jitter, syllableMs, f1, f2}`:
| speaker | pitch | jitter | syl ms | f1 | f2 | | speaker | pitch | jitter | syl ms | f1 | f2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| hero | 170 | .12 | 80 | 700 | 1200 | | rickshawala | 120 | .10 | 100 | 550 | 1050 |
| villain | 230 | .20 | 70 | 800 | 1500 | | boatman | 105 | .08 | 115 | 500 | 950 |
| bystander_pro | 150 | .12 | 85 | 650 | 1150 | | hawker | 180 | .22 | 75 | 720 | 1300 |
| bystander_phone | 200 | .14 | 75 | 780 | 1450 | | conductor | 160 | .25 | 70 | 700 | 1250 |
| bystander_mediator | 130 | .08 | 105 | 560 | 1050 | | coolie | 100 | .07 | 120 | 480 | 900 |
| aunty | 210 | .10 | 95 | 750 | 1400 | | jogger | 190 | .10 | 60 | 760 | 1400 |
| uncle | 110 | .08 | 110 | 500 | 1000 | | student | 240 | .15 | 70 | 850 | 1600 |
| kid | 300 | .15 | 65 | 900 | 1700 | | singer | 200 | .35 | 140 | 700 | 1250 |
| guitarist | 140 | .10 | 100 | 600 | 1100 | | bargain | 150 | .20 | 80 | 650 | 1200 |
| reel_maker | 220 | .22 | 65 | 820 | 1550 | | mob | 140 | .20 | 85 | 600 | 1150 (×3 detuned, one slot) |
| policeman | 95 | .05 | 120 | 450 | 900 | | announcer | 140 | .18 | 75 | 650 | 1300 |
T2 TTS maps speaker → `pitch`/`rate` only (first available `bn*` voice; never hard-code a voice name).

## 3. Triggers → lines (when does each line play) — selection by **trigger**, not pool

Every CSV row has a `trigger`. Call sites name the trigger: `voiceService.sayByTrigger(trigger, {speaker?, pool?})` picks a random row **with that exact trigger** (optionally filtered by speaker/pool), no immediate repeat. `sayFromPool(pool)` remains for fixed pools (hawkers, ambient). The manifest indexes lines by trigger; the coverage script (`scripts/voice/check-trigger-coverage.mjs` [NEW]) greps for `sayByTrigger("<trigger>"` for every trigger in the CSV.

| `trigger` | Fired by (**verified hook**) | Notes |
|---|---|---|
| `chase_start` | **new emit** at the end of `RunScene.create` (`crowd`/voice listens) | once per run |
| `chase_idle` | new idle timer in the voice/dialogue layer (every 8–13 s, mirroring `DialogueSystem` idle: 7000 ms initial then 8000 + rand×5000 ms) | hero/villain lines |
| `hit` | bus **`hit`** (emitted by `CombatSystem.applyHit`). **Do not use `combat:hit`** — it is declared but never emitted (see API_FACTS §2) | hero/villain/announcer/cheer |
| `combo_3`, `combo_7`, `combo_10` | bus `combo` when the count **first reaches** 3 / 7 / 10 in a combo (7 is a new tier; `COMBO_NAMES` tiers are 3/5/10/15/20/25 and are unaffected) | |
| `taunt`, `taunt_reply` | bus `player:taunt` | |
| `weapon_chappal`, `dash` | CombatSystem / V2-03 | |
| `hazard_hit` | `SpawnSystem` → `Chaser.stumble()` path (and V2-05 hazards) | |
| `hazard_telegraph` | hazard system telegraph start | rickshawala/coolie/boatman |
| `trip` | `Villain.trip` | |
| `villain_dead`, `mob_start`, `mob`, `mob_end` | bus `villain:dead`; `crowd:mobStart`/`crowd:mobEnd` [NEW EVENT] | |
| `react_pro/neutral/against/any`, `roof_react`, `dispute`, `wrong_person`, `step_block`, `bump`, `innocent_hit`, `heckle`, `dialect_gap`, `wake`, `pole_bonk` | crowd reactions & scenarios (`crowd:*` events, ScenarioRunner) | |
| `lane_tip_top/mid/bot` | a helpful `pro` NPC; trigger chosen from the villain's **current lane** | replaces left/right tips |
| `ambient` | ambient NPC activities | priority 4 |
| `gap_far`, `event_loadshedding` | gap system (V2-04) / bus `event:started` | announcer |
| `villain_flee`, … other pool-only rows | reached through their `trigger` as in the CSV | the coverage script lists any row whose trigger has no call site |

## 4. Playback rules (this is what makes it *funny* instead of *noisy*)

| Rule | Value |
|---|---|
| Voice channel | **separate** `GainNode` chain (`voiceBus`); does **not** use `audioService.play()` and does **not** consume its 6 synth slots |
| Concurrency | **3 voiced lines total**, of which **≤ 2 crowd-group**; a mob chorus counts as **1** slot; priorities (CSV `priority`) preempt the lowest running line |
| Rate limits | **crowd group only** (not hero/villain/mob/police/announcer): ≥ 1.2 s between crowd lines, ≤ 4 per 10 s; announcer ≤ 1 per 8 s |
| Repeat | same line id not within the last 20 plays; same speaker cooldown 2.5 s |
| Ducking | **ref-counted**: `audioService.duck(id)` / `release(id)` (V2-34 changes `duckBgm(bool)` into a counter-backed API while keeping `duckBgm(bool)` as a thin wrapper). Voice P0–P2 take a duck handle and release it +150 ms after the line ends. (`duckBgm` is also used by the Chappal Storm and `EventSystem`; without ref-counting a voice release would un-duck mid-event.) |
| Stereo | pan = `(npc.x − 640)/640 × 0.8`; distance attenuation by layer: balcony 0.55, sidewalk 0.7, road 1.0 |
| Slow-mo | voice `rate` follows `scene.time.timeScale` when it is < 1 (finisher 0.25 → clamp rate ≥ 0.6, i.e. pitch drops but stays intelligible) |
| Mute/volume | respects `audioService.isMute()`; new settings `voice`, `voiceVolume`, `subtitleSize`, `calmMode`, `dialectMode`, `dialectSubtitle` — **persisted** under a versioned key (`pnc.settings.v1`, try/catch) by V2-34 |
| Autoplay | unlock via the existing tap-to-start; `audioService.getContext()` returns `AudioContext \| null` (null before unlock) and **every voice call is a silent no-op while it is null** |

## 5. Clip asset specification (for the recording session)

| Property | Spec |
|---|---|
| Path | `public/assets/voice/<speaker>/<lineId>.ogg` (+ `.mp3` fallback for Safari) |
| Format | mono, 44.1 kHz, OGG Vorbis ~48 kbps (≈ 6 KB/s); MP3 64 kbps fallback |
| Length | ≤ the CSV `maxDurMs` (hard cap 2.3 s); trim leading/trailing silence to ≤ 80 ms |
| Level | peak ≤ −1 dBFS, loudness roughly −18 LUFS, **no clipping**; same speaker same mic distance |
| Budget | initial bundle ≤ 3 MB; per-map lazy pack ≤ 1.5 MB; total ≤ 15 MB |
| Lazy loading | `voice.preload(packId)` on map select. **Packs:** `scripts/voice/build-voice-manifest.mjs` [NEW] emits `{ packs: { core: [lineIds], <mapId>: [lineIds] }, sizes }` where a map pack = lines whose pools appear in that map's `voice.hawkerPools/ambientPools` + its scenario lines; `core` = hero/villain/police/announcer/mob + shared crowd lines. Cached by `public/sw.js` (cache-first for `/assets/voice/`). The script fails if a pack exceeds its size budget. |
| Naming | exactly the CSV `id`; after adding a clip set CSV `clip` column to the relative path and `status` to `recorded` |
| Validation | `node scripts/voice/validate-voice.mjs` [NEW]: every CSV row has bn text; `maxDurMs` ≤ 2300; any `clip` file exists and is ≤ 120 KB; no duplicate ids; no id referenced in code that is absent from CSV |

### Recording guide for the owner (so you can do T1 with just phones)
1. Pick 6–8 friends/family for voices: 2 loud "uncle" types, 1 "aunty", 1 young guy (hero), 1 whiny guy (villain), 1 deep-voiced "Havildar", 1 sing-song hawker, plus yourself.
2. Quiet room, phone ~20 cm from mouth, record each line **3 takes** with the tone in the CSV (`tone` column), voice-memo format is fine.
3. Send the files; the build session runs the import script [NEW] `scripts/voice/import-voice.mjs` to normalise (needs `ffmpeg` on the dev machine) → `.ogg/.mp3`, trims silence, updates the CSV.
4. People recorded must **agree** to have their voice in a public game; keep a one-line consent note per speaker in `CREDITS.md`.
5. Dialects: Chittagonian / Sylheti / Dhakaiya lines need a **native speaker** for both wording and delivery (see FEATURE_BACKLOG F-09) — don't let an AI invent dialect.

## 6. T3 babble synth (guaranteed baseline) — exact algorithm

New file `src/services/voice.ts` [NEW] with `voiceService` (singleton like `audioService`). `say(lineId, {speaker, pan, priority})`:
1. Look up the line; compute `syllables = clamp(round(bn.length / 3), 3, 14)`.
2. For each syllable *i*: start a short **sawtooth → bandpass (two formants f1,f2) → gain envelope** blip of `syllableMs` (default 90 ms ±25 %), pitch `pitchHz × (1 ± jitter)` plus a gentle phrase contour (rise at `?`, fall at `!`/`।`).
3. Route through `voiceBus` (StereoPanner → gain → destination). Use the same `AudioContext` as `audioService` via `audioService.getContext()` [NEW] (`AudioContext | null`) — do **not** create a second context.
4. Speaker profiles: the **complete table in §2** (every speaker has one; `mob` = 3 detuned voices in one slot).
5. Tunables live in `src/config/voiceProfiles.ts` [NEW]; **no magic numbers in `voice.ts`**.
> Tests: with a fake `AudioContext`, assert syllable count, pitch contour direction, that `say` never exceeds 3 concurrent voices, and cooldown rules.

## 7. Subtitle/bubble presentation

- Bubble = existing `DialogueSystem.showBubble(target, line)` for hero/villain (verified). Crowd lines use a new lightweight `BubbleSystem` [NEW] (pooled text sprites, max 4 visible, Hind Siliguri, ≥ 18 px logical, Bangla primary, English secondary line only in the *Setup* "bilingual" setting).
- Never cover the lanes' feet or the HUD; place above the speaker's head, clamp inside x∈[60,1220].
- Comic words ("ঠাস!", "ধুম!") remain `FxSystem.spawnFloatingText` (verified).

## 8. SFX additions that go with the crowd (all synth — extend `audioService`)

**One-shots** (≤ 400 ms, obey `maxSimultaneousVoices`): `crowd-gasp`, `crowd-cheer`, `crowd-ooh`, `phone-shutter`, `cup-clink`, `kick-bat-knock`, `bonk-cartoon`, `marble-click`, `police-whistle-long`.
**Loops** (seamless 2–4 s): `crowd-murmur-loop`, `strum-loop`, `hum-loop`, `dust-cloud-loop`, `footfalls-loop`, `snore-loop`, `beat-loop`. Loops **do not use the 6 one-shot slots**: V2-34 adds `audioService.startLoop(name, opts): { stop(): void }` with its own bookkeeping and a **hard cap of 2 simultaneous loops** (extra requests are ignored/queued by priority). Map sound beds (MAP_SCENARIOS §4) are loops owned by V2-17/V2-18…22 via `startLoop`.
Tag new keys `[NEW]` in the spec, regenerate `API_FACTS.md`. The guitar/sing loops are **original** pentatonic motifs (no copyrighted melodies).

## 9. Accessibility & content safety

- Settings: `Voice: Off / Babble / Clips / Robot`, `Voice volume`, `Subtitles size S/M/L`, `Calm mode` (reduces crowd density, mutes mob shouts to a single "ঠাস!" — see FEATURE_BACKLOG F-12).
- Lines are PG: mild teasing only. **Banned:** slurs, religious/ethnic/political jokes, sexual content, real-person names, real brands. Mild idioms ("মাইর দিমু") are okay in slapstick context.
- Violence text is onomatopoeia and slapstick only; the mob always ends with the police line `pol_law_01` (law-of-the-land punchline).

## 10. Acceptance (evidence required)

1. `node scripts/voice/validate-voice.mjs` exits 0.
2. Unit tests: resolution order (clip → tts → babble), rate/priority/cooldown rules, never > 3 concurrent, never starves SFX (play 6 synth SFX while voices run → all 6 audible/not dropped).
3. Manual: toggle each mode in settings; with sound muted the bubbles still show every line; `?test=1` exposes `window.__game.debug.sayLine(id)` — registered by V2-34 through `window.__game.debug.register(name, fn)` (the registry itself is created by V2-01; V2-34 may touch only the one registration line in the hook file).
4. Perf: voice playback adds < 1 ms/frame (profile); first-run bundle growth ≤ 3 MB.
