import React from 'react';
import { Pressable, StyleProp, ViewStyle, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useMotion } from '../hooks/useMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Basılıyken küçülme oranı. Kartlar için 0.98, butonlar için 0.96. */
  pressedScale?: number;
}

/**
 * Tüm dokunulabilir yüzeylerin ortak micro-interaction'ı:
 * onPressIn 100ms ile küçülür, onPressOut spring ile geri döner.
 */
export default function PressableScale({
  children,
  style,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const motion = useMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        if (!motion.reduced) {
          scale.value = withTiming(pressedScale, { duration: 100 });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = motion.reduced
          ? 1
          : withSpring(1, { damping: 15, stiffness: 220, mass: 0.5 });
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
