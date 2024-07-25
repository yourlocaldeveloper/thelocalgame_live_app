import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { StreamButtons } from '@components/molecules/StreamButtons';
import { SettingButtons } from '@components/molecules/SettingButtons';

interface TopRowProps {
  isConnectedToServer: boolean;
  isObsWebSocketConnected: boolean;
}

export const TopRow: FC<TopRowProps> = ({
  isConnectedToServer,
  isObsWebSocketConnected,
}) => {
  const styles = StyleSheet.create({
    topRow: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  return (
    <View style={styles.topRow}>
      <StreamButtons
        isConnectedToServer={isConnectedToServer}
        isObsWebSocketConnected={isObsWebSocketConnected}
      />
      <SettingButtons />
    </View>
  );
};
