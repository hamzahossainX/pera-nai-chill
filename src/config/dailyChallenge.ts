// Daily Challenge configuration (Phase 3 placeholder)
// Each challenge is seeded by the current date (local only) and defines a
// specific scenario with optional constraints.
// Example shape:
// {
//   id: string; // unique key
//   description_bn: string; // Bangla description shown to user
//   description_en: string; // English description
//   conditions: {
//     timeOfDay?: "morning" | "noon" | "evening" | "night";
//     event?: "loadshedding" | "pollution" | "strike" | "flood";
//     villainArchetype?: string; // matches key in villains.ts
//   };
//   rewardTaka: number;
//   badgeId?: string; // reference to achievement badge
// }

export const DAILY_CHALLENGES: Record<string, any> = {
  "night-loadshedding": {
    id: "night-loadshedding",
    description_bn: "রাতের লোডশেডিং‑এ ফোন চোরকে ফাঁদে ফেলো",
    description_en: "Trap the Phone Snatcher during night loadshedding",
    conditions: { timeOfDay: "night", event: "loadshedding", villainArchetype: "phoneSnatcher" },
    rewardTaka: 5000,
    badgeId: "nightLoadshdding",
  },
  // Add more challenges as needed
};