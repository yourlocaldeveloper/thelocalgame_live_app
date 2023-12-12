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
import { IPlayerHand } from '@components/Main';

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
  handleDisableRFID,
  handleEnableRFID,
  IHandData,
  ActionType,
  HandPlayerType,
} from './HandProgress.helpers';

type HandProgressProps = {
  playerHandStore: IPlayerHand[];
  setPlayerHandStore: React.Dispatch<React.SetStateAction<IPlayerHand[]>>;
};

export const HandProgress: FC<HandProgressProps> = ({
  playerHandStore,
  setPlayerHandStore,
}) => {
  const gameContext = useContext(GameContext);
  const socketContext = useContext(SocketContext);

  const socket = socketContext?.socket;

  const [showBetModal, setShowBetModal] = useState(false);
  const [bet, setBet] = useState('');

  // No showFoldButton useState because if player has action they can always fold
  const [showCheckButton, setShowCheckButton] = useState(true);
  const [showBetButton, setShowBetButton] = useState(true);
  const [showCallButton, setShowCallButton] = useState(true);

  const [handData, setHandData] = useState<IHandData | null>(null);

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

  // BIG FUCKING NOTE
  // TO RESOLVE ALL PLAYERS AND ACTIVE ORDER STACK SYNC
  // Never adjust players stack until change of street

  const handleHandWon = (winningPlayer: HandPlayerType) => {
    console.log('[INFO] Player Won:', winningPlayer.name);
    if (handData) {
      const { activeOrder, pot } = handData;
      const setPlayers = gameContext?.setPlayers;
      const corePlayers = gameContext?.players;

      const playerInCurrentOrder = activeOrder.find(
        player => player.seat === winningPlayer.seat,
      );

      if (playerInCurrentOrder && corePlayers) {
        const playerAdjustedStack = getWinningPlayerStack(
          playerInCurrentOrder,
          pot,
        );

        const adjustedAllPlayers = activeOrder.map(
          player =>
            [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
            player,
        );

        const newAllPlayers = corePlayers.map(corePlayer => {
          const playerFound = adjustedAllPlayers.find(
            player => player.seat === corePlayer.seat,
          );

          if (playerFound) {
            corePlayer.stack = playerFound.stack;
          }

          return corePlayer;
        });

        if (setPlayers) {
          setPlayers(newAllPlayers);
        }
      }
    }

    handleEndHand();
  };

  // Function: handleFindWinner
  const handleFindWinner = () => {
    if (handData) {
      const { activeOrder } = handData;

      const playersLeft = playerHandStore.filter(player =>
        activeOrder.find(ply => ply.seat === player.seat),
      );

      const hands = playersLeft.map(player => [player.hand[0], player.hand[1]]);

      const hand = getWinnerOfHand(hands, communityCardStore);
      const winner = hand.getWinner();
      const winningHand = winner.player.getHand();

      if (winningHand) {
        console.log('[INFO] Winning Hand:', winningHand);
        console.log('[INFO] playersLeft:', playersLeft);

        const winningPlayer = playersLeft.find(player => {
          const playerHand = player.hand.join('');
          console.log(`[INFO] Players Winning Hand: ${playerHand}`);
          return playerHand === winningHand;
        });

        const winningPlayerData = activeOrder.find(
          player => player.seat === winningPlayer?.seat,
        );

        console.log(
          '[INFO] Winning Player in Current Order:',
          winningPlayerData,
        );

        if (winningPlayerData) {
          console.log('[HAND WON]: Winner Identified');
          handleHandWon(winningPlayerData);
        } else {
          console.log('[ERROR]: Could not figure winningPlayerInfo. Missdeal.');
          handleMissdeal();
        }
      } else {
        console.log('[ERROR]: Could not figure out winner. Missdeal.');
        handleMissdeal();
      }
    }
  };

  const handleEndHand = () => {
    gameContext?.setHandInfo({ ...defaultHandInfo });
    gameContext?.setGameState(GameStateEnum.SETUP);
    setHandData(null);
    clearStore();
    handleDisableRFID();
  };

  const handleMissdeal = () => {
    if (handData) {
      const { backUpPlayerInfo } = handData;

      console.log(`[ERROR]: MISSDEAL - BACKUP USED`);
      gameContext?.setPlayers(backUpPlayerInfo);
    }

    handleEndHand();
  };

  const [communityCardStore, setCommunityCardStore] = useState<string[]>([]);

  const handleClosingAction = (handDataOverwrite?: IHandData) => {
    if (handData && gameContext) {
      const handInfo = gameContext.handInfo;
      const playerWithButton = handInfo.players[handInfo.dealerPosition];
      const originalPlayerOrder = handInfo.players;
      const { currentStreet, activeOrder } = handDataOverwrite
        ? handDataOverwrite
        : handData;

      if (currentStreet === HandStreetEnum.RIVER) {
        // Check if reached river, then award winning player pot
        // TO:DO add proper hand won logic. Placeholder is to just give last player pot

        handleFindWinner();
        return;
      }

      // Run if order not provided
      let orderWithActivePlayers: HandPlayerType[];
      if (currentStreet === HandStreetEnum.PREFLOP) {
        const postFlopOrder = getPostFlopPlayerOrder(
          playerWithButton,
          originalPlayerOrder,
        );
        orderWithActivePlayers = postFlopOrder.filter(player =>
          activeOrder.find(ply => ply.seat === player.seat),
        );

        if (orderWithActivePlayers) {
          orderWithActivePlayers = orderWithActivePlayers.map(player => {
            const playerFound = activeOrder.find(
              ply => ply.seat === player.seat,
            );

            let resetPlayerAction = HandActionEnum.NON;

            if (
              playerFound?.action.type === HandActionEnum.FOLD ||
              playerFound?.action.type === HandActionEnum.ALLIN
            ) {
              resetPlayerAction = playerFound?.action.type;
            }

            const newPlayerAction: ActionType = {
              seat: playerFound ? playerFound?.seat : 0,
              type: resetPlayerAction,
              bet: '0.00',
            };

            if (playerFound) {
              player.stack = playerFound.stack;
              player.action = newPlayerAction;
            }
            return player;
          });
        }
      } else {
        orderWithActivePlayers = activeOrder;
      }

      const newStreet = getNextStreet(currentStreet);
      const startingPlayer = orderWithActivePlayers.find(
        player => player.action.type !== HandActionEnum.FOLD,
      );

      const reverseArray = [...orderWithActivePlayers];

      const endingPlayer = reverseArray
        .reverse()
        .find(player => player.action.type !== HandActionEnum.FOLD);

      const newMainAction: ActionType = endingPlayer
        ? { seat: endingPlayer.seat, type: HandActionEnum.NON }
        : {
            seat: orderWithActivePlayers[orderWithActivePlayers.length - 1]
              .seat,
            type: HandActionEnum.NON,
          };

      handDataOverwrite
        ? setHandData({
            ...handDataOverwrite,
            effectiveAction: newMainAction,
            activeOrder: orderWithActivePlayers,
            currentStreet: newStreet,
            playerToAct: startingPlayer || orderWithActivePlayers[0],
          })
        : setHandData({
            ...handData,
            effectiveAction: newMainAction,
            activeOrder: orderWithActivePlayers,
            currentStreet: newStreet,
            playerToAct: startingPlayer || orderWithActivePlayers[0],
          });
    }
  };

  // FUNCTION: Handling assigning the next player //
  const handleAssignNextPlayer = (handDataOverride?: IHandData) => {
    if (handData) {
      const { activeOrder, playerToAct, effectiveAction } = handDataOverride
        ? handDataOverride
        : handData;

      const targetedPlayer = activeOrder.find(
        player => player.seat === playerToAct.seat,
      );

      const activePlayerIndex = activeOrder.indexOf(
        targetedPlayer || playerToAct,
      );

      let nextPlayer = getNextToAct(activePlayerIndex, activeOrder);

      const nextPlayerStack = Number(nextPlayer.stack);

      const { seat: actionSeat, type: actionType } = effectiveAction;

      if (actionType && actionSeat === nextPlayer.seat) {
        if (actionType !== HandActionEnum.NON || nextPlayerStack === 0) {
          console.log(
            '[CLOSING ACTION]: Next player has no action, new street.',
          );

          handDataOverride
            ? handleClosingAction(handDataOverride)
            : handleClosingAction(handData);
          return;
        }
      }

      if (nextPlayerStack === 0) {
        console.log(
          '[HANDLE NEXT PLAYER]: Play has no stack, skipping to next play.',
        );
        const skippedPlayerIndex = activeOrder.indexOf(nextPlayer);
        nextPlayer = getNextToAct(skippedPlayerIndex, activeOrder);
      }

      const updatedHandData = handDataOverride
        ? { ...handDataOverride, playerToAct: nextPlayer }
        : { ...handData, playerToAct: nextPlayer };

      if (nextPlayer.action.type === HandActionEnum.FOLD) {
        handleAssignNextPlayer(updatedHandData);
      } else {
        setHandData(updatedHandData);
      }
    } else {
      console.log('[ERROR]: Hand Data does not exist');
    }
  };

  // FUNCTION: Handling Folding //
  const handleFold = (
    actionPlayer: HandPlayerType,
    isClosingAction?: boolean,
  ) => {
    if (handData) {
      const { activeOrder, currentStreet } = handData;

      const foldingPlayerIndex = activeOrder.indexOf(actionPlayer);

      const newActiveOrder = activeOrder.map((player, index) => {
        if (index === foldingPlayerIndex) {
          player.action = {
            seat: player.seat,
            type: HandActionEnum.FOLD,
          };
        }
        return player;
      });

      const filteredPlayerOrder = newActiveOrder.filter(
        player => player.action.type !== HandActionEnum.FOLD,
      );

      if (filteredPlayerOrder.length === 1) {
        handleHandWon(filteredPlayerOrder[0]);
        return;
      }

      if (!isClosingAction) {
        handleAssignNextPlayer({ ...handData, activeOrder: newActiveOrder });
      } else {
        const nextStreet = getNextStreet(currentStreet);
        setHandData({
          ...handData,
          activeOrder: newActiveOrder,
          currentStreet: nextStreet,
        });
      }
    } else {
      console.log('[ERROR]: Hand Data does not exist');
    }
  };

  const handleCallOrBet = (
    actionPlayer: HandPlayerType,
    playerBet: string,
    isBet?: boolean,
    isClosingAction?: boolean,
  ) => {
    if (handData) {
      console.log(
        `[PLAYER ACTION]: ${actionPlayer?.name} HAS PUT IN ${playerBet}`,
      );
      const playerSeat = actionPlayer.seat;

      const { activeOrder, pot } = handData;

      const playerInCurrentOrder = activeOrder.find(
        player => player.seat === playerSeat,
      );

      if (playerInCurrentOrder) {
        console.log('[ACTION]: Is Call/Bet --- Adjust stack');
        let adjustedPlayerBet = playerBet;
        if (actionPlayer.action.bet) {
          adjustedPlayerBet = String(
            (Number(playerBet) - Number(actionPlayer.action.bet)).toFixed(2),
          );
        }

        let playerAdjustedStack = getStackChange(
          playerInCurrentOrder,
          adjustedPlayerBet || '',
        );

        let playerAction = isBet ? HandActionEnum.BET : HandActionEnum.CALL;

        if (Number(playerAdjustedStack.stack) === 0) {
          playerAction = HandActionEnum.ALLIN;
        }

        const newAction: ActionType = {
          seat: actionPlayer.seat,
          type: playerAction,
          bet: playerBet || '',
        };

        playerAdjustedStack.action = newAction;

        const newCurrentOrder = activeOrder.map(
          player =>
            [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
            player,
        );

        const newPot = addChips(pot, adjustedPlayerBet);

        if (isClosingAction) {
          handleClosingAction({
            ...handData,
            activeOrder: newCurrentOrder,
            pot: newPot,
            effectiveAction: isBet ? newAction : handData.effectiveAction,
          });
        } else {
          handleAssignNextPlayer({
            ...handData,
            activeOrder: newCurrentOrder,
            pot: newPot,
            effectiveAction: isBet ? newAction : handData.effectiveAction,
          });
        }
      }
    }
  };

  const handleAction = (
    actionPlayer: HandPlayerType,
    action: HandActionEnum,
    playerBet?: string,
  ) => {
    if (handData && actionPlayer) {
      const { effectiveAction } = handData;

      if (actionPlayer.seat === effectiveAction.seat) {
        if (action === HandActionEnum.FOLD) {
          handleFold(actionPlayer, true);
          return;
        } else if (action === HandActionEnum.CHECK) {
          handleClosingAction();

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

  const handleBetSubmit = () => {
    if (handData) {
      const { playerToAct } = handData;
      handleAction(playerToAct, HandActionEnum.BET, bet);
      closeModal();
    }
  };

  // Initial hand set up.
  useEffect(() => {
    if (gameContext) {
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
      const initialPot = String(
        (Number(bigBlind) + Number(smallBlind)).toFixed(2),
      );

      const bbPlayer = getStackChange(bigBlindPlayer, bigBlind);
      const sbPlayer = getStackChange(smallBlindPlayer, smallBlind);

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

      console.log('[HAND SETUP] Initial Hand Data:', initialHandData);
      setHandData(initialHandData);
    }
  }, []);

  // Use Effect listing to mainAction change to understand options available for active player.
  useEffect(() => {
    if (handData) {
      const { effectiveAction, playerToAct, currentStreet } = handData;
      if (
        effectiveAction.seat === playerToAct.seat &&
        currentStreet === HandStreetEnum.PREFLOP
      ) {
        setShowCheckButton(true);
        setShowCallButton(false);
        setShowBetButton(true);
      } else if (
        effectiveAction.type === HandActionEnum.NON &&
        currentStreet === HandStreetEnum.PREFLOP
      ) {
        setShowCheckButton(false);
        setShowCallButton(true);
        setShowBetButton(true);
      } else if (effectiveAction.type === HandActionEnum.NON) {
        setShowCheckButton(true);
        setShowCallButton(false);
        setShowBetButton(true);
      } else if (
        effectiveAction.type === HandActionEnum.BET ||
        HandActionEnum.ALLIN
      ) {
        setShowCheckButton(false);
        setShowCallButton(true);
        setShowBetButton(true);
      } else if (effectiveAction.type === HandActionEnum.CHECK) {
        setShowCheckButton(true);
        setShowCallButton(false);
        setShowBetButton(true);
      } else {
        console.log('[ERROR]: Invalid Street, showing all buttons');
        setShowCheckButton(true);
        setShowCallButton(true);
        setShowBetButton(true);
      }
    }
  }, [handData?.currentStreet, handData?.playerToAct]);

  useEffect(() => {
    console.log(
      '[INFO] Change in effective action:',
      handData?.effectiveAction,
    );
  }, [handData?.effectiveAction]);

  const handlePlayerHandStore = useCallback(
    (uid: string, seat: number, socketRef: string) => {
      if (handData) {
        const { activeOrder, currentStreet } = handData;
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

            const playersActiveInHand = activeOrder.length;

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
      }
    },
    [
      playerHandStore,
      handData?.activeOrder,
      handData?.currentStreet,
      handleDisableRFID,
    ],
  );

  const handleCommunityCardStore = useCallback(
    (uid: string, socketRef: string) => {
      if (handData) {
        const { currentStreet } = handData;

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
            case HandStreetEnum.ALLIN:
              return 5;
            default:
              return 0;
          }
        };

        const limit = getLimit();

        const selectedCard = getCardFromUID(uid);

        const communityStore = [...communityCardStore];
        const doesCardExist = communityStore.find(
          card => card === selectedCard,
        );

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
            console.log('[CARD STORE] COMMUNITY CARD DISABLE');
            handleDisableRFID();
          }
        }
      }
    },
    [communityCardStore, handData?.currentStreet],
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
  }, [socket, playerHandStore, handData?.currentStreet]);

  useEffect(() => {
    socket?.on('communityCards', rfid =>
      handleCommunityCardStore(rfid.uid, 'communityCards'),
    );

    return () => {
      socket?.off('communityCards');
    };
  }, [handData?.currentStreet, communityCardStore]);

  useEffect(() => {
    handleEnableRFID();
  }, [handData?.currentStreet]);

  useEffect(() => {
    console.log('[PLAYER HAND STORE]: STORE -', playerHandStore);
  }, [playerHandStore]);

  useEffect(() => {
    console.log(communityCardStore);

    if (handData?.currentStreet === HandStreetEnum.ALLIN) {
      if (communityCardStore.length === 5) {
        handleFindWinner();
      }
    }
  }, [communityCardStore]);

  return (
    <>
      <View style={styles.handProgress}>
        <View style={styles.potIndicator}>
          <Text style={styles.actionIndicatorText}>
            Pot: {gameContext?.gameSettings.currency}
            {handData?.pot}
          </Text>
          <Text style={styles.actionIndicatorText}>
            Street: {handData?.currentStreet}
          </Text>
        </View>
        <View style={styles.communityCardsWrapper}>
          <Text style={styles.actionIndicatorText}>
            {communityCardStore.join(' ')}
          </Text>
        </View>
        <View style={styles.actionIndicatorWrapper}>
          <Text style={styles.actionIndicatorText}>
            {handData?.playerToAct.name
              ? `${handData?.playerToAct.name} - ${gameContext?.gameSettings.currency}${handData?.playerToAct.stack}`
              : 'Loading'}
          </Text>
        </View>
        <View style={styles.row}>
          <AppButton
            color={ButtonColorEnum.WHITE}
            width={150}
            text={'FOLD'}
            onPress={() =>
              handData
                ? handleAction(handData.playerToAct, HandActionEnum.FOLD)
                : null
            }
          />
          {handData?.currentStreet !== HandStreetEnum.ALLIN && (
            <>
              {showCheckButton && (
                <AppButton
                  color={ButtonColorEnum.WHITE}
                  width={150}
                  text={'CHECK'}
                  onPress={() =>
                    handData
                      ? handleAction(handData.playerToAct, HandActionEnum.CHECK)
                      : null
                  }
                />
              )}
              {showCallButton && (
                <AppButton
                  color={ButtonColorEnum.WHITE}
                  width={150}
                  text={'CALL'}
                  onPress={() =>
                    handData
                      ? handleAction(
                          handData.playerToAct,
                          HandActionEnum.CALL,
                          handData.effectiveAction.bet,
                        )
                      : null
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
            </>
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
