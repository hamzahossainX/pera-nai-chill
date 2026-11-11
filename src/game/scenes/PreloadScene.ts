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

    this.load.on("loaderror", (file: { key?: string }) => {
      console.warn("Asset load error, falling back to procedural texture:", file?.key);
    });

    // 2x rasterized SVG character parts
    const svgAssets = [
      { key: "snatcher-torso", url: "/assets/characters/phoneSnatcher/torso.svg" },
      { key: "snatcher-arm-upper", url: "/assets/characters/phoneSnatcher/arm_upper.svg" },
      { key: "snatcher-arm-lower", url: "/assets/characters/phoneSnatcher/arm_lower.svg" },
      { key: "snatcher-hand", url: "/assets/characters/phoneSnatcher/hand.svg" },
      { key: "snatcher-thigh", url: "/assets/characters/phoneSnatcher/thigh.svg" },
      { key: "snatcher-shin", url: "/assets/characters/phoneSnatcher/shin.svg" },
      { key: "snatcher-foot", url: "/assets/characters/phoneSnatcher/foot.svg" },
      { key: "snatcher-hood-back", url: "/assets/characters/phoneSnatcher/hood_back.svg" },
      { key: "snatcher-hood-front", url: "/assets/characters/phoneSnatcher/hood_front.svg" },
      { key: "snatcher-mask-upper", url: "/assets/characters/phoneSnatcher/mask_upper.svg" },
      { key: "snatcher-mask-lower", url: "/assets/characters/phoneSnatcher/mask_lower.svg" },
      { key: "snatcher-prop-phone", url: "/assets/characters/phoneSnatcher/prop_phone.svg" },
    ];

    for (const asset of svgAssets) {
      this.load.svg(asset.key, asset.url, { scale: 2 });
    }
  }

  create() {
    // If user has a custom face uploaded in Zustand store, install it dynamically into Phaser texture cache
    const targetFaceUrl = useGameStore.getState().targetFaceUrl;
    if (targetFaceUrl) {
      if (this.textures.exists("target-face")) {
        this.textures.remove("target-face");
      }
      this.textures.once(Phaser.Textures.Events.ADD, () => {
        this.scene.start("RunScene");
      });
      this.textures.addBase64("target-face", targetFaceUrl);
    } else {
      this.scene.start("RunScene");
    }
  }
}
