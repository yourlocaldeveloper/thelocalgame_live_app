import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

export const PlayerButtons: FC = () => {
  const styles = StyleSheet.create({
    playerButtons: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  return (
    <View style={styles.playerButtons}>
      <AppButton color={ButtonColorEnum.RED} text={'Seat 1'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 2'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 3'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 4'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 5'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 6'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 7'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 8'} />
      <AppButton color={ButtonColorEnum.RED} text={'Seat 9'} />
    </View>
  );
};
