import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
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

const DURATION = 520;

/**
 * Ritüeldeki geri sayım.
 *
 * Tasarım tarihçesi, çünkü burası iki kez değişti:
 *
 *   1. İlk sürüm her saniye 1.2 kata büyüyüp yerine oturuyordu. Sayının
 *      saniyede bir zıplaması, tam da sabit kalması istenen bir ekranda
 *      gözü kendine çekiyordu.
 *   2. İkinci sürüm ölçeği kaldırıp yerine kısa bir sönümlenme koydu; bu
 *      da hâlâ "yanıp sönme" gibi okunuyordu, çünkü tek bir katman aynı
 *      yerde karararak açılıyordu.
 *
 * Şimdiki hâl bir **çapraz geçiş**: eski sayı yukarı doğru birkaç piksel
 * süzülerek silinirken yeni sayı aşağıdan aynı yere yerleşiyor. Göz
 * hareketi bir yön olarak algılıyor, kesik bir olay olarak değil; sayının
 * konumu ve boyutu hiç değişmiyor. "Hareketi azalt" açıksa geçiş yok,
 * sayı doğrudan değişiyor.
 */
export default function CountdownNumber({ value, style }: CountdownNumberProps) {
  const motion = useMotion();

  // Ekranda aynı anda iki metin var: giden ve gelen.
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<string | null>(null);
  const progress = useSharedValue(1);
  const lastValue = useRef(value);

  useEffect(() => {
    if (value === lastValue.current) return;

    if (motion.reduced) {
      lastValue.current = value;
      setCurrent(value);
      setPrevious(null);
      progress.value = 1;
      return;
    }

    setPrevious(lastValue.current);
    setCurrent(value);
    lastValue.current = value;

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: DURATION,
      // Yumuşak giriş-çıkış: geçişin başı ve sonu hissedilmiyor.
      easing: Easing.inOut(Easing.cubic),
    });
  }, [value, motion.reduced, progress]);

  const incoming = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  const outgoing = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: progress.value * -10 }],
  }));

  return (
    <View style={styles.wrap}>
      {previous !== null ? (
        <Animated.Text
          style={[styles.text, styles.layer, style, outgoing]}
          numberOfLines={1}
        >
          {previous}
        </Animated.Text>
      ) : null}
      <Animated.Text style={[styles.text, style, incoming]} numberOfLines={1}>
        {current}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Giden sayı, gelenin tam üstünde durur: yer değiştirme olmaz.
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
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
