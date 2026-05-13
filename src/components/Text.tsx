import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': 'PlusJakartaSans-ExtraLight',
  '200': 'PlusJakartaSans-ExtraLight',
  '300': 'PlusJakartaSans-Light',
  '400': 'PlusJakartaSans-Regular',
  'normal': 'PlusJakartaSans-Regular',
  '500': 'PlusJakartaSans-Medium',
  '600': 'PlusJakartaSans-SemiBold',
  '700': 'PlusJakartaSans-Bold',
  'bold': 'PlusJakartaSans-Bold',
  '800': 'PlusJakartaSans-ExtraBold',
  '900': 'PlusJakartaSans-ExtraBold',
};

export const Text = ({ style, ...props }: TextProps) => {
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = (flat.fontWeight as string) ?? '400';
  const fontFamily = flat.fontFamily ?? WEIGHT_TO_FAMILY[weight] ?? 'PlusJakartaSans-Regular';
  return <RNText style={[{ fontFamily }, style]} {...props} />;
};
