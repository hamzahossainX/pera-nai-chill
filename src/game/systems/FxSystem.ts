import Phaser from "phaser";

export class FxSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public triggerHitStop(durationMs: number = 90) {
    this.scene.physics.pause();
    this.scene.time.delayedCall(durationMs, () => {
      this.scene.physics.resume();
    });
  }

  public triggerCameraShake(durationMs: number = 120, intensity: number = 0.012) {
    this.scene.cameras.main.shake(durationMs, intensity);
  }

  public spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = "#facc15",
    fontSize: string = "28px"
  ) {
    const floatText = this.scene.add
      .text(x, y - 20, text, {
        fontFamily: "var(--font-comic), Impact, sans-serif",
        fontSize: fontSize,
        color: color,
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(200);

    this.scene.tweens.add({
      targets: floatText,
      y: y - 80,
      alpha: 0,
      scaleX: 1.25,
      scaleY: 1.25,
      ease: "Quad.Out",
      duration: 650,
      onComplete: () => {
        floatText.destroy();
      },
    });
  }

  public spawnHitParticles(x: number, y: number, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const texture = Math.random() < 0.6 ? "particle-star" : "particle-coin";
      const p = this.scene.add
        .sprite(x, y, texture)
        .setDepth(150)
        .setScale(0.8);

      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 400 + Math.random() * 250,
        ease: "Quad.Out",
        onComplete: () => {
          p.destroy();
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
}
