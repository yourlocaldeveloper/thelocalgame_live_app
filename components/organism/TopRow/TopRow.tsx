import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { StreamButtons } from '@components/molecules/StreamButtons';
import { SettingButtons } from '@components/molecules/SettingButtons';

export const TopRow: FC = () => {
  const styles = StyleSheet.create({
    topRow: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  return (
    <View style={styles.topRow}>
      <StreamButtons />
      <SettingButtons />
    </View>
  );
};
