# docs/spec — The Spec Pack (index & read order)

> **If you are the implementing AI: this folder is your contract.** Read in the order below. If anything is unclear, missing or contradicts the code → **stop and ask** (ANTI_HALLUCINATION R12). Do not invent.
> Written 2026-11-13 by the system-architect session (judge). Spec version: **v1**.

## Read order (≈ 25 min; then build)
| # | File | What it gives you | When |
|---|---|---|---|
| 1 | `ANTI_HALLUCINATION.md` | the 12 rules + preflight + evidence format | **every session start**, and every ~30 tool calls |
| 2 | `API_FACTS.md` *(generated)* | what really exists: events, store, audio keys, textures, methods, ids, versions | before using any name |
| 3 | `../GAME_AUDIT.md` → `../GAME_PLAN_V2.md` → `../DESIGN.md` | why, the target game, design law | once, then per-ticket sections |
| 4 | `TICKET_PACKETS.md` | the build-ready brief for each crowd/voice/dialect ticket (V2-31…V2-41) + the test-hook contract | per ticket |
| 5 | `CROWD_AND_NPC_SPEC.md` | NPC model, states, reactions, mood, innocent rule, pile-on timeline, budgets, tests | crowd tickets |
| 6 | `VOICE_AND_SFX_SPEC.md` + `voice/voice_lines.csv` | voice tiers, rules, babble algorithm, recording guide, 124 lines | voice tickets |
| 7 | `MAP_SCENARIOS.md` | the 8 maps as living streets: cast, vignettes, scenarios, mob trigger, set-piece | map tickets, crowd tickets |
| 8 | `REVIEW_LOOP.md` | repeatable design review: capture protocol, rubric, gates, golden frames | every UI/art/map ticket |
| 9 | `LOCALIZATION_AND_DIALECTS.md` + `dialect/translation_sheet.csv` | regional Bangla system, native-review workflow, resolver | dialect tickets |
| 10 | `AUDIO_SOURCING.md` + `../audio/ASSET_LEDGER.csv` | where voices come from, rights, ledger, import pipeline | audio tickets, owner |
| 11 | `../GDD.md`, `../PRODUCTION_PLAN.md` | the design (fun, numbers, FTUE) and the plan to ship it | planning/judging |
| 12 | `FEATURE_BACKLOG.md` | recommended extras (prioritised) | planning only — do **not** build without a ticket |

## Mechanical checks (run them — they are the anti-hallucination guard)
```bash
node scripts/audit/gen-api-facts.mjs          # regenerate API_FACTS.md (never hand-edit)
node scripts/audit/verify-spec-refs.mjs       # every path / bus event named in specs exists or is tagged [NEW]
node scripts/voice/validate-voice.mjs         # [NEW] after V2-34: voice CSV integrity
npx tsc --noEmit && npm run lint && npm run test
```

## Notation used in all specs
- `path` — an existing file/dir (the checker verifies it). `path` `[NEW]` — to be created by the ticket. `<namespace>:<name>` `[NEW EVENT]` — to be added to `src/game/bus.ts`.
- **AC** = acceptance criterion (must be provable with a command/test/screenshot). **TOUCH / DON'T TOUCH** = allowed edit set.
- `[CONFIRM]` = owner decision pending (default stated; builder may proceed with the default).

## Who does what
- **Builder (Antigravity/any AI):** implements packets in order, one branch per ticket, produces the EVIDENCE block, runs the review loop.
- **Judge (system-architect session):** re-audits after each wave — re-runs checks, re-captures with the same seed, re-scores, updates `GAME_AUDIT.md` "Re-audit" sections, and approves spec changes.
- **Owner:** proof-reads Bangla (`voice_lines.csv`, map copy), records/approves voices, answers `[CONFIRM]` items (GAME_PLAN §12 D1–D11).
