# SKILLS BOOTSTRAP — Dhaka Rage Runner

## INSTRUCTION TO THE AGENT (Antigravity)

Create the 9 skills below inside the current workspace.

1. For each skill, create the folder `.agents/skills/<skill-name>/` (if the workspace already uses `.agent/skills/`, use that instead).
2. Write the content between the `~~~markdown` fences **exactly as given** into `.agents/skills/<skill-name>/SKILL.md` (the fences themselves are NOT part of the file).
3. Do not summarize, shorten or rewrite them.
4. When finished, list the created folders and confirm that each `SKILL.md` starts with YAML frontmatter containing `name` and `description`.
5. Then wait for the user to say `BEGIN` (the build blueprint is in `DHAKA_RAGE_RUNNER_BLUEPRINT.md`).

---

## 1. phaser-nextjs-integration

~~~markdown
---
name: phaser-nextjs-integration
description: Use when creating or editing the Phaser game host inside Next.js (App Router), mounting/destroying the game, or bridging React UI and Phaser through the event bus and Zustand.
---

# Phaser + Next.js integration

## Goal
Run Phaser safely in a client-only React component with no SSR crashes, no double-mount bugs, and no per-frame React re-renders.

## Rules
1. Any file that touches Phaser or `window` must be client-only. Components use `"use client"`.
2. Never `import Phaser from 'phaser'` at module top level in a component that Next may render on the server. Use dynamic import inside `useEffect`.
3. Guard React Strict Mode: keep the game in a `useRef`; if one already exists, do not create another. Always `game.destroy(true)` in cleanup.
4. Phaser owns per-frame state (positions, timers). React/Zustand only gets low-frequency values (HP, taka, combo, active event), throttled to about 10 Hz.
5. UI → Game and Game → UI communication uses a typed `mitt` bus in `src/game/bus.ts`. Never import React components into `src/game/**`.
6. Config: 1280x720, `Phaser.Scale.FIT`, `autoCenter: CENTER_BOTH`, `fps.target = 60`, multi-touch enabled, DPR capped at 2.
7. Pause the game on `visibilitychange` hidden.

## Template
~~~tsx
"use client";
import { useEffect, useRef } from "react";

export default function GameHost() {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { createGame } = await import("@/game/createGame");
      if (cancelled || gameRef.current || !ref.current) return;
      gameRef.current = createGame(ref.current);
    })();
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 touch-none select-none" />;
}
~~~

## Checklist
- [ ] `npm run build` has no "window is not defined" errors
- [ ] Navigating away and back does not create two canvases
- [ ] React Profiler shows no per-frame renders during gameplay
~~~

---

## 2. character-rig-animation

~~~markdown
---
name: character-rig-animation
description: Use when building or changing the jointed 2D character rig, procedural run cycle, hit/stun/dead states, or attaching the uploaded face texture to the head.
---

# Character rig and animation

## Structure
Each character is a `Phaser.GameObjects.Container` hierarchy. Every limb is a nested container with its pivot at the joint so child parts follow naturally.

root (origin at feet) → shadow, backArm(upper→lower→hand), backLeg(thigh→shin→foot), torso, frontLeg, frontArm, neck, headGroup(faceSprite, accessory slot, expressionOverlay)

Draw all parts procedurally with `Graphics.generateTexture` in BootScene so no art files are required. Keep texture keys stable so real art can replace them later.

## Run cycle (inside update)
~~~ts
const t = time * 0.001 * Math.PI * 2 * cadence; // cadence about 1.6 steps/sec, scaled by current speed
frontLeg.thigh.rotation = Math.sin(t) * 0.9;
frontLeg.shin.rotation  = Math.max(0, -Math.sin(t + 0.6)) * 1.1;
backLeg.thigh.rotation  = Math.sin(t + Math.PI) * 0.9;
backLeg.shin.rotation   = Math.max(0, -Math.sin(t + Math.PI + 0.6)) * 1.1;
frontArm.upper.rotation = Math.sin(t + Math.PI) * 0.8;
backArm.upper.rotation  = Math.sin(t) * 0.8;
torso.y = Math.abs(Math.sin(t)) * -6;
headGroup.rotation = Math.sin(t * 2) * 0.08;
headGroup.y = torso.y + Math.sin(t * 2 + 0.5) * 2;
~~~

