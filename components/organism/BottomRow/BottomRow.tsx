import { FC, useState } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { HandSetup } from '@components/molecules/HandSetup';
import { HandProgress } from '@components/molecules/HandProgress';

enum GameStateEnum {
  OFF,
  SETUP,
  PROGRESS,
}

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

  const [gameState, setGameState] = useState<GameStateEnum>(GameStateEnum.OFF);

  return (
    <View style={styles.bottomRow}>
      {gameState === GameStateEnum.SETUP && <HandSetup />}
      {gameState === GameStateEnum.PROGRESS && <HandProgress />}
      {gameState === GameStateEnum.OFF && (
        <View style={styles.startTrackingButton}>
          <AppButton
            color={ButtonColorEnum.RED}
            width={250}
            text={'Start Tracking'}
          />
        </View>
      )}
    </View>
  );
};
