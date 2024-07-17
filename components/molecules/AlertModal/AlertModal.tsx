import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Modal } from '@components/atoms/Modal';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

interface AlertModalProps {
  message: string;
  submitFunction: () => void;
  submitButtonText?: string;
}

export const AlertModal: FC<AlertModalProps> = ({
  message,
  submitFunction,
  submitButtonText,
}) => {
  const styles = StyleSheet.create({
    alertModal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertMessage: {
      color: 'white',
      fontWeight: 'bold',
      marginBottom: 20,
    },
  });

  return (
    <Modal>
      <View style={styles.alertModal}>
        <Text style={styles.alertMessage}>{message.toUpperCase()}</Text>
        <AppButton
          color={ButtonColorEnum.RED}
          text={submitButtonText || 'Submit'}
          width={300}
          height={75}
          onPress={submitFunction}
        />
      </View>
    </Modal>
  );
};
