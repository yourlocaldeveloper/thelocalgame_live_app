import { StyleSheet } from 'react-native';

import { PlayerType, HandStreetEnum } from '@components/GameContext';

export const styles = StyleSheet.create({
  handProgress: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  communityCardsWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: 10,
    width: 300,
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderColor: 'white',
  },
  actionIndicatorWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: 10,
    width: 300,
    borderWidth: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 0,
    borderColor: 'white',
    marginBottom: 15,
  },
  actionIndicatorText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
  },
  undoButtonWrapper: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  missdealButtonWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  potIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingLeft: 10,
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    marginTop: -200,
  },
  formWrapper: {
    width: '50%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPadWrapper: {
    width: '50%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerStackInput: {
    color: 'black',
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    fontSize: 18,
  },
  closeButtonWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  formRowWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonWrapper: {
    position: 'absolute',
    display: 'flex',
    alignSelf: 'center',
    bottom: 0,
  },
});

// Helper function to getPreFlopPlayerOrder, getPostFlopPlayerOrder
const getOrderedPlayerList = (players: PlayerType[], index: number) => {
  const maxPlayerIndex = players.length;

  if (maxPlayerIndex < index) {
    return players
      .slice(index - maxPlayerIndex)
      .concat(players.slice(0, index - maxPlayerIndex));
  } else {
    return players.slice(index).concat(players.slice(0, index));
  }
};

// Gets order of player for Preflop
export const getPreFlopPlayerOrder = (
  dealerPlayer: PlayerType,
  activePlayers: PlayerType[],
) => {
  const dealerPositionIndex = activePlayers.indexOf(dealerPlayer);

  return getOrderedPlayerList(activePlayers, dealerPositionIndex + 3);
};

// Gets order of player for Postflop
export const getPostFlopPlayerOrder = (
  dealerPlayer: PlayerType,
  activePlayers: PlayerType[],
) => {
  const dealerPositionIndex = activePlayers.indexOf(dealerPlayer);

  return getOrderedPlayerList(activePlayers, dealerPositionIndex + 1);
};

// Gets next player to act
export const getNextToAct = (
  currentPlayer: number,
  playersInHand: PlayerType[],
) => {
  if (playersInHand.length === currentPlayer + 1) {
    return playersInHand[0];
  } else {
    return playersInHand[currentPlayer + 1];
  }
};

// Adjusts players stack
export const getStackChange = (player: PlayerType, bet: string): PlayerType => {
  const newStack = player.stack ? removeChips(player.stack, bet) : 'error';

  const newPlayerInfo: PlayerType = { ...player, stack: newStack };

  return newPlayerInfo;
};

// Award winning player pot
export const getWinningPlayerStack = (
  player: PlayerType,
  pot: string,
): PlayerType => {
  const newStack = player.stack ? addChips(player.stack, pot) : 'error';

  const newPlayerInfo: PlayerType = { ...player, stack: newStack };

  return newPlayerInfo;
};

export const removeChips = (
  firstValue: string,
  secondValue: string,
): string => {
  return String((Number(firstValue) - Number(secondValue)).toFixed(2));
};

export const addChips = (firstValue: string, secondValue: string): string => {
  return String((Number(firstValue) + Number(secondValue)).toFixed(2));
};

// Get next street
export const getNextStreet = (street: HandStreetEnum) => {
  switch (street) {
    case HandStreetEnum.PREFLOP:
      return HandStreetEnum.FLOP;
    case HandStreetEnum.FLOP:
      return HandStreetEnum.TURN;
    case HandStreetEnum.TURN:
      return HandStreetEnum.RIVER;
    default:
      return HandStreetEnum.PREFLOP;
  }
};
