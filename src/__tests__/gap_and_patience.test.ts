import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock phaser before entity/system imports so node doesn't evaluate browser Phaser
vi.mock("phaser", () => {
  class MockContainer {
    x = 0;
    y = 0;
    scaleX = 1;
    scaleY = 1;
    depth = 0;
    rotation = 0;
    scene: unknown;
    constructor(scene: unknown, x = 0, y = 0) {
      this.scene = scene;
      this.x = x;
      this.y = y;
    }
    add() { return this; }
    setDepth(d: number) { this.depth = d; return this; }
    setScale(s: number) { this.scaleX = s; this.scaleY = s; return this; }
    setPosition(x: number, y: number) { this.x = x; this.y = y; return this; }
  }

  class MockSprite extends MockContainer {
    setDisplaySize() { return this; }
    setTint() { return this; }
    clearTint() { return this; }
    setVisible() { return this; }
    setTexture() { return this; }
    setOrigin() { return this; }
    setAlpha() { return this; }
    destroy() {}
  }

  return {
    default: {
      GameObjects: {
        Container: MockContainer,
        Sprite: MockSprite,
      },
      Math: {
        Linear: (a: number, b: number, t: number) => a + (b - a) * t,
      },
    },
  };
});

import { GapSystem } from "@/game/systems/GapSystem";
import { Chaser } from "@/game/entities/Chaser";
import { Villain } from "@/game/entities/Villain";
import { useGameStore } from "@/store/useGameStore";
import type Phaser from "phaser";

function createMockScene(): Phaser.Scene {
  const tweens = {
    add: () => ({ remove: () => {} }),
    chain: () => ({}),
  };
  const time = {
    delayedCall: (_delay: number, callback: () => void) => {
      callback();
      return { remove: () => {} };
    },
    now: 0,
  };
  const textures = {
    exists: () => false,
  };
  const add = {
    existing: (obj: unknown) => obj,
    sprite: () => {
      const s = {
        x: 0,
        y: 0,
        depth: 0,
        scaleX: 1,
        scaleY: 1,
        setDepth: () => s,
        setScale: () => s,
        setPosition: () => s,
        setDisplaySize: () => s,
        setTint: () => s,
        clearTint: () => s,
        setVisible: () => s,
        setTexture: () => s,
        setOrigin: () => s,
        setAlpha: () => s,
        destroy: () => {},
      };
      return s;
    },
    container: () => {
      const c = {
        x: 0,
        y: 0,
        add: () => c,
        setDepth: () => c,
        setScale: () => c,
        setPosition: () => c,
        destroy: () => {},
      };
      return c;
    },
  };

  return {
    tweens,
    time,
    textures,
    add,
  } as unknown as Phaser.Scene;
}

