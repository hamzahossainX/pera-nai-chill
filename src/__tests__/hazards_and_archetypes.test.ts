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
    setX(x: number) { this.x = x; return this; }
    setY(y: number) { this.y = y; return this; }
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

import { Obstacle } from "@/game/entities/Obstacle";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { SpawnSystem } from "@/game/systems/SpawnSystem";
import { CombatSystem } from "@/game/systems/CombatSystem";
import { FxSystem } from "@/game/systems/FxSystem";
import { GapSystem } from "@/game/systems/GapSystem";
import { gameBus } from "@/game/bus";
import { useGameStore } from "@/store/useGameStore";
import { VILLAINS } from "@/config/villains";
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
    text: () => {
      const t = {
        setDepth: () => t,
        setOrigin: () => t,
        setPosition: () => t,
        setText: () => t,
        setColor: () => t,
        destroy: () => {},
      };
      return t;
    },
  };

  return {
    scene: {
      isActive: () => true,
    },
    tweens,
    time,
    textures,
    add,
    cameras: {
      main: {
        shake: () => {},
      },
    },
    physics: {
      pause: () => {},
      resume: () => {},
    },
  } as unknown as Phaser.Scene;
}

describe("Ticket V2-05: Hazards & Archetypes System", () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    mockScene = createMockScene();
    useGameStore.setState({
      screen: "PLAYING",
      villainHp: 1000,
      villainMaxHp: 1000,
      patience: 100,
      chaserSpeedMultiplier: 1.0,
      gap: 560,
      gapZone: "MID",
      isBossStage: false,
      villainId: "phoneSnatcher",
    });
  });

  describe("Obstacle Telegraph & Hazard Properties", () => {
    it("classifies low hazards vs medium/heavy obstacles", () => {
      const obs = new Obstacle(mockScene);

      obs.spawn(1, "pothole", 800);
      expect(obs.isLowHazard()).toBe(true);
      expect(obs.getPatienceCost()).toBe(8);
      expect(obs.getSlowMultiplier()).toBe(0.8);
      expect(obs.getSlowDurationSec()).toBe(1.2);

      obs.spawn(1, "brick", 800);
      expect(obs.isLowHazard()).toBe(true);
      expect(obs.getPatienceCost()).toBe(8);

      obs.spawn(1, "fake-wallet", 800);
      expect(obs.isLowHazard()).toBe(true);
      expect(obs.getPatienceCost()).toBe(8);

      obs.spawn(1, "barricade", 800);
      expect(obs.isLowHazard()).toBe(false);
      expect(obs.getPatienceCost()).toBe(12);
      expect(obs.getSlowMultiplier()).toBe(0.7);
      expect(obs.getSlowDurationSec()).toBe(1.5);

      obs.spawn(1, "shopping-bag", 800);
      expect(obs.isLowHazard()).toBe(false);
      expect(obs.getPatienceCost()).toBe(12);

      obs.spawn(1, "rickshaw", 800);
      expect(obs.isLowHazard()).toBe(false);
      expect(obs.getPatienceCost()).toBe(15);
      expect(obs.getSlowMultiplier()).toBe(0.65);
      expect(obs.getSlowDurationSec()).toBe(1.8);
    });

    it("triggers telegraph warning text only once", () => {
      const obs = new Obstacle(mockScene);
      obs.spawn(1, "pothole", 550);
      expect(obs.hasTelegraphed).toBe(false);

      obs.showTelegraph();
      expect(obs.hasTelegraphed).toBe(true);

      // Calling again should not re-create or error
      obs.showTelegraph();
      expect(obs.hasTelegraphed).toBe(true);
    });
  });

  describe("Hazard Interactions with Jump & Obstacles", () => {
    it("jump counters low hazard without draining patience", () => {
      const chaser = new Chaser(mockScene);
      chaser.rig.x = 200;
      const villain = new Villain(mockScene);
      villain.rig.x = 760;
      const fxSystem = new FxSystem(mockScene);
      const spawnSystem = new SpawnSystem(mockScene, villain, fxSystem, chaser);

      // Spawn low hazard at chaser position
      const obs = spawnSystem.spawnObstacle(1, "pothole", 200);
      expect(obs).toBeDefined();

      // Set chaser jumping
      chaser.isJumping = true;

      // Update spawn system
      spawnSystem.update(1000, 16);

      // Obstacle was cleared
      expect(obs?.isActiveInWorld).toBe(false);
      // Patience remained 100
      expect(useGameStore.getState().patience).toBe(100);
    });

    it("uncountered hazard drains patience and slows chaser", () => {
      const chaser = new Chaser(mockScene);
      chaser.rig.x = 200;
      const villain = new Villain(mockScene);
      villain.rig.x = 760;
      const fxSystem = new FxSystem(mockScene);
      const spawnSystem = new SpawnSystem(mockScene, villain, fxSystem, chaser);

      const obs = spawnSystem.spawnObstacle(1, "barricade", 200);
      chaser.isJumping = false;

      spawnSystem.update(1000, 16);

      // Obstacle collided
      expect(obs?.isActiveInWorld).toBe(false);
      // Barricade costs 12 patience
      expect(useGameStore.getState().patience).toBe(88);
      // Barricade slows chaser to 0.7
      expect(useGameStore.getState().chaserSpeedMultiplier).toBe(0.7);
    });
  });

  describe("Villain Archetype Counter-moves & Defense", () => {
    it("manhole chor starts with shield enabled", () => {
      useGameStore.setState({ villainId: "manholeChor" });
      const villain = new Villain(mockScene);

      expect(villain.hasShield).toBe(true);
    });

    it("villain dodge activates correctly", () => {
      useGameStore.setState({ villainId: "phoneSnatcher" });
      const villain = new Villain(mockScene);

      expect(villain.isDodging).toBe(false);
      villain.dodge();
      expect(villain.isDodging).toBe(true);
    });

    it("executes archetype specific counter move without throwing", () => {
      const archetypes = ["phoneSnatcher", "pickpocket", "cableChor", "manholeChor", "eidMarketChor", "chickenChor", "chorSardar"];
      for (const id of archetypes) {
        useGameStore.setState({ villainId: id });
        const villain = new Villain(mockScene);
        expect(() => villain.executeCounterMove()).not.toThrow();
      }
    });

    it("combat system blocks attack if villain has shield and destroys shield", () => {
      useGameStore.setState({ villainId: "manholeChor", stamina: 100, gap: 150, gapZone: "CLOSE" });
      const chaser = new Chaser(mockScene);
      chaser.rig.x = 200;
      const villain = new Villain(mockScene);
      villain.rig.x = 280;
      const fxSystem = new FxSystem(mockScene);
      const gapSystem = new GapSystem(mockScene, villain, chaser);
      gapSystem.currentGap = 150;
      const combatSystem = new CombatSystem(mockScene, villain, chaser, fxSystem, gapSystem);

      expect(villain.hasShield).toBe(true);
      const hpBefore = useGameStore.getState().villainHp;

      gameBus.emit("weapon:use", { weaponId: "punch", timestamp: Date.now() });

      // Shield absorbed the hit
      expect(villain.hasShield).toBe(false);
      expect(useGameStore.getState().villainHp).toBe(hpBefore);
      combatSystem.destroy();
    });

    it("kick attack breaks obstacle in front and restores patience", () => {
      useGameStore.setState({ villainId: "phoneSnatcher", stamina: 100, patience: 80, gap: 150, gapZone: "CLOSE" });
      const chaser = new Chaser(mockScene);
      chaser.rig.x = 200;
      const villain = new Villain(mockScene);
      villain.rig.x = 350;
      const fxSystem = new FxSystem(mockScene);
      const gapSystem = new GapSystem(mockScene, villain, chaser);
      gapSystem.currentGap = 150;
      const spawnSystem = new SpawnSystem(mockScene, villain, fxSystem, chaser);
      const combatSystem = new CombatSystem(mockScene, villain, chaser, fxSystem, gapSystem, spawnSystem);

      const obs = spawnSystem.spawnObstacle(1, "barricade", 260);
      expect(obs?.isActiveInWorld).toBe(true);

      gameBus.emit("weapon:use", { weaponId: "kick", timestamp: Date.now() });

      expect(obs?.isActiveInWorld).toBe(false);
      // 80 initial + 4 hazard break + 2 close melee hit bonus = 86
      expect(useGameStore.getState().patience).toBe(86);
      combatSystem.destroy();
    });
  });

  describe("Boss HP Scaling & Removal of Hidden Override", () => {
    it("regular villain starts with baseHp", () => {
      useGameStore.setState({ villainId: "phoneSnatcher", isBossStage: false });
      useGameStore.getState().startGame();

      const phoneSnatcher = VILLAINS.find((v) => v.id === "phoneSnatcher");
      expect(useGameStore.getState().villainHp).toBe(phoneSnatcher?.baseHp ?? 1000);
    });

    it("isBossStage = true scales villain baseHp by 1.6x", () => {
      useGameStore.setState({ villainId: "phoneSnatcher", isBossStage: true });
      useGameStore.getState().startGame();

      const phoneSnatcher = VILLAINS.find((v) => v.id === "phoneSnatcher");
      const expectedHp = Math.round((phoneSnatcher?.baseHp ?? 1000) * 1.6);
      expect(useGameStore.getState().villainHp).toBe(expectedHp);
    });

    it("chorSardar automatically gets 1.6x boss multiplier", () => {
      useGameStore.setState({ villainId: "chorSardar", isBossStage: false });
      useGameStore.getState().startGame();

      const sardar = VILLAINS.find((v) => v.id === "chorSardar");
      const expectedHp = Math.round((sardar?.baseHp ?? 1000) * 1.6);
      expect(useGameStore.getState().villainHp).toBe(expectedHp);
    });
  });
});
