# CROWD_AND_NPC_SPEC.md — A living street (bystanders, reactions, the pile-on)

**Status:** SPEC v1.1 (2026-11-13, after adversarial review) · **Implements owner brief:** people are always around; they notice the chase, point, shout, argue about it, sometimes join; at a dramatic moment a bump turns into a 10–15 person cartoon pile-on; meanwhile others sing, play guitar, sip tea, jog, stroll — every map is a *scene full of tiny stories*.
**Depends on (build order):** V2-01 `layout.ts` [NEW], V2-02 `EntityMotion` [NEW], V2-16 `MapDefinition` [NEW]. Do **not** start before those exist.
**Truth sources:** `docs/spec/API_FACTS.md` (what exists) · `docs/GAME_PLAN_V2.md §3` (zones) · `docs/DESIGN.md`. Anything named here with `[NEW]` does not exist yet and must be created exactly as specified.

---

## 1. Design intent (why this feature)

1. **Comedy through staging.** The funniest beat in a Dhaka street chase is *the crowd's commentary*. The crowd is the joke engine, the chaser is the straight man.
2. **Gameplay, not wallpaper.** Crowd members can help (point, run alongside), hinder (block a lane, drop a fish basket), or punish (if you hit an innocent, the mood turns on *you*).
3. **Cheap to run.** Bystanders are lightweight sprites, not 15-slot rigs. Hard budgets in §9.
4. **Always cartoon.** Slapstick only — dust clouds, stars, comic words. No blood, no realistic impact, no kicking a downed character. See §10 safety rules.

## 2. World layers the crowd lives in (coordinates from `src/config/layout.ts` [NEW])

| Layer | y-range (logical px) | Who lives here | Scroll factor | Interactive? |
|---|---|---|---|---|
| **Balcony / upper** | 120–330 | aunties on balconies, kids on rooftops, footbridge walkers | 0.55–0.9 | no (reacts only: shout/throw gag) |
| **Storefront / sidewalk** | 340–410 | tea-stall adda, hawkers, guitarist, selfie-takers, shoppers | 0.7 | reacts |
| **Road lanes** | lane Y 450 / 515 / 580 | crossing pedestrians, rickshaw-wala, joggers, mob | lane scale (0.88/1.0/1.12) | **yes** (can block, be hit, join mob) |
| **Foreground** | 600–720 | none (reserved for FX / dust) | — | no |

An NPC belongs to exactly one layer at a time. Only **road-layer** NPCs have a lane and collide.

## 3. NPC model

