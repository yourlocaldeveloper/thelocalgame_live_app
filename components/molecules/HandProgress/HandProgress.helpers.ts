import { StyleSheet } from 'react-native';
import { TexasHoldem } from 'poker-odds-calc';

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
    backgroundColor: '#0D1321',
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

export const uidToCardValue = [
  {
    card: 'Ah',
    uid: '04288E6A581390',
  },
  {
    card: '2h',
    uid: '046DF06A581390',
  },
  {
    card: '5h',
    uid: '0457C46A581390',
  },
  {
    card: '6h',
    uid: '044D016A581394',
  },
  {
    card: '7h',
    uid: '047A466A581390',
  },
  {
    card: '8h',
    uid: '0479B06A581390',
  },
  {
    card: '3h',
    uid: '045D226A581394',
  },
  {
    card: 'Th',
    uid: '0438AE6A581390',
  },
  {
    card: 'Jh',
    uid: '042CDF6A581390',
  },
  {
    card: 'Qh',
    uid: '048B1F6A581390',
  },
  {
    card: '4h',
    uid: '0458176A581394',
  },
  {
    card: 'Ad',
    uid: '044B456A581390',
  },
  {
    card: '2d',
    uid: '04701C6A581394',
  },
  {
    card: '3d',
    uid: '0449B56A581390',
  },
  {
    card: '4d',
    uid: '048F156A581390',
  },
  {
    card: '9h',
    uid: '046C896A581390',
  },
  {
    card: '6d',
    uid: '0456A56A581390',
  },
  {
    card: '7d',
    uid: '0434186A581394',
  },
  {
    card: '8d',
    uid: '047B3D6A581390',
  },
  {
    card: '9d',
    uid: '0476096A581394',
  },
  {
    card: 'Td',
    uid: '0435096A581394',
  },
  {
    card: 'Jd',
    uid: '048ACB6A581390',
  },
  {
    card: 'Kh',
    uid: '0428A96A581390',
  },
  {
    card: 'Kd',
    uid: '047B9B6A581390',
  },
  {
    card: 'As',
    uid: '045B486A581390',
  },
  {
    card: '2s',
    uid: '047E536A581390',
  },
  {
    card: '3s',
    uid: '0459A06A581390',
  },
  {
    card: '4s',
    uid: '046FF56A581390',
  },
  {
    card: '5s',
    uid: '04787F6A581390',
  },
  {
    card: '6s',
    uid: '04413C6A581390',
  },
  {
    card: '5d',
    uid: '0454FE6A581390',
  },
  {
    card: '8s',
    uid: '0431056A581394',
  },
  {
    card: '9s',
    uid: '04469D6A581390',
  },
  {
    card: 'Ts',
    uid: '042EB26A581390',
  },
  {
    card: 'Js',
    uid: '048B496A581394',
  },
  {
    card: 'Qs',
    uid: '04742A6A581390',
  },
  {
    card: 'Ks',
    uid: '0472386A581394',
  },
  {
    card: 'Ac',
    uid: '048BC96A581390',
  },
  {
    card: '2c',
    uid: '0446C86A581390',
  },
  {
    card: '3c',
    uid: '047F0B6A581394',
  },
  {
    card: '4c',
    uid: '0481BB6A581390',
  },
  {
    card: 'Qd',
    uid: '0471D96A581390',
  },
  {
    card: '6c',
    uid: '047F256A581394',
  },
  {
    card: '7c',
    uid: '043F756A581390',
  },
  {
    card: '8c',
    uid: '0478FC6A581390',
  },
  {
    card: '9c',
    uid: '0422016A581394',
  },
  {
    card: 'Tc',
    uid: '0418E76A581390',
  },
  {
    card: 'Jc',
    uid: '0450766A581390',
  },
  {
    card: 'Qc',
    uid: '045B7D6A581390',
  },
  {
    card: 'Kc',
    uid: '046E0A6A581394',
  },
  {
    card: '7s',
    uid: '0459786A581390',
  },
  {
    card: '5c',
    uid: '04800B6A581394',
  },
];

// Card Fetching Functions
export const getCardFromUID = (uid: string): string => {
  const value = uidToCardValue.find(card => card.uid === uid);

  if (value) {
    return value.card;
  } else {
    return 'error';
  }
};

export const getWinnerOfHand = (players: string[][], board: string[]) => {
  const Table = new TexasHoldem();

  players.forEach(cards => {
    Table.addPlayer([cards[0], cards[1]]);
  });

  Table.setBoard(board);

  const Result = Table.calculate();

  const winner = Result.getWinner();

  return Result;
};
