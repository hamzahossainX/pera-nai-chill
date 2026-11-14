export interface RigSlotTextures {
  neck?: string;
  headBack?: string;
  headFront?: string;
  maskUpper?: string;
  maskLower?: string;
  torso: string;
  upperArm: string;
  lowerArm: string;
  hand: string;
  thigh: string;
  shin: string;
  foot: string;
  handProp?: string;
  backProp?: string;
  frontProp?: string;
  shadow?: string;
}

export interface OutfitDefinition {
  id: string;
  name: { bn: string; en: string };
  slots: RigSlotTextures;
  faceAccessories?: {
    upper: { y: number; width: number; height: number };
    lower: { y: number; width: number; height: number };
  };
  defaultColors?: {
    outfit?: number;
    pants?: number;
    accent?: number;
  };
}

export const OUTFITS: Record<string, OutfitDefinition> = {
  chaserJanata: {
    id: "chaserJanata",
    name: { bn: "আম-জনতা হিরো পোশাক", en: "Aam-Janata Hero Casual" },
    slots: {
      neck: "rig-neck",
      torso: "chaser-torso",
      upperArm: "chaser-arm-upper",
      lowerArm: "chaser-arm-lower",
      hand: "chaser-hand",
      thigh: "chaser-thigh",
      shin: "chaser-shin",
      foot: "chaser-foot",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0x059669,
      pants: 0x1e3a8a,
      accent: 0xf59e0b,
    },
  },
  phoneSnatcher: {
    id: "phoneSnatcher",
    name: { bn: "ছিনতাইকারী হুডি", en: "Snatcher Hoodie" },
    // Frame the 58px photo; texture resolution must not determine mask coverage.
    faceAccessories: {
      upper: { y: -28, width: 64, height: 20 },
      lower: { y: 28, width: 64, height: 24 },
    },
    slots: {
      neck: "rig-neck",
      headBack: "snatcher-hood-back",
      headFront: "snatcher-hood-front",
      maskUpper: "snatcher-mask-upper",
      maskLower: "snatcher-mask-lower",
      torso: "snatcher-torso",
      upperArm: "snatcher-arm-upper",
      lowerArm: "snatcher-arm-lower",
      hand: "snatcher-hand",
      thigh: "snatcher-thigh",
      shin: "snatcher-shin",
      foot: "snatcher-foot",
      handProp: "snatcher-prop-phone",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0x0f172a,
      pants: 0x1e293b,
      accent: 0xdc2626,
    },
  },
  pickpocket: {
    id: "pickpocket",
    name: { bn: "পকেটমার জামা ও গামছা", en: "Pickpocket Gamchha & Stripes" },
    slots: {
      neck: "rig-neck",
      maskLower: "pickpocket-mask-lower",
      torso: "pickpocket-torso",
      upperArm: "pickpocket-arm-upper",
      lowerArm: "pickpocket-arm-lower",
      hand: "pickpocket-hand",
      thigh: "pickpocket-thigh",
      shin: "pickpocket-shin",
      foot: "pickpocket-foot",
      handProp: "pickpocket-prop-wallet",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0xd97706,
      pants: 0x1e3a8a,
      accent: 0xef4444,
    },
  },
  cableChor: {
    id: "cableChor",
    name: { bn: "তার-চোরের সেফটি ভেস্ট", en: "Cable Chor High-Vis Vest" },
    slots: {
      neck: "rig-neck",
      torso: "cableChor-torso",
      upperArm: "cableChor-arm-upper",
      lowerArm: "cableChor-arm-lower",
      hand: "cableChor-hand",
      thigh: "cableChor-thigh",
      shin: "cableChor-shin",
      foot: "cableChor-foot",
      handProp: "cableChor-prop-cutter",
      backProp: "cableChor-prop-wire-coil",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0x84cc16,
      pants: 0x0284c7,
      accent: 0xf59e0b,
    },
  },
  manholeChor: {
    id: "manholeChor",
    name: { bn: "ম্যানহোল-চোরের বানিয়ান", en: "Manhole Chor Ribbed Vest" },
    slots: {
      neck: "rig-neck",
      torso: "manholeChor-torso",
      upperArm: "manholeChor-arm-upper",
      lowerArm: "manholeChor-arm-lower",
      hand: "manholeChor-hand",
      thigh: "manholeChor-thigh",
      shin: "manholeChor-shin",
      foot: "manholeChor-foot",
      handProp: "manholeChor-prop-manhole-cover",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0xf1f5f9,
      pants: 0x334155,
      accent: 0x475569,
    },
  },
  eidMarketChor: {
    id: "eidMarketChor",
    name: { bn: "ঈদ মার্কেটের চকচকে পাঞ্জাবি", en: "Eid Market Festive Panjabi" },
    slots: {
      neck: "rig-neck",
      headFront: "eidMarketChor-headFront",
      torso: "eidMarketChor-torso",
      upperArm: "eidMarketChor-arm-upper",
      lowerArm: "eidMarketChor-arm-lower",
      hand: "eidMarketChor-hand",
      thigh: "eidMarketChor-thigh",
      shin: "eidMarketChor-shin",
      foot: "eidMarketChor-foot",
      handProp: "eidMarketChor-prop-shopping-bags",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0x881337,
      pants: 0xf8fafc,
      accent: 0xfbbf24,
    },
  },
  chickenChor: {
    id: "chickenChor",
    name: { bn: "মুরগি-চোরের দেশি মুরগি লুক", en: "Chicken Chor Lungi & Deshi Rooster" },
    slots: {
      neck: "rig-neck",
      torso: "chickenChor-torso",
      upperArm: "chickenChor-arm-upper",
      lowerArm: "chickenChor-arm-lower",
      hand: "chickenChor-hand",
      thigh: "chickenChor-thigh",
      shin: "chickenChor-shin",
      foot: "chickenChor-foot",
      handProp: "chickenChor-prop-chicken",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0x15803d,
      pants: 0x1e3a8a,
      accent: 0xea580c,
    },
  },
  chorSardar: {
    id: "chorSardar",
    name: { bn: "চোরের সরদারের ব্লেজার ও স্যুটকেস", en: "Sardar Mafia Blazer & Briefcase" },
    slots: {
      neck: "rig-neck",
      headFront: "chorSardar-headFront",
      torso: "chorSardar-torso",
      upperArm: "chorSardar-arm-upper",
      lowerArm: "chorSardar-arm-lower",
      hand: "chorSardar-hand",
      thigh: "chorSardar-thigh",
      shin: "chorSardar-shin",
      foot: "chorSardar-foot",
      handProp: "chorSardar-prop-briefcase",
      shadow: "rig-shadow-soft",
    },
    defaultColors: {
      outfit: 0x4c0519,
      pants: 0x1e1b4b,
      accent: 0xf59e0b,
    },
  },
};
