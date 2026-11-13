# GDD.md — Pera Nai Chill (Dhaka Rage Runner) · Game Design Document v1

**Date:** 2026-11-13 · **Status:** the single design source of truth. `docs/GAME_PLAN_V2.md` = technical plan under it; `docs/spec/*` = build contracts; `docs/GAME_AUDIT.md` = why we are rebuilding; `docs/PRODUCTION_PLAN.md` = how we ship.
**One-line pitch:** *Chase a petty Dhaka thief through living Bangladeshi streets — dash, dodge, slap, throw your chappal — while the whole street shouts commentary in its own dialect and, at the last second, joins in a cartoon dust-cloud pile-on until Havildar Mama arrives.*

---

## 1. The fun hypothesis (what must be true for people to enjoy this)

| # | Hypothesis | How we will know (test) |
|---|---|---|
| H1 | **The chase has rhythm:** *close the gap → burst of hits → villain panics and sprints → re-close.* A cycle every ~10–15 s feels like "almost got him!" | playtest: players say "just one more try"; bot logs ≥ 3 contact cycles per winning run |
| H2 | **The street is the comedy:** bystanders' reactions, arguments, dialect, and the pile-on get laughs *without* the player reading text | observed smiles/laughs ≥ 2 per run in the first 5-player playtest |
| H3 | **Skill is visible:** a masher loses, a learner wins sometimes, an expert wins almost always — and *knows why* they lost | sim bands (§9) reproduced by the in-engine bot; playtest: players can name the cause of a loss |
| H4 | **Maps feel like places:** each map has its own pace, hazards, sounds, people | 3-second map-identification test (blind screenshots) ≥ 90 % correct |
| H5 | **It's friendly:** funny, never cruel — no one feels targeted or unsafe | review rubric criterion 7 = 5; consent gate; no complaints in playtests |

**Not the goal:** a hardcore skill game, an online game, a pay-to-win game.

## 2. Audience, platforms, session

- **Players:** 12–35, Bangla-first, casual mobile & desktop browsers; plays in short breaks; shares funny moments with friends.
- **Platform:** installable PWA (Next.js + Phaser 4), landscape; touch + keyboard. Offline after first load. No accounts, no server (DEC-003).
- **Session:** one **run = one stage on one map ≈ 60–100 s**; a typical sitting = 3–6 runs (5–10 min). Loop closes with a *stars + replay + next map* screen.
- **Devices (support matrix):** Chrome/Edge/Firefox desktop (latest 2), Android Chrome (mid-range 2021+), iOS Safari 16+. Budget: 55 fps desktop, 45 fps mid Android.

## 3. Game loop (three levels)

**Micro (every second):** read the lane layout → move (lanes/dash/jump) → hit when in range → avoid telegraphed hazards → listen to the street.
**Run (60–100 s):** *approach (0–10 s)* → *first contact (10–25 s)* → *pressure & set-piece (25–60 s)* → *finisher or escape (60–100 s)*. Outcomes: **Caught** (HP 0 or pile-on → police stamp) or **Lost** (patience 0, escaped, safehouse reached).
**Meta (days):** stars per map (★ caught · ★ patience > 50 % · ★ combo target) → unlock next map → cosmetics via Taka → daily challenge → achievements. No stat upgrades (cosmetics only) so skill, not grind, decides outcomes.

## 4. Controls (see GAME_PLAN §2.1)
Lane ▲▼ (W/S, ↑/↓, swipe, buttons) · Dash (Shift / button) · Jump (Space / tap) · Attacks 1–4 (slap, punch, kick, chappal) · Ultimate E · Taunt T. Thumb-zone clusters on touch. First-run coach marks only (§8).

## 5. Systems — rules with numbers (candidate values; source of numbers is `scripts/balance/sim.mjs`)

All tunables live in `src/config/balance.v2.ts` [NEW] (created by V2-40) — **never inline**. Units are abstract px/s from the simulator; in-engine values are scaled once by `BALANCE.LOGICAL_WIDTH`.

### 5.1 The gap (core system)
`gap = villain.x − chaser.x`. Zones: **CLOSE < 220** (melee, +25 % damage) · **MID 220–560** (chappal range) · **FAR > 560** (villain gaining; patience drains) · **ESCAPE > 900 for 6 s** (lose).
- Villain flees at `v0 × (1 + (archetype.speedMultiplier−1)×0.116) × ramp(t)`, `ramp = 1 + 0.247·t/runSec` (speed difference between archetypes is **compressed** so none is trivial or impossible).
- Chaser cruises at ≈ 1.0 × `v0`. **Dash:** +61 % speed for 0.45 s, 25 stamina, 2.5 s cooldown.
- **Villain surge:** after being hit, 47 % chance to sprint ×1.25 for 1.6 s → forces the re-approach cycle (H1).
- **Catch-up adrenaline (assist):** if FAR for > 2.6 s, chaser gets +26 % speed until MID — protects new players from "he's gone" frustration.

