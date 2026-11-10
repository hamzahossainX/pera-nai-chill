import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { BALANCE } from "@/config/balance";
import { DEFAULT_VILLAIN } from "@/config/villains";
import { DEFAULT_CRIME } from "@/config/crimes";
import { DEFAULT_MAP } from "@/config/maps";
import { WorldEvent } from "@/services/eventService";
import { gameBus } from "@/game/bus";

export type GameScreen = "BOOT" | "LOBBY" | "PLAYING" | "PAUSED" | "GAME_OVER";

export interface LoadingProgress {
  fontsReady: boolean;
  engineReady: boolean;
  assetsProgress: number;
  audioReady: boolean;
  faceModelReady: boolean;
  overall: number;
}

export interface GameSettings {
  sound: boolean;
  haptics: boolean;
  quality: "high" | "low";
  lang: "en" | "bn";
  reducedMotion: boolean;
}

export interface GameState {
  // Screen state
  screen: GameScreen;
  loading: LoadingProgress;

  // Target customization
  targetFaceUrl: string | null;
  targetName: string;
  villainId: string;
  crimeId: string;
  currentMapId: "mirpur" | "farmgate" | "newmarket";

  // Combat status
  villainHp: number;
  villainMaxHp: number;
  rageScore: number;
  rage: number; // 0..100
  combo: number;
  taka: number;
  stamina: number; // 0..100
  activeCounterBuff: { name: string; expiry: number } | null;

  // Event runtime
  activeEvent: WorldEvent | null;
  eventTimeLeft: number;

  // User Settings
  settings: GameSettings;
  isDebugOpen: boolean;
  isDemoMode: boolean;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setLoading: (partial: Partial<LoadingProgress>) => void;
  setTargetFace: (url: string | null) => void;
  setTargetName: (name: string) => void;
  setVillainId: (id: string) => void;
  setCrimeId: (id: string) => void;
  setMapId: (id: "mirpur" | "farmgate" | "newmarket") => void;
  setCounterBuff: (name: string, durationSec: number) => void;
  clearCounterBuff: () => void;
  startGame: () => void;
  inflictDamage: (amount: number) => void;
  addRage: (amount: number) => void;
  resetRage: () => void;
  fillRage: () => void;
  killVillain: () => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  addTaka: (amount: number) => void;
  spendTaka: (amount: number) => boolean;
  setStamina: (val: number) => void;
  setEvent: (event: WorldEvent | null, duration?: number) => void;
  clearEvent: () => void;
  decrementEventTimer: (delta: number) => void;
  resetRun: () => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  setDebugOpen: (open: boolean) => void;
  toggleDebug: () => void;
  setDemoMode: (active: boolean) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    screen: "BOOT",
    loading: {
      fontsReady: false,
      engineReady: false,
      assetsProgress: 0,
      audioReady: false,
      faceModelReady: false,
      overall: 0,
    },

    targetFaceUrl: null,
    targetName: DEFAULT_VILLAIN.name.bn,
    villainId: DEFAULT_VILLAIN.id,
    crimeId: DEFAULT_CRIME.id,
    currentMapId: DEFAULT_MAP.id,

    villainHp: BALANCE.INITIAL_VILLAIN_HP,
    villainMaxHp: BALANCE.INITIAL_VILLAIN_HP,
    rageScore: 0,
    rage: 0,
    combo: 0,
    taka: BALANCE.INITIAL_TAKA,
    stamina: BALANCE.INITIAL_STAMINA,
    activeCounterBuff: null,

    activeEvent: null,
    eventTimeLeft: 0,

    settings: {
      sound: true,
      haptics: true,
      quality: "high",
      lang: "bn",
      reducedMotion: false,
    },

    isDebugOpen: false,
    isDemoMode: false,

    setScreen: (screen) => set({ screen }),

