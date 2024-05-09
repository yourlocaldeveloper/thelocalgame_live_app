import {
  PlayerType,
  HandStreetEnum,
  HandActionEnum,
} from '@components/GameContext';

export type ActionType = {
  seat: number;
  type: HandActionEnum;
  bet?: string;
};

export type HandPlayerType = {
  name: string;
  stack: string;
  seat: number;
  action: ActionType;
  committed: string;
};

export type SidePotType = {
  pot: string;
  players: HandPlayerType[];
};

export interface IHandData {
  activeOrder: HandPlayerType[];
  allInPlayerCount: Number;
  backUpPlayerInfo: PlayerType[];
  currentStreet: HandStreetEnum;
  effectiveAction: ActionType;
  pot: string;
  playerToAct: HandPlayerType;
}
