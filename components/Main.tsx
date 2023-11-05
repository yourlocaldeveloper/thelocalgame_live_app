import { FC } from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';

export const Main: FC = () => {
  const text = 'Hello World';

  const styles = StyleSheet.create({
    text: {
      color: 'red',
    },
  });

  return (
    <ScrollView>
      <Text style={styles.text}>{text}</Text>
    </ScrollView>
  );
};
