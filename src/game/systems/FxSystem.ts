import Phaser from "phaser";
import { useGameStore } from "@/store/useGameStore";

export class FxSystem {
  private scene: Phaser.Scene;
  private particlePool: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public triggerHitStop(durationMs: number = 80) {
    this.scene.time.timeScale = 0.05;
    this.scene.time.delayedCall(durationMs, () => {
      this.scene.time.timeScale = 1.0;
    });
  }

  public triggerCameraShake(durationMs: number = 120, intensity: number = 0.01) {
    this.scene.cameras.main.shake(durationMs, intensity);
  }

  public spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = "#fbbf24",
    fontSize: string = "28px"
  ) {
    const textObj = this.scene.add
      .text(x, y, text, {
        fontFamily: "'Hind Siliguri', 'Luckiest Guy', sans-serif",
        fontSize,
        color,
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(200);

    this.scene.tweens.add({
      targets: textObj,
      y: y - 55,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0,
      duration: 750,
      ease: "Back.Out",
      onComplete: () => {
        textObj.destroy();
      },
    });
  }

  public spawnHitParticles(x: number, y: number, count: number = 8, textureKey: string = "particle-star") {
    const isLow = useGameStore.getState().settings.quality === "low";
    const effectiveCount = isLow ? Math.max(3, Math.floor(count * 0.5)) : Math.min(count, 20);
    const key = this.scene.textures.exists(textureKey) ? textureKey : "particle-star";

    for (let i = 0; i < effectiveCount; i++) {
      let p = this.particlePool.pop();
      if (!p) {
        p = this.scene.add.sprite(x, y, key).setDepth(150);
      } else {
        p.setTexture(key);
        p.setPosition(x, y);
        p.setAlpha(1);
        p.setScale(1);
        p.setRotation(0);
        p.setVisible(true);
        p.setActive(true);
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 160;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: p,
        x: x + vx * 0.5,
        y: y + vy * 0.5,
        rotation: (Math.random() - 0.5) * 6,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 400 + Math.random() * 300,
        ease: "Quad.Out",
        onComplete: () => {
          if (p) {
            p.setVisible(false);
            p.setActive(false);
            if (this.particlePool.length < 50) {
              this.particlePool.push(p);
            } else {
              p.destroy();
            }
          }
        },
      });
    }
  }

  public triggerHitFx(
    x: number,
    y: number,
    comicWord: string,
    damage: number,
    isCrit: boolean = false
  ) {
    this.triggerHitStop(isCrit ? 120 : 80);
    this.triggerCameraShake(isCrit ? 180 : 100, isCrit ? 0.02 : 0.008);
    this.spawnHitParticles(x, y, isCrit ? 16 : 8);

    // Comic Sound Text (Bangla)
    this.spawnFloatingText(
      x + (Math.random() - 0.5) * 30,
      y - 40,
      comicWord,
      "#f43f5e",
      "32px"
    );

    // Damage Number
    this.spawnFloatingText(
      x + 20,
      y - 8,
      `-${damage}`,
      isCrit ? "#fbbf24" : "#ffffff",
      isCrit ? "30px" : "24px"
    );
  }

  public triggerArchetypeHitReaction(archetypeId: string, x: number, y: number) {
    switch (archetypeId) {
      case "phoneSnatcher":
        this.spawnHitParticles(x, y, 2, "snatcher-prop-phone");
        break;
      case "pickpocket":
        this.spawnHitParticles(x, y, 3, "particle-cash-note");
        break;
      case "cableChor":
        this.spawnHitParticles(x, y, 4, "particle-spark");
        this.spawnFloatingText(x, y - 50, "BZZT! কারেন্ট!", "#38bdf8", "22px");
        break;
      case "manholeChor":
        this.spawnFloatingText(x, y - 50, "ঢং! ঢং! CLANG!", "#cbd5e1", "24px");
        break;
      case "eidMarketChor":
        this.spawnHitParticles(x, y, 3, "particle-star");
        this.spawnFloatingText(x, y - 50, "আমার পাঞ্জাবি রে!", "#f43f5e", "20px");
        break;
      case "chickenChor":
        this.spawnHitParticles(x, y, 6, "particle-feather");
        this.spawnFloatingText(x, y - 50, "কক্কক-কুরররূ!", "#ea580c", "24px");
        break;
      case "chorSardar":
        this.spawnHitParticles(x, y, 3, "particle-document");
        this.spawnFloatingText(x, y - 50, "চশমা পইড়া গেল!", "#f59e0b", "22px");
        break;
      default:
        this.spawnHitParticles(x, y, 3, "particle-star");
    }
  }

  public triggerArchetypeDefeatReaction(archetypeId: string, x: number, y: number) {
    switch (archetypeId) {
      case "phoneSnatcher":
        // 12 stolen smartphones explode in comic arc
        this.spawnHitParticles(x, y, 12, "snatcher-prop-phone");
        this.spawnFloatingText(x, y - 70, "স্ক্রিনলক খোলা ছিল না!", "#38bdf8", "28px");
        break;

      case "pickpocket":
        // Cash waterfall
        this.spawnHitParticles(x, y, 16, "particle-cash-note");
        this.spawnFloatingText(x, y - 70, "টাকা সব ফিরায়া নেন!", "#22c55e", "28px");
        break;

      case "cableChor":
        this.spawnHitParticles(x, y, 14, "particle-spark");
        this.spawnFloatingText(x, y - 70, "লাইন কাইটা গেল রে!", "#f59e0b", "28px");
        break;

      case "manholeChor": {
        this.spawnFloatingText(x, y - 70, "ঢাকনা ফিরাইয়া দিলাম!", "#cbd5e1", "28px");
        // Spinning manhole lid on ground
        if (this.scene.textures.exists("manholeChor-prop-manhole-cover")) {
          const lid = this.scene.add
            .sprite(x, y + 15, "manholeChor-prop-manhole-cover")
            .setDepth(150);
          this.scene.tweens.add({
            targets: lid,
            scaleY: 0.15,
            rotation: 12,
            duration: 800,
            ease: "Quad.Out",
          });
        }
        break;
      }

      case "eidMarketChor":
        this.spawnHitParticles(x, y, 16, "particle-star");
        this.spawnFloatingText(x, y - 70, "ঈদ শেষ! ধরা শেষ!", "#fbbf24", "28px");
        break;

      case "chickenChor": {
        // Burst of feathers
        this.spawnHitParticles(x, y, 16, "particle-feather");
        this.spawnFloatingText(x, y - 70, "মুরগি পলাইসে!", "#ea580c", "30px");

        // The escaped Deshi rooster runs forward triumphantly!
        if (this.scene.textures.exists("chickenChor-prop-chicken")) {
          const rooster = this.scene.add
            .sprite(x, y + 10, "chickenChor-prop-chicken")
            .setDepth(160)
            .setScale(1.2);

          this.scene.tweens.add({
            targets: rooster,
            x: x + 400,
            y: y - 20,
            duration: 1200,
            ease: "Quad.In",
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              rooster.destroy();
            },
          });
        }
        break;
      }

      case "chorSardar": {
        this.spawnHitParticles(x, y, 14, "particle-document");
        this.spawnHitParticles(x, y, 10, "particle-cash-note");
        this.spawnFloatingText(x, y - 70, "আমি সারেন্ডার করলাম!", "#ef4444", "32px");

        // Briefcase pop open
        if (this.scene.textures.exists("chorSardar-prop-briefcase")) {
          const caseObj = this.scene.add
            .sprite(x, y + 10, "chorSardar-prop-briefcase")
            .setDepth(155);
          this.scene.tweens.add({
            targets: caseObj,
            rotation: 2.5,
            x: x + 60,
            duration: 500,
            ease: "Bounce.Out",
          });
        }
        break;
      }

      default:
        this.spawnHitParticles(x, y, 12, "particle-star");
    }
  }

  public destroy() {
    this.particlePool.forEach((p) => {
      try {
        p.destroy();
      } catch {}
    });
    this.particlePool = [];
  }
}
