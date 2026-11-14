"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { isMapUnlocked, MAP_SCENARIOS, MapScenario } from "@/config/maps";
import { MapPin, AlertTriangle, Building2, Check, Lock } from "lucide-react";
import { audioService } from "@/services/audio";
import { useI18n } from "@/i18n";

export function MapSelector() {
  const {
    currentMapId,
    timeOfDay,
    settings,
    completedMapIds,
    setMapId,
    setTimeOfDay,
  } = useGameStore();
  const { t } = useI18n();

  const handleSelect = (map: MapScenario) => {
    if (!isMapUnlocked(map.id, completedMapIds)) return;
    audioService.play("click");
    setMapId(map.id);
    setTimeOfDay(map.supportedTimeOfDay.includes(timeOfDay) ? timeOfDay : map.defaultTimeOfDay);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-4 border-black bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-400" />
          <h3 className="font-comic text-xl text-yellow-300 tracking-wide">
            {t("mapSelection")}
          </h3>
        </div>
        <p className="font-bangla text-xs text-slate-400">
          {t("selectedRoute")}: <strong className="text-yellow-300">{MAP_SCENARIOS.find((m) => m.id === currentMapId)?.name[settings.lang]}</strong>
          <span className="mx-1 text-slate-600">•</span>
          {t("time")}: <strong className="text-sky-300">{timeOfDay}</strong>
        </p>
        <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
          ৩টি স্পেশাল জোন
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MAP_SCENARIOS.map((m) => {
          const isSelected = currentMapId === m.id;
          const isUnlocked = isMapUnlocked(m.id, completedMapIds);
          return (
            <button
              key={m.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => handleSelect(m)}
              className={`relative flex flex-col text-left p-3.5 rounded-xl border-3 transition-all ${
                isSelected
                  ? "border-yellow-400 bg-gradient-to-b from-yellow-500/20 to-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.35)] scale-[1.02]"
                  : !isUnlocked
                  ? "cursor-not-allowed border-slate-700/60 bg-slate-950/80 opacity-60"
                  : "border-black/60 bg-slate-800/80 hover:bg-slate-800 hover:border-slate-500"
              }`}
            >
              {/* Map preview */}
              <div
                className={`map-preview map-preview-${m.visualProfile} map-preview-${timeOfDay}`}
                aria-label={`${m.name.en} environment preview`}
              >
                <span className="map-preview-landmark">
                  {m.visualProfile === "residential"
                    ? "APARTMENTS"
                    : m.visualProfile === "commercial"
                    ? "FLYOVER"
                    : "MARKET GATE"}
                </span>
                <span className="map-preview-road" />
                <span className="map-preview-detail" />
              </div>

              {/* Active Badge */}
              {isSelected && (
                <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full border border-black bg-yellow-400 px-2 py-0.5 font-comic text-[10px] font-bold text-black uppercase">
                  <Check className="h-3 w-3" /> ACTIVE ROUTE
                </span>
              )}
              {!isUnlocked && (
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/45">
                  <span className="flex items-center gap-1 rounded-full border border-slate-500 bg-slate-950/90 px-2.5 py-1 font-comic text-xs text-slate-200">
                    <Lock className="h-3.5 w-3.5" /> {t("mapProgress")}
                  </span>
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-black/40 px-2 py-0.5 font-comic text-xs font-bold text-yellow-300">
                  {m.badgeText}
                </span>
                <span className="font-bangla text-base font-bold text-white truncate">
                  {m.name[settings.lang]}
                </span>
              </div>

              <p className="mt-1 font-bangla text-xs text-slate-300 line-clamp-2">
                {m.tagline[settings.lang]}
              </p>

              {/* Hazards & Landmarks */}
              <div className="mt-3 flex flex-col gap-1 border-t border-slate-700/60 pt-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span className="truncate">{m.hazards.primary}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-300">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <span className="truncate">{m.hazards.secondary}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
