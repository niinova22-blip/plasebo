import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import PressableScale from '../PressableScale';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useMotion } from '../../hooks/useMotion';

export interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  /** Tam genişlik ve daha kalın: son slayttaki "Başlayalım" için. */
  full?: boolean;
  disabled?: boolean;
  /** Basıldıktan sonraki kısa bekleme — nabız gibi atar. */
  loading?: boolean;
}

export default function OnboardingButton({
  label,
  onPress,
  full = false,
  disabled = false,
  loading = false,
}: OnboardingButtonProps) {
  const motion = useMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!loading || motion.reduced) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(0.55, { duration: 400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(pulse);
  }, [loading, motion.reduced, pulse]);

  /**
   * Sönüklük de buradan geliyor: `styles.disabled` ile ayrı bir opaklık
   * vermek işe yaramıyordu, çünkü animasyonlu stil dizinin sonunda durup
   * onu eziyordu ve devre dışı düğme tam parlak görünüyordu.
   */
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * (disabled ? 0.4 : 1),
  }));

  const body = (
    <Animated.View
      style={[styles.base, full ? styles.full : styles.compact, pulseStyle]}
    >
      <Text style={[styles.label, full && styles.labelFull]}>{label}</Text>
    </Animated.View>
  );

  // Devre dışıyken dokunma tamamen kapalı: sönük ama basılabilir bir
  // düğme, kullanıcıya neyin eksik olduğunu anlatmıyor.
  if (disabled) return <View>{body}</View>;

  return (
    <PressableScale onPress={onPress} accessibilityRole="button" disabled={loading}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.pulse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 34,
    alignSelf: 'center',
  },
  full: {
    borderRadius: 16,
    paddingVertical: 18,
    alignSelf: 'stretch',
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  labelFull: { fontSize: 16 },
});
