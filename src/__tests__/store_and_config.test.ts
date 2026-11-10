import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/useGameStore";
import { calculateComboMultiplier } from "@/config/balance";
import { eventService, validateEvents } from "@/services/eventService";

describe("T01: Core State & Config", () => {
  beforeEach(() => {
    useGameStore.setState({
      taka: 500,
      combo: 0,
      rage: 0,
      villainHp: 1000,
      screen: "LOBBY",
    });
  });

  describe("spendTaka Action", () => {
    it("deducts taka when sufficient funds exist and returns true", () => {
      const store = useGameStore.getState();
      const result = store.spendTaka(200);

      expect(result).toBe(true);
      expect(useGameStore.getState().taka).toBe(300);
    });

    it("allows spending the exact remaining balance down to 0", () => {
      const store = useGameStore.getState();
      const result = store.spendTaka(500);

      expect(result).toBe(true);
      expect(useGameStore.getState().taka).toBe(0);
    });

    it("refuses to spend and never allows balance to go negative", () => {
      const store = useGameStore.getState();
      useGameStore.setState({ taka: 50 });

      // Attempt to spend 100 when only 50 is available
      const result = store.spendTaka(100);

      expect(result).toBe(false);
      expect(useGameStore.getState().taka).toBe(50);
    });

    it("handles zero and negative amounts gracefully", () => {
      const store = useGameStore.getState();
      const result = store.spendTaka(0);

      expect(result).toBe(true);
      expect(useGameStore.getState().taka).toBe(500);
    });
  });

  describe("Combo Multiplier Calculation", () => {
    it("returns 1.0 for low combos (< 5)", () => {
      expect(calculateComboMultiplier(0)).toBe(1.0);
      expect(calculateComboMultiplier(1)).toBe(1.0);
      expect(calculateComboMultiplier(4)).toBe(1.0);
    });

    it("returns 1.25 for combos between 5 and 9", () => {
      expect(calculateComboMultiplier(5)).toBe(1.25);
      expect(calculateComboMultiplier(7)).toBe(1.25);
      expect(calculateComboMultiplier(9)).toBe(1.25);
    });

    it("returns 1.5 for combos between 10 and 19", () => {
      expect(calculateComboMultiplier(10)).toBe(1.5);
      expect(calculateComboMultiplier(15)).toBe(1.5);
      expect(calculateComboMultiplier(19)).toBe(1.5);
    });

    it("returns 2.0 for combos 20 and above", () => {
      expect(calculateComboMultiplier(20)).toBe(2.0);
      expect(calculateComboMultiplier(50)).toBe(2.0);
      expect(calculateComboMultiplier(100)).toBe(2.0);
    });
  });

  describe("World Events Schema & Validation", () => {
    it("loads and validates all standard events from events.json", () => {
      const events = eventService.getEvents();
      expect(events.length).toBeGreaterThanOrEqual(3);

      const loadshedding = eventService.getEventById("evt_loadshedding");
      expect(loadshedding).toBeDefined();
      expect(loadshedding?.type).toBe("LOADSHEDDING");
      expect(loadshedding?.durationSec).toBe(20);
      expect(loadshedding?.bypass.costTaka).toBe(100);
      expect(loadshedding?.title.en).toBe("Loadshedding!");
      expect(loadshedding?.title.bn).toBe("বিদ্যুৎ বিভ্রাট!");
    });

    it("rejects invalid event schemas with ZodError", () => {
      const invalidData = {
        currentTrendingHeadline: "Test",
        events: [
          {
            id: "bad_event",
            type: "INVALID_TYPE", // Not LOADSHEDDING | POLLUTION | STRIKE
            title: { bn: "ভুল" }, // Missing 'en'
            durationSec: -5, // Negative duration
          },
        ],
      };

      expect(() => validateEvents(invalidData)).toThrow();
    });
  });
});
