import { PlayerType } from '@components/GameContext';

export const checkActivePlayers = (players: PlayerType[]) => {
  const activePlayers = players.filter(player => player.active === true);
  return activePlayers.length > 1 ? true : false;
};
