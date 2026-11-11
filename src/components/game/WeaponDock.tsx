"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  WEAPONS,
  ULTIMATE_WEAPON,
  WeaponConfig,
  CHAPPAL_VARIETIES,
  DEFAULT_CHAPPAL,
} from "@/config/weapons";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

export function WeaponDock() {
  const { rage, stamina, setStamina, selectedChappalId } = useGameStore();
  const activeChappal =
    CHAPPAL_VARIETIES.find((c) => c.id === selectedChappalId) || DEFAULT_CHAPPAL;

  // Track remaining cooldowns in ms for each weapon
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("pernaichill_hasSeenWeaponTutorial") !== "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  const triggerWeapon = useCallback(
    (weapon: WeaponConfig) => {
      setShowTutorial((prev) => {
        if (prev) {
          try {
            localStorage.setItem("pernaichill_hasSeenWeaponTutorial", "true");
          } catch {}
          return false;
        }
        return prev;
      });
      // Check cooldown
      if ((cooldowns[weapon.id] ?? 0) > 0) return;

      // Check stamina
      if (stamina < weapon.staminaCost) return;

      // Deduct stamina
      setStamina(stamina - weapon.staminaCost);

      // Set cooldown
      setCooldowns((prev) => ({
        ...prev,
        [weapon.id]: weapon.cooldownSec * 1000,
      }));

      // Emit to game bus
      gameBus.emit("weapon:use", {
        weaponId: weapon.id,
        timestamp: Date.now(),
      });
    },
    [cooldowns, stamina, setStamina]
  );

  const triggerUltimate = useCallback(() => {
    if (rage < 100) return;

    gameBus.emit("weapon:use", {
      weaponId: ULTIMATE_WEAPON.id,
      timestamp: Date.now(),
    });
  }, [rage]);

  // Tick cooldowns down every 30ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const [key, val] of Object.entries(prev)) {
          if (val > 0) {
            next[key] = Math.max(0, val - 30);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener (1, 2, 3, 4, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === "Space") {
        e.preventDefault();
        triggerUltimate();
        return;
      }

      const match = WEAPONS.find((w) => w.hotkey === e.key);
      if (match) {
        e.preventDefault();
        triggerWeapon(match);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerWeapon, triggerUltimate]);

  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-3 px-4">
      {/* Ultimate Chappal Storm Button (Appears when Rage is 100%) */}
      <AnimatePresence>
        {rage >= 100 && (
          <motion.button
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{
              scale: [1, 1.06, 1],
              opacity: 1,
              y: 0,
            }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{
              scale: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
            }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={triggerUltimate}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border-4 border-yellow-300 bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 px-7 py-3 shadow-[0_0_30px_rgba(244,63,94,0.8)] active:scale-95"
          >
            <Zap className="h-6 w-6 fill-yellow-300 text-yellow-300 animate-bounce" />
            <span className="font-comic text-xl text-yellow-200 tracking-wider drop-shadow-md sm:text-2xl">
              ULTIMATE: CHAPPAL STORM! [SPACE]
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* First-time Tutorial Callout */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ y: { repeat: Infinity, duration: 1, ease: "easeInOut" } }}
            className="flex items-center gap-1.5 rounded-full border-2 border-black bg-yellow-400 px-4 py-1.5 text-xs font-bold text-black shadow-lg"
          >
            <span className="font-bangla">জুতা ছুড়ে মারুন!</span>
            <span className="font-comic">(TAP CHAPPAL!)</span>
            <span>👇</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Arcade Weapon Buttons */}
      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4">
        {WEAPONS.map((w) => {
          const cdLeft = cooldowns[w.id] ?? 0;
          const cdRatio = cdLeft / (w.cooldownSec * 1000);
          const hasCooldown = cdLeft > 0;
          const canAffordStamina = stamina >= w.staminaCost;

          return (
            <button
              key={w.id}
              disabled={hasCooldown || !canAffordStamina}
              onPointerDown={(e) => {
                e.preventDefault();
                triggerWeapon(w);
              }}
              className={`relative flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-2xl border-4 border-black p-1 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition-transform select-none active:translate-y-1 active:shadow-none disabled:opacity-60 ${
                w.id === "chappal"
                  ? "bg-amber-500"
                  : w.id === "kick"
                  ? "bg-rose-500"
                  : w.id === "punch"
                  ? "bg-indigo-600"
                  : w.id === "banana"
                  ? "bg-yellow-400"
                  : w.id === "can-kick"
                  ? "bg-red-500"
                  : "bg-teal-500"
              }`}
            >
              {/* Cooldown Dark Overlay Sweep */}
              {hasCooldown && (
                <div
                  className="absolute inset-0 rounded-xl bg-black/60 pointer-events-none transition-all"
                  style={{
                    height: `${cdRatio * 100}%`,
                  }}
                />
              )}

              {/* Weapon Icon */}
              <span className="text-2xl sm:text-3xl drop-shadow-md">
                {w.id === "slap"
                  ? "🖐️"
                  : w.id === "punch"
                  ? "👊"
                  : w.id === "kick"
                  ? "🦵"
                  : w.id === "banana"
                  ? "🍌"
                  : w.id === "can-kick"
                  ? "🥫"
                  : activeChappal.icon}
              </span>

              {/* Hotkey Tag */}
              <span className="absolute top-1 left-1.5 rounded-sm bg-black/40 px-1 font-mono text-[9px] font-bold text-white">
                {w.hotkey}
              </span>

              {/* Damage Tag */}
              <span className="font-comic text-[10px] text-white drop-shadow-sm sm:text-xs">
                {w.id === "chappal" ? activeChappal.damage : w.damage}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
