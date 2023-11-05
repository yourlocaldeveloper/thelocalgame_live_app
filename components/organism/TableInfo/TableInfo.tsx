import { FC } from 'react';

import { StyleSheet, View, Text } from 'react-native';

export const TableInfo: FC = () => {
  const tableName = 'Table Name';

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
      <Text style={styles.text}>Table name: {tableName}</Text>
      <Text style={styles.text}>Stake: £0.10/£0.20</Text>
      <Text style={styles.text}>Game Variant: Holdem</Text>
    </View>
  );
};
