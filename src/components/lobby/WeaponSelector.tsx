"use client";

import React from "react";
import { WEAPONS, ULTIMATE_WEAPON, CHAPPAL_VARIETIES } from "@/config/weapons";
import { useGameStore } from "@/store/useGameStore";
import { Zap, ShieldAlert, Sparkles } from "lucide-react";

export function WeaponSelector() {
  const { settings, selectedChappalId, setSelectedChappalId } = useGameStore();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-4 border-black bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="font-comic text-xl text-yellow-300 tracking-wide">
          3. ARSENAL LOADOUT / অস্ত্র ভান্ডার
        </h3>
        <span className="flex items-center gap-1 text-xs font-mono text-slate-300">
          <Zap className="h-3.5 w-3.5 text-yellow-400" /> 4 Weapons + Ultimate
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WEAPONS.map((w) => (
          <div
            key={w.id}
            className="flex flex-col justify-between rounded-xl border-2 border-black bg-slate-800 p-3 shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-yellow-400/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-yellow-300">
                  Key: {w.hotkey}
                </span>
                <span className="text-xl">
                  {w.id === "slap"
                    ? "🖐️"
                    : w.id === "punch"
                    ? "👊"
                    : w.id === "kick"
                    ? "🦵"
                    : "🩴"}
                </span>
              </div>
              <h4 className="font-bangla mt-2 text-sm font-bold text-white">
                {settings.lang === "bn" ? w.name.bn : w.name.en}
              </h4>
            </div>

            <div className="mt-3 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>DMG:</span>
                <span className="font-bold text-rose-400">{w.damage}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CD:</span>
                <span className="font-bold text-emerald-400">{w.cooldownSec}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chappal Variety Selector (P2-04) */}
      <div className="flex flex-col gap-2 rounded-xl border-2 border-amber-500/50 bg-slate-800/80 p-3">
        <div className="flex items-center justify-between">
          <label className="font-comic text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            CHAPPAL VARIETY / চপ্পল নির্বাচন (৩ ধরন)
          </label>
          <span className="font-mono text-[10px] text-slate-400">Select active projectile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CHAPPAL_VARIETIES.map((c) => {
            const isSelected = selectedChappalId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChappalId(c.id)}
                className={`flex items-center gap-2.5 rounded-lg border-2 p-2 text-left transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/20 scale-101 shadow-md"
                    : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-comic text-xs font-bold text-white">
                    {c.name.en}
                  </span>
                  <span className="truncate font-bangla text-[11px] text-slate-300">
                    {c.name.bn}
                  </span>
                  <div className="mt-0.5 flex gap-2 font-mono text-[10px] text-amber-300">
                    <span>DMG {c.damage}</span>
                    <span>৳ {c.takaMultiplier}x</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ultimate Card */}
      <div className="flex items-center justify-between rounded-xl border-2 border-amber-500/70 bg-gradient-to-r from-amber-950/60 to-rose-950/60 p-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="font-comic text-xs uppercase tracking-wider text-amber-300">
              ULTIMATE: {ULTIMATE_WEAPON.name.en}
            </div>
            <div className="font-bangla text-xs text-slate-300">
              রেজ মিটার ১০০% হলে আনলক হবে
            </div>
          </div>
        </div>
        <div className="font-mono text-xs font-bold text-yellow-300">
          DMG {ULTIMATE_WEAPON.damage}
        </div>
      </div>

      {/* Satire Warning Banner */}
      <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-2.5 text-xs text-yellow-200">
        <ShieldAlert className="h-5 w-5 shrink-0 text-yellow-400" />
        <p className="font-bangla text-[11px] leading-tight">
          সতর্কতা: গেমটি পুরোপুরি বিনোদন ও স্ট্রেস রিলিজের জন্য তৈরি। সব প্রসেসিং
          আপনার ফোনেই সম্পন্ন হয়, কোনো ছবি সার্ভারে আপলোড হয় না।
        </p>
      </div>
    </div>
  );
}
