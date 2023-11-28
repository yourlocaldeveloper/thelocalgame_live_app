import { FC, useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import {
  GameContext,
  GameStateEnum,
  PlayerType,
  defaultHandInfo,
} from '@components/GameContext';

import {
  getPreFlopPlayerOrder,
  getPostFlopPlayerOrder,
  getNextToAct,
} from './HandProgress.helpers';

export const HandProgress: FC = () => {
  const styles = StyleSheet.create({
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
  });

  enum ActionTypeEnum {
    FOLD,
    CHECK,
    CALL,
    BET,
    RAISE,
  }

  interface ICurrentAction {
    actionType: ActionTypeEnum;
    amount?: String;
  }

  const gameContext = useContext(GameContext);
  const [playerToAct, setPlayerToAct] = useState<PlayerType | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PlayerType[] | null>(null);
  const [currentAction, setCurrentAction] = useState<ICurrentAction | null>(
    null,
  );

  const [showFoldButton, setShowFoldButton] = useState(true);
  const [showCheckButton, setShowCheckButton] = useState(true);
  const [showBetButton, setShowBetButton] = useState(true);
  const [showAllInButton, setAllInButton] = useState(true);

  const handleEndHand = () => {
    gameContext?.setHandInfo({ ...defaultHandInfo });
    gameContext?.setGameState(GameStateEnum.SETUP);
  };

  const handleFold = () => {
    if (currentOrder && playerToAct) {
      const activePlayerIndex = currentOrder.indexOf(playerToAct);
      const nextPlayer = getNextToAct(activePlayerIndex, currentOrder);
      const newPlayerOrder = currentOrder.filter(
        (player, index) => index !== activePlayerIndex,
      );

      if (newPlayerOrder.length === 1) {
        handleHandWon(nextPlayer);
      }

      console.log('Next Player To Act:', nextPlayer);
      console.log('New Order:', newPlayerOrder);

      setPlayerToAct(nextPlayer);
      setCurrentOrder([...newPlayerOrder]);
    }
  };

  const handleHandWon = (player: PlayerType) => {
    handleEndHand();
  };

  useEffect(() => {
    const handInfo = gameContext?.handInfo;

    if (handInfo) {
      const playerWithButton = handInfo.players[handInfo.dealerPosition];
      const preFlopOrder = getPreFlopPlayerOrder(
        playerWithButton,
        handInfo.players,
      );
      console.log('Initial Pre Flop Order', preFlopOrder);
      setCurrentOrder(preFlopOrder);
      setPlayerToAct(preFlopOrder[0]);
    }
  }, []);

  useEffect(() => {
    console.log('Player To Act:', playerToAct);
  }, [playerToAct]);

  return (
    <View style={styles.handProgress}>
      <View style={styles.communityCardsWrapper}>
        <Text style={styles.actionIndicatorText}>Ac Ad Ah As Jc</Text>
      </View>
      <View style={styles.actionIndicatorWrapper}>
        <Text style={styles.actionIndicatorText}>
          {playerToAct?.name ? playerToAct.name : 'Loading'}
        </Text>
      </View>
      <View style={styles.row}>
        {showFoldButton && (
          <AppButton
            color={ButtonColorEnum.WHITE}
            width={150}
            text={'FOLD'}
            onPress={handleFold}
          />
        )}
        {showCheckButton && (
          <AppButton color={ButtonColorEnum.WHITE} width={150} text={'CHECK'} />
        )}
        {showBetButton && (
          <AppButton color={ButtonColorEnum.WHITE} width={150} text={'BET'} />
        )}
        {showAllInButton && (
          <AppButton
            color={ButtonColorEnum.WHITE}
            width={150}
            text={'ALL IN'}
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
          onPress={handleEndHand}
        />
      </View>
    </View>
  );
};
