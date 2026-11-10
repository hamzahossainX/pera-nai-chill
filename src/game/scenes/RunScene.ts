import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { BALANCE } from "@/config/balance";
import { gameBus } from "@/game/bus";

export class RunScene extends Phaser.Scene {
  private parallaxSystem!: ParallaxSystem;
  public villain!: Villain;
  public chaser!: Chaser;
  private isPaused = false;
  private runSpeed = BALANCE.BASE_RUN_SPEED;

  constructor() {
    super({ key: "RunScene" });
  }

  create() {
    // 1. Initialize Parallax Background
    this.parallaxSystem = new ParallaxSystem(this);

    // 2. Spawn Characters
    this.chaser = new Chaser(this);
    this.villain = new Villain(this);

    // 3. Camera Configuration
    this.cameras.main.setBounds(0, 0, BALANCE.LOGICAL_WIDTH, BALANCE.LOGICAL_HEIGHT);

    // 4. Setup Event Listeners from React UI Bus
    gameBus.on("game:pause", this.handlePause);
    gameBus.on("game:restart", this.handleRestart);
    gameBus.on("weapon:use", this.handleWeaponUse);

    // Clean up bus listeners on scene shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameBus.off("game:pause", this.handlePause);
      gameBus.off("game:restart", this.handleRestart);
      gameBus.off("weapon:use", this.handleWeaponUse);
    });
  }

  private handlePause = (data: { paused: boolean }) => {
    this.isPaused = data.paused;
    if (data.paused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  };

  private handleRestart = () => {
    this.scene.restart();
  };

  private handleWeaponUse = (data: { weaponId: string }) => {
    if (data.weaponId === "kick") {
      this.chaser.attack("kick");
    } else if (data.weaponId === "chappal") {
      this.chaser.attack("throw");
    } else {
      this.chaser.attack("punch");
    }
  };

  update(time: number, delta: number) {
    if (this.isPaused) return;

    // Update parallax scenery
    this.parallaxSystem.update(time, delta, this.runSpeed);

    // Update villain and chaser
    this.villain.update(time, delta);
    this.chaser.update(time, delta);

    // Keep chaser following villain's lane smoothly
    this.chaser.followLane(this.villain.currentLane);
  }
}
