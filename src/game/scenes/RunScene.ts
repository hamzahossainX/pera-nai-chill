import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { BALANCE } from "@/config/balance";
import { gameBus } from "@/game/bus";

export class RunScene extends Phaser.Scene {
  private parallaxSystem!: ParallaxSystem;
  private isPaused = false;
  private runSpeed = BALANCE.BASE_RUN_SPEED;

  constructor() {
    super({ key: "RunScene" });
  }

  create() {
    // 1. Initialize Parallax Background
    this.parallaxSystem = new ParallaxSystem(this);

    // 2. Camera Configuration
    this.cameras.main.setBounds(0, 0, BALANCE.LOGICAL_WIDTH, BALANCE.LOGICAL_HEIGHT);

    // 3. Setup Event Listeners from React UI Bus
    gameBus.on("game:pause", this.handlePause);
    gameBus.on("game:restart", this.handleRestart);

    // Clean up bus listeners on scene shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameBus.off("game:pause", this.handlePause);
      gameBus.off("game:restart", this.handleRestart);
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

  update(time: number, delta: number) {
    if (this.isPaused) return;

    // Update parallax scenery
    this.parallaxSystem.update(time, delta, this.runSpeed);
  }
}
