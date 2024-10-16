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
  defaultHandInfo,
} from '@components/GameContext';
import { Modal } from '@components/atoms/Modal';
import { SocketContext } from '@components/SocketContext';
import { IPlayerHand } from '@components/Main';
import { AlertModal } from '@components/molecules/AlertModal';

import { NumberPad } from '../NumberPad';
import {
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
  getHandSetup,
  getChopPotAmount,
} from './HandProgress.helpers';
import {
  ActionType,
  HandPlayerType,
  SidePotType,
  IHandData,
} from './HandProgress.types';

import { styles } from './HandProgress.styles';
import { OBSSocketContext } from '@components/OBSSocketContext';

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
  const obsSocketContext = useContext(OBSSocketContext);

  const socket = socketContext?.socket;
  const obsSocket = obsSocketContext.obsSocket;

  const [showBetModal, setShowBetModal] = useState(false);
  const [bet, setBet] = useState('');

  // No showFoldButton useState because if player has action they can always fold
  const [showCheckButton, setShowCheckButton] = useState(true);
  const [showBetButton, setShowBetButton] = useState(true);
  const [showCallButton, setShowCallButton] = useState(true);

  // Alert Box
  const [showAlertModal, setShowAlertModal] = useState(true);
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [alertModalFunction, setAlertModalFunction] = useState(() => () => {});

  // Stream Helpers
  const [raiseCount, setRaiseCount] = useState(0);

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

  const submitAction = (player: HandPlayerType, action: HandActionEnum) => {
    socket?.emit(
      'submitAction',
      JSON.stringify({ player: player, action: action }),
    );
  };

  const displayPlayerToStream = (player: HandPlayerType) => {
    socket?.emit(
      'displayPlayer',
      JSON.stringify({ ...player, isOriginallyActive: true }),
    );
  };

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

  const handleChopPot = (winningPlayers: HandPlayerType[]) => {
    if (handData && gameContext) {
      const { activeOrder, pot } = handData;
      const setPlayers = gameContext.setPlayers;
      const corePlayers = gameContext.players;

      let newAllPlayers = corePlayers;

      const { chopAmount, remainderChips } = getChopPotAmount(
        winningPlayers.length,
        pot,
        gameContext.gameSettings.smallBlind,
      );

      winningPlayers.forEach((winningPlayer, index) => {
        const playerInCurrentOrder = activeOrder.find(
          player => player.seat === winningPlayer.seat,
        );

        if (playerInCurrentOrder) {
          const chopAwardAmount =
            index === 0 && remainderChips
              ? String((Number(chopAmount) + Number(remainderChips)).toFixed(2))
              : chopAmount;

          const playerAdjustedStack = getWinningPlayerStack(
            playerInCurrentOrder,
            chopAwardAmount,
          );

          const adjustedAllPlayers = activeOrder.map(
            player =>
              [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
              player,
          );

          // TO-DO RESOLVE ISSUE WHERE newAllPlayers is not sharing updated state on each forEach
          newAllPlayers = newAllPlayers.map(corePlayer => {
            const playerFound = adjustedAllPlayers.find(
              player => player.seat === corePlayer.seat,
            );

            if (playerFound && winningPlayer.seat === corePlayer.seat) {
              corePlayer.stack = playerFound.stack;
            }

            return corePlayer;
          });
        }
      });

      if (setPlayers && newAllPlayers) {
        setPlayers(newAllPlayers);
      }
    }

    handleEndHand();
  };

  // Function: handleFindWinner
  const handleFindWinner = (allPots?: SidePotType[]) => {
    // getting setPlayers function to set gameCOntext?
    const setPlayers = gameContext?.setPlayers;
    // getting old player array for game context
    const corePlayers = gameContext?.players;
    if (handData && corePlayers && setPlayers) {
      const { activeOrder } = handData;

      // all pots is if there is a scenario a player is all in and there is a side pot
      if (!allPots) {
        // filters players who are left
        const playersLeft = playerHandStore.filter(player =>
          activeOrder.find(ply => ply.seat === player.seat),
        );

        // maps the hands they have
        const hands = playersLeft.map(player => [
          player.hand[0],
          player.hand[1],
        ]);

        // Calls on external function to get winner of hand.
        const { winningPlayers, isChop } = getWinnerOfHand(
          hands,
          communityCardStore,
          activeOrder,
          playersLeft,
        );

        if (winningPlayers) {
          if (!isChop) {
            console.log('[HAND WON]: Winner Identified');
            handleHandWon(winningPlayers[0]);

            return;
          } else {
            handleChopPot(winningPlayers);

            return;
          }
        } else {
          console.log('[ERROR]: Could not figure out winner. Missdeal.');
          handleMissdeal();

          return;
        }
      } else {
        let currentActiveOrder = handData.activeOrder;

        allPots.forEach(pot => {
          // Runs the logic from above for each pot. This is to ensure side pots are only awarded to players who qualify for that pot
          const players = pot.players;
          const potValue = pot.pot;

          if (players.length === 1) {
            // Return money to pot if player is only one able to win it
            const lonePlayer = players[0];

            const winningPlayer = currentActiveOrder.find(
              player => player.seat === lonePlayer.seat,
            );

            if (winningPlayer) {
              const winningPlayerUpdatedStack = getWinningPlayerStack(
                winningPlayer,
                potValue,
              );

              currentActiveOrder = currentActiveOrder.map(
                player =>
                  [winningPlayerUpdatedStack].find(
                    ply => ply.seat === player.seat,
                  ) || player,
              );
            }
          } else {
            // Runs similar logic as above
            const playersLeft = playerHandStore.filter(player =>
              players.find(ply => ply.seat === player.seat),
            );

            const hands = playersLeft.map(player => [
              player.hand[0],
              player.hand[1],
            ]);

            const { winningPlayers, isChop } = getWinnerOfHand(
              hands,
              communityCardStore,
              currentActiveOrder,
              playersLeft,
            );

            if (winningPlayers) {
              if (!isChop) {
                console.log('[HAND WON]: Winner Identified');
                handleHandWon(winningPlayers[0]);

                return;
              } else {
                handleChopPot(winningPlayers);

                return;
              }
            } else {
              console.log('[ERROR]: Could not figure out winner. Missdeal.');
              handleMissdeal();

              return;
            }
          }
        });
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

    socket?.emit('resetLivestream', JSON.stringify('stop'));
    handleEndHand();
  };

  const handlePotAllocation = () => {
    if (handData) {
      const { activeOrder } = handData;

      const allInPlayers = activeOrder.filter(
        player => player.action.type === HandActionEnum.ALLIN,
      );

      if (allInPlayers.length === 0) {
        handleFindWinner();

        return;
      } else {
        let sidePots: {
          committed: string;
          players: HandPlayerType[];
          pot: string;
        }[] = [];

        allInPlayers.forEach(allInPlayer => {
          sidePots.push({
            committed: allInPlayer.committed,
            players: [allInPlayer],
            pot: '0.00',
          });
        });

        if (sidePots.length > 1) {
          sidePots.sort(
            (valueA, valueB) =>
              parseFloat(valueA.committed) - parseFloat(valueB.committed),
          );
        }

        let lastCommit = '0.00';
        let allPots: {
          pot: string;
          players: HandPlayerType[];
        }[] = [];

        console.log('[Side Pots]:', sidePots);

        sidePots.map((sidePot, index) => {
          const maxCommit = sidePot.committed;
          let totalPot = 0;
          let allPlayers = sidePot.players;

          allPlayers = activeOrder.filter(
            player => Number(player.committed) >= Number(sidePot.committed),
          );

          if (index === 0) {
            activeOrder.forEach(player => {
              let playersCommit = player.committed;

              if (Number(playersCommit) > Number(maxCommit)) {
                playersCommit = maxCommit;
              }

              totalPot += Number(playersCommit);

              lastCommit = maxCommit;
            });
          } else {
            const adjustedMaxCommit = Number(maxCommit) - Number(lastCommit);

            allPlayers.forEach(player => {
              let playerCommitLeft =
                Number(player.committed) - Number(lastCommit);

              console.log('PLAYER COMMIT LEFT', playerCommitLeft);

              console.log('ADJUSTED MAX COMMIT', adjustedMaxCommit);

              if (playerCommitLeft > adjustedMaxCommit) {
                playerCommitLeft = Number(adjustedMaxCommit);
              }

              totalPot += Number(playerCommitLeft);
            });

            lastCommit = maxCommit;
          }

          allPlayers.filter(
            player => player.action.type !== HandActionEnum.FOLD,
          );

          console.log('========= [SIDE POT CREATION] ===========');
          console.log('Pot Total:', totalPot.toFixed(2));
          console.log('All Players Who Can Win This Pot:', allPlayers);

          allPots.push({ pot: totalPot.toFixed(2), players: allPlayers });
        });

        console.log('ALL SIDE POTS', allPots);

        handleFindWinner(allPots);
      }
    }
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

        handlePotAllocation();
        return;
      }

      const activePlayersRemaining = activeOrder.filter(
        player =>
          player.action.type !== HandActionEnum.FOLD &&
          player.action.type !== HandActionEnum.ALLIN,
      );

      if (activePlayersRemaining.length === 0) {
        handDataOverwrite
          ? setHandData({
              ...handDataOverwrite,
              currentStreet: HandStreetEnum.ALLIN,
            })
          : setHandData({
              ...handData,
              currentStreet: HandStreetEnum.ALLIN,
            });

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
              player.committed = playerFound.committed;
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

      const newPlayerToAct = startingPlayer || orderWithActivePlayers[0];

      handDataOverwrite
        ? setHandData({
            ...handDataOverwrite,
            effectiveAction: newMainAction,
            activeOrder: orderWithActivePlayers,
            currentStreet: newStreet,
            playerToAct: newPlayerToAct,
          })
        : setHandData({
            ...handData,
            effectiveAction: newMainAction,
            activeOrder: orderWithActivePlayers,
            currentStreet: newStreet,
            playerToAct: newPlayerToAct,
          });
    }
  };

  // FUNCTION: Handling assigning the next player //
  const handleAssignNextPlayer = (handDataOverride?: IHandData) => {
    if (handData) {
      const { activeOrder, playerToAct, effectiveAction, currentStreet } =
        handDataOverride ? handDataOverride : handData;

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

          if (nextPlayerStack === 0) {
            const activePlayersRemaining = activeOrder.filter(
              player =>
                player.action.type !== HandActionEnum.FOLD &&
                player.action.type !== HandActionEnum.ALLIN,
            );

            console.log('ACTIVE PLAYERS:', activePlayersRemaining);

            if (activePlayersRemaining.length === 1) {
              console.log(
                '[CLOSING ACTION]: All but one players all in. All in state.',
              );

              handDataOverride
                ? setHandData({
                    ...handDataOverride,
                    currentStreet: HandStreetEnum.ALLIN,
                  })
                : setHandData({
                    ...handData,
                    currentStreet: HandStreetEnum.ALLIN,
                  });

              return;
            }
          }

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

      if (
        nextPlayer.action.type === HandActionEnum.FOLD ||
        nextPlayer.action.type === HandActionEnum.ALLIN
      ) {
        handleAssignNextPlayer(updatedHandData);
      } else {
        if (
          currentStreet === HandStreetEnum.PREFLOP &&
          nextPlayer.action.type === HandActionEnum.NON
        ) {
          console.log('[STREAM]: Displaying User');
          displayPlayerToStream(nextPlayer);
        }

        socket?.emit(
          String(nextPlayer.seat),
          JSON.stringify({
            stack: nextPlayer.stack,
            isActive: true,
            raiseCount: raiseCount,
          }),
        );
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

      socket?.emit(
        String(actionPlayer.seat),
        JSON.stringify({
          stack: actionPlayer.stack,
          action: actionPlayer.action.type,
          isActive: false,
          raiseCount: raiseCount,
        }),
      );

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
        `[PLAYER ACTION]: ${actionPlayer?.name} HAS PUT IN ${playerBet} because they have bet?: ${isBet}`,
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

        // Adjust main pot to be all that all in player can win, add side pot if neccessary
        if (Number(adjustedPlayerBet) >= Number(playerInCurrentOrder.stack)) {
          adjustedPlayerBet = playerInCurrentOrder.stack;
        }

        const playerAdjustedStack = getStackChange(
          playerInCurrentOrder,
          adjustedPlayerBet || '',
        );

        let playerAction = isBet ? HandActionEnum.BET : HandActionEnum.CALL;

        const updatedCommit = addChips(
          playerAdjustedStack.committed,
          adjustedPlayerBet,
        );

        if (Number(playerAdjustedStack.stack) === 0 && adjustedPlayerBet) {
          playerAction = HandActionEnum.ALLIN;
        }

        const newAction: ActionType = {
          seat: actionPlayer.seat,
          type: playerAction,
          bet: playerBet || '', // reason we dont use adjusted bet because blinds call wrong amount when adjustAmount is given
        };

        playerAdjustedStack.action = newAction;
        playerAdjustedStack.committed = updatedCommit;

        const newCurrentOrder = activeOrder.map(
          player =>
            [playerAdjustedStack].find(ply => ply.seat === player.seat) ||
            player,
        );

        const newPot = addChips(pot, adjustedPlayerBet);

        if (isClosingAction) {
          socket?.emit(
            String(newAction.seat),
            JSON.stringify({
              stack: playerAdjustedStack.stack,
              action: playerAdjustedStack.action.type,
              bet: playerAdjustedStack.action.bet,
              isActivePlayer: false,
              raiseCount: raiseCount,
            }),
          );

          handleClosingAction({
            ...handData,
            activeOrder: newCurrentOrder,
            pot: newPot,
            effectiveAction: isBet ? newAction : handData.effectiveAction,
          });
        } else {
          if (isBet) {
            socket?.emit('submitEffectiveAction', JSON.stringify(newAction));
            setRaiseCount(count => count + 1);
          }

          socket?.emit(
            String(newAction.seat),
            JSON.stringify({
              stack: playerAdjustedStack.stack,
              action: playerAdjustedStack.action.type,
              bet: playerAdjustedStack.action.bet,
              isActivePlayer: false,
              raiseCount: raiseCount,
            }),
          );

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
          socket?.emit(
            String(actionPlayer.seat),
            JSON.stringify({
              stack: actionPlayer.stack,
              action: HandActionEnum.CHECK,
              isActivePlayer: false,
            }),
          );
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
        socket?.emit(
          String(actionPlayer.seat),
          JSON.stringify({
            stack: actionPlayer.stack,
            action: HandActionEnum.CHECK,
            isActivePlayer: false,
          }),
        );

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
      const { preFlopOrder, postFlopOrder, initialBackup, initialHandData } =
        getHandSetup(gameContext);

      const firstToAct = preFlopOrder[0];

      console.log('[HAND SETUP] Initial Hand Data:', initialHandData);
      socket?.emit('initialPlayerData', JSON.stringify(initialBackup));

      // TO-DO: Fix identifier naming of this emit as its the postFlopOrder
      socket?.emit('preflopOrder', JSON.stringify(postFlopOrder));
      setHandData(initialHandData);

      setAlertModalMessage(
        `Confirm that ${firstToAct.name} cards have been read`,
      );
      const gameSetupAlertFunction = () => {
        displayPlayerToStream(firstToAct);
        setShowAlertModal(false);
      };

      setAlertModalFunction(() => gameSetupAlertFunction);
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
              handleDisableRFID(5000);
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
            handleDisableRFID(1000);
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
    const handleNextStreet = () => {
      if (
        handData?.currentStreet !== HandStreetEnum.PREFLOP &&
        handData?.currentStreet !== HandStreetEnum.ALLIN
      ) {
        handData?.activeOrder.forEach(player => {
          const dataToEmit = {
            stack: player.stack,
            isActive: false,
          };

          socket?.emit(String(player.seat), JSON.stringify(dataToEmit));
        });
      }

      socket?.emit(
        String(handData?.playerToAct.seat),
        JSON.stringify({ stack: handData?.playerToAct.stack, isActive: true }),
      );

      setRaiseCount(0);

      if (
        handData?.currentStreet &&
        handData?.currentStreet === HandStreetEnum.PREFLOP
      ) {
        socket?.emit('currentStreet', JSON.stringify(handData?.currentStreet));
        handleEnableRFID();
      }

      if (
        handData?.currentStreet &&
        handData?.currentStreet !== HandStreetEnum.PREFLOP
      ) {
        setShowAlertModal(false);
        socket?.emit('setShowStreamOverlay', JSON.stringify(true));
        obsSocket.call('SetCurrentProgramScene', { sceneName: 'Camera1' });
      }
    };

    const handleCommunityCardDealt = () => {
      obsSocket.call('SetCurrentProgramScene', {
        sceneName: 'Community Cards',
      });
      socket?.emit('setShowStreamOverlay', JSON.stringify(false));
      socket?.emit('currentStreet', JSON.stringify(handData?.currentStreet));
      handleEnableRFID();

      setAlertModalFunction(() => handleNextStreet);
      setAlertModalMessage(`Click to switch to the ${handData?.currentStreet}`);
    };

    if (
      handData?.currentStreet &&
      handData?.currentStreet !== HandStreetEnum.PREFLOP
    ) {
      setAlertModalFunction(() => handleCommunityCardDealt);
      setAlertModalMessage('Click to switch to community card view');
      setShowAlertModal(true);
      return;
    }

    handleNextStreet();
  }, [handData?.currentStreet]);

  useEffect(() => {
    console.log('[PLAYER HAND STORE]: STORE -', playerHandStore);
  }, [playerHandStore]);

  useEffect(() => {
    console.log('[SEE COMMIT]: HERE -', handData?.activeOrder);
  }, [handData?.activeOrder]);

  useEffect(() => {
    console.log(communityCardStore);

    if (handData?.currentStreet === HandStreetEnum.ALLIN) {
      if (communityCardStore.length === 5) {
        handlePotAllocation();
      }
    }
  }, [communityCardStore]);

  useEffect(() => {
    console.log('[[[DEBUG]]] SHOWING MODALLLLLL', showAlertModal);
  }, [showAlertModal]);

  useEffect(() => {
    console.log('[[[DEBUG]]] alertModalMessage:', alertModalMessage);
  }, [alertModalMessage]);

  useEffect(() => {
    if (handData?.pot) {
      socket?.emit('pot', JSON.stringify(handData?.pot));
    }
  }, [handData?.pot]);

  return (
    <>
      <View style={styles.handProgress}>
        <View style={styles.potIndicator}>
          <Text style={styles.actionIndicatorTextWithBck}>
            Pot: {gameContext?.gameSettings.currency}
            {handData?.pot}
          </Text>
          <Text style={styles.actionIndicatorTextWithBck}>
            Street: {handData?.currentStreet}
          </Text>
        </View>
        {handData?.effectiveAction.type !== HandActionEnum.NON && (
          <View style={styles.effectiveActionIndiciator}>
            <Text style={styles.actionIndicatorTextWithBck}>
              Action: {handData?.effectiveAction.type}
            </Text>
            <Text style={styles.actionIndicatorTextWithBck}>
              Amount: {handData?.effectiveAction.bet}
            </Text>
            <Text style={styles.actionIndicatorTextWithBck}>
              Seat: {handData?.effectiveAction.seat}
            </Text>
          </View>
        )}
        <View style={styles.communityCardsWrapper}>
          <Text style={styles.actionIndicatorText}>
            {communityCardStore.join(' ')}
          </Text>
        </View>
        <View style={styles.actionIndicatorWrapper}>
          <Text style={styles.actionIndicatorText}>
            Waiting For Action From:
          </Text>
          <Text style={styles.actionIndicatorText}>
            {handData?.playerToAct.name
              ? `${handData?.playerToAct.name} - ${gameContext?.gameSettings.currency}${handData?.playerToAct.stack}`
              : 'Loading'}
          </Text>
        </View>
        <View style={styles.row}>
          {handData?.currentStreet !== HandStreetEnum.ALLIN && (
            <>
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
            height={590}
            width={75}
            text={'UNDO ACTION'}
            isVerticalTextLeft
          />
        </View>
        <View style={styles.missdealButtonWrapper}>
          <AppButton
            color={ButtonColorEnum.RED}
            text={'MISSDEAL'}
            height={590}
            width={75}
            onPress={handleMissdeal}
            isVerticalTextRight
          />
        </View>
      </View>
      {showAlertModal && (
        <AlertModal
          message={alertModalMessage}
          submitFunction={alertModalFunction}
        />
      )}
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
