# Dhaka Rage Runner — Phase A Diagnosis Report

**Date:** 2026-11-11  
**Lead QA & System Architect:** Antigravity  
**Commit Baseline:** `64618cb` (Phase 2 Baseline)  
**Status:** Phase A Complete (Diagnosed before touching application code)

---

## 1. Multi-Viewport Diagnostic Screenshots

All 10 required baseline screenshots have been captured using Playwright against Google Chrome headless and saved to `docs/screens/`:

| Screen | Viewport | Target File | Status | Notes |
|---|---|---|---|---|
| **Lobby** | 1280x720 (Desktop) | `docs/screens/before-lobby-1280x720.png` | Captured | Top bar, daily challenge, uploader & preview |
| **Lobby** | 1920x1080 (Desktop) | `docs/screens/before-lobby-1920x1080.png` | Captured | Full HD framing check |
| **Lobby** | 390x844 (Mobile) | `docs/screens/before-lobby-390x844.png` | Captured | iPhone 14 / modern mobile viewport |
| **Lobby** | 360x640 (Mobile) | `docs/screens/before-lobby-360x640.png` | Captured | Small Android viewport |
| **Selection** | 1280x720 (Desktop) | `docs/screens/before-selection-1280x720.png` | Captured | Archetype carousel & map scenario selector |
| **Shop** | 1280x720 (Desktop) | `docs/screens/before-shop-1280x720.png` | Captured | Dhaka Bazaar modal & category tabs |
| **Running Game** | 1280x720 (Desktop) | `docs/screens/before-running-1280x720.png` | Captured | Active Phaser canvas, chaser & villain |
| **Running Game** | 1920x1080 (Desktop) | `docs/screens/before-running-1920x1080.png` | Captured | Full HD gameplay framing & HUD |
| **Running Game** | 390x844 (Mobile) | `docs/screens/before-running-390x844.png` | Captured | Mobile gameplay canvas centering & weapon dock |
| **Running Game** | 360x640 (Mobile) | `docs/screens/before-running-360x640.png` | Captured | Compact mobile gameplay canvas & dock |

---

## 2. Dev Overlay Issues & Unhandled Errors (10 Issues Catalog)

During gameplay and startup, Turbopack / Next.js dev overlay and browser console accumulated the following 10 distinct issues:

### Issue 1: TypeError on Slap Attack Tween
- **File & Line:** `src/game/entities/CharacterRig.ts:597:18`
- **Trigger:** Player triggers Slap attack (`CombatSystem.executeWeapon("slap")`).
- **Root Cause:** When `CharacterRig` is unmounted or during React 19 StrictMode remount, `this.scene` becomes `undefined`. Accessing `this.scene.tweens.add(...)` throws an unhandled `TypeError: Cannot read properties of undefined (reading 'tweens')`.
- **Severity:** **BLOCKER** (Crashes attack animation and freezes combat handler).

### Issue 2: TypeError on Gut Punch Attack Tween
- **File & Line:** `src/game/entities/CharacterRig.ts:581:18`
- **Trigger:** Player triggers Punch weapon.
- **Root Cause:** Same lifecycle vulnerability: `this.scene.tweens.add` called when rig is detached.
- **Severity:** **BLOCKER**.

### Issue 3: TypeError on Flying Drop-Kick Tween
- **File & Line:** `src/game/entities/CharacterRig.ts:565:18`
- **Trigger:** Player triggers Kick weapon.
- **Root Cause:** Accessing `this.scene.tweens.add` without verifying `this.scene?.tweens`.
- **Severity:** **BLOCKER**.

### Issue 4: TypeError on Throw Attack Timer
- **File & Line:** `src/game/entities/CharacterRig.ts:607:18`
- **Trigger:** Player throws Chappal weapon.
- **Root Cause:** `this.scene.time.delayedCall(70, ...)` throws `Cannot read properties of undefined (reading 'time')` if the scene unmounted during the windup animation.
- **Severity:** **BLOCKER**.

### Issue 5: TypeError on Dialogue Bubble in World Events
- **File & Line:** `src/game/systems/DialogueSystem.ts:108:38`
- **Trigger:** `EventSystem.startEvent` triggers `DialogueSystem.showBubble` when an event begins.
- **Root Cause:** `this.scene.add.container(...)` called when `this.scene` is null or in the process of shutdown.
- **Severity:** **BLOCKER**.

