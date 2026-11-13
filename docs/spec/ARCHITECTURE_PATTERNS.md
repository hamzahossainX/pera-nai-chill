# ARCHITECTURE_PATTERNS.md — The design patterns of this codebase (and how they are re-checked)

**Purpose:** the builder must *understand and preserve* the patterns below, and **re-check them** (a) at the start of each session, (b) after every ticket, (c) after every 3 tickets as a deliberate "pattern audit". Mechanical part: `npm run pattern:check` (a **ratchet**: counts may fall, never rise; baseline in `scripts/audit/pattern-baseline.json`). Human part: the checklist in §4.
**Status:** v1 (2026-11-13). Patterns marked **(existing)** are verified in the code today; **(V2)** are introduced by tickets and become binding when their ticket lands.

## 1. Pattern catalogue

| # | Pattern | Rule (what "correct" looks like) | Where it lives | Guard |
|---|---|---|---|---|
| A1 | **Phaser scene + systems (existing)** | `RunScene` owns thin orchestration; each concern is a *system class* (`CombatSystem`, `SpawnSystem`, `EventSystem`, `DialogueSystem`, …) constructed in `create()`, ticked from `update()`, torn down via `destroy()` registered on `SHUTDOWN` **and** `DESTROY`. New features = new system + 3–4 lines in `RunScene`. | `src/game/scenes/RunScene.ts`, `src/game/systems/*` | review; AC "mount/destroy twice returns `scene.children.length` to baseline" |
| A2 | **React shell ↔ typed event bus ↔ Zustand (existing, DEC-004)** | High-frequency state (positions, particles) stays in Phaser; low-frequency state (HP, Taka, combo, settings) in the store; they talk through **typed** `gameBus` events (`GameEventTypes`). **No gameplay logic in React components.** UI never reads Phaser objects. | `src/game/bus.ts`, `src/store/useGameStore.ts`, `src/components/**` | P04 (on/off symmetry); review |
| A3 | **Symmetric listeners (existing)** | Every `gameBus.on`/`window.addEventListener`/`scene.events.on` has a matching `off` in `destroy()`; handlers are stored as arrow-function fields. StrictMode double-mount must be harmless. | all systems | **P04** |
| A4 | **Declared ⇒ emitted** | An event in `GameEventTypes` must have an emitter; a listener for a never-emitted event is a bug (audit T-07). | `bus.ts`, `API_FACTS §2` ⚠ list | `npm run spec:facts` shows ⚠ |
| A5 | **Config-driven, no magic numbers (existing → strengthened)** | Tunables live in `src/config/*` (`balance.ts`, `weapons.ts`, `villains.ts`, `maps`, later `balance.v2.ts`, `layout.ts`, `voiceProfiles.ts`). Systems import constants; they don't contain numbers except loop bounds. | `src/config/*` | P03, P08; review |
| A6 | **Pooling, no per-frame allocation (existing)** | Obstacles, pickups, props, particles, NPCs, bubbles come from pre-sized pools; `update()` allocates nothing (no `new`, no array/object literals in hot paths). | `SpawnSystem`, `ParallaxSystem` | counting test (V2-31 AC); review |
| A7 | **Data-driven content (V2)** | Maps, NPCs, scenarios, voice lines, dialects are *data* validated by Zod and registered once; systems read data, never branch on ids (`if (mapId === …)` is banned). | `src/maps/registry.ts` [NEW], `src/config/*`, CSV → generated manifest | review; V2-16 AC (dummy map = 1 folder + 1 line) |
| A8 | **Single owner of positions (V2)** | Entity x/y change only via `EntityMotion` channels (home, offset spring, lane tween, jump tween, clamp). | `src/game/motion/EntityMotion.ts` [NEW] | **P02** |
| A9 | **Layout from one module (V2)** | Zones/lanes/HUD rects from `src/config/layout.ts` [NEW]; UI never covers lane feet (≥ 28 px). | `layout.ts` | **P03**, geometry e2e |
| A10 | **Seeded randomness & fixed-step testability (V2)** | Gameplay randomness via `src/lib/rng.ts` [NEW]; `?test=1&seed=N` exposes `window.__game` (`step`, `getState`, `registerState`, `debug.register`). Tests assert *state*, not wall-clock fps. | `src/lib/rng.ts`, `src/game/testHook.ts` [NEW] | **P01** |
| A11 | **Input via `ControlSource` (V2-03)** | Player/bot/remote input produce typed commands; gameplay doesn't read keyboard/touch directly (V3 multiplayer forward-compat). | `src/game/input/*` [NEW] | review; V2-03 AC |
| A12 | **Run rules as data (V2-06)** | `RunRules` object decides mode/timer/lives/win; no `if (hunt)` scattered. | `src/config/runRules.ts` [NEW] | review |
| A13 | **Graceful degradation (existing)** | Missing asset → procedural fallback; missing voice clip → TTS → babble; missing dialect → standard; autoplay locked → silent no-op; storage blocked → defaults. Never throw to the player. | `PreloadScene`, `voice.ts`, `dialect.ts`, `storage.ts` | tests per fallback |
| A14 | **Safety by construction (V2)** | Content rules are enforced in data/tests, not by hope: pile-on caps, `canJoinMob`, consent gate, Friendly exports, PG line policy, no-celebrate rule. | CROWD §9.3, LOCALIZATION §9 | review rubric criterion 7 (auto-fail) |
| A15 | **Generated truth files (existing → extended)** | `docs/INVENTORY.md` and `docs/spec/API_FACTS.md` are generated, never hand-edited. | scripts | `npm run spec:facts`, gen-inventory |
| A16 | **Small files, clear seams** | Files ≤ 800 lines; `BootScene.ts` (2210) is split as maps move to SVG; no new god files. | — | **P09** |

