import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { getLaneY, getLaneScale } from "@/config/layout";
import { OUTFITS } from "@/config/outfits";

export class Chaser {
  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public currentLane = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const initialY = getLaneY(this.currentLane);
    const initialScale = getLaneScale(this.currentLane);

    this.rig = new CharacterRig({
      scene,
      x: 320,
      y: initialY,
      isSilhouette: false,
      outfit: OUTFITS.chaserJanata,
      outfitColor: 0x059669, // Hero Green Polo
      pantColor: 0x1e3a8a, // Denim Jeans
      faceKey: "hero-face",
      scale: initialScale,
      isChaser: true,
    });

    this.rig.setDepth(this.currentLane + 9);
  }

  public spawnDashDust(x: number, y: number) {
    if (!this.scene || !this.scene.tweens || !this.scene.textures) return;
    if (this.scene.textures.exists("fx-dash-dust")) {
      const dust = this.scene.add
        .sprite(x, y, "fx-dash-dust")
        .setDepth(this.rig.depth - 1)
        .setScale(0.8);

      this.scene.tweens.add({
        targets: dust,
        x: dust.x - 35,
        y: dust.y - 8,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 350,
        ease: "Quad.Out",
        onComplete: () => {
          dust.destroy();
        },
      });
    }
  }

  public followLane(laneIndex: number) {
    if (this.currentLane === laneIndex || !this.rig || !this.rig.scene) return;
    this.currentLane = laneIndex;

    this.spawnDashDust(this.rig.x - 15, this.rig.y + 10);

    const targetY = getLaneY(laneIndex);
    const targetScale = getLaneScale(laneIndex);

    this.rig.motion.setLaneY(targetY);
    this.rig.setDepth(this.currentLane + 9);

    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.rig,
        scaleX: targetScale,
        scaleY: targetScale,
        duration: 260,
        ease: "Quad.Out",
      });
    }
  }

  public attack(type: "slap" | "punch" | "kick" | "throw") {
    if (!this.scene || !this.rig || !this.rig.scene) return;
    if (type === "kick") {
      this.spawnDashDust(this.rig.x - 10, this.rig.y + 12);
    }
    this.rig.triggerAttack(type);
  }

  public stumble() {
    if (!this.scene || !this.scene.tweens || !this.rig || !this.rig.scene) return;
    this.scene.tweens.add({
      targets: this.rig,
      rotation: 0.18,
      duration: 100,
      yoyo: true,
      repeat: 1,
      ease: "Quad.InOut",
      onComplete: () => {
        if (this.rig && this.rig.scene) {
          this.rig.rotation = 0;
        }
      },
    });
  }

  public update(time: number, delta: number) {
    this.rig.update(time, delta);
  }
}
