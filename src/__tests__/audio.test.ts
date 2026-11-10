import { describe, it, expect, beforeEach } from "vitest";
import { audioService } from "@/services/audio";

describe("T11: Audio System & Synth Fallbacks", () => {
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

  it("plays all standard sound effects safely without errors when files are absent", () => {
    const sounds = [
      "sfx-slap",
      "sfx-punch",
      "sfx-kick",
      "sfx-whoosh",
      "coin",
      "powercut",
      "siren",
      "cough",
      "win",
      "lose",
      "ultimate",
    ];

    for (const s of sounds) {
      expect(() => audioService.play(s)).not.toThrow();
    }
  });

  it("allows ducking and restoring BGM volume smoothly during events", () => {
    expect(() => audioService.duckBgm(true)).not.toThrow();
    expect(() => audioService.duckBgm(false)).not.toThrow();
  });
});
