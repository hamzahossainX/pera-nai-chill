import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { getLaneY, getLaneScale, getLaneCount } from "@/config/layout";
import { rng } from "@/lib/rng";
import { VILLAINS } from "@/config/villains";
import { OUTFITS } from "@/config/outfits";
import { useGameStore } from "@/store/useGameStore";
import type { ObstacleType } from "./Obstacle";

export class Villain {
  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public archetype: (typeof VILLAINS)[number];
  public currentLane = 1; // 0, 1, or 2 (middle lane default)
  public isDead = false;
  public isDodging = false;
  public hasShield = false;
  private laneChangeTimer = 0;
  private counterMoveTimer = 0;
  public isBossPhase2 = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const initialY = getLaneY(this.currentLane);
    const initialScale = getLaneScale(this.currentLane);

    const villainConfig =
      VILLAINS.find((v) => v.id === useGameStore.getState().villainId) ||
      VILLAINS[0];

    this.archetype = villainConfig;
    if (villainConfig.id === "manholeChor") {
      this.hasShield = true;
    }

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
    if (laneIndex < 0 || laneIndex >= getLaneCount() || !this.rig || !this.rig.scene) return;
    this.currentLane = laneIndex;

    const targetY = getLaneY(laneIndex);
    const targetScale = getLaneScale(laneIndex);

    this.rig.motion.setLaneY(targetY);
    this.rig.setDepth(this.currentLane + 10);

    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.rig,
        scaleX: targetScale,
        scaleY: targetScale,
        duration: 220,
        ease: "Quad.Out",
      });
    }
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
    if (this.isVaulting || !this.rig || !this.rig.scene) return;
    this.isVaulting = true;

    this.rig.motion.vault(50, 400, () => {
      if (this.rig && this.rig.scene) {
        this.rig.rotation = 0;
      }
      this.isVaulting = false;
    });

    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.rig,
        rotation: -0.25,
        duration: 200,
        yoyo: true,
        ease: "Quad.Out",
      });
    }
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

  public dodge(onComplete?: () => void) {
    if (this.isDodging || this.isDead || !this.rig || !this.rig.scene) return;
    this.isDodging = true;

    // Quick side-step roll / wiggle animation (150ms telegraph + recovery)
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.rig,
        rotation: -0.22,
        duration: 90,
        yoyo: true,
        ease: "Quad.Out",
        onComplete: () => {
          this.isDodging = false;
          if (this.rig && this.rig.scene) {
            this.rig.rotation = 0;
          }
          onComplete?.();
        },
      });
    } else {
      this.isDodging = false;
      onComplete?.();
    }
  }

  public executeCounterMove(spawnObstacleFn?: (lane: number, type: ObstacleType, x?: number) => void) {
    if (this.isDead || !this.rig || !this.rig.scene || this.rig.stateName !== "RUN") return;

    switch (this.archetype.id) {
      case "phoneSnatcher": {
        // Zig-zag: switches lane immediately + dodge burst
        const nextLane = this.currentLane === 1 ? (rng.chance(0.5) ? 0 : 2) : 1;
        this.setLane(nextLane);
        this.dodge();
        break;
      }
      case "pickpocket": {
        // Drops fake wallet bait
        spawnObstacleFn?.(this.currentLane, "fake-wallet", this.rig.x - 50);
        break;
      }
      case "cableChor": {
        // Swings wire coil hazard in his lane
        spawnObstacleFn?.(this.currentLane, "wire-coil", this.rig.x - 40);
        break;
      }
      case "manholeChor": {
        // Raises manhole cover as shield (blocks next projectile)
        this.hasShield = true;
        if (this.scene && this.scene.tweens) {
          this.scene.tweens.add({
            targets: this.rig,
            scaleY: this.rig.scaleY * 1.15,
            duration: 120,
            yoyo: true,
          });
        }
        break;
      }
      case "eidMarketChor": {
        // Tosses shopping bags that slow the chaser
        spawnObstacleFn?.(this.currentLane, "shopping-bag", this.rig.x - 60);
        break;
      }
      case "chickenChor": {
        // Chicken flies out
        this.dodge();
        break;
      }
      case "chorSardar": {
        // Boss summons goon / barricade hazard
        const goonLane = this.currentLane === 0 ? 1 : 0;
        spawnObstacleFn?.(goonLane, "barricade", this.rig.x - 40);
        break;
      }
    }
  }

  public die(onComplete?: () => void) {
    this.isDead = true;
    if (this.rig && this.rig.scene) {
      this.rig.triggerDead(onComplete);
    }
  }

  public update(time: number, delta: number, spawnObstacleFn?: (lane: number, type: ObstacleType, x?: number) => void) {
    this.rig.update(time, delta);

    // 1. AI Lane Dodging: changes lane every 4 to 8 seconds (faster in boss phase 2)
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

    // 2. Archetype Counter-Move: executes signature counter-move every 6 to 9 seconds
    this.counterMoveTimer += delta;
    const counterThreshold = this.isBossPhase2 ? 5000 : 7500;
    if (this.counterMoveTimer > counterThreshold) {
      this.counterMoveTimer = 0;
      this.executeCounterMove(spawnObstacleFn);
    }
  }
}