## 2. Anti-patterns (each has a mechanical counter in `pattern-check.mjs`)
| Check id | Anti-pattern | Baseline (2026-11-13) | Target |
|---|---|---|---|
| P01 | `Math.random` in `src/game`/`src/services` | 63 | falls to the cosmetic-only allowlist after V2-01 |
| P02 | direct `rig.x/y =` / knockback x-tween | 5 | 0 after V2-02 |
| P03 | `LANES_Y`/`LANE_SCALES` outside `layout.ts`/`balance.ts` | 18 | 0 after V2-01 |
| P04 | `gameBus.on` without matching `off` | 0 | stays 0 |
| P05 | `any` types | 0 | stays 0 |
| P06 | `console.log/debug/info` | 1 | 0 |
| P07 | `setTimeout` inside `src/game` | 0 | stays 0 |
| P08 | hex colour literals in systems/entities | 48 | falls as palettes/tokens land |
| P09 | files > 800 lines | 2 | 0 after BootScene split / audio split |
| P10 | unguarded `localStorage` | 0 | stays 0 |

**Ratchet rules:** a ticket may **lower** a count (and must then run `node scripts/audit/pattern-check.mjs --update-baseline` and commit the new baseline *in the same commit*); it may **never raise** one. A justified exception needs `// pattern-ok: <reason>` on that line and a mention in the ticket's EVIDENCE block. The judge audits `pattern-ok` additions.

## 3. When to run what
| When | Command |
|---|---|
| session start / resume | `npm run spec:facts && npm run spec:verify && npm run pattern:check && npx tsc --noEmit && npm run lint && npm run test` |
| after every ticket | same + e2e for the touched flows |
| after every 3 tickets | **pattern audit** (§4) written to `docs/overnight/PATTERN_AUDIT_<n>.md` |
| before any commit | `npm run pattern:check` (must pass) |

## 4. Pattern audit checklist (human review — do it honestly, write findings)
1. **Systems lifecycle:** for each new/changed system — constructed in `create`, ticked in `update`, destroyed on SHUTDOWN+DESTROY, listeners paired, pools pre-sized, no per-frame allocation.
2. **Bus hygiene:** any new event typed in `GameEventTypes`, emitted somewhere, documented in `API_FACTS`; no gameplay logic added to React.
3. **Config hygiene:** any literal number in new logic? Move to config with the spec's default; log defaulted numbers in `DECISIONS.md`.
4. **Data-driven check:** any `if (mapId|archetypeId|…)` branch added? Replace with data.
5. **Position ownership:** grep for `.x =`/`.y =`/tween `x:` targeting an entity outside `EntityMotion`.
6. **Layout:** any new magic Y/X or UI overlapping lane feet? Check geometry test at 844×390.
7. **Determinism:** new randomness uses `rng`; the seeded e2e still reproduces.
8. **Fallbacks:** each new dependency on an asset/network/permission has a fallback and a test.
9. **Safety:** rubric criterion 7 on every new line/sprite/scenario.
10. **File size & seams:** any file near/over 800 lines? Split now, not later.
Record: `Pattern audit <n> — tickets <ids> — findings: … — actions: …` and fix before continuing; unresolved items become tickets.

## 5. What this does NOT guarantee
The ratchet catches *known* anti-patterns by regex; it cannot judge fun, art, or architecture quality. The checklist and the judge's re-audit cover that. If you find a new recurring anti-pattern, **add a check** (a ticket-sized change to `pattern-check.mjs` with a fresh baseline) rather than relying on memory.
