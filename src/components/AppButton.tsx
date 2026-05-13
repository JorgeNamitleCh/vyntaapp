import React, { useMemo } from 'react';
import {
  TouchableOpacity, ActivityIndicator,
  StyleSheet, ViewStyle, StyleProp,
} from 'react-native';
import { Text } from './Text';
import { Radius } from '../theme';
import { useThemeColors, ThemeColors } from '../theme/ThemeContext';

type Variant = 'primary' | 'dark' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[s.base, s[variant], isDisabled && s.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}>
      {loading
        ? <ActivityIndicator size="small" color={variant === 'ghost' ? colors.ink : '#fff'} />
        : <Text style={[s.label, variant === 'ghost' && s.labelGhost]}>{label}</Text>}
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  dark:    { backgroundColor: colors.ink },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.4 },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  labelGhost: { color: colors.ink },
});
