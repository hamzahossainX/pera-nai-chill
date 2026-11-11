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

export interface ChappalVariety {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  damage: number;
  flightDurationMs: number;
  takaMultiplier: number;
  textureKey: string;
  soundKey: string;
  icon: string;
}

export const CHAPPAL_VARIETIES: ChappalVariety[] = [
  {
    id: "chappal-bata",
    name: { en: "Bata Hawai Chappal", bn: "বাটা হাওয়াই চপ্পল" },
    description: {
      en: "Classic blue rubber slipper. Lightweight, high-velocity Dhaka classic.",
      bn: "ঐতিহাসিক নীল-সাদা রাবার স্যান্ডেল। দ্রুত ও নিখুঁত নিশানা!",
    },
    damage: 85,
    flightDurationMs: 420,
    takaMultiplier: 1.0,
    textureKey: "projectile-chappal",
    soundKey: "sfx-whoosh",
    icon: "🩴",
  },
  {
    id: "chappal-leather",
    name: { en: "Paduka Pro Leather", bn: "পাদুকা প্রো চামড়ার চপ্পল" },
    description: {
      en: "Heavy pure leather sandal with brass buckle. Heavy knockback and damage.",
      bn: "খাঁটি ভারী চামড়ার চটি। বিরাট ওজন ও প্রবল আঘাত!",
    },
    damage: 130,
    flightDurationMs: 500,
    takaMultiplier: 1.25,
    textureKey: "projectile-chappal-leather",
    soundKey: "sfx-punch",
    icon: "👞",
  },
  {
    id: "chappal-golden",
    name: { en: "Shonar Chappal (24K)", bn: "সোনার চপ্পল (২৪ ক্যারেট)" },
    description: {
      en: "Dazzling 24K gold bridal sandal. Rains 2x Taka coins on impact!",
      bn: "চকচকে সোনার বিয়ের চপ্পল। প্রতি আঘাতে ডাবল টাকা লাভ!",
    },
    damage: 105,
    flightDurationMs: 380,
    takaMultiplier: 2.0,
    textureKey: "projectile-chappal-golden",
    soundKey: "sfx-slap",
    icon: "✨",
  },
];

export const DEFAULT_CHAPPAL = CHAPPAL_VARIETIES[0];

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
