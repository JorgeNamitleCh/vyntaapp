import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Text } from './Text';
import { Radius } from '../theme';
import { useThemeColors, ThemeColors } from '../theme/ThemeContext';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const Chip = ({ label, active = false, onPress, style }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[s.chip, active && s.chipActive, style]}
      onPress={onPress}
      activeOpacity={0.75}>
      <Text style={[s.label, active && s.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  chip: {
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
