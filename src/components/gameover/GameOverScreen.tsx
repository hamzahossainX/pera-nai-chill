"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";
import { MAP_ORDER, MAP_SCENARIOS } from "@/config/maps";
import { getNextMapId, getStarRating } from "@/config/progression";
import { Trophy, RotateCcw, User, FileText, Home, ArrowRight } from "lucide-react";
import { WantedPosterModal } from "@/components/game/WantedPosterModal";
import { useI18n } from "@/i18n";

export function GameOverScreen() {
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const { t, language } = useI18n();
  const {
    villainHp,
    targetName,
    targetFaceUrl,
    rageScore,
    combo,
    taka,
    currentMapId,
    completedMapIds,
    startGame,
    setMapId,
    resetRun,
  } = useGameStore();

  const isWin = villainHp === 0;
  const starCount = getStarRating(isWin, combo);
  const nextMapId = getNextMapId(currentMapId);
  const nextMap = MAP_SCENARIOS.find((map) => map.id === nextMapId);
  const hasNextMap = Boolean(
    isWin && nextMap && completedMapIds.includes(currentMapId),
  );

  const rankTitle = isWin
    ? "মহাচোর দমনকারী (Master Hunter)"
    : combo >= 10
    ? "জুতার কারিগর (Chappal Craftsman)"
    : "প্যারা-লেস লিজেন্ড (Stress-Free Legend)";

  const handleRetry = () => {
    audioService.play("click");
    startGame();
  };

  const handleChangeFace = () => {
    audioService.play("click");
    resetRun();
  };

  const handleNextMap = () => {
    if (!nextMap || !hasNextMap) return;
    audioService.play("click");
    setMapId(nextMap.id);
    startGame();
  };

  const handleLobby = () => {
    audioService.play("click");
    resetRun();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md select-none sm:p-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="my-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-4 border-yellow-400 bg-slate-900 p-4 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] sm:gap-5 sm:p-8"
      >
        {/* Result Header Badge */}
        <div
          className={`rounded-full px-5 py-1.5 font-comic text-sm tracking-wider uppercase shadow-md ${
            isWin ? "bg-emerald-500 text-black" : "bg-rose-500 text-white"
          }`}
        >
          {isWin ? t("missionAccomplished") : t("targetEscaped")}
        </div>

        {/* Performance stars */}
        <div className="flex items-center gap-2" aria-label={`${starCount} out of 3 stars`}>
          {[1, 2, 3].map((star) => (
            <motion.span
              key={star}
              initial={{ scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.35 + star * 0.15, type: "spring" }}
              className={`text-4xl leading-none ${
                star <= starCount
                  ? "text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  : "text-slate-700"
              }`}
            >
              ★
            </motion.span>
          ))}
        </div>

        {/* Big Bengali Headline */}
        <div>
          <h2
            className={`font-comic text-4xl sm:text-5xl tracking-wide drop-shadow-md ${
              isWin ? "text-yellow-300" : "text-rose-400"
            }`}
          >
            {isWin
              ? language === "bn"
                ? "ধরা খাইছে!"
                : "VICTORY!"
              : language === "bn"
              ? "পালাইছে!"
              : "DEFEAT!"}
          </h2>
          <p className="font-bangla mt-1 text-sm font-semibold text-slate-300">
            {isWin
              ? `${targetName}-কে উচিৎ শিক্ষা দেওয়া হয়েছে!`
              : `${targetName} টাকা নিয়ে চম্পট দিয়েছে!`}
          </p>
        </div>

        {/* Target Face Display */}
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-400 bg-slate-800 shadow-xl">
            {targetFaceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetFaceUrl}
                alt="Target Face"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {isWin && (
            <span className="absolute -bottom-2 -right-2 text-3xl">🩴</span>
          )}
        </div>

        {/* Rank Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="font-bangla text-sm font-bold text-yellow-300">
            {rankTitle}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {t("score")}
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-rose-400">
              {rageScore}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              COMBO
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-yellow-300">
              {combo}x
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {t("taka")}
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-emerald-400">
              ৳{taka}
            </div>
          </div>
        </div>

        {/* Map progression */}
        <div className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-comic text-xs text-slate-300">{t("mapProgress")}</span>
            <span className="font-mono text-[10px] text-slate-500">
              {completedMapIds.length}/{MAP_ORDER.length} {t("cleared")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MAP_ORDER.map((mapId) => {
              const map = MAP_SCENARIOS.find((scenario) => scenario.id === mapId);
              const completed = completedMapIds.includes(mapId);
              const active = mapId === currentMapId;
              return (
                <div
                  key={mapId}
                  className={`rounded-lg border px-1.5 py-1.5 text-center text-[10px] ${
                    completed
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                      : active
                      ? "border-yellow-400/70 bg-yellow-400/10 text-yellow-200"
                      : "border-slate-800 bg-slate-900 text-slate-500"
                  }`}
                >
                  {map?.name.en}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2.5 mt-2">
          <button
            onClick={handleNextMap}
            disabled={!hasNextMap}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-emerald-500 py-3.5 font-comic text-lg text-black shadow-lg hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
          >
            <ArrowRight className="h-5 w-5" />
            {hasNextMap ? `${t("nextMap")} / ${nextMap?.name[language]}` : t("allMapsCleared")}
          </button>

          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gradient-to-r from-amber-500 to-yellow-400 py-3.5 font-comic text-xl text-black shadow-lg hover:from-amber-400 hover:to-yellow-300"
          >
            <RotateCcw className="h-5 w-5" /> {t("replay")}
          </button>

          <button
            onClick={() => setIsPosterOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-emerald-500 py-3 font-comic text-sm font-bold text-black hover:bg-emerald-400 active:scale-95"
          >
            <FileText className="h-4 w-4" /> পোস্টার এক্সপোর্ট / WANTED POSTER
          </button>

          <button
            onClick={handleLobby}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-slate-800 py-3 font-comic text-sm text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <Home className="h-4 w-4" /> {t("lobby")}
          </button>

          <button
            onClick={handleChangeFace}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-slate-900 py-2.5 font-comic text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <User className="h-4 w-4" /> {t("changeTarget")}
          </button>
        </div>
      </motion.div>

      <WantedPosterModal
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
      />
    </div>
  );
}
