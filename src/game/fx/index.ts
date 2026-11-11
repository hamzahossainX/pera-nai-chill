import Phaser from "phaser";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { BALANCE } from "@/config/balance";
import { audioService } from "@/services/audio";
import { TimeOfDaySystem } from "@/game/systems/TimeOfDaySystem";
import { useGameStore } from "@/store/useGameStore";

export class BlackoutEffect {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser: Chaser;
  private timeOfDaySystem?: TimeOfDaySystem;

  private overlay!: Phaser.GameObjects.Rectangle;
  private villainEyes!: Phaser.GameObjects.Graphics;
  private chaserEyes!: Phaser.GameObjects.Graphics;
  private flashlight?: Phaser.GameObjects.Sprite;
  private generatorShops: Phaser.GameObjects.Sprite[] = [];
  public isActive = false;

  constructor(
    scene: Phaser.Scene,
    villain: Villain,
    chaser: Chaser,
    timeOfDaySystem?: TimeOfDaySystem
  ) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;
    this.timeOfDaySystem = timeOfDaySystem;
  }

  public activate(alpha: number = 0.94) {
    if (this.isActive) return;
    this.isActive = true;

    const W = BALANCE.LOGICAL_WIDTH;
    const H = BALANCE.LOGICAL_HEIGHT;

    const currentPhase =
      this.timeOfDaySystem?.getCurrentPhase() ||
      useGameStore.getState().timeOfDay ||
      "noon";
    const isNightOrDusk = currentPhase === "night" || currentPhase === "goldenHour";

    // Shut off street lamps during blackout
    if (this.timeOfDaySystem) {
      this.timeOfDaySystem.setLampsEnabled(false);
    }

    // Dynamic darkness: night loadshedding is dramatically darker (0.96) than noon (0.82)
    let effectiveAlpha = alpha;
    if (currentPhase === "night") {
      effectiveAlpha = 0.96;
    } else if (currentPhase === "goldenHour") {
      effectiveAlpha = 0.90;
    } else if (currentPhase === "noon" || currentPhase === "dawn") {
      effectiveAlpha = 0.82;
    }

    // 1. Dark blackout screen
    this.overlay = this.scene.add
      .rectangle(0, 0, W, H, 0x030712, 0)
      .setOrigin(0, 0)
      .setDepth(110);

    // Streetlight Flicker Intro: 3 quick flashes (0 -> 1 -> 0 -> 1)
    this.scene.tweens.add({
      targets: this.overlay,
      fillAlpha: effectiveAlpha,
      duration: 180,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        if (this.overlay && this.isActive) {
          this.overlay.fillAlpha = effectiveAlpha;
        }
      },
    });

    // 2. Glowing Eyes on Villain (Comic Yellow Dots)
    this.villainEyes = this.scene.make.graphics({ x: 0, y: 0 });
    this.villainEyes.fillStyle(0xfde047, 1);
    this.villainEyes.fillCircle(-6, -95, 4);
    this.villainEyes.fillCircle(6, -95, 4);
    this.villainEyes.generateTexture("eyes-villain-glow", 30, 20);
    this.villainEyes.destroy();

    const vGlow = this.scene.add
      .sprite(0, -90, "eyes-villain-glow")
      .setDepth(130);
    this.villain.rig.add(vGlow);

    // 3. Glowing Eyes on Chaser (White Comic Dots)
    this.chaserEyes = this.scene.make.graphics({ x: 0, y: 0 });
    this.chaserEyes.fillStyle(0xffffff, 1);
    this.chaserEyes.fillCircle(-5, -95, 3.5);
    this.chaserEyes.fillCircle(5, -95, 3.5);
    this.chaserEyes.generateTexture("eyes-chaser-glow", 30, 20);
    this.chaserEyes.destroy();

    const cGlow = this.scene.add
      .sprite(0, -90, "eyes-chaser-glow")
      .setDepth(130);
    this.chaser.rig.add(cGlow);

    // 4. Phone flashlight beam from Chaser aiming toward Villain
    if (isNightOrDusk && this.scene.textures.exists("fx-flashlight")) {
      this.flashlight = this.scene.add
        .sprite(this.chaser.rig.x + 30, this.chaser.rig.y - 45, "fx-flashlight")
        .setOrigin(0.05, 0.5)
        .setDepth(115)
        .setScale(1.15)
        .setAlpha(0.85);
    }

    // 5. Generator-lit shop windows in the background
    if (isNightOrDusk && this.scene.textures.exists("fx-shop-generator")) {
      const shopXs = [240, 680, 1040];
      for (const sx of shopXs) {
        const shop = this.scene.add
          .sprite(sx, 320, "fx-shop-generator")
          .setDepth(2.4)
          .setScale(1.1)
          .setAlpha(0.9);

        // Subtle generator jitter
        this.scene.tweens.add({
          targets: shop,
          alpha: 0.72,
          y: 319,
          duration: 90,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
        this.generatorShops.push(shop);
      }
    }
  }

  public update() {
    if (this.flashlight && this.isActive) {
      this.flashlight.x = this.chaser.rig.x + 25;
      this.flashlight.y = this.chaser.rig.y - 45;
      const angle = Phaser.Math.Angle.Between(
        this.chaser.rig.x,
        this.chaser.rig.y - 45,
        this.villain.rig.x,
        this.villain.rig.y - 45
      );
      this.flashlight.setRotation(angle);
    }
  }

  public deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    // Restore street lamps
    if (this.timeOfDaySystem) {
      this.timeOfDaySystem.setLampsEnabled(true);
    }

    // Fade out smoothly in 400 ms
    if (this.overlay) {
      this.scene.tweens.add({
        targets: this.overlay,
        fillAlpha: 0,
        duration: 400,
        ease: "Quad.Out",
        onComplete: () => {
          this.overlay.destroy();
        },
      });
    }

    if (this.flashlight) {
      this.scene.tweens.add({
        targets: this.flashlight,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.flashlight?.destroy();
          this.flashlight = undefined;
        },
      });
    }

    for (const shop of this.generatorShops) {
      this.scene.tweens.add({
        targets: shop,
        alpha: 0,
        duration: 300,
        onComplete: () => shop.destroy(),
      });
    }
    this.generatorShops = [];

    // Remove glowing eyes textures from rigs
    const vGlow = this.villain.rig.getByName("eyes-villain-glow");
    if (vGlow) vGlow.destroy();
    const cGlow = this.chaser.rig.getByName("eyes-chaser-glow");
    if (cGlow) cGlow.destroy();
  }
}

