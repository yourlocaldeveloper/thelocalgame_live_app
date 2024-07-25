import { createContext } from 'react';
import OBSWebSocket from 'obs-websocket-js';

type SocketContextType = {
  obsSocket: OBSWebSocket;
};

const obsSocket = new OBSWebSocket();

export const OBSSocketContext = createContext<SocketContextType>({ obsSocket });
