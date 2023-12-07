import { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import {
  GameContext,
  GameStateEnum,
  HandActionEnum,
  HandStreetEnum,
  PlayerType,
  defaultHandInfo,
} from '@components/GameContext';
import { Modal } from '@components/atoms/Modal';
import { SocketContext } from '@components/SocketContext';

import { NumberPad } from '../NumberPad';
import {
  styles,
  getPreFlopPlayerOrder,
  getPostFlopPlayerOrder,
  getNextToAct,
  getNextStreet,
  getStackChange,
  getWinningPlayerStack,
  addChips,
  getCardFromUID,
  getWinnerOfHand,
} from './HandProgress.helpers';

interface PlayerAction {
  player?: PlayerType;
  action: HandActionEnum;
  bet: string;
}

interface IPlayerHand {
  hand: string[];
  seat: number;
  hasCards: boolean;
}

export const HandProgress: FC = () => {
  const gameContext = useContext(GameContext);
  const socketContext = useContext(SocketContext);

  const socket = socketContext?.socket;

  const [showBetModal, setShowBetModal] = useState(false);
  const [bet, setBet] = useState('');

  const [playerToAct, setPlayerToAct] = useState<PlayerType | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PlayerType[] | null>(null);
  const [currentStreet, setCurrentStreet] = useState<HandStreetEnum>(
    HandStreetEnum.PREFLOP,
  );

  // Indicated action path + main action (usually agressive or non)
  const [mainAction, setMainAction] = useState<PlayerAction | null>(null);

  // Player info store + backup for stack adjustments
  const [playersInHand, setPlayersInHand] = useState<PlayerType[] | undefined>(
    [],
  );
  const [backUpPlayerInfo, setBackUpPlayerInfo] = useState<
    PlayerType[] | undefined
  >([]);

  // No showFoldButton useState because if player has action they can always fold
  const [showCheckButton, setShowCheckButton] = useState(true);
  const [showBetButton, setShowBetButton] = useState(true);
  const [showCallButton, setShowCallButton] = useState(true);

  const [playerHandStore, setPlayerHandStore] = useState<IPlayerHand[]>([]);
  const [communityCardStore, setCommunityCardStore] = useState<string[]>([]);

  const clearStore = () => {
    setPlayerHandStore([]);
    setCommunityCardStore([]);
  };

  const handleSetBet = (
    event: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    const newBet = event.nativeEvent.text;
    setBet(newBet);
  };

  const closeModal = () => {
    setBet('');
    setShowBetModal(false);
  };

  const handleBetClick = () => {
    setShowBetModal(true);
  };

  const handleBetSubmit = () => {
    handleAction(playerToAct, HandActionEnum.BET, bet);
    closeModal();
  };

  const handleEnableRFID = async () => {
    const disableRFID = await fetch('http://10.0.2.2:8080/rfid/continue', {
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

  const handleDisableRFID = async () => {
    const disableRFID = await fetch('http://10.0.2.2:8080/rfid/stop', {
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
  };

  const handleEndHand = () => {
    gameContext?.setHandInfo({ ...defaultHandInfo });
    gameContext?.setGameState(GameStateEnum.SETUP);
    setCurrentStreet(HandStreetEnum.PREFLOP);
    setCurrentOrder(null);
    setPlayerToAct(null);
    setMainAction(null);
    setPlayersInHand([]);
    handleDisableRFID();
  };

  const handleMissdeal = () => {
    if (backUpPlayerInfo) {
      console.log(`[ERROR]: MISSDEAL - BACKUP USED`);
      gameContext?.setPlayers(backUpPlayerInfo);
    }

    handleEndHand();
  };

  // TO-DO: Show winner and alocate pot to them, update everything and have modal to confirm winner.
  const handleHandWon = (winningPlayer: PlayerType) => {
    console.log('[INFO] Player Won:', winningPlayer.name);
    const handContext = gameContext?.handInfo;

    if (handContext?.players && currentOrder) {
      const playerInCurrentOrder = currentOrder.find(
        player => player.seat === winningPlayer.seat,
      );

      const playerArray = handContext?.players;

      if (playerInCurrentOrder) {
        const playerAdjustedStack = getWinningPlayerStack(
          playerInCurrentOrder,
          handContext.pot || '',
        );

        const handWonPlayerArray = playerArray.map(
          player =>
            [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
            player,
        );

        if (gameContext?.setPlayers) {
          gameContext.setPlayers(handWonPlayerArray);
        }
      }
    }

    handleEndHand();
  };

  const handleClosingAction = (order?: PlayerType[]) => {
    if (currentOrder) {
      const handInfo = gameContext?.handInfo;
      const playerWithButton = handInfo?.players[handInfo.dealerPosition];
      const originalPlayerOrder = handInfo?.players;

      if (currentStreet === HandStreetEnum.RIVER) {
        // Check if reached river, then award winning player pot
        // TO:DO add proper hand won logic. Placeholder is to just give last player pot

        const relevantPlayers = playerHandStore.filter(player =>
          currentOrder.find(ply => ply.seat === player.seat),
        );

        const hands = relevantPlayers.map(player => [
          player.hand[0],
          player.hand[1],
        ]);

        const returnedVal = getWinnerOfHand(hands, communityCardStore);
        const winner = returnedVal.getWinner();
        console.log(winner.player.getHand());
        handleMissdeal();
        return;
      }

      if (playerWithButton && originalPlayerOrder) {
        // Run if order not provided
        if (!order) {
          let orderWithActivePlayers;
          if (currentStreet === HandStreetEnum.PREFLOP) {
            const postFlopOrder = getPostFlopPlayerOrder(
              playerWithButton,
              originalPlayerOrder,
            );
            orderWithActivePlayers = postFlopOrder.filter(player =>
              currentOrder.find(ply => ply.seat === player.seat),
            );
          } else {
            orderWithActivePlayers = currentOrder;
          }
          setMainAction({
            bet: '',
            action: HandActionEnum.NON,
            player: orderWithActivePlayers[orderWithActivePlayers.length - 1],
          });
          setPlayerToAct(orderWithActivePlayers[0]);
          setCurrentOrder(orderWithActivePlayers);
        } else {
          let orderWithActivePlayers;

          if (currentStreet === HandStreetEnum.PREFLOP) {
            const postFlopOrder = getPostFlopPlayerOrder(
              playerWithButton,
              originalPlayerOrder,
            );
            orderWithActivePlayers = postFlopOrder.filter(player =>
              order.find(ply => ply.seat === player.seat),
            );
          } else {
            orderWithActivePlayers = order;
          }
          setMainAction({
            bet: '',
            action: HandActionEnum.NON,
            player: orderWithActivePlayers[orderWithActivePlayers.length - 1],
          });
          setPlayerToAct(orderWithActivePlayers[0]);
          setCurrentOrder(orderWithActivePlayers);
        }
      }
    }
  };

  const handleAssignNextPlayer = (order?: PlayerType[]) => {
    if (currentOrder && playerToAct) {
      const activePlayerIndex = currentOrder.indexOf(playerToAct);
      const nextPlayer = getNextToAct(activePlayerIndex, currentOrder);

      if (mainAction?.player && nextPlayer.seat === mainAction?.player.seat) {
        if (mainAction.action !== HandActionEnum.NON) {
          console.log(
            '[CLOSING ACTION]: Next player has no action, new street.',
          );

          handleClosingAction(order);
          const newStreet = getNextStreet(currentStreet);
          setCurrentStreet(newStreet);
          return;
        }
      }

      console.log(`[INFO]: New Player To Act ${nextPlayer.name}`);

      if (order) {
        setCurrentOrder(order);
      }
      setPlayerToAct(nextPlayer);
    }
  };

  const handleFold = (
    actionPlayer: PlayerType | null,
    isClosingAction?: boolean,
  ) => {
    console.log(`[PLAYER ACTION]: ${actionPlayer?.name} FOLDS`);
    if (actionPlayer && currentOrder) {
      let newPlayerOrder: PlayerType[] = [];
      const activePlayerIndex = currentOrder.indexOf(actionPlayer);
      newPlayerOrder = currentOrder.filter(
        (player, index) => index !== activePlayerIndex,
      );

      if (newPlayerOrder.length === 1) {
        // Check if last player
        handleHandWon(newPlayerOrder[0]);
        return;
      }

      if (isClosingAction) {
        handleClosingAction(newPlayerOrder);
        const newStreet = getNextStreet(currentStreet);
        setCurrentStreet(newStreet);
      } else {
        handleAssignNextPlayer([...newPlayerOrder]);
      }
    }
  };

  const handleCallOrBet = (
    actionPlayer: PlayerType,
    playerBet: string,
    isBet?: boolean,
    isClosingAction?: boolean,
  ) => {
    console.log(
      `[PLAYER ACTION]: ${actionPlayer?.name} HAS PUT IN ${playerBet}`,
    );
    const playerSeat = actionPlayer.seat;

    if (currentOrder) {
      const playerInCurrentOrder = currentOrder.find(
        player => player.seat === playerSeat,
      );

      if (playerInCurrentOrder) {
        const playerAdjustedStack = getStackChange(
          playerInCurrentOrder,
          playerBet || '',
        );

        const newCurrentOrder = currentOrder.map(
          player =>
            [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
            player,
        );

        if (isBet) {
          const newAction: PlayerAction = {
            player: actionPlayer,
            action: HandActionEnum.BET,
            bet: playerBet || '',
          };

          setMainAction(newAction);
        }

        const handInfo = gameContext?.handInfo;
        const setHandInfo = gameContext?.setHandInfo;

        const newPlayersArray = handInfo?.players.map(
          player =>
            [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
            player,
        );

        if (handInfo && playerBet && setHandInfo && newPlayersArray) {
          const newPot = addChips(handInfo.pot, playerBet);

          setHandInfo({
            ...handInfo,
            players: newPlayersArray,
            pot: newPot,
          });
        }

        if (isClosingAction) {
          handleClosingAction(newCurrentOrder);
          const newStreet = getNextStreet(currentStreet);
          setCurrentStreet(newStreet);
        } else {
          setCurrentOrder(newCurrentOrder);
          handleAssignNextPlayer();
        }
      }
    }
  };

  const handleAction = (
    actionPlayer: PlayerType | null,
    action: HandActionEnum,
    playerBet?: string,
  ) => {
    if (actionPlayer) {
      // Check if player has closing action
      if (actionPlayer === mainAction?.player && currentOrder) {
        if (action === HandActionEnum.FOLD) {
          handleFold(actionPlayer, true);
          return;
        } else if (action === HandActionEnum.CHECK) {
          handleClosingAction();
          const newStreet = getNextStreet(currentStreet);
          setCurrentStreet(newStreet);

          return;
        } else if (
          action === HandActionEnum.CALL ||
          action === HandActionEnum.BET
        ) {
          handleCallOrBet(
            actionPlayer,
            playerBet || '',
            action === HandActionEnum.BET,
            true,
          );
        }
      }

      if (action === HandActionEnum.CHECK) {
        handleAssignNextPlayer();
        return;
      }

      if (action === HandActionEnum.FOLD) {
        handleFold(actionPlayer);
        return;
      }

      if (action === HandActionEnum.CALL || action === HandActionEnum.BET) {
        handleCallOrBet(
          actionPlayer,
          playerBet || '',
          action === HandActionEnum.BET,
        );
        return;
      }
    }
  };

  // Initial hand set up.
  useEffect(() => {
    const handInfo = gameContext?.handInfo;
    const bigBlind = gameContext?.gameSettings.bigBlind;
    const smallBlind = gameContext?.gameSettings.smallBlind;

    // Setup backups and stack adjustment arrays
    if (gameContext?.players) {
      const players = [...gameContext.players];
      const handPlayers = [...gameContext.players];
      setBackUpPlayerInfo([...players]);
      setPlayersInHand([...handPlayers]);
    }

    if (handInfo && smallBlind && bigBlind) {
      console.log('HAND PLAYERS:', handInfo.players);
      const playerWithButton = handInfo.players[handInfo.dealerPosition];

      const preFlopOrder = getPreFlopPlayerOrder(
        playerWithButton,
        handInfo.players,
      );

      // ========= Adjust Players Stack for Blinds ========== //
      const bigBlindPlayer = preFlopOrder[preFlopOrder.length - 1];
      const smallBlindPlayer = preFlopOrder[preFlopOrder.length - 2];

      const newBBPlayer = getStackChange(bigBlindPlayer, bigBlind);
      const newSBPlayer = getStackChange(smallBlindPlayer, smallBlind);

      preFlopOrder[preFlopOrder.length - 1] = newBBPlayer;
      preFlopOrder[preFlopOrder.length - 2] = newSBPlayer;

      const defaultAction: PlayerAction = {
        player: preFlopOrder[preFlopOrder.length - 1],
        action: HandActionEnum.NON,
        bet: bigBlind || '',
      };
      // ========= END ========== //

      const blinds = [newBBPlayer, newSBPlayer];

      const playersAdjustedWithBlinds = handInfo?.players.map(
        player => blinds.find(ply => ply.seat === player.seat) || player,
      );

      const setHandInfo = gameContext.setHandInfo;

      setHandInfo({ ...handInfo, players: playersAdjustedWithBlinds });

      console.log('Initial Pre Flop Order', preFlopOrder);
      setMainAction(defaultAction);
      setCurrentOrder(preFlopOrder);
      setPlayerToAct(preFlopOrder[0]);
    }
  }, []);

  // Use Effect listing to mainAction change to understand options available for active player.
  useEffect(() => {
    if (
      mainAction?.player === playerToAct &&
      currentStreet === HandStreetEnum.PREFLOP
    ) {
      setShowCheckButton(true);
      setShowCallButton(false);
      setShowBetButton(true);
    } else if (
      mainAction?.action === HandActionEnum.NON &&
      currentStreet === HandStreetEnum.PREFLOP
    ) {
      setShowCheckButton(false);
      setShowCallButton(true);
      setShowBetButton(true);
    } else if (mainAction?.action === HandActionEnum.NON) {
      setShowCheckButton(true);
      setShowCallButton(false);
      setShowBetButton(true);
    } else if (mainAction?.action === HandActionEnum.BET) {
      setShowCheckButton(false);
      setShowCallButton(true);
      setShowBetButton(true);
    } else if (mainAction?.action === HandActionEnum.CHECK) {
      setShowCheckButton(true);
      setShowCallButton(false);
      setShowBetButton(true);
    } else {
      console.log('EXCEPTION ON HAND BUTTONS');
      setShowCheckButton(true);
      setShowCallButton(true);
      setShowBetButton(true);
    }
  }, [playerToAct, currentStreet]);

  const handleCommunityCardStore = useCallback(
    (uid: string, socketRef: string) => {
      const getLimit = () => {
        switch (currentStreet) {
          case HandStreetEnum.PREFLOP:
            return 0;
          case HandStreetEnum.FLOP:
            return 3;
          case HandStreetEnum.TURN:
            return 4;
          case HandStreetEnum.RIVER:
            return 5;
          default:
            return 0;
        }
      };

      const limit = getLimit();

      const selectedCard = getCardFromUID(uid);

      const communityStore = [...communityCardStore];
      const doesCardExist = communityStore.find(card => card === selectedCard);

      if (communityCardStore.length !== limit) {
        if (!!doesCardExist) {
          console.log(
            '[CARD STORE] Community Card Already Exists:',
            selectedCard,
          );

          return;
        }
        const card = getCardFromUID(uid);

        setCommunityCardStore(currentCommunityCardStore => [
          ...currentCommunityCardStore,
          card,
        ]);

        console.log('[CARD STORE] Adding Community Card:', card);
      } else {
        console.log('[CARD STORE] Community Card Limit Reached');
        socket?.off(socketRef);
        if (limit !== 0) {
          console.log('COMMUNITY CARD DISABLE');
          handleDisableRFID();
        }
      }
    },
    [communityCardStore, currentStreet],
  );

  useEffect(() => {
    handleEnableRFID();
  }, [currentStreet]);

  const handlePlayerHandStore = useCallback(
    (uid: string, seat: number, socketRef: string) => {
      const handStore = [...playerHandStore];
      const player = handStore.find(player => player.seat === seat);
      const card = getCardFromUID(uid);
      let playerHand: IPlayerHand;

      if (player) {
        const playerHandIndex = handStore.findIndex(
          player => player.seat === seat,
        );
        if (player.hand.length === 2) {
          socket?.off(socketRef);

          const playersActiveInHand = currentOrder?.length;

          const allHandsWithTwoCards = handStore.filter(
            player => player.hand.length === 2,
          );

          if (
            allHandsWithTwoCards?.length === playersActiveInHand &&
            currentStreet === HandStreetEnum.PREFLOP
          ) {
            console.log('HAND STORE CARD DISABLE');
            handleDisableRFID();
          }

          return;
        } else {
          if (player?.hand.includes(card)) {
            console.log('[CARD STORE] Card Already Registered');
            return;
          }

          const newPlayerHand = [...player.hand, card];

          playerHand = {
            hand: newPlayerHand,
            seat: player.seat,
            hasCards: player.hasCards,
          };
        }

        const newPlayerHandStore = [...handStore];
        newPlayerHandStore[playerHandIndex] = playerHand;

        setPlayerHandStore(newPlayerHandStore);

        return;
      } else {
        const playerHand = {
          hand: [card],
          seat: seat,
          hasCards: false,
        };

        setPlayerHandStore(currentPlayerHandStore => [
          ...currentPlayerHandStore,
          playerHand,
        ]);
      }
    },
    [playerHandStore, currentOrder, currentStreet, handleDisableRFID],
  );

  useEffect(() => {
    socket?.on('seatOne', rfid =>
      handlePlayerHandStore(rfid.uid, 1, 'seatOne'),
    );
    socket?.on('seatTwo', rfid =>
      handlePlayerHandStore(rfid.uid, 2, 'seatTwo'),
    );
    socket?.on('seatThree', rfid =>
      handlePlayerHandStore(rfid.uid, 3, 'seatThree'),
    );
    socket?.on('seatFour', rfid =>
      handlePlayerHandStore(rfid.uid, 4, 'seatFour'),
    );

    return () => {
      socket?.off('seatOne');
      socket?.off('seatTwo');
      socket?.off('seatThree');
      socket?.off('seatFour');
    };
  }, [socket, playerHandStore, currentStreet]);

  useEffect(() => {
    socket?.on('communityCards', rfid =>
      handleCommunityCardStore(rfid.uid, 'communityCards'),
    );

    return () => {
      socket?.off('communityCards');
    };
  }, [currentStreet, communityCardStore]);

  useEffect(() => {
    console.log('[PLAYER HAND STORE]: STORE -', playerHandStore);
  }, [playerHandStore]);

  useEffect(() => {
    console.log(communityCardStore);
  }, [communityCardStore]);

  return (
    <>
      <View style={styles.handProgress}>
        <View style={styles.potIndicator}>
          <Text style={styles.actionIndicatorText}>
            Pot: {gameContext?.gameSettings.currency}
            {gameContext?.handInfo.pot}
          </Text>
        </View>
        <View style={styles.communityCardsWrapper}>
          <Text style={styles.actionIndicatorText}>Ac Ad Ah As Jc</Text>
        </View>
        <View style={styles.actionIndicatorWrapper}>
          <Text style={styles.actionIndicatorText}>
            {playerToAct?.name
              ? `${playerToAct.name} - ${gameContext?.gameSettings.currency}${playerToAct.stack}`
              : 'Loading'}
          </Text>
        </View>
        <View style={styles.row}>
          <AppButton
            color={ButtonColorEnum.WHITE}
            width={150}
            text={'FOLD'}
            onPress={() => handleAction(playerToAct, HandActionEnum.FOLD)}
          />
          {showCheckButton && (
            <AppButton
              color={ButtonColorEnum.WHITE}
              width={150}
              text={'CHECK'}
              onPress={() =>
                handleAction(playerToAct, HandActionEnum.CHECK, mainAction?.bet)
              }
            />
          )}
          {showCallButton && (
            <AppButton
              color={ButtonColorEnum.WHITE}
              width={150}
              text={'CALL'}
              onPress={() =>
                handleAction(playerToAct, HandActionEnum.CALL, mainAction?.bet)
              }
            />
          )}
          {showBetButton && (
            <AppButton
              color={ButtonColorEnum.WHITE}
              width={150}
              text={'BET/RAISE'}
              onPress={handleBetClick}
            />
          )}
        </View>
        <View style={styles.undoButtonWrapper}>
          <AppButton
            color={ButtonColorEnum.RED}
            width={150}
            text={'UNDO ACTION'}
          />
        </View>
        <View style={styles.missdealButtonWrapper}>
          <AppButton
            color={ButtonColorEnum.RED}
            text={'MISSDEAL'}
            width={150}
            onPress={handleMissdeal}
          />
        </View>
      </View>
      {showBetModal && (
        <Modal>
          <View style={styles.contentWrapper}>
            <View style={styles.formWrapper}>
              <View style={styles.formRowWrapper}>
                <TextInput
                  style={styles.playerStackInput}
                  onChange={handleSetBet}
                  keyboardType={'number-pad'}
                  editable={false}>
                  {bet}
                </TextInput>
              </View>
              <View style={styles.submitButtonWrapper}>
                <AppButton
                  color={ButtonColorEnum.RED}
                  text={'Submit'}
                  width={300}
                  height={75}
                  onPress={handleBetSubmit}
                />
              </View>
            </View>
            <View style={styles.numberPadWrapper}>
              <NumberPad stack={bet} setStack={setBet} />
            </View>
          </View>
          <View style={styles.closeButtonWrapper}>
            <AppButton
              color={ButtonColorEnum.RED}
              text={'X'}
              width={50}
              height={50}
              onPress={closeModal}
            />
          </View>
        </Modal>
      )}
    </>
  );
};
