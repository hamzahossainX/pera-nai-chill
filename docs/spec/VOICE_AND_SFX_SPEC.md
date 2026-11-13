# VOICE_AND_SFX_SPEC.md — Funny Bangladeshi voices ("তোরে মাইর দিমু!") done right

**Status:** SPEC v1 (2026-11-13) · **Source of truth for the words:** `docs/spec/voice/voice_lines.csv` (116 draft lines, 21 speakers, 48 pools — **owner proof-reads before release**)
**Verified starting point** (`docs/spec/API_FACTS.md §4`): the game has **no sample playback and no TTS** — `src/services/audio.ts` (`audioService`) is 100 % WebAudio synth with `maxSimultaneousVoices = 6` shared by *all* SFX. Voices therefore need **new infrastructure** that must not starve SFX.
**Depends on:** nothing in W0; hooks into DialogueSystem (`src/game/systems/DialogueSystem.ts`) and the crowd system (`docs/spec/CROWD_AND_NPC_SPEC.md`).

---

## 1. How voices are actually produced — decision (owner: D8)

You asked "how will we use these voices?". Three legitimate sources; the game uses all three as **tiers with automatic fallback**, so it works on day 1 and gets better as you add recordings:

| Tier | What | Quality | Offline | Cost/risk | Status |
|---|---|---|---|---|---|
| **T1 — Real recorded clips** | You + friends record the lines in `voice_lines.csv` on a phone | **Best (funniest)** — real accents, real timing | yes (cached by the PWA) | free; **you own the rights**; ~2 hrs for 108 lines | **Recommended primary** |
| **T2 — Browser TTS** | `speechSynthesis` with a Bengali (`bn-BD`/`bn-IN`) voice if the device has one | robotic, varies by device | device-dependent | free; zero assets; must feature-detect | opt-in toggle "Robot voices" |
| **T3 — Babble synth + text bubble** | WebAudio "formant babble" per speaker (pitch/rhythm differ) + the line shown as a bubble | cartoon gibberish (Animal-Crossing style) — still funny, always works | yes | zero assets | **Always on** — the guaranteed baseline |

**Resolution order per line:** `T1 clip exists` → play it; else if `settings.voice === "tts"` and a Bengali voice exists → T2; else → T3. **The text bubble is always shown** (accessibility + sound-off play), regardless of tier.

> **Not allowed (hard rules):** (1) copying real viral meme audio, movie/TV/song clips or celebrity soundalikes; (2) cloning any real person's voice (no voice-cloning tools on anyone's voice without their written consent); (3) using AI-generated audio unless its tool licence permits shipping in a game and the file is committed with its licence note in `CREDITS.md`. The catalogue lines are original or common idioms ("ধর ধর", "ঠান্ডা হন ভাই").

## 2. Who speaks — the cast (speaker ids used in the CSV)

`hero` (the chaser, "আম-জনতা", loud, scrappy) · `villain` (whiny, comic panic) · `bystander_pro` · `bystander_phone` · `bystander_mediator` · `aunty` · `uncle` · `rickshawala` · `hawker` · `jogger` · `student` · `kid` · `singer` · `guitarist` · `mob` (group shout) · `policeman` (deadpan "Havildar Mama") · `announcer` (cricket-commentary parody).

Each speaker has a **babble profile** in `src/config/voiceProfiles.ts` [NEW]: `{ pitchHz, pitchJitter, syllableMs, formants:[f1,f2], vibrato, gain }` (defaults in §6). T2 TTS maps speaker → `pitch`/`rate` (never `voice` hard-coded; pick the first available `bn*` voice).

## 3. Triggers → pools (when does each line play)

Lines carry a `trigger` and `pool` in the CSV. The engine picks a random line from the pool *without immediate repeat* (same pattern `DialogueSystem.triggerLine` uses). Mapping to existing + new events:

| `trigger` | Fired by | Existing hook (verified) | New hook |
|---|---|---|---|
| `chase_start`, `chase_idle` | run start; every 6–10 s idle | `RunScene.create`, `DialogueSystem` idle timer | — |
| `hit`, `combo_N` | each landed hit; combo tiers | bus `hit`, `combo` | — |
| `taunt`, `taunt_reply` | player taunt | bus `player:taunt` | — |
| `weapon_chappal`, `dash`, `hazard_hit`, `trip` | CombatSystem / EntityMotion | `CombatSystem`, `Villain.trip` | `dash` from V2-03 |
| `villain_dead`, `mob`, `mob_end` | finisher flow | bus `villain:dead` | `crowd:mobStart` [NEW EVENT], `crowd:mobEnd` [NEW EVENT] |
| `react_pro/neutral/against/any`, `dispute`, `wrong_person`, `step_block` | crowd scenarios | — | `crowd:react` [NEW EVENT], `crowd:dispute` [NEW EVENT] |
| `innocent_hit` | hit a bystander | — | `crowd:innocentHit` [NEW EVENT] |
| `ambient`, `pole_bonk`, `wake` | ambient NPC activities | — | scenario runner |
| `gap_far`, `event_loadshedding`, … | gap system / events | bus `event:started` | gap events from V2-04 |

## 4. Playback rules (this is what makes it *funny* instead of *noisy*)

