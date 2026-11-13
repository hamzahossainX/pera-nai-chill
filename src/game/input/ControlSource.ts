/**
 * ControlSource abstraction per GAME_PLAN_V2 §2.1, ARCHITECTURE_PATTERNS A11,
 * and MULTIPLAYER_V3 §8 forward-compat constraint #1.
 *
 * Player input is produced by a ControlSource (KeyboardTouchSource, BotSource,
 * later RemoteSource) that emits typed input commands. Gameplay NEVER reads
 * keyboard/touch directly.
 */

export type InputCommandType =
  | "LANE_UP"
  | "LANE_DOWN"
  | "JUMP"
  | "DASH"
  | "ATTACK"
  | "ULTIMATE"
  | "TAUNT";

export interface InputCommand {
  type: InputCommandType;
  weaponId?: string;
  timestamp?: number;
}

export type CommandListener = (command: InputCommand) => void;

export interface ControlSource {
  /**
   * Register a listener for incoming input commands.
   * Returns an unbind function.
   */
  onCommand(listener: CommandListener): () => void;

  /**
   * Release listeners, timers, and references.
   */
  destroy(): void;
}
