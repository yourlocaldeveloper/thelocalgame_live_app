import { createContext, Dispatch, SetStateAction } from 'react';

export enum CardValue {
  Ace = 'A',
  King = 'K',
  Queen = 'Q',
  Ten = 'T',
  Nine = '9',
  Eight = '8',
  Seven = '7',
  Six = '6',
  Five = '5',
  Four = '4',
  Three = '3',
  Two = '2',
}

export enum CardSuit {
  CLUB = 'c',
  DIAMOND = 'd',
  HEART = 'h',
  SPADE = 's',
}

export type Card = {
  value: CardValue;
  suit: CardSuit;
};

export type PlayerType = {
  name: string;
  stack?: string;
  active: boolean;
  cards?: Card[];
};

export enum PokerVariantEnum {
  TEXAS = "Texas Hold'em",
}

export type GameSettingsType = {
  tableName: string;
  bigBlind: string;
  smallBlind: string;
  smallestChip: string;
  ante?: string;
  currency?: string;
  dealerPosition: number;
  gameVariant: PokerVariantEnum;
};

export enum GameStateEnum {
  OFF,
  SETUP,
  PROGRESS,
}

type GameContextType = {
  players: PlayerType[];
  setPlayers: Dispatch<SetStateAction<PlayerType[]>>;
  gameState: GameStateEnum;
  setGameState: Dispatch<SetStateAction<GameStateEnum>>;
  gameSettings: GameSettingsType;
  setGameSettings: Dispatch<SetStateAction<GameSettingsType>>;
};

export const defaultGameSettings: GameSettingsType = {
  tableName: 'The Local Game - Live',
  bigBlind: '1',
  smallBlind: '0.5',
  smallestChip: '0.1',
  dealerPosition: 0,
  currency: '£',
  gameVariant: PokerVariantEnum.TEXAS,
};

export const defaultPlayers: PlayerType[] = [
  {
    name: 'Seat 1',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 2',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 3',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 4',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 5',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 6',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 7',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 8',
    stack: '0.00',
    active: false,
  },
  {
    name: 'Seat 9',
    stack: '0.00',
    active: false,
  },
];

export const GameContext = createContext<GameContextType | null>(null);
