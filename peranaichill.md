# DHAKA RAGE RUNNER — Full Build Blueprint (v2)

> A satirical, stress-relief 2D action-runner set in the streets of Dhaka.
> The player uploads a face, the face becomes a fully animated, running cartoon villain, and the player chases and smacks him with Slap, Punch, Kick and the Flying Chappal while real-life Bangladeshi "world events" (loadshedding, smog, strikes) disrupt the run.

---

## 0. AGENT PROTOCOL (READ THIS FIRST)

This file is the single source of truth. It is written so an AI coding agent can execute it end to end.

**When the user says `BEGIN`:**
1. Read this entire file once.
2. Execute tickets in section 14 **strictly in order** (T00 → T14).
3. For each ticket: implement → run `npm run build` and `npm run lint` → manually verify the Acceptance Criteria → write a 3-line status report → continue to the next ticket **without asking for permission**.
4. Only stop and ask the user if: a required decision is not covered here, a dependency fails to install twice, or a ticket's acceptance criteria cannot be met.
5. Never leave the project in a non-compiling state between tickets. Commit after every ticket (`git commit -m "T05: events engine"`).
6. If an external asset (image/audio) is missing, **use the procedural fallback** described in section 13. Never block on assets.
7. Keep all game logic client-side. No backend in Phase 1.

**Commands the user may give later:** `BEGIN`, `CONTINUE` (resume at next unfinished ticket), `STATUS` (list tickets done/remaining), `FIX <problem>`, `POLISH` (run section 15 polish checklist).

---

## 1. VISION & DESIGN PILLARS

| Pillar | Meaning |
|---|---|
| **Juicy** | Every hit must feel great: hit-stop, screen shake, squash & stretch, particles, floating text, sound. |
| **Instantly funny** | The uploaded face on a running body is the joke. Make that moment perfect. |
| **Zero friction** | Works on a phone browser, no login, no install, loads fast, face processing never leaves the device. |
| **Data-driven** | Events, weapons, villains and levels live in JSON/TS config. New memes = new config entry, not new code. |
| **Demo-proof** | Debug bar, fallback cropper, procedural assets and synth audio mean the demo never breaks. |

### What was improved vs. the original plan
- Pure raw `<canvas>` replaced by a **real 2D engine (Phaser)** → sprites, tweens, cameras, particles, post-FX, physics and asset loading are built-in, so the game looks and feels far smoother.
- Characters are a **jointed, movable rig** (head, torso, arms, legs) animated procedurally, not a flat image.
- Proper **boot/loading pipeline** with progress, tips, font/model warm-up and an audio-unlock tap.
- **2.5D lane system** (3 lanes of depth) so the street has depth and obstacles matter.
- **Combo, rage meter, ultimate move, villain health, difficulty ramp, power-ups** → real game loop, not only a tech demo.
- **Mobile-first controls**, haptics, PWA, performance budget.
- Clean **React shell ↔ Phaser game** separation connected by a typed event bus + Zustand.

---

## 2. TECH STACK (FINAL DECISIONS)

Always install the **latest stable** version of each package (`npm i pkg@latest`) and check its changelog if something breaks.

### Core
| Concern | Choice | Why |
|---|---|---|
| App framework | **Next.js (App Router) + TypeScript** | Fast routing, easy Vercel deploy. Game pages are `"use client"` only. |
| Game engine | **Phaser 3 (latest stable)** | Mature 2D engine: scenes, tweens, cameras, particles, post-FX (blur, vignette, bloom, color matrix), audio, input. Best fit for juicy 2D. |
| UI shell | **React + Tailwind CSS** | Menus, HUD, popups. |
| UI animation | **Framer Motion (`motion`)** | Snappy popups, blackout banners, shop cards. |
| Timeline / text FX | **GSAP** (free) | Title intro, number counters, shake text. Optional but recommended. |
| Loading / vector anim | **lottie-react** (or `@lottiefiles/dotlottie-react`) | Lightweight animated loader and celebratory effects. |
| State bridge | **Zustand** (+ `subscribeWithSelector`) | Share state between React HUD and Phaser without re-render lag. |
| Icons | **lucide-react** | HUD icons. |
| Audio | **Phaser Sound (WebAudio)**; **Howler.js** only if audio sprites are needed | Fewer dependencies = fewer bugs. Add a Web Audio **synth fallback**. |
| Face detection | **`@mediapipe/tasks-vision` (FaceDetector)** | Fast, runs in browser (WASM + GPU). |
| Manual crop (fallback, always available) | **`react-easy-crop`** | Zoom/pan circular crop. Guarantees demo never fails. |
| Optional background removal | **`@imgly/background-removal`** (lazy, optional toggle) | Cleaner cut-outs. Heavy: load only if user taps "Clean cutout". |
| Fonts | **`next/font`**: *Bangers* or *Luckiest Guy* (comic display), *Hind Siliguri* or *Noto Sans Bengali* (Bangla text) | Comic feel + proper Bangla rendering. |
| PWA | **Serwist** (`@serwist/next`) | Offline cache, installable. Phase 1.5. |
| Utilities | `clsx`, `zod` (validate event JSON), `nanoid` | Small helpers. |
| Testing | **Vitest** (logic), **Playwright** (smoke E2E) | Keep minimal. |
| Analytics (later) | Plausible or Vercel Analytics | Privacy friendly. |

### Rejected / alternatives (do not use unless blocked)
- **PixiJS v8**: great renderer, but you must build scenes/tweens/audio yourself. Use only if Phaser bundle size becomes a problem.
- **Spine / DragonBones skeletal animation**: Spine needs a paid license; DragonBones is unmaintained. We use a **procedural rig** instead (free, flexible, face swaps trivially).
- **Rive**: excellent for UI/character animation, but runtime face-texture injection is more complex. Optional later.
- **Matter.js / Planck**: not needed. Use Phaser Arcade physics + hand-written parabolas.
- **Three.js / R3F**: this is a 2D game; skip.

