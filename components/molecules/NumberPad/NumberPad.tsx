import { FC, Dispatch, SetStateAction } from 'react';

import { Pressable, StyleSheet, View, Text } from 'react-native';

interface NumberPadProps {
  stack: string;
  setStack: Dispatch<SetStateAction<string>>;
}

export const NumberPad: FC<NumberPadProps> = ({ stack, setStack }) => {
  const styles = StyleSheet.create({
    numberPad: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberPadRow: {
      display: 'flex',
      flexDirection: 'row',
    },
    numberPadButton: {
      margin: 2,
      backgroundColor: 'black',
      width: 100,
      height: 75,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberPadText: {
      color: 'green',
      fontSize: 22,
      fontWeight: 'bold',
    },
  });

  const handleDelete = () => {
    const newStack = stack.slice(0, -1);
    setStack(newStack);
  };

  const handleAdd = (value: string) => {
    const newStack = stack + value;
    setStack(newStack);
  };

  return (
    <View style={styles.numberPad}>
      <View style={styles.numberPadRow}>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('1')}>
          <Text style={styles.numberPadText}>1</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('2')}>
          <Text style={styles.numberPadText}>2</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('3')}>
          <Text style={styles.numberPadText}>3</Text>
        </Pressable>
      </View>
      <View style={styles.numberPadRow}>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('4')}>
          <Text style={styles.numberPadText}>4</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('5')}>
          <Text style={styles.numberPadText}>5</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('6')}>
          <Text style={styles.numberPadText}>6</Text>
        </Pressable>
      </View>
      <View style={styles.numberPadRow}>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('7')}>
          <Text style={styles.numberPadText}>7</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('8')}>
          <Text style={styles.numberPadText}>8</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('9')}>
          <Text style={styles.numberPadText}>9</Text>
        </Pressable>
      </View>
      <View style={styles.numberPadRow}>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('.')}>
          <Text style={styles.numberPadText}>.</Text>
        </Pressable>
        <Pressable
          style={styles.numberPadButton}
          onPress={() => handleAdd('0')}>
          <Text style={styles.numberPadText}>0</Text>
        </Pressable>
        <Pressable style={styles.numberPadButton} onPress={handleDelete}>
          <Text style={styles.numberPadText}>DEL</Text>
        </Pressable>
      </View>
    </View>
  );
};
