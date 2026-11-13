import mitt, { Emitter } from "mitt";
import type { InputCommand } from "@/game/input/ControlSource";

export type GameEventTypes = {
  // UI -> Game
  "input:command": { command: InputCommand };
  "weapon:use": { weaponId: string; timestamp: number };
  "event:trigger": { eventId: string };
  "event:clear": void;
  "event:bribe": { eventId: string };
  "game:pause": { paused: boolean };
  "game:restart": void;
  "debug:spawnObstacle": void;
  "debug:spawnPickup": { type?: string };
  "debug:timeScale": { scale: number };
  "player:taunt": void;

  // Game -> UI
  "hit": {
    weaponId: string;
    damage: number;
    isCrit: boolean;
    position: { x: number; y: number };
  };
  "combat:hit": void;
  "combo": { count: number; multiplier: number };
  "villain:dead": { score: number };
  "villain:damaged": { hp: number; maxHp: number };
  "event:started": { eventId: string; duration: number };
  "event:ended": { eventId: string };
  "loader:progress": { progress: number; task: string };
  "villain:laneChange": { lane: number };
  "fps:update": { fps: number };
};

export const gameBus: Emitter<GameEventTypes> = mitt<GameEventTypes>();
