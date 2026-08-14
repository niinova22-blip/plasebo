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

const FONT_SIZE = 48;
const LINE = 62;
/** Geçiş, sayacın kendi ritmine yakın: hareket bitmeden yenisi başlamıyor. */
const DURATION = 780;

/**
 * Ritüeldeki geri sayım — aşağı doğru akan sayı.
 *
 * Tasarım tarihçesi, çünkü burası üç kez değişti:
 *
 *   1. İlk sürüm her saniye 1.2 kata büyüyüp yerine oturuyordu. Sayının
 *      zıplaması, tam da sabit kalması istenen bir ekranda gözü çekiyordu.
 *   2. İkincisi ölçek yerine sönümlenme kullandı; bu da "yanıp sönme"
 *      gibi okundu.
 *   3. Üçüncüsü çapraz geçişti ama iki metin de kısa mesafede hareket
 *      ettiği için kesik kesik görünüyordu.
 *
 * Şimdiki hâl bir **sayaç şeridi**: sayılar tek bir pencerenin içinde,
 * tam satır yüksekliği kadar aşağı kayıyor. Giden sayı pencereden aşağı
 * çıkarken yeni sayı yukarıdan aynı hizaya iniyor; ikisi de aynı anda,
 * aynı hızda. Pencere `overflow: hidden` olduğu için sayılar kenarda
 * belirip kaybolmuyor, şerit gerçekten akıyormuş gibi duruyor.
 */
export default function CountdownNumber({ value, style }: CountdownNumberProps) {
  const motion = useMotion();

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
      // Yavaşlayarak duran bir kayma: şerit "yerine oturuyor" hissi verir,
      // sabit hızda kaysa mekanik görünürdü.
      easing: Easing.out(Easing.cubic),
    });
  }, [value, motion.reduced, progress]);

  // Gelen sayı: bir satır yukarıdan sıfır konumuna iner.
  const incoming = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (progress.value - 1) * LINE }],
  }));

  // Giden sayı: sıfır konumundan bir satır aşağı süzülüp pencereden çıkar.
  const outgoing = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: progress.value * LINE }],
  }));

  return (
    <View style={styles.window}>
      {previous !== null ? (
        <Animated.Text
          style={[styles.text, styles.layer, style, outgoing]}
          numberOfLines={1}
        >
          {previous}
        </Animated.Text>
      ) : null}
      <Animated.Text
        style={[styles.text, styles.layer, style, incoming]}
        numberOfLines={1}
      >
        {current}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sayıların içinde aktığı pencere. Yüksekliği tam bir satır: dışına
  // taşan her şey kırpılır, böylece kayma bir şerit hareketi gibi okunur.
  window: {
    height: LINE,
    alignSelf: 'stretch',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: FONT_SIZE,
    lineHeight: LINE,
    color: colors.pulse,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
