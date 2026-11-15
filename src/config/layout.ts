/**
 * Single source of truth for all layout coordinates, lanes, and canvas zones.
 * Bounded to 1280x720 logical canvas per GAME_PLAN_V2 §3.
 */

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const LAYOUT = {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HUD: {
    TOP: 0,
    BOTTOM: 100,
    HEIGHT: 100,
  },
  SKY: {
    TOP: 100,
    BOTTOM: 340,
    HEIGHT: 240,
  },
  SIDEWALK: {
    TOP: 340,
    BOTTOM: 410,
    HEIGHT: 70,
  },
  PLAY_ZONE: {
    TOP: 410,
    BOTTOM: 600,
    HEIGHT: 190,
  },
  FOOT_ZONE: {
    TOP: 600,
    BOTTOM: 720,
    HEIGHT: 120,
  },
  // 3 lanes at y = 450 / 515 / 580, scale 0.88 / 1.0 / 1.12
  LANES_Y: [450, 515, 580] as const,
  LANE_SCALES: [0.88, 1.0, 1.12] as const,
  lanes: [
    { y: 450, scale: 0.88 },
    { y: 515, scale: 1.0 },
    { y: 580, scale: 1.12 },
  ] as const,
  MIN_LANE_FOOT_CLEARANCE: 28,
} as const;

export function getLaneY(laneIndex: number): number {
  const lanes = LAYOUT.LANES_Y;
  const clamped = Math.max(0, Math.min(laneIndex, lanes.length - 1));
  return lanes[clamped];
}

export function getLaneScale(laneIndex: number): number {
  const scales = LAYOUT.LANE_SCALES;
  const clamped = Math.max(0, Math.min(laneIndex, scales.length - 1));
  return scales[clamped];
}

export function getLaneCount(): number {
  return LAYOUT.LANES_Y.length;
}
