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

    // 2x rasterized SVG character parts for all 7 archetypes + Chaser
    const svgAssets = [
      // Aam-Janata Hero Chaser
      { key: "chaser-torso", url: "/assets/characters/chaser/torso.svg" },
      { key: "chaser-arm-upper", url: "/assets/characters/chaser/arm_upper.svg" },
      { key: "chaser-arm-lower", url: "/assets/characters/chaser/arm_lower.svg" },
      { key: "chaser-hand", url: "/assets/characters/chaser/hand.svg" },
      { key: "chaser-thigh", url: "/assets/characters/chaser/thigh.svg" },
      { key: "chaser-shin", url: "/assets/characters/chaser/shin.svg" },
      { key: "chaser-foot", url: "/assets/characters/chaser/foot.svg" },

      // Phone Snatcher
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

      // Pickpocket
      { key: "pickpocket-torso", url: "/assets/characters/pickpocket/torso.svg" },
      { key: "pickpocket-arm-upper", url: "/assets/characters/pickpocket/arm_upper.svg" },
      { key: "pickpocket-arm-lower", url: "/assets/characters/pickpocket/arm_lower.svg" },
      { key: "pickpocket-hand", url: "/assets/characters/pickpocket/hand.svg" },
      { key: "pickpocket-thigh", url: "/assets/characters/pickpocket/thigh.svg" },
      { key: "pickpocket-shin", url: "/assets/characters/pickpocket/shin.svg" },
      { key: "pickpocket-foot", url: "/assets/characters/pickpocket/foot.svg" },
      { key: "pickpocket-mask-lower", url: "/assets/characters/pickpocket/mask_lower.svg" },
      { key: "pickpocket-prop-wallet", url: "/assets/characters/pickpocket/prop_wallet.svg" },

      // Cable Chor
      { key: "cableChor-torso", url: "/assets/characters/cableChor/torso.svg" },
      { key: "cableChor-arm-upper", url: "/assets/characters/cableChor/arm_upper.svg" },
      { key: "cableChor-arm-lower", url: "/assets/characters/cableChor/arm_lower.svg" },
      { key: "cableChor-hand", url: "/assets/characters/cableChor/hand.svg" },
      { key: "cableChor-thigh", url: "/assets/characters/cableChor/thigh.svg" },
      { key: "cableChor-shin", url: "/assets/characters/cableChor/shin.svg" },
      { key: "cableChor-foot", url: "/assets/characters/cableChor/foot.svg" },
      { key: "cableChor-prop-cutter", url: "/assets/characters/cableChor/prop_cutter.svg" },
      { key: "cableChor-prop-wire-coil", url: "/assets/characters/cableChor/prop_wire_coil.svg" },

      // Manhole Chor
      { key: "manholeChor-torso", url: "/assets/characters/manholeChor/torso.svg" },
      { key: "manholeChor-arm-upper", url: "/assets/characters/manholeChor/arm_upper.svg" },
      { key: "manholeChor-arm-lower", url: "/assets/characters/manholeChor/arm_lower.svg" },
      { key: "manholeChor-hand", url: "/assets/characters/manholeChor/hand.svg" },
      { key: "manholeChor-thigh", url: "/assets/characters/manholeChor/thigh.svg" },
      { key: "manholeChor-shin", url: "/assets/characters/manholeChor/shin.svg" },
      { key: "manholeChor-foot", url: "/assets/characters/manholeChor/foot.svg" },
      { key: "manholeChor-prop-manhole-cover", url: "/assets/characters/manholeChor/prop_manhole_cover.svg" },

      // Eid Market Chor
      { key: "eidMarketChor-torso", url: "/assets/characters/eidMarketChor/torso.svg" },
      { key: "eidMarketChor-arm-upper", url: "/assets/characters/eidMarketChor/arm_upper.svg" },
      { key: "eidMarketChor-arm-lower", url: "/assets/characters/eidMarketChor/arm_lower.svg" },
      { key: "eidMarketChor-hand", url: "/assets/characters/eidMarketChor/hand.svg" },
      { key: "eidMarketChor-thigh", url: "/assets/characters/eidMarketChor/thigh.svg" },
      { key: "eidMarketChor-shin", url: "/assets/characters/eidMarketChor/shin.svg" },
      { key: "eidMarketChor-foot", url: "/assets/characters/eidMarketChor/foot.svg" },
      { key: "eidMarketChor-headFront", url: "/assets/characters/eidMarketChor/headFront.svg" },
      { key: "eidMarketChor-prop-shopping-bags", url: "/assets/characters/eidMarketChor/prop_shopping_bags.svg" },

      // Chicken Chor
      { key: "chickenChor-torso", url: "/assets/characters/chickenChor/torso.svg" },
      { key: "chickenChor-arm-upper", url: "/assets/characters/chickenChor/arm_upper.svg" },
      { key: "chickenChor-arm-lower", url: "/assets/characters/chickenChor/arm_lower.svg" },
      { key: "chickenChor-hand", url: "/assets/characters/chickenChor/hand.svg" },
      { key: "chickenChor-thigh", url: "/assets/characters/chickenChor/thigh.svg" },
      { key: "chickenChor-shin", url: "/assets/characters/chickenChor/shin.svg" },
      { key: "chickenChor-foot", url: "/assets/characters/chickenChor/foot.svg" },
      { key: "chickenChor-prop-chicken", url: "/assets/characters/chickenChor/prop_chicken.svg" },

      // Chor Sardar
      { key: "chorSardar-torso", url: "/assets/characters/chorSardar/torso.svg" },
      { key: "chorSardar-arm-upper", url: "/assets/characters/chorSardar/arm_upper.svg" },
      { key: "chorSardar-arm-lower", url: "/assets/characters/chorSardar/arm_lower.svg" },
      { key: "chorSardar-hand", url: "/assets/characters/chorSardar/hand.svg" },
      { key: "chorSardar-thigh", url: "/assets/characters/chorSardar/thigh.svg" },
      { key: "chorSardar-shin", url: "/assets/characters/chorSardar/shin.svg" },
      { key: "chorSardar-foot", url: "/assets/characters/chorSardar/foot.svg" },
      { key: "chorSardar-headFront", url: "/assets/characters/chorSardar/headFront.svg" },
      { key: "chorSardar-prop-briefcase", url: "/assets/characters/chorSardar/prop_briefcase.svg" },
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
