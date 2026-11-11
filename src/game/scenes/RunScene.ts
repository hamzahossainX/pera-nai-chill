import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { TimeOfDaySystem } from "@/game/systems/TimeOfDaySystem";
import { WeatherSystem } from "@/game/systems/WeatherSystem";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { FxSystem } from "@/game/systems/FxSystem";
import { CombatSystem } from "@/game/systems/CombatSystem";
import { SpawnSystem } from "@/game/systems/SpawnSystem";
import { DialogueSystem } from "@/game/systems/DialogueSystem";
import { EventSystem } from "@/game/systems/EventSystem";
import { DifficultySystem } from "@/game/systems/DifficultySystem";
import { BALANCE } from "@/config/balance";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";
import { useGameStore } from "@/store/useGameStore";

export class RunScene extends Phaser.Scene {
  public parallaxSystem!: ParallaxSystem;
  public timeOfDaySystem!: TimeOfDaySystem;
  public weatherSystem!: WeatherSystem;
  public villain!: Villain;
  public chaser!: Chaser;
  public fxSystem!: FxSystem;
  public combatSystem!: CombatSystem;
  public spawnSystem!: SpawnSystem;
  public eventSystem!: EventSystem;
  public dialogueSystem!: DialogueSystem;
  public difficultySystem!: DifficultySystem;

  private isPaused = false;
  private lastFpsReport = 0;

  constructor() {
    super({ key: "RunScene" });
  }

  create() {
    // Boss Check: Every 3rd run triggers Chor-er Sardar Boss Fight
    let runCount = 1;
    if (typeof window !== "undefined") {
      try {
        runCount = Number(localStorage.getItem("dhaka_runner_run_count") || "0") + 1;
        localStorage.setItem("dhaka_runner_run_count", String(runCount));
      } catch {}
    }

    const isBossRun = runCount % 3 === 0;
    if (isBossRun) {
      useGameStore.setState({
        villainId: "chorSardar",
        villainHp: 500,
        villainMaxHp: 500,
      });
    }

    // 1. Initialize Parallax Background & Day/Night Lighting & Weather
    this.parallaxSystem = new ParallaxSystem(this);
    this.timeOfDaySystem = new TimeOfDaySystem(this, this.parallaxSystem);
    this.weatherSystem = new WeatherSystem(this, this.parallaxSystem);

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
      this.spawnSystem,
      this.timeOfDaySystem
    );
    this.dialogueSystem = new DialogueSystem(this, this.villain, this.chaser);

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
      this.timeOfDaySystem.destroy();
      this.weatherSystem.destroy();
      this.eventSystem.destroy();
      this.dialogueSystem.destroy();
      this.spawnSystem.clearAll();
      this.difficultySystem.reset();
    });
  }

  private handleVillainDead = () => {
    const W = BALANCE.LOGICAL_WIDTH;
    const H = BALANCE.LOGICAL_HEIGHT;

    // 1. Comic Dramatic Slow-Mo Finisher!
    this.time.timeScale = 0.25;
    this.cameras.main.shake(350, 0.015);
    this.cameras.main.zoomTo(1.08, 250);

    this.time.delayedCall(700, () => {
      this.time.timeScale = 1.0;
      this.cameras.main.zoomTo(1.0, 250);
    });

    this.villain.die();
    this.fxSystem.triggerArchetypeDefeatReaction(
      this.villain.archetype.id,
      this.villain.rig.x,
      this.villain.rig.y
    );
    this.fxSystem.triggerHitFx(
      this.villain.rig.x,
      this.villain.rig.y - 40,
      "ফিনিশ! ধরা খাইসে!",
      0,
      true
    );

    // 2. Havildar Mama cartoon policeman slides in blowing whistle
    audioService.play("whistle");
    if (this.textures.exists("fx-policeman")) {
      const police = this.add
        .sprite(W + 120, this.villain.rig.y - 15, "fx-policeman")
        .setDepth(160)
        .setScale(1.15);

      this.tweens.add({
        targets: police,
        x: this.villain.rig.x + 95,
        duration: 450,
        ease: "Back.Out",
      });
    }

    // 3. Giant Comic Red Rubber Stamp Slams in Center ("থানায় চালান! / TO THE POLICE STATION!")
    this.time.delayedCall(350, () => {
      audioService.play("sfx-punch");
      this.cameras.main.shake(400, 0.02);

      if (this.textures.exists("fx-police-stamp")) {
        const stamp = this.add
          .sprite(W / 2, H / 2 - 30, "fx-police-stamp")
          .setDepth(200)
          .setScale(2.4)
          .setAlpha(0);

        this.tweens.add({
          targets: stamp,
          scale: 1.0,
          alpha: 1,
          duration: 180,
          ease: "Bounce.Out",
        });
      }

      // Ink splatter particles
      this.fxSystem.spawnHitParticles(W / 2, H / 2 - 30, 16, "particle-star");
    });

    // 4. Massive Taka Shower (+500 Taka victory bonus)
    useGameStore.getState().addTaka(500);
    audioService.play("fanfare");

    this.time.delayedCall(600, () => {
      for (let i = 0; i < 35; i++) {
        const coin = this.add
          .sprite(
            Math.random() * W,
            -20 - Math.random() * 80,
            "particle-coin"
          )
          .setDepth(210)
          .setScale(0.8 + Math.random() * 0.4);

        this.tweens.add({
          targets: coin,
          y: H + 30,
          x: coin.x + (Math.random() - 0.5) * 80,
          rotation: Math.random() * 6,
          duration: 900 + Math.random() * 500,
          ease: "Quad.In",
          onComplete: () => coin.destroy(),
        });
      }
    });
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
    this.dialogueSystem.update(time, delta);
    this.timeOfDaySystem.update(time, delta);
    this.weatherSystem.update(time, delta);

    // Keep chaser following villain's lane smoothly
    this.chaser.followLane(this.villain.currentLane);

    // Periodically report actual FPS
    if (time - this.lastFpsReport > 500) {
      this.lastFpsReport = time;
      gameBus.emit("fps:update", { fps: Math.round(this.game.loop.actualFps) });
    }
  }
}
