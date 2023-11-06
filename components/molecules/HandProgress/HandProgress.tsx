import { FC } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

export const HandProgress: FC = () => {
  const styles = StyleSheet.create({
    handProgress: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    communityCardsWrapper: {
      display: 'flex',
      alignItems: 'center',
      padding: 10,
      width: 300,
      borderWidth: 2,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderColor: 'white',
    },
    actionIndicatorWrapper: {
      display: 'flex',
      alignItems: 'center',
      padding: 10,
      width: 300,
      borderWidth: 2,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderTopWidth: 0,
      borderColor: 'white',
      marginBottom: 15,
    },
    actionIndicatorText: {
      textAlign: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: 25,
    },
  });

  return (
    <View style={styles.handProgress}>
      <View style={styles.communityCardsWrapper}>
        <Text style={styles.actionIndicatorText}>Ac Ad Ah As Jc</Text>
      </View>
      <View style={styles.actionIndicatorWrapper}>
        <Text style={styles.actionIndicatorText}>Seat One</Text>
      </View>
      <View style={styles.row}>
        <AppButton
          color={ButtonColorEnum.RED}
          width={150}
          text={'UNDO ACTION'}
        />
        <AppButton color={ButtonColorEnum.WHITE} width={150} text={'FOLD'} />
        <AppButton color={ButtonColorEnum.WHITE} width={150} text={'CHECK'} />
        <AppButton color={ButtonColorEnum.WHITE} width={150} text={'BET'} />
        <AppButton color={ButtonColorEnum.WHITE} width={150} text={'ALL IN'} />
        <AppButton color={ButtonColorEnum.RED} width={150} text={'MISSDEAL'} />
      </View>
    </View>
  );
};
