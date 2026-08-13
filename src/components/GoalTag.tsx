import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fonts } from '../constants/typography';
import { useTheme } from '../context/SettingsContext';
import PressableScale from './PressableScale';

export interface GoalTagProps {
  label: string;
  active: boolean;
  onPress?: () => void;
}

export default function GoalTag({ label, active, onPress }: GoalTagProps) {
  const theme = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.tag,
        { backgroundColor: active ? theme.pulse : theme.border },
      ]}
    >
      <Text style={[styles.text, { color: active ? theme.white : theme.sub }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 8,
  },
  text: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
});
