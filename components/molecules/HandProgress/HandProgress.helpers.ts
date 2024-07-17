import { TexasHoldem } from 'poker-odds-calc';

import {
  PlayerType,
  HandStreetEnum,
  HandActionEnum,
  GameContextType,
} from '@components/GameContext';

import { ActionType, IHandData } from './HandProgress.types';

import { uidToCardValue } from '@utils/CardValues';

import { HandPlayerType } from './HandProgress.types';
import { IPlayerHand } from '@components/Main';

// Helper function to getPreFlopPlayerOrder, getPostFlopPlayerOrder
const getOrderedPlayerList = (players: PlayerType[], index: number) => {
  const newPlayerArray: HandPlayerType[] = players.map(player => {
    return {
      name: player.name,
      stack: player.stack || '',
      seat: player.seat,
      action: { seat: player.seat, type: HandActionEnum.NON },
      committed: '0.00',
    };
  });

  const maxPlayerIndex = newPlayerArray.length;

  if (maxPlayerIndex < index) {
    return newPlayerArray
      .slice(index - maxPlayerIndex)
      .concat(newPlayerArray.slice(0, index - maxPlayerIndex));
  } else {
    return newPlayerArray.slice(index).concat(newPlayerArray.slice(0, index));
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
  playersInHand: HandPlayerType[],
) => {
  if (playersInHand.length === currentPlayer + 1) {
    return playersInHand[0];
  } else {
    return playersInHand[currentPlayer + 1];
  }
};

// Adjusts players stack
export const getStackChange = (
  player: HandPlayerType,
  bet: string,
): HandPlayerType => {
  const newStack = player.stack ? removeChips(player.stack, bet) : 'error';

  const newPlayerInfo: HandPlayerType = { ...player, stack: newStack };

  return newPlayerInfo;
};

// Award winning player pot
export const getWinningPlayerStack = (
  player: HandPlayerType,
  pot: string,
): HandPlayerType => {
  const newStack = player.stack ? addChips(player.stack, pot) : 'error';

  console.log('[[[DEBUG]]] newStack:', newStack);

  const newPlayerInfo: HandPlayerType = { ...player, stack: newStack };

  return newPlayerInfo;
};

export const removeChips = (
  firstValue: string,
  secondValue: string,
): string => {
  return String((Number(firstValue) - Number(secondValue)).toFixed(2));
};

export const addChips = (firstValue: string, secondValue: string): string => {
  console.log('[[[DEBUG]]] firstValue:', Number(firstValue));
  console.log('[[[DEBUG]]] secondValue:', Number(secondValue));
  console.log('[[[DEBUG]]] Result:', Number(firstValue) - Number(secondValue));
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

// Card Fetching Functions
export const getCardFromUID = (uid: string): string => {
  const value = uidToCardValue.find(card => card.uid === uid);

  if (value) {
    return value.card;
  } else {
    return 'error';
  }
};

// Get Chop Pot Amount
export const getChopPotAmount = (
  playerAmount: number,
  pot: string,
  smallBlind: string,
): { chopAmount: string; remainderChips?: string } => {
  const potInSmallBlindUnits = Math.round(Number(pot) / Number(smallBlind));

  const isEvenChop = potInSmallBlindUnits % playerAmount ? false : true;

  if (isEvenChop) {
    return { chopAmount: String((Number(pot) / playerAmount).toFixed(2)) };
  }

  const pureChopAmountInSmallBlinds = Math.floor(
    potInSmallBlindUnits / playerAmount,
  );

  const pureChopValue = pureChopAmountInSmallBlinds * Number(smallBlind);

  let remainder = Number(pot) - pureChopValue * playerAmount;

  console.log('[INFO] chopAmount:', String(pureChopValue.toFixed(2)));
  console.log('[INFO] chopAmount:', String(remainder));

  return {
    chopAmount: String(pureChopValue.toFixed(2)),
    remainderChips: String(remainder),
  };
};

export const getWinnerOfHand = (
  players: string[][],
  board: string[],
  activeOrder: HandPlayerType[],
  playerHandStore: IPlayerHand[],
): { winningPlayers: HandPlayerType[]; isChop: boolean } => {
  const Table = new TexasHoldem();

  players.forEach(cards => {
    Table.addPlayer([cards[0], cards[1]]);
  });

  Table.setBoard(board);

  const Result = Table.calculate();

  const allPlayers = Result.getPlayers();

  const playersWhoChop = allPlayers.filter(player => player.getTies() > 0);

  if (playersWhoChop.length > 0) {
    console.log('[INFO]: Pot has been identified as a CHOP POT');

    let playersWhoChopHands: HandPlayerType[] = [];

    playersWhoChop.forEach(chopPlayer => {
      const chopPlayerHand = playerHandStore.find(player => {
        const playerHand = player.hand.join('');
        console.log(`[INFO] Players Chopping Hand: ${playerHand}`);
        return playerHand === chopPlayer.getHand();
      });

      const chopPlayerData = activeOrder.find(
        player => player.seat === chopPlayerHand?.seat,
      );

      if (chopPlayerData) {
        playersWhoChopHands = [chopPlayerData, ...playersWhoChopHands];
      }
    });

    return { winningPlayers: playersWhoChopHands, isChop: true };
  }

  const winner = Result.getWinner();
  const winningHand = winner.player.getHand();

  const winningPlayer = playerHandStore.find(player => {
    const playerHand = player.hand.join('');
    console.log(`[INFO] Players Winning Hand: ${playerHand}`);
    return playerHand === winningHand;
  });

  const winningPlayerData = activeOrder.find(
    player => player.seat === winningPlayer?.seat,
  );

  if (winningPlayerData) {
    return { winningPlayers: [winningPlayerData], isChop: false };
  } else {
    console.log('[ERROR]: Winning Player Data was not found.');
    return { winningPlayers: [], isChop: false };
  }
};

export const getHandSetup = (gameContext: GameContextType) => {
  const handInfo = gameContext.handInfo;
  const bigBlind = gameContext.gameSettings.bigBlind;
  const smallBlind = gameContext.gameSettings.smallBlind;

  const initialBackup = [...gameContext.players];

  const playerWithButton = handInfo.players[handInfo.dealerPosition];
  const preFlopOrder = getPreFlopPlayerOrder(
    playerWithButton,
    handInfo.players,
  );

  // ========= Adjust Players Stack for Blinds ========== //
  const bigBlindPlayer = preFlopOrder[preFlopOrder.length - 1];
  const smallBlindPlayer = preFlopOrder[preFlopOrder.length - 2];
  const initialPot = String((Number(bigBlind) + Number(smallBlind)).toFixed(2));

  const bbPlayer = getStackChange(bigBlindPlayer, bigBlind);
  const sbPlayer = getStackChange(smallBlindPlayer, smallBlind);

  bbPlayer.action.bet = bigBlind;
  sbPlayer.action.bet = smallBlind;

  bbPlayer.committed = bigBlind;
  sbPlayer.committed = smallBlind;

  preFlopOrder[preFlopOrder.length - 1] = bbPlayer;
  preFlopOrder[preFlopOrder.length - 2] = sbPlayer;

  const defaultAction: ActionType = {
    seat: preFlopOrder[preFlopOrder.length - 1].seat,
    type: HandActionEnum.NON,
    bet: bigBlind || '',
  };

  const initialHandData: IHandData = {
    activeOrder: preFlopOrder,
    allInPlayerCount: 0,
    backUpPlayerInfo: initialBackup,
    currentStreet: HandStreetEnum.PREFLOP,
    effectiveAction: defaultAction,
    pot: initialPot,
    playerToAct: preFlopOrder[0],
  };

  // ========= Get Order For Livestream App ========== //
  const postFlopOrder = getPostFlopPlayerOrder(
    playerWithButton,
    handInfo.players,
  );

  return { preFlopOrder, postFlopOrder, initialBackup, initialHandData };
};

export const handleEnableRFID = async () => {
  const disableRFID = await fetch('http://192.168.0.17:8080/rfid/continue', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
    .then(response => response.json())
    .then(json => {
      return json;
    })
    .catch(error => {
      console.error(error);
    });

  console.log('[RFID]: ENABLED', disableRFID);
};

export const handleDisableRFID = (delay?: number) => {
  setTimeout(async () => {
    const disableRFID = await fetch('http://192.168.0.17:8080/rfid/stop', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then(response => response.json())
      .then(json => {
        return json;
      })
      .catch(error => {
        console.error(error);
      });

    console.log('[RFID]: DISABLED', disableRFID);
  }, delay || 1);
};
