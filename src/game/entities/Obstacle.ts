import Phaser from "phaser";
import { BALANCE } from "@/config/balance";

export type ObstacleType =
  | "barricade"
  | "tire-fire"
  | "brick"
  | "crowd"
  | "rickshaw"
  | "pothole";

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

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "obstacle-barricade");
    this.lane = 1;
    this.obstacleType = "barricade";
    scene.add.existing(this);
    this.setVisible(false);
  }

  public spawn(lane: number, type: ObstacleType, startX: number = BALANCE.LOGICAL_WIDTH + 80) {
    this.lane = lane;
    this.obstacleType = type;
    this.isActiveInWorld = true;

    const textureKey =
      type === "barricade"
        ? "obstacle-barricade"
        : type === "tire-fire"
        ? "obstacle-tire-fire"
        : type === "crowd"
        ? "obstacle-crowd"
        : type === "rickshaw"
        ? "obstacle-rickshaw"
        : type === "pothole"
        ? "obstacle-pothole"
        : "projectile-brick";

    this.setTexture(textureKey);
    this.setFlipX(type === "rickshaw");
    this.setPosition(startX, BALANCE.LANES_Y[lane] - 15);
    this.setScale(BALANCE.LANE_SCALES[lane]);
    this.setDepth(lane + 8);
    this.setVisible(true);
  }

  public deactivate() {
    this.isActiveInWorld = false;
    this.setVisible(false);
    this.setPosition(-200, -200);
  }

  public update(_time: number, delta: number, speed: number) {
    if (!this.isActiveInWorld) return;

    this.x -= speed * (delta * 0.001);

    if (this.x < -150) {
      this.deactivate();
    }
  }
}