### Issue 6: TypeError on Player Taunt Dialogue
- **File & Line:** `src/game/systems/DialogueSystem.ts:108:38`
- **Trigger:** Player taps the Taunt button in `HudOverlay.tsx:92`.
- **Root Cause:** `DialogueSystem` event listener is not unregistered on scene shutdown; taunt click triggers bubble on an orphaned system reference.
- **Severity:** **BLOCKER**.

### Issue 7: Stale Global Keyboard Attack Listeners
- **File & Line:** `src/components/game/WeaponDock.tsx:118:9`
- **Trigger:** Pressing keys (1, 2, 3, 4, Space) during scene transitions or game over.
- **Root Cause:** Global `window.addEventListener("keydown", ...)` in `WeaponDock` dispatches `weapon:use` event to `CombatSystem` even when the Phaser scene is transitioning or destroyed.
- **Severity:** **WARNING**.

### Issue 8: React 19 StrictMode Double-Mount Canvas Leak
- **File & Line:** `src/components/game/GameHost.tsx:16-32`
- **Trigger:** Initial page load and switching between Lobby and Running screens.
- **Root Cause:** React 19 runs effects twice in dev mode. The first Phaser instance is destroyed asynchronously while the second is instantiated, causing duplicate WebGL contexts and OpenGL ReadPixels driver warnings (`GPU stall due to ReadPixels`).
- **Severity:** **WARNING / PERF**.

### Issue 9: Loading Screen Stuck at 95% Indefinitely (12s Delay)
- **File & Line:** `src/store/useGameStore.ts:157-171`
- **Trigger:** Every cold start on the `BOOT` screen.
- **Root Cause:** Weights in `setLoading` add up to `10 + 15 + 35 + 20 + 15 = 95`. A 5% `procedural` weight exists in the config map but is never dispatched. Consequently, `loading.overall` caps at 95%, `displayProgress` never reaches 100%, and the player is held hostage for 12 seconds until the "Slow network? Play anyway" fallback fires.
- **Severity:** **BLOCKER** (Degrades first-time user experience completely).

### Issue 10: Global Touch & Scroll Lockout
- **File & Line:** `src/app/globals.css:9-22`
- **Trigger:** Touching or mouse-wheeling on mobile or desktop in the Lobby or Shop.
- **Root Cause:** `overflow: hidden; touch-action: none; user-select: none;` was placed on `html, body` for the arcade canvas but was never scoped or overridden for scrollable UI containers.
- **Severity:** **BLOCKER** (Users cannot scroll down to see Map Selection, Weapons, or Start button on smaller mobile screens).

---

## 3. Visual Defects Diagnosis

### A. Characters Look Like Blocks/Rectangles Instead of Humans
1. **Lobby Preview:** In `src/components/lobby/VillainPreview.tsx:223-264`, the character preview is rendered with crude HTML `div` boxes with rigid inline borders rather than using vector character sprites.
2. **Game Fallbacks in `BootScene.ts:770-830`:** The procedural textures generate plain geometric primitives:
   - Torso: `fillRoundedRect(2, 2, 40, 52, 6)` (solid rectangle).
   - Limbs: `fillRoundedRect(2, 2, 12, 26, 5)` (plain colored rectangles).
   - Hand: `fillCircle(7, 7, 6)` (plain circle).
   - Foot: `fillRoundedRect(2, 2, 24, 10, 4)` (solid slab).
3. **Rig Geometry in `CharacterRig.ts`:**
   - **No Neck:** The head sits directly at `y = -90` while torso is at `y = -55`, floating without anatomical transition.
   - **No Anatomical Contours:** Limbs are straight parallel boxes without elbow/knee curvature or muscle taper.
   - **Missing Chibi 3-Head Proportions:** The head is 68x68, torso is 56px, and legs are 72px (total height ~196px), creating an awkward ratio rather than appealing 3-head chibi slapstick styling.
   - **Hard Shadow:** Shadow is an unblurred solid black ellipse (`fillEllipse(36, 12, 34, 10)`).

