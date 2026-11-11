import { describe, it, expect, beforeEach } from "vitest";
import { audioService } from "@/services/audio";

describe("P2-13: Audio System, Filters, Spatial Audio & Synth Fallbacks", () => {
  beforeEach(() => {
    audioService.setMuted(false);
  });

  it("handles mute and unmute toggling accurately", () => {
    expect(audioService.isMute()).toBe(false);

    audioService.setMuted(true);
    expect(audioService.isMute()).toBe(true);

    audioService.setMuted(false);
    expect(audioService.isMute()).toBe(false);
  });

  it("plays all standard and Phase 2 sound effects safely without errors when files are absent", () => {
    const sounds = [
      "sfx-slap",
      "sfx-punch",
      "sfx-kick",
      "sfx-whoosh",
      "coin",
      "powercut",
      "siren",
      "cough",
      "splash",
      "win",
      "lose",
      "ultimate",
      "click",
      "banana",
      "can-kick",
      "whistle",
      "fanfare",
      "taunt",
      "chappal-leather",
      "chappal-golden",
      "vehicle-rickshaw",
      "vehicle-cng",
      "vehicle-bus",
      "vehicle-bike",
      "phoneSnatcher-grunt",
      "chorSardar-grunt",
      "chickenChor-grunt",
    ];

    for (const s of sounds) {
      expect(() => audioService.play(s)).not.toThrow();
    }
  });

  it("plays spatial audio with panning safely", () => {
    expect(() => audioService.playSpatial("vehicle-rickshaw", -0.7)).not.toThrow();
    expect(() => audioService.playSpatial("vehicle-bus", 0.7)).not.toThrow();
  });

  it("allows ducking and restoring BGM volume smoothly during events", () => {
    expect(() => audioService.duckBgm(true)).not.toThrow();
    expect(() => audioService.duckBgm(false)).not.toThrow();
  });

  it("handles situational BGM filters safely", () => {
    expect(() => audioService.setBgmFilter("underwater")).not.toThrow();
    expect(() => audioService.setBgmFilter("loadshedding")).not.toThrow();
    expect(() => audioService.setBgmFilter("muffled")).not.toThrow();
    expect(() => audioService.setBgmFilter("normal")).not.toThrow();
  });

  it("handles time of day and weather ambient changes safely", () => {
    expect(() => audioService.setTimeOfDay("dawn")).not.toThrow();
    expect(() => audioService.setTimeOfDay("night")).not.toThrow();
    expect(() => audioService.setTimeOfDay("noon")).not.toThrow();

    expect(() => audioService.setWeather("rain")).not.toThrow();
    expect(() => audioService.setWeather("flood")).not.toThrow();
    expect(() => audioService.setWeather("clear")).not.toThrow();

    expect(() => audioService.stopAmbience()).not.toThrow();
  });

  it("handles playBgm and stopBgm safely without throwing", () => {
    expect(() => audioService.playBgm()).not.toThrow();
    expect(() => audioService.stopBgm()).not.toThrow();
  });
});
