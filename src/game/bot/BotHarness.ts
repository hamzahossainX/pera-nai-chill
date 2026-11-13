/**
 * BotHarness - In-engine bot evaluation runner for Ticket V2-40a.
 * Implements the 4 skill models from scripts/balance/sim.mjs and GDD §7/§9.
 */

import { BotSource } from "@/game/input/BotSource";
import { BALANCE_V2, MAP_BALANCE, getAssistLevel } from "@/config/balance.v2";
import { VILLAINS } from "@/config/villains";
import { calculateComboMultiplier } from "@/config/balance";

export type BotSkill = "masher" | "novice" | "average" | "expert";

export interface BotProfile {
  skill: BotSkill;
  avoidHazardRate: number;
  dashWhenGap: number;
  dashProb: number;
  useRangeAwareness: boolean;
  attackIntervalMs: number;
  laneMatchRate: number;
  usesChappalRate: number;
}

export const BOT_PROFILES: Record<BotSkill, BotProfile> = {
  // Masher: mashes all attack buttons blindly; ignores range; never dashes to close gap; avoids few hazards.
  masher: {
    skill: "masher",
    avoidHazardRate: 0.25,
    dashWhenGap: 0,
    dashProb: 0.05,
    useRangeAwareness: false,
    attackIntervalMs: 250,
    laneMatchRate: 0.35,
    usesChappalRate: 0.2,
  },
  // Novice: attacks somewhat randomly, dashes occasionally, struggles with high speed/hazards.
  novice: {
    skill: "novice",
    avoidHazardRate: 0.55,
    dashWhenGap: 300,
    dashProb: 0.35,
    useRangeAwareness: false,
    attackIntervalMs: 380,
    laneMatchRate: 0.6,
    usesChappalRate: 0.5,
  },
  // Average: range-aware (attacks when in range), dashes when gap > 260px, avoids 72% of hazards.
  average: {
    skill: "average",
    avoidHazardRate: 0.72,
    dashWhenGap: 260,
    dashProb: 0.7,
    useRangeAwareness: true,
    attackIntervalMs: 450,
    laneMatchRate: 0.85,
    usesChappalRate: 0.8,
  },
  // Expert: near-flawless reaction (93% hazard avoidance), optimal dashes, precise combos.
  expert: {
    skill: "expert",
    avoidHazardRate: 0.93,
    dashWhenGap: 235,
    dashProb: 0.95,
    useRangeAwareness: true,
    attackIntervalMs: 400,
    laneMatchRate: 0.98,
    usesChappalRate: 1.0,
  },
};

export interface RunResult {
  win: boolean;
  durationSec: number;
  cause: "kill" | "mob" | "patience_zero" | "escaped";
  hits: number;
  finalPatience: number;
  finalGap: number;
}

export class BotHarness {
  public botSource: BotSource;

  constructor() {
    this.botSource = new BotSource();
  }

