"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";
import {
  Wrench,
  X,
  Zap,
  CloudRain,
  Flame,
  DollarSign,
  Skull,
  Activity,
  Gauge,
  Play,
  RotateCcw,
} from "lucide-react";

export function DebugBar() {
  const {
    isDebugOpen,
    setDebugOpen,
    isDemoMode,
    addTaka,
    fillRage,
    killVillain,
    settings,
    updateSettings,
    activeEvent,
  } = useGameStore();

  const [fps, setFps] = useState(60);
  const [showFps, setShowFps] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Listen to FPS updates from Phaser RunScene
  useEffect(() => {
    const handleFps = (data: { fps: number }) => {
      setFps(data.fps);
    };
    gameBus.on("fps:update", handleFps);
    return () => {
      gameBus.off("fps:update", handleFps);
    };
  }, []);

  // Update timeScale when speed multiplier changes
  const handleSpeedChange = (val: number) => {
    setSpeedMultiplier(val);
    gameBus.emit("debug:timeScale", { scale: val });
  };

  const triggerEvent = (eventId: string) => {
    audioService.play("click");
    gameBus.emit("event:trigger", { eventId });
  };

  const clearEvent = () => {
    audioService.play("click");
    gameBus.emit("event:clear");
  };

  const spawnObstacle = () => {
    audioService.play("click");
    gameBus.emit("debug:spawnObstacle");
  };

  if (!isDebugOpen && !isDemoMode) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 z-50 select-none font-sans text-xs">
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 rounded-lg border-2 border-amber-400 bg-slate-900/90 px-2.5 py-1.5 text-amber-300 shadow-xl backdrop-blur-md hover:bg-slate-800"
          title="Open Debug Panel"
        >
          <Wrench className="h-4 w-4 text-amber-400" />
          <span className="font-comic font-bold uppercase tracking-wider">
            Debug {showFps && `(${fps} FPS)`}
          </span>
        </button>
      ) : (
        <div className="w-80 rounded-2xl border-2 border-amber-400 bg-slate-950/95 p-3.5 text-slate-200 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-2.5 flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-400" />
              <span className="font-comic text-sm tracking-wider text-amber-400 uppercase">
                God Mode Debug
              </span>
              {showFps && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    fps >= 55
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-600/40"
                      : "bg-rose-950 text-rose-400 border border-rose-600/40"
                  }`}
                >
                  {fps} FPS
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(true)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Collapse"
              >
                &minus;
              </button>
              <button
                onClick={() => setDebugOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Demo banner indicator if active */}
          {isDemoMode && (
            <div className="mb-2 rounded-lg border border-cyan-500/50 bg-cyan-950/40 p-2 text-cyan-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Play className="h-3.5 w-3.5" />
                <span>Scripted Showcase Active</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1">
            {/* World Events Section */}
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Trigger World Events
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => triggerEvent("evt_loadshedding")}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-2 py-1.5 text-amber-300 hover:bg-amber-900/50 active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Loadshedding</span>
                </button>
                <button
                  onClick={() => triggerEvent("evt_pollution")}
                  className="flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-950/30 px-2 py-1.5 text-yellow-300 hover:bg-yellow-900/50 active:scale-95"
                >
                  <CloudRain className="h-3.5 w-3.5 text-yellow-400" />
                  <span>Pollution</span>
                </button>
                <button
                  onClick={() => triggerEvent("evt_strike")}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 px-2 py-1.5 text-rose-300 hover:bg-rose-900/50 active:scale-95"
                >
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  <span>Strike</span>
                </button>
                <button
                  onClick={clearEvent}
                  disabled={!activeEvent}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear Event</span>
                </button>
              </div>
            </div>

            {/* Combat & Cheats */}
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cheats & Resources
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    audioService.play("coin");
                    addTaka(500);
                  }}
                  className="flex items-center justify-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/30 py-1.5 text-emerald-300 hover:bg-emerald-900/50 active:scale-95"
                  title="Add 500 Taka"
                >
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  <span>+500 ৳</span>
                </button>
                <button
                  onClick={() => {
                    audioService.play("combo");
                    fillRage();
                  }}
                  className="flex items-center justify-center gap-1 rounded-lg border border-orange-500/40 bg-orange-950/30 py-1.5 text-orange-300 hover:bg-orange-900/50 active:scale-95"
                  title="Fill Rage to 100%"
                >
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span>Max Rage</span>
                </button>
                <button
                  onClick={() => {
                    audioService.play("hit");
                    killVillain();
                  }}
                  className="flex items-center justify-center gap-1 rounded-lg border border-red-500/40 bg-red-950/30 py-1.5 text-red-300 hover:bg-red-900/50 active:scale-95"
                  title="Instant KO"
                >
                  <Skull className="h-3.5 w-3.5 text-red-400" />
                  <span>Kill KO</span>
                </button>
              </div>
            </div>

            {/* Spawn System */}
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Spawners
              </p>
              <button
                onClick={spawnObstacle}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 py-1.5 text-purple-300 hover:bg-purple-900/50 active:scale-95"
              >
                <Flame className="h-3.5 w-3.5 text-purple-400" />
                <span>Spawn Obstacle (Tire / Barricade / Brick)</span>
              </button>
            </div>

            {/* Simulation Speed */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  Time Scale: {speedMultiplier.toFixed(2)}x
                </span>
                <div className="flex gap-1 text-[10px]">
                  {[0.25, 0.5, 1.0, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-1.5 py-0.5 rounded ${
                        speedMultiplier === s
                          ? "bg-amber-400 text-black font-bold"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={speedMultiplier}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Performance & Toggles */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[11px]">
              <button
                onClick={() => setShowFps(!showFps)}
                className={`flex items-center gap-1 rounded px-2 py-1 ${
                  showFps
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>FPS: {showFps ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() =>
                  updateSettings({
                    quality: settings.quality === "high" ? "low" : "high",
                  })
                }
                className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 font-bold text-slate-300 hover:bg-slate-700"
              >
                Quality: {settings.quality.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
