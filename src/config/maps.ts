export interface MapScenario {
  id: "mirpur" | "farmgate" | "newmarket";
  name: {
    bn: string;
    en: string;
  };
  tagline: {
    bn: string;
    en: string;
  };
  themeColor: string;
  accentColor: string;
  badgeText: string;
  skyKey: string;
  nearKey: string;
  roadKey: string;
  ambientEvent: string;
  hazards: {
    primary: string;
    secondary: string;
  };
  billboards: Array<{
    main: string;
    sub: string;
    bg: string;
    fg: string;
  }>;
}

export const MAP_SCENARIOS: MapScenario[] = [
  {
    id: "mirpur",
    name: {
      bn: "মিরপুর ১০ খোঁড়াখুঁড়ি ও মেট্রো জোন",
      en: "Mirpur 10 Digging & Metro Rail Zone",
    },
    tagline: {
      bn: "মেট্রোরেলের নিচে ড্রেন খোঁড়া আর লাল ধুলার ঝড়!",
      en: "Metro Rail pillars, construction trenches & red dust!",
    },
    themeColor: "#0284c7",
    accentColor: "#f59e0b",
    badgeText: "মিরপুর ১০",
    skyKey: "bg-sky-mirpur",
    nearKey: "bg-near-mirpur",
    roadKey: "bg-road",
    ambientEvent: "ধূলাবালি ও ম্যানহোল",
    hazards: {
      primary: "ভাঙা রাস্তা ও গর্ত",
      secondary: "মেট্রো পিলার ও ব্যারিকেড",
    },
    billboards: [
      { main: "মিরপুর ১০ মেট্রো", sub: "MIRPUR 10 MRT", bg: "#0284c7", fg: "#ffffff" },
      { main: "সাউথইস্ট ইউনিভার্সিটি", sub: "SOUTHEAST UNI", bg: "#047857", fg: "#fef08a" },
      { main: "মিরপুর ১২ বাস স্ট্যান্ড", sub: "MIRPUR 12 STAND", bg: "#b91c1c", fg: "#ffffff" },
      { main: "কাচ্চি ভাই বিরিয়ানি", sub: "KACCHI BHAI", bg: "#d97706", fg: "#ffffff" },
      { main: "বাটার অরিজিনাল জুতো", sub: "BATA SHOES", bg: "#dc2626", fg: "#ffffff" },
      { main: "লোডশেডিং স্পেশাল আইপিএস", sub: "IPS BATTERY", bg: "#4f46e5", fg: "#fef08a" },
      { main: "প্যারা নাই চিল টি স্টল", sub: "PERA NAI CHILL", bg: "#e11d48", fg: "#ffffff" },
    ],
  },
  {
    id: "farmgate",
    name: {
      bn: "ফার্মগেট রাশ আওয়ার",
      en: "Farmgate Rush Hour Chaos",
    },
    tagline: {
      bn: "ওভারব্রিজ, মানুষ আর বাসের তুমুল হট্টগোল!",
      en: "Chaotic foot overbridge, crowded buses & street hawkers!",
    },
    themeColor: "#f59e0b",
    accentColor: "#ef4444",
    badgeText: "ফার্মগেট",
    skyKey: "bg-sky-farmgate",
    nearKey: "bg-near-farmgate",
    roadKey: "bg-road",
    ambientEvent: "বাসের হর্ন ও জ্যাম",
    hazards: {
      primary: "চলন্ত হলুদ বাস ও লেগুনা",
      secondary: "ওভারব্রিজের ভিড়",
    },
    billboards: [
      { main: "ফার্মগেট ফুট ওভারব্রিজ", sub: "OVERBRIDGE", bg: "#d97706", fg: "#ffffff" },
      { main: "আনন্দ সিনেমা হল", sub: "ANANDA CINEMA", bg: "#dc2626", fg: "#fef08a" },
      { main: "তেজগাঁও কলেজ গেট", sub: "TEJGAON COLLEGE", bg: "#15803d", fg: "#ffffff" },
      { main: "গ্রিন রোড মোড়", sub: "GREEN ROAD CROSS", bg: "#0369a1", fg: "#ffffff" },
      { main: "হাঁড়িকাঁপানো স্পেশাল চা", sub: "SPECIAL TONG CHA", bg: "#b45309", fg: "#ffffff" },
      { main: "ফার্মগেট লেগুনা স্ট্যান্ড", sub: "HUMAN HAULER STAND", bg: "#7c3aed", fg: "#ffffff" },
      { main: "প্যারা নাই চিল জোন", sub: "PERA NAI CHILL", bg: "#e11d48", fg: "#ffffff" },
    ],
  },
  {
    id: "newmarket",
    name: {
      bn: "নিউ মার্কেট শপিং ক্যাওস",
      en: "New Market Shopping Chaos",
    },
    tagline: {
      bn: "১০০ টাকা ১০০ টাকা! ফুচকা আর শপিংয়ের মহোৎসব!",
      en: "100 Taka discount shouts, fuchka carts & packed lanes!",
    },
    themeColor: "#ec4899",
    accentColor: "#8b5cf6",
    badgeText: "নিউ মার্কেট",
    skyKey: "bg-sky-newmarket",
    nearKey: "bg-near-newmarket",
    roadKey: "bg-road",
    ambientEvent: "১০০ টাকা সেল ও ফুচকা",
    hazards: {
      primary: "ফুচকা-চটপটি ভ্যান",
      secondary: "শপিং ব্যাগ হাতে জনতা",
    },
    billboards: [
      { main: "নিউ মার্কেট ঐতিহাসিক তোরণ", sub: "NEW MARKET GATE", bg: "#db2777", fg: "#ffffff" },
      { main: "গাউছিয়া মার্কেট", sub: "GAUSIA MARKET", bg: "#9333ea", fg: "#fef08a" },
      { main: "চন্দ্রিমা সুপার মার্কেট", sub: "CHANDRIMA SUPER", bg: "#2563eb", fg: "#ffffff" },
      { main: "স্পেশাল ফুচকা ও চটপটি", sub: "CRISPY FUCHKA", bg: "#ea580c", fg: "#ffffff" },
      { main: "১০০ টাকা যে কোনো জামা", sub: "100 TK SALE", bg: "#dc2626", fg: "#fef08a" },
      { main: "প্যারা নাই চিল ফ্যাশন", sub: "PERA NAI CHILL", bg: "#059669", fg: "#ffffff" },
      { main: "নীলক্ষেত বইয়ের বাজার", sub: "NILKHET BOOKS", bg: "#4f46e5", fg: "#ffffff" },
    ],
  },
];

export const DEFAULT_MAP = MAP_SCENARIOS[0];
