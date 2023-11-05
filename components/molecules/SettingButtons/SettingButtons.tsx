import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

export const SettingButtons: FC = () => {
  const styles = StyleSheet.create({
    streamButtons: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  });

  return (
    <View style={styles.streamButtons}>
      <AppButton color={ButtonColorEnum.BLUE} text={'Cemera 1'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Camera 2'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Camera Flop'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Table Settings'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Register Deck'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Reset All'} />
    </View>
  );
};