### Backend (Phase 2, deferred)
**Supabase** (Postgres + Realtime) for dynamic events and leaderboard. Do NOT build in Phase 1; keep the service interface ready (section 16).

---

## 3. ARCHITECTURE

```
┌────────────────────────── Browser ──────────────────────────┐
│  React Shell (Next.js)                                      │
│   ├─ LoadingScreen / Lobby / HUD / Overlays / GameOver      │
│   ├─ Zustand store  ◄───────────────┐                       │
│   └─ <GameHost/> mounts Phaser ─────┼──► Phaser Game        │
│                                      │     ├─ BootScene      │
│        typed EventBus (mitt) ◄───────┘     ├─ PreloadScene   │
│        UI → Game: "weapon:use", "debug:*"  ├─ RunScene       │
│        Game → UI: "hit", "combo", "event"  └─ UIFxScene(opt) │
└──────────────────────────────────────────────────────────────┘
```

**Rules**
1. **Phaser owns the world** (movement, collisions, particles, camera). **React owns menus and HUD.**
2. High-frequency values (positions, per-frame timers) stay inside Phaser. Only **low-frequency** values (HP, taka, combo, active event, stamina rounded to integers) go to Zustand, throttled to ~10 Hz.
3. Phaser is created **only on the client**: dynamic import inside `useEffect`; never at module top level (avoids SSR crashes).
4. Destroy the game on unmount (`game.destroy(true)`) and guard React Strict Mode double-mount.
5. Use a typed event bus (`mitt`) for commands: `UI → Game` (`weapon:use`, `event:trigger`, `event:bribe`, `game:pause`) and `Game → UI` (`hit`, `combo`, `villain:dead`, `event:started`, `event:ended`).

---

## 4. PROJECT STRUCTURE

```text
src/
├── app/
│   ├── layout.tsx                # fonts, metadata, viewport
│   ├── page.tsx                  # <AppShell/>
│   └── globals.css
├── components/
│   ├── shell/AppShell.tsx        # screen state machine: BOOT → LOBBY → PLAYING → GAME_OVER
│   ├── loading/LoadingScreen.tsx # progress, tips, lottie, tap-to-start
│   ├── lobby/
│   │   ├── FaceUploader.tsx      # upload, auto-detect, manual crop, cartoonify
│   │   ├── VillainPreview.tsx    # live rig preview (mini Phaser or CSS)
│   │   ├── WeaponSelector.tsx
│   │   └── SettingsSheet.tsx     # sound, haptics, quality, language
│   ├── game/
│   │   ├── GameHost.tsx          # mounts/destroys Phaser
│   │   ├── HudOverlay.tsx        # HP, rage, taka, combo, event timer
│   │   ├── WeaponDock.tsx        # 4 arcade buttons + ultimate
│   │   ├── EventBanner.tsx       # breaking-news ticker, event cards
│   │   ├── BribeButton.tsx
│   │   └── DebugBar.tsx          # god-mode panel (collapsible)
│   └── gameover/GameOverScreen.tsx
├── game/                         # PURE Phaser code (no React)
│   ├── createGame.ts             # builds Phaser.Game config
│   ├── scenes/
│   │   ├── BootScene.ts          # generate procedural textures, fonts check
│   │   ├── PreloadScene.ts       # load manifest, emit progress
│   │   └── RunScene.ts           # main gameplay
│   ├── entities/
│   │   ├── CharacterRig.ts       # jointed rig + face slot
│   │   ├── Villain.ts            # AI, HP, hit reactions
│   │   ├── Chaser.ts             # player silhouette
│   │   ├── Projectile.ts         # chappal, bricks
│   │   └── Obstacle.ts
│   ├── systems/
│   │   ├── ParallaxSystem.ts
│   │   ├── CombatSystem.ts       # weapons, combo, damage
│   │   ├── EventSystem.ts        # world events runtime
│   │   ├── SpawnSystem.ts        # obstacles, pickups, crowd
│   │   ├── DifficultySystem.ts
│   │   └── FxSystem.ts           # shake, hit-stop, particles, floating text
│   ├── fx/                       # smog, blackout, vignette helpers
│   └── bus.ts                    # typed mitt event bus
├── store/useGameStore.ts
├── config/
│   ├── weapons.ts
│   ├── villains.ts
│   ├── events.json               # data-driven world events (zod validated)
│   ├── assetManifest.ts          # everything the loader needs + weights
│   ├── tips.ts                   # loading-screen tips (EN + BN)
│   └── balance.ts                # tunable numbers in one place
├── services/
│   ├── audio.ts                  # sound manager + synth fallback
│   ├── eventService.ts           # local JSON now, Supabase later
│   ├── faceService.ts            # MediaPipe + fallback logic
│   └── haptics.ts
└── lib/ (math.ts, storage.ts, device.ts)
public/assets/{sprites,backgrounds,audio,lottie,fonts}/
```

---

## 5. SCREEN FLOW & UX

```
Splash/Loading  →  Lobby (Face + Weapons)  →  Playing  →  Game Over / Results  →  (Retry | Change Face)
                                  ↑                              │
                                  └──────────────────────────────┘
```

### 5.1 Loading Screen (important)
**Goal:** feel instant, funny, and never look frozen.

**Visual**
- Full-screen dark-yellow "Dhaka rickshaw-art" gradient background with subtle moving halftone dots.
- Centre: Lottie (or CSS) animation of a **chappal flying across** and a progress bar shaped like a **road**, with a tiny running rickshaw as the progress marker.
- Big comic title with a GSAP letter-by-letter pop-in.
- Rotating **loading tip** every 2.5 s (EN + BN), e.g. "Tip: Land 5 hits in a row to trigger RAGE MODE!" / "টিপস: টানা ৫টা হিট মারলেই রেজ মোড!"
- When 100%: the bar fills, then a pulsing **"TAP TO START / শুরু করতে ট্যাপ করুন"** button appears. The tap is **required** because browsers block audio until a user gesture; it unlocks WebAudio.