export class SmogEffect {
  private scene: Phaser.Scene;
  private villain: Villain;
  private timeOfDaySystem?: TimeOfDaySystem;

  private smogOverlay!: Phaser.GameObjects.Rectangle;
  private particles: Phaser.GameObjects.Sprite[] = [];
  private halos: Phaser.GameObjects.Sprite[] = [];
  private coughTimer = 0;
  public isActive = false;

  constructor(
    scene: Phaser.Scene,
    villain: Villain,
    timeOfDaySystem?: TimeOfDaySystem
  ) {
    this.scene = scene;
    this.villain = villain;
    this.timeOfDaySystem = timeOfDaySystem;
  }

  public activate(alpha: number = 0.45) {
    if (this.isActive) return;
    this.isActive = true;

    const W = BALANCE.LOGICAL_WIDTH;
    const H = BALANCE.LOGICAL_HEIGHT;

    const currentPhase =
      this.timeOfDaySystem?.getCurrentPhase() ||
      useGameStore.getState().timeOfDay ||
      "noon";
    const isNightOrDusk = currentPhase === "night" || currentPhase === "goldenHour";

    // Overlay color: warm murky haze at night, gray dust at noon
    const overlayColor = isNightOrDusk ? 0x3a2510 : 0x57534e;

    // Smog haze
    this.smogOverlay = this.scene.add
      .rectangle(0, 0, W, H, overlayColor, 0)
      .setOrigin(0, 0)
      .setDepth(105);

    this.scene.tweens.add({
      targets: this.smogOverlay,
      fillAlpha: alpha,
      duration: 350,
      ease: "Quad.Out",
    });

    // Spawn halos around active street lamps at night
    if (
      isNightOrDusk &&
      this.timeOfDaySystem &&
      this.scene.textures.exists("fx-light-halo")
    ) {
      for (const lamp of this.timeOfDaySystem.getStreetLamps()) {
        const halo = this.scene.add
          .sprite(lamp.x, lamp.y, "fx-light-halo")
          .setDepth(4.6)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(1.6)
          .setAlpha(0.65);

        this.scene.tweens.add({
          targets: halo,
          scale: 1.8,
          alpha: 0.45,
          duration: 1400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
        this.halos.push(halo);
      }
    }

    // Spawn drifting ash/soot particles
    for (let i = 0; i < 24; i++) {
      const p = this.scene.add
        .sprite(
          Math.random() * W,
          Math.random() * H,
          "particle-star"
        )
        .setDepth(106)
        .setScale(0.4)
        .setAlpha(0.3 + Math.random() * 0.4)
        .setTint(isNightOrDusk ? 0xa16207 : 0x78716c);
      this.particles.push(p);
    }
  }

  public update(_time: number, delta: number) {
    if (!this.isActive) return;

    const W = BALANCE.LOGICAL_WIDTH;
    // Drift soot particles leftwards
    for (const p of this.particles) {
      p.x -= 80 * (delta * 0.001);
      p.y += Math.sin(p.x * 0.05) * 0.5;
      if (p.x < -10) {
        p.x = W + 10;
        p.y = Math.random() * BALANCE.LOGICAL_HEIGHT;
      }
    }

    // Villain periodic cough every 1.2 s
    this.coughTimer += delta;
    if (this.coughTimer >= 1200) {
      this.coughTimer = 0;
      audioService.play("cough");

      // Torso doubles over slightly for 150ms
      this.scene.tweens.add({
        targets: this.villain.rig,
        rotation: 0.15,
        duration: 120,
        yoyo: true,
      });

      // Spawn "কাশি!" comic bubble text
      const bubble = this.scene.add
        .text(
          this.villain.rig.x,
          this.villain.rig.y - 120,
          "কাশি! (Cough!)",
          {
            fontFamily: "var(--font-bangla), sans-serif",
            fontSize: "20px",
            color: "#e2e8f0",
            stroke: "#000000",
            strokeThickness: 4,
          }
        )
        .setOrigin(0.5, 0.5)
        .setDepth(140);

      this.scene.tweens.add({
        targets: bubble,
        y: this.villain.rig.y - 150,
        alpha: 0,
        duration: 500,
        onComplete: () => bubble.destroy(),
      });
    }
  }

  public deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    // Fade out smoothly in 400 ms
    if (this.smogOverlay) {
      this.scene.tweens.add({
        targets: this.smogOverlay,
        fillAlpha: 0,
        duration: 400,
        ease: "Quad.Out",
        onComplete: () => {
          this.smogOverlay.destroy();
        },
      });
    }

    this.particles.forEach((p) => p.destroy());
    this.particles = [];
    this.halos.forEach((h) => h.destroy());
    this.halos = [];
  }
}

export class WaterloggingEffect {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser: Chaser;

