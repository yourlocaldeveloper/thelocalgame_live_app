import { createContext, Dispatch, SetStateAction } from 'react';

export type PlayerType = {
  name: string;
  stack?: string;
  active: boolean;
};

type PlayerContextType = {
  players: PlayerType[];
  setPlayers: Dispatch<SetStateAction<PlayerType[]>>;
};

export const defaultPlayerContext: PlayerType[] = [
  {
    name: 'Seat 1',
    active: false,
  },
  {
    name: 'Seat 2',
    active: false,
  },
  {
    name: 'Seat 3',
    active: false,
  },
  {
    name: 'Seat 4',
    active: false,
  },
  {
    name: 'Seat 5',
    active: false,
  },
  {
    name: 'Seat 6',
    active: false,
  },
  {
    name: 'Seat 7',
    active: false,
  },
  {
    name: 'Seat 8',
    active: false,
  },
  {
    name: 'Seat 9',
    active: false,
  },
];

export const PlayerContext = createContext<PlayerContextType | null>(null);
