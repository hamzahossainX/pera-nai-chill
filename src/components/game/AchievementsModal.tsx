"use client";

import React, { useState, useEffect } from "react";
import { X, Trophy, Check } from "lucide-react";
import { ACHIEVEMENTS, Achievement } from "@/config/achievements";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { addTaka } = useGameStore();

  const [unlockedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["first_blood"];
    try {
      const saved = localStorage.getItem("dhaka_runner_achievements");
      return saved ? JSON.parse(saved) : ["first_blood"];
    } catch {
      return ["first_blood"];
    }
  });

  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("dhaka_runner_claimed_achievements");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("dhaka_runner_achievements", JSON.stringify(unlockedIds));
      localStorage.setItem("dhaka_runner_claimed_achievements", JSON.stringify(claimedIds));
    } catch {}
  }, [unlockedIds, claimedIds]);

  if (!isOpen) return null;

  const handleClaim = (ach: Achievement) => {
    if (claimedIds.includes(ach.id)) return;
    audioService.play("fanfare");
    addTaka(ach.rewardTaka);
    setClaimedIds((prev) => [...prev, ach.id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border-4 border-yellow-400 bg-slate-900 p-5 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-rose-500 text-white shadow hover:bg-rose-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-6 w-6 text-yellow-300" />
          <h2 className="font-comic text-2xl text-yellow-300 uppercase tracking-wide">
            অর্জন / ACHIEVEMENTS
          </h2>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[60vh]">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const isClaimed = claimedIds.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`flex items-center justify-between rounded-2xl border-2 p-3 shadow ${
                  isUnlocked
                    ? "border-yellow-400/80 bg-slate-950/90"
                    : "border-slate-800 bg-slate-950/40 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl drop-shadow">{ach.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bangla text-sm font-bold text-yellow-200">
                        {ach.name.bn}
                      </h4>
                      <span className="font-comic text-[11px] text-slate-400">
                        ({ach.name.en})
                      </span>
                    </div>
                    <p className="font-bangla text-xs text-slate-400 mt-0.5">
                      {ach.description.bn}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  {isUnlocked ? (
                    isClaimed ? (
                      <span className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1 font-comic text-xs text-slate-400">
                        <Check className="h-4 w-4" /> CLAIMED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaim(ach)}
                        className="rounded-xl border-2 border-black bg-yellow-400 px-3.5 py-1.5 font-comic text-xs font-bold text-black shadow hover:bg-yellow-300 active:scale-95 animate-pulse"
                      >
                        CLAIM ৳{ach.rewardTaka}
                      </button>
                    )
                  ) : (
                    <span className="rounded-xl bg-slate-850 px-2.5 py-1 font-comic text-[11px] text-slate-500">
                      LOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
