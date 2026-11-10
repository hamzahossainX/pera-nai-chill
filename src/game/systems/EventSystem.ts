import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { eventService, WorldEvent } from "@/services/eventService";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";

export class EventSystem {
  private scene: Phaser.Scene;
  private parallaxSystem: ParallaxSystem;

  public activeEvent: WorldEvent | null = null;
  private eventTimeLeft = 0;
  private nextEventTimer = 25000; // ms
  private cooldowns: Record<string, number> = {};

  // Visual overlay placeholders for events
  private blackoutOverlay?: Phaser.GameObjects.Rectangle;
  private smogOverlay?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, parallaxSystem: ParallaxSystem) {
    this.scene = scene;
    this.parallaxSystem = parallaxSystem;

    // Listen to external bus commands
    gameBus.on("event:trigger", this.handleForceEvent);
    gameBus.on("event:bribe", this.handleBribe);
  }

  public destroy() {
    gameBus.off("event:trigger", this.handleForceEvent);
    gameBus.off("event:bribe", this.handleBribe);
    this.clearCurrentEvent();
  }

  private handleForceEvent = (data: { eventId: string }) => {
    const event = eventService.getEventById(data.eventId);
    if (event) {
      this.startEvent(event);
    }
  };

  private handleBribe = (data: { eventId: string }) => {
    if (this.activeEvent && this.activeEvent.id === data.eventId) {
      audioService.play("coin");
      this.clearCurrentEvent();
    }
  };

  public startEvent(event: WorldEvent) {
    // If another event is active, revert it first
    if (this.activeEvent) {
      this.clearCurrentEvent();
    }

    this.activeEvent = event;
    this.eventTimeLeft = event.durationSec * 1000;

    // Apply Effects
    for (const effect of event.effects) {
      if (effect.kind === "modifier" && effect.target === "speed" && effect.multiplier) {
        this.parallaxSystem.speedMultiplier = effect.multiplier;
      }

      if (effect.kind === "overlay" && effect.name === "blackout") {
        this.applyBlackout(effect.params?.alpha ?? 0.92);
      }

      if (effect.kind === "overlay" && effect.name === "smog") {
        this.applySmog(effect.params?.alpha ?? 0.45);
      }

      if (effect.kind === "sfx" && effect.name) {
        audioService.play(effect.name);
      }
    }

    // Update Zustand Store & notify bus
    const store = useGameStore.getState();
    store.setEvent(event, event.durationSec);

    gameBus.emit("event:started", {
      eventId: event.id,
      duration: event.durationSec,
    });
  }

  public clearCurrentEvent() {
    if (!this.activeEvent) return;

    const eventId = this.activeEvent.id;

    // Revert Speed Modifiers
    this.parallaxSystem.speedMultiplier = 1.0;

    // Remove Overlays
    if (this.blackoutOverlay) {
      this.blackoutOverlay.destroy();
      this.blackoutOverlay = undefined;
    }
    if (this.smogOverlay) {
      this.smogOverlay.destroy();
      this.smogOverlay = undefined;
    }

    // Record Cooldown
    this.cooldowns[eventId] = this.activeEvent.cooldownSec * 1000;

    this.activeEvent = null;
    this.eventTimeLeft = 0;

    // Reset next event timer (random between 25s - 45s)
    this.nextEventTimer = 25000 + Math.random() * 20000;

    // Update Zustand Store
    useGameStore.getState().clearEvent();
    gameBus.emit("event:ended", { eventId });
  }

  private applyBlackout(alpha: number) {
    const W = this.scene.cameras.main.width;
    const H = this.scene.cameras.main.height;
    this.blackoutOverlay = this.scene.add
      .rectangle(0, 0, W, H, 0x000000, alpha)
      .setOrigin(0, 0)
      .setDepth(90);
  }

  private applySmog(alpha: number) {
    const W = this.scene.cameras.main.width;
    const H = this.scene.cameras.main.height;
    this.smogOverlay = this.scene.add
      .rectangle(0, 0, W, H, 0x78716c, alpha)
      .setOrigin(0, 0)
      .setDepth(85);
  }

  public update(_time: number, delta: number) {
    // Tick active event duration
    if (this.activeEvent) {
      this.eventTimeLeft -= delta;
      useGameStore.getState().decrementEventTimer(delta * 0.001);

      if (this.eventTimeLeft <= 0) {
        this.clearCurrentEvent();
      }
      return;
    }

    // Tick cooldowns
    for (const [key, val] of Object.entries(this.cooldowns)) {
      if (val > 0) {
        this.cooldowns[key] = Math.max(0, val - delta);
      }
    }

    // Scheduler: Check for next automatic world event
    this.nextEventTimer -= delta;
    if (this.nextEventTimer <= 0) {
      this.scheduleRandomEvent();
    }
  }

  private scheduleRandomEvent() {
    const allEvents = eventService.getEvents();
    const available = allEvents.filter(
      (e) => (this.cooldowns[e.id] ?? 0) <= 0
    );

    if (available.length === 0) {
      this.nextEventTimer = 10000;
      return;
    }

    // Pick weighted random
    const totalWeight = available.reduce((acc, e) => acc + e.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const event of available) {
      rand -= event.weight;
      if (rand <= 0) {
        this.startEvent(event);
        break;
      }
    }
  }
}
