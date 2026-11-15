import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { RunScene } from "./scenes/RunScene";
import { BALANCE } from "@/config/balance";
import { rng } from "@/lib/rng";
import { installTestHook } from "./testHook";

export function createGame(parent: HTMLElement): Phaser.Game {
  let isTestMode = false;
  let activeSeed = "1234";

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    isTestMode = params.get("test") === "1";
    activeSeed = params.get("seed") || "1234";
    rng.init(activeSeed);
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: BALANCE.LOGICAL_WIDTH,
    height: BALANCE.LOGICAL_HEIGHT,
    seed: [activeSeed],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    fps: {
      target: BALANCE.TARGET_FPS,
      forceSetTimeOut: true,
    },
    input: {
      activePointers: 3,
    },
    scene: [BootScene, PreloadScene, RunScene],
    backgroundColor: "#0f172a",
    transparent: false,
    pixelArt: false,
    roundPixels: false,
  };

  const game = new Phaser.Game(config);

  if (isTestMode) {
    installTestHook(game, activeSeed);
  }

  return game;
}
