import Phaser from "phaser";
import { Obstacle, ObstacleType } from "@/game/entities/Obstacle";
import { PickupItem, PickupType } from "@/game/entities/PickupItem";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { FxSystem } from "@/game/systems/FxSystem";
import { getLaneY } from "@/config/layout";
import { rng } from "@/lib/rng";
import { BALANCE } from "@/config/balance";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";

export class SpawnSystem {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser?: Chaser;
  private fxSystem: FxSystem;

  private pool: Obstacle[] = [];
  private poolSize = 10;
  private spawnTimer = 0;

  // Pickup pool
  private pickupPool: PickupItem[] = [];
  private pickupPoolSize = 6;
  private pickupTimer = 0;

  public isStrikeActive = false;

  constructor(scene: Phaser.Scene, villain: Villain, fxSystem: FxSystem, chaser?: Chaser) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;
    this.fxSystem = fxSystem;

    // Pre-allocate obstacle pool
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new Obstacle(scene));
    }

    // Pre-allocate pickup pool
    for (let i = 0; i < this.pickupPoolSize; i++) {
      this.pickupPool.push(new PickupItem(scene));
    }
  }

  public setChaser(chaser: Chaser) {
    this.chaser = chaser;
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
    for (const p of this.pickupPool) {
      if (p.isActiveInWorld) {
        p.deactivate();
      }
    }
  }

  public spawnObstacle(lane?: number, type?: ObstacleType) {
    const free = this.pool.find((o) => !o.isActiveInWorld);
    if (!free) return;

    const chosenLane = lane ?? rng.between(0, 2);
    const mapId = useGameStore.getState().currentMapId || "mirpur";

    // Scenario-based obstacle weighting
    let types: ObstacleType[];
    if (mapId === "mirpur") {
      types = ["pothole", "pothole", "barricade", "brick", "crowd"];
    } else if (mapId === "farmgate") {
      types = ["crowd", "crowd", "rickshaw", "rickshaw", "barricade"];
    } else {
      // New Market
      types = ["crowd", "rickshaw", "brick", "barricade", "pothole"];
    }

    const chosenType = type ?? rng.pick(types);
    free.spawn(chosenLane, chosenType);
  }

  public spawnPickup(lane?: number, type?: PickupType) {
    const free = this.pickupPool.find((p) => !p.isActiveInWorld);
    if (!free) return;

    const chosenLane = lane ?? rng.between(0, 2);
    const store = useGameStore.getState();

    // Context-sensitive pickup selection:
    // If pollution is active, prioritize daab & mask!
    const activeEvt = store.activeEvent;
    let pickupTypes: PickupType[];
    if (activeEvt?.type === "POLLUTION" || activeEvt?.type === "WATERLOGGING") {
      pickupTypes = ["daab", "mask", "daab", "biriyani", "taka"];
    } else {
      pickupTypes = ["daab", "biriyani", "cha", "taka", "mask"];
    }

    const chosenType = type ?? rng.pick(pickupTypes);
    free.spawn(chosenLane, chosenType);
  }

  public update(_time: number, delta: number, speed: number = BALANCE.BASE_RUN_SPEED) {
    // 1. Spawning obstacles during Strike or regular street hazards
    this.spawnTimer += delta;
    const obstacleInterval = this.isStrikeActive ? 2200 : 5000;
    if (this.spawnTimer >= obstacleInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    // 2. Spawning pickups every 4 seconds
    this.pickupTimer += delta;
    if (this.pickupTimer >= 4200) {
      this.pickupTimer = 0;
      this.spawnPickup();
    }

    // 3. Update active obstacles & check collisions with Villain
    for (const obs of this.pool) {
      if (!obs.isActiveInWorld) continue;

      obs.update(_time, delta, speed);

      // Villain AI interaction (Vault / Shove / Trip)
      if (obs.lane === this.villain.currentLane) {
        const dist = obs.x - this.villain.rig.x;
        // Obstacle approaching villain: 50% chance villain vaults
        if (dist > 35 && dist < 95 && !this.villain.isVaulting) {
          if (rng.chance(0.5)) {
            this.villain.vault();
          } else if (obs.obstacleType === "barricade" && rng.chance(0.3)) {
            // Villain shoves the barricade backwards!
            obs.x -= 80;
          }
        } else if (Math.abs(dist) < 40 && !this.villain.isVaulting) {
          // Villain trips over the barricade/tire/pothole!
          this.villain.trip(1800);
          this.fxSystem.triggerHitStop(60);
          this.fxSystem.spawnFloatingText(
            this.villain.rig.x,
            this.villain.rig.y - 100,
            obs.obstacleType === "pothole"
              ? "গর্তে আছাড়!"
              : "আছাড়! (TRIPPED!)",
            "#f43f5e",
            "30px"
          );
          audioService.play("sfx-punch");
          obs.deactivate();
        }
      }

      // Chaser interaction with obstacles (potholes/puddles stumble)
      if (
        this.chaser &&
        obs.lane === this.chaser.currentLane &&
        Math.abs(obs.x - this.chaser.rig.x) < 40
      ) {
        if (obs.obstacleType === "pothole") {
          this.chaser.stumble();
          const store = useGameStore.getState();
          store.setStamina(Math.max(0, store.stamina - 6));
          if (this.scene.textures.exists("fx-splash")) {
            const splash = this.scene.add
              .sprite(this.chaser.rig.x, this.chaser.rig.y, "fx-splash")
              .setDepth(this.chaser.rig.depth + 1);
            this.scene.tweens.add({
              targets: splash,
              alpha: 0,
              y: splash.y - 15,
              duration: 300,
              onComplete: () => splash.destroy(),
            });
          }
          obs.deactivate();
        }
      }
    }

    // 4. Update active pickups & check collection by Chaser or Villain
    const store = useGameStore.getState();
    const collectorX = this.chaser ? this.chaser.rig.x : 220;
    const collectorLane = this.chaser ? this.chaser.currentLane : this.villain.currentLane;

    for (const p of this.pickupPool) {
      if (!p.isActiveInWorld) continue;

      p.update(_time, delta, speed);

      // Check pickup collection
      if (
        p.lane === collectorLane &&
        Math.abs(p.x - collectorX) < 55
      ) {
        audioService.play("coin");

        if (p.pickupType === "daab") {
          store.inflictDamage(0); // ping
          store.addTaka(10);
          this.fxSystem.spawnFloatingText(
            collectorX + 40,
            getLaneY(p.lane) - 80,
            "আহা তাজা ডাব! চাঙ্গা!",
            "#22c55e",
            "24px"
          );
        } else if (p.pickupType === "mask") {
          store.setCounterBuff("N95 মাস্ক", 15);
          this.fxSystem.spawnFloatingText(
            collectorX + 40,
            getLaneY(p.lane) - 80,
            "এন৯৫ মাস্ক! ধোঁয়া গায়েব!",
            "#38bdf8",
            "24px"
          );
        } else if (p.pickupType === "biriyani") {
          store.addRage(20);
          this.fxSystem.spawnFloatingText(
            collectorX + 40,
            getLaneY(p.lane) - 80,
            "কাচ্চি বিরিয়ানি! ফুল পাওয়ার!",
            "#f59e0b",
            "24px"
          );
        } else if (p.pickupType === "cha") {
          store.setStamina(100);
          this.fxSystem.spawnFloatingText(
            collectorX + 40,
            getLaneY(p.lane) - 80,
            "টংয়ের দুধ চা! ফুল স্ট্যামিনা!",
            "#ea580c",
            "24px"
          );
        } else if (p.pickupType === "taka") {
          store.addTaka(50);
          this.fxSystem.spawnFloatingText(
            collectorX + 40,
            getLaneY(p.lane) - 80,
            "+৫০ ৳ টাকার ব্যাগ!",
            "#10b981",
            "26px"
          );
        }

        p.deactivate();
      }
    }
  }
}
