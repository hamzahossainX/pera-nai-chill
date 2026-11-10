import mitt from "mitt";
export type GameEvents = Record<string, unknown>;
export const gameBus = mitt<GameEvents>();
