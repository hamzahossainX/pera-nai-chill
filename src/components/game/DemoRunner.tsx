"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";

export function DemoRunner() {
  const { isDemoMode, screen } = useGameStore();
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isDemoMode || screen !== "PLAYING") {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      return;
    }

    // Schedule scripted showcase events
    // 1. Loadshedding at 5s
    const t1 = setTimeout(() => {
      gameBus.emit("event:trigger", { eventId: "evt_loadshedding" });
    }, 5000);

    // 2. Pollution at 18s
    const t2 = setTimeout(() => {
      gameBus.emit("event:trigger", { eventId: "evt_pollution" });
    }, 18000);

    // 3. Strike at 32s
    const t3 = setTimeout(() => {
      gameBus.emit("event:trigger", { eventId: "evt_strike" });
    }, 32000);

    timeoutsRef.current = [t1, t2, t3];

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [isDemoMode, screen]);

  return null;
}
