"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { LOADING_TIPS } from "@/config/tips";
import { audioService } from "@/services/audio";
import { Sparkles, Zap } from "lucide-react";

export function LoadingScreen() {
  const { loading, setLoading, setScreen, settings } = useGameStore();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showPlayAnyway, setShowPlayAnyway] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isReadyToTap, setIsReadyToTap] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, []);

  // 1. Tip rotation every 2.5s
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2500);
    return () => clearInterval(tipInterval);
  }, []);

  // 2. Fallback timeout after 12s
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowPlayAnyway(true);
    }, 12000);
    return () => clearTimeout(timeout);
  }, []);

  // 3. Asset & font warmup loader
  useEffect(() => {
    let isCancelled = false;

    async function warmUpPipeline() {
      // Step A: Fonts ready
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
          if (!isCancelled) setLoading({ fontsReady: true });
        } catch {
          if (!isCancelled) setLoading({ fontsReady: true });
        }
      } else {
        if (!isCancelled) setLoading({ fontsReady: true });
      }

      // Step B: Phaser JS dynamic import
      try {
        await import("phaser");
        if (!isCancelled) setLoading({ engineReady: true });
      } catch (err) {
        console.warn("Phaser lazy import note:", err);
        if (!isCancelled) setLoading({ engineReady: true });
      }

      // Step C: Simulated / Preload texture assets progress
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 80));
        if (!isCancelled) setLoading({ assetsProgress: p });
      }

      // Step D: Audio & Face warm up
      if (!isCancelled) {
        setLoading({ audioReady: true, faceModelReady: true });
      }
    }

    warmUpPipeline();
    return () => {
      isCancelled = true;
    };
  }, [setLoading]);

  // 4. Monotonic smooth easing for progress bar
  useEffect(() => {
    const target = loading.overall;
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const step = Math.max(1, Math.ceil((target - prev) * 0.2));
          return Math.min(target, prev + step);
        }
        return prev;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [loading.overall]);

  // 5. Min display time 1.2s check before unlocking "Tap to start"
  useEffect(() => {
    if (displayProgress >= 100) {
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 1200;
      const delay = Math.max(0, 1200 - elapsed);
      const timer = setTimeout(() => {
        setIsReadyToTap(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [displayProgress]);

  const handleStart = async () => {
    await audioService.unlock();
    audioService.play("click");
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pernaichill_hasSeenIntro", "true");
      } catch {}
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1") {
        setScreen("PLAYING");
        return;
      }
    }
    setScreen("LOBBY");
  };

  const titleWords = ["PERA", "NAI", "CHILL!"];
  const currentTip = LOADING_TIPS[currentTipIndex];

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-700 p-6 text-slate-900 select-none">
      {/* Decorative halftone overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top Header Badge */}
      <div className="z-10 mt-4 flex items-center gap-2 rounded-full border-2 border-black/30 bg-black/20 px-4 py-1.5 backdrop-blur-sm">
        <Sparkles className="h-4 w-4 text-yellow-300" />
        <span className="font-comic text-xs uppercase tracking-wider text-yellow-200">
          Street Action &bull; Dhaka Satire Runner
        </span>
      </div>

      {/* Central Title & Flying Chappal */}
      <div className="z-10 flex flex-col items-center text-center">
        {/* Flying Chappal Floating Visual */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [-6, 6, -6],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
          className="relative mb-4 text-7xl select-none"
        >
          🩴
          <motion.span
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -right-3 -top-2 text-2xl"
          >
            💨
          </motion.span>
        </motion.div>

        {/* Comic Animated Title */}
        <div className="flex gap-2.5 sm:gap-4">
          {titleWords.map((word, i) => (
            <motion.h1
              key={i}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: i * 0.15,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="font-comic text-5xl tracking-wide text-amber-200 drop-shadow-[0_4px_0px_rgba(0,0,0,0.85)] sm:text-7xl md:text-8xl"
            >
              {word}
            </motion.h1>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-bangla mt-2 text-xl font-bold text-rose-950 sm:text-2xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
        >
          ঢাকা রেজ রানার &bull; কার্টুন অ্যাকশন
        </motion.p>
      </div>

      {/* Bottom Section: Progress Bar, Tips, Tap to Start Button */}
      <div className="z-10 mb-8 flex w-full max-w-lg flex-col items-center gap-5 px-4">
        {/* Road Progress Bar */}
        <div className="relative w-full">
          <div className="relative h-7 w-full overflow-hidden rounded-full border-4 border-black bg-slate-900 shadow-inner">
            {/* Center Dashed Road Marking */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-around opacity-40">
              {[...Array(12)].map((_, idx) => (
                <div key={idx} className="h-1 w-3 rounded-sm bg-yellow-400" />
              ))}
            </div>

            {/* Filled Progress Bar */}
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 transition-all duration-150 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Running Rickshaw / Chappal Marker positioned on the bar */}
          <motion.div
            className="pointer-events-none absolute -top-4 text-2xl transition-all duration-150 ease-out"
            style={{
              left: `calc(${displayProgress}% - 14px)`,
            }}
          >
            🛺
          </motion.div>
        </div>

        {/* Progress Percentage Display */}
        <div className="flex w-full items-center justify-between text-xs font-mono font-bold text-slate-900">
          <span>{displayProgress < 100 ? "LOADING ASSETS..." : "READY!"}</span>
          <span>{displayProgress}%</span>
        </div>

        {/* Rotating Loading Tip */}
        <div className="h-14 w-full text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-bangla text-sm font-semibold text-slate-900 drop-shadow-sm sm:text-base"
            >
              {settings.lang === "bn" ? currentTip.bn : currentTip.en}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Tap to Start / Play Anyway Buttons */}
        {isReadyToTap ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{
              scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
              opacity: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center gap-3 rounded-2xl border-4 border-black bg-rose-500 px-8 py-4 font-comic text-2xl tracking-wider text-white shadow-[0_6px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 active:shadow-none"
          >
            <Zap className="h-6 w-6 fill-yellow-300 text-yellow-300" />
            <span>TAP TO START / শুরু করুন</span>
          </motion.button>
        ) : showPlayAnyway ? (
          <button
            onClick={handleStart}
            className="rounded-xl border-2 border-black/50 bg-black/30 px-4 py-2 font-mono text-xs text-yellow-200 underline hover:bg-black/50"
          >
            Slow network? Play anyway &rarr;
          </button>
        ) : null}
      </div>
    </div>
  );
}
