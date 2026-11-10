import Phaser from "phaser";
import { ParallaxSystem } from "@/game/systems/ParallaxSystem";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { SpawnSystem } from "@/game/systems/SpawnSystem";
import { BlackoutEffect, SmogEffect } from "@/game/fx";
import { eventService, WorldEvent } from "@/services/eventService";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";

export class EventSystem {
  private scene: Phaser.Scene;
  private parallaxSystem: ParallaxSystem;
  private spawnSystem: SpawnSystem;

  public activeEvent: WorldEvent | null = null;
  private eventTimeLeft = 0;
  private nextEventTimer = 25000; // ms
  private cooldowns: Record<string, number> = {};

  // High-fidelity marquee visual effects
  private blackoutEffect: BlackoutEffect;
  private smogEffect: SmogEffect;

  constructor(
    scene: Phaser.Scene,
    parallaxSystem: ParallaxSystem,
    villain: Villain,
    chaser: Chaser,
    spawnSystem: SpawnSystem
  ) {
    this.scene = scene;
    this.parallaxSystem = parallaxSystem;
    this.spawnSystem = spawnSystem;
    this.blackoutEffect = new BlackoutEffect(scene, villain, chaser);
    this.smogEffect = new SmogEffect(scene, villain);

    // Listen to external bus commands
    gameBus.on("event:trigger", this.handleForceEvent);
    gameBus.on("event:clear", this.handleClearEvent);
    gameBus.on("event:bribe", this.handleBribe);
  }

  public destroy() {
    gameBus.off("event:trigger", this.handleForceEvent);
    gameBus.off("event:clear", this.handleClearEvent);
    gameBus.off("event:bribe", this.handleBribe);
    this.clearCurrentEvent();
  }

  private handleClearEvent = () => {
    this.clearCurrentEvent();
  };

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
    audioService.duckBgm(true);

    // Apply Effects
    for (const effect of event.effects) {
      if (effect.kind === "modifier" && effect.target === "speed" && effect.multiplier) {
        this.parallaxSystem.speedMultiplier = effect.multiplier;
      }

      if (effect.kind === "overlay" && effect.name === "blackout") {
        this.blackoutEffect.activate(effect.params?.alpha ?? 0.94);
      }

      if (effect.kind === "overlay" && effect.name === "smog") {
        this.smogEffect.activate(effect.params?.alpha ?? 0.45);
      }

      if (effect.kind === "spawner" && effect.name === "crowd") {
        this.spawnSystem.setStrikeActive(true);
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

    // Revert Speed Modifiers to 1.0 (baseline)
    this.parallaxSystem.speedMultiplier = 1.0;

    // Deactivate marquee effects with 400ms smooth fade
    this.blackoutEffect.deactivate();
    this.smogEffect.deactivate();
    this.spawnSystem.setStrikeActive(false);

    // Record Cooldown
    this.cooldowns[eventId] = this.activeEvent.cooldownSec * 1000;

    this.activeEvent = null;
    this.eventTimeLeft = 0;
    audioService.duckBgm(false);

    // Reset next event timer (random between 25s - 45s)
    this.nextEventTimer = 25000 + Math.random() * 20000;

    // Update Zustand Store
    useGameStore.getState().clearEvent();
    gameBus.emit("event:ended", { eventId });
  }

  public update(_time: number, delta: number) {
    // Update active visual effects
    this.smogEffect.update(_time, delta);

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
