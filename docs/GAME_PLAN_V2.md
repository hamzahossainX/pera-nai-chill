# GAME_PLAN_V2.md — From "button-masher with a health bar" to a real Bangladeshi chase game

**Date:** 2026-11-13 · **Status:** PLAN (nothing implemented) · **Inputs:** `docs/GAME_AUDIT.md`
**Owner brief (paraphrased from Bangla):** proper view + proper game plan; characters at "upgraded 2D" quality; characters must stay in the map and move properly; *many* maps, each beautiful on its own and themed on Bangladesh (a whole area per map); remove clutter; every feature works with proper UI; formal **and** funny.

Open owner decisions are tagged **[CONFIRM]** and collected in §12. Where the owner is silent, this plan states a default and the executor may proceed with it.

---

## 1. Product pillars (decision filter for every ticket)

1. **Chase, don't mash.** Every second the player is positioning, closing a gap, dodging, or timing a hit. Buttons are verbs, not a menu.
2. **A place, not a backdrop.** Each map is a recognisable Bangladeshi location with its own ground, landmarks, hazards, sound and set-piece.
3. **Formal craft, funny content.** Layout, type, spacing and animation follow one design law (`docs/DESIGN.md`); the *jokes* live in copy, props and slapstick — never in broken layout.
4. **Nothing off-screen, nothing lost.** Entities are clamped to the playfield; UI never covers the lanes; every selection is reachable on every supported viewport.
5. **Verified or it isn't done.** UI/visual tickets end with screenshots at the three reference viewports (CLAUDE.md "pixels or it didn't happen").

## 2. Core loop redesign (fixes G-01…G-07)

### 2.1 Verbs (player)
| Verb | Desktop | Touch | Notes |
|---|---|---|---|
| Change lane | `W/S` or `↑/↓` | swipe up/down on the left half, or on-screen ▲▼ | 3 lanes; 140 ms tween; i-frames 120 ms |
| Dash (close the gap) | `Shift` / double-tap `→` | dash button (right thumb) | burst +60 % speed for 450 ms; costs 25 stamina; cooldown 2.5 s |
| Jump (low hazards) | `Space` | tap on the right half (above the dock) | 520 ms airtime; clears pothole/puddle/low barricade |
| Attack | `1–4` (slap, punch, kick, chappal) | 4 round buttons, right cluster | melee needs **gap ≤ MELEE_RANGE** and same/adjacent lane; chappal works at any gap, same lane ±1 |
| Ultimate | `E` | glowing button when rage = 100 | unchanged (Chappal Storm) |
| Taunt | `T` | small button | now has a mechanical effect (§2.5) |

Cut the banana and can-kick *hotkeys* — they become **map pickups** thrown automatically in the direction of travel (less dock clutter, more world interaction). See §9.

### 2.2 The gap (new core system)
- `gap = villain.x − chaser.x` in logical px. Both entities have a **home X** (`CHASER_HOME_X=300`, `VILLAIN_HOME_X=880`); on-screen positions are `home + offset` where offsets are spring-driven and **clamped** to `[60, 1220]`.
- Villain flees at `baseFleeSpeed × archetype.speedMultiplier`; chaser runs at `runSpeed × buffs`. `gap` therefore grows/shrinks over time; the **camera does not follow** — instead both entities slide within a fixed "arena window" (x 120–1160) and the scroll speed shows relative motion.
- Zones: `CLOSE (< 220)` melee allowed, hits get +25 % damage and screen-shake; `MID (220–560)` chappal range; `FAR (> 560)` villain "gaining" — warning arrow at screen edge; `ESCAPED (> 900 for 6 s)` → lose.
- Hit knockback becomes an **impulse into the offset spring** (never a raw `x +=`), always returning to home — this is the permanent fix for C-01.

### 2.3 Fail states & stakes (G-01)
- **Chaser "ধৈর্য / Patience"** (0–100, shown as a sweat-drop bar): drained by hitting hazards, by the villain's counter-moves, and slowly while `FAR`. 0 → "হাল ছেড়ে দিলাম" (lose).
- **Escape** (§2.2) → lose.
- **Event timers**: loadshedding/strike/etc. already exist; they must now change *the chase* (e.g. blackout hides the villain except glowing eyes AND he gains speed; strike narrows to 2 lanes) rather than only dressing the scene.

