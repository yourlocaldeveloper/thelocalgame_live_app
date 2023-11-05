import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

export const CardIndicators: FC = () => {
  const styles = StyleSheet.create({
    cardIndicators: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  return (
    <View style={styles.cardIndicators}>
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
      <AppButton color={ButtonColorEnum.RED} text={'No Cards'} />
    </View>
  );
};
