"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { VILLAINS } from "@/config/villains";

export function VillainPreview() {
  const { targetFaceUrl, targetName, villainId, setTargetName, setVillainId } =
    useGameStore();

  const currentVillain =
    VILLAINS.find((v) => v.id === villainId) || VILLAINS[0];

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
      <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-900 shadow-inner">
        {/* Moving Road Lines in background */}
        <div className="absolute bottom-4 left-0 right-0 h-10 border-t-2 border-dashed border-yellow-400/30 bg-slate-800/60" />

        {/* Running Character Container */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
          className="relative flex flex-col items-center"
        >
          {/* Target Face Attached to Head */}
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
            className="z-20 -mb-2.5 h-20 w-20 overflow-hidden rounded-full border-4 border-black bg-yellow-200 shadow-lg"
          >
            {targetFaceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetFaceUrl}
                alt="Running Villain Face"
                className="h-full w-full object-cover"
              />
            ) : null}
          </motion.div>

          {/* Torso / Panjabi */}
          <div
            className="z-10 h-16 w-14 rounded-t-lg rounded-b-md border-2 border-black shadow-md flex items-center justify-center"
            style={{
              backgroundColor: `#${currentVillain.outfitColor.toString(16).padStart(6, "0")}`,
            }}
          >
            {/* Pocket / Buttons detail */}
            <div className="h-6 w-1 bg-black/30 rounded-full" />
          </div>

          {/* Running Legs */}
          <div className="flex gap-2">
            <motion.div
              animate={{ rotate: [-25, 25, -25] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="h-10 w-3 origin-top rounded-b-md border-2 border-black bg-slate-800"
            />
            <motion.div
              animate={{ rotate: [25, -25, 25] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="h-10 w-3 origin-top rounded-b-md border-2 border-black bg-slate-800"
            />
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
        <div className="flex gap-2 overflow-x-auto pb-1">
          {VILLAINS.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVillainId(v.id);
                setTargetName(v.name.bn);
              }}
              className={`flex-1 min-w-[100px] rounded-xl border-2 p-2 text-left transition-all ${
                villainId === v.id
                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-300"
                  : "border-black/50 bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <div className="font-bangla text-xs font-bold">{v.name.bn}</div>
              <div className="text-[10px] font-mono text-slate-300 truncate">
                HP {v.baseHp}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
