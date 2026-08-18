import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useMotion } from '../../hooks/useMotion';

export interface RevealProps {
  /**
   * Slayt ekranda mı? Animasyon yalnızca görünür olunca başlar; slayt
   * geride kalınca sıfırlanır, böylece geri swipe edildiğinde giriş
   * yeniden oynar.
   */
  active: boolean;
  delay?: number;
  /** Aşağıdan yukarı giriş mesafesi. */
  offsetY?: number;
  /** Verilirse ölçek animasyonu da uygulanır (illüstrasyonlar için). */
  scaleFrom?: number;
  /** Yaylı giriş — ölçekli girişlerde daha canlı duruyor. */
  spring?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Onboarding slaytlarının ortak giriş animasyonu.
 *
 * `AnimatedIn` yalnızca mount anında çalışıyor; slaytlar ise yatay bir
 * ScrollView içinde hep birlikte monte olduğu için ona uygun değil.
 * Buradaki sürüm `active` bayrağını izler: slayt görünür olduğunda
 * ilerler, görünmez olduğunda başa sarar.
 */
export default function Reveal({
  active,
  delay = 0,
  offsetY = 0,
  scaleFrom,
  spring = false,
  style,
  children,
}: RevealProps) {
  const motion = useMotion();
  const progress = useSharedValue(motion.reduced ? 1 : 0);

  useEffect(() => {
    if (motion.reduced) {
      progress.value = 1;
      return;
    }
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = withDelay(
      delay,
      spring
        ? withSpring(1, { damping: 13, stiffness: 120 })
        : withTiming(1, { duration: 400 })
    );
  }, [active, delay, motion.reduced, progress, spring]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      // Yay biraz aşarak geldiği için opaklık ayrıca sınırlanıyor.
      opacity: Math.min(1, Math.max(0, p)),
      // İki dönüşüm de her zaman veriliyor; kullanılmayanın değeri nötr
      // (0 ve 1). Koşullu bir dizi kurmak, tip tarafında her girdinin tek
      // anahtarlı olması şartıyla çakışıyor.
      transform: [
        { translateY: offsetY ? (1 - p) * offsetY : 0 },
        { scale: scaleFrom !== undefined ? scaleFrom + (1 - scaleFrom) * p : 1 },
      ],
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