    setLoading: (partial) =>
      set((state) => {
        const next = { ...state.loading, ...partial };
        // Weighted overall calculation if overall is not explicitly passed
        if (partial.overall === undefined) {
          const weights = {
            fontsReady: 10,
            engineReady: 15,
            assetsProgress: 35,
            audioReady: 20,
            faceModelReady: 15,
            procedural: 5,
          };
          let calculated = 0;
          if (next.fontsReady) calculated += weights.fontsReady;
          if (next.engineReady) calculated += weights.engineReady;
          calculated += (next.assetsProgress / 100) * weights.assetsProgress;
          if (next.audioReady) calculated += weights.audioReady;
          if (next.faceModelReady) calculated += weights.faceModelReady;
          next.overall = Math.min(100, Math.max(state.loading.overall, Math.round(calculated)));
        }
        return { loading: next };
      }),

    setTargetFace: (url) => set({ targetFaceUrl: url }),
    setTargetName: (name) => set({ targetName: name }),
    setVillainId: (id) => set({ villainId: id }),
    setCrimeId: (id) => set({ crimeId: id }),
    setMapId: (id) => set({ currentMapId: id }),
    setCounterBuff: (name, durationSec) =>
      set({
        activeCounterBuff: {
          name,
          expiry: Date.now() + durationSec * 1000,
        },
      }),
    clearCounterBuff: () => set({ activeCounterBuff: null }),

    startGame: () =>
      set({
        screen: "PLAYING",
        villainHp: BALANCE.INITIAL_VILLAIN_HP,
        villainMaxHp: BALANCE.INITIAL_VILLAIN_HP,
        rage: 0,
        combo: 0,
        stamina: BALANCE.INITIAL_STAMINA,
        activeCounterBuff: null,
        activeEvent: null,
        eventTimeLeft: 0,
      }),

    inflictDamage: (amount) => {
      const current = get().villainHp;
      if (current === 0) return;
      const nextHp = Math.max(0, current - amount);
      const isDead = nextHp === 0;
      set({
        villainHp: nextHp,
        rageScore: get().rageScore + Math.round(amount * 5),
      });

      if (isDead) {
        gameBus.emit("villain:dead", { score: get().rageScore });
        setTimeout(() => {
          set({ screen: "GAME_OVER" });
        }, 1200);
      }
    },

    addRage: (amount) => {
      const current = get().rage;
      set({ rage: Math.min(BALANCE.MAX_RAGE, current + amount) });
    },

    resetRage: () => set({ rage: 0 }),
    fillRage: () => set({ rage: BALANCE.MAX_RAGE }),
    killVillain: () => {
      const hp = get().villainHp;
      if (hp > 0) {
        get().inflictDamage(hp);
      }
    },

    incrementCombo: () => {
      const next = get().combo + 1;
      set({ combo: next });
    },

    resetCombo: () => set({ combo: 0 }),

    addTaka: (amount) => set({ taka: get().taka + amount }),

    spendTaka: (amount) => {
      if (amount <= 0) return true;
      const current = get().taka;
      if (current >= amount) {
        set({ taka: current - amount });
        return true;
      }
      return false;
    },

    setStamina: (val) =>
      set({ stamina: Math.max(0, Math.min(BALANCE.INITIAL_STAMINA, val)) }),

    setEvent: (event, duration) =>
      set({
        activeEvent: event,
        eventTimeLeft: duration ?? (event ? event.durationSec : 0),
      }),

    clearEvent: () => set({ activeEvent: null, eventTimeLeft: 0 }),

    decrementEventTimer: (delta) => {
      const current = get().eventTimeLeft;
      const next = Math.max(0, current - delta);
      if (next === 0 && get().activeEvent) {
        set({ activeEvent: null, eventTimeLeft: 0 });
      } else {
        set({ eventTimeLeft: next });
      }
    },

    resetRun: () =>
      set({
        screen: "LOBBY",
        villainHp: BALANCE.INITIAL_VILLAIN_HP,
        rageScore: 0,
        rage: 0,
        combo: 0,
        taka: BALANCE.INITIAL_TAKA,
        stamina: BALANCE.INITIAL_STAMINA,
        activeCounterBuff: null,
        activeEvent: null,
        eventTimeLeft: 0,
      }),

    updateSettings: (partial) =>
      set((state) => ({ settings: { ...state.settings, ...partial } })),

    setDebugOpen: (open) => set({ isDebugOpen: open }),
    toggleDebug: () => set((state) => ({ isDebugOpen: !state.isDebugOpen })),
    setDemoMode: (active) => set({ isDemoMode: active }),
  }))
);
