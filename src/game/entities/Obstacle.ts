import Phaser from "phaser";
import { getLaneY, getLaneScale } from "@/config/layout";
import { BALANCE } from "@/config/balance";

export type ObstacleType =
  | "barricade"
  | "tire-fire"
  | "brick"
  | "crowd"
  | "rickshaw"
  | "pothole"
  | "fake-wallet"
  | "shopping-bag"
  | "wire-coil";

export interface ObstacleOptions {
  scene: Phaser.Scene;
  lane: number;
  type: ObstacleType;
  x?: number;
}

export class Obstacle extends Phaser.GameObjects.Sprite {
  public lane: number;
  public obstacleType: ObstacleType;
  public isActiveInWorld = false;
  public hasTelegraphed = false;
  public hasBeenCleared = false;
  private telegraphText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "obstacle-barricade");
    this.lane = 1;
    this.obstacleType = "barricade";
    scene.add.existing(this);
    this.setVisible(false);
  }

  public isLowHazard(): boolean {
    return (
      this.obstacleType === "pothole" ||
      this.obstacleType === "brick" ||
      this.obstacleType === "fake-wallet"
    );
  }

  public getPatienceCost(): number {
    if (this.isLowHazard()) return 8;
    if (
      this.obstacleType === "barricade" ||
      this.obstacleType === "shopping-bag" ||
      this.obstacleType === "wire-coil"
    ) {
      return 12;
    }
    return 15;
  }

  public getSlowMultiplier(): number {
    if (this.isLowHazard()) return 0.8;
    if (
      this.obstacleType === "barricade" ||
      this.obstacleType === "shopping-bag" ||
      this.obstacleType === "wire-coil"
    ) {
      return 0.7;
    }
    return 0.65;
  }

  public getSlowDurationSec(): number {
    if (this.isLowHazard()) return 1.2;
    if (
      this.obstacleType === "barricade" ||
      this.obstacleType === "shopping-bag" ||
      this.obstacleType === "wire-coil"
    ) {
      return 1.5;
    }
    return 1.8;
  }

  public spawn(lane: number, type: ObstacleType, startX: number = BALANCE.LOGICAL_WIDTH + 80) {
    this.lane = lane;
    this.obstacleType = type;
    this.isActiveInWorld = true;
    this.hasTelegraphed = false;
    this.hasBeenCleared = false;

    let textureKey = "obstacle-barricade";
    if (type === "barricade") textureKey = "obstacle-barricade";
    else if (type === "tire-fire") textureKey = "obstacle-tire-fire";
    else if (type === "crowd") textureKey = "obstacle-crowd";
    else if (type === "rickshaw") textureKey = "obstacle-rickshaw";
    else if (type === "pothole" || type === "fake-wallet") textureKey = "obstacle-pothole";
    else if (type === "brick") textureKey = "projectile-brick";
    else textureKey = "obstacle-barricade";

    if (this.scene.textures && !this.scene.textures.exists(textureKey)) {
      textureKey = "obstacle-barricade";
    }

    this.setTexture(textureKey);
    this.setPosition(startX, getLaneY(lane) - 15);
    this.setScale(getLaneScale(lane));
    this.setDepth(lane + 8);
    this.setVisible(true);
  }

  public showTelegraph() {
    if (this.hasTelegraphed || !this.scene?.add) return;
    this.hasTelegraphed = true;

    const laneY = getLaneY(this.lane);
    const label = this.isLowHazard() ? "⚠ লাফ দিন! (JUMP)" : "⚠ লেন বদলান! (LANE)";

    if (typeof this.scene.add.text === "function") {
      this.telegraphText = this.scene.add.text(520, laneY - 45, label, {
        fontFamily: "var(--font-comic, Bangers), sans-serif",
        fontSize: "18px",
        color: "#fbbf24", // pattern-ok: comic text styling
        stroke: "#000000", // pattern-ok: comic text stroke
        strokeThickness: 3,
      });
      this.telegraphText.setDepth(150);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: this.telegraphText,
          alpha: { from: 1, to: 0.3 },
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 220,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            this.telegraphText?.destroy();
            this.telegraphText = undefined;
          },
        });
      }
    }
  }

  public deactivate() {
    this.isActiveInWorld = false;
    this.setVisible(false);
    this.setPosition(-200, -200);
    if (this.telegraphText) {
      this.telegraphText.destroy();
      this.telegraphText = undefined;
    }
  }

  public update(_time: number, delta: number, speed: number) {
    if (!this.isActiveInWorld) return;

    this.setX(this.x - speed * (delta * 0.001));

    // 700ms telegraph before arrival at chaser (~550px given speed ~350px/s)
    if (!this.hasTelegraphed && this.x <= 750 && this.x >= 450) {
      this.showTelegraph();
    }

    if (this.x < -150) {
      this.deactivate();
    }
  }
}
