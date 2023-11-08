import { FC, useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { GameContext } from '@components/GameContext';

export const CardIndicators: FC = () => {
  const styles = StyleSheet.create({
    cardIndicators: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  const gameContext = useContext(GameContext);
  const players = gameContext?.players;

  const cardIndicators = players?.map(player => {
    const hasCards = player.cards?.length === 2;

    return (
      <AppButton
        key={player.name}
        color={hasCards ? ButtonColorEnum.GREEN : ButtonColorEnum.RED}
        text={hasCards ? 'Cards Registered' : 'No Cards'}
      />
    );
  });

  return <View style={styles.cardIndicators}>{cardIndicators}</View>;
};
