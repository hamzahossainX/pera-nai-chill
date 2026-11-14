"use client";

import React from "react";
import { gameBus } from "@/game/bus";
import { ChevronUp, ChevronDown, Zap, ArrowUp } from "lucide-react";

export function TouchControls() {
  const handleCommand = (type: "LANE_UP" | "LANE_DOWN" | "JUMP" | "DASH") => {
    gameBus.emit("input:command", {
      command: { type, timestamp: Date.now() },
    });
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between p-4 pb-6"
      data-testid="touch-controls"
    >
      {/* Left Thumb Cluster: Lane Up & Lane Down */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-label="Lane Up"
          onPointerDown={() => handleCommand("LANE_UP")}
          onClick={() => handleCommand("LANE_UP")}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-slate-900/80 text-amber-300 shadow-xl backdrop-blur-md transition active:scale-90 active:bg-amber-500 active:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <ChevronUp className="h-8 w-8 stroke-[3]" />
        </button>
        <button
          type="button"
          aria-label="Lane Down"
          onPointerDown={() => handleCommand("LANE_DOWN")}
          onClick={() => handleCommand("LANE_DOWN")}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-slate-900/80 text-amber-300 shadow-xl backdrop-blur-md transition active:scale-90 active:bg-amber-500 active:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <ChevronDown className="h-8 w-8 stroke-[3]" />
        </button>
      </div>

      {/* Right Thumb Cluster: Dash & Jump */}
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Dash"
          onPointerDown={() => handleCommand("DASH")}
          onClick={() => handleCommand("DASH")}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-slate-900/80 text-cyan-300 shadow-xl backdrop-blur-md transition active:scale-90 active:bg-cyan-500 active:text-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <Zap className="h-7 w-7 stroke-[2.5]" />
        </button>
        <button
          type="button"
          aria-label="Jump"
          onPointerDown={() => handleCommand("JUMP")}
          onClick={() => handleCommand("JUMP")}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/40 bg-slate-900/80 text-emerald-300 shadow-xl backdrop-blur-md transition active:scale-90 active:bg-emerald-500 active:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <ArrowUp className="h-7 w-7 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