### 2.4 Hazards that actually threaten the player (G-06)
Each map defines `hazards[]` with `{kind, lanes, telegraphMs, effect}`; every hazard has a **telegraph** (shadow/arrow 700 ms before arrival), a **counter** (jump / lane-change / break with kick), and a **cost** (patience −8..−15 and a short slow). The villain may *use* hazards against the player: shoves a barricade into the chaser's lane, throws a banana peel, drags a crowd behind him (archetype-specific "counter-moves", §4.3). Villains still trip on hazards **only** if the player lured them (lane-aligned + stun-hit) — turning G-06 from reward into tactic.

### 2.5 Villain behaviour & stats become real (G-04, G-05)
- `baseHp`, `speedMultiplier`, `dodgeRate` are wired in: HP bar max, flee speed, and a dodge roll (a successful dodge plays a side-step and negates one attack; telegraph = 150 ms "wiggle").
- Taunt: drains villain **morale**; at morale 0 the villain stumbles for 1.2 s (opens a free combo window). Morale regen 4/s.
- **Boss** is a *chosen* encounter per map (the last stage, "Chor-er Sardar"), HP = archetype `baseHp × 1.6`, two phases. Remove the hidden every-3rd-run override entirely.

### 2.6 Run structure & progression (G-07)
- A run = **one stage on one map** with a target: catch the villain before he reaches the map's "safe house" (distance bar 0→100 %, ~90–120 s) .
- **Stars (1–3):** ★ caught · ★ patience > 50 % at the end · ★ best combo ≥ map target.
- Maps unlock sequentially by stars + optional Taka unlock (§6). Taka is earned per run (tuned so the first shop item costs ≈ 2 runs); fix the +৳5000 daily outlier (G-08).
- Result screen: stars, combo, Taka, "next map" CTA, replay.

## 3. View, camera & layout spec (fixes M-04, U-01, U-02)

**One layout module**, `src/config/layout.ts`, is the only place Y/X zones live. Logical canvas stays **1280×720** (Phaser `FIT`, letterboxed), with CSS `dvh` containers.

```
y   0 ─ 100   HUD band (React): top-left villain card (compact), top-right pause/sound/fullscreen
y 100 ─ 340   SKY + SKYLINE + LANDMARK layers (map art)      ← no dead band; fill with set-piece layers
y 340 ─ 410   SIDEWALK / ground-edge band (shopfronts, props at 0.7× speed)
y 410 ─ 600   PLAY ZONE — 3 lanes at y = 450 / 515 / 580, scale 0.88 / 1.0 / 1.12
y 600 ─ 720   FOOT ZONE — foreground FX + road edge; **no actors, no UI covering actors**
```
- Lane feet are at least **28 px above** the dock's top edge on every viewport.
- Touch controls live in **thumb zones**: left cluster (lane ▲▼) and right cluster (dash/jump/attacks) at the bottom corners, *not* a centered strip across the lanes. The centered 6-button dock is removed.
- HUD on `height ≤ 450` (landscape phone): villain card collapses to icon + HP bar; ticker hidden; Taka/stamina fold into a single pill. Target: **UI ≤ 22 % of viewport area** at 844×390.
- Ticker: single line, top, below the HUD band, auto-hides during `CLOSE` zone combat; never overlaps stamina/Taka.
- Safe-area insets (`env(safe-area-inset-*)`) applied to HUD and touch clusters.
- Reference viewports for every UI ticket: **1280×720, 844×390, 1024×768** (+ 1920×1080 smoke).

Camera: fixed. Juice only (shake, zoom-to 1.08, slow-mo finisher already exist — keep).

## 4. Characters — "upgraded 2D"

### 4.1 Art direction
Clean **vector-cartoon**: 3-head chibi proportions, uniform 3–4 px dark outline, flat cel colour + one shade layer + one rim-light, readable silhouette at 96 px height, comic/rickshaw-art colour accents. Heads are large and carry the uploaded face (the joke). Reference feel: Metal-Slug-lite / Brawlhalla-simple, *not* flat rectangles.

