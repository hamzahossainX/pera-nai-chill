import { describe, it, expect, beforeEach } from "vitest";
import { DifficultySystem } from "@/game/systems/DifficultySystem";
import { BALANCE } from "@/config/balance";
import { VILLAINS } from "@/config/villains";

describe("T12: Difficulty Ramp & Villain Variants", () => {
  let difficulty: DifficultySystem;

  beforeEach(() => {
    difficulty = new DifficultySystem();
  });

  it("starts at baseline run speed", () => {
    expect(difficulty.getCurrentSpeed()).toBe(BALANCE.BASE_RUN_SPEED);
    expect(difficulty.getDifficultyMultiplier()).toBe(1.0);
  });

  it("ramps speed measurably over 120 seconds", () => {
    // Advance 60 seconds (halfway through ramp)
    difficulty.update(0, 60000);
    const speedAt60 = difficulty.getCurrentSpeed();
    expect(speedAt60).toBeGreaterThan(BALANCE.BASE_RUN_SPEED);
    expect(speedAt60).toBeCloseTo(BALANCE.BASE_RUN_SPEED + 80, 1);

    // Advance to 120 seconds (full ramp)
    difficulty.update(0, 60000);
    const speedAt120 = difficulty.getCurrentSpeed();
    expect(speedAt120).toBe(BALANCE.BASE_RUN_SPEED + 160); // 480 px/s
    expect(difficulty.getDifficultyMultiplier()).toBe(1.5);
  });

  it("caps speed at max ramp after 120 seconds", () => {
    // Advance 300 seconds (5 minutes)
    difficulty.update(0, 300000);
    expect(difficulty.getCurrentSpeed()).toBe(BALANCE.BASE_RUN_SPEED + 160);
  });

  it("includes all 4 distinct villains with different stats and colors", () => {
    expect(VILLAINS.length).toBe(4);

    const ids = VILLAINS.map((v) => v.id);
    expect(ids).toContain("corrupt-politician");
    expect(ids).toContain("traffic-cop");
    expect(ids).toContain("syndicate-boss");
    expect(ids).toContain("slacker-babu");

    // Check each villain has unique colors and HP
    const baseHps = VILLAINS.map((v) => v.baseHp);
    const uniqueHps = new Set(baseHps);
    expect(uniqueHps.size).toBe(4);
  });
});
