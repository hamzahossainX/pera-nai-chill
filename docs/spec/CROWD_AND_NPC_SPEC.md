# CROWD_AND_NPC_SPEC.md — A living street (bystanders, reactions, the pile-on)

**Status:** SPEC v1 (2026-11-13) · **Implements owner brief:** people are always around; they notice the chase, point, shout, argue about it, sometimes join; at a dramatic moment a bump turns into a 10–15 person cartoon pile-on; meanwhile others sing, play guitar, sip tea, jog, stroll — every map is a *scene full of tiny stories*.
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
- **Kit-bash**, not full rigs: `body (5) × outfit/palette (8) × headgear/prop (≈10)` composited **once at load** into a small atlas (`npc-atlas`) → ≥ 120 distinct-looking people from ~60 SVG parts. Walk = 4-frame sprite loop + procedural bob; activity poses = 2–4 frame loops.
- Heights: sidewalk 110–130 px, road at lane scale (~190 px at 1.0, same as main characters), balcony 70–90 px. Faces: simple, no uploaded faces on NPCs (privacy + clarity).
- Silhouette-distinct from chaser/villain (never green polo / dark hoodie).
- Diversity: ages, genders, attire (lungi/panjabi/saree/school uniform/hijab/gamchha/suit/helmet) represented respectfully; no ethnic/religious caricature; no real-brand logos.

### 3.3 Runtime state machine (per NPC) — **only these states exist**
```
AMBIENT ──(chase seen: villain within 520 px & NPC in view)──▶ NOTICE (350–600 ms, "!" mark, head turn)
NOTICE ──▶ REACT (by stance, see §5)
REACT:pro      ──▶ POINT_SHOUT ──▶ (30%) JOIN_CHASE (run alongside ≤ 3 s) ──▶ AMBIENT
REACT:neutral  ──▶ FILM (phone up, "ভাইরাল!") ──▶ AMBIENT
REACT:against  ──▶ MEDIATE (hands up, "থামেন ভাই!") ──▶ (25%) STEP_BLOCK (steps into lane, road layer only, 1.2 s) ──▶ AMBIENT
any ──(mob trigger)──▶ PILE_ON ──▶ DISPERSE ──▶ removed (pooled)
any ──(hit by chaser/villain)──▶ BONKED (falls, stars, 0.8 s) ──▶ GETUP ──▶ AMBIENT   (chaser hit ⇒ innocent penalty §6)
```
Forbidden transitions (tests assert): `PILE_ON → REACT`, `BONKED → PILE_ON`, any state → itself without cooldown.

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

Trigger: the **chase is visible** when `villain.x ∈ [80, 1200]` and the NPC is within the viewport. Each NPC reacts at most once per 8 s (`reactCooldownMs`). Reaction chosen by `stance`, with stance seeded per NPC by **crowd mood** (§7).

| Stance | Gesture | Voice pool (see `docs/spec/voice/voice_lines.csv`) | Gameplay effect |
|---|---|---|---|
| **pro** | points at villain, cups mouth | `bystander_pro` ("ওই যে! ধর ধর!") | +mood; 30 %: runs alongside 3 s (visual only) ; 10 %: **helps**: shouts lane tip → highlights villain's lane for 1 s |
| **neutral** | holds phone up filming | `bystander_phone` ("ভাইরাল হইবে!") | adds to **Viral meter** (§8) while chaser is mid-combo |
| **against** | palms out, steps toward road | `bystander_mediator` ("ঠান্ডা হন ভাই!") | 25 %: steps into lane for 1.2 s as a *telegraphed soft-block* (patience −4 if collided, no HP loss) |

**"Why are they beating him?"** — the owner's "ওকে কেন মাইর দিতাছে ওরা" beat: a **dispute scenario** (S2 in §11): a `pro` NPC and an `against` NPC stop and argue about it for 2.5 s with alternating bubbles; if the chaser passes during the argument, the `against` NPC gets +1 "mediator" mark which later increases the chance the crowd *doesn't* join the mob unless the player lands a visible big combo (so a fair, readable reason).

## 6. Fair-play rule — the innocent bystander

- If a **projectile** or **melee** from the chaser overlaps a road-layer NPC that is not the villain (`npc.state != PILE_ON`), the NPC is `BONKED`: comic word ("ভুল মানুষ!"), stars, chaser **patience −10** and **speed −15 % for 1.0 s**, combo resets, crowd mood −15.
- Telegraph: NPCs about to cross a lane show a ground shadow + `!` 500 ms before entering (same telegraph rule as hazards, GAME_PLAN §2.4).
- Hitting 3 innocents in one run → the **crowd turns on the chaser**: a 6-NPC mini-mob runs at the chaser for 2.5 s (chaser must dash/jump out or lose 15 patience). This is the owner's "মানুষ আসছে, ঝামেলা করবে" beat and creates real stakes.

## 7. Crowd mood meter (0–100, hidden from UI except as a subtle HUD icon halo)

- Starts at `map.crowd.baseMood` (default 55).
- +3 per landed hit on the villain *in view of ≥ 2 NPCs*; +6 per combo tier; +10 on a witnessed trip/slip.
- −15 per innocent hit; −5 per hit on the villain while ≥ 2 `against` NPCs are watching; decays toward base at 2 pts/s.
- Mood bands: `<30` crowd mostly **against** (mob chance 0; hecklers: "বেচারারে মারছো কেন?"), `30–70` mixed, `>70` mostly **pro** (mob eligible).
- Stored in a plain class field in `CrowdSystem` [NEW]; exposed read-only to the store as `crowdMood` [NEW] throttled at 10 Hz (same pattern as other store sync — DEC-004).

