import { FC, useContext, useState } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { GameContext, PlayerType } from '@components/GameContext';

export const PlayerButtons: FC = () => {
  const styles = StyleSheet.create({
    playerButtons: {
      display: 'flex',
      flexDirection: 'row',
    },
    playerModal: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      width: '100%',
      height: 300,
      backgroundColor: 'black',
      zIndex: 10,
    },
    playerTextInput: {
      color: 'black',
      backgroundColor: 'white',
      width: 250,
      borderWidth: 1,
      borderColor: 'red',
    },
    playerStackInput: {
      color: 'black',
      backgroundColor: 'white',
      width: 250,
      borderWidth: 1,
      borderColor: 'red',
    },
    closeButtonWrapper: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    formText: {
      color: 'white',
      paddingRight: 25,
    },
    formRowWrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  const playerContext = useContext(GameContext);

  const [showPlayerModal, setShowPlayerModal] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState('');
  const [playerStack, setPlayerStack] = useState('');
  const [playerIndex, setPlayerIndex] = useState(0);

  const handlePlayerButtonClick = (player: PlayerType, playerIndex: number) => {
    setShowPlayerModal(true);
    setPlayerName(player.name);
    setPlayerStack(player.stack || '');
    setPlayerIndex(playerIndex);
  };

  const closeModal = () => {
    setShowPlayerModal(false);
    setPlayerName('');
    setPlayerStack('');
    setPlayerIndex(0);
  };

  const handlePlayerNameChange = (
    event: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    const newNameValue = event.nativeEvent.text;
    setPlayerName(newNameValue);
  };

  const handlePlayerStackChange = (
    event: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    const newStackValue = event.nativeEvent.text;
    setPlayerStack(newStackValue);
  };

  const handlePlayerSubmit = () => {
    const players = playerContext?.players;
    const setPlayers = playerContext?.setPlayers;

    if (players && setPlayers) {
      players[playerIndex] = {
        name: playerName,
        stack: playerStack,
        active: true,
      };

      setPlayers(players);
    }

    closeModal();
  };

  const playerButtons = playerContext?.players.map((player, index) => {
    return (
      <AppButton
        color={ButtonColorEnum.RED}
        text={player.name}
        onPress={() => handlePlayerButtonClick(player, index)}
      />
    );
  });

  return (
    <>
      <View style={styles.playerButtons}>{playerButtons}</View>
      {showPlayerModal && (
        <View style={styles.playerModal}>
          <View style={styles.formRowWrapper}>
            <Text style={styles.formText}>Player Name:</Text>
            <TextInput
              style={styles.playerTextInput}
              onChange={handlePlayerNameChange}>
              {playerName}
            </TextInput>
          </View>
          <View style={styles.formRowWrapper}>
            <Text style={styles.formText}>Stack:</Text>
            <TextInput
              style={styles.playerStackInput}
              onChange={handlePlayerStackChange}>
              {playerStack}
            </TextInput>
          </View>
          <AppButton
            color={ButtonColorEnum.RED}
            text={'Submit'}
            width={250}
            height={50}
            onPress={handlePlayerSubmit}
          />
          <View style={styles.closeButtonWrapper}>
            <AppButton
              color={ButtonColorEnum.RED}
              text={'X'}
              onPress={closeModal}
            />
          </View>
        </View>
      )}
    </>
  );
};
