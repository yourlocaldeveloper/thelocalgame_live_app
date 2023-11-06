import { FC, useContext } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { GameContext } from '@components/GameContext';

export const TableInfo: FC = () => {
  const gameContext = useContext(GameContext);

  const settings = gameContext?.gameSettings;

  const smallBlind = `${settings?.currency}${settings?.smallBlind}`;
  const bigBlind = `${settings?.currency}${settings?.bigBlind}`;

  const styles = StyleSheet.create({
    tableInfo: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#363D71',
      borderRadius: 10,
      height: 40,
      alignItems: 'center',
      padding: 5,
      justifyContent: 'space-evenly',
    },
    text: {
      color: 'white',
      fontWeight: 'bold',
      width: '33.33%',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.tableInfo}>
      <Text style={styles.text}>Table name: {settings?.tableName}</Text>
      <Text style={styles.text}>
        Stake: {smallBlind}/{bigBlind}
      </Text>
      <Text style={styles.text}>Game Variant: {settings?.gameVariant}</Text>
    </View>
  );
};
