import Phaser from "phaser";
import { BALANCE } from "@/config/balance";
import { useGameStore } from "@/store/useGameStore";
import { STREET_PROPS, StreetPropDefinition } from "@/config/props";
import { audioService } from "@/services/audio";
import { MAP_SCENARIOS, TimeOfDay } from "@/config/maps";

interface ActiveStreetObject {
  sprite: Phaser.GameObjects.Sprite;
  speedFactor: number;
}

export class ParallaxSystem {
  private scene: Phaser.Scene;
  private skyTile!: Phaser.GameObjects.TileSprite;
  private farBuildingsTile!: Phaser.GameObjects.TileSprite;
  private metroTrackTile!: Phaser.GameObjects.TileSprite;
  private metroTrainSprite!: Phaser.GameObjects.Sprite;
  private nearBuildingsTile!: Phaser.GameObjects.TileSprite;
  private roadTile!: Phaser.GameObjects.TileSprite;
  private wiresTile!: Phaser.GameObjects.TileSprite;

  // Animated Life: Flying Crow & Perched Crows
  private flyingCrow!: Phaser.GameObjects.Sprite;
  private perchedCrow1!: Phaser.GameObjects.Sprite;
  private perchedCrow2!: Phaser.GameObjects.Sprite;

  // Timers
  private metroCooldown = 12000; // ms
  private crowFlyCooldown = 15000; // ms
  private propSpawnTimer = 0;
  private vehicleSpawnTimer = 0;

  // Pooled Active Props & Vehicles
  private activeObjects: ActiveStreetObject[] = [];
  private propPool: Phaser.GameObjects.Sprite[] = [];

