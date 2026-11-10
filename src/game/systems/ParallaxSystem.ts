import Phaser from "phaser";
import { BALANCE } from "@/config/balance";
import { useGameStore } from "@/store/useGameStore";

export class ParallaxSystem {
  private scene: Phaser.Scene;
  private skyTile!: Phaser.GameObjects.TileSprite;
  private farBuildingsTile!: Phaser.GameObjects.TileSprite;
  private nearBuildingsTile!: Phaser.GameObjects.TileSprite;
  private roadTile!: Phaser.GameObjects.TileSprite;
  private wiresTile!: Phaser.GameObjects.TileSprite;

  public speedMultiplier = 1.0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initLayers();
  }

  private initLayers() {
    const W = BALANCE.LOGICAL_WIDTH;
    const mapId = useGameStore.getState().currentMapId || "mirpur";

    const skyKey =
      mapId === "farmgate"
        ? "bg-sky-farmgate"
        : mapId === "newmarket"
        ? "bg-sky-newmarket"
        : "bg-sky-mirpur";

    const nearKey =
      mapId === "farmgate"
        ? "bg-near-farmgate"
        : mapId === "newmarket"
        ? "bg-near-newmarket"
        : "bg-near-buildings";

    // Layer 1: Sky
    this.skyTile = this.scene.add
      .tileSprite(0, 0, W, 500, this.scene.textures.exists(skyKey) ? skyKey : "bg-sky")
      .setOrigin(0, 0)
      .setDepth(0);

    // Layer 2: Far Skyline Silhouettes
    this.farBuildingsTile = this.scene.add
      .tileSprite(0, 180, W, 300, "bg-far-buildings")
      .setOrigin(0, 0)
      .setDepth(1);

    // Layer 3: Near Buildings with colorful Dhaka signage
    this.nearBuildingsTile = this.scene.add
      .tileSprite(0, 150, W, 360, this.scene.textures.exists(nearKey) ? nearKey : "bg-near-buildings")
      .setOrigin(0, 0)
      .setDepth(2);

    // Layer 4: Asphalt Road (3 Lanes)
    this.roadTile = this.scene.add
      .tileSprite(0, 440, W, 280, "bg-road")
      .setOrigin(0, 0)
      .setDepth(3);

    // Layer 5: Overhead Entangled Cables
    this.wiresTile = this.scene.add
      .tileSprite(0, 0, W, 150, "bg-wires")
      .setOrigin(0, 0)
      .setDepth(100);
  }

  public update(_time: number, delta: number, currentBaseSpeed: number = BALANCE.BASE_RUN_SPEED) {
    const dt = delta * 0.001;
    const effectiveSpeed = currentBaseSpeed * this.speedMultiplier;

    // Update tilePositionX with different parallax factors
    this.skyTile.tilePositionX += effectiveSpeed * 0.03 * dt;
    this.farBuildingsTile.tilePositionX += effectiveSpeed * 0.15 * dt;
    this.nearBuildingsTile.tilePositionX += effectiveSpeed * 0.45 * dt;
    this.roadTile.tilePositionX += effectiveSpeed * 1.0 * dt;
    this.wiresTile.tilePositionX += effectiveSpeed * 1.25 * dt;
  }
}
