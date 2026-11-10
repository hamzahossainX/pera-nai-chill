import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { BALANCE } from "@/config/balance";

describe("T13 - Debug Bar & Demo Mode State", () => {
  beforeEach(() => {
    useGameStore.setState({
      screen: "PLAYING",
      villainHp: 1000,
      villainMaxHp: 1000,
      rage: 0,
      taka: 500,
      isDebugOpen: false,
      isDemoMode: false,
      settings: {
        sound: true,
        haptics: true,
        quality: "high",
        lang: "bn",
        reducedMotion: false,
      },
    });
  });

  it("fills rage to max (100) when fillRage is called", () => {
    expect(useGameStore.getState().rage).toBe(0);
    useGameStore.getState().fillRage();
    expect(useGameStore.getState().rage).toBe(BALANCE.MAX_RAGE);
  });

  it("kills villain and transitions to GAME_OVER when killVillain is called", () => {
    expect(useGameStore.getState().villainHp).toBe(1000);
    useGameStore.getState().killVillain();
    expect(useGameStore.getState().villainHp).toBe(0);
    expect(useGameStore.getState().screen).toBe("GAME_OVER");
  });

  it("adds 500 taka to player balance", () => {
    expect(useGameStore.getState().taka).toBe(500);
    useGameStore.getState().addTaka(500);
    expect(useGameStore.getState().taka).toBe(1000);
  });

  it("toggles and sets debug mode state properly", () => {
    expect(useGameStore.getState().isDebugOpen).toBe(false);
    useGameStore.getState().toggleDebug();
    expect(useGameStore.getState().isDebugOpen).toBe(true);
    useGameStore.getState().setDebugOpen(false);
    expect(useGameStore.getState().isDebugOpen).toBe(false);
  });

  it("sets demo mode state properly", () => {
    expect(useGameStore.getState().isDemoMode).toBe(false);
    useGameStore.getState().setDemoMode(true);
    expect(useGameStore.getState().isDemoMode).toBe(true);
  });

  it("handles debug and event bus signals reliably", () => {
    const triggerFn = vi.fn();
    const clearFn = vi.fn();
    const timeScaleFn = vi.fn();
    const spawnFn = vi.fn();
    const fpsFn = vi.fn();

    gameBus.on("event:trigger", triggerFn);
    gameBus.on("event:clear", clearFn);
    gameBus.on("debug:timeScale", timeScaleFn);
    gameBus.on("debug:spawnObstacle", spawnFn);
    gameBus.on("fps:update", fpsFn);

    gameBus.emit("event:trigger", { eventId: "evt_loadshedding" });
    expect(triggerFn).toHaveBeenCalledWith({ eventId: "evt_loadshedding" });

    gameBus.emit("event:clear");
    expect(clearFn).toHaveBeenCalled();

    gameBus.emit("debug:timeScale", { scale: 0.5 });
    expect(timeScaleFn).toHaveBeenCalledWith({ scale: 0.5 });

    gameBus.emit("debug:spawnObstacle");
    expect(spawnFn).toHaveBeenCalled();

    gameBus.emit("fps:update", { fps: 60 });
    expect(fpsFn).toHaveBeenCalledWith({ fps: 60 });

    gameBus.off("event:trigger", triggerFn);
    gameBus.off("event:clear", clearFn);
    gameBus.off("debug:timeScale", timeScaleFn);
    gameBus.off("debug:spawnObstacle", spawnFn);
    gameBus.off("fps:update", fpsFn);
  });
});
