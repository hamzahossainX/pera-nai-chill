"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { VILLAINS } from "@/config/villains";
import { CRIMES } from "@/config/crimes";

export function VillainPreview() {
  const {
    targetFaceUrl,
    targetName,
    villainId,
    crimeId,
    setTargetName,
    setVillainId,
    setCrimeId,
  } = useGameStore();

  const currentVillain =
    VILLAINS.find((v) => v.id === villainId) || VILLAINS[0];
  const currentCrime =
    CRIMES.find((c) => c.id === crimeId) || CRIMES[0];

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
      <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-900 shadow-inner">
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

        {/* Live Slot-Based Running Character Rig Preview */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
          className="relative flex flex-col items-center"
        >
          {/* Head & Mask Group */}
          <div className="relative z-20 flex items-center justify-center -mb-2">
            {/* Hood Back */}
            <div className="absolute -inset-1.5 rounded-full bg-slate-950 border-2 border-black" />

            {/* Target Face */}
            <motion.div
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
              className="relative z-10 h-18 w-18 overflow-hidden rounded-full border-3 border-black bg-yellow-200 shadow-lg"
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

            {/* Balaclava Mask Upper Band */}
            <div className="absolute top-0 z-20 h-4 w-16 rounded-t-full bg-slate-900 border-t-2 border-black" />

            {/* Balaclava Mask Lower Mouth Cover (with ventilation dots) */}
            <div className="absolute bottom-0 z-20 flex items-center justify-center gap-1 h-5 w-16 rounded-b-xl bg-slate-900 border-b-2 border-black shadow-md">
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="h-1 w-1 rounded-full bg-slate-700" />
            </div>

            {/* Hood Rim Arch Framing Cutout */}
            <div className="pointer-events-none absolute -inset-2 rounded-full border-[5px] border-slate-900 border-t-slate-800 shadow-md" />
          </div>

          {/* Torso / Hoodie with Parody Logo & Pocket */}
          <div
            className="relative z-10 h-16 w-16 rounded-t-xl rounded-b-md border-2 border-black shadow-md flex flex-col items-center justify-between p-1"
            style={{
              backgroundColor: `#${currentVillain.outfitColor.toString(16).padStart(6, "0")}`,
            }}
          >
            {/* Zipper / Drawstring */}
            <div className="h-4 w-0.5 bg-yellow-400 rounded-full" />
            {/* Parody Adidos Logo */}
            <div className="flex gap-0.5">
              <div className="h-2 w-1 bg-white/80 -rotate-12 rounded-sm" />
              <div className="h-3 w-1 bg-white/80 -rotate-12 rounded-sm" />
              <div className="h-4 w-1 bg-white/80 -rotate-12 rounded-sm" />
            </div>
            {/* Kangaroo Pouch */}
            <div className="w-12 h-4 rounded-t-md bg-black/25 border-t border-black/40" />

            {/* Stolen Smartphone Prop in Hand */}
            <motion.div
              animate={{ rotate: [-10, 10, -10], y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
              className="absolute -right-3 top-6 z-25 h-7 w-4.5 rounded border border-black bg-slate-950 p-0.5 shadow-md flex items-center justify-center"
            >
              <div className="h-full w-full rounded-xs bg-sky-400 border border-sky-200" />
            </motion.div>
          </div>

          {/* Running Legs with Sneakers */}
          <div className="flex gap-3 -mt-1">
            <motion.div
              animate={{ rotate: [-28, 28, -28] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="relative h-11 w-3.5 origin-top rounded-b-sm border-2 border-black bg-slate-800 flex flex-col justify-end"
            >
              {/* Sneaker */}
              <div className="h-3 w-5 -ml-1 rounded-sm bg-red-600 border border-black border-b-2 border-b-white" />
            </motion.div>
            <motion.div
              animate={{ rotate: [28, -28, 28] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="relative h-11 w-3.5 origin-top rounded-b-sm border-2 border-black bg-slate-800 flex flex-col justify-end"
            >
              {/* Sneaker */}
              <div className="h-3 w-5 -ml-1 rounded-sm bg-red-600 border border-black border-b-2 border-b-white" />
            </motion.div>
          </div>

          {/* Ground Shadow */}
          <motion.div
            animate={{ scale: [1, 0.85, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              ease: "easeInOut",
            }}
            className="mt-1 h-3 w-16 rounded-full bg-black/60 blur-xs"
          />
        </motion.div>
      </div>

      {/* Villain Archetype Selector & Name Input */}
      <div className="flex flex-col gap-3 w-full">
        <div>
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

        {/* Archetypes */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-300">
            Villain Archetype / ধরন:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-1">
            {VILLAINS.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setVillainId(v.id);
                  setTargetName(v.name.bn);
                }}
                className={`flex-1 min-w-[90px] rounded-xl border-2 p-2 text-left transition-all ${
                  villainId === v.id
                    ? "border-yellow-400 bg-yellow-400/20 scale-102"
                    : "border-slate-700 bg-slate-800/80 hover:border-slate-500"
                }`}
              >
                <div className="font-comic text-xs font-bold text-white">
                  {v.name.en}
                </div>
                <div className="font-bangla text-xs font-semibold text-slate-300">
                  {v.name.bn}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reason / Crime Preset Selector */}
        <div>
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
    </div>
  );
}
