import Phaser from "phaser";
import { gameBus } from "@/game/bus";
import { useGameStore } from "@/store/useGameStore";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.on("progress", (value: number) => {
      gameBus.emit("loader:progress", {
        progress: Math.round(value * 100),
        task: "Preloading assets...",
      });
    });
  }

  create() {
    // If user has a custom face uploaded in Zustand store, install it dynamically into Phaser texture cache
    const targetFaceUrl = useGameStore.getState().targetFaceUrl;
    if (targetFaceUrl && !this.textures.exists("target-face")) {
      this.textures.once(Phaser.Textures.Events.ADD, () => {
        this.scene.start("RunScene");
      });
      this.textures.addBase64("target-face", targetFaceUrl);
    } else {
      this.scene.start("RunScene");
    }
  }
}