### 5.2 Patience (the player's "HP", Bangla "ধৈর্য")
100 max. −7.5 per unavoided hazard/counter-move; −0.7/s while FAR; −10 per innocent hit; +1/s while CLOSE. 0 → "হাল ছেড়ে দিলাম" (lose). Shown as a sweat-drop bar.

### 5.3 Combat
| Weapon | Damage | Cooldown | Stamina | Range |
|---|---|---|---|---|
| Slap | 15 | 0.3 s | 6 | melee |
| Punch | 30 | 0.5 s | 10 | melee |
| Kick | 55 | 0.8 s | 16 | melee |
| Chappal | 85 (variants 105–130) | 1.2 s | 18 | MID, same lane ±1 |
| Ultimate (rage 100) | 350 | 15 s | — | screen |
Combo multiplier ×1.0/1.25/1.5/2.0 at 0/5/10/20 hits (existing `calculateComboMultiplier`). Stamina 100, regen 15/s. Villain effective HP = archetype `baseHp × 1.93` (boss × 0.74 extra) — the lobby bar shows base values, the engine applies `hpScale`.
**Dodge:** each attack is negated with `archetype.dodgeRate` (10–45 %), telegraphed by a 150 ms wiggle.

### 5.4 Hazards & villain counter-moves
Every hazard: **telegraph ≥ 700 ms → counter (jump/lane/kick) → cost (patience −7.5, slow ×0.6 for 1 s, combo reset)**. Per-map cadence `hazardEvery` seconds (see §9 caveat: must be **monotonic with difficulty**: beginner ≥ 7, medium ≈ 5, hard ≈ 3.5–4.5). Each archetype has one counter-move (GAME_PLAN §4.3).

### 5.5 Crowd, mood, innocents, pile-on
Per `docs/spec/CROWD_AND_NPC_SPEC.md`: mood 0–100 (base 55); +3/hit witnessed, −15/innocent; **pile-on arms at villain HP ≤ 30 % & mood ≥ 70 & run ≥ 25 s** (all triggers obey this gate — spec v1.1), then 2.6 s cartoon cloud → Havildar Mama → stamp. Three innocent hits → mini-mob charges *you*.

### 5.6 World events
Existing engine (`events.json`): loadshedding, smog, strike, waterlogging — each must now alter the *chase* (e.g. blackout hides villain except glowing eyes AND +8 % villain speed; strike narrows to 2 lanes; flood −25 % speeds), not just visuals.

## 6. Onboarding — the first 90 seconds (FTUE) — "Tutorial run on Mirpur"
The very first run is scripted and **cannot be lost** (assist L3 + longer telegraphs), teaching one verb per beat with a **coach mark** (≤ 6 words, Bangla first, auto-dismiss on success):
1. 0–6 s: "↑↓ লেন বদলাও" — a harmless obstacle in the lane, success = dodge.
2. 6–14 s: "ড্যাশ দাও!" — villain is FAR; success = enter MID.
3. 14–24 s: "চপ্পল ছোড়ো!" — MID range; success = first hit; street cheers (first taste of crowd).
4. 24–40 s: "কাছে এসো — ঠাস!" — villain surges back then slows; CLOSE melee combo ×3.
5. 40–60 s: first **innocent** NPC crosses with `!` telegraph — teaches "don't hit wrong people"; hitting it is allowed (comedic "ভুল মানুষ!" sorry-gag), no penalty in the tutorial.
6. 60–80 s: guaranteed pile-on finale → police stamp → stars → "পরের ম্যাপ খুলেছে!".
Then **adaptive assist** takes over: after each loss on a map, assist level +1 (max L3: patience cost ×0.25, villain HP ×0.55); after a win it drops one level. Assist is **never shown as a number**; after 3 losses a friendly toast offers "সহজ মোড চালু করব?" (opt-in persists).

## 7. Difficulty curve & pacing
- Map difficulty 1→5 across the 8 maps (GAME_PLAN §5.2 + MAP_SCENARIOS): hazard cadence tightens, counter-moves faster, density of innocents rises, boss stage on the last map of each region.
- Within a run: ramp +25 %, set-piece at ~35–50 % of the distance bar, finisher window opens at HP ≤ 30 %.
- Target **win rates** (skill model → band): masher **0 %** · novice 15–30 % (without assist) / **35–50 % with assist** · average 65–85 % (beginner/medium), 25–45 % (hard) · expert ≥ 95 % (beginner/medium), 70–85 % (hard). Winning-run duration for average players **50–90 s**.

