"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { FaceUploader } from "@/components/lobby/FaceUploader";
import { VillainPreview } from "@/components/lobby/VillainPreview";
import { MapSelector } from "@/components/lobby/MapSelector";
import { WeaponSelector } from "@/components/lobby/WeaponSelector";
import { SettingsSheet } from "@/components/lobby/SettingsSheet";
import { ShopModal } from "@/components/game/ShopModal";
import { AchievementsModal } from "@/components/game/AchievementsModal";
import { WantedPosterModal } from "@/components/game/WantedPosterModal";
import { DailyChallengeCard } from "@/components/game/DailyChallengeCard";
import { GameHost } from "@/components/game/GameHost";
import { HudOverlay } from "@/components/game/HudOverlay";
import { WeaponDock } from "@/components/game/WeaponDock";
import { GameOverScreen } from "@/components/gameover/GameOverScreen";
import { DebugBar } from "@/components/game/DebugBar";
import { DemoRunner } from "@/components/game/DemoRunner";
import { MAP_SCENARIOS } from "@/config/maps";
import {
  Settings,
  Play,
  ShoppingBag,
  Trophy,
  FileText,
  MapPin,
  Clock3,
  ChevronDown,
} from "lucide-react";
import { audioService } from "@/services/audio";
import { faceService } from "@/services/faceService";
import { useI18n } from "@/i18n";

