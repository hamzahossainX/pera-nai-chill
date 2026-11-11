# DHAKA RAGE RUNNER — PHASE 2 UPGRADE PLAN
### "From moving rectangles to a living Dhaka street"

> Phase 1 is built and works mechanically. Right now the villain is basically a solid panel that moves and gets things thrown at it. Phase 2 turns the game into something that looks, sounds and feels like Bangladesh: distinct thief characters with costumes and masks, day/night and weather, a detailed street, funny dialogue, and features that make people replay and share it.

---

## 0. AGENT PROTOCOL

**When the user says `BEGIN PHASE 2`:**
1. Read this entire file, and the existing code. Also read the skills in `.agents/skills/` (especially `character-rig-animation`, `game-juice-fx`, `world-event-engine`, `bangla-ui-copy`, `qa-and-perf`).
2. Do **P2-00 (Audit)** first and print the findings before changing code.
3. Execute tickets **P2-01 → P2-14 in order**. After each: `npm run lint && npm run build`, verify the Acceptance Criteria (AC), commit (`git commit -m "P2-xx: ..."`), print a 3-line status, continue without asking.
4. **Never break the existing game.** Every new feature must sit behind data/config and degrade gracefully (Low quality mode, missing assets → procedural fallback).
5. Ask the user only if blocked twice on the same problem or if a decision is not covered here.
6. Commands: `BEGIN PHASE 2`, `CONTINUE`, `STATUS`, `FIX <problem>`, `POLISH`.

---

## 1. GOALS (in priority order)

1. **Characters feel like characters**: each villain archetype has its own outfit, mask, accessories, body shape, run style and personality. The uploaded face stays the star.
2. **Looks like Bangladesh**: street, vehicles, signage, props, colours, sounds and humour that locals instantly recognise.
3. **Living world**: day / evening / night cycle, weather, and street lighting that interact with the existing events (loadshedding, smog, strike).
4. **Smoother and more satisfying**: fixed-timestep feel, interpolation, better animation, no stutter, stable 60 FPS.
5. **Replayability**: shop, unlocks, daily challenge, achievements, wanted-poster sharing.
6. **Funny**: speech bubbles, commentator ticker, taunts, named combos.

---

## 2. CONTENT & TONE GUARDRAILS

- Villains are **fictional archetypes** (the street thief types people joke about). Do **not** depict real politicians, real brands, real logos or real private people (apart from the face the player chooses to upload locally). Use **parody brand names**.
- Humour targets **situations** (traffic, loadshedding, smog, bribes, tea stalls), never religion, ethnicity or other protected groups.
- **No religious audio or imagery as a gag** (e.g., do not use azaan or prayer sounds as sound effects). The "evening" time-of-day is shown with light and ambience only.
- Violence stays **cartoonish** (comic bursts, stars, bruised-ego jokes). **No mob-violence glorification.** The ending when the villain is caught is: whistle blows, a cartoon policeman appears, "ধরা খাইছে! থানায় চলো!" with a stamp. The crowd cheers and points but does not beat him.
- Keep the first-run "satire only / use faces you have permission to use" notice.

---

## 3. P2-00 — AUDIT (do this first)

Inspect the current project and output a short report:
- How the villain is currently drawn (rectangle? sprite? container?), where the face texture is attached, how the run animation works.
- Parallax layers, spawn systems, FPS in dev (Phaser debug FPS) and number of draw calls / objects.
- Which parts of Phase 1 blueprint are missing or broken (rig, hit reactions, events, audio).
- A list of quick wins.
Then **proceed**; fix any Phase 1 gaps that block Phase 2 (for example a missing `CharacterRig` hierarchy).

---

## 4. ART DIRECTION

**Style:** bold comic-vector with thick dark outlines, flat colours plus one shade tone and one highlight tone per shape, slight paper/halftone texture. Inspired by **Dhaka rickshaw art** (saturated pinks, yellows, teals, flowers, birds) and street posters.