**Loading parameters (tracked in a single `loading` state, weighted into one progress %)**
| Task | Weight | Notes |
|---|---|---|
| Fonts ready (`document.fonts.ready` + explicit `document.fonts.load` for Bangla + comic font) | 10% | Phaser text must not render before fonts load. |
| Phaser JS chunk (dynamic import) | 15% | Show progress via simulated ease until resolved. |
| Texture/atlas assets (Phaser loader `progress` event) | 35% | Backgrounds, obstacles, VFX. |
| Audio assets (decode) | 20% | Load critical SFX first; BGM streams last/lazily. |
| Face model warm-up (MediaPipe WASM + model, **lazy, non-blocking**) | 15% | If slower than 6 s, skip and use manual crop; never block start. |
| Procedural texture generation (rig parts) | 5% | Done in `BootScene`. |

Rules:
- **Minimum display time 1.2 s** (avoids flash), **maximum 12 s** before showing "Slow network? Play anyway" button.
- Progress must be **monotonic** (never goes backwards) and eased with GSAP/Framer spring.
- On any asset failure: log, use fallback, continue. Show a tiny non-blocking toast, not an error screen.
- Persist `hasSeenIntro` in `localStorage`; on repeat visits use the short loader.
- Store loaded status flags in Zustand: `{ fontsReady, engineReady, assetsProgress, audioReady, faceModelReady, overall }`.

### 5.2 Lobby
- **Step 1 – Face:** drag & drop / click / mobile camera (`<input type="file" accept="image/*" capture="user">`). Auto-detect face with MediaPipe; show circular crop with zoom/pan; if detection fails, show manual crop automatically. Buttons: *Use Default Funny Face*, *Retake*, *Clean Cutout (optional)*.
- **Cartoonify the face texture**: thick black outline, slight contrast/saturation boost, optional halftone filter, drop shadow. Output a 256×256 PNG data URL (keep memory low).
- **Live preview:** the villain rig runs in place in a small preview, wearing the new face. This is the "wow" moment.
- **Step 2 – Name the target** (text input, 20 chars, default "Chor Neta").
- **Step 3 – Loadout:** weapon cards with stats; show cooldown/damage bars.
- **Start button:** "রাস্তায় নামাও (Rastay Namau)". Include a settings gear and a short "Satire only" notice (see section 17).

### 5.3 Game HUD (React over Phaser)
- Top-left: villain name + **villain HP bar** (red, with white "damage lag" trail).
- Top-center: **world-event banner/timer**.
- Top-right: pause, sound, collapsible Debug Bar.
- Left-middle: **Rage meter** (fills with hits; at 100% unlocks ULTIMATE).
- Bottom-left: **Taka** counter (animated count-up) and **Stamina** bar.
- Bottom: **Weapon dock** with cooldown radial sweeps; big **ULTIMATE** button above when ready.
- Center: combo counter ("x7 COMBO!") with scale-pop animation.

### 5.4 Game Over / Results
- Triggers: villain HP = 0 (**WIN: "Dhora Khaise!"**), or timer/escape distance exceeded (**LOSE: "Palaise!"**).
- Show: rage score, chappals landed, longest combo, taka earned/spent, event survived count, rank title (Bangla funny titles).
- Buttons: *Retry*, *Change Face*, *Share screenshot* (Canvas `toBlob` → Web Share API, local only).

---

## 6. CHARACTER RIG (MOVABLE CHARACTERS)

All characters (villain and chaser) are **jointed puppet rigs** built from separate sprites inside a `Phaser.GameObjects.Container`. Parts are drawn procedurally at boot (`Graphics.generateTexture`) so **no external art is needed**; replace with PNG parts later without code changes.

### 6.1 Parts and hierarchy
```
root (Container, origin at feet)
├── shadow (ellipse)
├── backArm   (upper → lower → hand)
├── backLeg   (thigh → shin → foot/shoe)
├── torso     (shirt/panjabi shape)
├── frontLeg  (thigh → shin → foot)
├── frontArm  (upper → lower → hand)
├── neck
└── headGroup (Container)
    ├── faceSprite  (circular uploaded face, origin 0.5)
    ├── hair/cap/topi (optional accessory slot)
    └── expressionOverlay (sweat drops, stars, "!" marks)
```
Each limb is a nested container with its pivot at the joint, so rotating the parent swings the child naturally.

### 6.2 Procedural run cycle (in `update(time, delta)`)
```ts
const t = time * 0.001 * runSpeedFactor * 2 * Math.PI * cadence; // cadence ≈ 1.6 steps/sec
frontLeg.thigh.rotation =  Math.sin(t) * 0.9;
frontLeg.shin.rotation  =  Math.max(0, -Math.sin(t + 0.6)) * 1.1;   // knee bends on back-swing
backLeg.thigh.rotation  =  Math.sin(t + Math.PI) * 0.9;
backLeg.shin.rotation   =  Math.max(0, -Math.sin(t + Math.PI + 0.6)) * 1.1;
frontArm.upper.rotation =  Math.sin(t + Math.PI) * 0.8;
backArm.upper.rotation  =  Math.sin(t) * 0.8;
torso.y = Math.abs(Math.sin(t)) * -6;                                 // vertical bounce
headGroup.rotation = Math.sin(t * 2) * 0.08;                          // head wobble
headGroup.y = torso.y + Math.sin(t * 2 + 0.5) * 2;                    // secondary motion lag
```
- **Cadence scales with speed** (smog slows it; panic after being hit speeds it up).
- **Squash & stretch:** on landing steps scale torso `(1.05, 0.95)`, tween back in 80 ms.
- **Face attachment:** `faceSprite` is a child of `headGroup`; display size ≈ 70 px, so the oversized head is comedic (big-head style). Scale face with a `Back.Out` tween on shock.

