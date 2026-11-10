"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";
import { DollarSign } from "lucide-react";

interface BribeButtonProps {
  eventId: string;
  costTaka: number;
  label?: { en: string; bn: string };
}

export function BribeButton({ eventId, costTaka, label }: BribeButtonProps) {
  const { taka, spendTaka, settings } = useGameStore();
  const [isShaking, setIsShaking] = useState(false);

  const handleBribe = () => {
    if (taka < costTaka) {
      // Trigger refusal shake animation
      audioService.play("click");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const spent = spendTaka(costTaka);
    if (spent) {
      audioService.play("coin");
      gameBus.emit("event:bribe", { eventId });
    }
  };

  const buttonText = label
    ? settings.lang === "bn"
      ? label.bn
      : label.en
    : "Bribe / টাকা দিন";

  return (
    <motion.button
      animate={
        isShaking
          ? { x: [-10, 10, -8, 8, -4, 4, 0] }
          : { scale: [1, 1.03, 1] }
      }
      transition={
        isShaking
          ? { duration: 0.4 }
          : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
      }
      whileTap={{ scale: 0.95 }}
      onClick={handleBribe}
      className={`pointer-events-auto flex items-center gap-2 rounded-xl border-2 border-black px-4 py-2 font-comic text-xs sm:text-sm tracking-wide text-black shadow-md transition-colors ${
        taka >= costTaka
          ? "bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200"
          : "bg-slate-600 text-slate-300 opacity-80"
      }`}
    >
      <DollarSign className="h-4 w-4 shrink-0 fill-black" />
      <span>
        {buttonText} ({costTaka}৳)
      </span>
    </motion.button>
  );
}
