/**
 * Storage service for persistence v1.
 * Provides safe versioned storage with automatic schema migration from legacy keys.
 * All localStorage interactions are strictly enclosed in try/catch for private/sandboxed browsers (P10).
 */

export interface MapStarsRecord {
  [mapId: string]: number; // 0..3 stars
}

export interface SaveDataV1 {
  version: 1;
  unlockedMaps: string[];
  mapStars: MapStarsRecord;
  totalTaka: number;
  highScore: number;
  equippedOutfit: string;
  unlockedOutfits: string[];
  unlockedAchievements: string[];
  claimedAchievements: string[];
  lastSavedAt: number;
}

export const STORAGE_KEY_V1 = "pernaichill_save_v1";

export const DEFAULT_SAVE_DATA_V1: SaveDataV1 = {
  version: 1,
  unlockedMaps: ["mirpur"],
  mapStars: {},
  totalTaka: 0,
  highScore: 0,
  equippedOutfit: "outfit-lungi",
  unlockedOutfits: ["outfit-lungi"],
  unlockedAchievements: [],
  claimedAchievements: [],
  lastSavedAt: 0,
};

/**
 * Attempts to parse legacy keys if they exist and returns migrated values.
 */
function migrateLegacyStorage(): Partial<SaveDataV1> {
  const legacy: Partial<SaveDataV1> = {};

  try {
    const rawShop = localStorage.getItem("dhaka_runner_shop_unlocked");
    if (rawShop) {
      const parsed = JSON.parse(rawShop);
      if (Array.isArray(parsed)) legacy.unlockedOutfits = parsed;
    }
  } catch {}

  try {
    const rawOutfit = localStorage.getItem("dhaka_runner_equipped_outfit");
    if (rawOutfit) legacy.equippedOutfit = rawOutfit;
  } catch {}

  try {
    const rawAch = localStorage.getItem("dhaka_runner_achievements");
    if (rawAch) {
      const parsed = JSON.parse(rawAch);
      if (Array.isArray(parsed)) legacy.unlockedAchievements = parsed;
    }
  } catch {}

  try {
    const rawClaimed = localStorage.getItem("dhaka_runner_claimed_achievements");
    if (rawClaimed) {
      const parsed = JSON.parse(rawClaimed);
      if (Array.isArray(parsed)) legacy.claimedAchievements = parsed;
    }
  } catch {}

  return legacy;
}

/**
 * Loads save data from localStorage, running migrations if necessary.
 */
export function loadSaveData(): SaveDataV1 {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SAVE_DATA_V1 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
      if (parsed && parsed.version === 1) {
        return {
          ...DEFAULT_SAVE_DATA_V1,
          ...parsed,
          mapStars: parsed.mapStars ?? {},
          unlockedMaps: parsed.unlockedMaps ?? ["mirpur"],
        };
      }
    }

    // No valid v1 save found; check legacy keys for migration
    const legacyMigrated = migrateLegacyStorage();
    const migratedData: SaveDataV1 = {
      ...DEFAULT_SAVE_DATA_V1,
      ...legacyMigrated,
      lastSavedAt: Date.now(),
    };

    // Save newly migrated v1 data
    saveSaveData(migratedData);
    return migratedData;
  } catch {
    return { ...DEFAULT_SAVE_DATA_V1 };
  }
}

/**
 * Saves current data to localStorage safely.
 */
export function saveSaveData(data: Partial<SaveDataV1>): boolean {
  if (typeof window === "undefined") return false;

  try {
    const current = loadSaveData();
    const updated: SaveDataV1 = {
      ...current,
      ...data,
      version: 1,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Records earned stars for a map and unlocks subsequent map if stars >= 1.
 */
export function recordMapStars(mapId: string, stars: number): { mapStars: MapStarsRecord; newlyUnlocked: string[] } {
  const current = loadSaveData();
  const existingStars = current.mapStars[mapId] ?? 0;
  const bestStars = Math.max(existingStars, stars);
  const updatedMapStars = { ...current.mapStars, [mapId]: bestStars };

  // Sequential progression: Mirpur -> Farmgate -> New Market
  const MAP_ORDER = ["mirpur", "farmgate", "newmarket"];
  const newlyUnlocked: string[] = [];
  const updatedUnlocked = [...current.unlockedMaps];

  if (bestStars >= 1) {
    const currentIndex = MAP_ORDER.indexOf(mapId);
    if (currentIndex >= 0 && currentIndex < MAP_ORDER.length - 1) {
      const nextMap = MAP_ORDER[currentIndex + 1];
      if (!updatedUnlocked.includes(nextMap)) {
        updatedUnlocked.push(nextMap);
        newlyUnlocked.push(nextMap);
      }
    }
  }

  saveSaveData({
    mapStars: updatedMapStars,
    unlockedMaps: updatedUnlocked,
  });

  return { mapStars: updatedMapStars, newlyUnlocked };
}

/**
 * Gets recorded stars for a specific map.
 */
export function getMapStars(mapId: string): number {
  const current = loadSaveData();
  return current.mapStars[mapId] ?? 0;
}
