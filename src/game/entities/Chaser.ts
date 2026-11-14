import Phaser from "phaser";
import { CharacterRig } from "./CharacterRig";
import { getLaneY, getLaneScale, getLaneCount } from "@/config/layout";
import { OUTFITS } from "@/config/outfits";
import { useGameStore } from "@/store/useGameStore";

export class Chaser {
  public static readonly DASH_COOLDOWN_MS = 2500;
  public static readonly DASH_STAMINA_COST = 25;
  public static readonly JUMP_DURATION_MS = 520;
  public static readonly LANE_TRANSITION_MS = 140;

  public scene: Phaser.Scene;
  public rig: CharacterRig;
  public currentLane = 1;
  public isJumping = false;
  public isDashing = false;
  public dashCooldownTimer = 0;

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

  public setLane(laneIndex: number): boolean {
    const clamped = Math.max(0, Math.min(getLaneCount() - 1, laneIndex));
    if (clamped === this.currentLane || !this.rig || !this.rig.scene) return false;

    this.currentLane = clamped;
    this.spawnDashDust(this.rig.x - 15, this.rig.y + 10);

    const targetY = getLaneY(clamped);
    const targetScale = getLaneScale(clamped);

    this.rig.motion.setLaneY(targetY);
    this.rig.setDepth(this.currentLane + 9);

    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.rig,
        scaleX: targetScale,
        scaleY: targetScale,
        duration: Chaser.LANE_TRANSITION_MS,
        ease: "Quad.Out",
      });
    }
    return true;
  }

  public laneUp(): boolean {
    return this.setLane(this.currentLane - 1);
  }

  public laneDown(): boolean {
    return this.setLane(this.currentLane + 1);
  }

  public jump(height: number = 60, durationMs: number = Chaser.JUMP_DURATION_MS): boolean {
    if (this.isJumping || !this.rig || !this.rig.scene) return false;
    this.isJumping = true;
    this.spawnDashDust(this.rig.x - 10, this.rig.y + 12);

    this.rig.motion.jump(height, durationMs, () => {
      this.isJumping = false;
    });
    return true;
  }

  public dash(): boolean {
    if (this.dashCooldownTimer > 0 || !this.rig || !this.rig.scene) return false;
    const store = useGameStore.getState();
    if (store.stamina < Chaser.DASH_STAMINA_COST) return false;

    store.setStamina(store.stamina - Chaser.DASH_STAMINA_COST);
    this.dashCooldownTimer = Chaser.DASH_COOLDOWN_MS;
    this.isDashing = true;
    this.spawnDashDust(this.rig.x - 20, this.rig.y + 10);

    // Speed burst / impulse closing gap
    this.rig.motion.applyImpulse(90);

    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(450, () => {
        this.isDashing = false;
      });
    } else {
      this.isDashing = false;
    }
    return true;
  }

  public followLane(laneIndex: number) {
    this.setLane(laneIndex);
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
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - delta);
    }
    this.rig.update(time, delta);
  }
}
