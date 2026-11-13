"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";
import { Trophy, RotateCcw, User, FileText } from "lucide-react";
import { WantedPosterModal } from "@/components/game/WantedPosterModal";

export function GameOverScreen() {
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const {
    villainHp,
    targetName,
    targetFaceUrl,
    rageScore,
    combo,
    taka,
    failReason,
    startGame,
    resetRun,
  } = useGameStore();

  const isWin = villainHp === 0;
  const isPatienceFail = !isWin && failReason === "patience_zero";

  const rankTitle = isWin
    ? "মহাচোর দমনকারী (Master Hunter)"
    : combo >= 10
    ? "জুতার কারিগর (Chappal Craftsman)"
    : "প্যারা-লেস লিজেন্ড (Stress-Free Legend)";

  const handleRetry = () => {
    audioService.play("click");
    startGame();
  };

  const handleChangeFace = () => {
    audioService.play("click");
    resetRun();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border-4 border-yellow-400 bg-slate-900 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)]"
      >
        {/* Result Header Badge */}
        <div
          className={`rounded-full px-5 py-1.5 font-comic text-sm tracking-wider uppercase shadow-md ${
            isWin
              ? "bg-emerald-500 text-black"
              : isPatienceFail
              ? "bg-amber-500 text-black"
              : "bg-rose-500 text-white"
          }`}
        >
          {isWin
            ? "MISSION ACCOMPLISHED!"
            : isPatienceFail
            ? "OUT OF PATIENCE!"
            : "TARGET ESCAPED!"}
        </div>

        {/* Big Bengali Headline */}
        <div>
          <h2
            className={`font-comic text-4xl sm:text-5xl tracking-wide drop-shadow-md ${
              isWin
                ? "text-yellow-300"
                : isPatienceFail
                ? "text-amber-400"
                : "text-rose-400"
            }`}
          >
            {isWin ? "ধরা খাইছে!" : isPatienceFail ? "হাল ছেড়ে দিলে?!" : "পালাইছে!"}
          </h2>
          <p className="font-bangla mt-1 text-sm font-semibold text-slate-300">
            {isWin
              ? `${targetName}-কে উচিৎ শিক্ষা দেওয়া হয়েছে!`
              : isPatienceFail
              ? `${targetName}-কে ধরার ধৈর্য শেষ হয়ে গেছে!`
              : `${targetName} টাকা নিয়ে চম্পট দিয়েছে!`}
          </p>
        </div>

        {/* Target Face Display */}
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-400 bg-slate-800 shadow-xl">
            {targetFaceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetFaceUrl}
                alt="Target Face"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {isWin && (
            <span className="absolute -bottom-2 -right-2 text-3xl">🩴</span>
          )}
        </div>

        {/* Rank Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="font-bangla text-sm font-bold text-yellow-300">
            {rankTitle}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Rage Score
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-rose-400">
              {rageScore}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Combo
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-yellow-300">
              {combo}x
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Taka
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-emerald-400">
              ৳{taka}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2.5 mt-2">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gradient-to-r from-amber-500 to-yellow-400 py-3.5 font-comic text-xl text-black shadow-lg hover:from-amber-400 hover:to-yellow-300"
          >
            <RotateCcw className="h-6 w-6" /> আবার পেটান (RETRY)
          </button>

          <button
            onClick={() => setIsPosterOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-emerald-500 py-3 font-comic text-sm font-bold text-black hover:bg-emerald-400 active:scale-95"
          >
            <FileText className="h-4 w-4" /> পোস্টার এক্সপোর্ট / WANTED POSTER
          </button>

          <button
            onClick={handleChangeFace}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-slate-800 py-3 font-comic text-sm text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <User className="h-4 w-4" /> CHANGE TARGET / নতুন মুখ
          </button>
        </div>
      </motion.div>

      <WantedPosterModal
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
      />
    </div>
  );
}
