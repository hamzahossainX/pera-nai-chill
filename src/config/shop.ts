export interface ShopItem {
  id: string;
  category: "chappal" | "outfit" | "sound";
  name: { bn: string; en: string };
  description: { bn: string; en: string };
  price: number;
  icon: string;
  isDefault?: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Chappals
  {
    id: "chappal-bata",
    category: "chappal",
    name: { bn: "বাটা হাওয়াই চপ্পল", en: "Bata Hawai Chappal" },
    description: { bn: "ঐতিহাসিক নীল-সাদা রাবার স্যান্ডেল।", en: "Classic blue rubber slipper." },
    price: 0,
    icon: "🩴",
    isDefault: true,
  },
  {
    id: "chappal-leather",
    category: "chappal",
    name: { bn: "পাদুকা প্রো চামড়ার চপ্পল", en: "Paduka Pro Leather" },
    description: { bn: "খাঁটি ভারী চামড়ার চটি। বিরাট আঘাত!", en: "Heavy pure leather sandal with brass buckle." },
    price: 300,
    icon: "👞",
  },
  {
    id: "chappal-golden",
    category: "chappal",
    name: { bn: "সোনার চপ্পল (২৪ ক্যারেট)", en: "Shonar Chappal (24K)" },
    description: { bn: "চকচকে সোনার বিয়ের চপ্পল। ডাবল টাকা!", en: "24K gold bridal sandal with 2x Taka coins!" },
    price: 800,
    icon: "✨",
  },
  {
    id: "chappal-titanium",
    category: "chappal",
    name: { bn: "টাইটানিয়াম সাইবার চপ্পল", en: "Titanium Cyber Slipper" },
    description: { bn: "বুলেটপ্রুফ মেটাল চপ্পল। সর্বোচ্চ ক্ষতি!", en: "Heavy-duty titanium metal slipper." },
    price: 1500,
    icon: "⚡",
  },

  // Outfits
  {
    id: "outfit-lungi",
    category: "outfit",
    name: { bn: "দেশি চেক লুঙ্গি ও ফতুয়া", en: "Deshi Check Lungi" },
    description: { bn: "আরামদায়ক বাতাসি লুঙ্গি। বাতাসের গতিতে দৌড়!", en: "Aerodynamic classic checkered lungi." },
    price: 250,
    icon: "🎽",
    isDefault: true,
  },
  {
    id: "outfit-panjabi",
    category: "outfit",
    name: { bn: "ঈদ স্পেশাল জরি পাঞ্জাবি", en: "Eid Special Panjabi" },
    description: { bn: "চকমকে ঈদের পাঞ্জাবি। আভিজাত্যের ছাপ!", en: "Festive golden embroidered Eid panjabi." },
    price: 500,
    icon: "🥋",
  },
  {
    id: "outfit-cricket",
    category: "outfit",
    name: { bn: "টাইগার ক্রিকেট জার্সি", en: "Tiger Cricket Jersey" },
    description: { bn: "লাল-সবুজ ক্রিকেট জার্সি। স্ট্যামিনা বুস্ট!", en: "Red & Green national cricket team colors." },
    price: 750,
    icon: "🏏",
  },

  // Sound Packs
  {
    id: "sound-dhaka-vintage",
    category: "sound",
    name: { bn: "পুরান ঢাকা রেট্রো সাউন্ড", en: "Old Dhaka Retro Audio" },
    description: { bn: "রিকশার ঘণ্টার টুংটাং ও ঢাকাইয়া হাঁকডাক।", en: "Vintage rickshaw bells and old bazaar soundscapes." },
    price: 400,
    icon: "🔔",
  },
  {
    id: "sound-comic-punch",
    category: "sound",
    name: { bn: "টম অ্যান্ড জেরি কার্টুন সাউন্ড", en: "Slapstick Cartoon Audio" },
    description: { bn: "উদ্ভট কার্টুন স্প্রিং ও স্লাইড হুইসিল সাউন্ড!", en: "Boing springs, slide whistles, and comical frying pan thuds!" },
    price: 600,
    icon: "🎺",
  },
];
