import Phaser from "phaser";
import { BALANCE } from "@/config/balance";
import { useGameStore, WeatherType } from "@/store/useGameStore";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";

export class WeatherSystem {
  private scene: Phaser.Scene;
  private parallaxSystem: ParallaxSystem;

  public activeWeather: WeatherType = "clear";

  // Visual layers
  private rainDrops: Phaser.GameObjects.Sprite[] = [];
  private rainPool: Phaser.GameObjects.Sprite[] = [];
  private puddles: Phaser.GameObjects.Sprite[] = [];
  private fogSprites: Phaser.GameObjects.Sprite[] = [];
  private floodWater?: Phaser.GameObjects.Rectangle;
  private floatingDebris: Phaser.GameObjects.Sprite[] = [];
  private lightningOverlay?: Phaser.GameObjects.Rectangle;

  // Timers
  private lightningTimer = 12000; // ms
  private splashTimer = 0;

  constructor(scene: Phaser.Scene, parallaxSystem: ParallaxSystem) {
    this.scene = scene;
    this.parallaxSystem = parallaxSystem;

    const initialWeather = useGameStore.getState().weather || "clear";
    this.setWeather(initialWeather);
  }

  public setWeather(type: WeatherType) {
    this.clearWeather();
    this.activeWeather = type;

    const W = BALANCE.LOGICAL_WIDTH;
    const H = BALANCE.LOGICAL_HEIGHT;

    if (type === "rain") {
      this.initRain(W, H);
      this.initPuddles(W);
    } else if (type === "fog") {
      this.initFog(W);
    } else if (type === "flood") {
      this.initRain(W, H, 35);
      this.initFlood(W);
    }
  }

  private initRain(W: number, _H: number, count: number = 60) {
    if (!this.scene.textures.exists("fx-raindrop")) return;

    for (let i = 0; i < count; i++) {
      const drop = this.scene.add
        .sprite(Math.random() * (W + 200), Math.random() * 720, "fx-raindrop")
        .setDepth(115)
        .setAlpha(0.7)
        .setRotation(0.2); // slight diagonal angle
      this.rainDrops.push(drop);
    }

    // Lightning overlay
    this.lightningOverlay = this.scene.add
      .rectangle(W / 2, 720 / 2, W, 720, 0xffffff, 0)
      .setDepth(220)
      .setOrigin(0.5, 0.5);
  }

  private initPuddles(W: number) {
    if (!this.scene.textures.exists("fx-puddle")) return;

    // Place 6-8 puddles across the road lanes
    const laneYs = [490, 560, 630];
    for (let x = 120; x < W + 100; x += 180) {
      const y = laneYs[Math.floor(Math.random() * laneYs.length)] + (Math.random() - 0.5) * 20;
      const puddle = this.scene.add
        .sprite(x, y, "fx-puddle")
        .setDepth(3.5)
        .setScale(0.85 + Math.random() * 0.3)
        .setAlpha(0.65);
      this.puddles.push(puddle);
    }
  }

  private initFog(W: number) {
    if (!this.scene.textures.exists("fx-fog")) return;

    for (let x = 60; x < W + 200; x += 220) {
      const fog = this.scene.add
        .sprite(x, 260 + (Math.random() - 0.5) * 80, "fx-fog")
        .setDepth(2.5)
        .setScale(1.2 + Math.random() * 0.4)
        .setAlpha(0.45);
      this.fogSprites.push(fog);
    }
  }

  private initFlood(W: number) {
    // 1. Waterlogged road overlay
    this.floodWater = this.scene.add
      .rectangle(W / 2, 580, W, 280, 0x0369a1, 0.45)
      .setDepth(3.6)
      .setOrigin(0.5, 0.5);

    // 2. Floating debris (floating slippers)
    if (this.scene.textures.exists("fx-floating-slipper")) {
      for (let x = 150; x < W + 100; x += 280) {
        const slipper = this.scene.add
          .sprite(x, 540 + Math.random() * 100, "fx-floating-slipper")
          .setDepth(3.7)
          .setScale(0.9);
        this.floatingDebris.push(slipper);
      }
    }

    // 3. Flood speed penalty (−25%)
    this.parallaxSystem.speedMultiplier *= 0.75;
  }

  public triggerLightning() {
    const isReducedMotion = useGameStore.getState().settings.reducedMotion;
    if (isReducedMotion || !this.lightningOverlay) return;

    this.scene.tweens.add({
      targets: this.lightningOverlay,
      fillAlpha: 0.65,
      duration: 60,
      yoyo: true,
      repeat: 1,
      ease: "Linear",
      onComplete: () => {
        if (this.lightningOverlay) {
          this.lightningOverlay.fillAlpha = 0;
        }
      },
    });
  }

  public update(time: number, delta: number) {
    const dt = delta * 0.001;
    const W = BALANCE.LOGICAL_WIDTH;

    // 1. Rain drops movement & recycling
    if (this.rainDrops.length > 0) {
      const rainSpeedY = 1200;
      const rainSpeedX = -220;

      for (const drop of this.rainDrops) {
        drop.y += rainSpeedY * dt;
        drop.x += rainSpeedX * dt;

        if (drop.y > 720 || drop.x < -20) {
          drop.y = -20;
          drop.x = Math.random() * (W + 200);
        }
      }

      // Lightning interval check
      this.lightningTimer -= delta;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 11000 + Math.random() * 9000;
        this.triggerLightning();
      }
    }

    // 2. Fog drifting
    if (this.fogSprites.length > 0) {
      for (const fog of this.fogSprites) {
        fog.x -= 40 * dt;
        fog.y += Math.sin(time * 0.002 + fog.x * 0.01) * 0.3;
        if (fog.x < -160) {
          fog.x = W + 160;
        }
      }
    }

    // 3. Floating debris in flood
    if (this.floatingDebris.length > 0) {
      for (const item of this.floatingDebris) {
        item.x -= 65 * dt;
        item.y += Math.sin(time * 0.004 + item.x * 0.02) * 0.4;
        if (item.x < -80) {
          item.x = W + 80;
        }
      }
    }
  }

  public clearWeather() {
    for (const drop of this.rainDrops) drop.destroy();
    for (const p of this.puddles) p.destroy();
    for (const f of this.fogSprites) f.destroy();
    for (const d of this.floatingDebris) d.destroy();

    if (this.floodWater) {
      this.floodWater.destroy();
      this.floodWater = undefined;
      // Revert speed multiplier
      this.parallaxSystem.speedMultiplier = 1.0;
    }

    if (this.lightningOverlay) {
      this.lightningOverlay.destroy();
      this.lightningOverlay = undefined;
    }

    this.rainDrops = [];
    this.puddles = [];
    this.fogSprites = [];
    this.floatingDebris = [];
  }

  public destroy() {
    this.clearWeather();
  }
}
