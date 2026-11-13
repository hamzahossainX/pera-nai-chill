# ANTI_HALLUCINATION.md — The rules that stop an AI builder from inventing things

**Audience:** the implementing AI (Antigravity / Gemini / any agent). **Why this exists:** agents fail on this repo in four predictable ways — (1) inventing APIs, files, texture keys or events that don't exist, (2) using Phaser **3** habits on Phaser **4**, (3) claiming "done/works" without running anything, (4) silently "improving" the spec. This file turns each failure into a rule with a **mechanical check**.
**Owner:** `/system-architect` session (judge). The builder may *append* to §9 "Builder notes" but may not weaken any rule.

---

## 1. Ground-truth hierarchy (highest wins)

1. **The code on disk** and the output of commands you just ran.
2. **`docs/spec/API_FACTS.md`** — *generated* inventory of events, store keys, audio keys, texture keys, public methods, ids, versions. Regenerate: `node scripts/audit/gen-api-facts.mjs`.
3. **The specs** (`docs/spec/*.md`, `docs/GAME_PLAN_V2.md`, `docs/DESIGN.md`, `docs/ROADMAP.md` ticket).
4. **First-party library docs shipped in `node_modules`:** Phaser 4 → `node_modules/phaser/skills/<topic>/SKILL.md` (28 topic guides incl. `v3-to-v4-migration`, `v4-new-features`, `scenes`, `tweens`, `scale-and-responsive`, `audio-and-sound`, `loading-assets`, `particles`, `time-and-timers`, `events-system`) and `node_modules/phaser/types/phaser.d.ts`; Next.js → `node_modules/next/dist/docs/` (CLAUDE.md requires this before any Next code).
5. **Your own memory of how libraries work — LAST and never sufficient.** If memory and (1–4) disagree, memory loses.

## 2. The twelve rules