### 4.2 Technical approach — **[CONFIRM] default = A**
- **A (default, recommended): keep the layered SVG slot rig, fix and redraw.** Cheapest, preserves face-texture mounting and procedural motion. Required work: (1) instrument and fix pose math (C-02): clamp lean ≤ 8° at run, ≤ 18° at dash; neck connects head↔torso; limb length ratios locked (upper:lower = 1:1.05); hand/prop slots never cross the torso centreline in run; (2) redraw all 8 kits to the art direction at 2× source resolution; (3) pre-bake a **pose sheet** per archetype (idle, run×8 frames, dash, 4 attacks, hit, stun, trip, dead, taunt, victory) for review at `/dev/characters` (dev-only, gated).
- **B (fallback if A fails the silhouette gate after 2 attempts): sprite sheets** (hand/AI-drawn frames, face still composited on a head slot). Higher quality ceiling, ~5× asset cost, loses procedural reactivity.

### 4.3 Per-archetype distinctness (also fixes G-04/C-05)
Each archetype ships: silhouette (different head/body ratio), unique run cadence, **one counter-move**, **one idle gag**, a hit-reaction, a defeat gag, and (where relevant) `hood/mask` layers so mask-slip works for all.

| Archetype | Silhouette note | Counter-move (villain uses against player) |
|---|---|---|
| Phone Snatcher | lean, hooded | zig-zags every 2 s (high dodge) |
| Pickpocket | gamchha-masked, quick | drops fake wallets (pickup bait → ambush lane) |
| Cable Chor | lungi + safety vest, heavy | swings a wire coil — hazard in his lane |
| Manhole Chor | carries manhole cover | raises cover as shield (blocks one chappal) |
| Eid-Market Chor | punjabi + shopping bags | tosses bags that slow the chaser |
| Chicken Chor | chicken under arm, fast | chicken flies out → blocks view 1 s |
| Chor-er Sardar (boss) | coat + gold chain | summons 2 goons; phase 2 doubles lane-switch speed |

### 4.4 Movement correctness rules (permanent)
1. **No code may write `rig.x`/`rig.y` directly** except `EntityMotion` (new): `home`, `offset` (spring), `laneY` (tween), `jumpY` (tween), `clampBounds`. Hit-stun, trip, vault, dash, knockback all add to these channels — so a lane-change during a vault cannot teleport (fixes C-03).
2. Rig tests: unit-test `EntityMotion` (clamp, spring-back within 400 ms, no drift after 500 random impulses) and a Playwright test asserting entities stay within x∈[0,1280] after 60 s of auto-attacks.
3. Pose gate: `/dev/characters?frames=1` renders the pose sheet; **silhouette test** = each pose's non-transparent bbox must fit a 160×220 box and its head centre must lie within ±14 px of the neck joint x. Automated via canvas readback in a Vitest/Playwright check.

## 5. Map system (fixes M-02, M-03, M-04, M-05)

### 5.1 Data model — one definition per map, zero hard-coded `if (mapId)` anywhere
```ts
// src/maps/<id>/map.ts   — each map is a self-contained folder (file-disjoint = parallelisable)
export interface MapDefinition {
  id: string;                         // open string, registered in src/maps/registry.ts
  name: LocalizedText; tagline: LocalizedText; region: LocalizedText; // "Dhaka", "Chattogram Division"…
  difficulty: 1|2|3|4|5; unlock: { afterMapId?: string; stars?: number; taka?: number };
  palette: { sky: [string,string,string]; ink: string; accent: string; signage: string[] };
  time: { default: TimeOfDay; locked?: boolean };       // fixes M-03: map owns time unless a mode overrides
  weather: { default: WeatherType; allowed: WeatherType[] };
  ground: { kind: 'asphalt'|'brick'|'sand'|'mud'|'deck'|'dirt'; speedMod: number; laneLines: boolean };
  layers: ParallaxLayerDef[];          // 6–8 layers, each: textureKey/svg, speedFactor, y, tint-by-time, repeat
  landmarks: LandmarkDef[];            // large unique mid-ground art that scrolls past ≥ 1× per run
  props: PropDef[];                    // ≥ 8 unique decor props, weighted spawn
  hazards: HazardDef[];                // ≥ 3, ≥ 1 unique to this map (§2.4)
  setPiece: SetPieceDef;               // scripted once-per-run moment (a train, a launch horn, a tide…)
  audio: { bgm: string; ambience: string; stingers?: string[] };
  copy: { barks: LocalizedText[]; ticker: LocalizedText[]; billboards: Billboard[] };  // max 4 billboards on screen
  events: { allowed: string[]; bias?: Record<string, number> };
}
```
- `ParallaxSystem` becomes a generic **layer renderer** driven by `layers[]`; `SpawnSystem` reads `hazards/props`; `EventSystem`/`AudioService` read `events/audio`. Delete the `mapId` branches (`ParallaxSystem.ts:51-66`, `SpawnSystem.ts:70-82`).
- Assets: **SVG source files per map** under `public/assets/maps/<id>/…` + a tiny manifest, rasterised once at preload (moves art out of the 2210-line `BootScene`). Procedural fallbacks stay for resilience.
- Adding a map = add a folder + one line in `registry.ts`. That is the Definition of Done for the framework.

