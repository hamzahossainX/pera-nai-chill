# LOCALIZATION_AND_DIALECTS.md — Regional Bangla that actually works in the game

**Status:** SPEC v1.1 (2026-11-13) · **Owner brief:** "আঞ্চলিক ভাষাটা গেমের মধ্যে যাচ্ছে — যে অঞ্চলের ভাষা যেরকম, সেরকম প্রপারলি কাজ করে।"
**Hard honesty rule:** the architect/AI session is **not an authority on any dialect**. This spec builds the *system and the workflow*; **every dialect word shipped must be written and reviewed by native speakers.** AI may only (a) pre-fill the standard-Bangla column and (b) move text through the pipeline. (ANTI_HALLUCINATION R9 applies in full: no AI-invented dialect lines.)
**Depends on:** V2-34 (voice engine), V2-35 (CSV-driven dialogue). **Ticketed as:** V2-38 (engine), V2-39 (dialect-gap gag), V2-40 (content, owner/natives), V2-41 (phase-2 regions) — see `docs/ROADMAP.md`.

---

## 1. What "works properly" means (acceptance in plain words)

1. When you play **Cox's Bazar**, locals shout in **Chittagonian**; **Sreemangal/Haor** locals in **Sylheti**; **Old Dhaka/Sadarghat** in **Dhakaiya**. Tourists/outsiders speak standard colloquial Bangla (so the mix feels real).
2. The **text bubble and the audio match** (same line, same dialect).
3. A player who doesn't know the dialect can still follow: subtitle mode shows **Dialect / Standard / Both**; a funny **dialect-gap gag** ("কী কইলা?" → pop-up "মানে: …") teaches while entertaining.
4. If a dialect line is missing or unreviewed, the game **falls back to standard Bangla** — never to an AI guess, never to a blank.
5. Nothing mocks accents or regions. The joke is the *situation*; the dialect is celebrated (see §9 rules).

## 2. Dialect catalogue & ids

| id | Dialect | Phase | Native-review lead needed | Maps (primary) |
|---|---|---|---|---|
| `std` | Standard colloquial Bangla (current lines) | live | owner | tourists, office-goers, hero |
| `dhk` | Dhakaiya ("ঢাকাইয়া কুট্টি") | **1** | yes | M1 Mirpur (light), M2 Farmgate (light), M3 New Market (light), **M4 Old Dhaka (heavy)**, **M5 Sadarghat (heavy)** |
| `ctg` | Chittagonian (চাটগাঁইয়া) | **1** | yes | **M6 Cox's Bazar** (locals) |
| `syl` | Sylheti (সিলেটি) | **1** | yes | **M7 Sreemangal**, **M8 Haor Haat** |
| `mym` | Mymensinghia/Bhati | 2 | yes | Kishoreganj/Netrokona haor map |
| `noa` | Noakhailla | 2 | yes | Noakhali/Hatiya char map |
| `bar` | Barishali | 2 | yes | Barishal floating-guava-market map |
| `rng` | Rangpuri/Barendri (north) | 2 | yes | Rangpur/Rajshahi map |
| `khl` | Khulna/Jessore (south-west) | 2 | yes | Sundarbans/Mongla map |

Phase-2 maps are **ideas to ticket later** (V2-41), not part of the 8 launch maps.

## 3. Data model (extends `docs/spec/voice/voice_lines.csv`; schema v2)

New columns appended (default values keep current rows valid): `dialect` (default `std`), `base_id` (default = `id`), `priority` (0–4), `group` (`crowd|hero|villain|mob|announcer|police`), `review` (`none|native|second`).
- A dialect variant is its **own row**: `id = <base_id>@<dialect>` e.g. `hero_chase_01@ctg`, `base_id = hero_chase_01`, `dialect = ctg`, same `speaker`, `tone`, `trigger`, `pool`, `maxDurMs`.
- `status` lifecycle for any row: `draft → native → reviewed → recorded → approved`. **Release builds ship only `reviewed`, `recorded` or `approved` dialect rows**; `std` rows may ship as `draft` only until owner proof-read completes (release gate in V2-38 AC).
- `docs/spec/dialect/translation_sheet.csv` (generated, **already created**) is the work-sheet for native speakers: one row per base line with the standard text, English gloss, tone and max duration pre-filled; one empty column per dialect; `priority=1` rows (66 of 124) are the first batch. Natives fill their column + notes; a script (`scripts/voice/import-dialect-sheet.mjs` [NEW]) merges filled cells into new `…@<dialect>` rows with `status=native`.
- Voice clips for dialect lines are recorded **by native speakers** at `public/assets/voice/<speaker>/<id>.ogg` where `<id>` includes `@dialect`.

## 4. Runtime resolution (V2-38)