### B. Feet Cut Off / Hidden Behind Weapon Dock
- **Logical Canvas:** 1280x720 (`BALANCE.LOGICAL_HEIGHT = 720`).
- **Lane Positions:** `BALANCE.LANES_Y = [520, 580, 640]`.
- **Character Baseline:** At lane 2 (bottom lane), character `y = 640` with scale `1.1`. The feet extend to `y ≈ 660`.
- **Overlay Height:** `WeaponDock.tsx` renders 80px tall weapon buttons (`h-20`), plus `bottom-4` (16px), plus ultimate button (`h-14`) and tutorial badge, spanning `y = 580` down to `720`.
- **Finding:** The bottom lane characters are positioned directly inside the Weapon Dock bounding box, cutting off their legs and feet entirely. Shifting `BALANCE.LANES_Y` up to `[430, 485, 540]` gives ~180px of clear clearance above the dock.

### C. Black Vertical Strip on Left Side of Canvas
- **Framing Conflict:** In `GameHost.tsx:35-41`, `#phaser-container` has Tailwind classes:
  `aspect-video h-full w-full flex items-center justify-center`
- **Phaser Scale Mode:** `createGame.ts` configures:
  `mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH`
- **Finding:** `Phaser.Scale.CENTER_BOTH` calculates inline style margins (`margin-left: ...px`) to center the canvas. Because the parent container is *already* a CSS flexbox with `justify-center`, the double-centering produces an arithmetic subpixel offset on non-exact 16:9 viewports, creating an asymmetrical black margin on the left.

### D. Flat Parallax (No Depth, No Time-of-Day)
- **Time of Day Ignored:** `useGameStore` stores `timeOfDay` ("noon", "goldenHour", "night", "dawn"), but `ParallaxSystem.ts` never reads it. The sky tile always uses noon daylight.
- **Missing Depth Layers:** Only 2 building layers (`bg-far-buildings`, `bg-near-buildings`) are used without aerial haze, atmospheric perspective, or light tinting.
- **Road Flatness:** The road is a single flat repeating texture without vertical perspective compression or streetlamp pools of light.

---

## 4. Interaction Defects Diagnosis

### A. Touch & Mouse Scrolling
- **Observation:** Tested via Playwright:
  - `desktop_scroll_1280x720`: `{ scrolled: false }`
  - `mobile_scroll_390x844`: `{ scrolled: false }`
- **Cause:** Global `overflow: hidden; touch-action: none;` on `body` blocks native scrolling everywhere.

### B. First-Click Tab & Archetype Selection
- **Observation:** Archetype and Crime cards are implemented as unsemantic `<div>` elements with `onClick`. They lack keyboard focusability (`tabIndex={0}`), ARIA roles (`role="button"`), and on mobile swipe gestures they sometimes fail to register clicks due to touch event bubbling.

### C. Shop Balance & Purchase Transactions
- **Observation:** `BALANCE.INITIAL_TAKA` was 50 Taka, whereas the cheapest purchasable item in `SHOP_ITEMS` was 250-300 Taka. All buy buttons were disabled by default with no visual explanation or way to test purchases before running. Additionally, equipped outfits did not propagate to the Phaser chaser sprite texture.

---

## 5. Summary & Action Plan for Phase B & Beyond

1. **Phase B (Rebuild Characters):**
   - Implement layered vector SVG character assets with human anatomy: neck, tapered torso, jointed arms with distinct hands, jointed legs with shoes, outlines, and soft ground shadows.
   - Support 7 archetypes with dynamic mask-slip (66% and 33% HP).
   - Build dev gallery at `/dev/characters` with `?rig=1` debug skeleton joint overlay.
2. **Phase C (Layout, Framing & Parallax):**
   - Shift lanes up to `[430, 485, 540]`.
   - Fix canvas centering in `GameHost.tsx` to remove the black left strip.
   - Implement dynamic time-of-day sky palettes and atmospheric tinting in `ParallaxSystem`.
3. **Phase D (Bug Hunt & UX Reliability):**
   - Fix the 95% loading cap in `useGameStore.ts`.
   - Remove `touch-action: none` from `globals.css` (scope it only to canvas).
   - Add proper button semantics and ARIA tags to archetype/crime cards.
   - Add Playwright automated tests.
4. **Phase E (More Maps):**
   - Expand `src/config/maps.ts` to 8 data-driven Dhaka scenarios.
