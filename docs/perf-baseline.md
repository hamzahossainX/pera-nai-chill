# Performance Baseline & Code Audit (P2-00)
**Date:** 2026-11-11  
**Project:** Dhaka Rage Runner (Pera Nai Chill) — Phase 2 Architecture Transition

---

## 1. Executive Summary
Phase 1 core gameplay loop is fully functional, mechanically sound, and client-only with zero server dependencies. The game runs stably at 60 FPS using Phaser 4 and Next.js 16 App Router. However, the visual character representation currently relies on procedural geometric rounded rectangles (`Graphics.generateTexture`), giving villains a rigid "moving rectangle" look. Phase 2 replaces this with a layered SVG slot-based rig, rich Dhaka archetypes, dynamic day/night lighting, weather cycles, dialogue bubbles, and local meta-progression (shop, daily challenge, achievements).

---

## 2. Character Rendering Audit (Current State)
- **Rig Structure:** `CharacterRig` (`src/game/entities/CharacterRig.ts`) extends `Phaser.GameObjects.Container`.
- **Torso & Limbs:** Drawn using procedural textures generated in `BootScene.ts`:
  - `rig-torso`: 40x52 rounded rectangle (`fillRoundedRect`)
  - `rig-limb-upper`: 12x26 rounded rectangle
  - `rig-limb-lower`: 10x24 rounded rectangle
  - `rig-foot`: 24x10 rounded rectangle
  - `rig-hand`: 14x14 circle
  - Color differentiation between archetypes currently relies purely on `setTint(outfitColor)` and `setTint(pantColor)`.
- **Head & Face Attachment:**
  - `headGroup` is anchored at `(0, -90)` relative to the root origin (feet).
  - Target face is circular cropped (72x72 px) from local MediaPipe canvas or placeholder.
  - Reactive props (`prop-dizzy-stars`, `prop-band-aid`, `prop-shocked-eyes`, `prop-crying-tears`) attach to `headGroup`.
- **Run Animation:**
  - Mathematical procedural kinematics based on continuous sinusoidal angular oscillation:
    - Cadence: 1.6 steps/sec scaled by run speed factor.
    - Front/back limbs alternate with $\pi$ phase offset.
    - Vertical torso bounce: $| \sin(t) | \times -6$ px.
    - Head wobble lag: $\sin(2t) \times 0.08$ rad.
- **Lobby Preview:**
  - `VillainPreview.tsx` duplicates the run cycle using HTML/CSS + Framer Motion divs.

---

## 3. Parallax, Spawners & Performance Metrics
- **Parallax System:** 5 `TileSprite` layers (`bg-sky`, `bg-far-buildings`, `bg-near-buildings`, `bg-road`, `bg-wires`) with zero per-frame allocations (`tilePositionX` offset accumulation).
- **Spawn Systems:**
  - `Obstacle` pool: 10 pre-allocated sprites.
  - `PickupItem` pool: 6 pre-allocated sprites.
  - Projectiles: dynamically managed active array with instant recycling.
- **Framerate & Draw Calls:**
  - Desktop dev FPS: 60 FPS steady (capped by `loop.actualFps`).
  - Mobile simulated FPS: 58–60 FPS.
  - Active display objects: 65–85 on screen during standard run; up to 110 during strike/combo storms.
  - Draw calls: ~40–60 draw calls (well within target < 150).

---

## 4. Gaps from Phase 1 to Bridge for Phase 2
| Area | Current Phase 1 State | Phase 2 Required State |
|---|---|---|
| **Rig Parts** | Flat procedural boxes | Layered SVG slot parts (2x rasterized) + procedural fallback |
| **Mask & Face** | Face exposed or basic emoji | Dynamic mask with 66% slip & 33% fall reveal |
| **Archetypes** | 3 generic stats with tint swap | 7 distinct Dhaka archetypes (Phone Snatcher, Pickpocket, etc.) with custom props |
| **Secondary Motion**| Rigid hierarchy | Velocity-driven spring chains for gamchha, scarf, hood strings, props |
| **Chaser** | Hero green shirt rig | Detailed casual Dhaka runner with custom attack frames |
| **Lighting / Time** | Fixed sky/road colors | 4-phase `TimeOfDaySystem` (Morning, Noon, Evening, Night) with ambient gradients |
| **Weather** | Single rainfall event | Full `WeatherSystem` (Monsoon rain, Waterlogging flood, Winter fog, Heatwave) |
| **Dialogue & Copy** | Static combat words | Context-aware bilingual speech bubbles (`DialogueSystem`) + ticker |
| **Progression** | Local run score & Taka | Shop (skins/trails), local achievements, daily challenge, wanted poster export |

---

## 5. Quick Wins & Action Plan
1. **Refactor `CharacterRig` into slot-based architecture** (`P2-01`): Standardize slot anchors (`headBack`, `face`, `maskLower`, `maskUpper`, `headFront`, `torso`, `upperArmL/R`, `lowerArmL/R`, `handL/R`, `thighL/R`, `shinL/R`, `footL/R`, `backProp`, `handProp`, `frontProp`).
2. **Build Phone Snatcher reference SVG kit** (`P2-01`): Black hoodie, joggers, balaclava with eye cutout, stolen phones in hand.
3. **Keep Tier 0 procedural fallback active**: If any SVG fails to load or during offline fast-boot, seamless fallback textures prevent runtime exceptions.
