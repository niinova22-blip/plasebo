import React, { useEffect } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useMotion } from '../hooks/useMotion';

export interface CountdownNumberProps {
  /** Ekranda görünecek metin (saniye ya da "1:30" gibi). */
  value: string;
  style?: TextStyle;
}

/**
 * Ritüeldeki geri sayım.
 *
 * Önceki sürüm her saniye 1.2 kata büyüyüp yerine oturuyordu. Sayının
 * saniyede bir zıplaması, tam da sabit kalması istenen bir ekranda gözü
 * kendine çekiyor ve odağı bozuyordu — ritüelin amacı dikkati renkte,
 * seste ya da nefeste tutmak, sayaçta değil.
 *
 * Bu yüzden ölçek animasyonu kaldırıldı: sayı yerinde duruyor, yalnızca
 * değeri değişirken çok kısa bir sönümlenme yapıyor. Hareket görülüyor
 * ama bakışı çekmiyor. "Hareketi azalt" açıksa o da yok.
 */
export default function CountdownNumber({ value, style }: CountdownNumberProps) {
  const motion = useMotion();
  const fade = useSharedValue(1);

  useEffect(() => {
    if (motion.reduced) {
      fade.value = 1;
      return;
    }
    // Yeni değer hafifçe sönük başlar ve yerinde açılır; konum sabit.
    fade.value = 0.55;
    fade.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) });
  }, [value, motion.reduced, fade]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.text, style]}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.pulse,
    textAlign: 'center',
    // Sayı basamak değiştirdiğinde satır yüksekliği oynamasın.
    lineHeight: 58,
    includeFontPadding: false,
  },
});
