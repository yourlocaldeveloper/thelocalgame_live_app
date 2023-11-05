import { FC } from 'react';

import { StyleSheet, View, Text } from 'react-native';

export const StackIndicators: FC = () => {
  const styles = StyleSheet.create({
    stackIndicators: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 2,
    },
    indicator: {
      display: 'flex',
      textAlignVertical: 'center',
      color: 'white',
      width: 75,
      height: 30,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.stackIndicators}>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
      <Text style={styles.indicator}>£0.00</Text>
    </View>
  );
};
