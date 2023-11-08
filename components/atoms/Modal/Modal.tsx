import { FC, PropsWithChildren } from 'react';

import { StyleSheet, View } from 'react-native';

interface ModalProps extends PropsWithChildren {}

export const Modal: FC<ModalProps> = ({ children }) => {
  const styles = StyleSheet.create({
    modal: {
      position: 'absolute',
      width: '100%',
      height: 400,
      top: 0,
      backgroundColor: '#0D1321',
      zIndex: 100,
    },
  });

  return <View style={styles.modal}>{children}</View>;
};