**How to produce art without an artist (important):**
- Author characters and props as **layered SVG files** (hand-written SVG code by the agent), one SVG per part (head accessory, mask, torso outfit, arm, leg, prop). Load them in Phaser as textures at a **2x raster scale** (`this.load.svg(key, url, { scale: 2 })`) so they stay sharp on phones. Keep each SVG small (< 8 KB).
- Keep **consistent pivot points** across every outfit so any outfit fits the same rig (see section 5.2).
- Palette swaps via `setTint` are allowed for variants. Do not rely on tint for the main look.
- If an SVG fails to load, fall back to a procedurally drawn shape with the same key (existing Tier 0 fallback).
- Folder: `public/assets/characters/<archetype>/<part>.svg`, `public/assets/props/*.svg`, `public/assets/backgrounds/*.svg|webp`.

---

## 5. CHARACTER SYSTEM (THE BIG UPGRADE)

### 5.1 Archetypes (data in `src/config/villains.ts`)

Each villain is configured by data, not code.

| Archetype (EN / BN) | Look | Mask | Props | Behaviour |
|---|---|---|---|---|
| **Pickpocket / পকেটমার** | Slim, checked shirt, jeans, cap | Gamchha wrapped across the nose and mouth | Wallets flying out of pockets | Fast, dodges lanes often, low HP |
| **Phone Snatcher / ছিনতাইকারী** | Black hoodie, joggers, sneakers | Black balaclava with comic eye holes | Stolen phones, one in each hand | Sprint bursts, jumps over obstacles |
| **Cable Chor / তার-চোর** | Orange safety vest, lungi tucked up, flip-flops | Cheap surgical mask worn under the nose | Coil of copper cable around the shoulder | Slow, tanky, drops cable that trips the player's chappals |
| **Manhole Chor / ম্যানহোল-চোর** | Overalls, rubber boots, torch on forehead | Welding visor | Carries a manhole cover as a shield | Blocks chappals with the cover, weak to kicks |
| **Eid Market Chor / ঈদ-বাজার চোর** | Flashy panjabi-style shirt, sunglasses | Fake moustache + eye-mask | Shopping bags overflowing | Drops bags (pickups) when hit, medium stats |
| **Chicken Chor / মুরগি-চোর** | Lungi and vest, gamchha on shoulder | Plastic bandit eye-mask | A clucking hen under one arm | Hen sometimes escapes and runs ahead as a blocker (comic) |
| **Boss: Chor-er Sardar / চোরের সর্দার** | Big, gold chain, three-piece suit with patched knees | Silk scarf mask that flaps in wind | Sack of loot (leaks coins) | Appears every 3rd chase, 2 phases, bigger HP, summons minions |

All of them show the **uploaded face**. Masks must not hide the face completely:
- **Mask-slip mechanic:** the face is visible in the mask opening area. At HP 66 percent the mask slips down, at 33 percent it falls off (flies away with a comic arc), revealing the full face with a shocked expression. Gives a great visual progression and a reason to keep hitting.
- Hoods and caps sit **behind/around** the face (draw order: back hair/hood → head → face → mask lower half → cap brim).

### 5.2 Rig compatibility (extends `character-rig-animation` skill)

Standard slots every outfit must supply, all sharing identical pivots/anchors:
`headBack, face, maskLower, maskUpper, headFront(cap/hood brim), torso, upperArmL/R, lowerArmL/R, handL/R, thighL/R, shinL/R, footL/R, backProp, handProp, frontProp, shadow`.
- Body proportions are per archetype (`bodyScale: { head, torso, limbs }`), e.g., big-head for Pickpocket, wide torso for Manhole Chor.
- Per-archetype **run style** (`cadence`, `armSwing`, `hunch`, `bounce`): Pickpocket light and fast, Cable Chor heavy and wobbly, Snatcher sprint-lean.
- **Secondary motion:** cloth ends (gamchha tails, scarf, lungi hem, hood strings) are 2 to 3 segment chains driven by velocity with simple spring follow. Props (hen, bags, cable) bounce with a delayed spring.
- **Idle/lobby pose** for the preview: breathing, blinking overlay, looking at the camera.

