/**
 * Single owner of entity positions (x, y) per GAME_PLAN_V2 §4.4 and ARCHITECTURE_PATTERNS A8.
 * Channels:
 *  - homeX: base screen position (e.g. 320 for chaser, 880 for villain)
 *  - offsetX: spring-back physics offset for knockback, recoil, dash
 *  - laneY: smooth lane position
 *  - jumpY: vertical parabolic arc for jumps, vaults, trips
 *  - clamp: strictly enforces x in [minX, maxX] (default [60, 1220])
 */

export interface EntityMotionConfig {
  homeX: number;
  homeY: number;
  minX?: number;
  maxX?: number;
  omega?: number; // Natural frequency for spring (default 18)
  zeta?: number; // Damping ratio (default 0.92)
}

export interface Positionable {
  x: number;
  y: number;
  setPosition?(x: number, y: number): void;
}

export class EntityMotion {
  public homeX: number;
  public offsetX = 0;
  public velocityX = 0;

  public laneY: number;
  public targetLaneY: number;
  public laneTransitionSpeed = 14;

  public jumpY = 0;
  public extraY = 0;
  private jumpHeight = 0;
  private jumpDuration = 0;
  private jumpElapsed = 0;
  private isJumping = false;
  private onJumpComplete?: () => void;

  public minX: number;
  public maxX: number;

  public omega: number;
  public zeta: number;

  public x: number;
  public y: number;

  constructor(config: EntityMotionConfig) {
    this.homeX = config.homeX;
    this.laneY = config.homeY;
    this.targetLaneY = config.homeY;
    this.minX = config.minX ?? 60;
    this.maxX = config.maxX ?? 1220;
    this.omega = config.omega ?? 18;
    this.zeta = config.zeta ?? 0.92;

    this.x = this.homeX;
    this.y = this.laneY;
    this.computePosition();
  }

  public applyImpulse(impulse: number): void {
    this.offsetX += impulse;
    this.clamp();
  }

  public setHomeX(x: number): void {
    this.homeX = x;
    this.clamp();
  }

  public setLaneY(y: number, instant: boolean = false): void {
    this.targetLaneY = y;
    if (instant) {
      this.laneY = y;
      this.computePosition();
    }
  }

  public vault(height: number = 55, durationMs: number = 400, onComplete?: () => void): void {
    this.jump(height, durationMs, onComplete);
  }

  public jump(height: number = 60, durationMs: number = 400, onComplete?: () => void): void {
    this.isJumping = true;
    this.jumpHeight = height;
    this.jumpDuration = Math.max(50, durationMs);
    this.jumpElapsed = 0;
    this.onJumpComplete = onComplete;
  }

  public clamp(): void {
    const rawX = this.homeX + this.offsetX;
    if (rawX < this.minX) {
      this.offsetX = this.minX - this.homeX;
      if (this.velocityX < 0) this.velocityX = 0;
    } else if (rawX > this.maxX) {
      this.offsetX = this.maxX - this.homeX;
      if (this.velocityX > 0) this.velocityX = 0;
    }
  }

  public update(deltaMs: number): void {
    const dt = Math.max(0.001, Math.min(deltaMs * 0.001, 0.1));

    // 1. Damped harmonic oscillator for offsetX (sub-stepped for numerical stability)
    const subSteps = 4;
    const subDt = dt / subSteps;
    for (let i = 0; i < subSteps; i++) {
      const springForce = -this.omega * this.omega * this.offsetX;
      const dampingForce = -2 * this.zeta * this.omega * this.velocityX;
      const accel = springForce + dampingForce;
      this.velocityX += accel * subDt;
      this.offsetX += this.velocityX * subDt;
    }

    if (Math.abs(this.offsetX) < 0.001 && Math.abs(this.velocityX) < 0.01) {
      this.offsetX = 0;
      this.velocityX = 0;
    }

    this.clamp();

    // 2. Smooth lane Y transition (exponential lerp)
    if (Math.abs(this.laneY - this.targetLaneY) > 0.1) {
      const factor = 1 - Math.exp(-this.laneTransitionSpeed * dt);
      this.laneY += (this.targetLaneY - this.laneY) * factor;
    } else {
      this.laneY = this.targetLaneY;
    }

    // 3. Jump / Vault vertical arc
    if (this.isJumping) {
      this.jumpElapsed += deltaMs;
      const progress = Math.min(1, this.jumpElapsed / this.jumpDuration);
      // Normalized parabolic arc: 4 * h * p * (1 - p)
      this.jumpY = -4 * this.jumpHeight * progress * (1 - progress);

      if (progress >= 1) {
        this.isJumping = false;
        this.jumpY = 0;
        if (this.onJumpComplete) {
          const cb = this.onJumpComplete;
          this.onJumpComplete = undefined;
          cb();
        }
      }
    }

    this.computePosition();
  }

  private computePosition(): void {
    this.x = Math.max(this.minX, Math.min(this.maxX, this.homeX + this.offsetX));
    this.y = this.laneY + this.jumpY + this.extraY;
  }

  public applyTo(target: Positionable): void {
    this.computePosition();
    target.x = this.x;
    target.y = this.y;
  }
}
