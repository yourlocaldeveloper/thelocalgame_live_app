import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { CardIndicators } from '@components/molecules/CardIndicators';
import { PlayerButtons } from '@components/molecules/PlayerButtons';
import { StackIndicators } from '@components/molecules/StackIndicators';

export const PlayerInfo: FC = () => {
  const styles = StyleSheet.create({
    playerInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.playerInfo}>
      <CardIndicators />
      <PlayerButtons />
      <StackIndicators />
    </View>
  );
};
