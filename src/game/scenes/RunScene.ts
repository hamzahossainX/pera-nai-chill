import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { FxSystem } from "@/game/systems/FxSystem";
import { CombatSystem } from "@/game/systems/CombatSystem";
import { SpawnSystem } from "@/game/systems/SpawnSystem";
import { EventSystem } from "@/game/systems/EventSystem";
import { DifficultySystem } from "@/game/systems/DifficultySystem";
import { BALANCE } from "@/config/balance";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";

export class RunScene extends Phaser.Scene {
  public parallaxSystem!: ParallaxSystem;
  public villain!: Villain;
  public chaser!: Chaser;
  public fxSystem!: FxSystem;
  public combatSystem!: CombatSystem;
  public spawnSystem!: SpawnSystem;
  public eventSystem!: EventSystem;
  public difficultySystem!: DifficultySystem;

  private isPaused = false;
  private lastFpsReport = 0;

  constructor() {
    super({ key: "RunScene" });
  }

  create() {
    // 1. Initialize Parallax Background
    this.parallaxSystem = new ParallaxSystem(this);

    // 2. Spawn Characters
    this.chaser = new Chaser(this);
    this.villain = new Villain(this);

    // 3. Initialize FX, Combat, Spawn, Event & Difficulty Systems
    this.fxSystem = new FxSystem(this);
    this.difficultySystem = new DifficultySystem();
    this.spawnSystem = new SpawnSystem(
      this,
      this.villain,
      this.fxSystem,
      this.chaser
    );
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
    gameBus.on("debug:spawnObstacle", this.handleDebugSpawnObstacle);
    gameBus.on("debug:timeScale", this.handleDebugTimeScale);
    gameBus.on("villain:dead", this.handleVillainDead);

    // Clean up bus listeners on scene shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameBus.off("game:pause", this.handlePause);
      gameBus.off("game:restart", this.handleRestart);
      gameBus.off("debug:spawnObstacle", this.handleDebugSpawnObstacle);
      gameBus.off("debug:timeScale", this.handleDebugTimeScale);
      gameBus.off("villain:dead", this.handleVillainDead);
      this.combatSystem.destroy();
      this.eventSystem.destroy();
      this.spawnSystem.clearAll();
      this.difficultySystem.reset();
    });
  }

  private handleVillainDead = () => {
    // Comic Dramatic Slow-Mo Finisher!
    this.time.timeScale = 0.25;
    this.cameras.main.shake(350, 0.015);
    this.cameras.main.zoomTo(1.08, 250);

    this.time.delayedCall(700, () => {
      this.time.timeScale = 1.0;
      this.cameras.main.zoomTo(1.0, 250);
    });

    this.villain.die();
    this.fxSystem.triggerHitFx(
      this.villain.rig.x,
      this.villain.rig.y - 40,
      "ফিনিশ! ধরা খাইসে!",
      0,
      true
    );
    audioService.play("fanfare");
  };

  private handleDebugSpawnObstacle = () => {
    this.spawnSystem.spawnObstacle();
  };

  private handleDebugTimeScale = (data: { scale: number }) => {
    this.time.timeScale = Math.max(0.05, Math.min(3.0, data.scale));
    this.physics.world.timeScale = Math.max(0.05, Math.min(3.0, data.scale));
  };

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

    // Update Difficulty Ramp
    this.difficultySystem.update(time, delta);
    const baseRampedSpeed = this.difficultySystem.getCurrentSpeed();
    const effectiveSpeed = baseRampedSpeed * this.parallaxSystem.speedMultiplier;

    // Update parallax scenery
    this.parallaxSystem.update(time, delta, baseRampedSpeed);

    // Update villain, chaser, and combat projectiles
    this.villain.update(time, delta);
    this.chaser.update(time, delta);
    this.combatSystem.update(time, delta);
    this.spawnSystem.update(time, delta, effectiveSpeed);
    this.eventSystem.update(time, delta);

    // Keep chaser following villain's lane smoothly
    this.chaser.followLane(this.villain.currentLane);

    // Periodically report actual FPS
    if (time - this.lastFpsReport > 500) {
      this.lastFpsReport = time;
      gameBus.emit("fps:update", { fps: Math.round(this.game.loop.actualFps) });
    }
  }
}
