import mitt, { Emitter } from "mitt";

export type GameEventTypes = {
  // UI -> Game
  "weapon:use": { weaponId: string; timestamp: number };
  "event:trigger": { eventId: string };
  "event:bribe": { eventId: string };
  "game:pause": { paused: boolean };
  "game:restart": void;

  // Game -> UI
  "hit": {
    weaponId: string;
    damage: number;
    isCrit: boolean;
    position: { x: number; y: number };
  };
  "combo": { count: number; multiplier: number };
  "villain:dead": { score: number };
  "villain:damaged": { hp: number; maxHp: number };
  "event:started": { eventId: string; duration: number };
  "event:ended": { eventId: string };
  "loader:progress": { progress: number; task: string };
  "villain:laneChange": { lane: number };
};

export const gameBus: Emitter<GameEventTypes> = mitt<GameEventTypes>();
