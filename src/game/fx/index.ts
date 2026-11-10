import Phaser from "phaser";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { BALANCE } from "@/config/balance";
import { audioService } from "@/services/audio";

export class BlackoutEffect {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser: Chaser;

  private overlay!: Phaser.GameObjects.Rectangle;
  private villainEyes!: Phaser.GameObjects.Graphics;
  private chaserEyes!: Phaser.GameObjects.Graphics;
  public isActive = false;

  constructor(scene: Phaser.Scene, villain: Villain, chaser: Chaser) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;
  }

  public activate(alpha: number = 0.94) {
    if (this.isActive) return;
    this.isActive = true;

    const W = BALANCE.LOGICAL_WIDTH;
    const H = BALANCE.LOGICAL_HEIGHT;

    // 1. Dark blackout screen
    this.overlay = this.scene.add
      .rectangle(0, 0, W, H, 0x030712, 0)
      .setOrigin(0, 0)
      .setDepth(110);

    // Streetlight Flicker Intro: 3 quick flashes (0 -> 1 -> 0 -> 1)
    this.scene.tweens.add({
      targets: this.overlay,
      fillAlpha: alpha,
      duration: 180,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        if (this.overlay && this.isActive) {
          this.overlay.fillAlpha = alpha;
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
  }

  public deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

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

  private smogOverlay!: Phaser.GameObjects.Rectangle;
  private particles: Phaser.GameObjects.Sprite[] = [];
  private coughTimer = 0;
  public isActive = false;

  constructor(scene: Phaser.Scene, villain: Villain) {
    this.scene = scene;
    this.villain = villain;
  }

  public activate(alpha: number = 0.45) {
    if (this.isActive) return;
    this.isActive = true;

    const W = BALANCE.LOGICAL_WIDTH;
    const H = BALANCE.LOGICAL_HEIGHT;

    // Dirty yellow-gray haze
    this.smogOverlay = this.scene.add
      .rectangle(0, 0, W, H, 0x57534e, 0)
      .setOrigin(0, 0)
      .setDepth(105);

    this.scene.tweens.add({
      targets: this.smogOverlay,
      fillAlpha: alpha,
      duration: 350,
      ease: "Quad.Out",
    });

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
        .setTint(0x78716c);
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
  }
}