## States (FSM)
RUN, HIT_STUN, STAGGER_RECOVER, TRIPPED, COUGH, PANIC_SPRINT, DEAD.
- HIT_STUN: 100 ms red flash with `setTintFill(0xff0000)` on all parts, knockback tween (Quad.Out), face scale 1 → 1.35 → 1 with Back.Out, shock overlay.
- DEAD: parts get random angular velocity plus gravity; face bounces off; comic "KO" stars.
- COUGH: torso rotates +0.3 every 1.2 s and shows a speech bubble.

## Face attachment
- Face is a 256x256 PNG with transparent circular mask, installed with `textures.addBase64('target-face', dataUrl)`. Wait for the `ADD` texture event before spawning the villain.
- Remove the old texture key before adding a new one.
- Never distort the face image itself; expressions are overlay stickers.
- Face display size is about 70 px (big-head comedy style) and must stay centered on the neck in every frame.

## Rules
- No allocations inside `update`.
- Cadence must scale with speed (smog slows, panic speeds up).
- Squash and stretch on footfalls: torso scale (1.05, 0.95) for 80 ms.
~~~

---

## 3. game-juice-fx

~~~markdown
---
name: game-juice-fx
description: Use when implementing or tuning hit feedback, weapons, combos, camera shake, hit-stop, floating damage text, particles, and slow-mo so combat feels punchy.
---

# Game juice

## Every hit must trigger, in this order
1. Hit-stop 60 to 120 ms (heavier weapon = longer).
2. Red tint flash on the target (100 ms).
3. Knockback tween.
4. Camera shake scaled by damage (`cameras.main.shake(duration, intensity)`).
5. Impact burst sprite with onomatopoeia ("THAPPOR!", "GUSI!", "LATTHI!", "CHAPPAL!") at random rotation.
6. Floating damage text (pooled): rise 80 px, fade out, pop scale.
7. Particles (dust, stars, sweat).
8. SFX with pitch randomization of plus or minus 8 percent.
9. Haptic: `navigator.vibrate(10..40)` when supported and enabled.
10. Update combo, rage, taka.

## Numbers
All tunables (damage, cooldown, knockback, shake, hit-stop, combo window 1.5 s, multiplier 1 + 0.1 * combo capped at 3) live in `src/config/weapons.ts` and `balance.ts`. Never hard-code them in scene code.

## Chappal projectile
~~~ts
const p = Phaser.Math.Clamp(elapsed / duration, 0, 1);
x = Phaser.Math.Linear(sx, tx, p);
y = Phaser.Math.Linear(sy, ty, p) - 4 * peak * p * (1 - p);
rotation += spin * dt;
// predict target: tx = villain.x + villain.vx * duration / 1000
~~~

## Rules
- Use object pools for projectiles, text, particles. Cap active particles (about 150).
- Respect `settings.reducedMotion`: reduce shake and flash intensity.
- Ultimate slow-mo: `scene.time.timeScale = 0.4` for 600 ms, then restore.
- Hit-stop must restore time scale even if the scene is paused or destroyed.
~~~

---

## 4. world-event-engine

~~~markdown
---
name: world-event-engine
description: Use when adding, editing, or debugging world events (loadshedding, pollution, strike, viral events), their JSON schema, effects registry, bribes, overlays, or modifiers.
---

# World event engine

## Principles
- Events are data in `src/config/events.json`, validated by `zod` in `eventService.ts`. New event = new JSON entry, not new code, whenever existing effect kinds suffice.
- Each effect kind implements `apply(ctx)` and `revert(ctx)`. Reverting must leave zero residue (speed back to 1, overlays removed, spawners stopped, status timers cleared).
- Only one event at a time unless forced from the debug bar.
- Gameplay durations are compressed (about 20 to 25 s). Real-world durations are flavor text only.
- All user-facing strings are `{ bn, en }`.

## Effect kinds
`overlay` (blackout, smog), `modifier` (speed, staminaRegen), `status` (cough), `spawner` (crowd, bricks, burning tires), `sfx`, `bonus` (villainTripped).
Unknown kinds: `console.warn` and ignore.