### 6.3 States (finite state machine)
`RUN → HIT_STUN → STAGGER_RECOVER → RUN`, plus `TRIPPED` (strike obstacles), `COUGH` (pollution), `PANIC_SPRINT` (after combo), `DEAD`.
- **HIT_STUN:** 120 ms hit-stop freeze, red flash via `setTintFill(0xff0000)` on all parts for 100 ms, knockback tween (x offset, ease `Quad.Out`), face scale 1.0 → 1.35 → 1.0, eyes swap to "X/shock" overlay, sweat particles.
- **DEAD:** rig ragdoll-ish: parts get random angular velocity and gravity, face spins off with a bounce, comic "KO" stars.
- **COUGH:** every 1.2 s the torso doubles over (rotation +0.3) and a "কাশি!" bubble pops.

### 6.4 Chaser (player)
Silhouette rig on the far left, lane-synced with the villain (smooth lane following). Plays attack animations: kick (leg swing), punch (arm lunge), slap (arm arc), throw (arm overhead + release). Weapon animations must **match** the weapon effects timing (impact frame at ~100 ms).

### 6.5 Face texture pipeline (runtime)
```ts
// Called when game starts or when face changes
function installFaceTexture(scene: Phaser.Scene, dataUrl: string, key = 'target-face') {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  return new Promise<void>((resolve) => {
    scene.textures.once(Phaser.Textures.Events.ADD, () => resolve());
    scene.textures.addBase64(key, dataUrl);
  });
}
```
- Face is square 256×256 PNG with transparent circular mask baked in (done in lobby via offscreen canvas).
- Generate **3 expression variants** programmatically from the same texture: *normal*, *shocked* (scale + red tint overlay + open-mouth sticker), *dizzy* (spiral eyes sticker). Stickers are overlay sprites; the face itself is never distorted.

---

## 7. GAMEPLAY SPEC

### 7.1 World and camera
- Fixed logical resolution **1280×720**, `Phaser.Scale.FIT` + `autoCenter`. Landscape recommended; on portrait show "Rotate your phone" overlay (or support 720×1280 with adapted layout later).
- **3 lanes** (y positions e.g. 520, 580, 640) with depth sorting by y and scale (`0.9 / 1.0 / 1.1`). Villain switches lanes to dodge; the chaser follows.
- Camera follows loosely with lerp (0.08) and applies shake/zoom pulses on big hits.

### 7.2 Parallax (5 layers)
1. Sky (static + slow clouds, tint shifts with event)
2. Far skyline (silhouetted Dhaka skyline, factor 0.1)
3. Mid buildings with rickshaw-art posters, shop signs, hanging wires (0.3)
4. Near storefronts, lamp posts, footbridge cut-outs (0.6)
5. Road (tileSprite with lane markings, speed 1.0) + foreground props (1.3: rickshaws, CNG, buses passing)
Use `TileSprite` for repeating layers; spawn random props with object pooling.

### 7.3 Villain behaviour
- Base run speed from `balance.ts`. Keeps distance from the chaser; if player is idle too long, villain gains distance (**escape meter**). Too much distance = LOSE.
- Dodge AI: 20% chance to switch lane when a projectile is "locked on".
- Sprint burst after taking 3 hits in 2 s (panic sprint, 1.5 s).
- Has **HP** (default 300). Variants in `villains.ts` (different HP/speed/outfit/accessory) for replayability: *Chor Neta*, *Dalal*, *Bhua Dr.*, *Traffic Sergeant*.

### 7.4 Weapons (data in `weapons.ts`)
| Weapon | Bangla | Damage | Cooldown | Range / Delivery | Special |
|---|---|---|---|---|---|
| Slap | থাপ্পড় | 25 | 0.5 s | Melee, needs chaser close; giant hand sprite | Face spin + big shock face |
| Punch | ঘুষি | 40 | 0.9 s | Melee giant fist | Knockback strong, shake medium |
| Kick | লাথি | 55 | 1.4 s | Melee giant foot | Launches villain, may trip him |
| Flying Chappal | উড়ন্ত চপ্পল | 30 | 1.0 s | Ranged, parabolic projectile, rotates, trail | Can bounce to a 2nd target (obstacle/crowd) for bonus |
| **ULTIMATE: Chappal Storm** | চপ্পল ঝড় | 150 | Rage 100% | 12 chappals rain with screen zoom | Short slow-mo, rainbow flash |

Hit rules: each weapon spawns an **impact frame** (comic "THAPPOR!" burst), **hit-stop** (60–120 ms), **camera shake** (intensity scales with damage), damage number, particles, SFX, haptic pulse.
Melee requires `distance < meleeRange`; otherwise the chaser auto-dashes a short burst toward the villain (costs stamina). Chappal works at any distance but can be dodged / hit obstacles.

### 7.5 Chappal projectile math
```ts
// Parabolic arc from start (sx,sy) to target (tx,ty) over duration d (ms), peak height h
const p = Phaser.Math.Clamp(elapsed / d, 0, 1);
x = Phaser.Math.Linear(sx, tx, p);
y = Phaser.Math.Linear(sy, ty, p) - 4 * h * p * (1 - p);
rotation += spinSpeed * dt;
```
- Predict target position (`tx = villain.x + villain.vx * d/1000`) so the throw lands.
- Trail: Phaser particle emitter following the chappal (dust streak).
- On miss: chappal bounces and exits; spawns "Miss!" text; combo resets.

### 7.6 Combo, Rage, Taka, Stamina
- **Combo:** each hit within 1.5 s extends combo; multiplier = `1 + 0.1 * combo` capped at 3.0. Combo break resets.
- **Rage meter:** +8 per hit (+bonus for chappal head-shot), −2/s decay; at 100% unlock ULTIMATE.
- **Taka:** +10 per hit × multiplier; used for bribes and power-ups.
- **Stamina:** 0–100; dashes and spammed attacks drain it; regenerates 12/s idle. **Pollution reduces regen and max speed.** At 0 stamina attacks slow down (cooldown ×1.5).

