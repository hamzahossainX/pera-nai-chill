import { WeatherType, TimeOfDay } from "@/store/useGameStore";

export interface DailyChallenge {
  dateKey: string;
  title: { bn: string; en: string };
  description: { bn: string; en: string };
  villainId: string;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  targetCombo: number;
  rewardTaka: number;
  event?: "loadshedding" | "pollution" | "strike" | "flood";
  badgeId?: string;
}

const DAILY_CHALLENGES: Omit<DailyChallenge, "dateKey">[] = [
  {
    title: {
      bn: "লোডশেডিংয়ে ফোন চোরকে ফাঁদে ফেলো",
      en: "Trap the Phone Snatcher during loadshedding",
    },
    description: {
      bn: "রাতের লোডশেডিংয়ে ফোন চোরকে অন্তত ৮x কম্বো দিয়ে ধরো!",
      en: "Catch the Phone Snatcher during night loadshedding with at least an 8x combo!",
    },
    villainId: "phoneSnatcher",
    weather: "clear",
    timeOfDay: "night",
    targetCombo: 8,
    rewardTaka: 150,
    event: "loadshedding",
    badgeId: "nightLoadshedding",
  },
];

function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayChallenge(date = new Date()): DailyChallenge {
  const dateKey = getDateKey(date);
  let hash = 0;

  for (const character of dateKey) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  const index = Math.abs(hash) % DAILY_CHALLENGES.length;
  return { ...DAILY_CHALLENGES[index], dateKey };
}
