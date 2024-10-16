import { FC } from 'react';
import { TexasHoldem } from 'poker-odds-calc';

import { StyleSheet, View } from 'react-native';
import { AppButton, ButtonColorEnum } from '@components/atoms/Button';

interface StreamButtonsProps {
  isConnectedToServer: boolean;
  isObsWebSocketConnected: boolean;
}

export const StreamButtons: FC<StreamButtonsProps> = ({
  isConnectedToServer,
  isObsWebSocketConnected,
}) => {
  const styles = StyleSheet.create({
    streamButtons: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  });

  const testPokerOdds = () => {
    const Table = new TexasHoldem();

    Table.addPlayer(['Qs', 'Ks'])
      .addPlayer(['Qd', 'Kd'])

      .setBoard(['Js', 'Ts', '5h', 'Td', '8h']);

    const Result = Table.calculate();

    Result.getPlayers().forEach(player => {
      console.log(
        `${player.getName()} - ${player.getHand()} - Wins: ${player.getWinsPercentageString()} - Ties: ${player.getTiesPercentageString()}`,
      );
    });

    console.log(Result.toJson());

    const test = Result.getPlayers();

    console.log('Test:', test[0].getName());
    console.log('Test:', test[1].getName());

    console.log(`Board: ${Result.getBoard()}`);
    console.log(`Iterations: ${Result.getIterations()}`);
    console.log(`Time takes: ${Result.getTime()}ms`);

    const winnersNew = Result.getPlayers();

    const winners = Result.getWinner();

    winnersNew.forEach(winner => {
      console.log(`Ties: ${winner.getTies()}`);
      console.log(`Wins: ${winner.getWins()}`);
    });

    console.log(`Winner: ${winnersNew}`);
  };

  return (
    <View style={styles.streamButtons}>
      <AppButton
        color={
          isConnectedToServer ? ButtonColorEnum.GREEN : ButtonColorEnum.RED
        }
        text={'Socket IO'}
      />
      <AppButton
        color={
          isObsWebSocketConnected ? ButtonColorEnum.GREEN : ButtonColorEnum.RED
        }
        text={'OBS Web Socket'}
      />
      <AppButton color={ButtonColorEnum.BLUE} text={'Toggle Stream'} />
      <AppButton
        color={ButtonColorEnum.BLUE}
        text={'Hide Camera'}
        onPress={testPokerOdds}
      />
    </View>
  );
};
