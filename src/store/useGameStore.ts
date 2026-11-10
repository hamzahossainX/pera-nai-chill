import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { BALANCE } from "@/config/balance";
import { DEFAULT_VILLAIN } from "@/config/villains";
import { WorldEvent } from "@/services/eventService";

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

  // Combat status
  villainHp: number;
  villainMaxHp: number;
  rageScore: number;
  rage: number; // 0..100
  combo: number;
  taka: number;
  stamina: number; // 0..100

  // Event runtime
  activeEvent: WorldEvent | null;
  eventTimeLeft: number;

  // User Settings
  settings: GameSettings;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setLoading: (partial: Partial<LoadingProgress>) => void;
  setTargetFace: (url: string | null) => void;
  setTargetName: (name: string) => void;
  setVillainId: (id: string) => void;
  startGame: () => void;
  inflictDamage: (amount: number) => void;
  addRage: (amount: number) => void;
  resetRage: () => void;
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

    villainHp: BALANCE.INITIAL_VILLAIN_HP,
    villainMaxHp: BALANCE.INITIAL_VILLAIN_HP,
    rageScore: 0,
    rage: 0,
    combo: 0,
    taka: BALANCE.INITIAL_TAKA,
    stamina: BALANCE.INITIAL_STAMINA,

    activeEvent: null,
    eventTimeLeft: 0,

    settings: {
      sound: true,
      haptics: true,
      quality: "high",
      lang: "bn",
      reducedMotion: false,
    },

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

    startGame: () =>
      set({
        screen: "PLAYING",
        villainHp: BALANCE.INITIAL_VILLAIN_HP,
        villainMaxHp: BALANCE.INITIAL_VILLAIN_HP,
        rage: 0,
        combo: 0,
        stamina: BALANCE.INITIAL_STAMINA,
        activeEvent: null,
        eventTimeLeft: 0,
      }),

    inflictDamage: (amount) => {
      const current = get().villainHp;
      const nextHp = Math.max(0, current - amount);
      const isDead = nextHp === 0;
      set({
        villainHp: nextHp,
        rageScore: get().rageScore + Math.round(amount * 5),
        screen: isDead ? "GAME_OVER" : get().screen,
      });
    },

    addRage: (amount) => {
      const current = get().rage;
      set({ rage: Math.min(BALANCE.MAX_RAGE, current + amount) });
    },

    resetRage: () => set({ rage: 0 }),

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
        activeEvent: null,
        eventTimeLeft: 0,
      }),

    updateSettings: (partial) =>
      set((state) => ({ settings: { ...state.settings, ...partial } })),
  }))
);
