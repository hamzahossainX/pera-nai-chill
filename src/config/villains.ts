import { LocalizedText } from "@/services/eventService";

export interface VillainConfig {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  baseHp: number;
  speedMultiplier: number;
  taunt: LocalizedText;
  outfitColor: number; // Hex color for rig torso
  pantColor: number;
}

export const VILLAINS: VillainConfig[] = [
  {
    id: "corrupt-politician",
    name: { en: "Chor Neta", bn: "চোর নেতা" },
    title: { en: "The Project Budget Swallower", bn: "উন্নয়ন প্রকল্পের বাজেট খেকো" },
    baseHp: 1000,
    speedMultiplier: 1.0,
    taunt: {
      en: "Catch me if you can! My Swiss bank account is full!",
      bn: "ধরতে পারবি না! টাকা সব সুইস ব্যাংকে চালান!",
    },
    outfitColor: 0xffffff, // White Panjabi
    pantColor: 0x334155,
  },
  {
    id: "traffic-cop",
    name: { en: "Chada Police", bn: "চাঁদা পুলিশ" },
    title: { en: "The Illegal Toll Master", bn: "সিগন্যালের চাঁদা কালেক্টর" },
    baseHp: 800,
    speedMultiplier: 1.15,
    taunt: {
      en: "Papers please! Where is your license fee?!",
      bn: "কাগজ কই? মামা সাইড করেন, চা খাইতে টাকা দেন!",
    },
    outfitColor: 0x1e3a8a, // Police Blue
    pantColor: 0x1e293b,
  },
  {
    id: "syndicate-boss",
    name: { en: "Bazar Syndicate", bn: "বাজার সিন্ডিকেট" },
    title: { en: "The Onion & Egg Hoarder", bn: "পেঁয়াজ আর ডিমের মজুতদার" },
    baseHp: 1250,
    speedMultiplier: 0.85,
    taunt: {
      en: "Tomorrow onions are 300 Taka per kg, haha!",
      bn: "কালকে থেকে পেঁয়াজ ৩০০ টাকা কেজি, হাহাহা!",
    },
    outfitColor: 0x854d0e, // Gold / brown
    pantColor: 0x451a03,
  },
  {
    id: "slacker-babu",
    name: { en: "Fakir Babu", bn: "ফাঁকিবাজ বাবু" },
    title: { en: "The Govt Office Deserter", bn: "লাঞ্চের নাম করে গায়েব কেরানী" },
    baseHp: 750,
    speedMultiplier: 1.25,
    taunt: {
      en: "Officer is at lunch! Come back next Thursday!",
      bn: "স্যার এখন লাঞ্চে! সামনের বৃহস্পতিবার আসেন!",
    },
    outfitColor: 0x059669, // Green shirt
    pantColor: 0x1f2937,
  },
];

export const DEFAULT_VILLAIN = VILLAINS[0];
