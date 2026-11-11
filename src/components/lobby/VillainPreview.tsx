"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGameStore, TimeOfDay, WeatherType } from "@/store/useGameStore";
import { VILLAINS } from "@/config/villains";
import { CRIMES } from "@/config/crimes";
import { Lock, Sun, Sunset, Moon, Sunrise, CloudRain, CloudFog, Flame, Sparkles } from "lucide-react";

export function VillainPreview() {
  const {
    targetFaceUrl,
    targetName,
    villainId,
    crimeId,
    taka,
    timeOfDay,
    weather,
    unlockedVillainIds,
    setTargetName,
    setVillainId,
    setCrimeId,
    setTimeOfDay,
    setWeather,
    unlockVillain,
  } = useGameStore();

  const currentVillain =
    VILLAINS.find((v) => v.id === villainId) || VILLAINS[0];
  const currentCrime =
    CRIMES.find((c) => c.id === crimeId) || CRIMES[0];

  // Time of Day config options
  const TOD_OPTIONS: Array<{ id: TimeOfDay; icon: React.ReactNode; label: { en: string; bn: string } }> = [
    { id: "noon", icon: <Sun className="h-3.5 w-3.5 text-yellow-400" />, label: { en: "Noon", bn: "দুপুর" } },
    { id: "goldenHour", icon: <Sunset className="h-3.5 w-3.5 text-amber-500" />, label: { en: "Sunset", bn: "গোধূলি" } },
    { id: "night", icon: <Moon className="h-3.5 w-3.5 text-indigo-400" />, label: { en: "Night", bn: "রাত" } },
    { id: "dawn", icon: <Sunrise className="h-3.5 w-3.5 text-rose-400" />, label: { en: "Dawn", bn: "ভোর" } },
  ];

  // Weather config options
  const WEATHER_OPTIONS: Array<{ id: WeatherType; icon: React.ReactNode; label: { en: string; bn: string } }> = [
    { id: "clear", icon: <Sun className="h-3.5 w-3.5 text-sky-400" />, label: { en: "Clear", bn: "পরিষ্কার" } },
    { id: "rain", icon: <CloudRain className="h-3.5 w-3.5 text-blue-400" />, label: { en: "Monsoon", bn: "বর্ষা" } },
    { id: "fog", icon: <CloudFog className="h-3.5 w-3.5 text-slate-300" />, label: { en: "Fog", bn: "কুয়াশা" } },
    { id: "heatwave", icon: <Flame className="h-3.5 w-3.5 text-orange-500" />, label: { en: "Heatwave", bn: "দাবদাহ" } },
  ];

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-4 border-black bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between w-full">
        <h3 className="font-comic text-xl text-yellow-300 tracking-wide">
          2. LIVE VILLAIN PREVIEW / ভিলেনের প্রিভিউ
        </h3>
        <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400">
          Target Locked
        </span>
      </div>

      {/* Animated Cartoon Running Puppet */}
      <div className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-900 shadow-inner">
        {/* Moving Road Lines in background */}
        <div className="absolute bottom-4 left-0 right-0 h-10 border-t-2 border-dashed border-yellow-400/30 bg-slate-800/60" />

        {/* Wanted Poster Badge Overlay */}
        <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 rounded-lg border border-black/80 bg-red-600/90 px-2 py-0.5 shadow-md">
          <span className="text-xs">{currentCrime.icon}</span>
          <span className="font-comic text-[11px] font-bold text-white tracking-wide uppercase">
            WANTED: {currentCrime.badgeText}
          </span>
          <span className="rounded bg-black/40 px-1 font-mono text-[10px] text-yellow-300">
            ৳{currentCrime.bountyTaka}
          </span>
        </div>

        {/* Archetype Badge Overlay (Top Right) */}
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-lg border border-black/80 bg-amber-500/90 px-2 py-0.5 shadow-md font-comic text-[11px] font-bold text-black uppercase">
          <span>{currentVillain.name.en}</span>
        </div>

        {/* Animated Cartoon Running Puppet - Layered Vector Anatomy */}
        <motion.div
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="relative flex flex-col items-center select-none"
        >
          {/* Head & Neck Group */}
          <div className="relative flex flex-col items-center z-20">
            {/* Back Hair / Cavity */}
            <div
              className="absolute -inset-1.5 rounded-full border-2 border-black"
              style={{
                backgroundColor: currentVillain.id === "phoneSnatcher" ? "#090d16" : "#451a03",
              }}
            />

            {/* Target Face */}
            <motion.div
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
              className="relative z-10 h-16 w-16 overflow-hidden rounded-full border-3 border-black bg-yellow-200 shadow-lg"
            >
              {targetFaceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={targetFaceUrl}
                  alt="Running Villain Face"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-comic font-bold text-slate-700 text-xs">
                  NO FACE
                </div>
              )}
            </motion.div>

            {/* Archetype Specific Mask / Headpiece */}
            {currentVillain.id === "phoneSnatcher" && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/characters/phoneSnatcher/mask_upper.svg"
                  alt="Forehead Mask"
                  className="pointer-events-none absolute -top-1 z-25 w-16"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/characters/phoneSnatcher/mask_lower.svg"
                  alt="Jaw Mask"
                  className="pointer-events-none absolute bottom-0 z-25 w-14"
                />
              </>
            )}

            {currentVillain.id === "pickpocket" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/assets/characters/pickpocket/mask_lower.svg"
                alt="Mustache"
                className="pointer-events-none absolute bottom-1 z-25 w-12"
              />
            )}

            {currentVillain.id === "chorSardar" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/assets/characters/chorSardar/headFront.svg"
                alt="Aviator Shades"
                className="pointer-events-none absolute top-3 z-25 w-14"
              />
            )}

            {/* Neck connecting Head to Torso (No floating heads!) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/characters/shared/neck.svg"
              alt="Neck"
              className="relative -mt-2 z-10 h-4 w-6 object-contain"
            />
          </div>

          {/* Torso & Arms Layered */}
          <div className="relative -mt-1 flex items-center justify-center z-15">
            {/* Back Arm (Swinging opposite) */}
            <motion.div
              animate={{ rotate: [25, -25, 25] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
              className="absolute -left-3 top-1 origin-top"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/arm_upper.svg`}
                alt="Back Arm"
                className="h-9 w-6 object-contain"
              />
            </motion.div>

            {/* Contoured Vector Torso */}
            <div className="relative z-10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/torso.svg`}
                alt="Costume Torso"
                className="h-16 w-16 object-contain drop-shadow-md"
              />

              {/* Hand Prop Animated */}
              <motion.div
                animate={{ rotate: [-12, 12, -12], y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
                className="absolute -right-5 top-4 z-25 select-none"
              >
                {currentVillain.id === "phoneSnatcher" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/phoneSnatcher/hand.svg" alt="Phone" className="w-8 h-8" />
                )}
                {currentVillain.id === "pickpocket" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/pickpocket/hand.svg" alt="Wallet" className="w-8 h-8" />
                )}
                {currentVillain.id === "cableChor" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/cableChor/prop_cutter.svg" alt="Cutter" className="w-9 h-9" />
                )}
                {currentVillain.id === "manholeChor" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/manholeChor/prop_manhole_cover.svg" alt="Cover" className="w-12 h-12" />
                )}
                {currentVillain.id === "eidMarketChor" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/eidMarketChor/prop_shopping_bags.svg" alt="Bags" className="w-10 h-10" />
                )}
                {currentVillain.id === "chickenChor" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/chickenChor/prop_chicken.svg" alt="Chicken" className="w-11 h-11" />
                )}
                {currentVillain.id === "chorSardar" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/assets/characters/chorSardar/prop_briefcase.svg" alt="Briefcase" className="w-10 h-9" />
                )}
              </motion.div>
            </div>

            {/* Front Arm (Swinging forward) */}
            <motion.div
              animate={{ rotate: [-25, 25, -25] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
              className="absolute -right-3 top-1 origin-top z-20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/arm_upper.svg`}
                alt="Front Arm"
                className="h-9 w-6 object-contain"
              />
            </motion.div>
          </div>

          {/* Running Jointed Legs with Shoes */}
          <div className="flex gap-2 -mt-2 z-10">
            {/* Back Leg */}
            <motion.div
              animate={{ rotate: [28, -28, 28] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="origin-top flex flex-col items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/thigh.svg`}
                alt="Thigh"
                className="h-8 w-6 object-contain"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/foot.svg`}
                alt="Shoe"
                className="h-5 w-8 -mt-1 object-contain"
              />
            </motion.div>

            {/* Front Leg */}
            <motion.div
              animate={{ rotate: [-28, 28, -28] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="origin-top flex flex-col items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/thigh.svg`}
                alt="Thigh"
                className="h-8 w-6 object-contain"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/characters/${currentVillain.id}/foot.svg`}
                alt="Shoe"
                className="h-5 w-8 -mt-1 object-contain"
              />
            </motion.div>
          </div>

          {/* Soft Ground Shadow with Squash & Stretch */}
          <motion.div
            animate={{ scale: [1, 0.82, 1], opacity: [0.7, 0.4, 0.7] }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              ease: "easeInOut",
            }}
            className="mt-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/characters/shared/shadow.svg"
              alt="Soft Ground Shadow"
              className="h-5 w-24 object-contain"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Target Name Input */}
      <div className="w-full">
        <label className="text-xs font-mono font-bold text-slate-300">
          Target Name / নাম:
        </label>
        <input
          type="text"
          maxLength={24}
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
          className="mt-1 w-full rounded-xl border-2 border-black bg-slate-800 px-3 py-2 font-bangla text-base font-bold text-yellow-300 focus:border-yellow-400 focus:outline-none"
          placeholder="ভিলেনের নাম দিন..."
        />
      </div>

      {/* Archetype Horizontal Carousel (P2-05) */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            VILLAIN ARCHETYPES / ভিলেনের ধরন (৭ জন):
          </label>
          <span className="font-mono text-[10px] text-slate-400">
            Available Taka: ৳{taka}
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 mt-1.5 snap-x">
          {VILLAINS.map((v) => {
            const isSelected = villainId === v.id;
            const isUnlocked = unlockedVillainIds.includes(v.id);

            return (
              <div
                key={v.id}
                onClick={() => {
                  if (isUnlocked) {
                    setVillainId(v.id);
                    setTargetName(v.name.bn);
                  }
                }}
                className={`relative flex-none w-[165px] snap-start rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/20 scale-102 shadow-lg"
                    : "border-slate-700 bg-slate-800/80 hover:border-slate-500"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-comic text-xs font-bold text-white truncate">
                    {v.name.en}
                  </span>
                  {!isUnlocked && (
                    <span className="rounded bg-rose-500/20 p-1 text-rose-400" title="Locked">
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="font-bangla text-xs font-semibold text-amber-300 truncate">
                  {v.name.bn}
                </div>

                {/* Funny Bio */}
                <p className="mt-1 font-bangla text-[10px] text-slate-300 line-clamp-2 leading-tight">
                  {v.bio.bn}
                </p>

                {/* Animated Stat Bars */}
                <div className="mt-2 flex flex-col gap-1 font-mono text-[9px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>HP {v.baseHp}</span>
                    <div className="h-1.5 w-14 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, (v.baseHp / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SPD {v.speedMultiplier}x</span>
                    <div className="h-1.5 w-14 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${Math.min(100, (v.speedMultiplier / 1.5) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DODGE {Math.round(v.dodgeRate * 100)}%</span>
                    <div className="h-1.5 w-14 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${v.dodgeRate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unlock Button if locked */}
                {!isUnlocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const success = unlockVillain(v.id);
                      if (success) {
                        setVillainId(v.id);
                        setTargetName(v.name.bn);
                      } else {
                        alert(`আরও টাকা দরকার! ৳${v.unlockCostTaka} লাগবে। (বর্তমান ব্যালেন্স: ৳${taka})`);
                      }
                    }}
                    className="mt-2 w-full rounded-lg border border-yellow-500/60 bg-amber-500/30 py-1 font-comic text-[10px] font-bold text-yellow-300 hover:bg-amber-500/50"
                  >
                    ৳{v.unlockCostTaka} আনলক
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment Selectors: Time of Day & Weather (P2-05) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        {/* Time of Day */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-slate-300">
            Time of Day / সময়:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {TOD_OPTIONS.map((tod) => (
              <button
                key={tod.id}
                onClick={() => setTimeOfDay(tod.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg border text-center transition-all ${
                  timeOfDay === tod.id
                    ? "border-amber-400 bg-amber-400/20 text-yellow-300 scale-102"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
                }`}
              >
                {tod.icon}
                <span className="font-comic text-[10px] mt-0.5">{tod.label.en}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-slate-300">
            Weather / আবহাওয়া:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w.id}
                onClick={() => setWeather(w.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg border text-center transition-all ${
                  weather === w.id
                    ? "border-sky-400 bg-sky-400/20 text-sky-300 scale-102"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
                }`}
              >
                {w.icon}
                <span className="font-comic text-[10px] mt-0.5">{w.label.en}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reason / Crime Preset Selector */}
      <div className="w-full">
        <label className="text-xs font-mono font-bold text-slate-300">
          Crime / অপরাধের কারণ:
        </label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {CRIMES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCrimeId(c.id)}
              className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left transition-all ${
                crimeId === c.id
                  ? "border-rose-400 bg-rose-500/20 scale-101"
                  : "border-slate-700 bg-slate-800/80 hover:border-slate-500"
              }`}
            >
              <span className="text-lg">{c.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="truncate font-comic text-xs font-bold text-white">
                  {c.title.en}
                </span>
                <span className="truncate font-bangla text-[11px] text-slate-300">
                  {c.title.bn}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
