export interface CrimeTag {
  id: string;
  title: {
    bn: string;
    en: string;
  };
  description: {
    bn: string;
    en: string;
  };
  bountyTaka: number;
  badgeText: string;
  badgeColor: string;
  icon: string;
}

export const CRIMES: CrimeTag[] = [
  {
    id: "bkash_block",
    title: {
      bn: "বিকাশে টাকা ধার নিয়ে ব্লক দিছে!",
      en: "Borrowed money on bKash & blocked!",
    },
    description: {
      bn: "ভাই ৫ মিনিটের মধ্যে ফেরত দিচ্ছি বলে লাপাত্তা!",
      en: "Said 'returning in 5 mins' and vanished!",
    },
    bountyTaka: 500,
    badgeText: "বিকাশ চোর",
    badgeColor: "#e11d48",
    icon: "💸",
  },
  {
    id: "project_sleep",
    title: {
      bn: "গ্রুপ প্রজেক্টের দিনে ঘুমাইয়া ছিল!",
      en: "Slept during group project submission!",
    },
    description: {
      bn: "পুরো সেমিস্টার ফাঁকি দিয়ে প্রেজেন্টেশনে গায়েব!",
      en: "Slacked all semester and vanished on presentation day!",
    },
    bountyTaka: 350,
    badgeText: "ফাঁকিবাজ",
    badgeColor: "#f59e0b",
    icon: "😴",
  },
  {
    id: "kacchi_roast",
    title: {
      bn: "বিয়ের দাওয়াতে বড় খাসির রান নিয়ে ভাগছে!",
      en: "Ran off with the biggest mutton roast!",
    },
    description: {
      bn: "নিজের টেবিলে তো খাইছেই, পাশের টেবিল থেকেও মাংস সরাইছে!",
      en: "Ate at his own table and raided the next table too!",
    },
    bountyTaka: 450,
    badgeText: "খাসি খাদক",
    badgeColor: "#d97706",
    icon: "🍗",
  },
  {
    id: "cha_vangti",
    title: {
      bn: "চা খেয়ে বলে ভাই ভাংতি নাই!",
      en: "Drank tea and claimed no small change!",
    },
    description: {
      bn: "টংয়ের মামাকে ৫০০ টাকার নোট দেখায়া পালিয়ে যাচ্ছে!",
      en: "Showed a 500 Tk note for a 6 Tk tea and ran!",
    },
    bountyTaka: 200,
    badgeText: "ভাংতি চোর",
    badgeColor: "#0284c7",
    icon: "☕",
  },
  {
    id: "boss_troll",
    title: {
      bn: "অফিস গ্রুপে ভুল করে বসের মিম পাঠাইছে!",
      en: "Sent funny boss meme to company main chat!",
    },
    description: {
      bn: "ডিলিট করার আগেই বস সিন করে কল দিচ্ছে!",
      en: "Boss saw it before it could be deleted!",
    },
    bountyTaka: 600,
    badgeText: "অফিস কাণ্ড",
    badgeColor: "#8b5cf6",
    icon: "📱",
  },
  {
    id: "rickshaw_palaise",
    title: {
      bn: "রিকশা ভাড়া না দিয়ে ভেগেছে!",
      en: "Ran off without paying rickshaw mama!",
    },
    description: {
      bn: "মামাকে বলছে এটিএম থেকে টাকা এনে দিচ্ছি!",
      en: "Told mama 'getting cash from ATM' and sprinted!",
    },
    bountyTaka: 300,
    badgeText: "রিকশা ফাঁকি",
    badgeColor: "#10b981",
    icon: "🛺",
  },
];

export const DEFAULT_CRIME = CRIMES[0];