## Event JSON shape
id, type, title{bn,en}, ticker{bn,en}, description{bn,en}, durationSec, weight, cooldownSec, bypass{enabled,costTaka,label{bn,en}}, effects[].

## Visual recipes
- Blackout: screen-size `RenderTexture` filled black at 0.95 alpha; every frame `erase` a soft radial glow at each head; draw two white cartoon eyes whose pupils follow the chaser; occasional flicker.
- Smog: two scrolling tinted `TileSprite` fog layers, dust particles, `camera.postFX.addVignette`, light sepia color matrix, slight blur on far layers (disable post-FX on Low quality).
- Strike: barricades, burning tires (additive fire particles), protester stick figures crossing lanes, bricks with a 0.6 s shadow telegraph on the ground, villain can trip for a bonus combo window.

## Bribe
Deduct taka through `spendTaka` (never negative). If insufficient, shake the button and do nothing else. On success call the same revert path as a natural end.

## Checklist
- [ ] Force-trigger every event twice in a row: no leftover modifiers
- [ ] Revert fades in about 400 ms
- [ ] Object counts return to baseline after a strike
~~~

---

## 5. face-pipeline

~~~markdown
---
name: face-pipeline
description: Use when working on face upload, face detection, circular cropping, cartoonify processing, default placeholder face, or any privacy handling of user photos.
---

# Face pipeline

## Flow
upload/camera → downscale (max 1024 px) → detect face (MediaPipe FaceDetector, lazy, GPU then CPU fallback) → expand box 40 percent → circular crop (auto or manual with `react-easy-crop`) → cartoonify → 256x256 PNG data URL → `setTargetFace`.

## Rules
1. Detection is never blocking. If the model is not ready within 6 s or fails, show the manual cropper immediately.
2. The manual cropper must always work with no network and no model.
3. Cartoonify on an offscreen canvas: circular clip, thick black outline (about 6 px at 256), contrast and saturation boost, optional halftone.
4. Optional "Clean cutout" uses `@imgly/background-removal`, lazy-loaded only on user tap.
5. Revoke object URLs after use. Keep only the small 256 px result in memory and in `localStorage`.
6. Provide a procedurally drawn default funny face so testing never needs an upload.
7. Photos NEVER leave the device. No upload, no analytics on image content. Confirm in the Network tab.
8. Settings has "Clear my data" that wipes the stored face.
9. First-run notice: satire only, use faces you have permission to use, do not harass real people.
~~~

---

## 6. loading-and-ux

~~~markdown
---
name: loading-and-ux
description: Use when building the loading screen, progress calculation, tap-to-start audio unlock, screen transitions, HUD animations, fonts (Bangla + comic), or accessibility settings.
---

# Loading and UX

## Loading screen
- Road-shaped progress bar with a tiny running rickshaw as marker, comic title (GSAP letter pop), rotating bilingual tips every 2.5 s.
- Weighted progress: fonts 10, Phaser chunk 15, textures 35, audio 20, face model warm-up 15 (non-blocking), procedural textures 5.
- Progress is monotonic (never goes backwards) and eased. Minimum display 1.2 s. After 12 s show "Play anyway".
- On any asset failure: use the fallback, show a small toast, continue.
- At 100 percent show a pulsing "TAP TO START" button. The tap calls `audio.unlock()` because browsers block audio before a gesture.

## Fonts
- Use `next/font` for the comic display font and a Bangla font (Hind Siliguri or Noto Sans Bengali).
- Call `document.fonts.load()` for both and wait before creating any Phaser Text.

## Motion patterns (Framer Motion)
- Screen transitions: AnimatePresence scale+fade 180 ms.
- Buttons: `whileTap={{ scale: 0.92 }}`.
- Combo counter: key by combo value, spring `stiffness 500, damping 18`.
- Event banner slides from top with slight bounce.

## Accessibility
Touch targets at least 56 px, icons plus color (not color alone), sound/haptics toggles, Bangla/English toggle, `prefers-reduced-motion` respected, safe-area insets on notch phones.
~~~

---

## 7. audio-synth-fallback

~~~markdown
---
name: audio-synth-fallback
description: Use when creating or editing the audio manager, sound effects, BGM, volume/ducking, or the Web Audio synth fallback used when audio files are missing.
---

