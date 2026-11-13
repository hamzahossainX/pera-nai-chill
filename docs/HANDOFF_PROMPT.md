# HANDOFF_PROMPT.md — paste the block below into a fresh AI session

> Written 2026-11-13 by the system-architect session. The session that reads this is the **implementer**; the original architect session acts as **judge** (re-audits after each wave). Everything the implementer needs is in the repo — nothing lives only in chat.

---

## ▼▼▼ COPY FROM HERE ▼▼▼

You are the implementing engineer for **Pera Nai Chill (Dhaka Rage Runner)** — a Next.js 16 + Phaser 4 + Zustand satirical 2D chase game, repo root = your working directory. A senior architect has audited the game and written the fix plan. **Your job: execute the plan wave by wave, ticket by ticket, and prove each fix with evidence.** An independent judge will re-audit after every wave, so do not claim anything you have not verified.

> **Unattended/overnight run?** Use `docs/OVERNIGHT_RUN.md` (short starter) → `docs/overnight/BUILDER_PROMPT.md` instead of this prompt (same rules plus the queue, heartbeat and morning report).

### 0. Anti-hallucination contract (binding — read before anything else)
Read `docs/spec/README.md` then `docs/spec/ANTI_HALLUCINATION.md`. In short: the **code + `docs/spec/API_FACTS.md`** are the ground truth, never your memory; Phaser is **v4** (read `node_modules/phaser/skills/<topic>/SKILL.md` + `v3-to-v4-migration` before any Phaser API); never invent files/events/assets/numbers/Bangla text; specs are read-only (use `SPEC_CHANGE_REQUEST`); no new dependencies; every ticket ends with an **EVIDENCE block**; UI tickets run `docs/spec/REVIEW_LOOP.md`. Preflight at every session start: `npm run spec:facts && npm run spec:verify && npx tsc --noEmit && npm run lint && npm run test`.
Crowd/voice/finale features (bystanders, pile-on, funny Bangladeshi voices, living-street maps) are fully specified in `docs/spec/` with build-ready packets in `docs/spec/TICKET_PACKETS.md` (tickets V2-31…V2-41, wave W3b; regional dialects: `docs/spec/LOCALIZATION_AND_DIALECTS.md`).

### 1. Read first (in this order — ~15 min, then stop reading and start building)
1. `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` (A-Team law — identical; branch per ticket `t-###-slug`, conventional commits, gates, memory protocol).
2. `docs/GAME_AUDIT.md` — every defect with an ID (G-/M-/C-/U-/T-) and an evidence tag. **[V]** verified at runtime, **[C]** verified in code, **[O]** observed (root cause unknown → *you* must find it), **[?]** unverified.
3. `docs/GAME_PLAN_V2.md` — the target game: core loop, layout zones, character spec, map system, 8 Bangladesh maps, UI rebuild, ticket waves.
4. `docs/DESIGN.md` — binding design law (tokens, banned defaults, viewports). **Read before touching any UI.**
5. `docs/ROADMAP.md §V2` — tickets `V2-00…V2-41` with acceptance criteria; the design lives in `docs/GDD.md`, the shipping plan in `docs/PRODUCTION_PLAN.md`. Work them **in order** (W0 → W1 → W2 → W3 → **W3b** → W4 → W5 → W6).
5b. `docs/spec/CROWD_AND_NPC_SPEC.md`, `VOICE_AND_SFX_SPEC.md` (+ `voice/voice_lines.csv`), `MAP_SCENARIOS.md` — when you reach the crowd/voice/map tickets.
6. `docs/STACK.md`, `docs/INVENTORY.md` (run `node .claude/scripts/gen-inventory.mjs` first), and the checkpoint memory.
Also skim, don't absorb: `docs/issues-found.md` (older Phase A–C report), `docs/DECISIONS.md`.

> `CLAUDE.md` warns that this Next.js version has breaking changes — read the relevant guide in `node_modules/next/dist/docs/` before writing Next/App-Router code. Phaser is **v4** — check `node_modules/phaser` typings, don't assume v3 APIs.

### 2. The five things that are actually wrong (so you start oriented)
1. **No real game loop** — player can't move, chaser mirrors villain lane, gap never changes, nothing can hurt the player (G-01…G-06).
2. **No maps** — the lobby doesn't scroll so the Map picker is unreachable (M-01, **verified**), and the 3 maps are palette swaps (M-02).
3. **Characters** — villain knockback is never undone so he drifts off the world (C-01, code-verified); in-game rig poses look hunched/tangled vs the lobby preview (C-02).
4. **Layout** — HUD/dock/ticker cover the lanes, especially on 844×390 phones (U-01/U-02).
5. **No design law** existed — now written in `docs/DESIGN.md`.

