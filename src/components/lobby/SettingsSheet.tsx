"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { useI18n } from "@/i18n";
import { Volume2, VolumeX, Vibrate, Sparkles, Languages, Trash2, X } from "lucide-react";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  const { settings, updateSettings, setTargetFace } = useGameStore();
  const { t } = useI18n();

  if (!isOpen) return null;

  const handleClearData = () => {
    if (confirm(settings.lang === "bn" ? "লোকাল ডাটা মুছবেন?" : "Clear local saved face and cached game records?")) {
      try {
        localStorage.clear();
      } catch {}
      setTargetFace(null);
      updateSettings({
        sound: true,
        haptics: true,
        quality: "high",
        lang: "bn",
        reducedMotion: false,
      });
      alert(settings.lang === "bn" ? "লোকাল ডাটা মুছে ফেলা হয়েছে!" : "Local data cleared!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border-4 border-black bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-comic text-xl text-yellow-300">{t("settings")}</h3>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.sound ? (
                <Volume2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <VolumeX className="h-5 w-5 text-slate-500" />
              )}
              <span className="text-sm font-semibold text-slate-200">{t("sound")}</span>
            </div>
            <button
              onClick={() => updateSettings({ sound: !settings.sound })}
              aria-label={t("sound")}
              aria-pressed={settings.sound}
              className={`h-6 w-12 rounded-full border-2 border-black transition-colors ${
                settings.sound ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.sound ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-semibold text-slate-200">
                {t("haptics")}
              </span>
            </div>
            <button
              onClick={() => updateSettings({ haptics: !settings.haptics })}
              aria-label={t("haptics")}
              aria-pressed={settings.haptics}
              className={`h-6 w-12 rounded-full border-2 border-black transition-colors ${
                settings.haptics ? "bg-yellow-400" : "bg-slate-700"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.haptics ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Quality Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-semibold text-slate-200">{t("graphicsQuality")}</span>
            </div>
            <button
              onClick={() =>
                updateSettings({
                  quality: settings.quality === "high" ? "low" : "high",
                })
              }
              className="rounded-lg border border-black bg-slate-800 px-3 py-1 font-mono text-xs font-bold uppercase text-teal-300"
            >
              {settings.quality}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Languages className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200">{t("language")}</span>
            </div>
            <button
              onClick={() =>
                updateSettings({
                  lang: settings.lang === "bn" ? "en" : "bn",
                })
              }
              aria-label={t("language")}
              className="rounded-lg border border-black bg-slate-800 px-3 py-1 font-mono text-xs font-bold text-indigo-300"
            >
              {settings.lang === "bn" ? t("bangla") : t("english")}
            </button>
          </div>

          {/* Clear Data Button */}
          <button
            onClick={handleClearData}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" /> {t("clearLocalData")}
          </button>
        </div>
      </div>
    </div>
  );
}
