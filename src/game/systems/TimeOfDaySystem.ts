import Phaser from "phaser";
import { BALANCE } from "@/config/balance";
import { TIME_OF_DAY_CONFIGS, TimeOfDayPhaseConfig } from "@/config/timeOfDay";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { useGameStore, TimeOfDay } from "@/store/useGameStore";

export class TimeOfDaySystem {
  private scene: Phaser.Scene;
  private parallaxSystem: ParallaxSystem;

  private currentPhaseId: TimeOfDay;
  private moonSprite?: Phaser.GameObjects.Sprite;
  private stars: Phaser.GameObjects.Sprite[] = [];
  private streetLamps: Phaser.GameObjects.Sprite[] = [];

  private cycleTime = 0;
  private readonly cycleDuration = 180000; // 3 minutes for full day/night cycle

  constructor(scene: Phaser.Scene, parallaxSystem: ParallaxSystem) {
    this.scene = scene;
    this.parallaxSystem = parallaxSystem;

    const initialPhase = useGameStore.getState().timeOfDay || "noon";
    this.currentPhaseId = initialPhase;

    this.initVisuals();
    this.applyPhase(initialPhase, 0);
  }

  private initVisuals() {
    const W = BALANCE.LOGICAL_WIDTH;
    const isLowQuality = useGameStore.getState().settings.quality === "low";

    // 1. Moon Sprite
    if (this.scene.textures.exists("fx-moon")) {
      this.moonSprite = this.scene.add
        .sprite(W - 220, 95, "fx-moon")
        .setDepth(0.6)
        .setAlpha(0);
    }

    // 2. Stars
    if (this.scene.textures.exists("particle-star") && !isLowQuality) {
      for (let i = 0; i < 28; i++) {
        const star = this.scene.add
          .sprite(
            Math.random() * W,
            15 + Math.random() * 140,
            "particle-star"
          )
          .setDepth(0.4)
          .setScale(0.3 + Math.random() * 0.4)
          .setAlpha(0);
        this.stars.push(star);
      }
    }

    // 3. Street Lamps (Additive glow sprites along the road curb line)
    if (this.scene.textures.exists("fx-glow-lamp") && !isLowQuality) {
      for (let x = 80; x < W + 120; x += 190) {
        const lamp = this.scene.add
          .sprite(x, 420, "fx-glow-lamp")
          .setDepth(4.5)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(1.4)
          .setAlpha(0);
        this.streetLamps.push(lamp);
      }
    }
  }

  public applyPhase(phaseId: TimeOfDay, durationMs: number = 8000) {
    const config = TIME_OF_DAY_CONFIGS[phaseId] || TIME_OF_DAY_CONFIGS.noon;
    this.currentPhaseId = phaseId;

    if (durationMs <= 0) {
      // Instant set (boot / lobby pick)
      this.parallaxSystem.setAmbientTint(config.ambientTint);
      this.parallaxSystem.setSkyTint(config.skyColors[0]);

      if (this.moonSprite) {
        this.moonSprite.setAlpha(config.moonAlpha);
      }
      for (const s of this.stars) {
        s.setAlpha(config.starsAlpha);
      }
      for (const l of this.streetLamps) {
        l.setAlpha(config.streetLightsAlpha);
      }
      return;
    }

    // Smooth 8s interpolation between phases (P2-07 AC: no hard cuts)
    this.parallaxSystem.setAmbientTint(config.ambientTint);
    this.parallaxSystem.setSkyTint(config.skyColors[0]);

    if (this.moonSprite) {
      this.scene.tweens.add({
        targets: this.moonSprite,
        alpha: config.moonAlpha,
        duration: durationMs,
        ease: "Quad.InOut",
      });
    }

    for (const s of this.stars) {
      this.scene.tweens.add({
        targets: s,
        alpha: config.starsAlpha,
        duration: durationMs,
        ease: "Quad.InOut",
      });
    }

    for (const l of this.streetLamps) {
      this.scene.tweens.add({
        targets: l,
        alpha: config.streetLightsAlpha,
        duration: durationMs,
        ease: "Quad.InOut",
      });
    }
  }

  public getCurrentConfig(): TimeOfDayPhaseConfig {
    return TIME_OF_DAY_CONFIGS[this.currentPhaseId] || TIME_OF_DAY_CONFIGS.noon;
  }

  public update(time: number, delta: number) {
    // 1. Twinkle stars
    if (this.stars.length > 0 && this.getCurrentConfig().starsAlpha > 0.1) {
      for (let i = 0; i < this.stars.length; i++) {
        if (i % 3 === 0) {
          this.stars[i].alpha =
            this.getCurrentConfig().starsAlpha *
            (0.7 + Math.sin(time * 0.005 + i) * 0.3);
        }
      }
    }

    // 2. Continuous time progression during gameplay
    this.cycleTime += delta;
    const cycleProgress = (this.cycleTime % this.cycleDuration) / this.cycleDuration;

    // Cycle order: dawn -> noon -> goldenHour -> night
    let targetPhase: TimeOfDay;
    if (cycleProgress < 0.25) {
      targetPhase = "dawn";
    } else if (cycleProgress < 0.5) {
      targetPhase = "noon";
    } else if (cycleProgress < 0.75) {
      targetPhase = "goldenHour";
    } else {
      targetPhase = "night";
    }

    if (targetPhase !== this.currentPhaseId) {
      this.applyPhase(targetPhase, 8000);
    }
  }

  public destroy() {
    if (this.moonSprite) this.moonSprite.destroy();
    for (const s of this.stars) s.destroy();
    for (const l of this.streetLamps) l.destroy();
    this.stars = [];
    this.streetLamps = [];
  }
}
