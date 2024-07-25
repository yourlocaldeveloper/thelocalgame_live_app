import { FC, PropsWithChildren } from 'react';

import { StyleSheet, View, Dimensions } from 'react-native';

interface ModalProps extends PropsWithChildren {
  isFullscreen?: boolean;
}

export const Modal: FC<ModalProps> = ({ children, isFullscreen }) => {
  const styles = StyleSheet.create({
    modal: {
      position: 'absolute',
      width: Dimensions.get('window').width - 150,
      height: 590,
      bottom: 0,
      left: 75,
      backgroundColor: '#0D1321',
      zIndex: 100,
    },
    fullscreenModal: {
      position: 'absolute',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      top: 0,
      backgroundColor: '#0D1321',
      zIndex: 100,
    },
  });

  return (
    <View style={isFullscreen ? styles.fullscreenModal : styles.modal}>
      {children}
    </View>
  );
};
