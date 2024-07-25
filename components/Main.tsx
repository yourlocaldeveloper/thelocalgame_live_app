import { FC, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';
import OBSWebSocket from 'obs-websocket-js';

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
import { SocketContext } from './SocketContext';
import { OBSSocketContext } from './OBSSocketContext';

export interface IPlayerHand {
  hand: string[];
  seat: number;
  hasCards: boolean;
}

const socket = io('http://192.168.0.17:3001', {
  autoConnect: false,
});

const obsSocket = new OBSWebSocket();

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

  const [playerHandStore, setPlayerHandStore] = useState<IPlayerHand[]>([]);

  const [isConnectedToServer, setIsConnectedToServer] = useState(false);
  const [isObsWebSocketConnected, setIsObsWebSocketConnected] = useState(false);

  useEffect(() => {
    console.log('[Web Sockets]: Initializing');

    socket.connect();
    obsSocket.connect('ws://192.168.0.17:4455');

    const onConnect = () => {
      console.log('[RFID Web Socket]: Connected');
      setIsConnectedToServer(true);
    };

    const onDisconnect = () => {
      console.log('[RFID Web Socket]: Disconnected');
      setIsConnectedToServer(false);
    };

    const onObsConnect = () => {
      console.log('[OBS Web Socket]: Connected');
      setIsObsWebSocketConnected(true);
    };

    const onObsDisconnect = () => {
      console.log('[OBS Web Socket]: Disconnected');
      setIsObsWebSocketConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    obsSocket.on('ConnectionOpened', onObsConnect);
    obsSocket.on('ConnectionClosed', onObsDisconnect);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();

      obsSocket.off('ConnectionOpened');
      obsSocket.off('ConnectionClosed');
      obsSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      <OBSSocketContext.Provider value={{ obsSocket }}>
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
            <TopRow
              isConnectedToServer={isConnectedToServer}
              isObsWebSocketConnected={isObsWebSocketConnected}
            />
            <TableInfo />
            <PlayerInfo playerHandStore={playerHandStore} />
            <BottomRow
              playerHandStore={playerHandStore}
              setPlayerHandStore={setPlayerHandStore}
            />
          </View>
        </GameContext.Provider>
      </OBSSocketContext.Provider>
    </SocketContext.Provider>
  );
};
