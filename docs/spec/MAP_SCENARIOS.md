# MAP_SCENARIOS.md — The 8 maps redesigned as "living streets"

**Status:** SPEC v1 (2026-11-13) · Extends `docs/GAME_PLAN_V2.md §5` (visual/layer/hazard contract) with **who lives in each map and what happens there**.
**Contract:** every map folder (`src/maps/<id>/map.ts` [NEW]) must now also supply a `crowd` block and a `voice` block (schema in §1). Map is *not done* until its scenario beats play (§3) and `/design-review` + `playtest-audit` pass.
**Voice lines** referenced here are pool names from `docs/spec/voice/voice_lines.csv`. Pools marked **(new)** need lines added to the CSV (status `draft`) before the map ships.

---

## 1. Schema additions to `MapDefinition` (GAME_PLAN §5.1)

```ts
interface MapCrowdPlan {
  baseMood: number;                          // default 55
  density: "low" | "medium" | "high";        // ambient actors target: 6 / 10 / 14 (cap 28 incl. reactive)
  activityWeights: Record<string, number>;   // ids from CROWD_AND_NPC_SPEC §4 (0 = never on this map)
  roster: { npc: string; weight: number; layer: "balcony"|"sidewalk"|"road" }[];
  scenarios: { id: string; weight: number; overrides?: Partial<ScenarioDef> }[];   // templates S1..S7 + map-specific
  mob: { hpGate: number; trigger: "bump" | "setPiece" | "ultimate" ; minRunSec: number };
  vignettes: VignetteDef[];                  // fixed staged mini-scenes placed on the landmark (§2)
}
interface MapVoicePlan {
  hawkerPool: string;                        // e.g. "hawker_fuchka"
  ambientPools: string[];                    // e.g. ["teastall_chat","uncle_tut"]
  pack: string;                              // lazy-load pack id = map id
}
interface VignetteDef {                      // a staged "tiny story" that scrolls past as part of the scenery
  id: string; atKm: number;                  // position along the run (0..1 of the distance bar)
  layer: "balcony"|"sidewalk"|"road";
  actors: { npc: string; activity: string; offsetX: number }[];
  reaction?: "gasp" | "cheer" | "ignore";    // how the group reacts when the villain passes
}
```
Adding these fields to the registry's Zod schema is **part of V2-16** (map framework), not a later patch.

---

## 2. The eight living streets

Format per map: **Place feel → Scenery layers → Cast (who) → Vignettes (tiny stories) → Reactive scenarios → Mob trigger → Set-piece → Hazard flavour → Voice → "Owner's beat" mapping.** Layer art detail still follows GAME_PLAN §5.2.

### M1 · Mirpur 10 Metro Zone (noon · beginner · baseMood 55 · density medium)
- **Place feel:** red-dust, construction, the MRT viaduct overhead with pillars rising *through* the street.
- **Cast:** helmeted construction worker (`road`), rickshawala, office-goer with ID card, tea-stall uncle, bike rider with helmet, student, hawker (ঝালমুড়ি).
- **Vignettes:** (1) *Tea-stall adda* at the first pillar — 3 uncles `sipTea` + `newsRead`, one points at the chase when villain passes (`reaction: cheer`). (2) *Worker argument* — two helmeted workers `bargain` loudly over a trench (comic). (3) *Metro commuters* — 6 people filing down station stairs `phoneScroll`.
- **Reactive scenarios:** `S1_ei_je_ota`, `S5_adda_cheer`, `S6_rickshaw_block`, map-specific **`M1_trench_peek`**: a worker pops out of the trench ("ওরে বাবা!") and blocks that lane 1.2 s.
- **Mob trigger:** `bump` — villain collides with a **construction worker** at the trench edge.
- **Set-piece:** MRT train crosses overhead; the whole street *looks up* (all NPCs `NOTICE` upward, 1.5 s free-hit window since villain also gapes).
- **Voice:** `hawker_jhalmuri`, `teastall_chat`, `uncle_tut`, `rickshawala`.
- **Owner's beat:** the workers' bump-and-brawl at the trench.

### M2 · Farmgate Overbridge (sunset · easy · baseMood 60 · density high)
- **Place feel:** golden light, a steel footbridge spanning the whole screen, yellow buses, leguna queue, hawkers on the steps.
- **Cast:** commuters with bags, bus conductor (hangs from door), hawker (জুতা/মোজা), a *banker in suit*, students, a *selfie couple*, an uncle with a cage of parrots (gag).
- **Vignettes:** (1) **Overbridge crowd** (balcony layer): 8 walkers crossing; 3 stop and look down at the chase and shout (`bystander_pro`). (2) *Conductor shouting "ফার্মগেট ফার্মগেট!"* **(new pool `conductor_call`)**. (3) *Selfie couple* `selfie` — villain photobombs.
- **Reactive scenarios:** `S1`, `S4_reel_photobomb`, `S7_bhul_manush` (look-alike in a suit), **`M2_bag_rain`**: from the footbridge, shopping bags drop into a lane (hazard, telegraphed).
- **Mob trigger:** `setPiece` — the overbridge crowd *rushes down the stairs* and floods the road.
- **Set-piece:** bus honk wave: all buses honk; voices duck.
- **Voice:** `hawker_sale`, `conductor_call` (new), `aunty_shout`, `bystander_phone`.
- **Owner's beat:** "many people come" — the stair-rush mob.

