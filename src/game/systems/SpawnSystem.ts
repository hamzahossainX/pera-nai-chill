import Phaser from "phaser";
import { Obstacle, ObstacleType } from "@/game/entities/Obstacle";
import { Villain } from "@/game/entities/Villain";
import { FxSystem } from "@/game/systems/FxSystem";
import { BALANCE } from "@/config/balance";
import { audioService } from "@/services/audio";

export class SpawnSystem {
  private scene: Phaser.Scene;
  private villain: Villain;
  private fxSystem: FxSystem;

  private pool: Obstacle[] = [];
  private poolSize = 10;
  private spawnTimer = 0;
  public isStrikeActive = false;

  constructor(scene: Phaser.Scene, villain: Villain, fxSystem: FxSystem) {
    this.scene = scene;
    this.villain = villain;
    this.fxSystem = fxSystem;

    // Pre-allocate pool
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new Obstacle(scene));
    }
  }

  public setStrikeActive(active: boolean) {
    this.isStrikeActive = active;
    if (!active) {
      this.clearAll();
    }
  }

  public clearAll() {
    for (const obs of this.pool) {
      if (obs.isActiveInWorld) {
        obs.deactivate();
      }
    }
  }

  public spawnObstacle(lane?: number, type?: ObstacleType) {
    const free = this.pool.find((o) => !o.isActiveInWorld);
    if (!free) return;

    const chosenLane = lane ?? Math.floor(Math.random() * 3);
    const types: ObstacleType[] = [
      "barricade",
      "tire-fire",
      "brick",
      "crowd",
      "rickshaw",
    ];
    const chosenType =
      type ?? types[Math.floor(Math.random() * types.length)];

    free.spawn(chosenLane, chosenType);
  }

  public update(_time: number, delta: number, speed: number = BALANCE.BASE_RUN_SPEED) {
    // 1. Spawning during Strike event
    if (this.isStrikeActive) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= 2200) {
        this.spawnTimer = 0;
        this.spawnObstacle();
      }
    }

    // 2. Update active obstacles & check collisions with Villain
    for (const obs of this.pool) {
      if (!obs.isActiveInWorld) continue;

      obs.update(_time, delta, speed);

      // Check collision with villain in same lane
      if (
        obs.lane === this.villain.currentLane &&
        Math.abs(obs.x - this.villain.rig.x) < 45
      ) {
        // Villain trips over the barricade/tire!
        this.villain.trip(1800);
        this.fxSystem.triggerHitStop(60);
        this.fxSystem.spawnFloatingText(
          this.villain.rig.x,
          this.villain.rig.y - 100,
          "আছাড়! (TRIPPED!)",
          "#f43f5e",
          "30px"
        );
        audioService.play("sfx-punch");

        obs.deactivate();
      }
    }
  }
}
