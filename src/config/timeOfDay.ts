export interface TimeOfDayPhaseConfig {
  id: "dawn" | "noon" | "goldenHour" | "night";
  name: { en: string; bn: string };
  skyColors: [number, number, number, number]; // Top-left, top-right, bot-left, bot-right
  ambientTint: number; // Hex tint applied to buildings and road
  shadowAlpha: number;
  shadowScaleX: number;
  streetLightsAlpha: number; // 0 (day) to 1.0 (night)
  starsAlpha: number;
  moonAlpha: number;
}

export const TIME_OF_DAY_CONFIGS: Record<string, TimeOfDayPhaseConfig> = {
  dawn: {
    id: "dawn",
    name: { en: "Morning / Dawn", bn: "ভোর / সকাল" },
    skyColors: [0xfbcfe8, 0xfde047, 0xf472b6, 0xfbbf24],
    ambientTint: 0xfef3c7,
    shadowAlpha: 0.45,
    shadowScaleX: 1.35,
    streetLightsAlpha: 0.15,
    starsAlpha: 0.0,
    moonAlpha: 0.1,
  },
  noon: {
    id: "noon",
    name: { en: "Noon / Midday", bn: "দুপুর" },
    skyColors: [0x0284c7, 0x38bdf8, 0x7dd3fc, 0xbae6fd],
    ambientTint: 0xffffff,
    shadowAlpha: 0.65,
    shadowScaleX: 0.9,
    streetLightsAlpha: 0.0,
    starsAlpha: 0.0,
    moonAlpha: 0.0,
  },
  goldenHour: {
    id: "goldenHour",
    name: { en: "Golden Hour / Sunset", bn: "গোধূলি / সন্ধ্যা" },
    skyColors: [0x581c87, 0x9333ea, 0xd97706, 0xf59e0b],
    ambientTint: 0xffedd5,
    shadowAlpha: 0.55,
    shadowScaleX: 1.4,
    streetLightsAlpha: 0.5,
    starsAlpha: 0.2,
    moonAlpha: 0.35,
  },
  night: {
    id: "night",
    name: { en: "Night", bn: "রাত" },
    skyColors: [0x020617, 0x090d16, 0x0f172a, 0x1e1b4b],
    ambientTint: 0x64748b, // Deep night tint with full readability
    shadowAlpha: 0.75,
    shadowScaleX: 1.1,
    streetLightsAlpha: 1.0,
    starsAlpha: 0.85,
    moonAlpha: 0.95,
  },
};
