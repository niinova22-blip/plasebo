import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';

export interface StreakBarProps {
  streak: number;
  /** Bugünün ritüeli tamamlandı mı? */
  doneToday: boolean;
}

export default function StreakBar({ streak, doneToday }: StreakBarProps) {
  const motion = useMotion();
  const theme = useTheme();
  const t = useT();
  const flame = useSharedValue(1);

  useEffect(() => {
    if (motion.reduced) return;
    // Ekran açılınca alev bir kez zıplar.
    flame.value = withDelay(
      260,
      withSequence(
        withTiming(1.3, { duration: 220, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 320, easing: Easing.out(Easing.back(2.5)) })
      )
    );
  }, [motion.reduced, flame]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flame.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.accentSoft }]}>
      <Animated.Text style={[styles.icon, flameStyle]}>🔥</Animated.Text>
      <Text style={[styles.streak, { color: theme.pulse }]}>
        {t('{gun} gün serisi', { gun: streak })}
      </Text>
      <Text style={[styles.hint, { color: theme.sub }]}>
        {t(doneToday ? 'Bugün tamamlandı' : 'Bugün formülün hazır')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: { fontSize: 15, marginRight: 8 },
  streak: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  hint: {
    marginLeft: 'auto',
    fontFamily: fonts.sans,
    fontSize: 11,
  },
});
