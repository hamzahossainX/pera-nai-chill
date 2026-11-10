import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { BALANCE } from "@/config/balance";
import { VILLAINS } from "@/config/villains";
import { useGameStore } from "@/store/useGameStore";

export class Villain {
  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public currentLane = 1; // 0, 1, or 2 (middle lane default)
  private laneChangeTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const initialY = BALANCE.LANES_Y[this.currentLane];
    const initialScale = BALANCE.LANE_SCALES[this.currentLane];

    const villainConfig =
      VILLAINS.find((v) => v.id === useGameStore.getState().villainId) ||
      VILLAINS[0];

    this.rig = new CharacterRig({
      scene,
      x: 880,
      y: initialY,
      isSilhouette: false,
      faceKey: "target-face",
      outfitColor: villainConfig.outfitColor,
      pantColor: villainConfig.pantColor,
      scale: initialScale,
    });

    this.rig.setDepth(this.currentLane + 10);
  }

  public setLane(laneIndex: number) {
    if (laneIndex < 0 || laneIndex >= BALANCE.LANES_Y.length) return;
    this.currentLane = laneIndex;

    const targetY = BALANCE.LANES_Y[laneIndex];
    const targetScale = BALANCE.LANE_SCALES[laneIndex];

    this.scene.tweens.add({
      targets: this.rig,
      y: targetY,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 220,
      ease: "Quad.Out",
      onUpdate: () => {
        this.rig.setDepth(this.currentLane + 10);
      },
    });
  }

  public hit(damage: number, knockback: number = 35, isCrit: boolean = false) {
    this.rig.triggerHitStun(knockback, isCrit);
  }

  public trip(durationMs: number = 1600) {
    this.rig.triggerTrip(durationMs);
  }

  public die(onComplete?: () => void) {
    this.rig.triggerDead(onComplete);
  }

  public update(time: number, delta: number) {
    this.rig.update(time, delta);

    // AI Lane Dodging: changes lane every 4 to 8 seconds
    this.laneChangeTimer += delta;
    if (this.laneChangeTimer > 4500) {
      this.laneChangeTimer = 0;
      if (Math.random() < 0.6) {
        const nextLane =
          this.currentLane === 0
            ? 1
            : this.currentLane === 2
            ? 1
            : Math.random() < 0.5
            ? 0
            : 2;
        this.setLane(nextLane);
      }
    }
  }
}
