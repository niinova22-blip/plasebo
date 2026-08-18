import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { useMotion } from '../../hooks/useMotion';

const ACTIVE_WIDTH = 24;
const IDLE_WIDTH = 8;

function Dot({ active }: { active: boolean }) {
  const motion = useMotion();
  const width = useSharedValue(active ? ACTIVE_WIDTH : IDLE_WIDTH);
  const tint = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    const target = active ? ACTIVE_WIDTH : IDLE_WIDTH;
    if (motion.reduced) {
      width.value = target;
      tint.value = active ? 1 : 0;
      return;
    }
    width.value = withTiming(target, { duration: 300 });
    tint.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, motion.reduced, width, tint]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    // Renk geçişi yerine opaklık: iki renk arası interpolasyon burada
    // gereksiz, pasif nokta zaten sönük duruyor.
    opacity: 0.4 + tint.value * 0.6,
    backgroundColor: tint.value > 0.5 ? colors.pulse : colors.haze,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export interface ProgressDotsProps {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.row} pointerEvents="none">
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
