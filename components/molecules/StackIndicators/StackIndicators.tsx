import { FC, useContext } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { GameContext } from '@components/GameContext';

export const StackIndicators: FC = () => {
  const styles = StyleSheet.create({
    stackIndicators: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 2,
    },
    indicator: {
      display: 'flex',
      textAlignVertical: 'center',
      color: 'white',
      width: 100,
      height: 30,
      textAlign: 'center',
    },
  });

  const playerContext = useContext(GameContext);
  const currency = playerContext?.gameSettings.currency;

  const stackIndicators = playerContext?.players.map((player, index) => {
    const playerStack = `${currency}${player.stack}`;

    return (
      <Text style={styles.indicator} key={index}>
        {playerStack || '-'}
      </Text>
    );
  });

  return <View style={styles.stackIndicators}>{stackIndicators}</View>;
};