### 5.2 The eight launch maps (Bangladesh themes — **[CONFIRM] list & order**)
Each is a *whole area*: a skyline, a landmark, a ground, a mood, a gag.

| # | Map | Region | Time / weather | Ground | Signature look | Unique hazard | Set-piece |
|---|---|---|---|---|---|---|---|
| 1 | **Mirpur 10 Metro Zone** (rework) | Dhaka | noon / clear dust | asphalt + dug trench patches | elevated MRT viaduct with pillars *in the mid-ground*, red dust haze, Bata/Kacchi signs | open trench (jump) | MRT train crosses overhead + rumble |
| 2 | **Farmgate Overbridge** (rework) | Dhaka | golden sunset | asphalt | steel footbridge spanning the screen, yellow buses, leguna queue, hawkers | bus cutting across lanes | footbridge crowd drops a shopping bag rain |
| 3 | **New Market & Nilkhet** (rework) | Dhaka | night, neon | brick-paved | historic arch gate, book stalls, fuchka carts, string lights | fuchka-cart roll | power-cut flicker → candle glow |
| 4 | **Old Dhaka — Chawkbazar Iftar Rush** | Dhaka | dusk | narrow brick (2-lane feel via crowd edges) | Mughal-era balconies, kite strings, painted rickshaws, haleem/jilapi stalls | iftar-crowd surge | iftar siren: everyone freezes 1.5 s to eat (free combo window) |
| 5 | **Sadarghat Launch Terminal** | Dhaka (Buriganga) | dawn mist | wooden deck/pontoon | giant multi-deck launches, coolies with loads, river haze | swinging cargo rope | launch horn + ferry glides past; gangway tilts |
| 6 | **Cox's Bazar Sea Beach** | Chattogram | bright noon | sand (−12 % speed, dash-friendly) | endless beach, umbrellas, horses, kite-flyers, wave line | crab swarm / beach horse crossing | tidal wave surge washes lanes |
| 7 | **Sreemangal Tea Garden** | Sylhet | misty morning | dirt path | layered green terraces, shade trees, tea-pickers, rail line | level-crossing barrier | train passes; rail-crossing gates drop |
| 8 | **Haor Village Haat (Monsoon)** | Sylhet/Kishoreganj | monsoon rain | mud (puddles slow) | floating-village horizon, bamboo bridge, haat stalls, cows, paddy | cow herd, mud pit | sudden downpour + a boat crossing the road-flood |

*Stretch (not in 8):* **Gabtoli Eid-Homecoming Bus Terminal** (chaos of luggage-topped buses).

**Content rules:** satire targets *situations* (traffic, loadshedding, bargaining), never religion, real politicians/parties, or real brand logos — use fictional brand names. Iftar/Eid maps must be respectful in tone. Bangla copy is proof-read by the owner **[CONFIRM]**.

### 5.3 Map Done-definition (per map; enforced by `/design-review`)
- [ ] Screenshots at 1280×720, 844×390, 1024×768 (+ night/day if `time` unlocked).
- [ ] **Thumbnail test:** convert to 64 px greyscale — a reviewer can tell all 8 maps apart.
- [ ] ≥ 6 parallax layers, ≥ 1 landmark, ≥ 8 unique props, ≥ 3 hazards (≥ 1 unique), 1 set-piece, 1 BGM variant.
- [ ] No text smaller than 18 px logical on any in-world sign; max 4 sign billboards visible.
- [ ] Map-specific villain barks (≥ 6) and ticker lines (≥ 6), bilingual, proof-read.
- [ ] Reaches 55+ FPS on the reference mid-range laptop (perf budget in §10).
- [ ] Passes the "10-minute gamer playtest" (§11).

