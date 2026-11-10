"use client";

import React from "react";

export function AppShell() {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-4 text-center">
      <div className="max-w-md rounded-2xl border-4 border-amber-500 bg-slate-900 p-8 shadow-2xl">
        <h1 className="font-comic text-4xl text-amber-400 drop-shadow-md sm:text-5xl">
          PERA NAI CHILL
        </h1>
        <p className="font-bangla mt-2 text-xl font-semibold text-rose-400">
          ঢাকা রেজ রানার (Dhaka Rage Runner)
        </p>
        <p className="mt-4 text-sm text-slate-300">
          Satirical stress-relief 2D action runner. Ready to smack villains with
          the flying chappal!
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400">T00 Scaffold Green</span>
        </div>
      </div>
    </main>
  );
}