### 3. Ground rules
- **Wave order is law:** W0 → W1 → … W6. Shared files (`layout.ts`, `EntityMotion`, `MapDefinition`, `registry.ts`, `useGameStore`) are edited by **one** ticket at a time. Parallel agents (cap **5** worktree agents; ask the user before more) only for file-disjoint work: archetype redraws (W2) and one-folder-per-map (W4). Use `.claude/scripts/worktree.sh`.
- **Gates every ticket:** `npx tsc --noEmit` · `npm run lint` · `npm run test` · `npm run build` (e2e when the ticket touches flows). All are green today (tsc clean, lint clean, 37/37 tests) — keep them green.
- **Reuse before create:** search `docs/INVENTORY.md`, extend before forking. Add `@purpose` one-liners to new modules.
- **Replace, don't pile on:** the plan *removes* things (§8). Deleting dead UI/code is part of done.
- **No hard-coded policy numbers** in scenes — constants live in `src/config/` (`layout.ts`, `balance.ts`, map definitions).
- **Law-touching decisions → ask the user** (stack, data model, anything in GAME_PLAN §12 you want to change). Everything else: decide, log in `docs/DECISIONS.md`, move on. If the user is silent, use the stated defaults.
- **Never write entity `x`/`y` directly** after V2-02 — only through `EntityMotion`.
- **UI/visual tickets are NOT done from code alone.** Done = screenshots at **1280×720, 844×390, 1024×768** committed to `docs/screens/v2/<ticket>/` + a `/design-review` pass. Without them label the ticket `NOT VISUALLY VERIFIED`.
- **Honesty:** if a fix can't be verified, say so in the ticket summary. Do not mark an audit finding fixed unless its evidence test passes.
- Update the checkpoint memory (`pera-nai-chill-build-state`) + `docs/LOG.md` at the end of every response that changed anything.

### 4. Tooling — read this, it will save hours
- **Dev server:** `npm run dev` (port 3000). `.claude/launch.json` has `pera-nai-chill-dev`.
- **Headless Chromium here renders WebGL in software at ~1.5 fps** (measured with `scripts/audit/fps-and-hits.js`). Phaser timers/tweens barely advance, so combat/event/boss behaviour cannot be validated that way. Use one of: (a) a GPU-backed **headed** Chrome (`PW_CHROME=/path/to/chrome` + `headless:false`), (b) the desktop app's built-in browser pane when visible, or (c) **build V2-01's `?test=1` fixed-step hook first** and assert state, not wall-clock.
- **Repro scripts** (saved from the audit): `scripts/audit/lobby-reachability.js` (proves M-01 — must change from "mapTop unchanged" to "moves into view"), `scripts/audit/capture-audit.js` (all maps/viewports → `docs/audit/screens/`), `scripts/audit/fps-and-hits.js`. Run: `NODE_PATH=$PWD/node_modules node scripts/audit/<file>.js` with the dev server up.
- Baseline evidence: `docs/audit/screens/*.png`. Compare against them.
- Local skills to use: `/build`, `/design-review`, `/qa`, `/plan`, `character-rig-animation`, `phaser-nextjs-integration`, `game-juice-fx`, `bangla-ui-copy`, `world-event-engine`, `audio-synth-fallback`, plus the two new ones **`map-authoring`** (W3/W4) and **`playtest-audit`** (every wave end).

### 5. Start here — Wave 0 (do not skip ahead)
1. `V2-00` Lobby scroll: bound the lobby with `h-dvh overflow-y-auto overscroll-contain` (or finish V2-23's stepper later but fix now). Proof: rerun `lobby-reachability.js` at 1280×720, 1920×1080, 844×390 → map heading becomes reachable; add a Playwright test.
2. `V2-01` `src/config/layout.ts` [NEW] (zones in GAME_PLAN §3) + `?test=1` deterministic hook. Move `BALANCE.LANES_Y/LANE_SCALES` consumers to it.
3. `V2-02` `EntityMotion` + replace every direct `rig.x/y` write (`CharacterRig.triggerHitStun` `:486`, `triggerDead` `:525`, `Villain.vault/hideBehindVehicle/setLane`, `Chaser.followLane`). Unit-test spring-back + clamp; e2e proves bounds over 60 s.
After W0 → run `playtest-audit`, update docs, then **stop and report** so the judge can re-audit before W1.

### 6. Definition of "wave complete"
Gates green · every ticket's AC met with evidence · screenshots for UI · `docs/LOG.md` + `ROADMAP.md` (`[x]` + commit refs) + `DECISIONS.md` + memory updated · `docs/GAME_AUDIT.md` gets a "Re-audit YYYY-MM-DD" section listing which finding IDs are now ✅/❌ with the proving artefact · one-line "next action". Never `git push` the default branch or deploy without the user's explicit OK.

### 7. Output format at the end of each wave
- Findings fixed (IDs) with proof link · findings still open · new problems you discovered (add them to the audit with IDs, don't bury them) · decisions you took · the exact next command.

## ▲▲▲ COPY TO HERE ▲▲▲

---

### Notes for the human (not part of the prompt)
- Start a new session in this folder, paste the block, and say "go". If you want parallel agents on W2/W4, tell it explicitly (it will cap at 5).
- Come back to *this* (architect/judge) session after each wave: say "re-audit wave N". It re-runs the repro scripts and the playtest checklist and writes the Re-audit section.
- Decisions that are yours: GAME_PLAN_V2 §12 (D1–D7) — maps list, character tech, stage-based runs, controls, Bangla proof-reading.
- Evidence for M-01 (measured 2026-11-13 with `scripts/audit/lobby-reachability.js`): at 1280×720 / 1920×1080 / 844×390 the lobby root had `clientHeight == scrollHeight` (2338/2338/2350), `overflow-y:auto`, scrollTop stayed 0 after 6 wheel events, and the "DHAKA SCENARIO" heading stayed at `y=1320` (viewport heights 720/1080/390).
