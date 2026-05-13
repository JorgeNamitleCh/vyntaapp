import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Radius } from '../theme';
import { useThemeColors, ThemeColors } from '../theme/ThemeContext';

type Props = {
  onPress: () => void;
  color?: string;
};

export const BackButton = ({ onPress, color }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity style={s.btn} onPress={onPress} activeOpacity={0.7}>
      <ChevronLeft size={20} color={color ?? colors.ink} strokeWidth={2} />
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
