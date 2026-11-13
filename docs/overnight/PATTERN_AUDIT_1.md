# PATTERN AUDIT #1 — Post-W0 Review

**Date:** 2026-11-13  
**Tickets Covered:** V2-00, V2-01, V2-02 (W0 Stabilisation Wave)  
**Branch:** `v2/build`  
**Tags:** `v2-00-done`, `v2-01-done`, `v2-02-done`

---

## 1. Ratchet Metrics Before & After

| Pattern Check | Baseline (Start) | After W0 | Status |
|---|---|---|---|
| **P01 Math.random in gameplay** | 63 | **43** | ⬇ -20 migrated to `src/lib/rng.ts` |
| **P02 Direct entity position write** | 5 | **0** | ⬇ **Zeroed** via `EntityMotion` |
| **P03 Lane literals outside layout** | 18 | **0** | ⬇ **Zeroed** via `src/config/layout.ts` |
| **P04 gameBus listener leak** | 0 | 0 | Clean |
| **P05 any type** | 0 | 0 | Clean |
| **P06 console.log in shipped code** | 1 | 1 | Pre-existing in service worker |
| **P07 setTimeout in game** | 0 | 0 | Clean |
| **P08 Hex literals in systems** | 48 | 48 | Same (W2/W4 will address) |
| **P09 File over 800 lines** | 2 | 2 | Same (`BootScene.ts`, `audio.ts`) |
| **P10 Unguarded localStorage** | 0 | 0 | Clean |

---

## 2. 10-Point Checklist Audit

### 1. Systems Lifecycle
- **`EntityMotion.ts`:** Holds position and physics channels (`homeX`, `offsetX`, `laneY`, `jumpY`, `extraY`). Updates without any per-frame heap allocations.
- **`CharacterRig.ts`:** Instantiates `motion` in constructor and applies updates cleanly in `update(time, delta)` via `this.motion.update(delta); this.motion.applyTo(this);`.
- **`testHook.ts`:** Installed strictly when `?test=1`. Clean registration and step interfaces.
- **Finding:** No leaks, clean lifecycle.

### 2. Bus Hygiene
- `testHook.ts` debug handler `attack` dispatches `gameBus.emit("weapon:use", { weaponId, timestamp })`, strictly adhering to `bus.ts` TypeScript types.
- React components remain pure UI; no gameplay state or physics logic introduced into React.

### 3. Config Hygiene
- All canvas dimensions, vertical zones (`HUD`, `SKY`, `SIDEWALK`, `PLAY_ZONE`, `FOOT_ZONE`), and lane coordinates (`LANES_Y: [450, 515, 580]`, `LANE_SCALES: [0.88, 1.0, 1.12]`) now live in `src/config/layout.ts`.
- `EntityMotion` parameters (`omega = 18`, `zeta = 0.92`, `minX = 60`, `maxX = 1220`) are typed and defaulted cleanly.

### 4. Data-Driven Check
- No ad-hoc `if (mapId === ...)` branches added.
- All lane lookups are routed through `getLaneY(index)` and `getLaneScale(index)`.

### 5. Position Ownership
- Grep and mechanical ratchet prove that **zero** direct `rig.x/y =` writes or tween targets exist outside `EntityMotion`.
- Fixed C-01 (villain knockback drift) and C-03 (vault snapback during lane changes).

### 6. Layout & Responsive Geometry
- Verified at 1280×720, 1920×1080, 1024×768, and 844×390 viewports in `e2e/lobby-scroll.spec.ts`.
- App container height bounded via `h-dvh max-h-dvh overflow-y-auto` with keyboard tabIndex, resolving S0 finding M-01.

### 7. Determinism
- Seedable Alea PRNG in `src/lib/rng.ts` handles gameplay randomness.
- Fixed-step test hook `window.__game.step(ms, stepDt)` allows deterministic physics and tween progression without wall-clock dependency under Software GL.

### 8. Fallbacks & Error Boundaries
- `EntityMotion` bounds clamp protects entities from escaping viewport bounds `[60, 1220]`.
- `SeededRNG` falls back to default seed if none provided.
- `testHook` returns `null` for uninstantiated scenes/state gracefully.

### 9. Safety & Tone
- All UI and Bengali text checked for appropriate slapstick comic tone. No banned defaults or inappropriate terminology.

### 10. File Size & Seams
- `EntityMotion.ts`: 167 lines.
- `src/__tests__/entity_motion.test.ts`: 105 lines.
- `src/__tests__/layout_and_rng.test.ts`: 141 lines.
- `e2e/knockback-drift.spec.ts`: 92 lines.
- `CharacterRig.ts`: 757 lines (kept strictly under 800-line limit).

---

## 3. Findings & Next Actions
- **Audit Result:** PASS. W0 successfully eliminated S0 bugs M-01, C-01, C-03 and met all architectural prerequisites for Wave 1.
- **Next Action:** Proceed to Ticket **V2-03** (Player controls: lanes, dash, jump with `ControlSource` abstraction).
