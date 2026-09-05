import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';

/**
 * Ölçüm defteri grafiği — her gün için iki ince çubuk: ritüel öncesi ve
 * ritüel sonrası ölçüm.
 *
 * Neden iki çizgi değil de iki çubuk: çizgi çizmek için SVG/Skia gerekiyor
 * ve proje bilerek onlarsız duruyor (bkz. `ChartArea` notu). Ayrıca çizgi,
 * veri olmayan günleri birleştirip olmayan bir süreklilik uyduruyordu.
 * Çubuklarda boş gün boş kalıyor — ölçüm yoksa "ölçüm yok" görünüyor.
 */

const MAX_HEIGHT = 92;
const STAGGER_MS = 60;
/** Ölçek sabit: 1-10, yüksek = kötü. Göreli ölçek farkı büyütüp yanıltırdı. */
const SCALE_MAX = 10;

export interface LedgerPoint {
  date: string;
  label: string;
  before: number | null;
  after: number | null;
}

function MiniBar({
  value,
  color,
  index,
}: {
  value: number | null;
  color: string;
  index: number;
}) {
  const motion = useMotion();
  const theme = useTheme();
  const grow = useSharedValue(motion.reduced ? 1 : 0);

  useEffect(() => {
    if (motion.reduced) {
      grow.value = 1;
      return;
    }
    grow.value = withDelay(index * STAGGER_MS, withSpring(1, { damping: 13, stiffness: 90 }));
  }, [grow, index, motion.reduced]);

  const height = value == null ? 3 : Math.max(5, (value / SCALE_MAX) * MAX_HEIGHT);
  const style = useAnimatedStyle(() => ({ height, transform: [{ scaleY: grow.value }] }));

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: value == null ? theme.border : color },
        style,
      ]}
    />
  );
}

export default function LedgerChart({ data }: { data: LedgerPoint[] }) {
  const theme = useTheme();
  const t = useT();
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected != null ? data[selected] : null;

  return (
    <View>
      <View style={styles.legend}>
        <LegendDot color={theme.pulse} label={t('Ritüel öncesi')} />
        <LegendDot color={theme.glow} label={t('Ritüel sonrası')} />
      </View>

      <View style={styles.chart}>
        {data.map((point, i) => (
          <Pressable
            key={point.date}
            style={styles.slot}
            onPress={() => setSelected((prev) => (prev === i ? null : i))}
            accessibilityRole="button"
            accessibilityLabel={t('{gun}: öncesi {once}, sonrası {sonra}', {
              gun: t(point.label),
              once: point.before?.toFixed(1) ?? t('yok'),
              sonra: point.after?.toFixed(1) ?? t('yok'),
            })}
          >
            <View style={styles.pair}>
              <MiniBar value={point.before} color={theme.pulse} index={i} />
              <MiniBar value={point.after} color={theme.glow} index={i} />
            </View>
            <Text
              style={[
                styles.dayLabel,
                { color: selected === i ? theme.text : theme.faint },
              ]}
            >
              {t(point.label)}
            </Text>
          </Pressable>
        ))}
      </View>

      {active ? (
        <Text style={[styles.readout, { color: theme.sub }]}>
          {active.before == null && active.after == null
            ? t('{tarih} · ölçüm yok', { tarih: active.date })
            : t('{tarih} · öncesi {once} · sonrası {sonra}', {
                tarih: active.date,
                once: active.before?.toFixed(1) ?? '—',
                sonra: active.after?.toFixed(1) ?? '—',
              })}
        </Text>
      ) : (
        <Text style={[styles.readout, { color: theme.faint }]}>
          {t('Bir güne dokun — o günün iki ölçümünü göster. Ölçek: 1 = hiç yok, 10 = dayanılmaz.')}
        </Text>
      )}
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: theme.sub }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontFamily: fonts.sans, fontSize: 10 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  slot: { flex: 1, alignItems: 'center' },
  pair: {
    height: MAX_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: { width: 5, borderRadius: 3, transformOrigin: 'bottom' },
  dayLabel: { fontFamily: fonts.sans, fontSize: 9, marginTop: 6 },
  readout: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 12,
  },
});
