export interface Achievement {
  id: string;
  name: { bn: string; en: string };
  description: { bn: string; en: string };
  rewardTaka: number;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    name: { bn: "প্রথম বিচার!", en: "First Justice!" },
    description: { bn: "প্রথমবার একজন চোরকে ধরে থানায় পাঠানো।", en: "Catch and surrender your first thief." },
    rewardTaka: 100,
    icon: "🎯",
  },
  {
    id: "chappal_sniper",
    name: { bn: "চপ্পল স্নাইপার", en: "Chappal Sniper" },
    description: { bn: "উড়ন্ত চপ্পল দিয়ে ৫০ বার সফল আঘাত করা।", en: "Land 50 direct flying chappal hits." },
    rewardTaka: 250,
    icon: "🩴",
  },
  {
    id: "combo_master",
    name: { bn: "তুফান কম্বো মাস্টার", en: "Storm Combo Master" },
    description: { bn: "একটানা ১৫x কম্বো অর্জন করা।", en: "Achieve a continuous 15x hit combo." },
    rewardTaka: 300,
    icon: "🔥",
  },
  {
    id: "rich_kid",
    name: { bn: "ঢাকার কোটিপতি", en: "Dhaka Millionaire" },
    description: { bn: "ওয়ালেটে ১০০০ টাকার বেশি জমা করা।", en: "Accumulate more than 1000 Taka." },
    rewardTaka: 200,
    icon: "💰",
  },
  {
    id: "weather_warrior",
    name: { bn: "বৃষ্টির বীর", en: "Monsoon Warrior" },
    description: { bn: "ঝুম বৃষ্টি বা জলাবদ্ধতার মধ্যে সফল দৌড় সম্পন্ন করা।", en: "Complete a chase during rain or waterlogging." },
    rewardTaka: 200,
    icon: "🌧️",
  },
  {
    id: "taunt_king",
    name: { bn: "তাচ্ছিল্যের রাজা", en: "Taunt King" },
    description: { bn: "দৌড়ের মধ্যে চোরকে তাচ্ছিল্য করা।", en: "Taunt the thief during the chase." },
    rewardTaka: 150,
    icon: "📢",
  },
  {
    id: "sardar_down",
    name: { bn: "সর্দার খতম!", en: "Boss Defeated!" },
    description: { bn: "চোরের সর্দারকে দ্বিতীয় ফেজে গিয়ে পরাস্ত করা।", en: "Defeat Chor-er Sardar in Phase 2." },
    rewardTaka: 500,
    icon: "👑",
  },
];