### 7.7 Power-ups (pickups on road, optional in T12)
- **Biriyani:** restores stamina.
- **Cha-er Cup:** attack speed +30% for 6 s.
- **Mobile Data Pack:** auto-aim chappals for 8 s.
- **Helmet (against bricks)** shield for 1 hit.

### 7.8 Difficulty ramp (`DifficultySystem`)
Every 20 s: villain speed +3%, obstacle density +5%, event frequency up. Cap values in `balance.ts`.

---

## 8. WORLD EVENT ENGINE (DATA-DRIVEN)

Events come from JSON, validated by `zod`, executed by `EventSystem` using a **list of effects**, so new events need no code changes.

### 8.1 Schema (`src/config/events.json`)
```json
{
  "currentTrendingHeadline": "হঠাৎ কারেন্ট গায়েব! মোমবাতি খুঁজে পাওয়া যাচ্ছে না!",
  "events": [
    {
      "id": "evt_loadshedding",
      "type": "LOADSHEDDING",
      "title": { "bn": "বিদ্যুৎ বিভ্রাট!", "en": "Loadshedding!" },
      "ticker": { "bn": "ব্রেকিং: এলাকায় লোডশেডিং!", "en": "BREAKING: Power cut across the city!" },
      "description": { "bn": "লাইনম্যানকে ১০০ টাকা দিলে এখনই কারেন্ট আসবে!", "en": "Bribe the lineman 100 Taka for instant power!" },
      "durationSec": 20,
      "weight": 3,
      "cooldownSec": 40,
      "bypass": { "enabled": true, "costTaka": 100, "label": { "en": "Pay 100 Taka to the Lineman", "bn": "লাইনম্যানকে ১০০ টাকা দিন" } },
      "effects": [
        { "kind": "overlay", "name": "blackout", "params": { "alpha": 0.95, "eyes": true } },
        { "kind": "sfx", "name": "powercut" }
      ]
    },
    {
      "id": "evt_pollution",
      "type": "POLLUTION",
      "title": { "bn": "তীব্র বায়ুদূষণ! (AQI 450+)", "en": "Severe Air Pollution (AQI 450+)" },
      "ticker": { "bn": "সতর্কতা: AQI বিপজ্জনক!", "en": "ALERT: AQI hazardous!" },
      "description": { "bn": "দম নিতে কষ্ট হচ্ছে, স্পিড কমে গেছে!", "en": "Can't breathe, everyone slows down!" },
      "durationSec": 25,
      "weight": 3,
      "cooldownSec": 40,
      "bypass": { "enabled": true, "costTaka": 50, "label": { "en": "Buy an N95 Mask (50 Taka)", "bn": "মাস্ক কিনুন (৫০ টাকা)" } },
      "effects": [
        { "kind": "overlay", "name": "smog", "params": { "alpha": 0.45, "particles": true } },
        { "kind": "modifier", "target": "speed", "multiplier": 0.6 },
        { "kind": "modifier", "target": "staminaRegen", "multiplier": 0.4 },
        { "kind": "status", "name": "cough", "intervalSec": 1.2 },
        { "kind": "sfx", "name": "cough" }
      ]
    },
    {
      "id": "evt_strike",
      "type": "STRIKE",
      "title": { "bn": "গার্মেন্টস স্ট্রাইক ও অবরোধ!", "en": "Garments Strike & Blockade!" },
      "ticker": { "bn": "ব্রেকিং: রাস্তায় প্রচণ্ড জ্যাম!", "en": "BREAKING: Massive traffic jam!" },
      "description": { "bn": "বাধার ভেতর দিয়েই দৌড়াতে হবে!", "en": "Run through the chaos!" },
      "durationSec": 20,
      "weight": 2,
      "cooldownSec": 40,
      "bypass": { "enabled": false, "costTaka": 0 },
      "effects": [
        { "kind": "spawner", "name": "crowd", "params": { "density": 0.8, "bricks": true, "burningTires": true } },
        { "kind": "modifier", "target": "speed", "multiplier": 0.75 },
        { "kind": "bonus", "name": "villainTripped", "comboBonus": 1.5 },
        { "kind": "sfx", "name": "siren" }
      ]
    }
  ]
}
```
Note: durations are **compressed for gameplay** (20–25 s). The real-world durations (10 min etc.) are flavour text only. Strings are `{bn, en}` so a language toggle works everywhere.

### 8.2 Runtime behaviour (`EventSystem`)
- Scheduler picks a random event by `weight` every 25–45 s (respecting `cooldownSec` and "no two events at once", unless debug-forced).
- On start: emit `event:started`, apply effects, show ticker banner (slide-in via Framer Motion), play SFX, store `activeEvent` and `eventTimeLeft`.
- On end or bypass: cleanly **revert every effect** (overlay fade-out 400 ms, modifiers removed). Each effect implements `apply()` and `revert()`.
- Effects registry: `overlay`, `modifier`, `status`, `spawner`, `sfx`, `bonus`. Unknown kinds log a warning and are ignored.

### 8.3 Visual implementations
- **Blackout:** a Phaser `RenderTexture` the size of the screen filled with black at 0.95 alpha; each frame **erase** a soft radial glow at the villain's head and chaser's head so only glowing eyes/faces peek through. Draw two white cartoon eyes with pupils that follow the chaser. Add a faint blue "moonlight" vignette and flicker occasionally.
- **Smog:** two scrolling fog `TileSprite`s (tinted brown-grey, 0.3–0.45 alpha) + dust particle emitter + `camera.postFX.addVignette` + subtle `addColorMatrix().sepia()` + slight blur on far parallax layers. Coughing characters show a bubble sprite.
- **Strike:** barricades (bamboo/tyre/cones), burning tires (fire particle emitter with additive blend), stick-figure protesters carrying flags walking across lanes, thrown bricks (arcing projectiles with warning shadow on the ground, 0.6 s telegraph). Villain may trip → `TRIPPED` state gives bonus combo window.
- **Custom viral events:** a future event with `type: "CUSTOM_VIRAL"` can use any combination of the above effects plus a custom `ticker`. Include 2 sample viral events in JSON (e.g., "Rickshaw Rush Hour", "Eid Shopping Rush") to prove extensibility.

