import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for Node test environment
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
vi.stubGlobal("localStorage", mockLocalStorage);
vi.stubGlobal("window", { localStorage: mockLocalStorage });

import {
  DEFAULT_STAGE_RULES,
  STAGE_CONFIG,
  calculateStars,
  RunRules,
} from "@/config/rules";
import {
  loadSaveData,
  recordMapStars,
  getMapStars,
  STORAGE_KEY_V1,
} from "@/services/storage";
import { useGameStore } from "@/store/useGameStore";
import { getTodayChallenge } from "@/config/dailyChallenge";

describe("Ticket V2-06: Run Structure, Stars & Persistence v1", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      screen: "PLAYING",
      villainHp: 650,
      villainMaxHp: 650,
      patience: 100,
      combo: 0,
      bestCombo: 0,
      distanceMeters: 0,
      stageProgress: 0,
      starsResult: null,
      failReason: null,
      currentMapId: "mirpur",
    });
  });

  describe("RunRules Data & V3 Forward-Compatibility", () => {
    it("ensures stage mode has null timeLimitSec per forward-compat AC", () => {
      expect(DEFAULT_STAGE_RULES.mode).toBe("stage");
      expect(DEFAULT_STAGE_RULES.timeLimitSec).toBeNull();
      expect(DEFAULT_STAGE_RULES.lives).toBe(1);
      expect(DEFAULT_STAGE_RULES.winCondition).toBe("catch_villain");
    });

    it("allows custom RunRules data configuration", () => {
      const timeAttackRules: RunRules = {
        mode: "timeAttack",
        timeLimitSec: 120,
        lives: 3,
        winCondition: "survive_timer",
      };
      useGameStore.getState().setRunRules(timeAttackRules);
      expect(useGameStore.getState().runRules.mode).toBe("timeAttack");
      expect(useGameStore.getState().runRules.timeLimitSec).toBe(120);
    });
  });

  describe("Stars Calculation Rules (PLAN §2.6)", () => {
    it("awards 0 stars on defeat / loss", () => {
      const res = calculateStars({
        isWin: false,
        patienceRemaining: 80,
        bestCombo: 15,
      });
      expect(res.stars).toBe(0);
      expect(res.caughtVillain).toBe(false);
    });

    it("awards 1 star for basic win (patience <= 50, combo < 10)", () => {
      const res = calculateStars({
        isWin: true,
        patienceRemaining: 40,
        bestCombo: 5,
      });
      expect(res.stars).toBe(1);
      expect(res.caughtVillain).toBe(true);
      expect(res.patienceOverHalf).toBe(false);
      expect(res.comboTargetReached).toBe(false);
    });

    it("awards 2 stars for win with patience > 50%", () => {
      const res = calculateStars({
        isWin: true,
        patienceRemaining: 75,
        bestCombo: 4,
      });
      expect(res.stars).toBe(2);
      expect(res.patienceOverHalf).toBe(true);
      expect(res.comboTargetReached).toBe(false);
    });

    it("awards 2 stars for win with combo >= 10 target", () => {
      const res = calculateStars({
        isWin: true,
        patienceRemaining: 30,
        bestCombo: 12,
      });
      expect(res.stars).toBe(2);
      expect(res.patienceOverHalf).toBe(false);
      expect(res.comboTargetReached).toBe(true);
    });

    it("awards full 3 stars when all criteria are met", () => {
      const res = calculateStars({
        isWin: true,
        patienceRemaining: 85,
        bestCombo: 14,
      });
      expect(res.stars).toBe(3);
      expect(res.caughtVillain).toBe(true);
      expect(res.patienceOverHalf).toBe(true);
      expect(res.comboTargetReached).toBe(true);
    });
  });

  describe("Distance Tracking & Safehouse Escape", () => {
    it("tracks distance meters and stage progress percentage", () => {
      expect(useGameStore.getState().distanceMeters).toBe(0);
      expect(useGameStore.getState().stageProgress).toBe(0);

      useGameStore.getState().addDistance(250);
      expect(useGameStore.getState().distanceMeters).toBe(250);
      expect(useGameStore.getState().stageProgress).toBe(25);

      useGameStore.getState().addDistance(250);
      expect(useGameStore.getState().distanceMeters).toBe(500);
      expect(useGameStore.getState().stageProgress).toBe(50);
    });

    it("triggers escaped fail state when villain reaches safehouse (1000m)", () => {
      useGameStore.getState().addDistance(990);
      expect(useGameStore.getState().screen).toBe("PLAYING");

      useGameStore.getState().addDistance(20);
      expect(useGameStore.getState().distanceMeters).toBe(STAGE_CONFIG.TARGET_DISTANCE_METERS);
      expect(useGameStore.getState().stageProgress).toBe(100);
      expect(useGameStore.getState().screen).toBe("GAME_OVER");
      expect(useGameStore.getState().failReason).toBe("escaped");
    });
  });

  describe("Persistence v1 & Schema Migration", () => {
    it("returns default save data v1 on clean browser", () => {
      const data = loadSaveData();
      expect(data.version).toBe(1);
      expect(data.unlockedMaps).toContain("mirpur");
      expect(data.mapStars).toEqual({});
    });

    it("migrates legacy unversioned localStorage keys into SaveDataV1", () => {
      // Simulate legacy keys existing prior to V2
      localStorage.setItem("dhaka_runner_shop_unlocked", JSON.stringify(["outfit-panjabi", "outfit-lungi"]));
      localStorage.setItem("dhaka_runner_equipped_outfit", "outfit-panjabi");
      localStorage.setItem("dhaka_runner_achievements", JSON.stringify(["first_blood", "chappal_master"]));

      const migrated = loadSaveData();
      expect(migrated.version).toBe(1);
      expect(migrated.equippedOutfit).toBe("outfit-panjabi");
      expect(migrated.unlockedOutfits).toContain("outfit-panjabi");
      expect(migrated.unlockedAchievements).toContain("chappal_master");

      // Verify it was persisted under STORAGE_KEY_V1
      const savedRaw = localStorage.getItem(STORAGE_KEY_V1);
      expect(savedRaw).not.toBeNull();
      const parsed = JSON.parse(savedRaw!);
      expect(parsed.version).toBe(1);
      expect(parsed.equippedOutfit).toBe("outfit-panjabi");
    });

    it("records map stars and unlocks next map sequentially", () => {
      // Mirpur cleared with 2 stars -> unlocks Farmgate
      const res1 = recordMapStars("mirpur", 2);
      expect(getMapStars("mirpur")).toBe(2);
      expect(res1.newlyUnlocked).toContain("farmgate");

      const current = loadSaveData();
      expect(current.unlockedMaps).toContain("farmgate");

      // Farmgate cleared with 3 stars -> unlocks New Market
      const res2 = recordMapStars("farmgate", 3);
      expect(getMapStars("farmgate")).toBe(3);
      expect(res2.newlyUnlocked).toContain("newmarket");
      expect(loadSaveData().unlockedMaps).toContain("newmarket");
    });

    it("handles corrupted localStorage gracefully without crashing", () => {
      localStorage.setItem(STORAGE_KEY_V1, "INVALID_NON_JSON_STRING{{{");
      const fallback = loadSaveData();
      expect(fallback.version).toBe(1);
      expect(fallback.unlockedMaps).toContain("mirpur");
    });
  });

  describe("Daily Challenge Outlier Fix (G-08)", () => {
    it("verifies daily reward outlier is capped to 150 (not 5000)", () => {
      const challenge = getTodayChallenge();
      expect(challenge.rewardTaka).toBe(150);
      expect(challenge.rewardTaka).toBeLessThan(500);
    });
  });
});
