import { FC, useContext, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { HandSetup } from '@components/molecules/HandSetup';
import { HandProgress } from '@components/molecules/HandProgress';
import {
  GameContext,
  GameStateEnum,
  PlayerType,
} from '@components/GameContext';

export const BottomRow: FC = () => {
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

  const checkActivePlayer = (players: PlayerType[]) => {
    const activePlayers = players.filter(player => player.active === true);
    return activePlayers.length > 1 ? true : false;
  };

  const handleStartTracking = () => {
    if (checkActivePlayer(gameContext?.players || [])) {
      setShowError(false);
      gameContext?.setGameState(GameStateEnum.SETUP);
    } else {
      setShowError(true);
    }
  };

  return (
    <View style={styles.bottomRow}>
      {gameContext?.gameState === GameStateEnum.SETUP && <HandSetup />}
      {gameContext?.gameState === GameStateEnum.PROGRESS && <HandProgress />}
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
