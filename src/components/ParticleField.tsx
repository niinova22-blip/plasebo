import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { useMotion } from '../hooks/useMotion';

export interface ParticleFieldProps {
  /** Parçacık sayısı. */
  count?: number;
  /** Alanın yüksekliği; verilmezse ekran yüksekliği kullanılır. */
  height?: number;
}

interface ParticleSpec {
  size: number;
  left: number;
  top: number;
  color: string;
  maxOpacity: number;
  durationMs: number;
  delayMs: number;
  driftPx: number;
}

function Particle({ spec, reduced }: { spec: ParticleSpec; reduced: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.value = 0.3; // sabit, görünür bir duruş
      return;
    }
    progress.value = withDelay(
      spec.delayMs,
      withRepeat(
        withTiming(1, { duration: spec.durationMs, easing: Easing.linear }),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, [progress, reduced, spec.delayMs, spec.durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25, 0.75, 1], [0, spec.maxOpacity, spec.maxOpacity, 0]),
    transform: [{ translateY: -progress.value * spec.driftPx }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          left: spec.left,
          top: spec.top,
          backgroundColor: spec.color,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Arka planda yavaşça yukarı süzülen parçacıklar. Splash ekranında
 * absolute olarak en alta yerleştirilir; dokunma olaylarını geçirir.
 */
export default function ParticleField({ count = 20, height }: ParticleFieldProps) {
  const { width, height: screenHeight } = useWindowDimensions();
  const motion = useMotion();
  const fieldHeight = height ?? screenHeight;

  // Rastgele değerler bir kez üretilir; her render'da zıplamasınlar.
  const specs = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: count }, () => {
        const size = 4 + Math.random() * 4; // 4-8px
        return {
          size,
          left: Math.random() * (width - size),
          top: Math.random() * fieldHeight,
          color: Math.random() > 0.5 ? colors.pulse : colors.glow,
          maxOpacity: 0.25 + Math.random() * 0.35, // ~0.25-0.6
          durationMs: 9000 + Math.random() * 9000,
          delayMs: Math.random() * 6000,
          driftPx: 120 + Math.random() * 220,
        };
      }),
    [count, width, fieldHeight]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {specs.map((spec, i) => (
        <Particle key={i} spec={spec} reduced={motion.reduced} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute' },
});
