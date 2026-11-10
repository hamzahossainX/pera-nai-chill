import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { BALANCE } from "@/config/balance";

export class Chaser {
  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public currentLane = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const initialY = BALANCE.LANES_Y[this.currentLane];
    const initialScale = BALANCE.LANE_SCALES[this.currentLane];

    this.rig = new CharacterRig({
      scene,
      x: 320,
      y: initialY,
      isSilhouette: false,
      outfitColor: 0x059669, // Hero Green T-shirt
      pantColor: 0x1e3a8a, // Denim Jeans
      faceKey: "hero-face",
      scale: initialScale,
    });

    this.rig.setDepth(this.currentLane + 9);
  }

  public followLane(laneIndex: number) {
    if (this.currentLane === laneIndex) return;
    this.currentLane = laneIndex;

    const targetY = BALANCE.LANES_Y[laneIndex];
    const targetScale = BALANCE.LANE_SCALES[laneIndex];

    this.scene.tweens.add({
      targets: this.rig,
      y: targetY,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 260,
      ease: "Quad.Out",
      onUpdate: () => {
        this.rig.setDepth(this.currentLane + 9);
      },
    });
  }

  public attack(type: "slap" | "punch" | "kick" | "throw") {
    this.rig.triggerAttack(type);
  }

  public update(time: number, delta: number) {
    this.rig.update(time, delta);
  }
}
