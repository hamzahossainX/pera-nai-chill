# AUDIO_SOURCING.md — Where the voices actually come from (and the rules for shipping them)

**Status:** v1 (2026-11-13). Answers the owner's question: *"Can you generate the funny voices, or will I download audio and you only wire it up?"*

## 1. The direct answer

| Question | Answer (verified 2026-11-13) |
|---|---|
| Can the architect/builder AI **generate audio itself**? | **No.** Claude (and the builder AI) produce text/code, not sound. The game's own *synthesised* audio (WebAudio beeps, slaps, babble) is code and is fine; **real human-sounding Bangla voices are not something I can create.** |
| Is there a generator connected to this session? | **Partly.** The connected Artlist account exposes text-to-speech models (MiniMax Speech 02 HD, Cartesia Sonic 2, ElevenLabs Multilingual v2, ElevenLabs Eleven v3, Eleven v4). A search for Bengali library voices returned **none**. The account shows **no purchasable credits** and **3 free generations remaining**. Nothing has been generated or spent. |
| Would that be good enough? | Not for production: (a) 3 free generations ≈ one tiny test; (b) no confirmed Bengali voices, and **no commercial TTS does Chittagonian/Sylheti/Dhakaiya properly** — dialects need native speakers; (c) licence terms for shipping generated audio in a game must be checked; (d) quality of Bengali TTS in comedic delivery is uncertain. |
| So what do we do? | **Recommended: you (and friends/relatives) record the lines; the builder AI wires them in.** The pipeline, file formats, validators, fallback voices and ledger are specified so that the game works *before* any recording exists. |

I can run a **3-line Bengali TTS test** on the free generations if you say yes — purely to judge quality, not for shipping. (I won't do it without your OK.)

## 2. Sourcing options ranked

| # | Option | Quality | Cost | Dialects | Rights | Verdict |
|---|---|---|---|---|---|---|
| A | **Owner + friends record** (phone mic) per VOICE_AND_SFX_SPEC §5 | ★★★★★ (real accents, comic timing) | free, ~2 h for std lines; +~1 h per dialect | ✅ natives | you own it; speaker consent in `CREDITS.md` | **Do this** |
| B | **Hire/crowd-source voice actors** (local students, theatre groups, Fiverr/Upwork Bangla artists) | ★★★★★ | small | ✅ if native | work-for-hire contract/licence for game use | good for dialect packs |
| C | **Commercial TTS** (ElevenLabs/Cartesia/MiniMax…) | ★★½ std Bangla, ✗ dialect | subscription | ❌ | check commercial-use terms per tool | only a *std placeholder* tier; not for dialects |
| D | **Browser `speechSynthesis`** (device voice) | ★★ | free | ❌ | n/a | runtime opt-in tier T2 (already specced) |
| E | **WebAudio babble synth** | ★★★ for charm, ✗ for words | free | n/a | ours | guaranteed baseline T3 (already specced) |
| F | **Voice cloning of a real person** | — | — | — | **forbidden** unless that person explicitly consents in writing; never for public figures | ✗ |
| G | **Ripping viral/meme/movie audio** | — | — | — | **forbidden** (copyright & personality rights) | ✗ |

SFX that are not synthesised (if ever needed): only **CC0 / explicitly game-licensed** files, each logged in the ledger with its source URL and licence text; prefer extending the existing synth.

## 3. The ledger — nothing ships without a row

`docs/audio/ASSET_LEDGER.csv` (**template created**): `asset_path, type (voice|sfx|music), source (recorded|synth|cc0|licensed|tts), author_or_speaker, licence, proof_url_or_ref, consent_ref, date_added, status`.
- Every file under `public/assets/voice/` [NEW] and any non-synth sound must have a row; the release gate (`validate-voice.mjs --release`, V2-35) fails otherwise.
- `consent_ref` points to a `CREDITS.md` speaker entry (name or alias, region, date, "agrees to game use").
- Generated (TTS) audio is `source=tts` with the tool name + plan + date; allowed only if the plan's terms permit commercial game distribution (owner verifies).

## 4. Recording & import pipeline (what the builder must implement — V2-35)

1. Owner sends raw recordings named by line id (or a sheet mapping takes → ids).
2. `scripts/voice/import-voice.mjs` [NEW] (needs `ffmpeg` on the dev machine): trims silence to ≤ 80 ms, loudness-normalises to ≈ −18 LUFS with peak ≤ −1 dBFS, mono, 44.1 kHz, writes `.ogg` (Vorbis ~48 kbps) + `.mp3` fallback, rejects > `maxDurMs`, updates the CSV `clip`/`status`, appends a ledger row (prompting for speaker alias/consent ref).
3. `scripts/voice/build-voice-manifest.mjs` [NEW] regenerates the typed manifest and **pack index**: `{ packs: { core: [ids], <mapId>: [ids] }, sizes }` so `voice.preload(packId)` knows exactly which files to fetch.
4. `public/sw.js` caches `/assets/voice/` cache-first; budgets (VOICE §5): initial ≤ 3 MB, per-map ≤ 1.5 MB, total ≤ 15 MB. The manifest script **fails** if a pack exceeds its budget.
5. Runtime fallback is automatic: missing/404 clip → TTS (if enabled and `std`) → babble. The game never errors for a missing voice.

## 5. Owner checklist (what only you can do)
- [ ] Proof-read `docs/spec/voice/voice_lines.csv` (124 draft std lines) — fix/remove anything off.
- [ ] Choose 6–8 voices (loud uncle, aunty, young hero, whiny villain, deep "Havildar", sing-song hawker, announcer, +you); get consent.
- [ ] Record the 66 **priority-1** lines first (flagged in `docs/spec/dialect/translation_sheet.csv`), then the rest.
- [ ] Recruit a native lead + reviewer per phase-1 dialect (Dhakaiya, Chittagonian, Sylheti) — see LOCALIZATION_AND_DIALECTS §6.
- [ ] Decide whether to authorise the 3-line TTS quality test (no spend).
