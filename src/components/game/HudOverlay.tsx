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
  Zap,
} from "lucide-react";
import { EventBanner } from "@/components/game/EventBanner";
import { BribeButton } from "@/components/game/BribeButton";
import { CRIMES } from "@/config/crimes";
import { MAP_SCENARIOS } from "@/config/maps";
import {
  Droplets,
  ShieldCheck,
  MapPin,
  Megaphone,
} from "lucide-react";
import { COMBO_NAMES, COMMENTATOR_TICKER, ComboTier } from "@/config/dialogue";

export function HudOverlay() {
  const {
    targetName,
    targetFaceUrl,
    villainHp,
    villainMaxHp,
    villainMorale,
    rage,
    combo,
    taka,
    stamina,
    crimeId,
    currentMapId,
    activeCounterBuff,
    activeEvent,
    setStamina,
    setScreen,
    startGame,
    drainMorale,
    restoreMorale,
    addTaka,
    incrementCombo,
    settings,
    updateSettings,
    setDebugOpen,
  } = useGameStore();

  const currentCrime =
    CRIMES.find((c) => c.id === crimeId) || CRIMES[0];
  const currentMap =
    MAP_SCENARIOS.find((m) => m.id === currentMapId) || MAP_SCENARIOS[0];

  const [isPaused, setIsPaused] = useState(false);
  const [lagHp, setLagHp] = useState(villainHp);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tapCountRef = React.useRef(0);

  const [tauntCooldown, setTauntCooldown] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [activeComboBanner, setActiveComboBanner] = useState<{
    tier: ComboTier;
    key: number;
  } | null>(null);

  // Taunt cooldown ticker
  useEffect(() => {
    if (tauntCooldown > 0) {
      const timer = setTimeout(() => setTauntCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tauntCooldown]);

  const handleTaunt = () => {
    if (tauntCooldown > 0) return;
    audioService.play("click");
    drainMorale(35);
    incrementCombo();
    addTaka(25);
    setTauntCooldown(8);
    gameBus.emit("player:taunt");
  };

  // Morale slow regeneration
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused && villainMorale < 100) {
        restoreMorale(1);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [villainMorale, isPaused, restoreMorale]);

  // Commentator News Ticker cycling every 6.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % COMMENTATOR_TICKER.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Combo tier title flash
  useEffect(() => {
    const tier = COMBO_NAMES.find((c) => c.threshold === combo);
    if (!tier) return;
    const showTimer = setTimeout(() => {
      setActiveComboBanner({ tier, key: Date.now() });
    }, 10);
    const hideTimer = setTimeout(() => {
      setActiveComboBanner(null);
    }, 1600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [combo]);

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
    <div className="hud-shell pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-2 sm:p-5 select-none">
      {/* Top Header Bar */}
      <div className="hud-topbar flex items-start justify-between w-full gap-1">
        {/* Top-Left: Target Avatar & HP Bar */}
        <div className="flex flex-col gap-1.5 items-start">
          <div
            onClick={handleAvatarTap}
            className="hud-target-card pointer-events-auto flex items-center gap-3 rounded-2xl border-2 border-black/80 bg-slate-900/80 p-2.5 shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
            title="Tap 5 times to open debug god mode"
          >
            {/* Face Thumbnail */}
            <div className="hud-target-avatar h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border-2 border-yellow-400 bg-slate-800 shadow-md">
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
            <div className="hud-target-details flex flex-col gap-1 w-36 sm:w-52">
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

              {/* Wanted Crime Tag Banner */}
              <div className="flex items-center gap-1 mt-0.5 truncate">
                <span className="rounded bg-rose-600 px-1 py-0.2 font-comic text-[9px] font-bold text-white uppercase shrink-0">
                  WANTED
                </span>
                <span className="font-bangla text-[10px] font-bold text-yellow-200 truncate">
                  {currentCrime.icon} {currentCrime.title.bn}
                </span>
              </div>

              {/* Villain Morale Bar (P2-10) */}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-comic text-[8px] font-bold text-purple-300 uppercase shrink-0">
                  MORALE
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full border border-black/60 bg-slate-950">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-200"
                    style={{ width: `${villainMorale}%` }}
                  />
                </div>
                {villainMorale < 40 && (
                  <span className="font-bangla text-[8px] font-bold text-rose-400 animate-pulse shrink-0">
                    বিচলিত!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Route Badge & Active Counter-Buff Pills */}
          <div className="flex items-center gap-1.5">
            <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-black/80 bg-slate-900/90 px-2 py-0.5 text-[11px] font-bold text-yellow-300 shadow backdrop-blur-sm">
              <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="font-bangla">{currentMap.name.bn}</span>
            </div>

            {activeCounterBuff && (
              <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-emerald-500/80 bg-emerald-950/90 px-2 py-0.5 text-[11px] font-bold text-emerald-300 shadow backdrop-blur-sm animate-pulse">
                <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="font-bangla">{activeCounterBuff.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top-Center: World Event Banner */}
        <div className="hud-event flex justify-center flex-1 px-2">
          <EventBanner />
        </div>

        {/* Top-Right: Sound, Fullscreen & Pause Controls */}
        <div className="hud-controls pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="hud-control-button flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-900/80 text-yellow-300 shadow-md backdrop-blur-md hover:bg-slate-800"
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
            className="hud-control-button flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-900/80 text-yellow-300 shadow-md backdrop-blur-md hover:bg-slate-800"
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
            className="hud-control-button flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-900/80 text-yellow-300 shadow-md backdrop-blur-md hover:bg-slate-800"
            title="Pause Game"
          >
            <Pause className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Loadshedding Dark Screen Center Generator Prompt */}
      <AnimatePresence>
        {activeEvent?.type === "LOADSHEDDING" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.03, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ scale: { repeat: Infinity, duration: 1.2 } }}
            className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 rounded-3xl border-4 border-yellow-400 bg-slate-950/95 p-5 sm:p-6 text-center shadow-[0_0_60px_rgba(250,204,21,0.6)] backdrop-blur-md z-40 max-w-sm"
          >
            <div className="flex items-center gap-2 text-yellow-300">
              <Zap className="h-7 w-7 fill-yellow-300 animate-bounce" />
              <span className="font-comic text-xl sm:text-2xl tracking-wider text-yellow-300 uppercase">
                ঘোর অন্ধকার! কারেন্ট নাই!
              </span>
            </div>
            <p className="font-bangla text-xs sm:text-sm font-bold text-slate-300">
              লোডশেডিং চলছে! আলো ফেরাতে ৫০ ৳ দিয়ে জেনারেটর চালু করুন!
            </p>
            <BribeButton
              eventId={activeEvent.id}
              costTaka={activeEvent.bypass?.costTaka ?? 50}
              label={{
                bn: `জেনারেটর চালু করুন (${activeEvent.bypass?.costTaka ?? 50} ৳)`,
                en: `Start Generator (${activeEvent.bypass?.costTaka ?? 50} ৳)`,
              }}
            />
          </motion.div>
        )}

        {activeEvent?.type === "WATERLOGGING" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.03, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ scale: { repeat: Infinity, duration: 1.2 } }}
            className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 rounded-3xl border-4 border-sky-400 bg-slate-950/95 p-5 sm:p-6 text-center shadow-[0_0_60px_rgba(14,165,233,0.6)] backdrop-blur-md z-40 max-w-sm"
          >
            <div className="flex items-center gap-2 text-sky-300">
              <Droplets className="h-7 w-7 fill-sky-300 animate-bounce" />
              <span className="font-comic text-xl sm:text-2xl tracking-wider text-sky-300 uppercase">
                রাস্তায় হাঁটু পানি!
              </span>
            </div>
            <p className="font-bangla text-xs sm:text-sm font-bold text-slate-300">
              জলাবদ্ধতায় স্পিড স্লো! ৬০ ৳ দিয়ে হুডতোলা রিকশা নিয়ে সহজে পার হন!
            </p>
            <BribeButton
              eventId={activeEvent.id}
              costTaka={activeEvent.bypass?.costTaka ?? 60}
              label={{
                bn: `হুডতোলা রিকশা নিন (${activeEvent.bypass?.costTaka ?? 60} ৳)`,
                en: `Hire Rickshaw (${activeEvent.bypass?.costTaka ?? 60} ৳)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="hud-resource-panel pointer-events-auto flex flex-col gap-1.5 w-36 sm:w-44">
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

      {/* Combo Tier Title Flash (P2-10) */}
      <AnimatePresence>
        {activeComboBanner && (
          <motion.div
            key={activeComboBanner.key}
            initial={{ scale: 0.3, y: 30, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], y: 0, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "backOut" }}
            className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center drop-shadow-[0_6px_24px_rgba(0,0,0,0.9)] text-center px-4"
          >
            <span
              className="font-comic text-4xl sm:text-6xl font-black uppercase tracking-wider"
              style={{
                color: activeComboBanner.tier.color,
                WebkitTextStroke: "2.5px black",
              }}
            >
              {activeComboBanner.tier.title.bn}
            </span>
            <span className="font-comic text-sm sm:text-lg font-bold text-white bg-black/80 px-4 py-1 rounded-full border-2 border-yellow-400 mt-1 shadow-lg">
              {activeComboBanner.tier.title.en} ({activeComboBanner.tier.threshold}x)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taunt Button (P2-10) */}
      <div className="hud-taunt pointer-events-auto absolute bottom-24 right-4 sm:bottom-28 sm:right-6 flex flex-col items-center z-40">
        <button
          onClick={handleTaunt}
          disabled={tauntCooldown > 0}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 border-black font-comic font-bold text-xs shadow-lg transition-transform active:scale-95 ${
            tauntCooldown > 0
              ? "bg-slate-800 text-slate-400 cursor-not-allowed border-slate-700"
              : "bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-yellow-500/30"
          }`}
          title="Taunt the thief to lower morale and gain Taka bonus!"
        >
          <Megaphone className="h-4 w-4" />
          <span>{tauntCooldown > 0 ? `${tauntCooldown}s` : "তাচ্ছিল্য / TAUNT"}</span>
        </button>
      </div>

      {/* Dhaka TV Style Commentator Breaking News Ticker (P2-10) */}
      <div className="hud-ticker pointer-events-auto fixed bottom-0 left-0 right-0 z-40 flex items-center bg-slate-950/95 border-t-2 border-yellow-400 shadow-2xl backdrop-blur-md h-7 sm:h-8 px-2 overflow-hidden">
        {/* Red Breaking Badge */}
        <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-md font-comic text-[10px] sm:text-xs font-black text-white shrink-0 shadow animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span>ব্রেকিং NEWS</span>
        </div>
        {/* Ticker Text */}
        <div className="flex-1 overflow-hidden px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 truncate font-bangla text-xs sm:text-sm font-bold text-yellow-300"
            >
              <span>{COMMENTATOR_TICKER[tickerIndex].bn}</span>
              <span className="text-slate-400 text-[10px] hidden md:inline">
                ({COMMENTATOR_TICKER[tickerIndex].en})
              </span>
            </motion.div>
          </AnimatePresence>
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
