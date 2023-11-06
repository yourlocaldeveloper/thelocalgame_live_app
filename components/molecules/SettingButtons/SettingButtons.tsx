import { FC, useContext } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { GameContext, GameStateEnum } from '@components/GameContext';

export const SettingButtons: FC = () => {
  const styles = StyleSheet.create({
    streamButtons: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  });

  const gameContext = useContext(GameContext);

  const handleEndGame = () => {
    gameContext?.setGameState(GameStateEnum.OFF);
  };

  return (
    <View style={styles.streamButtons}>
      <AppButton color={ButtonColorEnum.BLUE} text={'Camera 1'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Camera 2'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Camera Flop'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Table Settings'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Register Deck'} />
      {gameContext?.gameState === GameStateEnum.OFF && (
        <AppButton color={ButtonColorEnum.BLUE} text={'Reset All'} />
      )}
      {gameContext?.gameState !== GameStateEnum.OFF && (
        <AppButton
          color={ButtonColorEnum.BLUE}
          text={'End Game'}
          onPress={handleEndGame}
        />
      )}
    </View>
  );
};
