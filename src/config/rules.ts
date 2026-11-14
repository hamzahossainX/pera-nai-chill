/**
 * RunRules - Stage rules & V3 forward-compatible game mode configuration.
 * See GAME_PLAN_V2 §2.6, MULTIPLAYER_V3 §8, and ROADMAP V2-06.
 */

export type RunMode = "stage" | "timeAttack" | "hunt";

export interface RunRules {
  /**
   * Mode of the run:
   * - "stage": Standard single-player map chase with distance goal to safehouse
   * - "timeAttack": Single-player survival/speed trial with countdown
   * - "hunt": V3 parked asymmetric multi-player mode
   */
  mode: RunMode;

  /**
   * Time limit in seconds.
   * Forward-compatible constraint: "stage" mode MUST have timeLimitSec: null.
   */
  timeLimitSec: number | null;

  /**
   * Number of lives for the run.
   */
  lives: number;

  /**
   * Win condition string.
   */
  winCondition: "catch_villain" | "survive_timer" | "custom";
}

export const DEFAULT_STAGE_RULES: RunRules = {
  mode: "stage",
  timeLimitSec: null, // stage mode has null time limit per V3 forward-compat AC
  lives: 1,
  winCondition: "catch_villain",
};

export const STAGE_CONFIG = {
  /**
   * Total stage distance in meters before villain reaches safe house (approx 90-120s of run).
   */
  TARGET_DISTANCE_METERS: 1000,

  /**
   * Logical speed scale to meters: speed (pixels/sec) * dt (sec) * METERS_PER_PIXEL
   */
  METERS_PER_PIXEL: 0.035,

  /**
   * Target combo required for the 3rd star on completion.
   */
  COMBO_STAR_TARGET: 10,
};

export interface StarResult {
  stars: number; // 0..3
  caughtVillain: boolean;
  patienceOverHalf: boolean;
  comboTargetReached: boolean;
}

/**
 * Calculates 1-3 stars according to GAME_PLAN_V2 §2.6:
 * ★ 1 star: Caught the villain (villainHp === 0)
 * ★ 2 stars: Patience > 50% remaining at end
 * ★ 3 stars: Best combo >= map target (default 10)
 */
export function calculateStars(params: {
  isWin: boolean;
  patienceRemaining: number;
  bestCombo: number;
  comboTarget?: number;
}): StarResult {
  if (!params.isWin) {
    return {
      stars: 0,
      caughtVillain: false,
      patienceOverHalf: false,
      comboTargetReached: false,
    };
  }

  const caughtVillain = true;
  const patienceOverHalf = params.patienceRemaining > 50;
  const target = params.comboTarget ?? STAGE_CONFIG.COMBO_STAR_TARGET;
  const comboTargetReached = params.bestCombo >= target;

  let stars = 1;
  if (patienceOverHalf) stars += 1;
  if (comboTargetReached) stars += 1;

  return {
    stars,
    caughtVillain,
    patienceOverHalf,
    comboTargetReached,
  };
}
