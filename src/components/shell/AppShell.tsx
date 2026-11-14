"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { OrientationGuard } from "@/components/shell/OrientationGuard";
import { VILLAINS } from "@/config/villains";
import { MAP_SCENARIOS } from "@/config/maps";
import "./Lobby.css";
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
import { TouchControls } from "@/components/game/TouchControls";
import { GameOverScreen } from "@/components/gameover/GameOverScreen";
import { DebugBar } from "@/components/game/DebugBar";
import { DemoRunner } from "@/components/game/DemoRunner";
import { Settings, Play, ShoppingBag, Trophy, FileText } from "lucide-react";
import { audioService } from "@/services/audio";
import { faceService } from "@/services/faceService";

export function AppShell() {
  const {
    screen,
    villainId,
    currentMapId,
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

      {(screen === "PLAYING" || screen === "PAUSED" || screen === "GAME_OVER") && (
        <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
          <GameHost />
          {(screen === "PLAYING" || screen === "PAUSED") && (
            <>
              <OrientationGuard />
              <HudOverlay />
              <WeaponDock />
              <TouchControls />
            </>
          )}
          {screen === "GAME_OVER" && <GameOverScreen />}
        </div>
      )}

      {screen === "LOBBY" && (
        <div className="pnc-lobby">
          <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          <header className="pnc-header">
            <button onClick={handleLogoTap} className="pnc-brand" aria-label="Pera Nai Chill — tap five times for debug">
              <span className="font-comic">PERA NAI CHILL</span>
              <span>ঢাকার রাস্তায়, নিজের ছন্দে।</span>
            </button>
            <nav aria-label="লবি মেনু" className="pnc-nav">
              <button onClick={() => setIsShopOpen(true)} aria-label="দোকান / Shop"><ShoppingBag /><span>দোকান</span></button>
              <button onClick={() => setIsAchievementsOpen(true)} aria-label="অর্জন / Achievements"><Trophy /><span>অর্জন</span></button>
              <button onClick={() => setIsPosterOpen(true)} aria-label="পোস্টার / Wanted poster"><FileText /><span>পোস্টার</span></button>
              <button onClick={() => setIsSettingsOpen(true)} aria-label="সেটিংস / Settings"><Settings /></button>
            </nav>
          </header>
          <main className="pnc-main">
            <div className="pnc-intro">
              <h1>মুখের ছবি দিন। রুট ঠিক করুন।</h1>
              <p>নিজের ছবি দিন বা তৈরি মুখ রাখুন। তারপর ভিলেন আর রুট বেছে নিন।</p>
            </div>
            <div className="pnc-face-section"><FaceUploader /></div>
            <div className="pnc-setup">
              <VillainPreview />
              <div className="pnc-routeColumn">
                <MapSelector />
                <DailyChallengeCard />
              </div>
            </div>
            <details className="pnc-optional">
              <summary>নিজের মতো সাজান <span>লোডআউট · ঐচ্ছিক</span></summary>
              <div className="pnc-extras"><WeaponSelector /></div>
            </details>
          </main>
          <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
          <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
          <WantedPosterModal isOpen={isPosterOpen} onClose={() => setIsPosterOpen(false)} />
          <footer className="pnc-launch">
            <div>
              <p aria-live="polite">{VILLAINS.find(v => v.id === villainId)?.name.bn} <span> / </span> {MAP_SCENARIOS.find(m => m.id === currentMapId)?.name.bn}</p>
              <button onClick={handleStartGame} className="pnc-start"><Play aria-hidden="true" /><span>রাস্তায় নামুন <small>Start run</small></span></button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
