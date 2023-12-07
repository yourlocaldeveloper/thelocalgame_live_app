import { FC } from 'react';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

interface StreamButtonsProps {
  isConnectedToServer: boolean;
}

export const StreamButtons: FC<StreamButtonsProps> = ({
  isConnectedToServer,
}) => {
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
      <AppButton
        color={
          isConnectedToServer ? ButtonColorEnum.GREEN : ButtonColorEnum.RED
        }
        text={'Socket IO'}
      />
      <AppButton color={ButtonColorEnum.BLUE} text={'Toggle Stream'} />
      <AppButton color={ButtonColorEnum.BLUE} text={'Hide Camera'} />
    </View>
  );
};
