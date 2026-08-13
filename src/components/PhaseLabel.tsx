import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useMotion } from '../hooks/useMotion';

export interface PhaseLabelProps {
  /** Gösterilecek metin. Değiştiğinde geçiş animasyonu tetiklenir. */
  text: string;
  style?: TextStyle;
}

/**
 * Faz yazısı ("Nefes Al" → "Tut" → "Nefes Ver") arasında yumuşak geçiş:
 * eski yazı yukarı doğru silinir, yeni yazı aşağıdan belirir.
 */
export default function PhaseLabel({ text, style }: PhaseLabelProps) {
  const motion = useMotion();
  const [shown, setShown] = useState(text);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (text === shown) return;

    if (motion.reduced) {
      setShown(text);
      progress.value = 1;
      return;
    }

    progress.value = withSequence(
      withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) }, (finished) => {
        'worklet';
        if (finished) runOnJS(setShown)(text);
      }),
      withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) })
    );
  }, [text, shown, motion.reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.text, style]} numberOfLines={2}>
        {shown}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 30,
    color: colors.white,
    textAlign: 'center',
  },
});
