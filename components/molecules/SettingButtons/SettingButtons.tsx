import { FC, useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

import { AppButton, ButtonColorEnum } from '@components/atoms/Button';
import {
  GameContext,
  GameStateEnum,
  defaultGameSettings,
  defaultHandInfo,
  testPlayers,
} from '@components/GameContext';
import { Modal } from '@components/atoms/Modal';
import { NumberPad } from '@components/molecules/NumberPad';

export const SettingButtons: FC = () => {
  const styles = StyleSheet.create({
    streamButtons: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    settingsTextInput: {
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
      height: 50,
    },
    submitButtonWrapper: {
      position: 'absolute',
      display: 'flex',
      alignSelf: 'center',
      bottom: 100,
    },
    formWrapper: {
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
    numberPadWrapper: {
      width: '50%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tableSettingsText: {
      color: 'white',
      width: 150,
      textAlign: 'center',
      fontSize: 30,
      fontWeight: 'bold',
    },
    incDecButton: {
      display: 'flex',
      textAlign: 'center',
      color: 'black',
      fontSize: 30,
      fontWeight: 'bold',
      width: 100,
      height: 50,
      backgroundColor: 'white',
    },
  });

  const gameContext = useContext(GameContext);
  const tableSettings = gameContext?.gameSettings;
  const [showTableSettings, setShowTableSettings] = useState(false);
  const [smallBlind, setSmallBlind] = useState(tableSettings?.smallBlind);
  const [bigBlind, setBigBlind] = useState(tableSettings?.bigBlind);
  const [smallestChip, setSmallestChip] = useState(
    tableSettings?.smallestChip || '',
  );

  // useEffect required to set values on table settings when re-opening as it didnt re-render component
  useEffect(() => {
    const newTableSettings = gameContext?.gameSettings;

    setSmallBlind(newTableSettings?.smallBlind);
    setBigBlind(newTableSettings?.bigBlind);
    setSmallestChip(newTableSettings?.smallestChip || '');
  }, [gameContext?.gameSettings]);

  const handleEndGame = () => {
    gameContext?.setGameState(GameStateEnum.OFF);
  };

  const handleSettingsModalOpen = () => {
    setShowTableSettings(true);
  };

  const handleSettingsModalClose = () => {
    setShowTableSettings(false);
  };

  const handleIncBlind = (
    blind: string | undefined,
    setBlind: React.Dispatch<React.SetStateAction<string | undefined>>,
  ) => {
    const blindConvert = Number(blind);
    const smallestChipConvert = Number(smallestChip);
    const newBlind = blindConvert + smallestChipConvert;

    if (newBlind > 0) {
      setBlind(String(newBlind.toFixed(2)));
    } else {
      setBlind('0');
    }
  };

  const handleDecBlind = (
    blind: string | undefined,
    setBlind: React.Dispatch<React.SetStateAction<string | undefined>>,
  ) => {
    const blindConvert = Number(blind);
    const smallestChipConvert = Number(smallestChip);
    const newBlind = blindConvert - smallestChipConvert;

    if (newBlind > 0) {
      setBlind(String(newBlind.toFixed(2)));
    } else {
      setBlind('0.00');
    }
  };

  const handleSettingsSubmit = () => {
    if (smallBlind && bigBlind && smallestChip && tableSettings) {
      const newTableSettings = {
        ...tableSettings,
        smallBlind: smallBlind,
        bigBlind: bigBlind,
        smallestChip: smallestChip,
      };

      gameContext?.setGameSettings(newTableSettings);
    }

    handleSettingsModalClose();
  };

  const handleResetSettings = () => {
    gameContext?.setGameSettings(defaultGameSettings);
    gameContext?.setGameState(GameStateEnum.OFF);
    gameContext?.setHandInfo(defaultHandInfo);
    gameContext?.setPlayers(testPlayers);
  };

  return (
    <>
      <View style={styles.streamButtons}>
        <AppButton color={ButtonColorEnum.BLUE} text={'Camera 1'} />
        <AppButton color={ButtonColorEnum.BLUE} text={'Camera 2'} />
        <AppButton color={ButtonColorEnum.BLUE} text={'Camera Flop'} />
        <AppButton
          color={ButtonColorEnum.BLUE}
          text={'Table Settings'}
          onPress={handleSettingsModalOpen}
        />
        <AppButton color={ButtonColorEnum.BLUE} text={'Register Deck'} />
        {gameContext?.gameState === GameStateEnum.OFF && (
          <AppButton
            color={ButtonColorEnum.BLUE}
            text={'Reset All'}
            onPress={handleResetSettings}
          />
        )}
        {gameContext?.gameState !== GameStateEnum.OFF && (
          <AppButton
            color={ButtonColorEnum.BLUE}
            text={'End Game'}
            onPress={handleEndGame}
          />
        )}
      </View>
      {showTableSettings && (
        <Modal isFullscreen>
          <View style={styles.contentWrapper}>
            <View style={styles.formWrapper}>
              <View style={styles.formRowWrapper}>
                <TextInput
                  style={styles.settingsTextInput}
                  keyboardType={'number-pad'}
                  editable={false}>
                  {smallestChip}
                </TextInput>
              </View>
              <View style={styles.formRowWrapper}>
                <Pressable
                  onPress={() => handleDecBlind(smallBlind, setSmallBlind)}>
                  <Text style={styles.incDecButton}>{'<'}</Text>
                </Pressable>
                <Text style={styles.tableSettingsText}>{smallBlind}</Text>
                <Pressable
                  onPress={() => handleIncBlind(smallBlind, setSmallBlind)}>
                  <Text style={styles.incDecButton}>{'>'}</Text>
                </Pressable>
              </View>
              <View style={styles.formRowWrapper}>
                <Pressable
                  onPress={() => handleDecBlind(bigBlind, setBigBlind)}>
                  <Text style={styles.incDecButton}>{'<'}</Text>
                </Pressable>
                <Text style={styles.tableSettingsText}>{bigBlind}</Text>
                <Pressable
                  onPress={() => handleIncBlind(bigBlind, setBigBlind)}>
                  <Text style={styles.incDecButton}>{'>'}</Text>
                </Pressable>
              </View>
              <View style={styles.submitButtonWrapper}>
                <AppButton
                  color={ButtonColorEnum.RED}
                  text={'Submit'}
                  width={300}
                  height={75}
                  onPress={handleSettingsSubmit}
                />
              </View>
            </View>
            <View style={styles.numberPadWrapper}>
              <NumberPad stack={smallestChip} setStack={setSmallestChip} />
            </View>
          </View>
          <View style={styles.closeButtonWrapper}>
            <AppButton
              color={ButtonColorEnum.RED}
              text={'X'}
              width={50}
              height={50}
              onPress={handleSettingsModalClose}
            />
          </View>
        </Modal>
      )}
    </>
  );
};
