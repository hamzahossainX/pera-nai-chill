"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { VILLAINS } from "@/config/villains";
import { ArrowLeft, Eye, Play, Skull, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

interface CharacterDef {
  id: string;
  name: { en: string; bn: string };
  role: string;
  outfitColor: string;
  pantColor: string;
  propIcon: string;
  propName: string;
  bio: string;
  features: string[];
}

const ALL_CHARACTERS: CharacterDef[] = [
  {
    id: "chaser",
    name: { en: "Aam-Janata Hero", bn: "আম-জনতা হিরো (ধাওয়াকারী)" },
    role: "Chaser / Hero",
    outfitColor: "#10b981",
    pantColor: "#1d4ed8",
    propIcon: "🩴",
    propName: "Bata Hawaii Chappal",
    bio: "Everyday honest Dhaka citizen fed up with traffic, inflation, and street crime.",
    features: ["Athletic Green Polo", "Denim Jeans", "Red Sport Runners", "Clenched Fists"],
  },
  ...VILLAINS.map((v) => ({
    id: v.id,
    name: v.name,
    role: "Villain Archetype",
    outfitColor: `#${v.outfitColor.toString(16).padStart(6, "0")}`,
    pantColor: `#${v.pantColor.toString(16).padStart(6, "0")}`,
    propIcon:
      v.id === "phoneSnatcher"
        ? "📱"
        : v.id === "pickpocket"
        ? "👛"
        : v.id === "cableChor"
        ? "✂️"
        : v.id === "manholeChor"
        ? "🛡️"
        : v.id === "eidMarketChor"
        ? "🛍️"
        : v.id === "chickenChor"
        ? "🐓"
        : "💼",
    propName:
      v.id === "phoneSnatcher"
        ? "Stolen Smartphone"
        : v.id === "pickpocket"
        ? "Stolen Leather Wallet"
        : v.id === "cableChor"
        ? "Bolt Clippers & Copper Wire"
        : v.id === "manholeChor"
        ? "WASA Manhole Cover Shield"
        : v.id === "eidMarketChor"
        ? "Festive Luxury Shopping Bags"
        : v.id === "chickenChor"
        ? "Panicked Deshi Rooster"
        : "Briefcase of 1000 Taka Cash",
    bio: v.bio.bn,
    features: [
      `Base HP: ${v.baseHp}`,
      `Speed: ${v.speedMultiplier}x`,
      `Dodge: ${Math.round(v.dodgeRate * 100)}%`,
      v.title.bn,
    ],
  })),
];

function CharactersGalleryContent() {
  const searchParams = useSearchParams();
  const [activeState, setActiveState] = useState<"RUN" | "IDLE" | "HIT" | "DEAD">("RUN");
  const [scale, setScale] = useState<number>(1.0);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(
    () => searchParams.get("rig") === "1"
  );
  const [maskSlipStage, setMaskSlipStage] = useState<number>(1.0); // 1.0 (intact), 0.66 (slipped), 0.33 (fallen)

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-100 font-sans select-none">
      {/* Top Navigation & Controls */}
      <header className="mx-auto max-w-7xl mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Game</span>
            </Link>
            <h1 className="font-comic text-2xl sm:text-3xl text-yellow-400 tracking-wide">
              DHAKA RAGE RUNNER &bull; CHARACTER RIG DEV GALLERY
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSkeleton((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-mono font-bold transition shadow ${
                showSkeleton
                  ? "border-emerald-400 bg-emerald-950 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{showSkeleton ? "SKELETON: ON [?rig=1]" : "SKELETON: OFF"}</span>
            </button>
          </div>
        </div>

        {/* Toolbar: State Switcher & Scale Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-slate-800 bg-slate-900/80 p-3 backdrop-blur-md">
          {/* State Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-slate-400 mr-1">STATE:</span>
            {(["RUN", "IDLE", "HIT", "DEAD"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActiveState(st)}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-comic text-xs font-bold uppercase transition ${
                  activeState === st
                    ? "border-2 border-black bg-yellow-400 text-slate-950 shadow-md scale-105"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {st === "RUN" && <Play className="h-3.5 w-3.5" />}
                {st === "IDLE" && <Eye className="h-3.5 w-3.5" />}
                {st === "HIT" && <ShieldAlert className="h-3.5 w-3.5" />}
                {st === "DEAD" && <Skull className="h-3.5 w-3.5" />}
                <span>{st}</span>
              </button>
            ))}
          </div>

          {/* Mask-Slip Stage Trigger */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-slate-400 mr-1">MASK SLIP:</span>
            {[
              { label: "100% (Mask On)", stage: 1.0 },
              { label: "66% (Slipped)", stage: 0.66 },
              { label: "33% (Fallen)", stage: 0.33 },
            ].map((m) => (
              <button
                key={m.stage}
                onClick={() => setMaskSlipStage(m.stage)}
                className={`rounded-xl px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                  maskSlipStage === m.stage
                    ? "border border-rose-400 bg-rose-950 text-rose-300"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Scale Buttons (1x, 0.6x, 0.3x) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-slate-400 mr-1">SCALE:</span>
            {[
              { label: "1.0x (Detail)", val: 1.0 },
              { label: "0.6x (Game)", val: 0.6 },
              { label: "0.3x (Distance)", val: 0.3 },
            ].map((sc) => (
              <button
                key={sc.val}
                onClick={() => setScale(sc.val)}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition ${
                  scale === sc.val
                    ? "border-2 border-black bg-amber-500 text-black shadow"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 8 Characters Grid (Hero Chaser + 7 Villains) */}
      <main className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ALL_CHARACTERS.map((char) => (
          <div
            key={char.id}
            className="flex flex-col rounded-3xl border-3 border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur-md transition-all hover:border-amber-400/50"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
              <div>
                <span className="font-comic text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {char.role}
                </span>
                <h3 className="font-comic text-base text-white truncate max-w-[170px]">
                  {char.name.en}
                </h3>
              </div>
              <span className="text-2xl drop-shadow">{char.propIcon}</span>
            </div>

            {/* Character Viewport Box */}
            <div className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
              {/* Background Reference Grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Ground Baseline Marker */}
              <div className="absolute bottom-10 left-0 right-0 h-0.5 border-b border-dashed border-yellow-400/40" />

              {/* Character Rig Container */}
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "bottom center",
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="relative flex flex-col items-center"
              >
                {/* Motion Wrapper applying active state animation */}
                <motion.div
                  animate={
                    activeState === "RUN"
                      ? { y: [-3, 3, -3], rotate: [0, -1, 0] }
                      : activeState === "IDLE"
                      ? { y: [-1, 1, -1] }
                      : activeState === "HIT"
                      ? {
                          scaleX: [1, 1.3, 0.8, 1],
                          scaleY: [1, 0.7, 1.2, 1],
                          rotate: [-8, 8, 0],
                        }
                      : { rotate: 88, y: 35, opacity: 0.9 }
                  }
                  transition={{
                    repeat: activeState === "DEAD" ? 0 : Infinity,
                    duration: activeState === "RUN" ? 0.45 : activeState === "HIT" ? 0.35 : 1.8,
                    ease: "easeInOut",
                  }}
                  className="relative flex flex-col items-center select-none"
                >
                  {/* Head & Face Group */}
                  <div className="relative flex flex-col items-center z-25">
                    {/* Head hair / hoodie back */}
                    <div
                      className="absolute -inset-1 rounded-full border-2 border-black"
                      style={{
                        backgroundColor:
                          char.id === "phoneSnatcher"
                            ? "#090d16"
                            : char.id === "chorSardar"
                            ? "#1e293b"
                            : "#451a03",
                      }}
                    />

                    {/* Face Sprite circle */}
                    <div className="relative z-10 h-14 w-14 overflow-hidden rounded-full border-2 border-black bg-amber-200 shadow-md flex items-center justify-center">
                      <span className="text-xl">
                        {activeState === "DEAD"
                          ? "😵"
                          : activeState === "HIT"
                          ? "😱"
                          : char.id === "chaser"
                          ? "😤"
                          : "😼"}
                      </span>
                    </div>

                    {/* Mask Upper & Lower (with dynamic slip) */}
                    {char.id === "phoneSnatcher" && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/characters/phoneSnatcher/mask_upper.svg"
                          alt="Mask Upper"
                          className="pointer-events-none absolute -top-1 z-30 w-14"
                        />
                        {maskSlipStage > 0.33 && (
                          <motion.img
                            src="/assets/characters/phoneSnatcher/mask_lower.svg"
                            alt="Mask Lower"
                            animate={{
                              y: maskSlipStage <= 0.66 ? 12 : 0,
                              rotate: maskSlipStage <= 0.66 ? 6 : 0,
                            }}
                            className="pointer-events-none absolute bottom-0 z-30 w-12"
                          />
                        )}
                      </>
                    )}

                    {char.id === "pickpocket" && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src="/assets/characters/pickpocket/mask_lower.svg"
                        alt="Mustache"
                        className="pointer-events-none absolute bottom-1 z-30 w-10"
                      />
                    )}

                    {char.id === "chorSardar" && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src="/assets/characters/chorSardar/headFront.svg"
                        alt="Aviator Shades"
                        className="pointer-events-none absolute top-2 z-30 w-12"
                      />
                    )}

                    {/* Neck connecting Head to Torso */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/characters/shared/neck.svg"
                      alt="Neck"
                      className="relative -mt-2 z-10 h-3.5 w-5 object-contain"
                    />
                  </div>

                  {/* Torso & Arms */}
                  <div className="relative -mt-1 flex items-center justify-center z-15">
                    {/* Back Arm */}
                    <motion.div
                      animate={
                        activeState === "RUN"
                          ? { rotate: [26, -26, 26] }
                          : activeState === "HIT"
                          ? { rotate: 45 }
                          : { rotate: 8 }
                      }
                      transition={{
                        repeat: activeState === "RUN" ? Infinity : 0,
                        duration: 0.45,
                        ease: "easeInOut",
                      }}
                      className="absolute -left-3 top-1 origin-top"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/arm_upper.svg`}
                        alt="Back Arm"
                        className="h-8 w-5 object-contain"
                      />
                    </motion.div>

                    {/* Contoured Vector Torso */}
                    <div className="relative z-10 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/torso.svg`}
                        alt="Torso"
                        className="h-14 w-14 object-contain drop-shadow"
                      />

                      {/* Prop in hand */}
                      <motion.div
                        animate={{ rotate: [-8, 8, -8], y: [-1, 1, -1] }}
                        transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
                        className="absolute -right-4 top-3 z-30 select-none"
                      >
                        {char.id === "phoneSnatcher" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/phoneSnatcher/hand.svg" alt="Phone" className="w-7 h-7" />
                        )}
                        {char.id === "pickpocket" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/pickpocket/hand.svg" alt="Wallet" className="w-7 h-7" />
                        )}
                        {char.id === "cableChor" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/cableChor/prop_cutter.svg" alt="Cutter" className="w-8 h-8" />
                        )}
                        {char.id === "manholeChor" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/manholeChor/prop_manhole_cover.svg" alt="Cover" className="w-10 h-10" />
                        )}
                        {char.id === "eidMarketChor" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/eidMarketChor/prop_shopping_bags.svg" alt="Bags" className="w-9 h-9" />
                        )}
                        {char.id === "chickenChor" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/chickenChor/prop_chicken.svg" alt="Rooster" className="w-10 h-10" />
                        )}
                        {char.id === "chorSardar" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/chorSardar/prop_briefcase.svg" alt="Briefcase" className="w-9 h-8" />
                        )}
                        {char.id === "chaser" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src="/assets/characters/chaser/hand.svg" alt="Chaser Fist" className="w-6 h-6" />
                        )}
                      </motion.div>
                    </div>

                    {/* Front Arm */}
                    <motion.div
                      animate={
                        activeState === "RUN"
                          ? { rotate: [-26, 26, -26] }
                          : activeState === "HIT"
                          ? { rotate: -45 }
                          : { rotate: -8 }
                      }
                      transition={{
                        repeat: activeState === "RUN" ? Infinity : 0,
                        duration: 0.45,
                        ease: "easeInOut",
                      }}
                      className="absolute -right-3 top-1 origin-top z-20"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/arm_upper.svg`}
                        alt="Front Arm"
                        className="h-8 w-5 object-contain"
                      />
                    </motion.div>
                  </div>

                  {/* Legs with Shoes */}
                  <div className="flex gap-2 -mt-2 z-10">
                    <motion.div
                      animate={
                        activeState === "RUN"
                          ? { rotate: [26, -26, 26] }
                          : activeState === "HIT"
                          ? { rotate: -15 }
                          : { rotate: 0 }
                      }
                      transition={{
                        repeat: activeState === "RUN" ? Infinity : 0,
                        duration: 0.45,
                        ease: "easeInOut",
                      }}
                      className="origin-top flex flex-col items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/thigh.svg`}
                        alt="Thigh"
                        className="h-7 w-5 object-contain"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/foot.svg`}
                        alt="Foot"
                        className="h-4.5 w-7 -mt-1 object-contain"
                      />
                    </motion.div>

                    <motion.div
                      animate={
                        activeState === "RUN"
                          ? { rotate: [-26, 26, -26] }
                          : activeState === "HIT"
                          ? { rotate: 25 }
                          : { rotate: 0 }
                      }
                      transition={{
                        repeat: activeState === "RUN" ? Infinity : 0,
                        duration: 0.45,
                        ease: "easeInOut",
                      }}
                      className="origin-top flex flex-col items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/thigh.svg`}
                        alt="Thigh"
                        className="h-7 w-5 object-contain"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/characters/${char.id}/foot.svg`}
                        alt="Foot"
                        className="h-4.5 w-7 -mt-1 object-contain"
                      />
                    </motion.div>
                  </div>

                  {/* Ground Shadow */}
                  <motion.div
                    animate={
                      activeState === "RUN"
                        ? { scale: [1, 0.82, 1], opacity: [0.7, 0.4, 0.7] }
                        : { scale: 1, opacity: 0.6 }
                    }
                    transition={{
                      repeat: activeState === "RUN" ? Infinity : 0,
                      duration: 0.45,
                      ease: "easeInOut",
                    }}
                    className="mt-0.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/characters/shared/shadow.svg"
                      alt="Ground Shadow"
                      className="h-4 w-20 object-contain"
                    />
                  </motion.div>

                  {/* Skeleton Joint Hierarchy Overlay */}
                  {showSkeleton && (
                    <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center">
                      <svg className="h-full w-full overflow-visible" viewBox="-30 -80 60 100">
                        {/* Spine */}
                        <line x1="0" y1="0" x2="0" y2="-25" stroke="#00ff88" strokeWidth="2" strokeDasharray="2,2" />
                        <line x1="0" y1="-25" x2="0" y2="-50" stroke="#00ff88" strokeWidth="2" />
                        <line x1="0" y1="-50" x2="0" y2="-72" stroke="#00ff88" strokeWidth="2" />
                        {/* Arms */}
                        <line x1="0" y1="-50" x2="-14" y2="-45" stroke="#00ff88" strokeWidth="2" />
                        <line x1="-14" y1="-45" x2="-18" y2="-30" stroke="#00ff88" strokeWidth="2" />
                        <line x1="0" y1="-50" x2="14" y2="-45" stroke="#00ff88" strokeWidth="2" />
                        <line x1="14" y1="-45" x2="18" y2="-30" stroke="#00ff88" strokeWidth="2" />
                        {/* Legs */}
                        <line x1="0" y1="-25" x2="-8" y2="-12" stroke="#00ff88" strokeWidth="2" />
                        <line x1="-8" y1="-12" x2="-10" y2="2" stroke="#00ff88" strokeWidth="2" />
                        <line x1="0" y1="-25" x2="8" y2="-12" stroke="#00ff88" strokeWidth="2" />
                        <line x1="8" y1="-12" x2="10" y2="2" stroke="#00ff88" strokeWidth="2" />
                        {/* Joint nodes */}
                        <circle cx="0" cy="0" r="3" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                        <circle cx="0" cy="-25" r="3.5" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                        <circle cx="0" cy="-50" r="3" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                        <circle cx="0" cy="-72" r="4" fill="#facc15" stroke="#000000" strokeWidth="1" />
                        <circle cx="-14" cy="-45" r="2.5" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                        <circle cx="14" cy="-45" r="2.5" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                        <circle cx="-8" cy="-12" r="2.5" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                        <circle cx="8" cy="-12" r="2.5" fill="#00ffff" stroke="#000000" strokeWidth="1" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Character Info Card */}
            <div className="flex flex-col gap-2 p-4 bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="font-bangla text-xs font-bold text-yellow-300">
                  {char.name.bn}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  {char.propName}
                </span>
              </div>
              <p className="font-bangla text-xs text-slate-400 line-clamp-2">
                {char.bio}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {char.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default function CharactersGalleryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Character Gallery...</div>}>
      <CharactersGalleryContent />
    </Suspense>
  );
}
