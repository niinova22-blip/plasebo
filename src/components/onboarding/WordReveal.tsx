import React, { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useMotion } from '../../hooks/useMotion';

function Word({
  text,
  index,
  active,
  delay,
  style,
}: {
  text: string;
  index: number;
  active: boolean;
  delay: number;
  style?: StyleProp<TextStyle>;
}) {
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
    progress.value = withDelay(delay + index * 50, withTiming(1, { duration: 260 }));
  }, [active, delay, index, motion.reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 6 }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={style}>{text}</Text>
    </Animated.View>
  );
}

export interface WordRevealProps {
  text: string;
  active: boolean;
  /** İlk kelimeden önceki bekleme. */
  delay?: number;
  style?: StyleProp<TextStyle>;
  align?: 'left' | 'center';
}

/**
 * Metni kelime kelime açar — her kelime bir öncekinden 50 ms sonra.
 *
 * Tek bir `Text` içinde bunu yapmanın yolu yok: opaklık harf/kelime
 * düzeyinde animasyonlanamıyor. Bu yüzden metin kelimelere bölünüp her
 * biri kendi görünümüne sarılıyor ve satır kırma `flexWrap` ile
 * yapılıyor. Kelime aralarındaki boşluk sarmalayıcıların kenar boşluğuyla
 * korunuyor.
 */
export default function WordReveal({
  text,
  active,
  delay = 0,
  style,
  align = 'left',
}: WordRevealProps) {
  const words = text.split(' ').filter(Boolean);
  return (
    <View style={[styles.row, align === 'center' && styles.center]}>
      {words.map((word, i) => (
        <View key={`${word}-${i}`} style={styles.word}>
          <Word text={word} index={i} active={active} delay={delay} style={style} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  center: { justifyContent: 'center' },
  word: { marginRight: 6 },
});
