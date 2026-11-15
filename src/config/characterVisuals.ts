/** Logical dimensions are independent of SVG raster resolution (loaded at 2×). */
export const RUNNER_VISUALS = {
  torso: { y: -70, width: 56, height: 64 },
  head: { y: -122, width: 76, height: 76 },
  neck: { y: -97, width: 18, height: 18 },
  shoulder: { x: 22, y: -91 },
  hip: { x: 10, y: -43 },
  upperArm: { width: 18, height: 28 },
  lowerArm: { width: 16, height: 27 },
  elbow: 22,
  hand: { y: 23, width: 18, height: 20 },
  thigh: { width: 20, height: 28 },
  shin: { width: 18, height: 28 },
  knee: 23,
  foot: { y: 24, width: 30, height: 17 },
  phone: { width: 18, height: 28 },
  shadow: { width: 72, height: 18 },
  run: { stride: 0.62, kneeBend: 0.72, armSwing: 0.45, elbowBend: -0.4, bounce: 3, lean: 0.08 },
} as const;