---

## 9. UI / ANIMATION GUIDE (MAKE IT FEEL SMOOTH)

**Design language:** Bangladeshi truck/rickshaw-art meets comic book. Saturated yellow/red/teal, thick black outlines, halftone textures, bold comic fonts, slightly tilted UI elements.

**Framer Motion patterns**
- Screen transitions: `AnimatePresence` with scale+fade (180 ms).
- Buttons: `whileTap={{ scale: 0.92 }}` + `whileHover={{ y: -2 }}`; cooldown shown as a conic-gradient overlay.
- Combo counter: key by combo number → spring pop (`stiffness: 500, damping: 18`).
- Event banner: slide from top with a slight bounce; ticker text scrolls using CSS marquee.
- Taka counter: count-up animation (Framer `animate` or GSAP).

**Phaser FX patterns (inside `FxSystem`)**
- `hitStop(ms)`: set `scene.time.timeScale` and `physics.world.timeScale` ≈ 0.05 for N ms using real-time `setTimeout`.
- `shake(intensity, ms)`: `cameras.main.shake`.
- `flash`: `cameras.main.flash(60, 255, 255, 255)` on heavy hits.
- `floatText(x,y,text,color)`: pooled `Text` objects, tween y−80, alpha→0, scale pop, comic stroke.
- `impactBurst(x,y,word)`: star-shaped burst sprite + onomatopoeia ("THAPPOR!", "GUSI!", "LATTHI!", "CHAPPAL!") rotated randomly.
- Slow-mo for ULTIMATE: `scene.time.timeScale = 0.4` for 600 ms.
- Respect `prefers-reduced-motion`: disable shake/flash intensity (setting in Settings sheet).

**Accessibility:** Large touch targets (≥ 56 px), colour-blind-safe cues (icons with colour), sound/haptics toggles, Bangla/English toggle, readable contrast on HUD.

---

## 10. AUDIO

- `audio.ts` exposes `play(name, {volume, rate, detune})`, `playBgm()`, `setMuted()`, `unlock()` (called on "TAP TO START").
- Randomise pitch ±8% per play to avoid repetition fatigue; cap simultaneous voices per sound (max 4).
- **Sounds needed:** slap, punch, kick, chappal whoosh, chappal hit, combo-up, ultimate, powercut, siren, cough, crowd murmur loop, horn, taka coin, UI click, win, lose, BGM loop (upbeat desi-funk, ≤ 90 s loop).
- **Synth fallback** (Web Audio oscillators/noise) generates: slap (short noise burst + highpass), punch (low thump), whoosh (filtered noise sweep), coin (two sine blips), cough (noise bursts), powercut (descending sine), siren (alternating square). If a file fails to load, silently use the synth.
- Free sources (verify each license; prefer CC0): Freesound, Kenney, OpenGameArt, Mixkit, Pixabay. Keep `CREDITS.md`.

---

## 11. PERFORMANCE & MOBILE

- Target **60 FPS** on mid-range Android; budget: JS bundle for game route < 1.5 MB gzip (Phaser is large; code-split it and load only on the game route), textures < 20 MB total.
- Object pooling for projectiles, floating text, particles, obstacles, crowd members. **No `new` allocations in `update`.**
- Cap particles (e.g., 150 active); a **Quality** setting (High / Low) scales particle counts, disables post-FX and shadows on Low. Auto-detect low FPS (< 40 for 3 s) and propose Low.
- Cap devicePixelRatio at 2. Use `Phaser.Scale.FIT`. Pause the game when the tab is hidden (`visibilitychange`).
- Prefer texture atlases (TexturePacker free / `free-tex-packer`) once art exists; compress backgrounds to WebP.
- Touch: multi-touch enabled; weapon buttons respond on `pointerdown` (not `click`). `touch-action: none` on the game container; prevent pinch zoom and long-press menu.
- Haptics: `navigator.vibrate(10–40)` on hits where supported.

---

## 12. DATA & PERSISTENCE (Phase 1, local only)

`localStorage` keys: `settings`, `lastFaceDataUrl` (so returning players skip upload; store small 256 px version), `bestScore`, `totalChappals`, `unlockedVillains`.
Wrap in `lib/storage.ts` with try/catch (private mode can throw).

---

## 13. ASSET PLAN (NEVER BLOCK ON ASSETS)

**Tier 0 — procedural (must work out of the box):** rig parts, chappal, barricades, tyres, fire, crowd stick-figures, buildings (rectangles with windows + signs), clouds, road, UI shapes, all SFX (synth). Generated in `BootScene` via `Graphics.generateTexture`.
**Tier 1 — nicer art (optional drop-in):** replace textures by key in `assetManifest.ts`; if the file exists use it, else fall back to Tier 0. Sources: Kenney (CC0), OpenGameArt, itch.io free packs, or AI-generated/hand-drawn sprites exported as transparent PNG/WebP. Keep **consistent style** (thick outline, flat colours).
**Tier 2 — polish:** Lottie loader animation, rickshaw-art posters, custom BGM.

`assetManifest.ts` format:
```ts
export const manifest = [
  { key: 'bg-sky',   type: 'image', url: '/assets/backgrounds/sky.webp',   weight: 2, critical: true,  fallback: 'gen:sky' },
  { key: 'sfx-slap', type: 'audio', url: '/assets/audio/slap.mp3',          weight: 1, critical: true,  fallback: 'synth:slap' },
  { key: 'bgm',      type: 'audio', url: '/assets/audio/bgm.mp3',           weight: 6, critical: false, lazy: true },
] as const;
```

