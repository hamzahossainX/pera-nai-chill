import { VILLAINS } from "@/config/villains";
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
}

export function getTodayChallenge(): DailyChallenge {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

  // Deterministic hash based on date string
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const villainList = VILLAINS;
  const villain = villainList[positiveHash % villainList.length];

  const weathers: WeatherType[] = ["rain", "clear", "fog", "flood"];
  const weather = weathers[positiveHash % weathers.length];

  const times: TimeOfDay[] = ["night", "goldenHour", "noon", "dawn"];
  const timeOfDay = times[(positiveHash >> 2) % times.length];

  const targetCombo = 8 + (positiveHash % 8); // 8 - 15 combo

  return {
    dateKey,
    title: {
      bn: `দৈনিক মিশন: ${villain.name.bn} পাকড়াও!`,
      en: `Daily Mission: Catch ${villain.name.en}!`,
    },
    description: {
      bn: `${timeOfDay === "night" ? "রাতের আঁধারে" : "রাস্তায়"} ${villain.name.bn}কে ${targetCombo}x কম্বো দিয়ে পরাস্ত করুন!`,
      en: `Defeat ${villain.name.en} with at least ${targetCombo}x combo!`,
    },
    villainId: villain.id,
    weather,
    timeOfDay,
    targetCombo,
    rewardTaka: 450,
  };
}
