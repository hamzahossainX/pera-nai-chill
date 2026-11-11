import Phaser from "phaser";

export interface SpringNode {
  target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container;
  baseX: number;
  baseY: number;
  baseRotation: number;
  stiffness: number; // e.g. 0.15
  damping: number; // e.g. 0.85
  vx: number;
  vy: number;
  vRot: number;
  offsetX: number;
  offsetY: number;
  offsetRot: number;
  oscillationFreq?: number;
  oscillationAmp?: number;
}

export class SecondaryMotion {
  private springs: SpringNode[] = [];

  public register(
    target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container,
    options?: {
      stiffness?: number;
      damping?: number;
      oscillationFreq?: number;
      oscillationAmp?: number;
    }
  ): SpringNode {
    const node: SpringNode = {
      target,
      baseX: target.x,
      baseY: target.y,
      baseRotation: target.rotation,
      stiffness: options?.stiffness ?? 0.18,
      damping: options?.damping ?? 0.82,
      vx: 0,
      vy: 0,
      vRot: 0,
      offsetX: 0,
      offsetY: 0,
      offsetRot: 0,
      oscillationFreq: options?.oscillationFreq ?? 8,
      oscillationAmp: options?.oscillationAmp ?? 0.12,
    };
    this.springs.push(node);
    return node;
  }

  public applyImpulse(xImpulse: number, yImpulse: number, rotImpulse: number = 0) {
    for (const s of this.springs) {
      s.vx += xImpulse;
      s.vy += yImpulse;
      s.vRot += rotImpulse;
    }
  }

  public update(time: number, delta: number, parentVelocityX: number = 0) {
    const dt = Math.min(delta / 1000, 0.05); // cap delta

    for (const s of this.springs) {
      if (!s.target || !s.target.active) continue;

      // Wind & velocity force pushing backwards
      const targetOffsetX = -parentVelocityX * 0.04;
      const t = time * 0.001;

      // Flutter oscillation (wind flutter / running bounce)
      const flutter =
        s.oscillationAmp && s.oscillationFreq
          ? Math.sin(t * s.oscillationFreq) * s.oscillationAmp
          : 0;

      // Spring physics on rotation
      const targetRot = flutter;
      const axRot = -s.stiffness * 20 * (s.offsetRot - targetRot) - s.damping * 6 * s.vRot;
      s.vRot += axRot * dt;
      s.offsetRot += s.vRot * dt;

      // Spring physics on Y
      const bounceY = Math.abs(Math.sin(t * (s.oscillationFreq ?? 8))) * 4;
      const targetOffsetY = bounceY;
      const ay = -s.stiffness * 25 * (s.offsetY - targetOffsetY) - s.damping * 6 * s.vy;
      s.vy += ay * dt;
      s.offsetY += s.vy * dt;

      // Apply to target
      s.target.x = s.baseX + targetOffsetX;
      s.target.y = s.baseY + s.offsetY;
      s.target.rotation = s.baseRotation + s.offsetRot;
    }
  }

  public clear() {
    this.springs = [];
  }
}