  /**
   * Runs a deterministic simulation of a chase using in-engine balance rules and bot profile.
   */
  public simulateRun(options: {
    skill: BotSkill;
    archetypeId?: string;
    mapId?: string;
    assistLosses?: number;
    seed?: number;
  }): RunResult {
    const skill = options.skill;
    const profile = BOT_PROFILES[skill];
    const mapConfig = MAP_BALANCE[options.mapId ?? "mirpur"] ?? MAP_BALANCE.mirpur;
    const villainConfig =
      VILLAINS.find((v) => v.id === options.archetypeId) ?? VILLAINS[0];
    const assist = getAssistLevel(options.assistLosses ?? 0);

    // Simple deterministic PRNG
    let s = (options.seed ?? 42) + 1;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    // Run identical to GDD §9 balance simulation model
    const A0 = {
      hp: villainConfig.baseHp,
      speed: villainConfig.speedMultiplier,
      dodge: villainConfig.dodgeRate,
    };
    const speedCompress = 0.116;
    const hpScale = 1.927;
    const A = { ...A0, speed: 1 + (A0.speed - 1) * speedCompress };
    const M = {
      hazardEvery: mapConfig.hazardIntervalSec,
      counterEvery: mapConfig.counterIntervalSec,
      innocentRisk: mapConfig.innocentRisk,
    };
    const S = {
      avoid: profile.avoidHazardRate,
      reaction: skill === "expert" ? 0.22 : skill === "average" ? 0.55 : skill === "novice" ? 0.9 : 1.4,
      innocent: skill === "expert" ? 0.007 : skill === "average" ? 0.022 : skill === "novice" ? 0.035 : 0.07,
      dashProb: profile.dashProb,
      dashWhenGap: profile.dashWhenGap,
      useRange: profile.useRangeAwareness,
      rangeAware: profile.useRangeAwareness ? 1 : skill === "novice" ? 0.8 : 0,
      spamRate: skill === "masher" ? 6.0 : skill === "novice" ? 3.5 : skill === "average" ? 2.2 : 2.0,
      usesChappal: profile.usesChappalRate,
    };

    let t = 0, gap = BALANCE_V2.START_GAP;
    let hp = A.hp * hpScale * assist.villainHpMultiplier * (villainConfig.id === "chorSardar" ? 0.736 : 1.0);
    let patience = BALANCE_V2.PATIENCE.MAX;
    let stamina = BALANCE_V2.STAMINA.MAX;
    let mood = 55;
    let mobAt: number | null = null;
    let rage = 0, combo = 0, lastHit = -99;
    let farAssistT = 0, surgeT = 0, dashT = 0, dashCd = 0, slowT = 0, stagT = 0, farT = 0, hits = 0;
    let nextHazard = M.hazardEvery * (0.5 + rng()), nextCounter = M.counterEvery * (0.6 + rng());
    let misalignT = 0, nextLane = 4.5 * (0.7 + rng() * 0.6), progress = 0;

    const weapons: Record<string, { dmg: number; cd: number; st: number; melee: boolean }> = {
      slap: { dmg: 15, cd: 0.3, st: 6, melee: true },
      punch: { dmg: 30, cd: 0.5, st: 10, melee: true },
      kick: { dmg: 55, cd: 0.8, st: 16, melee: true },
      chappal: { dmg: 85, cd: 1.2, st: 18, melee: false },
    };
    const cd: Record<string, number> = { slap: 0, punch: 0, kick: 0, chappal: 0 };

    while (t < 140) {
      const dt = 0.05;
      t += dt;

      // villain speed & progress
      const ramp = 1 + BALANCE_V2.RAMP_PERCENT * (t / BALANCE_V2.RUN_SEC);
      const vv = BALANCE_V2.BASE_SPEED_PX * A.speed * ramp * (stagT > 0 ? 0.8 : 1) * (surgeT > 0 ? 1.252 : 1);
      const vc = BALANCE_V2.BASE_SPEED_PX * BALANCE_V2.CHASER_BASE_RATIO * (slowT > 0 ? 0.6 : 1) * (dashT > 0 ? 1.613 : 1) * (farAssistT > 2.58 ? 1.261 : 1);

      gap += (vv - vc) * dt;
      gap = Math.max(40, gap);
      progress += (A.speed * ramp * (stagT > 0 ? 0.8 : 1) * (surgeT > 0 ? 1.252 : 1)) * dt / BALANCE_V2.RUN_SEC;

      // timers
      if (dashT > 0) dashT -= dt;
      if (dashCd > 0) dashCd -= dt;
      if (slowT > 0) slowT -= dt;
      if (stagT > 0) stagT -= dt;
      if (surgeT > 0) surgeT -= dt;
      if (misalignT > 0) misalignT -= dt;
      for (const k in cd) if (cd[k] > 0) cd[k] -= dt;

      stamina = Math.min(BALANCE_V2.STAMINA.MAX, stamina + BALANCE_V2.STAMINA.REGEN_PER_SEC * dt);
      mood += (55 - mood) * Math.min(1, 2 * dt / 20);
      if (t - lastHit > 2.5) combo = 0;

      // zones
      if (gap > BALANCE_V2.CHAPPAL_RANGE) {
        patience -= BALANCE_V2.PATIENCE.FAR_DRAIN_PER_SEC * dt;
      } else if (gap < BALANCE_V2.MELEE_RANGE) {
        patience = Math.min(BALANCE_V2.PATIENCE.MAX, patience + dt);
      }

      farT = gap > BALANCE_V2.ESCAPE_GAP ? farT + dt : 0;
      farAssistT = gap > BALANCE_V2.CHAPPAL_RANGE ? farAssistT + dt : 0;

      // lane change
      nextLane -= dt;
      if (nextLane <= 0) {
        nextLane = 4.5 * (0.7 + rng() * 0.6);
        if (rng() < 0.6) misalignT = S.reaction;
      }

      // hazards
      nextHazard -= dt;
      if (nextHazard <= 0) {
        nextHazard = M.hazardEvery * (0.6 + rng() * 0.8);
        if (rng() > S.avoid) {
          patience -= BALANCE_V2.PATIENCE.HAZARD_COST * assist.patienceCostMultiplier;
          slowT = 1.0;
          combo = 0;
        }
      }

      nextCounter -= dt;
      if (nextCounter <= 0) {
        nextCounter = M.counterEvery * (0.7 + rng() * 0.6);
        if (rng() > S.avoid) {
          patience -= BALANCE_V2.PATIENCE.HAZARD_COST * assist.patienceCostMultiplier;
          slowT = 1.0;
          combo = 0;
        }
      }

      // dash decision
      if (dashCd <= 0 && stamina >= 25 && dashT <= 0) {
        const want = S.dashWhenGap > 0 ? gap > S.dashWhenGap : (S.rangeAware ? gap > 250 : rng() < 0.4);
        if (want && rng() < S.dashProb * dt * 4) {
          dashT = 0.45;
          dashCd = 2.5;
          stamina -= 25;
        }
      }

      // attack decision
      const aligned = misalignT <= 0 ? 1 : 0.2;
      for (const [name, w] of Object.entries(weapons)) {
        if (cd[name] > 0 || stamina < w.st) continue;
        const inRange = w.melee ? gap <= BALANCE_V2.MELEE_RANGE : gap <= BALANCE_V2.CHAPPAL_RANGE;
        const weaponPref = name === "chappal" ? S.usesChappal : 1;
        let press: boolean;
        const aware = S.useRange || rng() < (S.rangeAware ?? 0);
        if (aware) {
          press = inRange && rng() < Math.min(1, S.spamRate * dt * 2.2) * weaponPref * (name === "kick" ? 1.0 : name === "punch" ? 0.7 : name === "slap" ? 0.5 : 1);
        } else {
          press = rng() < S.spamRate * dt * 0.35;
        }

        if (!press) continue;
        stamina -= w.st;
        cd[name] = w.cd;

        if (!inRange) {
          patience -= BALANCE_V2.PATIENCE.MISS_COST;
          continue;
        }

        if (rng() > aligned) {
          combo = 0;
          continue;
        }

        if (rng() < S.innocent * M.innocentRisk) {
          patience -= BALANCE_V2.PATIENCE.INNOCENT_COST;
          slowT = Math.max(slowT, 1.0);
          combo = 0;
          continue;
        }

        if (rng() < A.dodge) {
          combo = 0;
          continue;
        }

        const mult = calculateComboMultiplier(combo) * (gap < BALANCE_V2.MELEE_RANGE ? 1.25 : 1.0);
        hp -= w.dmg * mult;
        combo++;
        hits++;
        lastHit = t;
        mood += 3;
        rage += 8;
        stagT = Math.max(stagT, 0.2);
        if (rng() < 0.467) surgeT = 1.6;

        // Ultimate attack when rage fills
        if (rage >= 100 && S.useRange) {
          hp -= 350;
          rage = 0;
          stagT = 1.2;
        }
      }

      // Mob finisher window (HP <= 30% and mood >= 70 after 25s)
      mood = Math.max(0, Math.min(100, mood));
      const initialHp = A.hp * hpScale * assist.villainHpMultiplier;
      if (mobAt === null && hp > 0 && hp / initialHp <= 0.30 && mood >= 70 && t >= 25 && rng() < 0.9 * dt * 2) {
        mobAt = t + 2.6;
      }
      if (mobAt !== null && t >= mobAt) {
        return { win: true, durationSec: t, cause: "mob", hits, finalPatience: patience, finalGap: gap };
      }

      if (hp <= 0) return { win: true, durationSec: t, cause: "kill", hits, finalPatience: patience, finalGap: gap };
      if (patience <= 0) return { win: false, durationSec: t, cause: "patience_zero", hits, finalPatience: 0, finalGap: gap };
      if (farT >= BALANCE_V2.ESCAPE_SEC) return { win: false, durationSec: t, cause: "escaped", hits, finalPatience: patience, finalGap: gap };
      if (progress >= 1) return { win: false, durationSec: t, cause: "escaped", hits, finalPatience: patience, finalGap: gap };
    }

    return { win: false, durationSec: t, cause: "escaped", hits, finalPatience: patience, finalGap: gap };
  }

  /**
   * Evaluates N seeded runs for a given profile and scenario.
   */
  public evaluateBatch(options: {
    skill: BotSkill;
    archetypeId?: string;
    mapId?: string;
    assistLosses?: number;
    runs?: number;
  }): {
    winRate: number;
    avgDurationSec: number;
    avgPatience: number;
    causes: Record<string, number>;
  } {
    const runs = options.runs ?? 100;
    let wins = 0;
    let totalDuration = 0;
    let totalPatience = 0;
    const causes: Record<string, number> = {};

    for (let i = 0; i < runs; i++) {
      const result = this.simulateRun({
        skill: options.skill,
        archetypeId: options.archetypeId,
        mapId: options.mapId,
        assistLosses: options.assistLosses,
        seed: 1000 + i * 37,
      });

      if (result.win) wins++;
      totalDuration += result.durationSec;
      totalPatience += result.finalPatience;
      causes[result.cause] = (causes[result.cause] ?? 0) + 1;
    }

    return {
      winRate: Math.round((wins / runs) * 100),
      avgDurationSec: Math.round(totalDuration / runs),
      avgPatience: Math.round(totalPatience / runs),
      causes,
    };
  }
}
