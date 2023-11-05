import { FC } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppButton, ButtonColorEnum } from './atoms/Button';

export const Main: FC = () => {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: '#383838',
    },
  });

  return (
    <ScrollView style={styles.main}>
      <AppButton color={ButtonColorEnum.ORANGE} text={'Test'} />
    </ScrollView>
  );
};
