"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";
import { gameBus } from "@/game/bus";
import { calculateComboMultiplier, BALANCE } from "@/config/balance";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Home,
  Flame,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { EventBanner } from "@/components/game/EventBanner";

export function HudOverlay() {
  const {
    targetName,
    targetFaceUrl,
    villainHp,
    villainMaxHp,
    rage,
    combo,
    taka,
    stamina,
    setStamina,
    setScreen,
    startGame,
    settings,
    updateSettings,
    setDebugOpen,
  } = useGameStore();

  const [isPaused, setIsPaused] = useState(false);
  const [lagHp, setLagHp] = useState(villainHp);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tapCountRef = React.useRef(0);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    audioService.play("click");
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleAvatarTap = () => {
    tapCountRef.current += 1;
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      setDebugOpen(true);
      audioService.play("coin");
    }
  };

  // Stamina Auto-Regeneration: recovers in background
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused && stamina < BALANCE.INITIAL_STAMINA) {
        setStamina(Math.min(BALANCE.INITIAL_STAMINA, stamina + 2));
      }
    }, 150);
    return () => clearInterval(timer);
  }, [stamina, isPaused, setStamina]);

  // White "damage lag" trail behind red HP bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setLagHp((prev) => {
        if (prev > villainHp) {
          return Math.max(villainHp, prev - Math.ceil((prev - villainHp) * 0.25));
        }
        return villainHp;
      });
    }, 120);
    return () => clearTimeout(timer);
  }, [villainHp]);

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    audioService.play("click");
    gameBus.emit("game:pause", { paused: next });
  };

  const handleSoundToggle = () => {
    const next = !settings.sound;
    updateSettings({ sound: next });
    audioService.setMuted(!next);
  };

  const handleRestart = () => {
    setIsPaused(false);
    gameBus.emit("game:pause", { paused: false });
    audioService.play("click");
    startGame();
  };

  const handleBackToLobby = () => {
    setIsPaused(false);
    gameBus.emit("game:pause", { paused: false });
    audioService.play("click");
    setScreen("LOBBY");
  };

  const hpPercent = Math.max(0, Math.min(100, (villainHp / villainMaxHp) * 100));
  const lagPercent = Math.max(0, Math.min(100, (lagHp / villainMaxHp) * 100));
  const comboMultiplier = calculateComboMultiplier(combo);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Target Avatar & HP Bar */}
        <div
          onClick={handleAvatarTap}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border-2 border-black/80 bg-slate-900/80 p-2.5 shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
          title="Tap 5 times to open debug god mode"
        >
          {/* Face Thumbnail */}
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border-2 border-yellow-400 bg-slate-800 shadow-md">
            {targetFaceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetFaceUrl}
                alt="Target"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          {/* Name & Dual Health Bar */}
          <div className="flex flex-col gap-1 w-36 sm:w-48">
            <div className="flex items-center justify-between">
              <span className="font-bangla text-xs sm:text-sm font-bold text-yellow-300 truncate">
                {targetName}
              </span>
              <span className="font-mono text-[10px] text-slate-300">
                {villainHp}/{villainMaxHp}
              </span>
            </div>

            {/* Health Bar Container */}
            <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-black bg-slate-950">
              {/* White Lagging Bar */}
              <div
                className="absolute inset-y-0 left-0 bg-white/70 transition-all duration-300 ease-out"
                style={{ width: `${lagPercent}%` }}
              />
              {/* Foreground Red HP Bar */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-100 ease-out"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Center: World Event Banner */}
        <div className="flex justify-center flex-1 px-2">
          <EventBanner />
        </div>

        {/* Top-Right: Sound, Fullscreen & Pause Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-900/80 text-yellow-300 shadow-md backdrop-blur-md hover:bg-slate-800"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={handleSoundToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-900/80 text-yellow-300 shadow-md backdrop-blur-md hover:bg-slate-800"
            title="Toggle Sound"
          >
            {settings.sound ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5 text-slate-500" />
            )}
          </button>

          <button
            onClick={togglePause}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-900/80 text-yellow-300 shadow-md backdrop-blur-md hover:bg-slate-800"
            title="Pause Game"
          >
            <Pause className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Middle Screen: Combo Counter & Rage Thermometer */}
      <div className="flex items-center justify-between w-full">
        {/* Left Side: Vertical Rage Thermometer */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-2xl border-2 border-black/80 bg-slate-900/80 p-2 shadow-xl backdrop-blur-md">
          <Flame
            className={`h-5 w-5 transition-colors ${
              rage >= 100
                ? "text-yellow-300 fill-yellow-300 animate-bounce"
                : "text-amber-500"
            }`}
          />
          <div className="relative h-28 w-4 overflow-hidden rounded-full border border-black bg-slate-950">
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-200 ${
                rage >= 100
                  ? "bg-gradient-to-t from-yellow-400 via-rose-500 to-red-600 animate-pulse"
                  : "bg-gradient-to-t from-amber-600 to-yellow-400"
              }`}
              style={{ height: `${rage}%` }}
            />
          </div>
          <span className="font-mono text-[9px] font-bold text-yellow-200">
            {rage}%
          </span>
        </div>

        {/* Center: Scaled Combo Counter Pop */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div
              key={combo}
              initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
              animate={{ scale: [1, 1.25, 1], opacity: 1, rotate: [-8, 4, 0] }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            >
              <span className="font-comic text-4xl sm:text-6xl text-yellow-300 tracking-wider">
                {combo}x COMBO!
              </span>
              {comboMultiplier > 1 && (
                <span className="font-comic text-sm sm:text-base text-rose-400">
                  {comboMultiplier}x TAKA MULTIPLIER!
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-10" />
      </div>

      {/* Bottom-Left: Taka Wallet & Stamina Bar */}
      <div className="pointer-events-auto flex flex-col gap-1.5 w-36 sm:w-44">
        {/* Taka Wallet Counter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-black/80 bg-slate-900/85 px-3 py-1.5 shadow-md backdrop-blur-md">
          <span className="text-base text-amber-400">৳</span>
          <span className="font-mono text-sm sm:text-base font-bold text-yellow-300">
            {taka} Taka
          </span>
        </div>

        {/* Stamina Bar */}
        <div className="flex flex-col gap-0.5 rounded-xl border border-black/80 bg-slate-900/85 px-2.5 py-1.5 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
            <span>STAMINA</span>
            <span>{Math.round(stamina)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full border border-black bg-slate-950">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
              style={{ width: `${stamina}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border-4 border-yellow-400 bg-slate-900 p-6 shadow-2xl text-center">
            <h2 className="font-comic text-3xl text-yellow-300">PAUSED</h2>
            <p className="font-bangla text-sm text-slate-300">সাময়িক বিরতি</p>

            <div className="flex w-full flex-col gap-2.5 mt-2">
              <button
                onClick={togglePause}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-emerald-500 py-3 font-comic text-base text-black shadow-md hover:bg-emerald-400"
              >
                <Play className="h-5 w-5 fill-black" /> RESUME / চালিয়ে যান
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-amber-500 py-3 font-comic text-base text-black shadow-md hover:bg-amber-400"
              >
                <RotateCcw className="h-5 w-5" /> RESTART / পুনরায় শুরু
              </button>

              <button
                onClick={handleBackToLobby}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-slate-700 py-2.5 font-comic text-sm text-white hover:bg-slate-600"
              >
                <Home className="h-4 w-4" /> LOBBY / লবি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
