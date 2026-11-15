import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock phaser before any entity imports so node doesn't evaluate browser Phaser
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

import { BotSource } from "@/game/input/BotSource";
import { KeyboardTouchSource } from "@/game/input/KeyboardTouchSource";
import { InputCommand } from "@/game/input/ControlSource";
import { gameBus } from "@/game/bus";
import { Chaser } from "@/game/entities/Chaser";
import { useGameStore } from "@/store/useGameStore";
import type Phaser from "phaser";

// Helper mock scene for headless unit testing
function createMockScene(): Phaser.Scene {
  const tweens = {
    add: () => ({ remove: () => {} }),
    chain: () => ({}),
  };
  const time = {
    delayedCall: () => {
      return { remove: () => {} };
    },
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
    events: { once: () => {} },
  } as unknown as Phaser.Scene;
}

describe("V2-03: ControlSource & BotSource", () => {
  it("emits commands to registered listeners with enriched timestamp", () => {
    const bot = new BotSource();
    const received: InputCommand[] = [];

    const unbind = bot.onCommand((cmd) => received.push(cmd));

    bot.emit({ type: "LANE_UP" });
    bot.emit({ type: "JUMP" });

    expect(received.length).toBe(2);
    expect(received[0].type).toBe("LANE_UP");
    expect(received[0].timestamp).toBeGreaterThan(0);
    expect(received[1].type).toBe("JUMP");

    unbind();
    bot.emit({ type: "DASH" });
    expect(received.length).toBe(2); // no new commands received
  });

  it("queues commands and releases them according to elapsed delta", () => {
    const bot = new BotSource();
    const received: InputCommand[] = [];
    bot.onCommand((cmd) => received.push(cmd));

    bot.queueCommand(100, { type: "LANE_UP" });
    bot.queueCommand(250, { type: "JUMP" });

    // Step 50ms - nothing should fire yet
    bot.update(50);
    expect(received.length).toBe(0);

    // Step another 60ms (total 110ms) - LANE_UP should fire
    bot.update(60);
    expect(received.length).toBe(1);
    expect(received[0].type).toBe("LANE_UP");

    // Step another 150ms (total 260ms) - JUMP should fire
    bot.update(150);
    expect(received.length).toBe(2);
    expect(received[1].type).toBe("JUMP");
  });

  it("KeyboardTouchSource receives commands emitted over gameBus", () => {
    const kts = new KeyboardTouchSource();
    const received: InputCommand[] = [];
    const unbind = kts.onCommand((cmd) => received.push(cmd));

    gameBus.emit("input:command", { command: { type: "LANE_DOWN" } });
    gameBus.emit("input:command", { command: { type: "DASH" } });

    expect(received.length).toBe(2);
    expect(received[0].type).toBe("LANE_DOWN");
    expect(received[1].type).toBe("DASH");

    unbind();
    kts.destroy();
  });
});

describe("V2-03: Chaser Movement State Machine", () => {
  let chaser: Chaser;
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    useGameStore.setState({ stamina: 100 });
    mockScene = createMockScene();
    chaser = new Chaser(mockScene);
  });

  it("initializes at middle lane (lane 1) and clamps lane changes to [0, 2]", () => {
    expect(chaser.currentLane).toBe(1);

    // Lane up: 1 -> 0
    expect(chaser.laneUp()).toBe(true);
    expect(chaser.currentLane).toBe(0);

    // Lane up at boundary: cannot go above 0
    expect(chaser.laneUp()).toBe(false);
    expect(chaser.currentLane).toBe(0);

    // Lane down: 0 -> 1 -> 2
    expect(chaser.laneDown()).toBe(true);
    expect(chaser.currentLane).toBe(1);
    expect(chaser.laneDown()).toBe(true);
    expect(chaser.currentLane).toBe(2);

    // Lane down at boundary: cannot go below 2
    expect(chaser.laneDown()).toBe(false);
    expect(chaser.currentLane).toBe(2);
  });

  it("enforces jump state without double jumping", () => {
    expect(chaser.isJumping).toBe(false);

    // First jump succeeds
    expect(chaser.jump()).toBe(true);
    expect(chaser.isJumping).toBe(true);

    // Second jump while in mid-air is rejected
    expect(chaser.jump()).toBe(false);

    // Advance motion past jump duration (520ms)
    chaser.rig.motion.update(600);
    expect(chaser.isJumping).toBe(false);

    // Can jump again after landing
    expect(chaser.jump()).toBe(true);
  });

  it("enforces dash stamina cost and cooldown", () => {
    expect(chaser.dashCooldownTimer).toBe(0);
    expect(useGameStore.getState().stamina).toBe(100);

    // Dash succeeds, spends 25 stamina
    expect(chaser.dash()).toBe(true);
    expect(useGameStore.getState().stamina).toBe(75);
    expect(chaser.dashCooldownTimer).toBe(2500);

    // Immediate second dash fails due to cooldown
    expect(chaser.dash()).toBe(false);

    // Step 2000 ms (still 500 ms left on cooldown)
    chaser.update(0, 2000);
    expect(chaser.dashCooldownTimer).toBe(500);
    expect(chaser.dash()).toBe(false);

    // Step remaining 550 ms - cooldown expires
    chaser.update(0, 550);
    expect(chaser.dashCooldownTimer).toBe(0);

    // Can dash again
    expect(chaser.dash()).toBe(true);
    expect(useGameStore.getState().stamina).toBe(50);

    // If stamina drops below 25, dash fails even without cooldown
    useGameStore.setState({ stamina: 10 });
    chaser.dashCooldownTimer = 0;
    expect(chaser.dash()).toBe(false);
  });
});
