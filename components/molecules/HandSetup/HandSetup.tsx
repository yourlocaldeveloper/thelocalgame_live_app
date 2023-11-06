import { FC } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

export const HandSetup: FC = () => {
  const styles = StyleSheet.create({
    handSetup: {
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    blindsText: {
      width: 150,
      textAlign: 'center',
      color: 'white',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.handSetup}>
      <View style={styles.row}>
        <AppButton color={ButtonColorEnum.WHITE} text={'BTN'} />
        <AppButton color={ButtonColorEnum.WHITE} text={'SB'} />
        <AppButton color={ButtonColorEnum.WHITE} text={'BB'} />
        <AppButton color={ButtonColorEnum.BLACK} text={'X'} />
        <AppButton color={ButtonColorEnum.BLACK} text={'X'} />
        <AppButton color={ButtonColorEnum.BLACK} text={'X'} />
        <AppButton color={ButtonColorEnum.BLACK} text={'X'} />
        <AppButton color={ButtonColorEnum.BLACK} text={'X'} />
        <AppButton color={ButtonColorEnum.BLACK} text={'X'} />
      </View>
      <View style={styles.row}>
        <Text style={styles.blindsText}>SMALL BLIND</Text>
        <Text style={styles.blindsText}>BIG BLIND</Text>
        <Text style={styles.blindsText}>ANTE</Text>
      </View>
      <View style={styles.row}>
        <AppButton
          color={ButtonColorEnum.WHITE}
          text={'£0.10'}
          height={50}
          width={150}
        />
        <AppButton
          color={ButtonColorEnum.WHITE}
          text={'£0.20'}
          height={50}
          width={150}
        />
        <AppButton
          color={ButtonColorEnum.WHITE}
          text={''}
          height={50}
          width={150}
        />
      </View>
    </View>
  );
};
