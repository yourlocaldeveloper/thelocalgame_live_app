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
import { NumberPad } from '@components/molecules/NumberPad';

export const PlayerButtons: FC = () => {
  const styles = StyleSheet.create({
    playerButtons: {
      display: 'flex',
      flexDirection: 'row',
    },
    playerTextInput: {
      color: 'black',
      backgroundColor: 'white',
      width: '80%',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'black',
      marginBottom: 10,
      fontSize: 18,
    },
    playerStackInput: {
      color: 'black',
      backgroundColor: 'white',
      width: '80%',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'black',
      marginBottom: 10,
      fontSize: 18,
    },
    closeButtonWrapper: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    formRowWrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    submitButtonWrapper: {
      position: 'absolute',
      display: 'flex',
      alignSelf: 'center',
      bottom: 0,
    },
    formWrapper: {
      width: '50%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberPadWrapper: {
      width: '50%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100%',
    },
    playerActiveText: {
      color: 'white',
      fontWeight: 'bold',
      marginRight: 10,
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
          <View style={styles.contentWrapper}>
            <View style={styles.formWrapper}>
              <View style={styles.formRowWrapper}>
                <TextInput
                  style={styles.playerTextInput}
                  onChange={handlePlayerNameChange}>
                  {playerName}
                </TextInput>
              </View>
              <View style={styles.formRowWrapper}>
                <TextInput
                  style={styles.playerStackInput}
                  onChange={handlePlayerStackChange}
                  keyboardType={'number-pad'}
                  editable={false}>
                  {playerStack}
                </TextInput>
              </View>
              <View style={styles.formRowWrapper}>
                <Text style={styles.playerActiveText}>
                  {playerActive ? 'Active' : 'Not Active'}
                </Text>
                <Switch
                  trackColor={{ false: 'red', true: 'green' }}
                  thumbColor={playerActive ? 'green' : 'red'}
                  onValueChange={setPlayerActive}
                  value={playerActive}
                />
              </View>
              <View style={styles.submitButtonWrapper}>
                <AppButton
                  color={ButtonColorEnum.RED}
                  text={'Submit'}
                  width={300}
                  height={75}
                  onPress={handlePlayerSubmit}
                />
              </View>
            </View>
            <View style={styles.numberPadWrapper}>
              <NumberPad stack={playerStack} setStack={setPlayerStack} />
            </View>
          </View>
          <View style={styles.closeButtonWrapper}>
            <AppButton
              color={ButtonColorEnum.RED}
              text={'X'}
              width={50}
              height={50}
              onPress={closeModal}
            />
          </View>
        </Modal>
      )}
    </>
  );
};
