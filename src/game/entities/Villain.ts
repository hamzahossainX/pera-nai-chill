import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { getLaneY, getLaneScale, getLaneCount } from "@/config/layout";
import { rng } from "@/lib/rng";
import { VILLAINS } from "@/config/villains";
import { OUTFITS } from "@/config/outfits";
import { useGameStore } from "@/store/useGameStore";

export class Villain {
  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public archetype: (typeof VILLAINS)[number];
  public currentLane = 1; // 0, 1, or 2 (middle lane default)
  public isDead = false;
  private laneChangeTimer = 0;
  private isBossPhase2 = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const initialY = getLaneY(this.currentLane);
    const initialScale = getLaneScale(this.currentLane);

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
    if (laneIndex < 0 || laneIndex >= getLaneCount() || !this.scene || !this.scene.tweens || !this.rig || !this.rig.scene) return;
    this.currentLane = laneIndex;

    const targetY = getLaneY(laneIndex);
    const targetScale = getLaneScale(laneIndex);

    this.scene.tweens.add({
      targets: this.rig,
      y: targetY,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 220,
      ease: "Quad.Out",
      onUpdate: () => {
        if (this.rig && this.rig.scene) {
          this.rig.setDepth(this.currentLane + 10);
        }
      },
    });
  }

  public hit(damage: number, knockback: number = 35, isCrit: boolean = false) {
    if (!this.rig || !this.rig.scene) return;
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
      if (this.scene && this.scene.cameras) {
        this.scene.cameras.main.shake(200, 0.008);
      }
      // Spawn sweat drops
      if (this.scene && this.scene.textures && this.scene.textures.exists("fx-splash") && this.scene.tweens) {
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
    if (!this.rig || !this.rig.scene) return;
    this.rig.triggerTrip(durationMs);
  }

  public isVaulting = false;
  public isHiding = false;

  public vault() {
    if (this.isVaulting || !this.scene || !this.scene.tweens || !this.rig || !this.rig.scene) return;
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
        if (this.rig && this.rig.scene) {
          this.rig.rotation = 0;
          this.rig.y = currentY;
        }
        this.isVaulting = false;
      },
    });
  }

  public hideBehindVehicle() {
    if (this.isHiding || !this.scene || !this.scene.tweens || !this.rig || !this.rig.scene) return;
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
    this.isDead = true;
    if (this.rig && this.rig.scene) {
      this.rig.triggerDead(onComplete);
    }
  }

  public update(time: number, delta: number) {
    this.rig.update(time, delta);

    // AI Lane Dodging: changes lane every 4 to 8 seconds (faster in boss phase 2)
    this.laneChangeTimer += delta;
    const threshold = this.isBossPhase2 ? 2200 : 4500;
    if (this.laneChangeTimer > threshold) {
      this.laneChangeTimer = 0;
      if (rng.chance(this.isBossPhase2 ? 0.8 : 0.6)) {
        const nextLane =
          this.currentLane === 0
            ? 1
            : this.currentLane === 2
            ? 1
            : rng.chance(0.5)
            ? 0
            : 2;
        this.setLane(nextLane);
      }
    }
  }
}