  public speedMultiplier = 1.0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initLayers();
  }

  private initLayers() {
    const W = BALANCE.LOGICAL_WIDTH;
    const mapId = useGameStore.getState().currentMapId || "mirpur";
    const mapScenario = MAP_SCENARIOS.find((m) => m.id === mapId);

    const skyKey = mapScenario?.skyKey || "bg-sky";
    const farKey = mapScenario?.farKey || "bg-far-buildings";
    const nearKey = mapScenario?.nearKey || "bg-near-buildings";
    const roadKey = mapScenario?.roadKey || "bg-road";

    // Layer 1: Sky (speed 0.1)
    this.skyTile = this.scene.add
      .tileSprite(0, 0, W, 500, this.scene.textures.exists(skyKey) ? skyKey : "bg-sky")
      .setOrigin(0, 0)
      .setDepth(0);

    // Layer 2: Far Skyline Silhouettes (speed 0.3)
    this.farBuildingsTile = this.scene.add
      .tileSprite(0, 140, W, 300, this.scene.textures.exists(farKey) ? farKey : "bg-far-buildings")
      .setOrigin(0, 0)
      .setDepth(1);

    // Layer 2.5: Elevated Metro Track
    if (mapScenario?.visualProfile !== "market" && this.scene.textures.exists("prop-metro-track")) {
      this.metroTrackTile = this.scene.add
        .tileSprite(0, 100, W, 50, "prop-metro-track")
        .setOrigin(0, 0)
        .setDepth(1.4);
    }

    // Metro Train MRT-6
    if (mapScenario?.visualProfile !== "market" && this.scene.textures.exists("prop-metro-train")) {
      this.metroTrainSprite = this.scene.add
        .sprite(W + 400, 112, "prop-metro-train")
        .setOrigin(0, 0.5)
        .setDepth(1.5);
    }

    // Layer 3: Near Buildings with colorful Dhaka signage (speed 0.6)
    this.nearBuildingsTile = this.scene.add
      .tileSprite(0, 110, W, 360, this.scene.textures.exists(nearKey) ? nearKey : "bg-near-buildings")
      .setOrigin(0, 0)
      .setDepth(2);

    // Layer 4: Asphalt Road (3 Lanes - speed 1.0)
    this.roadTile = this.scene.add
      .tileSprite(0, 350, W, 370, this.scene.textures.exists(roadKey) ? roadKey : "bg-road")
      .setOrigin(0, 0)
      .setDepth(3);

    // Layer 5: Overhead Entangled Cables
    this.wiresTile = this.scene.add
      .tileSprite(0, 0, W, 150, "bg-wires")
      .setOrigin(0, 0)
      .setDepth(100);

    // Apply time of day tint
    const timeOfDay = useGameStore.getState().timeOfDay || mapScenario?.defaultTimeOfDay || "noon";
    this.applyTimeOfDay(timeOfDay);

    // Animated Life: Crows on wires
    if (this.scene.textures.exists("anim-crow")) {
      this.perchedCrow1 = this.scene.add
        .sprite(320, 48, "anim-crow")
        .setDepth(101)
        .setScale(0.85);

      this.perchedCrow2 = this.scene.add
        .sprite(780, 72, "anim-crow")
        .setDepth(101)
        .setScale(0.75)
        .setFlipX(true);

      this.flyingCrow = this.scene.add
        .sprite(-100, -100, "anim-crow")
        .setDepth(102)
        .setVisible(false);
    }
  }

  private spawnStreetProp(def: StreetPropDefinition) {
    if (!this.scene.textures.exists(def.textureKey)) return;

    let sprite = this.propPool.pop();
    if (!sprite) {
      sprite = this.scene.add.sprite(0, 0, def.textureKey);
    } else {
      sprite.setTexture(def.textureKey);
      sprite.setVisible(true);
      sprite.setActive(true);
    }

    sprite
      .setPosition(BALANCE.LOGICAL_WIDTH + 140, def.yOffset)
      .setDepth(def.depth)
      .setOrigin(0.5, 1.0)
      .setFlipX(def.id === "rickshaw");

    this.activeObjects.push({
      sprite,
      speedFactor: def.speedFactor,
    });
  }

  public update(time: number, delta: number, currentBaseSpeed: number = BALANCE.BASE_RUN_SPEED) {
    const dt = delta * 0.001;
    const effectiveSpeed = currentBaseSpeed * this.speedMultiplier;

    // 1. Update tilePositionX for smooth distinct speeds (0.1, 0.3, 0.6, 1.0)
    this.skyTile.tilePositionX += effectiveSpeed * 0.1 * dt;
    this.farBuildingsTile.tilePositionX += effectiveSpeed * 0.3 * dt;
    if (this.metroTrackTile) {
      this.metroTrackTile.tilePositionX += effectiveSpeed * 0.35 * dt;
    }
    this.nearBuildingsTile.tilePositionX += effectiveSpeed * 0.6 * dt;
    this.roadTile.tilePositionX += effectiveSpeed * 1.0 * dt;
    this.wiresTile.tilePositionX += effectiveSpeed * 1.15 * dt;

    // 2. Metro Train periodic transit
    if (this.metroTrainSprite) {
      this.metroCooldown -= delta;
      if (this.metroCooldown <= 0) {
        // Fast MRT speed passing through
        this.metroTrainSprite.x -= (effectiveSpeed * 0.3 + 280) * dt;
        if (this.metroTrainSprite.x < -380) {
          // Train has fully exited screen; schedule next train in 18-28 seconds
          this.metroCooldown = 18000 + Math.random() * 10000;
          this.metroTrainSprite.x = BALANCE.LOGICAL_WIDTH + 300;
        }
      }
    }

    // 3. Perched Crows Bobbing & occasional Flying Crow
    if (this.perchedCrow1) {
      this.perchedCrow1.y = 48 + Math.sin(time * 0.004) * 2;
    }
    if (this.perchedCrow2) {
      this.perchedCrow2.y = 72 + Math.sin(time * 0.003 + 1) * 2.5;
    }

    if (this.flyingCrow) {
      this.crowFlyCooldown -= delta;
      if (this.crowFlyCooldown <= 0) {
        if (!this.flyingCrow.visible) {
          this.flyingCrow
            .setVisible(true)
            .setPosition(BALANCE.LOGICAL_WIDTH + 40, 50 + Math.random() * 60)
            .setScale(1.0);
        }
        this.flyingCrow.x -= (effectiveSpeed * 1.3 + 150) * dt;
        this.flyingCrow.y += Math.sin(time * 0.008) * 1.5;

        if (this.flyingCrow.x < -60) {
          this.flyingCrow.setVisible(false);
          this.crowFlyCooldown = 14000 + Math.random() * 12000;
        }
      }
    }

    // 4. Street Prop Spawning (tea stall, hawker cart, footbridge, dog)
    this.propSpawnTimer += delta;
    if (this.propSpawnTimer > 4500) {
      this.propSpawnTimer = 0;
      const decors = STREET_PROPS.filter((p) => p.tag === "decor");
      const chosen = decors[Math.floor(Math.random() * decors.length)];
      if (chosen) {
        this.spawnStreetProp(chosen);
      }
    }

    // 5. Passing Vehicle Spawning (rickshaw, CNG, bus, truck)
    this.vehicleSpawnTimer += delta;
    if (this.vehicleSpawnTimer > 6500) {
      this.vehicleSpawnTimer = 0;
      const vehicles = STREET_PROPS.filter((p) => p.tag === "vehicle");
      const chosen = vehicles[Math.floor(Math.random() * vehicles.length)];
      if (chosen) {
        this.spawnStreetProp(chosen);
        if (chosen.id === "prop-rickshaw") {
          audioService.playSpatial("vehicle-rickshaw", 0.6);
        } else if (chosen.id === "prop-cng") {
          audioService.playSpatial("vehicle-cng", 0.6);
        } else if (chosen.id === "prop-bus") {
          audioService.playSpatial("vehicle-bus", 0.7);
        } else if (chosen.id === "prop-motorbike") {
          audioService.playSpatial("vehicle-bike", 0.6);
        }
      }
    }

    // 6. Update Active Street Objects & Pool off-screen
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      const obj = this.activeObjects[i];
      obj.sprite.x -= effectiveSpeed * obj.speedFactor * dt;

      // Cull when safely off-screen left
      if (obj.sprite.x < -260) {
        obj.sprite.setVisible(false);
        obj.sprite.setActive(false);
        this.propPool.push(obj.sprite);
        this.activeObjects.splice(i, 1);
      }
    }
  }

  public applyTimeOfDay(timeOfDay: TimeOfDay) {
    switch (timeOfDay) {
      case "goldenHour":
        this.setSkyTint(0xffd1a4);
        this.setAmbientTint(0xffc285);
        break;
      case "night":
        this.setSkyTint(0x3b4261);
        this.setAmbientTint(0x6b7280);
        break;
      case "dawn":
        this.setSkyTint(0xffe4e6);
        this.setAmbientTint(0xfecdd3);
        break;
      case "noon":
      default:
        this.setSkyTint(0xffffff);
        this.setAmbientTint(0xffffff);
        break;
    }
  }

  public setAmbientTint(tint: number) {
    this.farBuildingsTile.setTint(tint);
    this.nearBuildingsTile.setTint(tint);
    this.roadTile.setTint(tint);
    if (this.metroTrackTile) {
      this.metroTrackTile.setTint(tint);
    }
  }

  public setSkyTint(tint: number) {
    this.skyTile.setTint(tint);
  }

  public destroy() {
    for (const obj of this.activeObjects) {
      obj.sprite.destroy();
    }
    for (const p of this.propPool) {
      p.destroy();
    }
    this.activeObjects = [];
    this.propPool = [];
  }
}