| # | Rule | Mechanical check |
|---|---|---|
| R1 | **Name-check before use.** Any function, field, event, store key, sound key, texture key, config export you did not read in this session must be found via `grep`/`API_FACTS.md` before you call it. Not found ⇒ either it is tagged `[NEW]` in the spec (create it exactly as specified) or **STOP and ask**. | `npx tsc --noEmit` (types) + `node scripts/audit/verify-spec-refs.mjs` (docs) |
| R2 | **Phaser 4 ≠ Phaser 3.** Before touching a Phaser API family (tweens, scale, input, audio, particles, textures, timers, events, camera, filters), open the matching `node_modules/phaser/skills/<topic>/SKILL.md`, and read `v3-to-v4-migration` once per session. Never paste a Phaser 3 snippet from memory. | cite the SKILL.md path you read in the ticket evidence |
| R3 | **No invented assets.** Never reference a texture/audio/SVG key that is not generated in `BootScene`, preloaded in `PreloadScene`, or listed in the ticket as `[NEW]`. New art goes through the asset manifest; a stand-in must be named `placeholder-*` and render with a visible magenta border in `?test=1` so it can't ship unnoticed. | `API_FACTS.md §5` diff in the PR |
| R4 | **Spec lock.** Specs are read-only for you. If the spec is wrong, ambiguous or contradicts the code: write a `SPEC_CHANGE_REQUEST` block in your ticket notes (what, why, evidence, proposed text) and **wait for the judge**. You may append to §9 notes and to ticket "Implementation notes". | `git diff --stat docs/spec docs/GAME_PLAN_V2.md docs/DESIGN.md` must be empty except appended notes |
| R5 | **Evidence or it didn't happen.** "Works/passes/fixed" requires the command and its real output (or screenshot path) in the ticket's `EVIDENCE` block (§5). If you could not run it, write `NOT VERIFIED` and why. | judge re-runs any command |
| R6 | **One ticket, one branch, small diffs.** Branch `t-v2-NN-slug`; ≤ ~400 changed lines per commit; no drive-by refactors, renames, formatting sweeps or dependency bumps. | `git diff --stat` reviewed per commit |
| R7 | **No new dependencies.** Not an npm package, CDN script or font, without asking. (Playwright already provides screenshot diffs; Vitest provides unit tests; Zod validates data.) | `git diff package.json package-lock.json` empty |
| R8 | **Numbers live in config.** Every tunable (speeds, ranges, cooldowns, counts, volumes) is a named constant in `src/config/*` initialised to the spec's value. If the spec gives no number, choose the simplest, put it in config, and log it in `docs/DECISIONS.md` as a defaulted value. | grep for numeric literals in new systems (review) |
| R9 | **Words come from data.** Bangla/English UI text, voice lines, ticker and barks come from `src/config/*` or `docs/spec/voice/voice_lines.csv`. Do not write, translate or "improve" Bangla yourself; if a line is missing add a `draft` row to the CSV and flag it for the owner. | `node scripts/voice/validate-voice.mjs` [NEW] |
| R10 | **Determinism for tests.** Gameplay randomness goes through the seeded `src/lib/rng.ts` [NEW] created by **V2-01** (wraps Phaser's seedable `Phaser.Math.RND`; seed from `?seed=`); V2-01 migrates `Math.random` in SpawnSystem/Villain/DialogueSystem/CombatSystem; purely cosmetic randomness (weather particles) may stay but must be listed in the ticket. Tests never depend on wall-clock FPS (headless GL is ~1.5 fps here). | `?test=1&seed=N` reproduces scenarios |
| R11 | **Don't touch what isn't yours.** Each ticket lists `TOUCH` and `DON'T TOUCH` paths. Editing outside `TOUCH` needs judge approval. Shared contracts (`layout.ts`, `EntityMotion`, `MapDefinition`, `registry.ts`, `bus.ts` types, `useGameStore` shape) are changed only by their owning ticket. | `git diff --name-only` ⊆ TOUCH |
| R12 | **Stop-and-ask triggers** (don't guess): spec ambiguity; spec vs code conflict; need for a new dependency/asset/permission; an acceptance criterion you can't test; two failed attempts at the same bug; any thought that starts with "probably/should be/I assume". Post the question in the ticket with 2–3 options and your recommendation. | — |

## 3. Preflight checklist (run at the start of EVERY session and after every ~30 tool calls)

```bash
git status --short && git branch --show-current            # clean? on your ticket branch?
node scripts/audit/gen-api-facts.mjs && git diff --stat docs/spec/API_FACTS.md   # facts fresh; unexpected diffs = someone changed code
node scripts/audit/verify-spec-refs.mjs                     # every spec reference exists or is [NEW]
npx tsc --noEmit && npm run lint && npm run test            # baseline green before you touch anything
```
Then re-read: the ticket packet, `docs/spec/README.md`, the spec section(s) named in the packet. **Context drift is the #1 cause of hallucination — re-read instead of remembering.**

## 4. Known repo-specific pitfalls (verified facts; do not "rediscover")

1. `BALANCE.LANES_Y = [430,485,540]` today; V2 moves lanes to layout.ts `[450,515,580]` — never hard-code Y.
2. Entities' `x` is currently written by tweens in `CharacterRig.triggerHitStun/triggerDead` (**audit C-01**) — until `EntityMotion` exists, don't add more direct writes.
3. `audioService.play()` is synth-only and capped at 6 simultaneous voices; there is no sample playback or TTS yet (API_FACTS §4).
4. `currentMapId` is a closed 3-value union in the store; adding maps requires V2-16 first.
5. `DialogueSystem` only serves villain/chaser bubbles (`"villain" | "chaser"`); crowd lines need the new `BubbleSystem`.
6. `RunScene.handleVillainDead` already does slow-mo, policeman sprite, stamp, coin shower — reuse for the mob finale; don't rebuild.
7. Headless Chromium here is software-GL (~1.5 fps) — Phaser time-based logic can't be validated wall-clock there; use `?test=1` + fixed-step hook or a GPU Chrome.
8. `docs/INVENTORY.md` and `docs/spec/API_FACTS.md` are **generated** — never hand-edit.
9. **Declared-but-never-emitted bus events** (see API_FACTS §2 ⚠): `combat:hit`, `villain:damaged`, `villain:laneChange`, `game:restart`, `debug:spawnPickup` have no emitter. `DialogueSystem` listens to `combat:hit`, so **hit banter currently never fires** — subscribe to the real `hit` event instead (V2-35).
9b. React 19 StrictMode mounts effects twice in dev: guard Phaser init/teardown (see `GameHost.tsx`) and any new bus subscriptions (`on` ⇄ `off` pairs in destroy).
10. `localStorage` access must be wrapped in try/catch (existing pattern in `RunScene`).

## 5. Evidence block (paste at the end of every ticket — judge rejects tickets without it)

```
### EVIDENCE — V2-NN
Branch/commit: t-v2-NN-slug @ <sha>
Read before coding: <list: files + node_modules/phaser/skills/... you actually opened>
Gates:  tsc ✅/❌ · lint ✅/❌ · test ✅ (N passed) · build ✅/❌ · e2e ✅/❌   [paste last 5 lines of each]
AC → proof:
  AC1 "<text>" → <command + output | test name | screenshot path>
  AC2 ...
Screenshots (UI tickets): docs/screens/v2/NN/round-<n>/{1280x720,844x390,1024x768}.png  (final round copied to docs/screens/v2/NN/final/)
API facts diff: <paste `git diff --stat docs/spec/API_FACTS.md`>  (only intended additions)
Not verified: <anything you could not run, and why>
Spec change requests: <none | list>
Defaulted numbers logged in DECISIONS: <none | ids>
```

## 6. Review-loop obligation
UI/visual tickets must complete the loop in `docs/spec/REVIEW_LOOP.md` (min 2 rounds: build → self-review → fix → re-shoot). A ticket that skips it is `NOT VISUALLY VERIFIED` and cannot be checked off.

## 7. What to do when you're wrong
Say so in the ticket ("I referenced X; it doesn't exist; corrected"), fix it, and add a one-line lesson to §9. Being corrected by a check is the system working — hiding it is the only failure.

## 8. Prompts the judge will use to audit you (so you can self-run them)
1. "List every identifier you used that is not in `API_FACTS.md` and show where it is defined or tagged `[NEW]`."
2. "Show the command output proving AC-k."
3. "Which Phaser SKILL.md files did you read, and which Phaser 3 habits did you avoid?"
4. "Show `git diff --name-only`; which of these paths is outside TOUCH?"
5. "What number did you choose that the spec didn't give?"

## 9. Builder notes (append-only; date + one line each)
_(empty)_