## 6. Economy & meta (small, honest)
- Start 300 Taka; run payout ≈ 120–260 depending on stars; shop items 250–1500 (unchanged). Remove `+৳5000` outlier. Unlock each map after the previous by ≥ 1 star (maps 5–8 also accept a Taka unlock).
- Shop becomes **cosmetics + chappal variants only** (outfits for chaser, chappals, villain skins). No pay-to-win stat items.
- Persistence: localStorage `{stars: Record<mapId,0|1|2|3>, taka, owned[], bestCombo}` with versioned migration.

## 7. UI/UX rebuild (fixes M-01, U-01…U-07)

### 7.1 Screens (replace the one-page lobby)
`Splash/Load` → **Home** (Play, Shop, Achievements, Settings; one animated hero scene) → **Setup stepper** (1 Face & Villain · 2 Map · 3 Loadout) → `Run` (HUD) → `Pause` → **Result**.
- **No vertical scroll traps.** Each step fits one viewport; content that overflows uses a *bounded* scroller (`h-dvh overflow-y-auto overscroll-contain`) and horizontal carousels (map cards).
- Map step = horizontal carousel of **8 cards** with a live parallax thumbnail, locked/unlocked state, stars, difficulty pips. Selecting a card plays that map's 3-second preview.
- Setup is skippable: "Quick Play" uses last choices; Daily Challenge is a single compact banner on Home, not a lobby panel.

### 7.2 HUD (in run)
Top-left compact villain card (face, name, HP bar, morale pip); top-right pause/sound; top-center **distance-to-safehouse bar + gap indicator**; bottom thumb clusters (§3); contextual prompts only ("TAP TO DASH" appears when `MID`). Patience bar replaces stamina clutter (stamina folded into dash button radial). Event banner replaces ticker during events.

### 7.3 Requirements (all screens)
Tokens only (DESIGN.md) · min tap target 48 px · focus rings · `button` semantics (no clickable `div`s) · `prefers-reduced-motion` · Bangla line-height ≥ 1.5 · Bangla/English never both at full size (primary = Bangla, secondary = small English) · no text over busy art without a scrim.

## 8. Cleanup & removals (owner asked to remove clutter)
| Remove / demote | Why |
|---|---|
| Centered 6-button dock | replaced by thumb clusters (§3) |
| Banana & can hotkeys | become map pickups (§2.1) |
| Pre-run "Crime/Wanted reason" picker | make it random flavour text on the Wanted poster; saves a lobby step |
| Villain stat bars not backed by logic | now backed (§2.5) — keep; remove any that still aren't |
| Hidden every-3rd-run boss | replaced by explicit boss stage (§2.5) |
| Chappal variety selector in lobby | move to Shop/Loadout |
| BreakingNews ticker overlapping HUD | single-line, top, auto-hide (§3) |
| Weapon tutorial toast over lanes | one-time coach-mark in thumb zone |
| `/dev/characters`, `DebugBar` in prod | gate by env/flag |
| Repo clutter: `Hr*.jpg`, `The_A_Stack.zip`, Next starter SVGs, duplicate root plans | move plans into `docs/archive/`; delete the rest (owner confirms) |

## 9. Pickups (replace weapon hotkeys)
Banana peel (trap behind chaser → villain slips if he doubles back; also usable ahead), Soda can (auto-kick on contact), Daab (patience +10), N95 mask (smog immunity), Biriyani (rage +20), Tong Cha (stamina full), Taka bag. Map-flavoured variants (e.g. ice-cream at the beach).

