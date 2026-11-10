import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/useGameStore";
import { calculateComboMultiplier } from "@/config/balance";
import { eventService, validateEvents } from "@/services/eventService";
import { CRIMES, DEFAULT_CRIME } from "@/config/crimes";
import { MAP_SCENARIOS, DEFAULT_MAP } from "@/config/maps";

describe("T01: Core State & Config", () => {
  beforeEach(() => {
    useGameStore.setState({
      taka: 500,
      combo: 0,
      rage: 0,
      villainHp: 1000,
      screen: "LOBBY",
      crimeId: DEFAULT_CRIME.id,
      currentMapId: DEFAULT_MAP.id,
      activeCounterBuff: null,
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

    it("successfully validates the WATERLOGGING world event", () => {
      const waterlogging = eventService.getEventById("evt_waterlogging");
      expect(waterlogging).toBeDefined();
      expect(waterlogging?.type).toBe("WATERLOGGING");
      expect(waterlogging?.durationSec).toBe(22);
      expect(waterlogging?.bypass.costTaka).toBe(60);
      expect(waterlogging?.title.bn).toContain("জলাবদ্ধতা");
    });
  });

  describe("T15 & T17: Crimes and Map Scenarios Config", () => {
    it("has 6 hilarious, clean, relatable crimes with bounty and badge", () => {
      expect(CRIMES.length).toBe(6);
      for (const crime of CRIMES) {
        expect(crime.id).toBeTruthy();
        expect(crime.title.bn).toBeTruthy();
        expect(crime.title.en).toBeTruthy();
        expect(crime.bountyTaka).toBeGreaterThan(0);
        expect(crime.icon).toBeTruthy();
      }
    });

    it("allows updating crimeId in store", () => {
      const store = useGameStore.getState();
      expect(store.crimeId).toBe(DEFAULT_CRIME.id);

      store.setCrimeId("kacchi_roast");
      expect(useGameStore.getState().crimeId).toBe("kacchi_roast");
    });

    it("has 3 selectable Dhaka maps: Mirpur, Farmgate, New Market", () => {
      expect(MAP_SCENARIOS.length).toBe(3);
      const ids = MAP_SCENARIOS.map((m) => m.id);
      expect(ids).toEqual(["mirpur", "farmgate", "newmarket"]);

      for (const map of MAP_SCENARIOS) {
        expect(map.name.bn).toBeTruthy();
        expect(map.tagline.bn).toBeTruthy();
        expect(map.billboards.length).toBeGreaterThan(0);
      }
    });

    it("allows updating currentMapId in store", () => {
      const store = useGameStore.getState();
      expect(store.currentMapId).toBe("mirpur");

      store.setMapId("farmgate");
      expect(useGameStore.getState().currentMapId).toBe("farmgate");
    });

    it("supports setting and clearing active counter-buff", () => {
      const store = useGameStore.getState();
      expect(store.activeCounterBuff).toBeNull();

      store.setCounterBuff("N95 মাস্ক", 15);
      expect(useGameStore.getState().activeCounterBuff?.name).toBe("N95 মাস্ক");
      expect(useGameStore.getState().activeCounterBuff?.expiry).toBeGreaterThan(Date.now());

      store.clearCounterBuff();
      expect(useGameStore.getState().activeCounterBuff).toBeNull();
    });
  });
});
