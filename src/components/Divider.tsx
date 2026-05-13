import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';

type Props = { inset?: number };

export const Divider = ({ inset = 0 }: Props) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.border },
        inset > 0 && { marginLeft: inset },
      ]}
    />
  );
};