## 10. Technical architecture changes
1. `src/config/layout.ts` (§3) — single source of truth; fixes magic numbers.
2. `src/game/motion/EntityMotion.ts` (§4.4) — all entity position writes.
3. `src/maps/{registry.ts, <id>/map.ts, <id>/art/*.svg}` + generic `ParallaxSystem` (§5.1).
4. `GapSystem` + `PatienceSystem` + `HazardSystem` (telegraphed) replacing ad-hoc logic in `SpawnSystem`.
5. Split `BootScene.ts` by domain (`textures/chars.ts, fx.ts, ui.ts`) as maps move to SVG — target < 400 lines.
6. Test hook: `?test=1` → fixed-step loop + `window.__game = { getState() }` (read-only) so Playwright can assert positions without relying on wall-clock fps.
7. **Perf budget:** ≥ 55 FPS on a 2019 mid-range laptop & 45 FPS on a mid Android; ≤ 12 draw-call layers per map; first-load < 4 s on throttled 4G; cap total map SVG raster memory at 24 MB.

## 11. Gamer playtest script (run per map & before release)
Ten-minute blind run. Fail if any box is unchecked:
- [ ] I understood how to move/attack within 20 s without reading.
- [ ] I lost at least once for a reason I could name ("I hit the trench").
- [ ] The villain never left the screen unless he *escaped*; nothing drifted off-edge in 120 s of mashing.
- [ ] I could always see my feet; no UI covered a lane on 844×390.
- [ ] I could reach the map picker and every setting without scrolling bugs on desktop & phone.
- [ ] Each map looked and sounded different within 3 seconds.
- [ ] No text overlap; no clipped Bangla glyphs; no English half-word truncation.
- [ ] The set-piece made me smile and the hazard telegraph was fair.
- [ ] Restart → Result → Next map flow has no dead ends.

## 12. Open decisions for the owner **[CONFIRM]**
| # | Decision | Default taken if owner is silent |
|---|---|---|
| D1 | Character tech: A (rebuild SVG rig) vs B (sprite sheets) | **A**, auto-fallback to B after 2 failed silhouette gates |
| D2 | The 8 maps & order (§5.2) | as listed |
| D3 | Run structure: stage-based with stars (§2.6) vs endless | stage-based |
| D4 | Remove banana/can hotkeys (pickups instead) | yes |
| D5 | Touch layout: thumb clusters (replaces dock) | yes |
| D6 | Bangla copy proof-reading by owner | owner reviews before release |
| D7 | Gabtoli bonus map | deferred |

## 13. Ticket plan (execute in this order; details/AC in `docs/ROADMAP.md §V2`)

| Wave | Tickets | Parallel? | Why this order |
|---|---|---|---|
| **W0 Stabilise** | V2-00 Lobby unscrollable (M-01) · V2-01 `layout.ts` + test hook (T-01) · V2-02 `EntityMotion` + knockback fix (C-01,C-03) | sequential (touch shared files) | Unblocks everything; kills the S0 bugs first |
| **W1 Core loop** | V2-03 Player controls · V2-04 Gap/Patience/fail states · V2-05 Hazards & villain counter-moves & stats wiring · V2-06 Run structure & stars | sequential (shared systems) | Makes it a game before making it pretty |
| **W2 Characters** | V2-07 Rig math fix + pose sheet gate · V2-08 Chaser redraw · V2-09…V2-15 villain redraws (one per archetype) | 7 archetype tickets file-disjoint → parallel (cap 5) | Visible quality jump |
| **W3 Map framework** | V2-16 `MapDefinition` + generic parallax + registry · V2-17 Rework maps 1–3 | framework alone first, then 3 in parallel | Proves the framework |
| **W4 New maps** | V2-18…V2-22 maps 4–8 (one folder each) | parallel (cap 5) | Content wave |
| **W5 UI/UX** | V2-23 Home + stepper + carousel · V2-24 HUD/thumb controls · V2-25 Result + shop + settings | sequential per screen | After mechanics are stable |
| **W6 QA & polish** | V2-26 Playwright suite (GPU) · V2-27 perf pass · V2-28 repo cleanup · V2-29 a11y/Bangla review · V2-30 final playtest | — | Release gate |

**Parallelism note:** the A-Team default cap is 5 concurrent worktree agents; W2 (7 archetypes) and W4 (5 maps) fit when run 5 + 2 or 5 at a time. Never two agents on shared files (`layout.ts`, `EntityMotion`, `MapDefinition`, `registry.ts` are shared — they live in W0/W3 *alone*).
