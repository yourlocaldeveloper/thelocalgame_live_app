import { FC, useContext, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { GameContext } from '@components/GameContext';

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

  const gameContext = useContext(GameContext);
  const players = gameContext?.players;
  const settings = gameContext?.gameSettings;
  const setSettings = gameContext?.setGameSettings;

  const smallBlind = `${settings?.currency}${settings?.smallBlind}`;
  const bigBlind = `${settings?.currency}${settings?.bigBlind}`;
  const ante = settings?.ante ? `${settings?.currency}${settings.ante}` : '';

  const getDealerText = (index: number) => {
    if (index === settings?.dealerPosition) {
      return 'BTN';
    } else {
      return 'X';
    }
  };

  const handleDealerPosition = (index: number) => {
    if (settings && setSettings) {
      setSettings({ ...settings, dealerPosition: index });
    }
  };

  const dealerIndicators = players?.map((player, index) => {
    const dealerText = getDealerText(index);
    const buttonColor = player.active
      ? ButtonColorEnum.WHITE
      : ButtonColorEnum.BLACK;

    // TO-DO: Need to handle these not re-rendering when active player added/removed.
    return (
      <AppButton
        key={index}
        color={buttonColor}
        text={dealerText}
        onPress={() => (player.active ? handleDealerPosition(index) : () => {})}
      />
    );
  });

  return (
    <View style={styles.handSetup}>
      <View style={styles.row}>{dealerIndicators}</View>
      <View style={styles.row}>
        <Text style={styles.blindsText}>SMALL BLIND</Text>
        <Text style={styles.blindsText}>BIG BLIND</Text>
        <Text style={styles.blindsText}>ANTE</Text>
      </View>
      <View style={styles.row}>
        <AppButton
          color={ButtonColorEnum.WHITE}
          text={smallBlind}
          height={50}
          width={150}
        />
        <AppButton
          color={ButtonColorEnum.WHITE}
          text={bigBlind}
          height={50}
          width={150}
        />
        <AppButton
          color={ButtonColorEnum.WHITE}
          text={ante}
          height={50}
          width={150}
        />
      </View>
    </View>
  );
};
