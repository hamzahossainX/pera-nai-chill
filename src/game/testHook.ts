import type Phaser from "phaser";
import { useGameStore } from "@/store/useGameStore";
import type { RunScene } from "@/game/scenes/RunScene";
import { gameBus } from "@/game/bus";

export interface GameStateSnapshot {
  fps: number | null;
  time: number | null;
  hp: number | null;
  maxHp: number | null;
  combo: number | null;
  villain: { x: number; y: number; lane: number } | null;
  chaser: { x: number; y: number; lane: number } | null;
  gap: number | null;
  patience: number | null;
  npcCount: number | null;
  crowdMood: string | number | null;
}

export interface GameTestHook {
  seed: string;
  step(ms: number, stepDt?: number): void;
  getState(): GameStateSnapshot;
  registerState(name: string, fn: () => unknown): void;
  debug: {
    register(name: string, fn: (...args: unknown[]) => unknown): void;
    call(name: string, ...args: unknown[]): unknown;
    list(): string[];
  };
}

declare global {
  interface Window {
    __game?: GameTestHook;
  }
}

export function installTestHook(game: Phaser.Game, seed: string): GameTestHook {
  const stateProviders = new Map<string, () => unknown>();
  const debugRegistry = new Map<string, (...args: unknown[]) => unknown>();
  let simulatedTime = performance.now();

  const hook: GameTestHook = {
    seed,

    step(ms: number, stepDt: number = 33.33) {
      const dt = Math.max(16.666, Math.min(stepDt, 33.33));
      const steps = Math.max(1, Math.round(ms / dt));
      for (let i = 0; i < steps; i++) {
        simulatedTime += dt;
        game.step(simulatedTime, dt);
      }
    },

    getState(): GameStateSnapshot {
      let runScene: RunScene | null = null;
      try {
        runScene = game.scene.getScene("RunScene") as RunScene | null;
      } catch {
        runScene = null;
      }

      const store = useGameStore.getState();

      const fps = game.loop ? Math.round(game.loop.actualFps) : null;
      const time = runScene ? runScene.time.now : (typeof game.getTime === "function" ? game.getTime() : null);

      const villain =
        runScene && runScene.villain && runScene.villain.rig
          ? {
              x: Math.round(runScene.villain.rig.x),
              y: Math.round(runScene.villain.rig.y),
              lane: runScene.villain.currentLane,
            }
          : null;

      const chaser =
        runScene && runScene.chaser && runScene.chaser.rig
          ? {
              x: Math.round(runScene.chaser.rig.x),
              y: Math.round(runScene.chaser.rig.y),
              lane: runScene.chaser.currentLane,
            }
          : null;

      return {
        fps: Number.isFinite(fps) ? fps : null,
        time: time ?? null,
        hp: store.villainHp ?? null,
        maxHp: store.villainMaxHp ?? null,
        combo: store.combo ?? null,
        villain,
        chaser,
        gap: stateProviders.has("gap") ? (stateProviders.get("gap")!() as number) : null,
        patience: stateProviders.has("patience") ? (stateProviders.get("patience")!() as number) : null,
        npcCount: stateProviders.has("npcCount") ? (stateProviders.get("npcCount")!() as number) : null,
        crowdMood: stateProviders.has("crowdMood") ? (stateProviders.get("crowdMood")!() as string | number) : null,
      };
    },

    registerState(name: string, fn: () => unknown) {
      stateProviders.set(name, fn);
    },

    debug: {
      register(name: string, fn: (...args: unknown[]) => unknown) {
        debugRegistry.set(name, fn);
      },
      call(name: string, ...args: unknown[]) {
        const handler = debugRegistry.get(name);
        if (!handler) {
          throw new Error(`Debug function '${name}' is not registered`);
        }
        return handler(...args);
      },
      list() {
        return Array.from(debugRegistry.keys());
      },
    },
  };

  hook.debug.register("attack", (weaponId?: unknown) => {
    const id = typeof weaponId === "string" ? weaponId : "chappal";
    gameBus.emit("weapon:use", { weaponId: id, timestamp: Date.now() });
  });

  hook.debug.register("setHealth", (hp?: unknown) => {
    const val = typeof hp === "number" ? hp : 99999;
    useGameStore.setState({ villainHp: val, villainMaxHp: val });
  });

  hook.debug.register("spawnObstacle", () => {
    gameBus.emit("debug:spawnObstacle");
  });

  if (typeof window !== "undefined") {
    window.__game = hook;
  }

  return hook;
}