## 8. Feel ("juice") checklist — what makes each action satisfying
Hit-stop 60–80 ms · squash/stretch · comic word + damage number pop · crowd gasp/cheer on big hits · camera shake scaled by damage · dash dust & speed lines · combo ladder with Bangla names (existing `COMBO_NAMES`) · slow-mo finisher (existing) · every NPC reaction has an audio sting · UI never moves the lanes. **Calm mode** removes shake/flash/slow-mo and halves crowd density.

## 9. Balance evidence (simulation, 2026-11-13) — **a model, not truth**
`node scripts/balance/sim.mjs` (Monte-Carlo, 4000 runs/cell, seeded) with candidate numbers above:

| Archetype / map | masher | novice | average | expert |
|---|---|---|---|---|
| Phone Snatcher · beginner | **0 %** | 2 % | **82 %** | 98 % |
| Cable Chor · medium | 0 % | 0 % | 77 % | 100 % |
| Manhole Chor · medium | 0 % | 0 % | 65 % | 100 % |
| Chor-er Sardar (boss) · hard | 0 % | 0 % | **21 %** | 81 % |
Adaptive assist ladder on Phone Snatcher (`node scripts/balance/assist.mjs`): novice **2 → 3 → 12 → 40 %** for L0→L3; masher stays **0 %**.
**What this proves:** (a) button-mashing alone cannot win — the intended design (V2-04 AC); (b) the gap/patience/surge model produces a skill gradient; (c) *assist is necessary* — without it a new player almost never wins, so the FTUE and adaptive ladder are not optional.
**What it does not prove (known caveats, V2-40 must fix):** novice win-rate at L0 is too low (target 15–30 %) and boss/average too low (21 % vs ~38 %); hazard cadence came out non-monotonic (medium 3.6 s < hard 5.3 s) because the tuner lacked a monotonicity constraint; skill models are guesses. **Real human playtests (PRODUCTION_PLAN §6) override these numbers.** V2-40 ports the model into an in-engine bot (`?test=1`) so the same bands are asserted against the real game.

## 10. Audio direction
Three voice tiers (clip → TTS → babble) on a separate voice bus; synth SFX + per-map sound beds; BGM ducking with ref-counted `duck/release`; slap/chappal/bonk impact set; cricket-commentary announcer (rate-limited). **Dialects** per map via native-authored lines (LOCALIZATION_AND_DIALECTS). Sourcing & rights: AUDIO_SOURCING.

## 11. Content plan (launch = 8 maps · 7 villains + boss · ~124 std voice lines + dialect packs)
Maps M1–M8 (MAP_SCENARIOS) · villain archetypes (7, with counter-moves) · NPC kit (5 bodies × 8 outfits × 10 props, 19 activities) · 8 scenario templates (S1–S8) · 4 world events × per-map weights · 12 achievements + crowd achievements · shop: chaser outfits, chappals, villain skins. Phase 2 (post-launch): 5 more dialect regions + maps (LOCALIZATION §2), seasonal skins. **V3 (parked, owner-requested): Hunt Mode multiplayer** — 2 hunters vs 1 human target with a selectable timer (`docs/spec/MULTIPLAYER_V3.md`).

## 12. UX flows & screens
Splash/Load → **Home** → **Setup stepper** (Face & Villain → Map carousel → Loadout; consent gate on first photo) → Run (HUD) → Pause → **Result** (stars, replay, next map). Settings (voice mode/volume, dialect mode/subtitles, Calm mode, language, quality). Details: GAME_PLAN §7, DESIGN.md. **No scroll traps; one primary action per screen.**

## 13. Accessibility & safety
Calm mode; subtitle size; voice off still fully playable (text bubbles always); colour-independent meters; keyboard path everywhere; ≥ 48 px targets; reduced-motion respected. **Safety:** slapstick-only, no gore, pile-on capped at 2.6 s and ending with the police "law" punchline, consent gate + Friendly mode for faces, no dialect mockery, no real brands/people, PG voice lines.

## 14. Telemetry & privacy
None leaves the device. Local-only counters (runs, stars, last map) in versioned `localStorage`. Playtest data is collected manually (observation sheets, optional screen recordings with consent) — see PRODUCTION_PLAN §6.

## 15. Quality bar ("what production-ready means" here)
Gates green (tsc, lint, unit, e2e on GPU Chrome) · fps budgets met · playtest bands hit (§7) · rubric ≥ 8/10 on every screen/map/character · no S0/S1 open · ledger complete (assets & consent) · release checklist (PRODUCTION_PLAN §8) signed.

## 16. Open design questions (owner)
Q1 Stage-based runs with stars (default) vs endless mode as a bonus? · Q2 Do you want an "endless Taka-farm" mode post-launch? · Q3 Is a boss at the end of every region too hard for casual players (assist applies)? · Q4 Which dialect leads can you recruit first? Answers go to `CLIENT_QUESTIONS.md`.
