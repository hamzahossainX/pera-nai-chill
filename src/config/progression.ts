import { MAP_ORDER, MapId } from "@/config/maps";

export function getStarRating(isWin: boolean, combo: number) {
  if (!isWin) return 0;
  if (combo >= 10) return 3;
  if (combo >= 5) return 2;
  return 1;
}

export function getNextMapId(currentMapId: MapId): MapId | undefined {
  const nextIndex = MAP_ORDER.indexOf(currentMapId) + 1;
  return MAP_ORDER[nextIndex];
}
