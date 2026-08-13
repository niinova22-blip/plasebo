import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useMotion } from '../hooks/useMotion';

export interface AnimatedInProps {
  children: React.ReactNode;
  /** Giriş gecikmesi (ms) — staggered listeler için. */
  delay?: number;
  /** Başlangıç translateY mesafesi. */
  offsetY?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mount girişi: translateY spring (damping 15, stiffness 100) +
 * 300ms opacity. Ana ekrandaki bloklar bunu gecikmelerle kullanıyor.
 */
export default function AnimatedIn({
  children,
  delay = 0,
  offsetY = 40,
  style,
}: AnimatedInProps) {
  const motion = useMotion();
  const translate = useSharedValue(motion.reduced ? 0 : offsetY);
  const opacity = useSharedValue(motion.reduced ? 1 : 0);

  useEffect(() => {
    if (motion.reduced) {
      translate.value = 0;
      opacity.value = 1;
      return;
    }
    translate.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [delay, motion.reduced, translate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
