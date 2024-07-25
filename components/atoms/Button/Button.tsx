import { FC } from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export enum ButtonColorEnum {
  DARK_RED,
  RED,
  BLUE,
  ORANGE,
  GREEN,
  WHITE,
  BLACK,
}

type ButtonProps = {
  color: ButtonColorEnum;
  text: string;
  onPress?: () => void;
  width?: number;
  height?: number;
  isVerticalTextLeft?: boolean;
  isVerticalTextRight?: boolean;
};

export const AppButton: FC<ButtonProps> = ({
  color,
  text,
  onPress,
  width,
  height,
  isVerticalTextLeft,
  isVerticalTextRight,
}) => {
  const styles = StyleSheet.create({
    button: {
      width: width || 100,
      height: height || 100,
    },
    text: {
      textShadowOffset: {
        width: 1,
        height: 1,
      },
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    gradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      padding: 2,
      margin: 2,
    },
    verticalText: {
      transform: isVerticalTextLeft
        ? [{ rotate: '-90deg' }]
        : [{ rotate: '90deg' }],
      width: isVerticalTextLeft || isVerticalTextRight ? height : width || 100,
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
    green: {
      color: 'white',
    },
    white: {
      color: 'black',
    },
    black: {
      color: 'white',
    },
  });

  const getBackgroundColor = () => {
    switch (color) {
      case ButtonColorEnum.DARK_RED:
        return ['#461919', '#350303'];
      case ButtonColorEnum.RED:
        return ['#D54A4A', '#BB0A0A'];
      case ButtonColorEnum.BLUE:
        return ['#454ADE', '#454ADE'];
      case ButtonColorEnum.ORANGE:
        return ['#f3696e', '#f8a902'];
      case ButtonColorEnum.GREEN:
        return ['#26be18', '#26be18'];
      case ButtonColorEnum.WHITE:
        return ['#FFFFFF', '#CBCBCB'];
      case ButtonColorEnum.BLACK:
        return ['#171717', '#171717'];
    }
  };

  const getTextColor = () => {
    switch (color) {
      case ButtonColorEnum.RED:
        return textStyles.red;
      case ButtonColorEnum.RED:
        return textStyles.red;
      case ButtonColorEnum.BLUE:
        return textStyles.blue;
      case ButtonColorEnum.ORANGE:
        return textStyles.orange;
      case ButtonColorEnum.GREEN:
        return textStyles.green;
      case ButtonColorEnum.WHITE:
        return textStyles.white;
      case ButtonColorEnum.BLACK:
        return textStyles.black;
    }
  };

  return (
    <Pressable onPress={onPress} style={[styles.button]}>
      <LinearGradient
        colors={getBackgroundColor()}
        style={styles.gradient}
        useAngle={true}
        angle={90}>
        <Text
          style={[
            styles.text,
            getTextColor(),
            (isVerticalTextLeft || isVerticalTextRight) && styles.verticalText,
          ]}>
          {text}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};