# Audio

## API (`src/services/audio.ts`)
`unlock()`, `play(name, { volume, rate, detune })`, `playBgm()`, `stopBgm()`, `setMuted(bool)`, `duck(on)`.

## Rules
- No sound before the user's tap-to-start gesture.
- Randomize pitch plus or minus 8 percent; limit to 4 simultaneous voices per sound.
- Duck BGM during world events.
- If a file fails to load or is missing, fall back silently to the synth version.

## Synth recipes (Web Audio)
- slap: short white-noise burst, highpass about 2 kHz, 80 ms decay
- punch: sine at 90 Hz dropping to 40 Hz, 120 ms, plus a little noise
- whoosh: bandpass noise with frequency sweep 400 to 2000 Hz, 250 ms
- coin: two sine blips at 880 and 1320 Hz
- cough: three short noise bursts with lowpass
- powercut: sine sweeping down 600 to 60 Hz over 600 ms
- siren: square wave alternating 700 and 900 Hz every 300 ms

## Assets
Prefer CC0 sources (Freesound, Kenney, OpenGameArt). Record every external asset and its license in `CREDITS.md`.
~~~

---

## 8. qa-and-perf

~~~markdown
---
name: qa-and-perf
description: Use when verifying a ticket, profiling performance or memory, fixing frame drops, writing tests, or preparing the game for mobile and deployment.
---

# QA and performance

## After every ticket
1. `npm run lint` and `npm run build` pass.
2. Verify each Acceptance Criterion in the blueprint manually.
3. Commit with `git commit -m "Txx: <short summary>"`.

## Performance targets
- 60 FPS on desktop, at least 50 FPS on mid-range Android.
- Game-route JS under 1.5 MB gzip (code-split Phaser). Textures under 20 MB.
- No `new` object allocations in `update`. Use pools.
- Quality setting High/Low: Low disables post-FX, shadows, halves particles. Auto-suggest Low if FPS stays under 40 for 3 s.
- Memory must stay flat after 10 minutes (check DevTools heap).

## Tests
- Vitest: `spendTaka` never negative, combo multiplier cap, events JSON validation.
- Playwright smoke: load → tap start → default face → play 10 s → trigger each event → game over.

## Mobile checks
Real Android phone and iPhone, landscape, notch safe areas, multi-touch, `pointerdown` for weapon buttons, pinch-zoom and long-press disabled on the game container.
~~~

---

## 9. bangla-ui-copy

~~~markdown
---
name: bangla-ui-copy
description: Use when writing or editing any user-facing text, tips, event titles, tickers, rank titles, or button labels in Bangla and English.
---

# Bangla and English copy

## Tone
Playful, satirical, street-smart Dhaka humor. Cartoonish, never cruel. Never target real groups, religions, or protected characteristics. Jokes aim at situations (traffic, loadshedding, smog, bribes), not at real private people.

## Format
- Every string is `{ bn, en }`. Keep Bangla natural and short; no machine-translation feel.
- Keep UI labels under about 20 characters where possible so they fit mobile buttons.
- Use Bangla numerals only if the whole sentence is Bangla; keep HUD numbers in Latin digits for readability.

## Examples
- Start: "রাস্তায় নামাও" / "Hit the Streets"
- Win: "ধরা খাইছে!" / "Caught him!"
- Lose: "পালাইছে!" / "He got away!"
- Tip: "টানা ৫টা হিট মারলেই রেজ মোড!" / "Land 5 hits in a row for RAGE MODE!"
- Rank titles: "চপ্পল শিক্ষানবিশ" (Chappal Rookie), "থাপ্পড় মাস্টার" (Slap Master), "রাস্তার রাজা" (King of the Street)
~~~

---

## DONE CHECK
After creating all files, print this tree and confirm it matches:

~~~text
.agents/skills/
├── phaser-nextjs-integration/SKILL.md
├── character-rig-animation/SKILL.md
├── game-juice-fx/SKILL.md
├── world-event-engine/SKILL.md
├── face-pipeline/SKILL.md
├── loading-and-ux/SKILL.md
├── audio-synth-fallback/SKILL.md
├── qa-and-perf/SKILL.md
└── bangla-ui-copy/SKILL.md
~~~
