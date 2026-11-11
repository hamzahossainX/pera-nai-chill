# Pera Nai Chill (ঢাকা রেজ রানার — Dhaka Rage Runner)

> **প্যারা নাই চিল!** A satirical, slapstick 2D comic action-runner web game set on the lively streets of Dhaka.

---

## 🎮 Overview

Customize your target villain with any photo or choose from 7 hilarious Dhaka archetypes (**The Phone Snatcher**, **The Pickpocket**, **The Cable Chor**, **The Manhole Chor**, **The Eid Market Chor**, **The Chicken Chor**, and the notorious **Chor-er Sardar** Boss). Chase them down through 3 lanes of vibrant Dhaka traffic, dodging urban obstacles and unleashing slap combos, punch rushes, flying kicks, banana peel traps, soda can kicks, and precision chappal throws!

---

## 🌟 Key Phase 2 Highlights

- **🔒 100% Client-Side Privacy & Zero Remote Dependencies**:
  - MediaPipe face detection and caricature cropping execute entirely in browser memory.
  - Wanted Poster generation renders locally on an HTML5 canvas and exports PNG directly to your device or Web Share API with zero cloud uploads.
  - Purchases, unlocked achievements, and daily challenge streaks persist locally via `localStorage`.

- **🏃 Layered Slot-Based Character Rig**:
  - 15 layered slots rendered from custom 2x vector SVGs with seamless procedural vector fallbacks.
  - Dynamic **Mask-Slip Mechanics**: The villain's mask slips at 66% HP and flies off at 33% HP to comically reveal the target face!
  - **Secondary Spring Motion**: Real-time spring physics for gamchhas, scarf tails, hoodie drawstrings, and held props.
  - **Aam-Janata Hero Chaser**: Distinct attack animations synced to impact frames with 3 selectable chappal styles (Bata Rubber, Leather Loafer, and Golden Royal Chappal).

- **🏙️ Living Dhaka Streetscape & Kit-Bash**:
  - MRT-6 elevated metro track with animated passing commuter trains.
  - Animated street life: perched and soaring crows, tea stalls (টং দোকান) with steam, hawker carts, footbridges, and street dogs.
  - Passing Dhaka traffic: cycle rickshaws, green CNG auto-rickshaws, city buses, and motorbikes with spatial stereo panning.

- **🌅 Dynamic Time-of-Day & Weather**:
  - 4 smooth phases: **Dawn (ভোর)**, **Noon (দুপুর)**, **Sunset (সন্ধ্যা)**, and **Night (রাত)** with ambient color grading, moon phases, twinkling stars, and streetlamp lighting.
  - 4 weather states: **Clear**, **Monsoon Rain**, **Winter Fog**, and **Dhaka Urban Flood (Waterlogging)** with floating chappals and -25% speed penalty.
  - Dramatic cross-event visual interactions: Night loadshedding cuts streetlights with generator rumble tweens; Night smog renders volumetric halos; Night strikes feature glowing tyre bonfires.

- **📢 Bilingual Comic Dialogue & Ticker**:
  - Dynamic Bangla & English comic speech bubbles for villain panics and chaser taunts.
  - Dhaka TV-style breaking news commentator ticker with hilarious local street commentary.
  - Interactive **Taunt Button** (খুঁচাও) that drains villain morale and boosts combo multipliers.

- **🎵 Procedural Slapstick Web Audio Engine**:
  - Dynamic ~136 BPM Dhaka comedy chase groove generated procedurally with Web Audio sample-accurate scheduling.
  - Situational BGM filters: underwater lowpass muffle (420 Hz) during Flood; transistor radio bandpass during Loadshedding; muffled lowpass during Pause.
  - Dynamic BGM ducking during world events and ultimate slow-mo barrages.
  - Spatial stereo panning and Doppler pitch shifts for passing vehicles.
  - Rich procedural SFX: London police whistle trill, brass celebratory fanfare, cartoon slide-whistle banana slip, metallic can clatter, and archetype grunts.
  - Family-friendly guardrails: strictly zero audio before first user tap; strictly zero religious audio.

- **🛒 Local Progression & Meta Systems**:
  - **Dokan (দোকান)**: Spend earned Taka (৳) to unlock stylish chappals, street outfits, and funny audio packs.
  - **Protiddondhi (প্রতিদ্বন্দ্বিতা)**: Date-hashed daily challenge with unique villain, weather, and bonus Taka.
  - **Orjon (অর্জন)**: 7 local achievements with rewards and instant unlock banners.

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
| **Banana Trap (কলা)** | `5` | Tap Banana button (🍌) |
| **Can Kick (ক্যান)** | `6` | Tap Can button (🥫) |
| **Taunt (খুঁচাও)** | `T` | Tap Taunt button (📢) |
| **Ultimate Storm** | `Space` | Tap Glowing Ultimate button (⚡) |
| **Bribe Hazard** | Click Bribe Button | Tap Bribe Button (৳) |
| **Pause Game** | `Esc` / Top Button | Tap Pause Icon (⏸️) |

---

## 🛠️ Debug Mode & Demo Showcase

- **God-Mode Debug Panel**:
  - Visit with `http://localhost:3000?debug=1` **OR** tap **5 times** consecutively on the game logo / target avatar.
  - Controls: Trigger Loadshedding, Pollution, Strike, Flood, Clear Events, +500 Taka, Fill 100% Rage, Instant KO, toggle FPS counter, change graphics quality, slow-mo timeScale slider (0.1x – 2.0x), and obstacle spawners.
- **Scripted Demo Showcase**:
  - Visit with `http://localhost:3000?demo=1`.
  - Automatically loads caricature face, skips lobby, and scripts Dhaka world events at 5s, 18s, and 32s intervals.