## 8. Viral meter (bonus layer, small)

While the chaser is performing a combo ≥ 3 and ≥ 1 neutral NPC is filming, `viral` fills +8 /s. At 100: banner "ভাইরাল! +৳100", Taka bonus (config), then resets. Purely additive reward; disabled if reduced-motion/“Calm mode” to avoid flashing (see FEATURE_BACKLOG F-12).

## 9. The pile-on (জনতার পিটুনি — cartoon mob finisher)

### 9.1 Triggers (any one; all data-driven per map in `crowd.mobTriggers`)
1. **Bump-and-brawl (owner's scenario):** villain HP ≤ `mob.hpGate` (default 30 %) AND villain collides with a road-layer NPC → NPC falls ("ওই মিয়া দেইখা চলো!"). `mood > 70`.
2. **Ultimate cue:** Chappal Storm landed while ≥ 6 NPCs on screen and mood > 60.
3. **Map set-piece:** scripted per map (e.g. Chawkbazar iftar siren).
4. **Debug/test:** `window.__game.debug.triggerMob()` under `?test=1`.
Never before 25 s of run time; never twice per run.

### 9.2 Choreography (total 2.6 s, fixed timeline; times in ms from `t0`)
```
0     bump: bumped NPC falls, bubble "ওই মিয়া, দেইখা চলেন!"; world slows to 0.6× for 400 ms
150   8–15 NPCs sprint in from both screen edges and from adjacent lanes (count = clamp(8 + round(mood/15), 8, 15))
550   convergence: villain disappears into a CARTOON FIGHT CLOUD (dust ball) at his position; NPCs freeze in a ring then vanish into the cloud
550–2100  cloud shakes; limbs/stars/chappals/flip-flops/ sandals pop out (≤ 6 sprites at once); comic words "ঠাস! ধুম! ধপাস!" every 250 ms; crowd voices layer (≤ 3 voiced)
          villain HP drains to 0 along an ease-out; chaser may still tap attack (adds +combo points, no extra damage)
2100  a whistle: HAVILDAR MAMA enters with the siren; crowd scatters, villain pops out dizzy with stars
2400  stamp "থানায় চালান!" (existing `fx-police-stamp` handles this today)
2600  state → villain:dead flow (existing `villain:dead` event + GameOver)
```
- Existing building blocks (verified in `docs/spec/API_FACTS.md`): `FxSystem.spawnHitParticles`, `FxSystem.spawnFloatingText`, `FxSystem.triggerCameraShake`, `RunScene.handleVillainDead` (stamp, policeman, coin shower). **Reuse** them; the mob adds only the NPC sprint-in, the fight cloud, and the voice layer.
- The villain's rig must remain visible *before* the cloud covers it and show the cartoon reactions (existing `triggerArchetypeHitReaction`).

### 9.3 Safety & tone rules (non-negotiable, tested by review checklist)
- **No blood, wounds, weapons other than chappals/comic props; no impact on a downed figure; ≤ 2.6 s; always ends with the police/“law” punchline** (pool `policeman`, line `pol_law_01`: "আইন নিজের হাতে নিতে নাই, থানায় চল!"). The joke is the *excess* of the crowd and the cop's deadpan — not realistic violence.
- Villain's "crimes" stay petty/comic (bKash blocked, no-change tea, etc.). Never target a real, identifiable person's face without the consent gate (GAME_PLAN §12 D10, FEATURE_BACKLOG F-01).
- NPCs are generic cartoon people; never use religion, ethnicity or political affiliation as the butt of the joke.

## 10. Pooling & performance budget (hard limits; tests enforce)

| Budget | Value |
|---|---|
| Max live NPC actors | **28** (balcony 6 + sidewalk 10 + road 12); mob can temporarily lend sidewalk NPCs to road → still ≤ 28 |
| Max NPC sprites drawn in the mob | 15 (then they vanish into the cloud; cloud + ≤ 6 limb sprites) |
| Per-frame update cost | O(n) over live NPCs; **no per-frame allocations** (pre-sized pools, reused arrays) |
| Atlas | one `npc-atlas` texture ≤ 1024×1024; ≤ 1 extra draw call for NPCs when batched by layer |
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
**Deterministic e2e (Playwright + `?test=1&seed=1234`):** (1) 60 s run: live NPCs ≤ 28 every sampled frame; (2) force scenario `S3` via `window.__game.debug` → `crowd:mobStart` count ∈ [8,15] → within 3 s `villain:dead` fires → GameOver visible; (3) hit an NPC via debug → patience drops 10, combo reset; (4) all entities x ∈ [0,1280].
**Visual:** per map, screenshot at t=20 s with seed → ≥ 12 distinct activities visible across 3 seeds; mob frame at t0+1.2 s shows cloud, ≤ 6 limbs, no NPC overlapping HUD. Reviewed with `docs/spec/REVIEW_LOOP.md` rubric.
**Perf:** GPU browser, 28 NPCs + mob → ≥ 55 FPS avg over 10 s; record number in the ticket evidence.