describe("GapSystem and Patience Store API (V2-04)", () => {
  beforeEach(() => {
    useGameStore.setState({
      screen: "PLAYING",
      patience: 100,
      chaserSpeedMultiplier: 1.0,
      gap: 560,
      gapZone: "MID",
      failReason: null,
      combo: 5,
    });
  });

  describe("Store API: patience & fail states", () => {
    it("drains patience and clamps to 0", () => {
      useGameStore.getState().drainPatience(40);
      expect(useGameStore.getState().patience).toBe(60);

      useGameStore.getState().drainPatience(80);
      expect(useGameStore.getState().patience).toBe(0);
      expect(useGameStore.getState().screen).toBe("GAME_OVER");
      expect(useGameStore.getState().failReason).toBe("patience_zero");
    });

    it("restores patience up to max 100", () => {
      useGameStore.getState().drainPatience(30);
      expect(useGameStore.getState().patience).toBe(70);

      useGameStore.getState().restorePatience(15);
      expect(useGameStore.getState().patience).toBe(85);

      useGameStore.getState().restorePatience(50);
      expect(useGameStore.getState().patience).toBe(100);
    });

    it("triggers lose with 'escaped' reason", () => {
      useGameStore.getState().triggerLose("escaped");
      expect(useGameStore.getState().screen).toBe("GAME_OVER");
      expect(useGameStore.getState().failReason).toBe("escaped");
    });

    it("modifies and restores chaserSpeedMultiplier via slowChaser", () => {
      vi.useFakeTimers();
      useGameStore.getState().slowChaser(0.75, 1.5);
      expect(useGameStore.getState().chaserSpeedMultiplier).toBe(0.75);

      vi.advanceTimersByTime(1600);
      expect(useGameStore.getState().chaserSpeedMultiplier).toBe(1.0);
      vi.useRealTimers();
    });

    it("resets patience, gap, and failReason on resetRun", () => {
      useGameStore.getState().triggerLose("patience_zero");
      expect(useGameStore.getState().failReason).toBe("patience_zero");

      useGameStore.getState().resetRun();
      expect(useGameStore.getState().screen).toBe("LOBBY");
      expect(useGameStore.getState().patience).toBe(100);
      expect(useGameStore.getState().gap).toBe(560);
      expect(useGameStore.getState().gapZone).toBe("MID");
      expect(useGameStore.getState().failReason).toBeNull();
      expect(useGameStore.getState().chaserSpeedMultiplier).toBe(1.0);
    });
  });

  describe("GapSystem: zones and range checking", () => {
    it("correctly classifies zones (CLOSE, MID, FAR, ESCAPE)", () => {
      const scene = createMockScene();
      const villain = new Villain(scene);
      const chaser = new Chaser(scene);
      const gapSystem = new GapSystem(scene, villain, chaser);

      gapSystem.setGap(180);
      expect(gapSystem.getZone()).toBe("CLOSE");

      gapSystem.setGap(350);
      expect(gapSystem.getZone()).toBe("MID");

      gapSystem.setGap(750);
      expect(gapSystem.getZone()).toBe("FAR");

      gapSystem.setGap(920);
      expect(gapSystem.getZone()).toBe("ESCAPE");
    });

    it("validates melee in range only when gap <= 220 and lane delta <= 1", () => {
      const scene = createMockScene();
      const villain = new Villain(scene);
      const chaser = new Chaser(scene);
      const gapSystem = new GapSystem(scene, villain, chaser);

      // Same lane (1, 1), close gap
      chaser.currentLane = 1;
      villain.currentLane = 1;
      gapSystem.setGap(180);
      expect(gapSystem.isMeleeInRange()).toBe(true);

      // Adjacent lane (0, 1), close gap
      chaser.currentLane = 0;
      villain.currentLane = 1;
      expect(gapSystem.isMeleeInRange()).toBe(true);

      // Non-adjacent lane (0, 2), close gap
      chaser.currentLane = 0;
      villain.currentLane = 2;
      expect(gapSystem.isMeleeInRange()).toBe(false);

      // Same lane (1, 1), but gap is MID (> 220)
      chaser.currentLane = 1;
      villain.currentLane = 1;
      gapSystem.setGap(250);
      expect(gapSystem.isMeleeInRange()).toBe(false);
    });

    it("reduces and widens gap", () => {
      const scene = createMockScene();
      const villain = new Villain(scene);
      const chaser = new Chaser(scene);
      const gapSystem = new GapSystem(scene, villain, chaser);

      gapSystem.setGap(560);
      gapSystem.reduceGap(160);
      expect(gapSystem.getGap()).toBe(400);
      expect(gapSystem.getZone()).toBe("MID");

      gapSystem.widenGap(250);
      expect(gapSystem.getGap()).toBe(650);
      expect(gapSystem.getZone()).toBe("FAR");
    });

    it("triggers lose with 'escaped' when gap >= 900 for 6 seconds", () => {
      const scene = createMockScene();
      const villain = new Villain(scene);
      const chaser = new Chaser(scene);
      const gapSystem = new GapSystem(scene, villain, chaser);

      gapSystem.setGap(920);
      expect(gapSystem.getZone()).toBe("ESCAPE");

      // 5 seconds in ESCAPE zone: still playing
      for (let i = 0; i < 50; i++) {
        gapSystem.update(i * 100, 100);
      }
      expect(useGameStore.getState().screen).toBe("PLAYING");

      // Reach 6.1s in ESCAPE zone: triggers lose
      for (let i = 0; i < 12; i++) {
        gapSystem.update(5000 + i * 100, 100);
      }
      expect(useGameStore.getState().screen).toBe("GAME_OVER");
      expect(useGameStore.getState().failReason).toBe("escaped");
    });

    it("drains patience slowly while in FAR zone (1.5/s)", () => {
      const scene = createMockScene();
      const villain = new Villain(scene);
      const chaser = new Chaser(scene);
      const gapSystem = new GapSystem(scene, villain, chaser);

      gapSystem.setGap(700);
      expect(gapSystem.getZone()).toBe("FAR");
      expect(useGameStore.getState().patience).toBe(100);

      // Simulate 2 seconds in FAR zone
      for (let i = 0; i < 20; i++) {
        gapSystem.update(i * 100, 100);
      }
      // Drained approximately 3 patience (1.5 per second * 2 seconds)
      expect(useGameStore.getState().patience).toBeLessThanOrEqual(97);
    });
  });
});
