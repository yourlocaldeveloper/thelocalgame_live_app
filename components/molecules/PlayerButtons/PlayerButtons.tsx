import { FC, useContext, useState } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  Switch,
} from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import { GameContext, PlayerType } from '@components/GameContext';
import { Modal } from '@components/atoms/Modal';

export const PlayerButtons: FC = () => {
  const styles = StyleSheet.create({
    playerButtons: {
      display: 'flex',
      flexDirection: 'row',
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
  const [playerActive, setPlayerActive] = useState(false);

  const handlePlayerButtonClick = (player: PlayerType, playerIndex: number) => {
    setShowPlayerModal(true);
    setPlayerName(player.name);
    setPlayerStack(player.stack || '');
    setPlayerIndex(playerIndex);
    setPlayerActive(player.active);
  };

  const closeModal = () => {
    setShowPlayerModal(false);
    setPlayerName('');
    setPlayerStack('');
    setPlayerIndex(0);
    setPlayerActive(false);
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
        active: playerActive,
      };

      setPlayers([...players]);
    }

    closeModal();
  };

  const playerButtons = playerContext?.players.map((player, index) => {
    return (
      <AppButton
        key={index}
        color={player.active ? ButtonColorEnum.GREEN : ButtonColorEnum.RED}
        text={player.name}
        onPress={() => handlePlayerButtonClick(player, index)}
      />
    );
  });

  return (
    <>
      <View style={styles.playerButtons}>{playerButtons}</View>
      {showPlayerModal && (
        <Modal>
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
          <View style={styles.formRowWrapper}>
            <Text style={styles.formText}>Player Active:</Text>
            <Switch
              trackColor={{ false: 'red', true: 'green' }}
              thumbColor={playerActive ? 'green' : 'red'}
              onValueChange={setPlayerActive}
              value={playerActive}
            />
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
        </Modal>
      )}
    </>
  );
};
