import { LAYOUT } from "./layout";

export const BALANCE = {
  // Combat
  INITIAL_VILLAIN_HP: 1000,
  INITIAL_TAKA: 500,
  INITIAL_STAMINA: 100,
  STAMINA_REGEN_PER_SEC: 15,
  MAX_RAGE: 100,
  RAGE_PER_HIT: 8,
  ULTIMATE_RAGE_COST: 100,
  COMBO_TIMEOUT_MS: 2500,

  // World & Camera
  LOGICAL_WIDTH: LAYOUT.CANVAS_WIDTH,
  LOGICAL_HEIGHT: LAYOUT.CANVAS_HEIGHT,
  LANES_Y: LAYOUT.LANES_Y,
  LANE_SCALES: LAYOUT.LANE_SCALES,
  BASE_RUN_SPEED: 320,
  TARGET_FPS: 60,

  // Events
  MIN_EVENT_INTERVAL_SEC: 25,
  MAX_EVENT_INTERVAL_SEC: 45,
} as const;

export function calculateComboMultiplier(combo: number): number {
  if (combo <= 0) return 1.0;
  if (combo < 5) return 1.0;
  if (combo < 10) return 1.25;
  if (combo < 20) return 1.5;
  return 2.0;
}
