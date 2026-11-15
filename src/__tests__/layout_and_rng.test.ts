import { describe, it, expect } from "vitest";
import { LAYOUT, getLaneY, getLaneScale, getLaneCount } from "@/config/layout";
import { SeededRNG } from "@/lib/rng";

describe("V2-01: Layout Configuration", () => {
  it("defines exact lane coordinates and scales per V2 specification", () => {
    expect(LAYOUT.LANES_Y).toEqual([450, 515, 580]);
    expect(LAYOUT.LANE_SCALES).toEqual([0.88, 1.0, 1.12]);
    expect(getLaneCount()).toBe(3);
  });

  it("getLaneY returns correct lane positions and clamps safely", () => {
    expect(getLaneY(0)).toBe(450);
    expect(getLaneY(1)).toBe(515);
    expect(getLaneY(2)).toBe(580);
    expect(getLaneY(-1)).toBe(450);
    expect(getLaneY(5)).toBe(580);
  });

  it("getLaneScale returns correct scales and clamps safely", () => {
    expect(getLaneScale(0)).toBe(0.88);
    expect(getLaneScale(1)).toBe(1.0);
    expect(getLaneScale(2)).toBe(1.12);
    expect(getLaneScale(-1)).toBe(0.88);
    expect(getLaneScale(10)).toBe(1.12);
  });

  it("defines contiguous vertical zones matching GAME_PLAN_V2 §3", () => {
    expect(LAYOUT.HUD.TOP).toBe(0);
    expect(LAYOUT.HUD.BOTTOM).toBe(100);
    expect(LAYOUT.SKY.TOP).toBe(100);
    expect(LAYOUT.SKY.BOTTOM).toBe(340);
    expect(LAYOUT.SIDEWALK.TOP).toBe(340);
    expect(LAYOUT.SIDEWALK.BOTTOM).toBe(410);
    expect(LAYOUT.PLAY_ZONE.TOP).toBe(410);
    expect(LAYOUT.PLAY_ZONE.BOTTOM).toBe(600);
    expect(LAYOUT.FOOT_ZONE.TOP).toBe(600);
    expect(LAYOUT.FOOT_ZONE.BOTTOM).toBe(720);
    expect(LAYOUT.MIN_LANE_FOOT_CLEARANCE).toBe(28);
  });
});

describe("V2-01: Seeded RNG Determinism", () => {
  it("produces identical random sequences for identical seeds", () => {
    const rngA = new SeededRNG("test-seed-42");
    const rngB = new SeededRNG("test-seed-42");

    const seqA = Array.from({ length: 20 }, () => rngA.next());
    const seqB = Array.from({ length: 20 }, () => rngB.next());

    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const rngA = new SeededRNG("seed-alpha");
    const rngB = new SeededRNG("seed-beta");

    const seqA = Array.from({ length: 10 }, () => rngA.next());
    const seqB = Array.from({ length: 10 }, () => rngB.next());

    expect(seqA).not.toEqual(seqB);
  });

  it("next() returns values in [0, 1)", () => {
    const rng = new SeededRNG("bounds-test");
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("chance() respects probability thresholds", () => {
    const rng = new SeededRNG(999);
    expect(rng.chance(0)).toBe(false);
    expect(rng.chance(1)).toBe(true);

    let trueCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (rng.chance(0.3)) trueCount++;
    }
    // 30% chance with 1000 trials should be around 250-350
    expect(trueCount).toBeGreaterThan(200);
    expect(trueCount).toBeLessThan(400);
  });

  it("pick() selects elements from arrays deterministically", () => {
    const items = ["cha", "biriyani", "daab", "chappal", "brick"] as const;
    const rngA = new SeededRNG("pick-seed");
    const rngB = new SeededRNG("pick-seed");

    const picksA = Array.from({ length: 10 }, () => rngA.pick(items));
    const picksB = Array.from({ length: 10 }, () => rngB.pick(items));

    expect(picksA).toEqual(picksB);
    picksA.forEach((item) => expect(items).toContain(item));
  });

  it("range() and between() stay within bounds", () => {
    const rng = new SeededRNG("range-test");
    for (let i = 0; i < 50; i++) {
      const r = rng.range(50, 150);
      expect(r).toBeGreaterThanOrEqual(50);
      expect(r).toBeLessThan(150);

      const b = rng.between(1, 6);
      expect(Number.isInteger(b)).toBe(true);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(6);
    }
  });
});
