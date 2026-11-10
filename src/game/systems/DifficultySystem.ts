import { BALANCE } from "@/config/balance";

export class DifficultySystem {
  private elapsedSeconds = 0;

  public reset() {
    this.elapsedSeconds = 0;
  }

  public update(_time: number, delta: number) {
    this.elapsedSeconds += delta * 0.001;
  }

  public getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  /**
   * Ramps base road speed from 320 px/s to 480 px/s over 120 seconds (2 minutes).
   */
  public getCurrentSpeed(): number {
    const rampRatio = Math.min(1.0, this.elapsedSeconds / 120);
    return BALANCE.BASE_RUN_SPEED + rampRatio * 160;
  }

  /**
   * Scales villain dodge frequency and obstacle spawns as the run goes longer.
   */
  public getDifficultyMultiplier(): number {
    const ramp = Math.min(1.0, this.elapsedSeconds / 120);
    return 1.0 + ramp * 0.5; // 1.0x -> 1.5x
  }
}
