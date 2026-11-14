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
import { Settings, Play, ShoppingBag, Trophy, FileText } from "lucide-react";
import { audioService } from "@/services/audio";
import { faceService } from "@/services/faceService";

export function AppShell() {
  const {
    screen,
    startGame,
    targetFaceUrl,
    setTargetFace,
    setDebugOpen,
    setDemoMode,
  } = useGameStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const logoTapRef = useRef(0);

  // Check URL parameters for ?debug=1 and ?demo=1
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
                <span className="hidden sm:inline">দোকান / SHOP</span>
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
                <span className="hidden sm:inline">অর্জন</span>
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
                <span className="hidden sm:inline">পোস্টার</span>
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

          {/* Main Lobby Form Sections */}
          <main className="mx-auto mt-4 flex max-w-4xl flex-col gap-6 pb-40">
            <DailyChallengeCard />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FaceUploader />
              <VillainPreview />
            </div>

            <MapSelector />

            <WeaponSelector />
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
                <span>রাস্তায় নামাও (START RUN)</span>
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
