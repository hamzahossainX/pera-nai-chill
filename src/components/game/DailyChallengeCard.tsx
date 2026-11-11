"use client";

import React, { useState } from "react";
import { Calendar, Play, CheckCircle } from "lucide-react";
import { getTodayChallenge } from "@/config/dailyChallenge";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";

export function DailyChallengeCard() {
  const challenge = getTodayChallenge();
  const { setVillainId, setWeather, setTimeOfDay, startGame } = useGameStore();

  const [isCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`dhaka_runner_daily_${challenge.dateKey}`) === "completed";
    } catch {
      return false;
    }
  });

  const handleAccept = () => {
    audioService.play("coin");
    setVillainId(challenge.villainId);
    setWeather(challenge.weather);
    setTimeOfDay(challenge.timeOfDay);
    startGame();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-400/80 bg-gradient-to-r from-slate-900/90 to-amber-950/80 p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-yellow-300">
          <Calendar className="h-4 w-4" />
          <span className="font-comic text-xs font-bold uppercase tracking-wider">
            DAILY CHALLENGE ({challenge.dateKey})
          </span>
        </div>
        <span className="rounded-lg bg-yellow-400/20 px-2 py-0.5 font-mono text-xs font-bold text-yellow-300 border border-yellow-400/40">
          +৳{challenge.rewardTaka}
        </span>
      </div>

      <h4 className="font-bangla text-sm font-bold text-white mb-1">
        {challenge.title.bn}
      </h4>
      <p className="font-bangla text-xs text-slate-300 mb-3">
        {challenge.description.bn}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="rounded bg-slate-800 px-1.5 py-0.5 uppercase">
            {challenge.timeOfDay}
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 uppercase">
            {challenge.weather}
          </span>
        </div>

        {isCompleted ? (
          <span className="flex items-center gap-1 font-comic text-xs font-bold text-emerald-400">
            <CheckCircle className="h-4 w-4" /> COMPLETED
          </span>
        ) : (
          <button
            onClick={handleAccept}
            className="flex items-center gap-1 rounded-xl border border-black bg-gradient-to-r from-yellow-400 to-amber-500 px-3.5 py-1.5 font-comic text-xs font-bold text-slate-950 shadow hover:brightness-110 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-black" /> ACCEPT & PLAY
          </button>
        )}
      </div>
    </div>
  );
}
