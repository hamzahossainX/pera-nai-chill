import { LocalizedText } from "@/services/eventService";

export interface VillainArchetype {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  bio: LocalizedText;
  baseHp: number;
  speedMultiplier: number;
  dodgeRate: number;
  bodyScale: {
    head: number;
    torso: number;
    limbs: number;
  };
  runStyle: {
    cadence: number;
    armSwing: number;
    hunch: number;
    bounce: number;
  };
  outfitId: string;
  maskSlipThresholds: [number, number]; // e.g. [0.66, 0.33]
  reactions: {
    onHit: string;
    onDefeat: string;
  };
  taunt: LocalizedText;
  outfitColor: number; // Hex color fallback
  pantColor: number;
  unlockCostTaka: number;
  isUnlockedDefault: boolean;
}

export type VillainConfig = VillainArchetype;

export const VILLAINS: VillainArchetype[] = [
  {
    id: "phoneSnatcher",
    name: { bn: "ছিনতাইকারী", en: "Phone Snatcher" },
    title: { bn: "স্পিডি মোবাইল চোর", en: "Sprint Snatcher" },
    bio: {
      bn: "এক হাতে মোবাইল, আরেক হাতে পালানোর প্ল্যান!",
      en: "Phone in one hand, escape plan in the other!",
    },
    baseHp: 650,
    speedMultiplier: 1.2,
    dodgeRate: 0.35,
    bodyScale: { head: 1.15, torso: 0.95, limbs: 1.0 },
    runStyle: { cadence: 1.85, armSwing: 0.9, hunch: 0.14, bounce: 5 },
    outfitId: "phoneSnatcher",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "phonesFly", onDefeat: "phonesRain" },
    taunt: {
      bn: "মোবাইলে স্ক্রিনলক নাই তো? আমি গেলাম!",
      en: "No passcode on this phone? Thanks, bye!",
    },
    outfitColor: 0x0f172a,
    pantColor: 0x1e293b,
    unlockCostTaka: 0,
    isUnlockedDefault: true,
  },
  {
    id: "pickpocket",
    name: { bn: "পকেটমার", en: "Pickpocket" },
    title: { bn: "ভিড়ের চতুর হাতসাফাই", en: "Crowd Sleight-of-Hand" },
    bio: {
      bn: "গামছা মুখে গুঁজে বাসের ভিড়ে মানিব্যাগ গায়েব করে!",
      en: "Face wrapped in gamchha, swipes wallets in packed buses!",
    },
    baseHp: 550,
    speedMultiplier: 1.25,
    dodgeRate: 0.45,
    bodyScale: { head: 1.2, torso: 0.9, limbs: 0.95 },
    runStyle: { cadence: 1.95, armSwing: 1.0, hunch: 0.18, bounce: 4 },
    outfitId: "pickpocket",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "walletsFly", onDefeat: "walletsRain" },
    taunt: {
      bn: "ভাইরে ভাই, মানিব্যাগে ১০০ টাকাও নাই?!",
      en: "Brother, not even 100 Taka in your wallet?!",
    },
    outfitColor: 0xd97706,
    pantColor: 0x1e3a8a,
    unlockCostTaka: 300,
    isUnlockedDefault: false,
  },
  {
    id: "cableChor",
    name: { bn: "তার-চোর", en: "Cable Chor" },
    title: { bn: "রাতের তামা সংগ্রাহক", en: "Midnight Copper Hoarder" },
    bio: {
      bn: "লুঙ্গি গুঁজে সেফটি ভেস্ট পরে তার কেটে নিয়ে যায়!",
      en: "Tucked lungi and safety vest, chops street wires!",
    },
    baseHp: 950,
    speedMultiplier: 0.9,
    dodgeRate: 0.15,
    bodyScale: { head: 1.0, torso: 1.1, limbs: 1.05 },
    runStyle: { cadence: 1.45, armSwing: 0.65, hunch: 0.1, bounce: 7 },
    outfitId: "cableChor",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "sparksFly", onDefeat: "cableDrop" },
    taunt: {
      bn: "লোহার চেয়ে তামার দাম বেশি, বুঝলা মামা!",
      en: "Copper sells for way more than steel, mate!",
    },
    outfitColor: 0xf97316,
    pantColor: 0x047857,
    unlockCostTaka: 500,
    isUnlockedDefault: false,
  },
  {
    id: "manholeChor",
    name: { bn: "ম্যানহোল-চোর", en: "Manhole Chor" },
    title: { bn: "ঢাকনা ঢালধারী", en: "Cast-Iron Shield Bearer" },
    bio: {
      bn: "ভারী ঢাকনা হাতে ঢাল বানিয়ে চপ্পল ঠেকায়!",
      en: "Blocks incoming slippers with a heavy cast-iron cover!",
    },
    baseHp: 1100,
    speedMultiplier: 0.85,
    dodgeRate: 0.1,
    bodyScale: { head: 1.05, torso: 1.2, limbs: 1.1 },
    runStyle: { cadence: 1.35, armSwing: 0.5, hunch: 0.2, bounce: 8 },
    outfitId: "manholeChor",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "shieldClang", onDefeat: "coverClatter" },
    taunt: {
      bn: "চপ্পল মারলে ঢাকনায় বাড়ি খাইয়া নিজের গায়েই লাগবে!",
      en: "Throw slippers, they just ricochet back at you!",
    },
    outfitColor: 0x475569,
    pantColor: 0x0f172a,
    unlockCostTaka: 700,
    isUnlockedDefault: false,
  },
  {
    id: "eidMarketChor",
    name: { bn: "ঈদ-বাজার চোর", en: "Eid Market Chor" },
    title: { bn: "শপিং ব্যাগ শিকারী", en: "Festival Shopping Looter" },
    bio: {
      bn: "চকচকে পাঞ্জাবি আর সানগ্লাস পরে শপিং ব্যাগ ছিনতাই করে!",
      en: "Flashy panjabi and shades, swiping festival bags!",
    },
    baseHp: 750,
    speedMultiplier: 1.05,
    dodgeRate: 0.25,
    bodyScale: { head: 1.1, torso: 1.0, limbs: 1.0 },
    runStyle: { cadence: 1.6, armSwing: 0.85, hunch: 0.08, bounce: 6 },
    outfitId: "eidMarketChor",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "bagsDrop", onDefeat: "shoppingSpill" },
    taunt: {
      bn: "ঈদের নতুন জামা, একদম ফ্রি ফ্রি!",
      en: "Brand new Eid clothes, 100% free!",
    },
    outfitColor: 0xa855f7,
    pantColor: 0xffffff,
    unlockCostTaka: 600,
    isUnlockedDefault: false,
  },
  {
    id: "chickenChor",
    name: { bn: "মুরগি-চোর", en: "Chicken Chor" },
    title: { bn: "কক-কক ডাকা ডাকাত", en: "The Clucking Bandit" },
    bio: {
      bn: "বগলের নিচে দেশি মোরগ চেপে হ্যাঁচকা টানে দৌড়!",
      en: "Sprints with a squawking rooster tucked under his arm!",
    },
    baseHp: 600,
    speedMultiplier: 1.25,
    dodgeRate: 0.4,
    bodyScale: { head: 1.15, torso: 0.95, limbs: 0.95 },
    runStyle: { cadence: 2.0, armSwing: 1.05, hunch: 0.12, bounce: 5 },
    outfitId: "chickenChor",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "feathersFly", onDefeat: "chickenEscape" },
    taunt: {
      bn: "আজকের রোস্ট আর বিরিয়ানি ফাইনাল!",
      en: "Tonight's chicken roast is guaranteed!",
    },
    outfitColor: 0x15803d,
    pantColor: 0xb45309,
    unlockCostTaka: 400,
    isUnlockedDefault: false,
  },
  {
    id: "chorSardar",
    name: { bn: "চোরের সর্দার", en: "Chor-er Sardar (Boss)" },
    title: { bn: "সিন্ডিকেটের মূল পান্ডা", en: "The Grand Crime Boss" },
    bio: {
      bn: "সোনার চেইন আর কোর্ট গায়ে, বস্তাভর্তি টাকা নিয়ে পালায়!",
      en: "Gold chain, suit jacket, fleeing with a sack of loot!",
    },
    baseHp: 1600,
    speedMultiplier: 1.0,
    dodgeRate: 0.2,
    bodyScale: { head: 1.2, torso: 1.3, limbs: 1.1 },
    runStyle: { cadence: 1.5, armSwing: 0.75, hunch: 0.05, bounce: 7 },
    outfitId: "chorSardar",
    maskSlipThresholds: [0.66, 0.33],
    reactions: { onHit: "coinsSpill", onDefeat: "lootRain" },
    taunt: {
      bn: "ছোটখাটো চোর না আমি, পুরো গ্যাং আমার নিয়ন্ত্রণে!",
      en: "I'm no small fry, the whole gang works for me!",
    },
    outfitColor: 0xca8a04,
    pantColor: 0x1e1b4b,
    unlockCostTaka: 1500,
    isUnlockedDefault: false,
  },
];

// Compatibility aliases for legacy Phase 1 ids
export const LEGACY_VILLAIN_MAP: Record<string, string> = {
  "corrupt-politician": "chorSardar",
  "traffic-cop": "manholeChor",
  "syndicate-boss": "cableChor",
  "slacker-babu": "pickpocket",
};

export const DEFAULT_VILLAIN = VILLAINS[0];

export function getVillainById(id: string): VillainArchetype {
  const resolvedId = LEGACY_VILLAIN_MAP[id] || id;
  return VILLAINS.find((v) => v.id === resolvedId) || VILLAINS[0];
}