  private waterTile!: Phaser.GameObjects.TileSprite;
  private boats: Phaser.GameObjects.Sprite[] = [];
  private splashTimer = 0;
  public isActive = false;

  constructor(scene: Phaser.Scene, villain: Villain, chaser: Chaser) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;
  }

  public activate(alpha: number = 0.6) {
    if (this.isActive) return;
    this.isActive = true;

    const W = BALANCE.LOGICAL_WIDTH;

    // Translucent flooded water layer on road
    this.waterTile = this.scene.add
      .tileSprite(0, 480, W, 240, "fx-water-layer")
      .setOrigin(0, 0)
      .setDepth(15)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: this.waterTile,
      alpha,
      duration: 400,
      ease: "Quad.Out",
    });

    // Spawn 3 floating paper boats drifting in floodwater
    for (let i = 0; i < 3; i++) {
      const boat = this.scene.add
        .sprite(
          W * 0.4 + i * 360,
          530 + (i % 3) * 45,
          "prop-paper-boat"
        )
        .setDepth(16)
        .setScale(0.9);

      // Bobbing rocking motion on water
      this.scene.tweens.add({
        targets: boat,
        y: boat.y - 6,
        rotation: 0.1,
        duration: 450 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.boats.push(boat);
    }

    audioService.play("splash");
  }

  public update(_time: number, delta: number) {
    if (!this.isActive) return;

    const dt = delta * 0.001;
    const W = BALANCE.LOGICAL_WIDTH;

    // Scroll water surface ripples
    if (this.waterTile) {
      this.waterTile.tilePositionX += 280 * dt;
    }

    // Drift paper boats with water current
    for (const boat of this.boats) {
      boat.x -= 240 * dt;
      if (boat.x < -60) {
        boat.x = W + 60;
        boat.y = 520 + Math.random() * 90;
      }
    }

    // Splashes around runners' feet
    this.splashTimer += delta;
    if (this.splashTimer >= 1000) {
      this.splashTimer = 0;
      audioService.play("splash", { volume: 0.4 });

      // Visual splash comic text
      const splashText = this.scene.add
        .text(
          this.villain.rig.x - 10,
          this.villain.rig.y + 10,
          "ছলাৎ ছলাৎ!",
          {
            fontFamily: "var(--font-bangla), sans-serif",
            fontSize: "16px",
            color: "#38bdf8",
            stroke: "#000000",
            strokeThickness: 3,
          }
        )
        .setOrigin(0.5, 0.5)
        .setDepth(20);

      this.scene.tweens.add({
        targets: splashText,
        y: splashText.y - 30,
        alpha: 0,
        duration: 500,
        onComplete: () => splashText.destroy(),
      });
    }
  }

  public deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.waterTile) {
      this.scene.tweens.add({
        targets: this.waterTile,
        alpha: 0,
        duration: 400,
        ease: "Quad.Out",
        onComplete: () => {
          this.waterTile.destroy();
        },
      });
    }

    this.boats.forEach((b) => {
      this.scene.tweens.killTweensOf(b);
      b.destroy();
    });
    this.boats = [];
  }
}
