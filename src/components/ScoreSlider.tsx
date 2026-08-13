import React, { useCallback, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useMotion } from '../hooks/useMotion';
import { useT } from '../context/SettingsContext';

const THUMB = 28;

export interface ScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/**
 * 1-10 arası puan seçici. Parmak hareketi UI thread'de takip edilir,
 * yalnızca seçilen tam sayı değiştiğinde JS tarafına haber verilir.
 */
export default function ScoreSlider({
  value,
  onChange,
  min = 1,
  max = 10,
}: ScoreSliderProps) {
  const motion = useMotion();
  const t = useT();
  const trackWidth = useSharedValue(0);
  const ratio = useSharedValue((value - min) / (max - min));

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    },
    [trackWidth]
  );

  const commit = useCallback(
    (next: number) => {
      if (next !== value) onChange(next);
    },
    [onChange, value]
  );

  /** Oranı en yakın tam puana çevirir. */
  const snapped = useDerivedValue(() => {
    'worklet';
    return Math.round(min + ratio.value * (max - min));
  }, [min, max]);

  // Aynı puanı defalarca JS tarafına göndermemek için son bildirilen değer.
  const lastReported = useSharedValue(value);

  const gesture = useMemo(() => {
    const apply = (x: number) => {
      'worklet';
      if (trackWidth.value <= 0) return;
      const clamped = Math.min(Math.max(x, 0), trackWidth.value);
      ratio.value = clamped / trackWidth.value;
      const next = Math.round(min + ratio.value * (max - min));
      if (next !== lastReported.value) {
        lastReported.value = next;
        runOnJS(commit)(next);
      }
    };

    return Gesture.Simultaneous(
      Gesture.Pan()
        .onBegin((e) => apply(e.x))
        .onUpdate((e) => apply(e.x)),
      Gesture.Tap().onEnd((e) => apply(e.x))
    );
  }, [commit, lastReported, max, min, ratio, trackWidth]);

  // Parmak bırakıldığında en yakın puana oturması için hedef oran.
  const targetRatio = useDerivedValue(() => {
    'worklet';
    return (snapped.value - min) / (max - min);
  }, [min, max]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${targetRatio.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => {
    const x = targetRatio.value * trackWidth.value - THUMB / 2;
    return {
      transform: [
        { translateX: motion.reduced ? x : withSpring(x, { damping: 18, stiffness: 220 }) },
      ],
    };
  });

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.hint}>{t('hiç')}</Text>
        <Text style={styles.value}>{value}/10</Text>
        <Text style={styles.hint}>{t('çok')}</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.hitArea} onLayout={onLayout}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>

      <View style={styles.ticks}>
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <View
            key={i}
            style={[styles.tick, i + min <= value && { backgroundColor: colors.pulse }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  hint: { fontFamily: fonts.sans, fontSize: 11, color: colors.haze },
  value: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.white },
  hitArea: { height: THUMB, justifyContent: 'center' },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.pulse, borderRadius: 3 },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.pulse,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tick: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
