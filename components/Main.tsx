import { FC } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { TopRow } from '@components/organism/TopRow';
import { TableInfo } from '@components/organism/TableInfo';

export const Main: FC = () => {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: '#0D1321',
    },
  });

  return (
    <ScrollView style={styles.main}>
      <TopRow />
      <TableInfo />
    </ScrollView>
  );
};
