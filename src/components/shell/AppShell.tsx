"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

export function AppShell() {
  const { screen, setScreen } = useGameStore();

  if (screen === "BOOT") {
    return <LoadingScreen />;
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-4 text-center">
      <div className="max-w-md rounded-2xl border-4 border-amber-500 bg-slate-900 p-8 shadow-2xl">
        <h1 className="font-comic text-4xl text-amber-400 drop-shadow-md sm:text-5xl">
          PERA NAI CHILL
        </h1>
        <p className="font-bangla mt-2 text-xl font-semibold text-rose-400">
          ঢাকা রেজ রানার &bull; লবি
        </p>
        <p className="mt-4 text-sm text-slate-300">
          Current State: <span className="font-mono font-bold text-amber-300">{screen}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setScreen("BOOT")}
            className="rounded-xl border-2 border-black bg-amber-500 px-4 py-2 font-comic text-sm text-slate-950 shadow-md hover:bg-amber-400"
          >
            &larr; Re-run Boot Screen
          </button>
        </div>
      </div>
    </main>
  );
}
