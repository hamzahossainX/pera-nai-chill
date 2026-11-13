/**
 * Balance Configuration V2 & Tunables.
 * Ported from simulation models (scripts/balance/sim.mjs) into in-engine configuration.
 * See GDD §7, GDD §9, and ROADMAP V2-40.
 */

export interface MapBalanceConfig {
  id: string;
  difficulty: number; // 1 (beginner) to 3 (hard)
  hazardIntervalSec: number; // Monotonic: higher difficulty -> lower interval (more frequent hazards)
  counterIntervalSec: number;
  innocentRisk: number;
}

export interface AssistLevel {
  level: number; // 0..3
  patienceCostMultiplier: number;
  villainHpMultiplier: number;
}

export const MAP_BALANCE: Record<string, MapBalanceConfig> = {
  mirpur: {
    id: "mirpur",
    difficulty: 1,
    hazardIntervalSec: 7.5, // 7.5s cadence
    counterIntervalSec: 9.0,
    innocentRisk: 1.0,
  },
  farmgate: {
    id: "farmgate",
    difficulty: 2,
    hazardIntervalSec: 5.5, // 5.5s cadence (strictly faster than beginner)
    counterIntervalSec: 7.5,
    innocentRisk: 1.3,
  },
  newmarket: {
    id: "newmarket",
    difficulty: 3,
    hazardIntervalSec: 4.0, // 4.0s cadence (strictly faster than medium)
    counterIntervalSec: 6.5,
    innocentRisk: 1.6,
  },
};

/**
 * Adaptive Assist Ladder (L0 to L3).
 * Adapts to player struggle after successive losses:
 * L0: Standard base difficulty (100% cost, 100% HP)
 * L1: Mild assist (85% cost, 90% HP)
 * L2: Moderate assist (60% cost, 75% HP)
 * L3: Full assist (40% cost, 60% HP)
 */
export const ASSIST_LADDER: AssistLevel[] = [
  { level: 0, patienceCostMultiplier: 1.0, villainHpMultiplier: 1.0 },
  { level: 1, patienceCostMultiplier: 0.85, villainHpMultiplier: 0.9 },
  { level: 2, patienceCostMultiplier: 0.6, villainHpMultiplier: 0.75 },
  { level: 3, patienceCostMultiplier: 0.4, villainHpMultiplier: 0.6 },
];

export function getAssistLevel(losses: number): AssistLevel {
  const clamped = Math.max(0, Math.min(3, losses));
  return ASSIST_LADDER[clamped];
}

export const BALANCE_V2 = {
  // Safehouse run length
  RUN_SEC: 100,
  SAFEHOUSE_DISTANCE_METERS: 1000,

  // Speed and Motion
  BASE_SPEED_PX: 300,
  CHASER_BASE_RATIO: 0.997,
  RAMP_PERCENT: 0.25,

  // Distance zones & ranges
  START_GAP: 380,
  MELEE_RANGE: 220,
  CHAPPAL_RANGE: 560,
  ESCAPE_GAP: 900,
  ESCAPE_SEC: 6,
  HP_SCALE: 1.85,

  // Stamina & Dash
  STAMINA: {
    MAX: 100,
    REGEN_PER_SEC: 15,
  },
  DASH: {
    COOLDOWN_SEC: 2.5,
    STAMINA_COST: 25,
    IMPULSE_PX: 90,
  },

  // Patience & Costs
  PATIENCE: {
    MAX: 100,
    HAZARD_COST: 8,
    FAR_DRAIN_PER_SEC: 0.68,
    CLOSE_REGEN_PER_HIT: 2,
    INNOCENT_COST: 10,
    MISS_COST: 4,
  },

  // Close Range Melee Bonus
  CLOSE_BONUS: 0.25,

  // Finisher Thresholds
  MOB_FINISHER: {
    HP_GATE: 0.3,
    MOOD_GATE: 70,
    MIN_SEC: 25,
    RESOLVE_SEC: 2.6,
  },
};
