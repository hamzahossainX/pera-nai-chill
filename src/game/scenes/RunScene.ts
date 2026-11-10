import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { FxSystem } from "@/game/systems/FxSystem";
import { CombatSystem } from "@/game/systems/CombatSystem";
import { SpawnSystem } from "@/game/systems/SpawnSystem";
import { EventSystem } from "@/game/systems/EventSystem";
import { BALANCE } from "@/config/balance";
import { gameBus } from "@/game/bus";

export class RunScene extends Phaser.Scene {
  public parallaxSystem!: ParallaxSystem;
  public villain!: Villain;
  public chaser!: Chaser;
  public fxSystem!: FxSystem;
  public combatSystem!: CombatSystem;
  public spawnSystem!: SpawnSystem;
  public eventSystem!: EventSystem;

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

    // 3. Initialize FX, Combat, Spawn & Event Systems
    this.fxSystem = new FxSystem(this);
    this.spawnSystem = new SpawnSystem(this, this.villain, this.fxSystem);
    this.combatSystem = new CombatSystem(
      this,
      this.villain,
      this.chaser,
      this.fxSystem
    );
    this.eventSystem = new EventSystem(
      this,
      this.parallaxSystem,
      this.villain,
      this.chaser,
      this.spawnSystem
    );

    // 4. Camera Configuration
    this.cameras.main.setBounds(0, 0, BALANCE.LOGICAL_WIDTH, BALANCE.LOGICAL_HEIGHT);

    // 5. Setup Event Listeners from React UI Bus
    gameBus.on("game:pause", this.handlePause);
    gameBus.on("game:restart", this.handleRestart);

    // Clean up bus listeners on scene shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameBus.off("game:pause", this.handlePause);
      gameBus.off("game:restart", this.handleRestart);
      this.combatSystem.destroy();
      this.eventSystem.destroy();
      this.spawnSystem.clearAll();
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

    const currentSpeed = this.runSpeed * this.parallaxSystem.speedMultiplier;

    // Update parallax scenery
    this.parallaxSystem.update(time, delta, this.runSpeed);

    // Update villain, chaser, and combat projectiles
    this.villain.update(time, delta);
    this.chaser.update(time, delta);
    this.combatSystem.update(time, delta);
    this.spawnSystem.update(time, delta, currentSpeed);
    this.eventSystem.update(time, delta);

    // Keep chaser following villain's lane smoothly
    this.chaser.followLane(this.villain.currentLane);
  }
}