---

## 14. IMPLEMENTATION TICKETS (EXECUTE IN ORDER)

Each ticket: **Goal → Tasks → Acceptance Criteria (AC)**. Do not proceed until AC passes.

### T00 — Scaffolding (30 min)
- `npx create-next-app@latest dhaka-rage-runner --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Install: `phaser zustand mitt framer-motion gsap lucide-react zod clsx nanoid lottie-react react-easy-crop @mediapipe/tasks-vision` (+ dev: `vitest @playwright/test`).
- Set up `next/font` (comic display + Bangla), Tailwind theme colours, `globals.css` (disable text selection, overscroll, `touch-action`).
- Create the folder structure from section 4 with empty placeholder files.
- **AC:** `npm run dev` shows a styled placeholder; `npm run build` passes; no SSR errors.

### T01 — State, event bus, config (45 min)
- `useGameStore.ts` (with `subscribeWithSelector`): `screen` (`BOOT|LOBBY|PLAYING|PAUSED|GAME_OVER`), `loading{...}`, `targetFaceUrl`, `targetName`, `villainId`, `villainHp/maxHp`, `rageScore`, `rage`, `combo`, `taka` (500), `stamina`, `activeEvent` + `eventTimeLeft`, `settings{sound,haptics,quality,lang,reducedMotion}`; actions: `setTargetFace`, `startGame`, `inflictDamage`, `addTaka`, `spendTaka`, `setEvent`, `clearEvent`, `resetRun`, `setLoading`.
- `game/bus.ts` typed with `mitt` (event names from section 3).
- `config/weapons.ts`, `balance.ts`, `villains.ts`, `tips.ts`, `events.json` + `eventService.ts` (zod validation, returns typed events).
- **AC:** unit tests for `spendTaka` (cannot go negative), combo multiplier, and event JSON validation pass.

### T02 — Boot & Loading Screen (1.5 h)
- `LoadingScreen.tsx` per section 5.1 (road progress bar, tips, Lottie or CSS fallback, GSAP title, tap-to-start).
- Progress aggregation with weights; monotonic + eased; min 1.2 s; "Play anyway" after 12 s.
- Font loading; lazy `import('phaser')`; audio `unlock()` on tap.
- **AC:** throttle network to Slow 3G → progress moves smoothly, never freezes at 0%, never goes backwards; tap unlocks audio; the Lobby appears after tap.

### T03 — Face pipeline & Lobby (2 h)
- `faceService.ts`: lazy-init MediaPipe FaceDetector (GPU delegate → CPU fallback). Returns bounding box (expanded 40%).
- `FaceUploader.tsx`: drop/click/camera, auto-crop using detected box, `react-easy-crop` circular manual adjust (zoom/pan sliders), buttons for default funny face (generated procedurally: simple caricature drawn on canvas) and "Clean cutout (beta)" (lazy `@imgly/background-removal`).
- Cartoonify on offscreen canvas: circular clip, thick outline, contrast boost, 256×256 PNG data URL → `setTargetFace`.
- Resize large images first (max 1024 px) to protect memory; revoke object URLs.
- **AC:** upload a 12 MP photo → detected/cropped in < 2 s on desktop; manual fallback works with model blocked (test by blocking the model URL); preview thumbnail correct; face persists after refresh.

### T04 — Phaser host & Run scene skeleton (1.5 h)
- `GameHost.tsx` (client-only, Strict-Mode safe create/destroy). `createGame.ts` config: 1280×720, FIT, `transparent: false`, `pixelArt: false`, `roundPixels: false`, `fps: { target: 60 }`, input multi-touch.
- `BootScene` generates procedural textures; `PreloadScene` loads the manifest and reports progress via bus; `RunScene` starts.
- Parallax system (5 layers) with pooling; 3-lane road.
- **AC:** street scrolls smoothly at 60 FPS (check with Phaser FPS counter in debug), no memory growth after 3 minutes (check heap in DevTools), resizing the window keeps aspect ratio.

### T05 — Character rig & face attachment (2 h)
- `CharacterRig.ts` with the hierarchy, run cycle, states (section 6). Villain wears `target-face` texture; install face texture before spawn.
- Preview in Lobby: small Phaser instance or a shared one rendering a running rig in place.
- Chaser silhouette rig on left.
- **AC:** limbs swing naturally, head bobs, face stays attached and centred on neck at all frames, changing the face updates the villain without reload, cadence changes with speed.

### T06 — Combat: weapons, hit reactions, FX (2.5 h)
- `CombatSystem`, `Projectile`, `FxSystem`. Implement all 4 weapons + hit reactions (hit-stop, red flash, knockback, face shock scale, camera shake, impact burst text, floating damage, particles, taka and rage gain, combo).
- `WeaponDock.tsx` with pointer-down handling, cooldown sweeps, keyboard shortcuts (`1–4`, `Space` ultimate) for desktop.
- Villain HP, win condition, DEAD state animation.
- **AC:** each weapon has distinct feel; chappal arc lands on the moving villain; spam-clicking doesn't break cooldowns; combo and rage update in HUD; no frame drops during hits.

### T07 — HUD & game flow (1.5 h)
- `HudOverlay`, `GameOverScreen`, pause menu, results with rank titles, retry/change face.
- Zustand sync from Phaser throttled to 10 Hz; HUD animations via Framer Motion.
- **AC:** HUD never causes Phaser FPS drops (React Profiler shows no per-frame renders); pause freezes game + audio; game over shows correct stats.

### T08 — Event engine core (1.5 h)
- `EventSystem` with scheduler, effect registry, `apply/revert`, cooldowns, bus events, `EventBanner` (ticker + card), `BribeButton`.
- **AC:** forced events start/stop cleanly with no leftover modifiers (verify speed returns to normal), bribe deducts taka and ends the event, insufficient taka shows a shake animation on the button.

### T09 — Loadshedding & Pollution visuals (2 h)
- Blackout RenderTexture with glowing eyes (section 8.3), flicker, countdown ring; smog layers, particles, vignette, cough status + speed/stamina modifiers.
- **AC:** blackout shows only eyes/faces glow; smog visibly reduces visibility and slows movement by ~40%; both revert smoothly in 400 ms; performance stays ≥ 50 FPS on Low quality.

### T10 — Strike event & obstacle spawner (1.5 h)
- Barricades, burning tires, crowd members, thrown bricks with telegraph shadows, villain trip + bonus combo window, `SpawnSystem` pooling.
- **AC:** obstacles spawn in lanes, bricks can be dodged by lane change (chaser auto-dodge optional), trip window grants bonus; no entity leaks after event ends (object counts return to baseline).

### T11 — Audio system (1 h)
- `audio.ts` with synth fallback, voice limiting, pitch randomisation, BGM ducking during events; hook all game events.
- **AC:** every action has sound with files absent (synth) and with files present; mute works; no audio before the tap-to-start.

### T12 — Difficulty, power-ups, villain variants, ultimate (1.5 h)
- `DifficultySystem`, pickups (biriyani, cha, data pack, helmet), 3 extra villains in `villains.ts`, ULTIMATE "Chappal Storm" with slow-mo.
- **AC:** difficulty ramps measurably over 2 minutes; ultimate usable only at 100% rage; villains differ visibly and in stats.

### T13 — Debug bar & demo mode (45 min)
- `DebugBar.tsx` (top-right, collapsible, hidden unless `?debug=1` or tapped 5× on the logo): trigger each event, +500 taka, fill rage, kill villain, toggle FPS, force quality, slow-mo slider, spawn obstacle.
- Demo mode flag (`?demo=1`): loads default face, skips lobby, schedules events at fixed timestamps for a scripted showcase.
- **AC:** every button works mid-game without crashes.

### T14 — Polish, PWA, QA & deploy (2 h)
- Run the **polish checklist** (section 15); add Serwist PWA (cache assets, offline play after first load); metadata, favicon, OG image; `CREDITS.md`, `README.md` with run instructions.
- Playwright smoke test: load → tap start → use default face → play 10 s → trigger each event → game over.
- Deploy to Vercel; test on a real Android phone and an iPhone.
- **AC:** Lighthouse performance ≥ 80 on mobile for the shell; smoke test passes; no console errors.

---

## 15. POLISH CHECKLIST

- [ ] Every button has hover/tap feedback and sound.
- [ ] First hit within 10 s of starting (tutorial prompt: "Tap CHAPPAL!" with pulsing arrow, shown once).
- [ ] Hit-stop, shake, flash tuned so it's punchy but not nauseating; reduced-motion mode works.
- [ ] No text overflow in Bangla or English; fonts load before Phaser text is created.
- [ ] Safe-area insets respected on iPhone notch (`env(safe-area-inset-*)`).
- [ ] Works in portrait gracefully (rotate prompt) and in landscape at 16:9, 18:9, 4:3.
- [ ] Tab hidden → game pauses; returning shows pause menu.
- [ ] Memory stable after 10 minutes of play.
- [ ] Face upload never leaves the device (verify in Network tab).
- [ ] All timers/listeners/tweens cleaned on scene shutdown.

---

## 16. PHASE 2 — BACKEND BLUEPRINT (DO NOT BUILD IN PHASE 1)

Keep `eventService.ts` behind an interface so swapping the data source needs no game changes:
```ts
export interface EventProvider {
  getEvents(): Promise<WorldEvent[]>;
  subscribe?(cb: (e: WorldEvent) => void): () => void; // realtime push
}
```
**Supabase tables**
1. `world_events`: `id uuid pk`, `type text`, `title jsonb {bn,en}`, `ticker jsonb`, `description jsonb`, `duration_sec int`, `weight int`, `cooldown_sec int`, `bypass jsonb`, `effects jsonb`, `is_active bool`, `starts_at timestamptz`, `ends_at timestamptz`.
2. `leaderboard`: `id uuid pk`, `nickname text`, `rage_score bigint`, `chappals_landed int`, `longest_combo int`, `villain_id text`, `created_at timestamptz`.
- Row Level Security: public read; insert leaderboard rows only via an edge function that validates plausible scores (basic anti-cheat); events writable by admins only.
- **Never upload face images.** Only scores and nicknames. Moderate nicknames (profanity filter).
- Realtime channel `world_events` pushes viral events live; the client merges them into the scheduler.

---

## 17. RESPONSIBLE USE (BUILD THIS IN)

The game is **satire for fun and stress relief**. Because it uses real faces:
- Process faces **locally only**; never upload or store them on a server; no public sharing of the generated villain by default.
- Show a short first-run notice: "Satire only. Use faces you have permission to use. Don't harass real people."
- Cartoonify strongly, keep violence **cartoonish** (comic words, no gore, no realistic injury).
- Provide default fictional villains so the game is fully playable without any real person's photo.
- Add a "Clear my data" button in Settings that wipes `localStorage` and the in-memory face.

---

## 18. DEFINITION OF DONE

- Upload a photo → face detected/cropped → cartoon face appears on a **running, animated, jointed character** in the preview.
- Street scrolls with 5-layer parallax in 3 lanes at ~60 FPS on desktop and a mid-range phone.
- All 4 weapons + ultimate work with strong hit feedback; combo/rage/taka/stamina systems function.
- Loadshedding, Pollution and Strike events trigger automatically and via Debug Bar, apply modifiers, and revert cleanly; bribes work.
- Loading screen has weighted progress, tips, tap-to-start audio unlock, graceful fallbacks.
- Game over screen with stats; retry flow works; settings persist.
- Build passes, smoke test passes, deployed URL works on mobile.

**Now wait for the user to say `BEGIN`, then execute T00 → T14 in order.**
