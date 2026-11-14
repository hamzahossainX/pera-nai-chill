import { describe, it, expect } from "vitest";
import { EntityMotion } from "@/game/motion/EntityMotion";
import { SeededRNG } from "@/lib/rng";

describe("V2-02: EntityMotion", () => {
  it("keeps x strictly within [60, 1220] across 500 random impulses", () => {
    const motion = new EntityMotion({
      homeX: 880,
      homeY: 515,
      minX: 60,
      maxX: 1220,
    });

    const rng = new SeededRNG("500-impulses");

    for (let i = 0; i < 500; i++) {
      const impulse = rng.range(-150, 150);
      motion.applyImpulse(impulse);

      expect(motion.x).toBeGreaterThanOrEqual(60);
      expect(motion.x).toBeLessThanOrEqual(1220);

      const stepDt = rng.range(10, 50);
      motion.update(stepDt);

      expect(motion.x).toBeGreaterThanOrEqual(60);
      expect(motion.x).toBeLessThanOrEqual(1220);
    }
  });

  it("springs back so |offset| < 1 px within 400 ms after an impulse", () => {
    const motion = new EntityMotion({
      homeX: 880,
      homeY: 515,
      minX: 60,
      maxX: 1220,
    });

    // Test a large positive impulse (e.g. 70 px knockback)
    motion.applyImpulse(70);
    expect(motion.offsetX).toBeCloseTo(70, 0);

    // Simulate 400 ms of game time in typical 16.6ms frame steps
    const totalMs = 400;
    const dt = 1000 / 60;
    let elapsed = 0;
    while (elapsed < totalMs) {
      motion.update(dt);
      elapsed += dt;
    }

    expect(Math.abs(motion.offsetX)).toBeLessThan(1.0);
    expect(Math.abs(motion.x - motion.homeX)).toBeLessThan(1.0);

    // Test a negative impulse (e.g. -50 px dash/pull)
    motion.applyImpulse(-50);
    elapsed = 0;
    while (elapsed < totalMs) {
      motion.update(dt);
      elapsed += dt;
    }

    expect(Math.abs(motion.offsetX)).toBeLessThan(1.0);
    expect(Math.abs(motion.x - motion.homeX)).toBeLessThan(1.0);
  });

  it("handles vault/jump without snapping back when lane changes during jump (fixes C-03)", () => {
    const motion = new EntityMotion({
      homeX: 880,
      homeY: 515, // lane 1
    });

    let completeCalled = false;
    motion.vault(50, 400, () => {
      completeCalled = true;
    });

    // Advance 200 ms (peak of vault)
    for (let t = 0; t < 200; t += 20) {
      motion.update(20);
    }

    // At peak, jumpY should be negative (upwards in screen coords)
    expect(motion.jumpY).toBeLessThan(-30);

    // While in mid-air, AI switches lane to lane 0 (targetLaneY = 450)
    motion.setLaneY(450);

    // Advance remaining 200 ms to land
    for (let t = 0; t < 200; t += 20) {
      motion.update(20);
    }

    expect(completeCalled).toBe(true);
    expect(motion.jumpY).toBe(0);

    // Advance a bit more for lane transition to settle
    for (let t = 0; t < 200; t += 20) {
      motion.update(20);
    }

    // Final position settled on lane 0 (450), never snapped back to 515!
    expect(motion.y).toBeCloseTo(450, 0);
  });
});
