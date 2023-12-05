import { FC, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { TopRow } from '@components/organism/TopRow';
import { TableInfo } from '@components/organism/TableInfo';
import { PlayerInfo } from '@components/organism/PlayerInfo';
import { BottomRow } from '@components/organism/BottomRow';

import {
  GameContext,
  defaultPlayers,
  defaultGameSettings,
  PlayerType,
  GameStateEnum,
  GameSettingsType,
  IHandInfo,
  defaultHandInfo,
  testPlayers,
} from './GameContext';

export const Main: FC = () => {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: '#0D1321',
      height: '100%',
      width: '100%',
    },
  });

  const [players, setPlayers] = useState<PlayerType[]>(testPlayers);
  const [gameState, setGameState] = useState<GameStateEnum>(GameStateEnum.OFF);
  const [gameSettings, setGameSettings] =
    useState<GameSettingsType>(defaultGameSettings);
  const [handInfo, setHandInfo] = useState<IHandInfo>(defaultHandInfo);

  useEffect(() => {
    console.log('======= CHANGE TO PLAYERS:', players);
  }, [players]);

  return (
    <GameContext.Provider
      value={{
        players,
        setPlayers,
        gameState,
        setGameState,
        gameSettings,
        setGameSettings,
        handInfo,
        setHandInfo,
      }}>
      <View style={styles.main}>
        <TopRow />
        <TableInfo />
        <PlayerInfo />
        <BottomRow />
      </View>
    </GameContext.Provider>
  );
};
