import { FC, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { TopRow } from '@components/organism/TopRow';
import { TableInfo } from '@components/organism/TableInfo';
import { PlayerInfo } from '@components/organism/PlayerInfo';
import { BottomRow } from '@components/organism/BottomRow';

import {
  PlayerContext,
  defaultPlayerContext,
  PlayerType,
} from './PlayerContext';

export const Main: FC = () => {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: '#0D1321',
      height: '100%',
      width: '100%',
    },
  });

  const [players, setPlayers] = useState<PlayerType[]>(defaultPlayerContext);

  return (
    <PlayerContext.Provider value={{ players, setPlayers }}>
      <View style={styles.main}>
        <TopRow />
        <TableInfo />
        <PlayerInfo />
        <BottomRow />
      </View>
    </PlayerContext.Provider>
  );
};
