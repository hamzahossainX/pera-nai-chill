# Pera Nai Chill (ঢাকা রেজ রানার — Dhaka Rage Runner)

> **প্যারা নাই চিল!** A satirical, stress-relief 2D comic action-runner web game set on the chaotic streets of Dhaka.

---

## 🎮 Overview

Customize your target villain with any photo or pick from hilarious presets (The Corrupt Politician, The Syndicate Lord, The Road Bully), and chase them down through 3 lanes of Dhaka traffic. Unleash slap combos, punch rushes, flying kicks, and precision chappal throws while navigating Dhaka's signature urban hazards: **Loadshedding blackouts**, **hazardous smog**, and **garment factory blockades**!

### 🌟 Key Highlights

- **🔒 100% Client-Side Privacy**: MediaPipe face detection and circular caricature cartoonification happen entirely in-memory inside the browser. Zero photos ever leave your device.
- **⚡ 60 FPS Parallax Engine**: 5-layer infinite scrolling Dhaka cityscape (sky, skyline, neon billboards, street cables, and 3-lane road) powered by Phaser 4 with zero object allocation during runtime.
- **🩴 Kinetic Combat & Ultimate**: Slap, punch, kick, and parabolic chappal projectiles with comic impact bursts (`"THAPPOR!"`, `"GUSI!"`, `"LATTHI!"`), screen shake, hit-stop, and an ultimate 10-chappal slow-mo storm!
- **⚡ Dynamic Dhaka World Events**:
  - **Loadshedding**: 94% darkness blackout with glowing comic eyes peeking through street shadows.
  - **Air Pollution (AQI 450+)**: Low-visibility sepia smog slowing everyone down with comic cough bubbles.
  - **Garments Strike & Blockade**: Barricades, burning tires, and bricks cluttering lanes. Bribe with Taka (৳) to clear obstacles!
- **🎵 Zero-Dependency WebAudio Synthesizer**: Handcrafted procedural audio synthesizers for all hit SFX, sirens, power cuts, chimes, and fanfares that work instantly offline without needing audio downloads.
- **📱 Responsive & PWA Ready**: Optimized for desktop keyboards and multi-touch mobile devices with offline service worker caching.

---

## 🚀 Quickstart

### Prerequisites

- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v10+`

### Installation & Development

```bash
# Clone and enter directory
cd Pera-nai-chill

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Gates

```bash
# Run unit test suite (Vitest)
npm test

# Type-check TypeScript
npx tsc --noEmit

# Run ESLint
npm run lint

# Compile production build
npm run build
```

---

## 🕹️ Controls

| Action | Desktop Keyboard | Mobile Touch |
|---|---|---|
| **Slap (চড়)** | `1` | Tap Slap button (🖐️) |
| **Punch (ঘুষি)** | `2` | Tap Punch button (👊) |
| **Kick (লাথি)** | `3` | Tap Kick button (🦵) |
| **Chappal (জুতা)** | `4` | Tap Chappal button (🩴) |
| **Ultimate Storm** | `Space` | Tap Glowing Ultimate button (⚡) |
| **Bribe Hazard** | Click Bribe Button | Tap Bribe Button (৳) |
| **Pause Game** | `Esc` / Top Button | Tap Pause Icon (⏸️) |

---

## 🛠️ Debug Mode & Demo Showcase

- **God-Mode Debug Panel**:
  - Visit with `http://localhost:3000?debug=1` **OR** tap **5 times** consecutively on the game logo / target avatar.
  - Controls: Trigger Loadshedding, Pollution, Strike, Clear Events, +500 Taka, Fill 100% Rage, Instant KO, toggle FPS counter, change graphics quality, slow-mo timeScale slider (0.1x – 2.0x), and obstacle spawners.
- **Scripted Demo Showcase**:
  - Visit with `http://localhost:3000?demo=1`.
  - Automatically loads caricature face, skips lobby, and scripts Dhaka world events at 5s, 18s, and 32s intervals.

---

## 🏗️ Architecture

```
src/
├── app/                  # Next.js App Router (layout, globals, PWA manifest)
├── components/
│   ├── game/             # GameHost, HudOverlay, WeaponDock, EventBanner, DebugBar, DemoRunner
│   ├── gameover/         # GameOverScreen (rank titles, retry flow)
│   ├── loading/          # LoadingScreen (weighted progress, road track, tips)
│   ├── lobby/            # FaceUploader, VillainPreview, WeaponSelector, SettingsSheet
│   └── shell/            # AppShell, OrientationGuard, ServiceWorkerRegister
├── config/               # Weapons, villains, balance numbers, tips, events.json
├── game/
│   ├── entities/         # CharacterRig, Villain, Chaser, Obstacle, Projectile
│   ├── fx/               # BlackoutEffect, SmogEffect, FxSystem
│   ├── scenes/           # BootScene (procedural textures), PreloadScene, RunScene
│   └── systems/          # ParallaxSystem, CombatSystem, SpawnSystem, EventSystem, DifficultySystem
├── services/             # audio (WebAudio synth), eventService, faceService (MediaPipe)
└── store/                # useGameStore (Zustand with subscribeWithSelector)
```

---

## ⚖️ Responsible Use & Satire Notice

*Pera Nai Chill* is intended purely as humorous satire and comic stress relief. All uploaded face photos are processed exclusively on the client machine and are discarded on tab refresh. No facial biometric or personal data is collected, stored, or sent over network sockets. Please play responsibly and obtain permission before caricaturing real-world friends or colleagues!