### 5.3 Reactions & personality
- Each archetype has unique **hit reactions** and **death/capture animations** (e.g., Chicken Chor drops hen and chases it; Snatcher's phones fly everywhere and the player can "catch" them for Taka).
- **Expressions** via overlay stickers on the face: normal, smug, worried, shocked, dizzy, crying (tears), angry. State machine chooses based on HP, combos and events.
- **Speech bubbles** (section 9) appear above the head with a small tail, pooled, auto-hide.

### 5.4 Chaser upgrade
Replace the silhouette with a proper "Aam-Janata" hero: casual shirt, rolled sleeves, sandals (the throwing hand holds the chappal), with customizable colour (shop). Full rig, same animation quality as villains. Different attack animations per weapon, plus a quick "dash" with dust.

### 5.5 Lobby: character picker & dress-up preview
- Horizontal carousel of archetypes with a **live running preview** wearing the uploaded face.
- Show stats (HP, speed, dodge) as comic bars + a one-line funny bio.
- Locked ones show a padlock and unlock cost or requirement.

---

## 6. DAY / NIGHT & WEATHER SYSTEM

### 6.1 Time of day (`TimeOfDaySystem`)
A run lasts about 3 to 4 minutes and moves through phases (also selectable in the lobby or Debug Bar):

| Phase | Look | Gameplay effect |
|---|---|---|
| **Morning / সকাল** | Soft golden light, light haze, long shadows, school kids, tea stalls busy | Normal |
| **Noon / দুপুর** | Bright harsh light, short shadows, heat shimmer on road | Stamina drains 15 percent faster (heat) |
| **Evening / সন্ধ্যা** | Orange-purple sky, headlights on, rush-hour traffic denser | More vehicles and obstacles, more Taka per hit |
| **Night / রাত** | Dark blue grade, street lamps, shop neon, rickshaw fairy-lights, stars/moon | Reduced visibility; lights matter; loadshedding is extra dramatic |

Implementation:
- A single `timeOfDay` value (0..1) drives a **color gradient lookup**: sky gradient, ambient tint for each parallax layer, shadow length/angle/opacity, light intensity.
- Use Phaser **Light2D** pipeline (or additive "light sprites" if Light2D is too heavy on mobile) for lamps, headlights, shop windows, the chaser's torch (phone flashlight), and the villain's forehead torch (Manhole Chor).
- Windows and signs **turn on** progressively at dusk. Stars fade in. Moon with a halo.
- **Smooth transitions** (lerp over 8 to 10 seconds); never a hard cut.
- Low quality: no dynamic lights, only tint + pre-baked glow sprites.

### 6.2 Interaction with Phase 1 events
- **Loadshedding at night** is the most dramatic: street lamps and shop lights flicker off with a pop; only vehicle headlights, phone flashlights and glowing eyes remain. Candle-lit shops (small flame particles) appear. Generators ("জেনারেটর") rumble in a few shops and their lights stay on, creating safe pools of light for the player to fight in.
- **Smog** tints light sources with halos and reduces far-layer contrast.
- **Strike** at night shows burning-tyre glow lighting the crowd.

### 6.3 Weather (`WeatherSystem`, random or chosen)
- **Monsoon rain / বর্ষা:** rain particle layers (3 depths), puddles with ripples on road, reflections of lights (a flipped, low-alpha copy of lamps), umbrellas in the crowd, occasional lightning flash + thunder (cap flash intensity, respect reduced-motion).
- **Waterlogging / জলাবদ্ধতা** (new event `FLOOD`): road section floods; splash particles; running speed −25 percent for everyone; floating rickshaw/slippers as obstacles; chappals thrown get a "skip on water" bounce.
- **Winter fog / শীতের কুয়াশা:** soft low fog, warm breath puffs, shawl-wearing background people.
- **Heatwave:** shimmer distortion on far layers (cheap sine offset), sweat drops on characters.
Weather is data-driven in `src/config/weather.json` and combines with time of day.

---

## 7. BANGLADESH-REALISTIC STREET (BACKGROUND & PROPS)

All shop names and signs are **parody** (e.g., "Hotel Sultan-er Biryani", "Jhal Muri Corner", "Bhai Bhai Mobile Bazar", "Fast Food Chaos", "Modern Tailors").

**Parallax content upgrades**
- **Far:** Dhaka skyline silhouettes, **elevated metro rail track** with a train that occasionally passes, cranes, a flyover.
- **Mid:** multi-storey buildings with AC units on walls, balconies with hanging clothes, **tangled overhead wires** (animated slight sway), Bangla signboards, rooftop water tanks, billboard (parody ads, rotating funny slogans).
- **Near:** tea stalls (চায়ের দোকান) with steam particles and plastic stools, hawkers (jhal muri, balloons, fruit carts), **footbridge** that the camera passes under, lamp posts, trash bins, bunting flags, wall posters and graffiti.
- **Road:** lane markings, zebra crossings, potholes (cause a bump animation), manhole covers, puddles, banana peels, scattered chappals (pickups), speed breakers.
- **Foreground:** passing **rickshaws** with rickshaw art (colourful back panel, tassels, bell), **green CNG autos**, colourful **local buses** with dents and signboards, motorbikes, trucks with painted art ("Horn Please"-style), cyclists, a cow occasionally crossing (comic blocker), street dogs, crows on wires and flying across, pigeons.
- **Animated life:** flags flutter, cloth sways, steam rises, neon flickers, people walk in the mid layer (cheap 2-frame bobbing sprites), a crow occasionally steals something from a stall.

**Asset rules**
- 12 to 20 reusable building/props SVG modules assembled randomly to produce infinite variety (kit-bash approach), so no visible repetition.
- Use object pooling; cull off-screen. Pre-render heavy static layers to a single texture where possible.
- Props are tagged (`decor`, `obstacle`, `pickup`, `interactive`) so the SpawnSystem knows what to do.

---

## 8. NEW GAMEPLAY FEATURES

1. **Street interactions:** the villain can **vault** over low obstacles, **shove** a hawker cart (blocker), **hide** briefly behind a bus (chappal blocked, comic "He's behind the bus!" bubble). The chaser can **kick a football/can** or **throw a banana peel** as extra weapons (cheap, short cooldown) to trip him.
2. **Environment hazards for the player:** potholes cause a stumble, honking buses force a lane change, puddle splashes slow the chaser.
3. **Chappal variety (data-driven in `weapons.ts`):** classic rubber slipper, flip-flop (fast, low damage), heavy leather sandal (slow, high damage), golden chappal (rare, bonus Taka), boomerang chappal (comes back). Parody names such as "Bota-ish", "Paduka Pro".
4. **Taunt button / "Gaali-free insult" system:** the chaser can tap a taunt (funny phrase) that drains villain morale, increases his speed (panic) and gives bonus Taka. Clean humour only.
5. **Caught sequence:** whistle, cartoon policeman, "থানায় নাও!" stamp, loot spills (Taka rain), slow-mo final hit, replay of the last hit with a comic frame.
6. **Boss chase** every 3rd run (Chor-er Sardar) with two phases and minion spawn.
7. **Daily Challenge** (seeded by date, local only): "Catch the Phone Snatcher at night during loadshedding without paying a bribe". Reward Taka + badge.
8. **Achievements (local):** "ধৈর্যের পরীক্ষা" survive 3 loadsheddings, "সাইলেন্ট চপ্পল" 10 chappal hits without a miss, "জ্যাম-মাস্টার" win during a strike, "রাতের বাঘ" win at night, etc.
9. **Shop (Taka sink):** chappal skins, chaser outfits, villain outfits/masks, trails (colour dust), sound packs, bribe discounts. Persist in `localStorage`.
10. **Wanted Poster / Share card:** generates a "WANTED / খুঁজছে পুলিশ" poster with the uploaded cartoon face, the archetype's crime, a funny reward ("পুরস্কার: ৫০০০ টাকা + এক কাপ চা"), stats, and a comic border. Export to PNG for sharing. Fully local, no upload.
11. **Photo mode:** pause, pick filter (comic, vintage poster), frame, save screenshot.
12. **Commentator ticker:** a news-style bottom ticker with random funny live commentary reacting to what happens (combos, events, near misses).
13. **Combo names** (flash on screen): "থাপ্পড়-থাপ্পড়-গুঁতা!", "চপ্পল ঝড়!", "ডাবল ধামাকা!", "ট্রিপল চটাস!".

---

## 9. FUNNY DIALOGUE & COPY BANK

Create `src/config/dialogue.ts` with `{ bn, en }` entries, tagged by trigger (`idle`, `hit`, `lowHp`, `dodge`, `event:<type>`, `win`, `lose`, `archetype:<id>`), random pick with no immediate repeat, max one bubble at a time per character, 2 s lifetime. Seed at least 10 lines per group. Starter examples (expand them, keep the tone clean):

**Villain taunts / panic**
- "ভাই, আমি শুধু রাস্তা দিয়ে হাঁটছিলাম!" / "Bro, I was just walking down the road!"
- "এইটা চপ্পল না, এইটা অত্যাচার!" / "That's not a slipper, that's torture!"
- "আমার তো ব্যাক্তিগত কাজ ছিল!" / "I had urgent personal business!"
- "মাফ করে দেন, আর করব না... আগামী সপ্তাহ পর্যন্ত!" / "Forgive me, I won't do it again... until next week!"
- "আমার চশমাটা ধরেন!" / "Hold my glasses!"
- "দৌড়ানোর জন্যই তো জিম মেম্বারশিপ নিছি!" / "This is why I bought a gym membership!"

**Chaser lines**
- "এইবার হিসাব মেলাবো!" / "Time to settle the accounts!"
- "থামো, চা খাওয়াবো!" / "Stop, I'll buy you tea!"
- "চপ্পলটা পুরনো, কিন্তু তাগড়া!" / "Old slipper, strong arm!"

**Event reactions**
- Loadshedding: "আবার কারেন্ট গেল! চোর কই?" / "Power's gone again! Where's the thief?"; "লাইনম্যান ভাই, একটু দয়া করেন!" / "Lineman bhai, have mercy!"
- Pollution: "বাতাসে এত ধুলা, চোরও কাশতেছে!" / "So much dust, even the thief is coughing!"
- Strike: "রাস্তায় জ্যাম, চোর আটকাইছে নিজেই!" / "Traffic jam, the thief got stuck himself!"
- Flood: "জলাবদ্ধতা! চোর সাঁতার জানে না!" / "Waterlogging! The thief can't swim!"

**Commentator ticker**
- "ব্রেকিং: চোর ধরতে গিয়ে চপ্পল হারালো সাধারণ জনতা!" / "BREAKING: Public loses slipper while chasing thief!"
- "বিশেষজ্ঞদের মতে, চপ্পলের গতি আজ রেকর্ড ভাঙছে।" / "Experts say slipper velocity breaks records today."

Follow the `bangla-ui-copy` skill for tone. Strings must fit mobile layouts (test long Bangla text).

---

## 10. SMOOTHNESS, FEEL & PERFORMANCE

- **Fixed-timestep logic with render interpolation** for movement (or Phaser `fps.smoothStep` + clamp `delta` to 33 ms) to avoid hitches on slow frames.
- Use **easing and anticipation** in all animation (wind-up before throws, follow-through after hits). Minimum 3 distinct poses per attack.
- **Texture atlases** for characters, props and VFX (use free-tex-packer or generate one at build time) to cut draw calls; target < 150 draw calls on a typical frame.
- Parallax layers pre-rendered into wide textures; reuse tile segments; avoid re-creating Graphics objects at runtime.
- Cap total particles (100 Low / 200 High). No post-FX on Low. Dynamic lights capped (max 8 active on High, 0 on Low).
- Auto quality: monitor average FPS for 3 s; if < 45 propose Low and apply with a toast.
- Preload by phase: critical first (UI, one villain, base street), stream the rest during the lobby. Show per-asset progress in the existing loading screen.
- Camera: soft follow with lerp, subtle **zoom pulses** on strong hits, small **parallax tilt** on speed bursts, **speed lines** at high velocity.
- Add a visible dev FPS/draw-call overlay behind `?debug=1`.
- Verify memory flat over 10 minutes after adding weather and lights.

---

## 11. AUDIO UPGRADE

- **Ambient layers** per time of day and weather (all optional files with synth/noise fallbacks): morning (birds, tea-stall clatter), noon (traffic hum, distant horns), evening (dense horns, crowd), night (crickets, distant dog barks, generator hum during loadshedding), rain (rain loop, thunder).
- **Vehicle ambience:** rickshaw bell, CNG engine, bus horns as one-shots with stereo pan following the vehicle position and Doppler-style pitch shift as it passes.
- Dynamic BGM: gentle layer swap by intensity (combo high = extra percussion layer). Duck during events and ultimate.
- Per-archetype voice grunts/yelps made from pitched synth blips (no voice recording required).
- **No religious audio** (see guardrails). Keep all recordings CC0 or generated; update `CREDITS.md`.

---

## 12. UI / UX UPGRADES

- Lobby: archetype carousel, daily challenge card, time-of-day and weather selector, shop button, achievements, wanted-poster maker.
- HUD: add small time-of-day icon + weather icon, taunt button, combo-name flashes, morale bar under the villain HP.
- Event banners use time-of-day-aware styling (neon style at night).
- Results screen: show wanted-poster preview, achievements unlocked, Taka earned, best replay moment thumbnail.
- Settings: quality, reduced motion, language, "Clear my data", subtle toggles for weather/lights.
- Keep touch targets >= 56 px; verify layouts on 360x640, 390x844, 1280x720.

---

## 13. DATA FILES TO ADD / EXTEND

~~~text
src/config/
├── villains.ts       # archetypes, stats, parts, mask-slip thresholds, run style
├── outfits.ts        # outfit/mask/prop definitions + slot -> texture keys
├── timeOfDay.ts      # gradient stops, light intensity curves, phase effects
├── weather.json      # rain, fog, heatwave, flood parameters
├── props.ts          # street props, tags, spawn weights, per-phase variants
├── dialogue.ts       # bilingual lines by trigger
├── shop.ts           # items, prices, unlock rules
├── achievements.ts   # ids, conditions, rewards
└── dailyChallenge.ts # seeded generator
src/game/systems/
├── TimeOfDaySystem.ts
├── WeatherSystem.ts
├── LightingSystem.ts
├── DialogueSystem.ts
├── ShopSystem.ts (data only, UI in React)
└── SecondaryMotion.ts  # cloth/prop spring chains
~~~

Example `villains.ts` entry shape (adapt to existing types):
~~~ts
export const villains = {
  phoneSnatcher: {
    id: 'phoneSnatcher',
    name: { bn: 'ছিনতাইকারী', en: 'Phone Snatcher' },
    bio:  { bn: 'এক হাতে মোবাইল, আরেক হাতে পালানোর প্ল্যান', en: 'Phone in one hand, escape plan in the other' },
    stats: { hp: 260, speed: 1.15, dodge: 0.3, sprintBurst: true },
    body: { head: 1.25, torso: 0.95, limbs: 1.0 },
    runStyle: { cadence: 1.9, armSwing: 0.9, hunch: 0.15, bounce: 5 },
    parts: { torso: 'snatcher_hoodie', legs: 'snatcher_joggers', maskLower: 'balaclava_lower',
             maskUpper: 'balaclava_upper', headFront: 'hood_front', handProp: 'stolen_phone' },
    maskSlip: [0.66, 0.33],
    reactions: { onHit: 'phonesFly', onDefeat: 'phonesRain' },
    dialogueTags: ['archetype:phoneSnatcher'],
    unlock: { type: 'free' },
  },
  // add the other 6 archetypes from section 5.1
};
~~~

---

## 14. TICKETS (EXECUTE IN ORDER)

### P2-00 — Audit and baseline (30 min)
Per section 3. **AC:** printed report; baseline FPS and object counts recorded in `docs/perf-baseline.md`.

### P2-01 — SVG art pipeline & slot-based rig refactor (2 h)
Refactor the rig to the standard slots (5.2). Create the SVG loader with 2x scale and procedural fallback. Build the **first archetype fully (Phone Snatcher)** as the reference.
**AC:** Snatcher runs with full outfit, hoodie, balaclava, phones in hands; face sits correctly in the mask opening; no rectangles remain on screen.

### P2-02 — Remaining archetypes + secondary motion (2.5 h)
Add the other 6 archetypes and `SecondaryMotion` (cloth/prop springs). Per-archetype run styles.
**AC:** all 7 are visually distinct at a glance; gamchha/scarf/hood strings flutter; props bounce.

### P2-03 — Mask-slip, expressions, reactions (1.5 h)
HP-threshold mask slip/fall, expression overlays, archetype-specific hit/defeat reactions (hen escape, phones fly, bags spill).
**AC:** mask visibly slips at 66 percent and falls at 33 percent; expressions change with state; each archetype has a unique defeat.

### P2-04 — New chaser rig + weapon animations (1.5 h)
Proper chaser with attack animations, dash dust, chappal variety framework.
**AC:** chaser animations sync with impact frames; at least 3 chappal types selectable.

### P2-05 — Lobby carousel & dress-up preview (1.5 h)
Archetype carousel with live running preview, stats, locks; time-of-day and weather pickers.
**AC:** preview shows the uploaded face on each archetype; swapping is instant (< 200 ms) with no texture leaks.

### P2-06 — Street kit-bash: Bangladesh parallax & props (3 h)
Build the SVG building/prop modules, metro track, wires, tea stalls, hawkers, footbridge, signboards, and the vehicles (rickshaw, CNG, bus, truck, motorbike), animated life (crows, flags, steam, walkers).
**AC:** 2 minutes of play without obvious repetition; props tagged and pooled; draw calls < 150; FPS >= 55 on the dev machine.

### P2-07 — TimeOfDay + Lighting (2 h)
Implement `TimeOfDaySystem`, gradients, shadow changes, lights (Light2D or glow-sprite fallback), window/sign lighting, stars/moon.
**AC:** a full cycle plays smoothly with no hard cuts; Low quality uses the fallback; night looks clearly different and still readable.

### P2-08 — Weather + new FLOOD event (2 h)
Rain, puddles/reflections, lightning (reduced-motion safe), fog, heatwave shimmer, `FLOOD` event wired through the existing event engine (apply/revert clean).
**AC:** weather combines with time-of-day and with loadshedding/smog/strike; reverts leave no residue.

### P2-09 — Event x Time-of-day interactions (1 h)
Night loadshedding with lamps-off, generator-lit shops, candles; smog light halos; strike tyre glow.
**AC:** loadshedding at night is dramatically darker than at noon but eyes/faces/headlights remain readable.

### P2-10 — Dialogue, taunts, ticker, combo names (1.5 h)
`DialogueSystem` (bubbles, no repeats, pooled), commentator ticker, taunt button and its morale mechanic, combo name flashes. Seed all lines from section 9 and extend.
**AC:** bubbles never overlap or stack; Bangla text fits on 360 px width; taunt affects villain speed and Taka as designed.

### P2-11 — Street interactions & new weapons (2 h)
Vault/hide/shove AI, banana peel and can-kick weapons, potholes/puddles affecting the chaser, caught sequence (whistle, policeman, stamp, Taka rain), boss chase with 2 phases.
**AC:** each interaction triggers visibly; boss appears on every 3rd run; caught sequence plays without mob-violence imagery.

### P2-12 — Shop, achievements, daily challenge, wanted poster (2.5 h)
Local persistence, shop UI, achievement toasts, seeded daily challenge, Wanted Poster PNG export (Canvas -> blob -> download/Web Share), photo mode.
**AC:** purchases persist after refresh; poster exports with the cartoon face; nothing is uploaded anywhere (verify the Network tab).

### P2-13 — Audio upgrade (1.5 h)
Ambient layers, vehicle pan/Doppler, dynamic BGM, archetype grunts, synth fallbacks.
**AC:** every time-of-day and weather has a distinct ambience; no audio before the tap gesture; no religious audio anywhere.

### P2-14 — Performance pass & polish (2 h)
Atlas packing, draw-call and particle caps, auto quality, interpolation/smoothing, memory soak test (10 min), mobile test on a real phone, run `POLISH` checklist, update `README.md` and `CREDITS.md`, Playwright smoke covering new flows.
**AC:** >= 55 FPS desktop and >= 45 FPS on mid-range Android on High (>= 50 on Low); memory flat over 10 min; smoke tests pass; no console errors.

---

## 15. DEFINITION OF DONE (PHASE 2)

- 7 visually distinct thief archetypes with costumes, masks, props, personalities and unique reactions; uploaded face integrated; mask-slip works.
- A Bangladesh street that feels alive and not repetitive; day / evening / night and weather change look and ambience smoothly.
- Events interact with time-of-day and weather in dramatic, readable ways.
- Funny bilingual dialogue, ticker, taunts and combo names.
- Shop, achievements, daily challenge, wanted-poster sharing, photo mode - all local.
- Stable performance targets met, auto quality fallback working, all tests green.

**Wait for the user to say `BEGIN PHASE 2`, then run P2-00 first.**
