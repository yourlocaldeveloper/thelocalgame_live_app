import { FC, useContext, useEffect, useState } from 'react';
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
} from './HandProgress.helpers';

interface PlayerAction {
  player?: PlayerType;
  action: HandActionEnum;
  bet: string;
}

export const HandProgress: FC = () => {
  const gameContext = useContext(GameContext);

  const [showBetModal, setShowBetModal] = useState(false);
  const [bet, setBet] = useState('');

  const [playerToAct, setPlayerToAct] = useState<PlayerType | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PlayerType[] | null>(null);
  const [currentStreet, setCurrentStreet] = useState<HandStreetEnum>(
    HandStreetEnum.PREFLOP,
  );

  // Indicated action path + main action (usually agressive or non)
  // const [playersAction, setPlayersAction] = useState<PlayerAction[]>([]);
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

  const handleEndHand = () => {
    gameContext?.setHandInfo({ ...defaultHandInfo });
    gameContext?.setGameState(GameStateEnum.SETUP);
    // setPlayersAction([]);
    setCurrentStreet(HandStreetEnum.PREFLOP);
    setCurrentOrder(null);
    setPlayerToAct(null);
    setMainAction(null);
  };

  const handleMissdeal = () => {
    if (backUpPlayerInfo) {
      console.log(backUpPlayerInfo);
      gameContext?.setPlayers(backUpPlayerInfo);
    }

    handleEndHand();
  };

  // TO-DO: Show winner and alocate pot to them, update everything and have modal to confirm winner.
  const handleHandWon = (player: PlayerType) => {
    console.log('Player Won:', player.name);
    handleEndHand();
  };

  const handleClosingAction = (order?: PlayerType[]) => {
    if (currentOrder) {
      const handInfo = gameContext?.handInfo;
      const playerWithButton = handInfo?.players[handInfo.dealerPosition];
      const originalPlayerOrder = handInfo?.players;
      if (playerWithButton && originalPlayerOrder) {
        if (!order) {
          let orderWithActivePlayers;
          console.log('ORDER BEFORE CHANGING:', originalPlayerOrder);
          console.log('ORDER BEFORE CURRENT ORDER:', currentOrder);
          if (currentStreet === HandStreetEnum.PREFLOP) {
            const postFlopOrder = getPostFlopPlayerOrder(
              playerWithButton,
              originalPlayerOrder,
            );
            orderWithActivePlayers = postFlopOrder.filter(player =>
              currentOrder.find(ply => ply.seat === player.seat),
            );

            console.log('ATTEMPTING TO DO THIS ORDER:', orderWithActivePlayers);
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
              currentOrder.find(ply => ply.seat === player.seat),
            );

            console.log('ATTEMPTING TO DO THIS ORDER:', orderWithActivePlayers);
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
        }
      }
    }
  };

  const handleAssignNextPlayer = (action: HandActionEnum) => {
    if (currentOrder && playerToAct) {
      const activePlayerIndex = currentOrder.indexOf(playerToAct);
      const nextPlayer = getNextToAct(activePlayerIndex, currentOrder);
      let newPlayerOrder: PlayerType[] = currentOrder;

      // If action fold, remove them from active players.
      if (action === HandActionEnum.FOLD) {
        newPlayerOrder = currentOrder.filter(
          (player, index) => index !== activePlayerIndex,
        );

        setCurrentOrder(newPlayerOrder);
      }

      // Check if player has won (only one active player left)
      if (newPlayerOrder.length === 1) {
        nextPlayer ? handleHandWon(nextPlayer) : handleHandWon(currentOrder[0]);
        return;
      }

      console.log('==== NEXT PLAYER: ', nextPlayer);

      console.log('==== MAIN ACTION PLAYER: ', mainAction?.player?.seat);

      if (
        nextPlayer?.seat === mainAction?.player?.seat &&
        mainAction.action !== HandActionEnum.NON
      ) {
        console.log('CATCH =============');
        handleClosingAction(newPlayerOrder);
        const newStreet = getNextStreet(currentStreet);
        setCurrentStreet(newStreet);
        return;
      }

      console.log('Next Player To Act:', nextPlayer);
      console.log('New Order:', newPlayerOrder);
      setPlayerToAct(nextPlayer);
    }
  };

  // const handleStoreAction = (
  //   actionPlayer: PlayerType | undefined,
  //   action: HandActionEnum,
  //   playerBet?: string,
  // ) => {
  //   const player = playersAction.findIndex(
  //     player => player.player === actionPlayer,
  //   );
  //   const newAction = {
  //     player: actionPlayer,
  //     action,
  //     bet: playerBet || '',
  //   };

  //   if (player !== -1) {
  //     const actionPlayerBet = playersAction[player].bet;
  //     const newPlayersAction = playersAction;

  //     if (playerBet && Number(playerBet) > Number(mainAction?.bet)) {
  //       setMainAction(newAction);
  //       newAction.bet = actionPlayerBet;
  //     }

  //     newPlayersAction[player] = newAction;

  //     if (action === HandActionEnum.FOLD) {
  //       newPlayersAction.splice(player, 1);
  //     }

  //     setPlayersAction([...newPlayersAction]);
  //   } else {
  //     console.log('NOT FOUND PLAYER IN ACTION DB');
  //     if (action !== HandActionEnum.FOLD) {
  //       console.log('NOT FOLD, ADD ENTRY');
  //       console.log('SHOULD BE:', [...playersAction, newAction]);
  //       setPlayersAction([...playersAction, newAction]);
  //     }
  //   }
  // };

  const handleAction = (
    actionPlayer: PlayerType | null,
    action: HandActionEnum,
    playerBet?: string,
  ) => {
    if (actionPlayer) {
      // handleStoreAction(actionPlayer, action, playerBet);

      if (actionPlayer === mainAction?.player && currentOrder) {
        if (action === HandActionEnum.FOLD || playerBet === mainAction?.bet) {
          let newPlayerOrder: PlayerType[] = [];
          if (action === HandActionEnum.FOLD) {
            // NEED TO ADD HANDLING IF LAST TO ACT FOLDS, EVEN IF CHECKED TOO. Or they are kept in active players array of this hand (this is because that logic is usually handeled in handleAssignNextPlayer).
            console.log('CALL HERE');
            const activePlayerIndex = currentOrder.indexOf(actionPlayer);
            newPlayerOrder = currentOrder.filter(
              (player, index) => index !== activePlayerIndex,
            );

            console.log('REFINED ORDER:', newPlayerOrder);

            if (newPlayerOrder.length === 1) {
              // Check if last player
              handleHandWon(newPlayerOrder[0]);
              return;
            }

            setCurrentOrder([...newPlayerOrder]);
          }

          if (currentStreet === HandStreetEnum.RIVER) {
            // Check if reached river, then award winning player pot
            // TO:DO add proper hand won logic. Placeholder is to just give last player pot
            handleHandWon(actionPlayer);
            return;
          }

          console.log('========== NEW STREET ==========');
          if (newPlayerOrder.length > 0) {
            handleClosingAction(newPlayerOrder);
          } else {
            handleClosingAction();
          }
          const newStreet = getNextStreet(currentStreet);
          setCurrentStreet(newStreet);
          // setPlayersAction([]);
          return;
        }
      }

      if (action === HandActionEnum.CALL || action === HandActionEnum.BET) {
        if (currentOrder) {
          const playerSeat = actionPlayer.seat;

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

            if (action === HandActionEnum.BET) {
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

            setCurrentOrder(newCurrentOrder);

            handleAssignNextPlayer(action);

            console.log('ADJUSTED STACK, NEW ORDER:', newCurrentOrder);
          }
        }
      }

      handleAssignNextPlayer(action);
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

  // Debug useEffect
  useEffect(() => {
    // console.log('PLAYER ACTION ARRAY:', playersAction);
    console.log('MAIN ACTION:', mainAction);
  }, [mainAction]);

  // Debug useEffect
  useEffect(() => {
    // console.log('PLAYER ACTION ARRAY:', playersAction);
    console.log('NEW STREET: ', currentStreet);
  }, [currentStreet]);

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
