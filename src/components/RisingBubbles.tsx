import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { useMotion } from '../hooks/useMotion';

/**
 * Ritüelin altından yükselen beyaz baloncuklar.
 *
 * Ekranda ölçülen ya da anlatılan bir şey değil — bakılacak bir zemin.
 * Ritüel boyunca hiç durmadan aynı hızda yükseliyorlar; gözün takip
 * edeceği yavaş ve tahmin edilebilir bir hareket, sayaç ve metinden
 * bağımsız olarak ekranın "durgun" hissetmesini sağlıyor.
 *
 * Hareketi azalt ayarı açıkken hiç çizilmiyorlar: bu ayarı açan kişi
 * tam olarak bu tür sürekli hareketten rahatsız oluyor.
 */

const COUNT = 14;

interface BubbleSpec {
  size: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

function Bubble({ spec, height }: { spec: BubbleSpec; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, { duration: spec.duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, [progress, spec.delay, spec.duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -height]) },
      {
        // Hafif yanal salınım: dümdüz yükselen daireler mekanik duruyor.
        translateX: Math.sin(progress.value * Math.PI * 2) * spec.drift,
      },
    ],
    // Yolun başında beliriyor, sonunda sönüyor; hiçbiri bir kenarda
    // aniden yok olmuyor.
    opacity: interpolate(
      progress.value,
      [0, 0.12, 0.75, 1],
      [0, spec.opacity, spec.opacity, 0]
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          left: spec.left,
        },
        style,
      ]}
    />
  );
}

export default function RisingBubbles() {
  const { width, height } = useWindowDimensions();
  const motion = useMotion();

  /**
   * Baloncukların özellikleri bir kez üretiliyor.
   *
   * Her render'da yeniden üretilseydi, ekran her saniye (geri sayım)
   * yeniden çizildiği için baloncuklar sürekli yer değiştirir ve
   * animasyon baştan başlardı.
   */
  const specs = useMemo<BubbleSpec[]>(() => {
    const list: BubbleSpec[] = [];
    for (let i = 0; i < COUNT; i++) {
      const size = 6 + Math.random() * 16;
      list.push({
        size,
        left: Math.random() * Math.max(1, width - size),
        duration: 9000 + Math.random() * 9000,
        delay: Math.random() * 9000,
        drift: 6 + Math.random() * 14,
        // Küçük baloncuk daha soluk: derinlik hissi bundan çıkıyor.
        opacity: 0.05 + (size / 22) * 0.12,
      });
    }
    return list;
  }, [width]);

  if (motion.reduced) return null;

  return (
    <View style={styles.layer} pointerEvents="none">
      {specs.map((spec, i) => (
        <Bubble key={i} spec={spec} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: '#FFFFFF',
  },
});
