import { FC, useContext, useState } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { HandSetup } from '@components/molecules/HandSetup';
import { HandProgress } from '@components/molecules/HandProgress';
import { GameContext, GameStateEnum } from '@components/GameContext';

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
      flexDirection: 'row',
    },
  });

  const gameContext = useContext(GameContext);

  const handleStartTracking = () => {
    gameContext?.setGameState(GameStateEnum.SETUP);
  };

  return (
    <View style={styles.bottomRow}>
      {gameContext?.gameState === GameStateEnum.SETUP && <HandSetup />}
      {gameContext?.gameState === GameStateEnum.PROGRESS && <HandProgress />}
      {gameContext?.gameState === GameStateEnum.OFF && (
        <View style={styles.startTrackingButton}>
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