```ts
export type DialectId = "std"|"dhk"|"ctg"|"syl"|"mym"|"noa"|"bar"|"rng"|"khl";
// settings (persisted):
//   dialectMode: "auto" | DialectId        // auto = by map (default)
//   dialectSubtitle: "dialect" | "standard" | "both"   // default "both" on first run, then user's choice
function resolveLine(baseId: string, ctx: { mapDialect: DialectId; speakerIsLocal: boolean; mode: DialectMode }): LineRef {
  const want: DialectId = ctx.mode !== "auto" ? ctx.mode : (ctx.speakerIsLocal ? ctx.mapDialect : "std");
  return firstExisting([`${baseId}@${want}` /* if status shippable */, baseId /* std */]);   // never anything else
}
```
- `MapVoicePlan` (MAP_SCENARIOS §1) gains `dialect: { primary: DialectId; localShare: number /*0..1, default 0.7*/ }`; NPC archetypes gain `origin: "local" | "outsider"` (tourists, office-goers, hero = outsider → `std`/Dhaka-colloquial). Per-NPC `speakerIsLocal` is rolled once at spawn with `localShare` (seeded RNG).
- **TTS (tier T2) is `std` only** — browser TTS cannot speak dialects; in `tts` mode dialect lines fall to clip (if recorded) else babble + text. Documented in the settings tooltip.
- Bubble text shown per `dialectSubtitle`: `dialect` = variant text; `standard` = std text; `both` = variant on top (primary), std in small secondary line. Tap/click a bubble in Setup preview only (not in-run) — in run, subtitles stay passive.
- Missing/invalid dialect id → `std`; unit-tested. No network, no remote dictionaries.

## 5. The dialect-gap gag — scenario `S8_ki_koila` (V2-39)

A local NPC says a line that the hero (an outsider) clearly doesn't understand; the hero answers "কী কইলা?" (std CSV line to add), a small pop-up shows "(মানে: <std gloss>)" for 1.5 s, then the NPC points the right way and the chase continues — turning translation into a comic beat and a *helpful lane tip* (dialect lines include lane words). It reuses ScenarioRunner (CROWD §11) with `{do:"say"}` steps referencing ids; the pop-up is a new `GlossBubble` component of `BubbleSystem`. Maps: M6, M7, M8 (one occurrence per run, `once:true`).

## 6. Native-review workflow (owner process — 1 page)

1. **Recruit** one *dialect lead* per phase-1 dialect (+ a second native for review). Friends/family are fine; get consent for credit/voice use (`CREDITS.md`).
2. Send them `translation_sheet.csv` (Google Sheet/Excel). Instructions to give them: *"Rewrite each Standard line the way a real local would shout it, same meaning and tone, ≤ the max duration when spoken. Leave blank if there's no natural way. Add notes on pronunciation. Don't make it a caricature."*
3. Run `import-dialect-sheet.mjs` → rows `status=native`.
4. **Second native** reviews wording in the sheet comments → status `reviewed`.
5. Same people (or others from the region) **record** clips (VOICE §5 spec, mic technique, 3 takes) → import → `recorded`.
6. Owner listens in the game; approves → `approved`.
7. Release gate: `node scripts/voice/validate-voice.mjs --release` fails if any dialect row is `draft|native` or any shipped clip lacks a ledger row (`docs/audio/ASSET_LEDGER.csv`).

## 7. Typography & rendering checks (V2-38 AC)
- Dialect spellings use standard Bangla script (Hind Siliguri). Add a Playwright render test of a **glyph torture string** per dialect (conjuncts "ক্ষ", "জ্ঞ", "র‍্য", "ত্র", chandrabindu "ঁ", hasanta combos) at 14/18/24 px: no tofu boxes, no clipped matras.
- Bubble line-height ≥ 1.5; never truncate mid-word (wrap at spaces; max 2 lines; shrink to ≥ 14 px then ellipsis only as last resort).

## 8. Authoring templates for natives (what to capture beyond words)
Per dialect the lead fills a one-page **dialect card** (`docs/spec/dialect/CARD_<id>.md` [NEW], owner/native-authored, not AI): common pronouns, verb endings, 20 everyday words, 10 exclamations/insults-that-are-gentle, words **not to use** (offensive), pronunciation notes for voice actors, and a "never joke about" list. The builder AI treats the card as read-only truth and may **not** extend it.

## 9. Respect & safety rules (non-negotiable; review rubric criterion 7)
1. Dialect is **celebrated, not mocked**: no exaggerated spelling to imply stupidity, no stereotype scenarios, no "funny accent" as the whole joke. The humour is the chase.
2. Each region's lines are written/approved by people **from** that region.
3. No slurs or region-based insults in any dialect (native reviewers veto).
4. No political, religious or ethnic-group jokes; no real people/brands.
5. If a native reviewer says a line is offensive or inaccurate, it is removed — their call overrides the owner's and the AI's.

## 10. Acceptance (V2-38) — evidence the builder must produce
1. Unit tests: `resolveLine` chain (dialect→std), outsider→std, unknown id→std, unshippable status→std, seeded `localShare` ≈ 0.7 over 1000 rolls (±0.05).
2. `validate-voice.mjs` v2: rejects duplicate ids, `@dialect` rows whose `base_id` is missing, non-shippable rows with `--release`, `maxDurMs > 2300`.
3. Settings UI: Dialect mode + subtitle mode persisted and live-applied (reuses V2-37b settings screen).
4. E2E (seeded): on M6 with a *test fixture* dialect row (`__test@ctg`) the bubble shows the fixture text and the std gloss under `both`; with the fixture removed, falls back to std.
5. Glyph-torture render test passes (§7).
6. No dialect text appears anywhere in `src/` except via CSV-generated manifest (grep gate).