export function AppShell() {
  const {
    screen,
    startGame,
    targetFaceUrl,
    currentMapId,
    timeOfDay,
    setTargetFace,
    setDebugOpen,
    setDemoMode,
    hydrateSettings,
    hydrateMapProgress,
  } = useGameStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const logoTapRef = useRef(0);
  const { t } = useI18n();

  // Check URL parameters for ?debug=1 and ?demo=1
  useEffect(() => {
    hydrateSettings();
    audioService.setMuted(!useGameStore.getState().settings.sound);
  }, [hydrateSettings]);

  useEffect(() => {
    hydrateMapProgress();
  }, [hydrateMapProgress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug") === "1") {
        setDebugOpen(true);
      }
      if (params.get("demo") === "1") {
        setDemoMode(true);
        if (!targetFaceUrl) {
          const defaultFace = faceService.generateDefaultCaricature();
          setTargetFace(defaultFace);
        }
      }
    }
  }, [setDebugOpen, setDemoMode, targetFaceUrl, setTargetFace]);

  const handleLogoTap = () => {
    logoTapRef.current += 1;
    if (logoTapRef.current >= 5) {
      logoTapRef.current = 0;
      setDebugOpen(true);
      audioService.play("coin");
    }
  };

  const handleStartGame = () => {
    audioService.play("click");
    startGame();
  };

  const selectedMap = MAP_SCENARIOS.find((map) => map.id === currentMapId);

  return (
    <>
      <DebugBar />
      <DemoRunner />

      {screen === "BOOT" && <LoadingScreen />}

      {(screen === "PLAYING" || screen === "PAUSED") && (
        <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
          <GameHost />
          <HudOverlay />
          <WeaponDock />
        </div>
      )}

      {screen === "GAME_OVER" && (
        <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
          <GameHost />
          <GameOverScreen />
        </div>
      )}

      {screen === "LOBBY" && (
        <div className="relative h-dvh min-h-0 w-screen overflow-x-hidden overflow-y-auto overscroll-contain bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 text-slate-100 [touch-action:pan-y] sm:p-6 select-none">
          <SettingsSheet
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />

          {/* Top Bar */}
          <header className="sticky top-0 z-20 mx-auto flex max-w-4xl items-center justify-between bg-slate-950/85 py-2 backdrop-blur-md">
            <div
              onClick={handleLogoTap}
              className="cursor-pointer select-none active:scale-95 transition-transform"
              title="Tap 5 times to open debug panel"
            >
              <h1 className="font-comic text-3xl tracking-wider text-amber-400 drop-shadow-[0_2px_0_rgba(0,0,0,1)] sm:text-4xl">
                PERA NAI CHILL
              </h1>
              <p className="font-bangla text-xs font-bold text-rose-400">
                ঢাকা রেজ রানার &bull; লবি কন্ট্রোল
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audioService.play("click");
                  setIsShopOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-500 px-3 py-2 text-slate-950 font-comic text-xs font-bold shadow-md hover:bg-amber-400 active:scale-95"
                title="Shop"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">{t("shop")}</span>
              </button>

              <button
                onClick={() => {
                  audioService.play("click");
                  setIsAchievementsOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-yellow-400 px-3 py-2 text-slate-950 font-comic text-xs font-bold shadow-md hover:bg-yellow-300 active:scale-95"
                title="Achievements"
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">{t("achievements")}</span>
              </button>

              <button
                onClick={() => {
                  audioService.play("click");
                  setIsPosterOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-500 px-3 py-2 text-slate-950 font-comic text-xs font-bold shadow-md hover:bg-emerald-400 active:scale-95"
                title="Wanted Poster Maker"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{t("poster")}</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-slate-800 p-2 text-slate-300 shadow-md hover:bg-slate-700 hover:text-white"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Main Lobby: quick start first, advanced controls below */}
          <main className="mx-auto mt-4 flex max-w-4xl flex-col gap-5 pb-40">
            <section className="rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-amber-500/20 via-slate-900 to-rose-900/30 p-4 shadow-xl sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-comic text-xs tracking-[0.2em] text-yellow-300">
                    {t("stageRun")}
                  </p>
                  <h2 className="mt-1 font-comic text-3xl text-white">
                    {selectedMap?.name.en ?? "Dhaka Route"}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-300" />
                      {selectedMap?.name.bn}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1">
                      <Clock3 className="h-3.5 w-3.5 text-sky-300" />
                      {timeOfDay}
                    </span>
                    <span className="rounded-full bg-slate-950/70 px-2.5 py-1">
                      {t("stageRun")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleStartGame}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gradient-to-r from-amber-400 to-rose-500 px-6 font-comic text-xl text-slate-950 shadow-[0_4px_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none"
                >
                  <Play className="h-6 w-6 fill-current" />
                  {t("playNow")}
                </button>
              </div>
            </section>

            <MapSelector />

            <details className="lobby-advanced rounded-2xl border-2 border-slate-700 bg-slate-900/70">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-comic text-lg text-yellow-300 [&::-webkit-details-marker]:hidden">
                <span>{t("customize")}</span>
                <ChevronDown className="h-5 w-5 transition-transform" />
              </summary>
              <div className="grid grid-cols-1 gap-6 border-t border-slate-700 p-4 md:grid-cols-2">
                <DailyChallengeCard />
                <FaceUploader />
                <VillainPreview />
              </div>
            </details>

            <details className="lobby-advanced rounded-2xl border-2 border-slate-700 bg-slate-900/70">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-comic text-lg text-yellow-300 [&::-webkit-details-marker]:hidden">
                <span>{t("arsenal")}</span>
                <ChevronDown className="h-5 w-5" />
              </summary>
              <div className="border-t border-slate-700 p-4">
                <WeaponSelector />
              </div>
            </details>
          </main>

          {/* Modals */}
          <ShopModal
            isOpen={isShopOpen}
            onClose={() => setIsShopOpen(false)}
          />
          <AchievementsModal
            isOpen={isAchievementsOpen}
            onClose={() => setIsAchievementsOpen(false)}
          />
          <WantedPosterModal
            isOpen={isPosterOpen}
            onClose={() => setIsPosterOpen(false)}
          />

          {/* Fixed Bottom Launch Bar */}
          <footer className="fixed bottom-0 left-0 right-0 z-30 border-t-4 border-black bg-slate-950/95 p-3.5 backdrop-blur-md">
            <div className="mx-auto flex max-w-md items-center justify-center">
              <button
                onClick={handleStartGame}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-4 border-black bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 py-3.5 font-comic text-2xl tracking-wider text-white shadow-[0_5px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none"
              >
                <Play className="h-7 w-7 fill-white" />
                <span>{t("startRun")}</span>
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