### M3 · New Market & Nilkhet (night · medium · baseMood 55 · density high)
- **Place feel:** warm neon + string lights, book stalls, fuchka carts, the historic arch gate.
- **Cast:** book-seller, fuchka-wala, shoppers with bags, students with books, couple with ice-cream, a guy with a guitar at the arch, aunty bargaining.
- **Vignettes:** (1) **Guitar corner** at the arch: `guitar` + `sing`, 4 NPCs listening; they *keep listening* even as the chase passes (`reaction: ignore`) — until the chaser bumps them (comedy). (2) *Bargain pair* `bargain` ("একশো টাকা!"). (3) *Book stall* with a reader who `dozing`-reads.
- **Reactive scenarios:** `S2_kenore_maro` (dispute at the fuchka cart), `S5`, **`M3_power_flicker`**: lights cut for 1.5 s, NPCs light phone torches (neutral film pose), villain only visible by torch beams.
- **Mob trigger:** `bump` — villain crashes into the **fuchka cart**; fuchka crowd + shoppers pile on.
- **Set-piece:** power-cut candle glow.
- **Voice:** `hawker_fuchka`, `hawker_book`, `hawker_sale`, `bystander_sing`, `guitar_cheer`.
- **Owner's beat:** singing + guitar + bargaining (exactly the "different scenarios" in the brief).

### M4 · Old Dhaka — Chawkbazar Iftar Rush (dusk · hard · baseMood 65 · density high)
- **Place feel:** Mughal-era balconies, kite strings, painted rickshaws, haleem/jilapi stalls; narrow, packed.
- **Cast:** haleem-seller, jilapi-maker, rickshawala (richly painted), boys with kites, aunties on balconies, uncles with prayer caps carrying iftar bags, a street kid.
- **Vignettes:** (1) **Balcony aunties** (balcony layer) leaning out, shouting commentary (`aunty_shout`) and throwing a pillow/pot-lid gag (non-harmful prop) toward the villain. (2) *Jilapi stall* — maker flips jilapi; chaser can grab a **jilapi pickup**. (3) *Kite boys* on a rooftop `kite`.
- **Reactive scenarios:** `S1`, `S6`, **`M4_iftar_siren`** (set-piece), `S7`.
- **Mob trigger:** `setPiece` — after the **iftar siren**, everyone eats for 1.5 s (free combo window); a *bump* during that moment launches the pile-on (crowd already gathered).
- **Set-piece:** iftar siren: all NPCs freeze to eat 1.5 s; the villain keeps running → big gap-closing opportunity; afterwards the crowd surges.
- **Voice:** `hawker_haleem`, `aunty_shout`, `rickshawala`, `uncle_tut`. **Tone: respectful** — no jokes at the expense of the fast/prayer.
- **Owner's beat:** narrow street crowd → big mob.

### M5 · Sadarghat Launch Terminal (dawn · hard · baseMood 55 · density medium)
- **Place feel:** misty dawn on the Buriganga, multi-deck launches, wooden pontoon, coolies with sacks.
- **Cast:** coolie (carryLoad), boatman (nowka-majhi), passenger with suitcase, tea-seller on a boat, ticket-checker, fisherman, hawker (চা).
- **Vignettes:** (1) **Coolie line** hauling sacks along the pontoon (`carryLoad`) — they cross lanes (telegraphed). (2) *Launch boarding* — passengers queue; a few `selfie`. (3) *Tea boat* gag: tea-seller sells to a villain mid-leap.
- **Reactive scenarios:** `S1`, `S6` (coolie blocks lane), `M5_gangway_tilt`, `S2`.
- **Mob trigger:** `bump` — villain slams into a **coolie with a sack**; sack bursts (puffy flour cloud — cartoon), coolies + passengers join.
- **Set-piece:** launch horn; a launch glides past; gangway tilts → lanes shift 1 s.
- **Voice:** `hawker_cha`, `coolie_grunt` (new), `rickshawala` (reuse as boatman with a different babble profile).
- **Owner's beat:** crowds at a ghat — "people everywhere".

