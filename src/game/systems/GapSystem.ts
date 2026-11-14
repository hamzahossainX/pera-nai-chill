import type Phaser from "phaser";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { BALANCE } from "@/config/balance";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";

export type GapZone = "CLOSE" | "MID" | "FAR" | "ESCAPE";

export interface GapSystemConfig {
  closeMax?: number;
  midMax?: number;
  escapeThreshold?: number;
  escapeDurationMs?: number;
  farPatienceDrainPerSec?: number;
  arenaMinX?: number;
  arenaMaxX?: number;
  arenaMidX?: number;
}

export class GapSystem {
  public scene: Phaser.Scene;
  public villain: Villain;
  public chaser: Chaser;

  public currentGap = 560;
  public currentZone: GapZone = "MID";

  public readonly CLOSE_MAX: number;
  public readonly MID_MAX: number;
  public readonly ESCAPE_THRESHOLD: number;
  public readonly ESCAPE_DURATION_MS: number;
  public readonly FAR_PATIENCE_DRAIN_PER_SEC: number;
  public readonly ARENA_MIN_X: number;
  public readonly ARENA_MAX_X: number;
  public readonly ARENA_MID_X: number;

  private escapeTimerMs = 0;
  private farPatienceAccumulatorMs = 0;
  private isDestroyed = false;

  constructor(
    scene: Phaser.Scene,
    villain: Villain,
    chaser: Chaser,
    config?: GapSystemConfig
  ) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;

    this.CLOSE_MAX = config?.closeMax ?? 220;
    this.MID_MAX = config?.midMax ?? 560;
    this.ESCAPE_THRESHOLD = config?.escapeThreshold ?? 900;
    this.ESCAPE_DURATION_MS = config?.escapeDurationMs ?? 6000;
    this.FAR_PATIENCE_DRAIN_PER_SEC = config?.farPatienceDrainPerSec ?? 1.5;
    this.ARENA_MIN_X = config?.arenaMinX ?? 120;
    this.ARENA_MAX_X = config?.arenaMaxX ?? 1160;
    this.ARENA_MID_X = config?.arenaMidX ?? 590;

    this.updateZone();
    useGameStore.getState().setGap(Math.round(this.currentGap), this.currentZone);
  }

  public getGap(): number {
    return Math.round(this.currentGap);
  }

  public getZone(): GapZone {
    return this.currentZone;
  }

  public isMeleeInRange(): boolean {
    const isWithinGap = this.currentGap <= this.CLOSE_MAX;
    const laneDiff = Math.abs(this.chaser.currentLane - this.villain.currentLane);
    return isWithinGap && laneDiff <= 1;
  }

  public reduceGap(amount: number): void {
    this.currentGap = Math.max(120, this.currentGap - amount);
    this.applyPositions();
    this.updateZone();
  }

  public widenGap(amount: number): void {
    this.currentGap = Math.min(1000, this.currentGap + amount);
    this.applyPositions();
    this.updateZone();
  }

  public setGap(gap: number): void {
    this.currentGap = Math.max(60, Math.min(1100, gap));
    this.applyPositions();
    this.updateZone();
  }

  public slowChaser(mult: number, durationSec: number): void {
    useGameStore.getState().slowChaser(mult, durationSec);
  }

  private applyPositions(): void {
    if (!this.chaser?.rig?.motion || !this.villain?.rig?.motion) return;
    const halfGap = this.currentGap / 2;
    const chaserHome = Math.max(this.ARENA_MIN_X, this.ARENA_MID_X - halfGap);
    const villainHome = Math.min(this.ARENA_MAX_X, this.ARENA_MID_X + halfGap);

    this.chaser.rig.motion.setHomeX(chaserHome);
    this.villain.rig.motion.setHomeX(villainHome);
  }

  private updateZone(): void {
    let zone: GapZone;
    if (this.currentGap < this.CLOSE_MAX) {
      zone = "CLOSE";
    } else if (this.currentGap <= this.MID_MAX) {
      zone = "MID";
    } else if (this.currentGap < this.ESCAPE_THRESHOLD) {
      zone = "FAR";
    } else {
      zone = "ESCAPE";
    }

    if (zone !== this.currentZone) {
      this.currentZone = zone;
      gameBus.emit("gap:zoneChange", { zone, gap: Math.round(this.currentGap) });
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isDestroyed) return;
    const store = useGameStore.getState();
    if (store.screen !== "PLAYING") return;

    // 1. Calculate relative speed differential
    const baseSpeed = BALANCE.BASE_RUN_SPEED;
    const villainSpeedMult = this.villain?.archetype?.speedMultiplier ?? 1.1;
    const isVillainStunnedOrDead =
      this.villain.isDead ||
      (this.villain.rig &&
        (this.villain.rig.stateName === "HIT_STUN" ||
          this.villain.rig.stateName === "TRIPPED" ||
          this.villain.rig.stateName === "DEAD"));
    const effectiveVillainSpeed = isVillainStunnedOrDead
      ? 0
      : baseSpeed * villainSpeedMult;
    const effectiveChaserSpeed = baseSpeed * store.chaserSpeedMultiplier;

    // Speed differential: villain fleeing pulls ahead if faster, chaser closes if faster
    const dtSec = delta / 1000;
    const speedDelta = effectiveVillainSpeed - effectiveChaserSpeed;
    this.currentGap = Math.max(100, Math.min(1000, this.currentGap + speedDelta * dtSec));

    // 2. Adjust entity home positions within the fixed arena window
    this.applyPositions();

    // 3. Update zone classification
    this.updateZone();

    // Sync to store if zone changed or gap changed significantly (every ~5px)
    if (this.currentZone !== store.gapZone || Math.abs(store.gap - this.currentGap) >= 5) {
      store.setGap(Math.round(this.currentGap), this.currentZone);
    }

    // 4. Escape timer check (ESCAPED if gap >= ESCAPE_THRESHOLD for ESCAPE_DURATION_MS)
    if (this.currentGap >= this.ESCAPE_THRESHOLD) {
      this.escapeTimerMs += delta;
      if (this.escapeTimerMs >= this.ESCAPE_DURATION_MS) {
        store.triggerLose("escaped");
        return;
      }
    } else {
      this.escapeTimerMs = Math.max(0, this.escapeTimerMs - delta * 0.5);
    }

    // 5. Far patience drain (slowly drains while in FAR or ESCAPE zone)
    if (this.currentZone === "FAR" || this.currentZone === "ESCAPE") {
      this.farPatienceAccumulatorMs += delta;
      if (this.farPatienceAccumulatorMs >= 1000) {
        this.farPatienceAccumulatorMs -= 1000;
        store.drainPatience(this.FAR_PATIENCE_DRAIN_PER_SEC);
      }
    } else {
      this.farPatienceAccumulatorMs = 0;
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
  }
}
