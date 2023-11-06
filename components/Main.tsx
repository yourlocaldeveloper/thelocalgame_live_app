import { FC } from 'react';
import { View, StyleSheet } from 'react-native';

import { TopRow } from '@components/organism/TopRow';
import { TableInfo } from '@components/organism/TableInfo';
import { PlayerInfo } from '@components/organism/PlayerInfo';
import { BottomRow } from '@components/organism/BottomRow';

export const Main: FC = () => {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: '#0D1321',
      height: '100%',
      width: '100%',
    },
  });

  return (
    <View style={styles.main}>
      <TopRow />
      <TableInfo />
      <PlayerInfo />
      <BottomRow />
    </View>
  );
};
