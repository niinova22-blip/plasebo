import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useTheme } from '../context/SettingsContext';

export interface TransparencyPillProps {
  text: string;
  style?: ViewStyle;
  /** Uygulama zeminli (temalı) ekranlarda kullanılacak varyant. */
  light?: boolean;
}

/** Her ekranda bulunan "bu plasebo" hatırlatıcısı. */
export default function TransparencyPill({
  text,
  style,
  light,
}: TransparencyPillProps) {
  const theme = useTheme();

  // `light` varyantı temaya uyar; varsayılan varyant koyu (ink) ekranlar için.
  const border = light ? theme.pulse : colors.glow;
  const background = light ? theme.accentSoft : 'transparent';
  const textColor = light ? theme.pulse : colors.glow;

  return (
    <View
      style={[styles.pill, { borderColor: border, backgroundColor: background }, style]}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    fontFamily: fonts.sans,
    fontSize: 10,
    textAlign: 'center',
  },
});
