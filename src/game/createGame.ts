import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { RunScene } from "./scenes/RunScene";
import { BALANCE } from "@/config/balance";

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: BALANCE.LOGICAL_WIDTH,
    height: BALANCE.LOGICAL_HEIGHT,
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

  return new Phaser.Game(config);
}
