export interface RigSlotTextures {
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
  defaultColors?: {
    outfit?: number;
    pants?: number;
    accent?: number;
  };
}

export const OUTFITS: Record<string, OutfitDefinition> = {
  phoneSnatcher: {
    id: "phoneSnatcher",
    name: { bn: "ছিনতাইকারী হুডি", en: "Snatcher Hoodie" },
    slots: {
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
      shadow: "rig-shadow",
    },
    defaultColors: {
      outfit: 0x0f172a,
      pants: 0x1e293b,
      accent: 0xdc2626,
    },
  },
};
