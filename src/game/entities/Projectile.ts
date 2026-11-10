import Phaser from "phaser";

export interface ProjectileOptions {
  scene: Phaser.Scene;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  texture: string;
  arcHeight?: number;
  duration?: number;
  spinRate?: number;
  onHit: (x: number, y: number) => void;
}

export class Projectile extends Phaser.GameObjects.Sprite {
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private arcHeight: number;
  private flightDuration: number;
  private spinRate: number;
  private elapsedTime = 0;
  private onHitCallback: (x: number, y: number) => void;

  constructor(options: ProjectileOptions) {
    super(options.scene, options.startX, options.startY, options.texture);
    this.startX = options.startX;
    this.startY = options.startY;
    this.targetX = options.targetX;
    this.targetY = options.targetY;
    this.arcHeight = options.arcHeight ?? 140;
    this.flightDuration = options.duration ?? 450; // ms
    this.spinRate = options.spinRate ?? 18; // rad/sec
    this.onHitCallback = options.onHit;

    options.scene.add.existing(this);
    this.setDepth(50);
  }

  public update(_time: number, delta: number) {
    this.elapsedTime += delta;
    const progress = Math.min(1.0, this.elapsedTime / this.flightDuration);

    // Parabolic Arc math
    const currentX = Phaser.Math.Linear(this.startX, this.targetX, progress);
    const linearY = Phaser.Math.Linear(this.startY, this.targetY, progress);
    const parabolaOffset = 4 * this.arcHeight * progress * (1 - progress);
    const currentY = linearY - parabolaOffset;

    this.setPosition(currentX, currentY);
    this.rotation += this.spinRate * (delta * 0.001);

    if (progress >= 1.0) {
      this.onHitCallback(this.targetX, this.targetY);
      this.destroy();
    }
  }
}