### M6 · Cox's Bazar Sea Beach (bright noon · medium · baseMood 60 · density medium)
- **Place feel:** endless sand, umbrellas, horse rides, kite-flyers, wave line.
- **Cast:** tourists (families), horse-rider, shell-necklace hawker, kite-flyer, lifeguard (whistle), kids with a ball, selfie-takers, aunty in a hat.
- **Vignettes:** (1) **Beach cricket** — boys play; the ball flies across the road (hazard). (2) *Horse ride* crossing (telegraphed). (3) *Selfie rows* of tourists.
- **Reactive scenarios:** `S1`, `S4`, `M6_beach_ball`, `S7`.
- **Mob trigger:** `ultimate` — Chappal Storm near ≥ 6 tourists makes them cheer and charge.
- **Set-piece:** **tidal surge**: a wave washes across lanes; NPCs scream & scatter, ground becomes wet-slow for 3 s.
- **Voice:** `hawker_beach`, `boys_cricket`, `selfie`, `aunty_shout`; **Chittagonian-dialect lines** deferred to F-09 (native speaker required).
- **Owner's beat:** "someone running, someone strolling" at a wide-open scene.

### M7 · Sreemangal Tea Garden (misty morning · medium · baseMood 50 · density low)
- **Place feel:** layered green terraces, shade trees, tea-pickers, a rail line.
- **Cast:** tea-picker women with baskets (respectful, dignified), garden babu, cyclist, tourist photographers, a boy with a goat, hawker (সাত রঙের চা).
- **Vignettes:** (1) **Tea-pickers in a row** (`carryLoad` variant) calmly picking; they pause and look up when the villain passes (`gasp`). (2) *Photographers* on the road `selfie`. (3) *Cyclist with a bell* crossing.
- **Reactive scenarios:** `S1` (softer), `S2`, `M7_goat_cross` (goat crosses; chaser must not hit — innocent rule applies to animals with a comic "ব্যা!").
- **Mob trigger:** `bump` — villain bumps the **tea-basket line**; leaves explode as a green puff; pickers + tourists join (gentle, comic).
- **Set-piece:** train passes on the rail crossing; barrier gates drop, lane 2 blocked 2 s.
- **Voice:** `hawker_tea`, `aunty_shout`, `kids_play`.
- **Owner's beat:** the calm map — contrast; "coffee/strolling" vibe.

### M8 · Haor Village Haat — Monsoon (rain · hard · baseMood 55 · density high)
- **Place feel:** floating-village horizon, bamboo bridge, muddy haat (market) day, cows, paddy.
- **Cast:** fish-seller (ইলিশ), farmer with a cow, boatman, kids splashing, women with baskets, a *buyer-seller haggling pair*, uncle with an umbrella.
- **Vignettes:** (1) **Haat stalls** along the road: haggling (`bargain`), hawkers calling. (2) *Kids splashing* in puddles (`kidsMarbles` variant). (3) *Cow on the road* (hazard w/ telegraph).
- **Reactive scenarios:** `S1`, `S5`, `S6` (cow-blocks), `M8_mud_slide`.
- **Mob trigger:** `setPiece` — villain slips in the mud pit; the **whole haat** (12–15) converges.
- **Set-piece:** downpour + a boat drifts across a flooded stretch; speed −25 % (reuse waterlogging rules in `events.json`).
- **Voice:** `hawker_haat`, `bargain`, `aunty_shout`, `uncle_tut`.
- **Owner's beat:** a big communal pile-on in a village market.

---

## 3. Scenario beats that must exist on **every** map (acceptance)

| Beat | Required | Test |
|---|---|---|
| ≥ 3 vignettes scrolling past with ≥ 3 different activities | yes | screenshot set across 3 seeds shows ≥ 12 distinct activities per map (CROWD §13) |
| `S1_ei_je_ota` pointers | yes | seeded run emits `crowd:react` with stance pro within 30 s |
| ≥ 1 map-specific scenario (named `M#_*`) | yes | forced via `window.__game.debug.runScenario("M3_power_flicker")` |
| mob finisher reachable & ends with police line | yes | forced → `crowd:mobStart` → `villain:dead` ≤ 3.2 s |
| innocent-hit penalty works with this map's NPCs | yes | debug-hit NPC → patience −10 |
| voice pack lazy-loads; T3 babble fallback works with zero clips | yes | network-blocked `/assets/voice/` run still plays babble |

## 4. Reuse / variety rules (so 8 maps don't feel like 1)
- No two maps share the same **three-NPC roster**; ≥ 40 % of the roster per map is unique.
- Each map has a **signature sound bed** (synth): Mirpur — drilling thumps; Farmgate — bus horns; New Market — string-lights hum + distant guitar; Old Dhaka — rickshaw bells + evening market murmur; Sadarghat — ship horn + water lap; Cox's — surf + gull; Sreemangal — birds + distant train; Haor — rain on tin + frogs.
- All map copy and lines are in Bangla first; proof-read by owner; **dialect** lines only via native speaker.