### 3.1 Archetype data (`src/config/npcs.ts` [NEW]) — one record per NPC type
```ts
export type NpcLayer = "balcony" | "sidewalk" | "road";
export type Stance = "pro" | "against" | "neutral";   // toward the chaser's chase
export interface NpcArchetype {
  id: string;                       // e.g. "uncleLungi"
  name: LocalizedText;              // {bn,en}
  body: "slim" | "round" | "tall" | "kid" | "elder";   // 5 base silhouettes
  palette: string[];                // palette ids from tokens (never raw hex in code)
  props: string[];                  // prop texture keys (must exist in manifest)
  voiceSpeaker: string;             // speaker id in docs/spec/voice/voice_lines.csv
  defaultStance: Stance;
  walkSpeed: number;                // px/s at lane scale 1.0
  activities: string[];             // ids from ACTIVITIES (§4)
  canJoinMob: boolean;
  canBlockLane: boolean;
}
```
### 3.2 Visual construction (cheap, varied)
- **Kit-bash, not full rigs.** Parts: 5 bodies + 8 outfits + ≥ 10 headgear/props = **≥ 23 SVG parts** (more welcome). Looks are composed **on demand** into a pooled texture page (`npc-atlas`) holding **≤ 24 composed walkers** at once (each 4-frame walk ≈ 70×130 px → ≈ 36 k px; 24 walkers ≈ 0.9 M px ⇒ fits one 1024×1024 page; activity poses use a second page ≤ 1024×1024). Selection space is ≈ 5×8×10 = **400 combinations**; the pool recycles least-recently-used looks. (Earlier "≥ 120 distinct people in one atlas" was infeasible and is withdrawn.)
- Walk = 4-frame loop + procedural bob; activity poses = 2–4 frame loops.
- Heights: sidewalk 110–130 px, road at lane scale (≈ 190 px at 1.0, same as main characters), balcony 70–90 px. **No uploaded faces on NPCs** (privacy + clarity).
- **Silhouette/palette distinct** from chaser (green polo) and villain archetypes (dark hoodie etc.): NPCs never reuse their exact silhouette + palette. The S7 look-alike is the one exception and uses a *similar-but-different-hue* decoy outfit (never the villain's own palette).
- Diversity: ages, genders, attire (lungi/saree/school uniform/hijab/gamchha/suit/helmet) respectful; no ethnic/religious caricature; no real-brand logos. **Religious attire (e.g. prayer caps) may appear on ambient NPCs but those NPCs have `canJoinMob:false`** — they never take part in the pile-on (§9.3).
- Animals (goat, cow, horse, crab) are **hazard props defined in the map's `hazards[]`**, not NPC archetypes; they obey the same innocent-hit rule via `HazardDef.innocent: true` (comic "ব্যা!"/"হাম্বা!" sorry-gag, same penalty).

### 3.3 Runtime state machine (per NPC) — **only these states exist**
**One visibility rule (used everywhere):** the chase is *visible* to an NPC when `villain.x ∈ [80, 1200]` **and** the NPC is inside the camera view. Each NPC reacts at most once per 8 s (`reactCooldownMs`).
Activities (§4) are **sub-states of AMBIENT** (field `activity`), not separate states.
```
AMBIENT(activity) ─(chase visible)──────────▶ NOTICE (350–600 ms: "!" mark, head turn / look-up)
NOTICE ──▶ REACT by stance:
   pro      ──▶ POINT_SHOUT ──▶ (30%) JOIN_CHASE (run alongside ≤ 3 s) ──▶ AMBIENT
   neutral  ──▶ FILM (phone up) ──▶ AMBIENT
   against  ──▶ MEDIATE (palms out) ──▶ (25%) STEP_BLOCK (road layer only, 1.2 s) ──▶ AMBIENT
scenario-driven (entered only via ScenarioRunner `act`/set-piece):
   ARGUE   (2.5 s, alternating bubbles, S2)            ──▶ AMBIENT
   FREEZE  (look-up or eat, 1.2–1.5 s: MRT train, iftar siren, torch pose) ──▶ AMBIENT
   GASP    (0.8 s one-shot; tea-pickers, tourists)      ──▶ AMBIENT
   SCATTER (flee off-screen ≤ 1.5 s: tidal surge, mob end) ──▶ despawn
mob:       any eligible state ──(mob trigger)──▶ PILE_ON ──▶ DISPERSE(=SCATTER) ──▶ despawn
hit:       any road-layer state ──(hit by chaser)──▶ BONKED (0.8 s, stars) ──▶ GETUP ──▶ AMBIENT
```
Forbidden transitions (unit tests assert they throw): `PILE_ON → REACT/NOTICE/AMBIENT`, `BONKED → PILE_ON`, `SCATTER → anything but despawn`, any REACT sub-state re-entered inside `reactCooldownMs`.

## 4. Ambient activities (the "tiny stories") — `ACTIVITIES` in `src/config/npcs.ts` [NEW]

Each activity: `{id, layers[], frames, loopMs, prop?, sfxLoop?, lines? (voice pool ids), tags[]}`. Spawning picks activities allowed by the **map's** `crowd.activityWeights`.

| id | Looks like | Loop sound (quiet, optional) | Voice pool | Notes |
|---|---|---|---|---|
| `sing` | person singing, hand on chest, sways | humming synth (original melody) | `bystander_sing` | owner request |
| `guitar` | seated/standing guitarist, strum arm | plucked-string synth loop (original, pentatonic) | — | owner request; nearby NPC claps |
| `sipTea` | cha-cup sip, steam puff | clink | `teastall_chat` | adda cluster of 2–4 |
| `coffee` | takeaway cup, checks phone | — | — | owner request ("coffee") |
| `jog` | jogger crossing lanes left→right at 1.4× walk | footfalls | `jogger_huff` | road layer; **moves** |
| `stroll` | slow walk, hands behind back | — | — | uncle/aunty pairs |
| `phoneScroll` | thumbs on phone, walks into things | — | `phone_zombie` | gag: bonks into a pole |
| `selfie` | pose + flash | shutter | `selfie` | drifts into frame behind action |
| `reelDance` | trending-dance loop (generic, original choreography) | beat synth | `reel_maker` | filming-themed |
| `bargain` | animated hand-talking at a stall | — | `bargain` | pair |
| `hawk` | hawker calling, holds goods | — | `hawker_<map>` | per-map call lines |
| `carryLoad` | coolie with sack/basket, bent walk | — | `coolie_grunt` | slow, road-edge |
| `kite` | holds kite string up, looks up | — | — | rooftops/beach/open map |
| `cricketPlay` | bat+tennis-ball swing | bat knock | `boys_cricket` | side alley/open map |
| `newsRead` | reads newspaper, tuts | — | `uncle_tut` | tea-stall |
| `dozing` | rickshaw-wala asleep on seat, snore bubble | snore | — | wakes if chase passes |
| `kidsMarbles` | two kids, flick | click | `kids_play` | |
| `umbrellaCouple` | pair under umbrella (rain/sun) | — | — | weather-aware |
| `waveBalcony` | aunty leans on railing, waves/shouts | — | `aunty_shout` | balcony layer |

Rules: ≥ 12 distinct activities visible across a run on any map; never > 2 of the same activity within 400 px.

## 5. Reactions — what bystanders do when they see the chase

Trigger: the **chase is visible** (single rule in §3.3). Reaction chosen by `stance`, with stance seeded per NPC by **crowd mood** (§7).

| Stance | Gesture | Voice pool (see `docs/spec/voice/voice_lines.csv`) | Gameplay effect |
|---|---|---|---|
| **pro** | points at villain, cups mouth | `bystander_pro` ("ওই যে! ধর ধর!") | +mood; 30 %: runs alongside 3 s (visual only) ; 10 %: **helps**: shouts lane tip → highlights villain's lane for 1 s |
| **neutral** | holds phone up filming | `bystander_phone` ("ভাইরাল হইবে!") | adds to **Viral meter** (§8) while chaser is mid-combo |
| **against** | palms out, steps toward road | `bystander_mediator` ("ঠান্ডা হন ভাই!") | 25 %: steps into lane for 1.2 s as a *telegraphed soft-block* (patience −4 if collided, no HP loss) |

**"Why are they beating him?"** — the owner's "ওকে কেন মাইর দিতাছে ওরা" beat: a **dispute scenario** (S2 in §11): a `pro` NPC and an `against` NPC stop and argue about it for 2.5 s with alternating bubbles; if the chaser passes during the argument, the `against` NPC gets +1 "mediator" mark which later increases the chance the crowd *doesn't* join the mob unless the player lands a visible big combo (so a fair, readable reason).

## 6. Fair-play rule — the innocent bystander

- If a **projectile** or **melee** from the chaser overlaps a road-layer NPC that is not the villain (`npc.state != PILE_ON`), the NPC is `BONKED`: comic word ("ভুল মানুষ!"), stars, chaser **patience −10** and **speed −15 % for 1.0 s**, combo resets, crowd mood −15.
- Telegraph: NPCs about to cross a lane show a ground shadow + `!` 500 ms before entering (same telegraph rule as hazards, GAME_PLAN §2.4).
- Detection hooks: melee via `CombatSystem.applyHit` position test; chappal/banana/can via `Projectile` overlap test against road-layer NPCs and `innocent` hazards (V2-32 touches both `CombatSystem.ts` and `Projectile.ts`).
- Hitting 3 innocents in one run → the **crowd turns on the chaser**: a 6-NPC mini-mob runs at the chaser for 2.5 s (chaser must dash/jump out or lose 15 patience). This is the owner's "মানুষ আসছে, ঝামেলা করবে" beat and creates real stakes.

## 7. Crowd mood meter (0–100, hidden from UI except as a subtle HUD icon halo)

- Starts at `map.crowd.baseMood` (default 55).
- +3 per landed hit on the villain *in view of ≥ 2 NPCs*; +6 per combo tier; +10 on a witnessed trip/slip.
- −15 per innocent hit; −5 per hit on the villain while ≥ 2 `against` NPCs are watching; decays toward base at 2 pts/s.
- Mood bands: `<30` crowd mostly **against** (mob chance 0; hecklers: "বেচারারে মারছো কেন?"), `30–70` mixed, `>70` mostly **pro** (mob eligible).
- Stored in a plain field of `CrowdSystem`; published **only** via the bus event `crowd:mood` (single channel, no store field), emitted by `CrowdSystem` at ≤ 10 Hz (a simple accumulator inside `CrowdSystem.update` — there is no existing store throttle to reuse). A HUD-local listener may render the halo.

## 8. Viral meter (bonus layer, small)

While the chaser is performing a combo ≥ 3 and ≥ 1 neutral NPC is filming, `viral` fills +8 /s. At 100: banner "ভাইরাল! +৳100", Taka bonus (config), then resets. Purely additive reward; disabled if reduced-motion/“Calm mode” to avoid flashing (see FEATURE_BACKLOG F-12).

## 9. The cartoon pile-on (finisher)

> Naming: this is a **cartoon dust-cloud pile-on**, not a "beating". Never call it "জনতার পিটুনি"/mob-justice in UI, copy, ticket titles or code comments — that phrase refers to a real social problem. Internal names stay `mob*` for brevity; user-facing text uses neutral comic words ("ধুলার মেঘ!", "হইচই!").

### 9.1 Arming & triggers (hpGate applies to **all** triggers)
The pile-on **fires only when ALL hold:** villain HP ≤ `mob.hpGate` (default **30 %**) · crowd mood ≥ **70** · run time ≥ **25 s** · not already fired this run · ≥ 6 eligible NPCs available (`canJoinMob`, not BONKED).
Triggers only decide *when* the next opportunity is taken (data per map in `crowd.mob.trigger`):
1. `bump` — villain collides with a road-layer NPC while armed (the owner's last-moment scenario).
2. `ultimate` — Chappal Storm lands while armed.
3. `setPiece` — a map set-piece **arms** the pile-on; it fires on the next `bump`/`ultimate`, or after 6 s if neither occurs.
4. **Fallback:** armed for ≥ 12 s with no qualifying bump ⇒ a scripted NPC steps into the villain's lane (bump).
5. Debug/test: `window.__game.debug.triggerMob()` (registered by V2-33, test mode only).

### 9.2 Choreography — fixed timeline (t0 = trigger moment; ms)
```
0      bump: bumped NPC falls ("ওই মিয়া, দেইখা চলেন!" = CSV `bmp_bump_01`); scene time dips to 0.6× for 400 ms
150    N sprint in from screen edges/adjacent lanes, N = clamp(8 + round(mood/15), 8, 15)
550    convergence ring → villain hidden by the DUST CLOUD (MobCloud); NPCs vanish into it
550–2000  cloud shakes; ≤ 6 "poke-out" sprites (arm/leg/sandal/star shapes **attached to the cloud, never detached or lying on the ground**); comic words every 250 ms; ≤ 1 voiced mob chorus slot + 1 villain line
          villain HP eases toward a FLOOR OF 1 (never 0 before t0+2600; implemented by a custom damage ramp, not by calling inflictDamage(0))
2100   whistle: HAVILDAR MAMA enters (the mob plays it: `RunScene.playArrestFinale({ withPolice: true })`), crowd scatters, villain pops out dizzy with stars
2400   stamp "থানায় চালান!" (also from `playArrestFinale`)
2600   `useGameStore.inflictDamage(<remaining 1 HP>)` → emits `villain:dead` ONCE (ends the run flow)
3800   GameOver screen (the store's existing 1200 ms `setTimeout` after `villain:dead`)
```
**Single deadline set used by every test/AC/doc:** `crowd:mobStart` at t0 · `crowd:mobEnd` at t0+2100 ± 100 · `villain:dead` at t0+2600 ± 100 · GameOver visible by t0+3800 ± 150.
**Code facts (verified, `RunScene.ts`):** `handleVillainDead` is a *private* handler fired **by** `villain:dead`; it already does 0.25× slow-mo (`scene.time.timeScale` only — **tweens are not slowed**, set `scene.tweens.timeScale` too if the whole scene must slow), the policeman sprite, the stamp (+350 ms), a coin shower and +500 Taka. To avoid spawning policeman/stamp twice, V2-33 **refactors** it into a public `RunScene.playArrestFinale(opts: { withPolice: boolean })` that both the normal path (`villain:dead`, `withPolice: true`) and the pile-on call; the pile-on calls it with `withPolice:false` for the last segment *after* having already shown its own policeman at t0+2100 (or calls with `true` at 2100 and `false` at 2600 — pick one, document in DECISIONS). `RunScene` is therefore in V2-33's TOUCH list (public method + call-ins only).
- Other building blocks verified in `docs/spec/API_FACTS.md §6`: `FxSystem.spawnHitParticles`, `FxSystem.spawnFloatingText`, `FxSystem.triggerCameraShake`, `CharacterRig.triggerHitStun`. Reuse; don't rebuild.

### 9.3 Safety & tone rules (non-negotiable; review rubric criterion 7 auto-fails on violation)
- **No blood/wounds, no weapons beyond chappals and comic props, nothing happens to a downed figure, ≤ 2.6 s, always ends with the police "law" punchline** (pool `policeman`, line `pol_law_01`: "আইন নিজের হাতে নিতে নাই, থানায় চল!").
- **No line, caption or sound may celebrate or encourage hitting a person** (checked in review): mob voices are comic chaos/confusion ("সরেন সরেন! ধুলা উড়ে!"), never "everyone gets a turn".
- NPCs with religious attire/props never join (`canJoinMob:false`); no ethnicity/religion/politics as the joke.
- The villain's "crimes" stay petty and comic. Never target a real, identifiable face without the consent gate (V2-37a, FEATURE_BACKLOG F-01); Friendly mode exports a generic cartoon.
- Calm mode: single "ঠাস!", no shake, no slow-mo, cloud without poke-outs, mob size 8.

## 10. Pooling & performance budget (hard limits; tests enforce)

| Budget | Value |
|---|---|
| Max live NPC actors | **28** (balcony 6 + sidewalk 10 + road 12); mob can temporarily lend sidewalk NPCs to road → still ≤ 28 |
| Max NPC sprites drawn in the mob | 15 (then they vanish into the cloud; cloud + ≤ 6 limb sprites) |
| Per-frame update cost | O(n) over live NPCs; **no per-frame allocations** (pre-sized pools, reused arrays) |
| Atlas | `npc-atlas` pooled pages: ≤ 24 composed walkers (≤ 1024×1024) + one activity page (≤ 1024×1024); ≤ 1 extra draw call per layer batch |
| Spawn rate | ≤ 1 spawn per 350 ms; despawn when off-screen > 200 px |
| Voice | see `VOICE_AND_SFX_SPEC.md §4` (≤ 3 concurrent crowd voices) |
| FPS | ≥ 55 on the reference laptop with 28 NPCs + mob; `game.loop.actualFps` asserted in a perf test with GPU browser |

## 11. Reusable scenario templates (the "ঝামেলা" scripts)

`ScenarioDef` (data in `src/config/scenarios.ts` [NEW]; engine in `src/game/systems/ScenarioRunner.ts` [NEW]):
```ts
type Trigger =
  | { kind: "timer"; everyMs: [number, number] }            // random within range
  | { kind: "zone"; xMin: number; xMax: number }            // when villain enters x-range
  | { kind: "villainHpBelow"; pct: number }
  | { kind: "afterHazard"; hazardId: string }
  | { kind: "afterEvent"; eventId: string };
type Step =
  | { do: "spawn"; npc: string; count: number; layer: NpcLayer; at: "left"|"right"|"ahead"|{x:number} }
  | { do: "say"; who: string; line: string }               // line = id from voice_lines.csv
  | { do: "act"; who: string; activity: string; ms?: number }
  | { do: "move"; who: string; toX: number; speed: number }
  | { do: "wait"; ms: number }
  | { do: "emit"; event: string }                          // must exist in bus.ts or be tagged [NEW EVENT]
  | { do: "startMob" };
interface ScenarioDef { id: string; trigger: Trigger; cooldownMs: number; once?: boolean; maxPerRun?: number; steps: Step[]; }
```
Core templates every map reuses (map files supply NPC ids, lines and positions):

| id | Beat | Steps (abridged) |
|---|---|---|
| `S1_ei_je_ota` | **Pointers:** 3 pro NPCs point and shout as the villain passes | spawn pro×3 ahead → say "bystander_pro" ×3 staggered 200 ms → act point → (30 %) move alongside |
| `S2_kenore_maro` | **Dispute:** pro vs against argue about the beating | spawn pro+against (sidewalk) → say pro "ও চোর!" → wait 600 → say against "প্রমাণ কই?" → wait 600 → say pro "নিজের চোখে দেখছি!" → emit `crowd:dispute` [NEW EVENT] |
| `S3_dhakka_theke_dhola` | **Bump-and-brawl** (the owner's last-moment scenario) | trigger `villainHpBelow 30` + collision → spawn bump NPC → say "ওই মিয়া দেইখা চলেন!" → startMob |
| `S4_reel_photobomb` | A reel-maker steps into frame filming while the chaser lands a combo | spawn neutral(reelDance) → act film → viral meter ×2 for 3 s |
| `S5_adda_cheer` | Tea-stall adda (4 NPCs) cheers; one spills tea | spawn 4 sidewalk → say cheers → spill puddle hazard (slip) |
| `S6_rickshaw_block` | Rickshaw-wala steps into a lane | spawn road NPC+rickshaw → telegraph 700 ms → block 1.2 s |
| `S7_bhul_manush` | **Wrong-person chaos:** crowd points at the *wrong* guy (look-alike) for 1.5 s then realises | spawn look-alike villain-palette NPC → crowd pro points at him → say "আরে এইডা তো না!" |

## 12. Events (bus) — all new, tagged

| Event | Payload | When |
|---|---|---|
| `crowd:react` [NEW EVENT] | `{ stance: "pro"\|"neutral"\|"against"; count: number }` | a reaction wave starts |
| `crowd:dispute` [NEW EVENT] | `void` | S2 completes |
| `crowd:innocentHit` [NEW EVENT] | `{ lane: number }` | chaser bonks a bystander |
| `crowd:mobStart` [NEW EVENT] | `{ count: number }` | pile-on begins |
| `crowd:mobEnd` [NEW EVENT] | `void` | cloud resolves (then existing `villain:dead` fires) |
| `crowd:mood` [NEW EVENT] | `{ mood: number }` | throttled 10 Hz for HUD halo |
Add them to `src/game/bus.ts` `GameEventTypes` exactly (typed). Regenerate `docs/spec/API_FACTS.md` afterwards.

## 13. Test plan (acceptance — the implementer must produce this evidence)

**Unit (Vitest, no Phaser):** state machine legality (forbidden transitions throw), mood math table, mob count formula, scenario runner step ordering with a fake clock, innocent-hit penalty arithmetic, pool never exceeds 28.
**Deterministic e2e (Playwright + `?test=1&seed=1234`):** (1) 60 s run: live NPCs ≤ 28 every sampled frame; (2) force scenario `S3` via `window.__game.debug.triggerMob()` (registered by V2-33) → `crowd:mobStart` count ∈ [8,15] → `villain:dead` at t0+2600±100 ms → GameOver visible by t0+3800±150 ms (fixed-step); (3) hit an NPC via debug → patience drops 10, combo reset; (4) all entities x ∈ [0,1280].
**Visual:** per map, screenshot at t=20 s with seed → ≥ 12 distinct activities visible across 3 seeds; mob frame at t0+1.2 s shows cloud, ≤ 6 limbs, no NPC overlapping HUD. Reviewed with `docs/spec/REVIEW_LOOP.md` rubric.
**Perf:** GPU browser, 28 NPCs + mob → ≥ 55 FPS avg over 10 s; record number in the ticket evidence.
