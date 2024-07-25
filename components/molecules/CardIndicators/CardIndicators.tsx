import { FC, useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { GameContext } from '@components/GameContext';
import { IPlayerHand } from '@components/Main';

type CardIndicatorsProps = {
  playerHandStore: IPlayerHand[];
};

export const CardIndicators: FC<CardIndicatorsProps> = ({
  playerHandStore,
}) => {
  const styles = StyleSheet.create({
    cardIndicators: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  const gameContext = useContext(GameContext);
  const players = gameContext?.players;

  const cardIndicators = players?.map(player => {
    if (player.active === false) {
      return (
        <AppButton
          key={player.name}
          color={ButtonColorEnum.DARK_RED}
          text={'Not Active'}
        />
      );
    }

    const playerWithHand = playerHandStore.find(
      ply => ply.seat === player.seat,
    );
    const hasCards = playerWithHand?.hand.length === 2;

    return (
      <AppButton
        key={player.name}
        color={hasCards ? ButtonColorEnum.GREEN : ButtonColorEnum.RED}
        text={hasCards ? 'Has Cards' : 'No Cards'}
      />
    );
  });

  return <View style={styles.cardIndicators}>{cardIndicators}</View>;
};
