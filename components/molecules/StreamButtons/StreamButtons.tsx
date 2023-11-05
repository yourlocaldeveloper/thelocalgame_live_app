import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

export const StreamButtons: FC = () => {
  const styles = StyleSheet.create({
    streamButtons: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  });

  return (
    <View style={styles.streamButtons}>
      <AppButton color={ButtonColorEnum.BLUE} text={'RFID Health'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Socket IO'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Toggle Stream'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Hide Camera'} />
    </View>
  );
};
