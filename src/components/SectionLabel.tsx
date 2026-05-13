import React from 'react';
import { StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Text } from './Text';
import { useThemeColors } from '../theme/ThemeContext';

type Props = { children: string; style?: StyleProp<TextStyle> };

export const SectionLabel = ({ children, style }: Props) => {
  const colors = useThemeColors();
  return (
    <Text style={[{ fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 }, style]}>
      {children}
    </Text>
  );
};
