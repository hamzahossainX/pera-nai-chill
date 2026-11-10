"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { BribeButton } from "@/components/game/BribeButton";
import { AlertTriangle, Clock } from "lucide-react";

export function EventBanner() {
  const { activeEvent, eventTimeLeft, settings } = useGameStore();

  if (!activeEvent) return null;

  const title =
    settings.lang === "bn" ? activeEvent.title.bn : activeEvent.title.en;
  const ticker =
    settings.lang === "bn" ? activeEvent.ticker.bn : activeEvent.ticker.en;

  const secondsLeft = Math.ceil(eventTimeLeft);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border-4 border-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 py-2.5 shadow-2xl backdrop-blur-md"
      >
        {/* Top Headline Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-300 animate-pulse shrink-0" />
          <div className="flex flex-col text-center">
            <span className="font-comic text-sm sm:text-base tracking-wide text-yellow-200 uppercase drop-shadow-md">
              {title}
            </span>
            <span className="font-bangla text-xs font-bold text-white drop-shadow-sm">
              {ticker}
            </span>
          </div>

          {/* Countdown Ring / Timer */}
          <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-mono font-bold text-yellow-300">
            <Clock className="h-3.5 w-3.5" />
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {/* Bribe Button if Bypass is Enabled */}
        {activeEvent.bypass.enabled && (
          <BribeButton
            eventId={activeEvent.id}
            costTaka={activeEvent.bypass.costTaka}
            label={activeEvent.bypass.label}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