| Rule | Value |
|---|---|
| Voice channel | **separate** `GainNode` chain (`voiceBus`) from SFX; does **not** use `audioService.play()` and does **not** consume its 6 synth voices |
| Concurrency | max **3** simultaneous voiced lines; priority P0 villain-scream/arrest > P1 hero > P2 mob > P3 bystander reactions > P4 ambient |
| Global rate | ≥ 1.2 s between *crowd* lines; ≤ 4 crowd lines / 10 s; hero & villain may overlap crowd |
| Repeat | same line id not within last 20 plays; same speaker cooldown 2.5 s |
| Ducking | while a P0–P2 line plays, call `audioService.duckBgm(true)` (verified existing method), release on end (+150 ms) |
| Stereo | pan = `(npc.x − 640)/640 × 0.8`; distance attenuation by layer: balcony 0.55, sidewalk 0.7, road 1.0 |
| Ultimate / slow-mo | pitch playback rate × timeScale (0.4–0.6) so voices drop with slow-mo (cheap, funny) |
| Mute/volume | respects `settings` mute (`audioService.isMute()`); new settings `voice: "off"\|"babble"\|"clips"\|"tts"` and `voiceVolume` [NEW] |
| Autoplay | unlock via the existing tap-to-start (loading screen) — do **not** add a second unlock |

## 5. Clip asset specification (for the recording session)

| Property | Spec |
|---|---|
| Path | `public/assets/voice/<speaker>/<lineId>.ogg` (+ `.mp3` fallback for Safari) |
| Format | mono, 44.1 kHz, OGG Vorbis ~48 kbps (≈ 6 KB/s); MP3 64 kbps fallback |
| Length | ≤ the CSV `maxDurMs` (hard cap 2.3 s); trim leading/trailing silence to ≤ 80 ms |
| Level | peak ≤ −1 dBFS, loudness roughly −18 LUFS, **no clipping**; same speaker same mic distance |
| Budget | initial bundle ≤ 3 MB; per-map lazy pack ≤ 1.5 MB; total ≤ 15 MB |
| Lazy loading | `voice.preload(packId)` on map select; cached by `public/sw.js` (cache-first for `/assets/voice/`) |
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
3. Route through `voiceBus` (StereoPanner → gain → destination). Use the same `AudioContext` as `audioService` (expose `audioService.getContext()` [NEW] — do **not** create a second context).
4. Each speaker profile (defaults): hero `{pitch:170, jitter:.12, syl:80, f:[700,1200]}` · villain `{pitch:230, jitter:.2, syl:70, f:[800,1500]}` · uncle `{pitch:110, jitter:.08, syl:110, f:[500,1000]}` · aunty `{pitch:210, jitter:.1, syl:95, f:[750,1400]}` · kid `{pitch:300, jitter:.15, syl:65, f:[900,1700]}` · policeman `{pitch:95, jitter:.05, syl:120, f:[450,900]}` · announcer `{pitch:140, jitter:.18, syl:75, f:[650,1300]}` (rapid, rising) · mob = 3 detuned voices.
5. Tunables live in `src/config/voiceProfiles.ts` [NEW]; **no magic numbers in `voice.ts`**.
> Tests: with a fake `AudioContext`, assert syllable count, pitch contour direction, that `say` never exceeds 3 concurrent voices, and cooldown rules.

## 7. Subtitle/bubble presentation

- Bubble = existing `DialogueSystem.showBubble(target, line)` for hero/villain (verified). Crowd lines use a new lightweight `BubbleSystem` [NEW] (pooled text sprites, max 4 visible, Hind Siliguri, ≥ 18 px logical, Bangla primary, English secondary line only in the *Setup* "bilingual" setting).
- Never cover the lanes' feet or the HUD; place above the speaker's head, clamp inside x∈[60,1220].
- Comic words ("ঠাস!", "ধুম!") remain `FxSystem.spawnFloatingText` (verified).

## 8. SFX additions that go with the crowd (all synth — extend `audioService` cases)

Add these keys to the `switch(name)` in `src/services/audio.ts` (tagged `[NEW]`, regenerate `API_FACTS.md` afterwards): `crowd-gasp`, `crowd-cheer`, `crowd-ooh`, `crowd-murmur-loop`, `phone-shutter`, `cup-clink`, `strum-loop`, `hum-loop`, `kick-bat-knock`, `bonk-cartoon`, `dust-cloud-loop`, `police-whistle-long`. Each synth ≤ 400 ms (loops: seamless 2–4 s) and obeys `maxSimultaneousVoices`. The **guitar/sing loops are original** pentatonic motifs (no copyrighted melodies).

## 9. Accessibility & content safety

- Settings: `Voice: Off / Babble / Clips / Robot`, `Voice volume`, `Subtitles size S/M/L`, `Calm mode` (reduces crowd density, mutes mob shouts to a single "ঠাস!" — see FEATURE_BACKLOG F-12).
- Lines are PG: mild teasing only. **Banned:** slurs, religious/ethnic/political jokes, sexual content, real-person names, real brands. Mild idioms ("মাইর দিমু") are okay in slapstick context.
- Violence text is onomatopoeia and slapstick only; the mob always ends with the police line `pol_law_01` (law-of-the-land punchline).

## 10. Acceptance (evidence required)

1. `node scripts/voice/validate-voice.mjs` exits 0.
2. Unit tests: resolution order (clip → tts → babble), rate/priority/cooldown rules, never > 3 concurrent, never starves SFX (play 6 synth SFX while voices run → all 6 audible/not dropped).
3. Manual: toggle each mode in settings; with sound muted the bubbles still show every line; `?test=1` exposes `window.__game.debug.sayLine(id)`.
4. Perf: voice playback adds < 1 ms/frame (profile); first-run bundle growth ≤ 3 MB.
