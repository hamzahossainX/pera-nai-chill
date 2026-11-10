import Phaser from "phaser";
import { BALANCE } from "@/config/balance";

export type PickupType = "daab" | "mask" | "biriyani" | "cha" | "taka";

export class PickupItem extends Phaser.GameObjects.Sprite {
  public lane = 1;
  public pickupType: PickupType = "daab";
  public isActiveInWorld = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "pickup-daab");
    scene.add.existing(this);
    this.setVisible(false);
  }

  public spawn(lane: number, type: PickupType, startX: number = BALANCE.LOGICAL_WIDTH + 80) {
    this.lane = lane;
    this.pickupType = type;
    this.isActiveInWorld = true;

    const textureKey =
      type === "daab"
        ? "pickup-daab"
        : type === "mask"
        ? "pickup-mask"
        : type === "biriyani"
        ? "pickup-biriyani"
        : type === "cha"
        ? "pickup-cha"
        : "pickup-taka-bag";

    this.setTexture(textureKey);
    this.setPosition(startX, BALANCE.LANES_Y[lane] - 25);
    this.setScale(BALANCE.LANE_SCALES[lane]);
    this.setDepth(lane + 9);
    this.setVisible(true);

    // Floating bob tween
    this.scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public deactivate() {
    this.isActiveInWorld = false;
    this.setVisible(false);
    this.scene.tweens.killTweensOf(this);
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
