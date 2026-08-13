import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';

/**
 * Günlük etki bar chart'ı.
 *
 * Not: Tasarımda Victory Native belirtilmişti; Victory Native XL
 * @shopify/react-native-skia gerektiriyor ve Skia Expo Go'da çalışmıyor.
 * "Expo Go ile test edilebilir olsun" şartını korumak için grafik
 * Reanimated ile elde çizildi.
 */

const MAX_HEIGHT = 120;
const STAGGER_MS = 80;

export interface ChartPoint {
  label: string;
  score: number; // 0-10
  /** Tooltip'te gösterilecek tarih. */
  date?: string;
}

export interface ChartAreaProps {
  data: ChartPoint[];
}

function Bar({
  point,
  index,
  ratio,
  isBest,
  selected,
  onSelect,
}: {
  point: ChartPoint;
  index: number;
  ratio: number;
  isBest: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const motion = useMotion();
  const theme = useTheme();
  const t = useT();
  const grow = useSharedValue(motion.reduced ? 1 : 0);
  const highlight = useSharedValue(0);
  const empty = point.score <= 0;
  const targetHeight = Math.max(6, MAX_HEIGHT * ratio);

  useEffect(() => {
    if (motion.reduced) {
      grow.value = 1;
      return;
    }
    grow.value = withDelay(
      index * STAGGER_MS,
      withSpring(1, { damping: 12, stiffness: 80 })
    );
  }, [index, motion.reduced, grow]);

  useEffect(() => {
    highlight.value = motion.reduced
      ? selected
        ? 1
        : 0
      : withTiming(selected ? 1 : 0, { duration: 180 });
  }, [selected, motion.reduced, highlight]);

  const barStyle = useAnimatedStyle(() => ({
    height: targetHeight,
    transform: [{ scaleY: grow.value }, { scale: 1 + highlight.value * 0.05 }],
  }));

  const fill = empty
    ? theme.border
    : selected || isBest
      ? theme.glow
      : theme.pulse;

  return (
    <Pressable
      style={styles.barSlot}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={t('{gun}: {puan} puan', {
        gun: t(point.label),
        puan: point.score.toFixed(1),
      })}
    >
      <View style={styles.barTrack}>
        <Animated.View style={[styles.bar, { backgroundColor: fill }, barStyle]} />
      </View>
      <Text
        style={[
          styles.dayLabel,
          { color: theme.sub },
          (isBest || selected) && !empty && { fontFamily: fonts.sansBold, color: theme.text },
        ]}
      >
        {t(point.label)}
      </Text>
    </Pressable>
  );
}

export default function ChartArea({ data }: ChartAreaProps) {
  const theme = useTheme();
  const t = useT();
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.score), 1);
  const bestIndex = data.reduce(
    (best, d, i) => (d.score > data[best].score ? i : best),
    0
  );

  const active = selected !== null ? data[selected] : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.label, { color: theme.sub }]}>{t('GÜNLÜK ETKİ')}</Text>

      <View style={styles.chart}>
        {data.map((point, i) => (
          <Bar
            key={`${point.label}-${i}`}
            point={point}
            index={i}
            ratio={point.score > 0 ? point.score / max : 0.06}
            isBest={i === bestIndex && point.score > 0}
            selected={selected === i}
            onSelect={() => setSelected((prev) => (prev === i ? null : i))}
          />
        ))}
      </View>

      {active ? (
        <View style={[styles.tooltip, { backgroundColor: theme.inkCard }]}>
          <Text style={[styles.tooltipText, { color: theme.onInk }]}>
            {active.date ?? t(active.label)} ·{' '}
            {active.score > 0 ? `${active.score.toFixed(1)}/10` : t('ritüel yok')}
          </Text>
        </View>
      ) : (
        <Text style={[styles.footnote, { color: theme.faint }]}>
          {t('Bir bara dokun — o günün puanını göster.')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  barSlot: { flex: 1, alignItems: 'center' },
  barTrack: {
    height: MAX_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 18,
    borderRadius: 6,
    transformOrigin: 'bottom',
  },
  dayLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    marginTop: 8,
  },
  tooltip: {
    marginTop: 14,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tooltipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
  },
  footnote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    marginTop: 14,
    textAlign: 'center',
  },
});
