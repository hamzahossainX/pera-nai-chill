"use client";

import { useGameStore } from "@/store/useGameStore";

export type Language = "en" | "bn";
export type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    settings: "SETTINGS",
    close: "Close",
    sound: "Sound",
    haptics: "Haptics",
    graphicsQuality: "Graphics Quality",
    language: "Language",
    english: "English",
    bangla: "Bangla",
    clearLocalData: "Clear Local Data",
    playNow: "PLAY NOW",
    startRun: "START RUN",
    mapSelection: "MAP SELECTION",
    selectedRoute: "Selected route",
    time: "Time",
    stageRun: "STAGE RUN",
    customize: "Customize target & environment",
    arsenal: "Arsenal & loadout",
    shop: "SHOP",
    achievements: "ACHIEVEMENTS",
    poster: "POSTER",
    targetEscaped: "TARGET ESCAPED!",
    missionAccomplished: "MISSION ACCOMPLISHED!",
    victory: "Victory",
    defeat: "Defeat",
    finalScore: "Final Score",
    stars: "Stars",
    nextMap: "NEXT MAP",
    allMapsCleared: "ALL MAPS CLEARED",
    replay: "REPLAY",
    lobby: "LOBBY",
    changeTarget: "CHANGE TARGET",
    mapProgress: "MAP PROGRESS",
    cleared: "CLEARED",
    pause: "PAUSE",
    resume: "RESUME",
    restart: "RESTART",
    health: "HEALTH",
    stamina: "STAMINA",
    score: "SCORE",
    taka: "TAKA",
    weapons: "WEAPONS",
    breakingNews: "BREAKING NEWS",
  },
  bn: {
    settings: "সেটিংস",
    close: "বন্ধ করুন",
    sound: "সাউন্ড",
    haptics: "ভাইব্রেশন",
    graphicsQuality: "গ্রাফিক্স কোয়ালিটি",
    language: "ভাষা",
    english: "English",
    bangla: "বাংলা",
    clearLocalData: "লোকাল ডাটা মুছুন",
    playNow: "এখনই খেলুন",
    startRun: "রাস্তায় নামাও",
    mapSelection: "ম্যাপ নির্বাচন",
    selectedRoute: "নির্বাচিত রুট",
    time: "সময়",
    stageRun: "স্টেজ রান",
    customize: "টার্গেট ও পরিবেশ সাজান",
    arsenal: "অস্ত্র ও লোডআউট",
    shop: "দোকান",
    achievements: "অর্জন",
    poster: "পোস্টার",
    targetEscaped: "টার্গেট পালিয়ে গেছে!",
    missionAccomplished: "মিশন সফল!",
    victory: "জয়",
    defeat: "পরাজয়",
    finalScore: "চূড়ান্ত স্কোর",
    stars: "স্টার",
    nextMap: "পরের ম্যাপ",
    allMapsCleared: "সব ম্যাপ জয় করা হয়েছে",
    replay: "আবার খেলুন",
    lobby: "লবি",
    changeTarget: "টার্গেট বদলান",
    mapProgress: "ম্যাপ অগ্রগতি",
    cleared: "জয়",
    pause: "বিরতি",
    resume: "আবার শুরু",
    restart: "পুনরায় শুরু",
    health: "হেলথ",
    stamina: "স্ট্যামিনা",
    score: "স্কোর",
    taka: "টাকা",
    weapons: "অস্ত্র",
    breakingNews: "ব্রেকিং নিউজ",
  },
} as const;

export function translate(language: Language, key: TranslationKey) {
  return translations[language][key];
}

export function useI18n() {
  const language = useGameStore((state) => state.settings.lang);
  return {
    language,
    t: (key: TranslationKey) => translate(language, key),
  };
}
