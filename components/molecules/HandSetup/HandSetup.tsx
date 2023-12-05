import { FC, useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import {
  GameContext,
  GameStateEnum,
  HandStreetEnum,
  PlayerType,
} from '@components/GameContext';
import { checkActivePlayers } from '@components/organism/BottomRow/BottomRow.helpers';

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
    startHandButtonWrapper: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 75,
    },
    error: {
      textAlign: 'center',
      color: 'white',
    },
  });

  const gameContext = useContext(GameContext);
  const players = gameContext?.players;
  const settings = gameContext?.gameSettings;
  const setSettings = gameContext?.setGameSettings;
  const [showError, setShowError] = useState(false);

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

  const getActivePlayers = (players: PlayerType[]) => {
    const activePlayers = players.filter(player => player.active === true);
    return activePlayers;
  };

  const getPlayerWithButton = () => {
    const dealerPosition = settings?.dealerPosition;

    const allPlayers = gameContext?.players || [];

    const dealerPlayer = allPlayers.filter(
      (player, index) => index === dealerPosition,
    );

    return dealerPlayer[0];
  };

  const handleStartHand = () => {
    if (gameContext && checkActivePlayers(gameContext?.players || [])) {
      const tableSettings = gameContext.gameSettings;
      const players = gameContext.players;
      const setHandInfo = gameContext.setHandInfo;

      const playersInHand = getActivePlayers([...players]);
      const playerWithButton = getPlayerWithButton();

      const initialPot = String(
        (
          Number(tableSettings.smallBlind) + Number(tableSettings.bigBlind)
        ).toFixed(2),
      );

      const dealerIndex = playersInHand.indexOf(playerWithButton);

      setHandInfo({
        pot: initialPot,
        players: playersInHand,
        dealerPosition: dealerIndex,
        street: HandStreetEnum.PREFLOP,
      });

      // console.log('Preflop Player Order:', preFlopPlayerOrder);
      // console.log('Postflop Player Order:', postFlopPlayerOrder);
      setShowError(false);
      gameContext?.setGameState(GameStateEnum.PROGRESS);
    } else {
      setShowError(true);
    }
  };

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
      <View style={styles.startHandButtonWrapper}>
        {showError && (
          <Text style={styles.error}>Need at least two players to start.</Text>
        )}
        <AppButton
          color={ButtonColorEnum.RED}
          text={'Start Hand'}
          onPress={handleStartHand}
        />
      </View>
    </View>
  );
};
