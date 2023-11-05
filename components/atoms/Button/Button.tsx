import { FC } from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export enum ButtonColorEnum {
  RED,
  BLUE,
  ORANGE,
  WHITE,
}

type ButtonProps = {
  color: ButtonColorEnum;
  text: string;
  onPress?: () => void;
};

export const AppButton: FC<ButtonProps> = ({ color, text, onPress }) => {
  const styles = StyleSheet.create({
    button: {
      height: 100,
      width: 100,
    },
    text: {
      textShadowOffset: {
        width: 1,
        height: 1,
      },
    },
    gradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
  });

  const textStyles = StyleSheet.create({
    red: {
      color: 'white',
    },
    blue: {
      color: 'white',
    },
    orange: {
      color: 'white',
    },
    white: {
      color: 'black',
    },
  });

  const getBackgroundColor = () => {
    switch (color) {
      case ButtonColorEnum.RED:
        return ['#D54A4A', '#BB0A0A'];
      case ButtonColorEnum.BLUE:
        return ['#4B70D6', '#0944BA'];
      case ButtonColorEnum.ORANGE:
        return ['#FF8D36', '#B85B14'];
      case ButtonColorEnum.WHITE:
        return ['#FFFFFF', '#CBCBCB'];
    }
  };

  const getTextColor = () => {
    switch (color) {
      case ButtonColorEnum.RED:
        return textStyles.red;
      case ButtonColorEnum.BLUE:
        return textStyles.blue;
      case ButtonColorEnum.ORANGE:
        return textStyles.orange;
      case ButtonColorEnum.WHITE:
        return textStyles.white;
    }
  };

  return (
    <Pressable onPress={onPress} style={[styles.button]}>
      <LinearGradient colors={getBackgroundColor()} style={styles.gradient}>
        <Text style={[styles.text, getTextColor()]}>{text}</Text>
      </LinearGradient>
    </Pressable>
  );
};
