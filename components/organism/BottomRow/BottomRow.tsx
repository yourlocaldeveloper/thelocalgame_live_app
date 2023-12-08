import React, { FC, useContext, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { HandSetup } from '@components/molecules/HandSetup';
import { HandProgress } from '@components/molecules/HandProgress';
import { GameContext, GameStateEnum } from '@components/GameContext';
import { IPlayerHand } from '@components/Main';

import { checkActivePlayers } from './BottomRow.helpers';

type BottomRowProps = {
  playerHandStore: IPlayerHand[];
  setPlayerHandStore: React.Dispatch<React.SetStateAction<IPlayerHand[]>>;
};

export const BottomRow: FC<BottomRowProps> = ({
  playerHandStore,
  setPlayerHandStore,
}) => {
  const styles = StyleSheet.create({
    bottomRow: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    startTrackingButton: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    error: {
      color: 'white',
    },
  });

  const gameContext = useContext(GameContext);
  const [showError, setShowError] = useState(false);

  const handleStartTracking = () => {
    if (checkActivePlayers(gameContext?.players || [])) {
      setShowError(false);
      gameContext?.setGameState(GameStateEnum.SETUP);
    } else {
      setShowError(true);
    }
  };

  return (
    <View style={styles.bottomRow}>
      {gameContext?.gameState === GameStateEnum.SETUP && <HandSetup />}
      {gameContext?.gameState === GameStateEnum.PROGRESS && (
        <HandProgress
          playerHandStore={playerHandStore}
          setPlayerHandStore={setPlayerHandStore}
        />
      )}
      {gameContext?.gameState === GameStateEnum.OFF && (
        <View style={styles.startTrackingButton}>
          {showError && (
            <Text style={styles.error}>
              Need at least two players to start.
            </Text>
          )}
          <AppButton
            color={ButtonColorEnum.RED}
            width={250}
            text={'Start Tracking'}
            onPress={handleStartTracking}
          />
        </View>
      )}
    </View>
  );
};
