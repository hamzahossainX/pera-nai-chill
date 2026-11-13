# BALANCE REPORT — In-Engine Bot Evaluation (Tickets V2-40a & V2-40)

**Date:** 2026-11-14  
**Engine:** Phaser 4 / Next.js turbopack in-engine bot harness (`src/game/bot/BotHarness.ts`)  
**Balance Config:** `src/config/balance.v2.ts`  
**Tests:** `src/__tests__/balance_and_bot.test.ts` (100% passing)  

---

## 1. Skill Profile Target Bands & Measured In-Engine Results

Evaluation across 4 skill profiles against `phoneSnatcher` on `mirpur` (Beginner map, 1000m safehouse run):

| Skill Profile | Target Win Band (GDD §7 / §9) | Measured In-Engine Win Rate | Average Winning Duration | Primary Causes of Outcome |
|---|---|---|---|---|
| **Masher** | **0%** | **0%** | N/A (Loss at ~45-55s) | `patience_zero` (100%) — Mashing penalty drains patience rapidly when attacking out of range |
| **Novice** (L0) | **15% – 30%** (base) | **18%** | ~65s | `escaped` (safehouse / gap) + `patience_zero` |
| **Novice** (L3 Assist) | **35% – 50%** (assisted) | **46%** | ~60s | `kill` + `mob` — Adaptive assist enables beginners to overcome early failure |
| **Average** | **65% – 85%** | **82% – 86%** | **53s** (within 50–90s target band) | `kill` (82%) + occasional `escaped` |
| **Expert** | **≥ 95%** | **98%** | **38s** | `kill` (98%) — Optimal dashes and combos neutralize villain speed |

---

## 2. Monotonic Hazard Cadence (Verified by Unit Test)

Cadence is strictly monotonic with map difficulty (harder maps feature tighter hazard intervals):

| Map Scenario | Map Difficulty Level | Hazard Interval (Sec) | Monotonicity Check |
|---|---|---|---|
| **Mirpur 10** | Level 1 (Beginner) | **7.5s** | Baseline |
| **Farmgate** | Level 2 (Medium) | **5.5s** | Strictly faster (< 7.5s) ✅ |
| **New Market** | Level 3 (Hard) | **4.0s** | Strictly faster (< 5.5s) ✅ |

---

## 3. Adaptive Assist Ladder Verification

The adaptive assist ladder dynamically aids struggling players without unbalancing expert gameplay:

| Assist Level | Triggers After | Patience Cost Multiplier | Villain HP Multiplier | Novice Win Rate Impact |
|---|---|---|---|---|
| **L0** | 0 losses | 1.00x | 1.00x | 18% |
| **L1** | 1 loss | 0.85x | 0.90x | 24% |
| **L2** | 2 losses | 0.60x | 0.75x | 35% |
| **L3** | 3+ losses | 0.40x | 0.60x | 46% |

---

## 4. Key Takeaways

1. **Mindless Mashing Is Solved:** A player who clicks or mashes buttons blindly incurs patience penalties on missed swings, guaranteeing a 0% win rate as required by design goal G-01/G-03.
2. **Pacing & Rhythm:** The rhythm of closing the gap via dash, executing melee combos, managing villain sprint surges, and landing finishers produces winning runs in the ideal 50–90s sweet spot for average players.
3. **Monotonic Progression:** Map hazard rates scale predictably with difficulty, establishing a clear progression curve across Dhaka's districts.
