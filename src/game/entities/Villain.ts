import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { BALANCE } from "@/config/balance";
import { VILLAINS } from "@/config/villains";
import { OUTFITS } from "@/config/outfits";
import { useGameStore } from "@/store/useGameStore";

export class Villain {
  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public archetype: (typeof VILLAINS)[number];
  public currentLane = 1; // 0, 1, or 2 (middle lane default)
  private laneChangeTimer = 0;
  private isBossPhase2 = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const initialY = BALANCE.LANES_Y[this.currentLane];
    const initialScale = BALANCE.LANE_SCALES[this.currentLane];

    const villainConfig =
      VILLAINS.find((v) => v.id === useGameStore.getState().villainId) ||
      VILLAINS[0];

    this.archetype = villainConfig;

    const outfit = OUTFITS[villainConfig.outfitId] || OUTFITS.phoneSnatcher;

    this.rig = new CharacterRig({
      scene,
      x: 880,
      y: initialY,
      isSilhouette: false,
      faceKey: "target-face",
      outfit,
      archetype: villainConfig,
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

    // Update HP percent for mask-slip progression
    const store = useGameStore.getState();
    const remainingHp = Math.max(0, store.villainHp - damage);
    const maxHp = Math.max(1, store.villainMaxHp);
    const healthPercent = remainingHp / maxHp;
    this.rig.updateHealth(healthPercent);

    // Boss Phase 2 Check (Chor-er Sardar enters phase 2 below 50% HP)
    if (this.archetype.id === "chorSardar" && healthPercent <= 0.5 && !this.isBossPhase2) {
      this.isBossPhase2 = true;
      this.scene.cameras.main.shake(200, 0.008);
      // Spawn sweat drops
      if (this.scene.textures.exists("fx-splash")) {
        const sweat = this.scene.add
          .sprite(this.rig.x - 10, this.rig.y - 120, "fx-splash")
          .setDepth(this.rig.depth + 1)
          .setScale(0.8);
        this.scene.tweens.add({
          targets: sweat,
          y: sweat.y - 20,
          alpha: 0,
          duration: 400,
          onComplete: () => sweat.destroy(),
        });
      }
    }
  }

  public trip(durationMs: number = 1600) {
    this.rig.triggerTrip(durationMs);
  }

  public isVaulting = false;
  public isHiding = false;

  public vault() {
    if (this.isVaulting) return;
    this.isVaulting = true;
    const currentY = this.rig.y;

    this.scene.tweens.add({
      targets: this.rig,
      y: currentY - 50,
      rotation: -0.25,
      duration: 200,
      yoyo: true,
      ease: "Quad.Out",
      onComplete: () => {
        this.rig.rotation = 0;
        this.rig.y = currentY;
        this.isVaulting = false;
      },
    });
  }

  public hideBehindVehicle() {
    if (this.isHiding) return;
    this.isHiding = true;

    this.scene.tweens.add({
      targets: this.rig,
      scaleY: this.rig.scaleY * 0.8,
      alpha: 0.65,
      duration: 300,
      yoyo: true,
      hold: 800,
      onComplete: () => {
        this.isHiding = false;
      },
    });
  }

  public die(onComplete?: () => void) {
    this.rig.triggerDead(onComplete);
  }

  public update(time: number, delta: number) {
    this.rig.update(time, delta);

    // AI Lane Dodging: changes lane every 4 to 8 seconds (faster in boss phase 2)
    this.laneChangeTimer += delta;
    const threshold = this.isBossPhase2 ? 2200 : 4500;
    if (this.laneChangeTimer > threshold) {
      this.laneChangeTimer = 0;
      if (Math.random() < (this.isBossPhase2 ? 0.8 : 0.6)) {
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
