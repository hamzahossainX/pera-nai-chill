import { LocalizedText } from "@/services/eventService";

export interface WeaponConfig {
  id: string;
  name: LocalizedText;
  damage: number;
  cooldownSec: number;
  staminaCost: number;
  rageGain: number;
  takaReward: number;
  type: "melee" | "dash" | "projectile" | "ultimate";
  soundKey: string;
  hotkey: string;
  description: LocalizedText;
}

export const WEAPONS: WeaponConfig[] = [
  {
    id: "slap",
    name: { en: "Slap", bn: "চড়" },
    damage: 15,
    cooldownSec: 0.3,
    staminaCost: 10,
    rageGain: 5,
    takaReward: 10,
    type: "melee",
    soundKey: "sfx-slap",
    hotkey: "1",
    description: {
      en: "Fast, stinging slap across the face.",
      bn: "দ্রুত ও কড়া চড়ের বাড়ি।",
    },
  },
  {
    id: "punch",
    name: { en: "Punch", bn: "ঘুষি" },
    damage: 30,
    cooldownSec: 0.5,
    staminaCost: 18,
    rageGain: 10,
    takaReward: 20,
    type: "melee",
    soundKey: "sfx-punch",
    hotkey: "2",
    description: {
      en: "Heavy gut punch with solid knockback.",
      bn: "পেটে এক মোক্ষম ঘুষি।",
    },
  },
  {
    id: "kick",
    name: { en: "Flying Kick", bn: "উড়ন্ত লাথি" },
    damage: 55,
    cooldownSec: 0.8,
    staminaCost: 28,
    rageGain: 16,
    takaReward: 35,
    type: "dash",
    soundKey: "sfx-kick",
    hotkey: "3",
    description: {
      en: "Airborne dash kick that staggers the villain.",
      bn: "উড়ে গিয়ে পিঠে ড্রপ কিক।",
    },
  },
  {
    id: "chappal",
    name: { en: "Flying Chappal", bn: "উড়ন্ত জুতা" },
    damage: 85,
    cooldownSec: 1.2,
    staminaCost: 35,
    rageGain: 22,
    takaReward: 50,
    type: "projectile",
    soundKey: "sfx-whoosh",
    hotkey: "4",
    description: {
      en: "Legendary precision projectile, arcs across any lane.",
      bn: "অমোঘ নির্ভুল উড়ন্ত জুতা!",
    },
  },
];

export const ULTIMATE_WEAPON: WeaponConfig = {
  id: "chappal-storm",
  name: { en: "Chappal Storm!", bn: "জুতার ঝড়!" },
  damage: 350,
  cooldownSec: 15.0,
  staminaCost: 0,
  rageGain: 0,
  takaReward: 150,
  type: "ultimate",
  soundKey: "sfx-ultimate",
  hotkey: "Space",
  description: {
    en: "Full-screen barrage of rapid-fire chappals with slow-motion satisfaction.",
    bn: "চারিদিক থেকে শত শত জুতার অবিরাম বৃষ্টি!",
  },
};
