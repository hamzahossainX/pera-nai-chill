"use client";

import React, { useEffect, useRef } from "react";
import type Phaser from "phaser";

export function GameHost() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPhaser() {
      if (!containerRef.current || gameRef.current) return;

      const { createGame } = await import("@/game/createGame");

      if (isMounted && containerRef.current && !gameRef.current) {
        gameRef.current = createGame(containerRef.current);
      }
    }

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black select-none">
      <div
        ref={containerRef}
        id="phaser-container"
        className="relative aspect-video h-full w-full max-h-full max-w-full overflow-hidden shadow-2xl flex items-center justify-center"
      />
    </div>
  );
}
