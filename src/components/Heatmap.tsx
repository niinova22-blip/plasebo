import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';

export interface HeatmapDay {
  date: string;
  score: number; // 0-10
  /** Cihazda ölçülen objektif sinyal (0-10); veri yoksa 0. */
  objectiveScore?: number;
  frozen: boolean;
}

export interface HeatmapProps {
  days: HeatmapDay[];
  /** Satır başına gün sayısı. */
  columns?: number;
}

/**
 * Devamlılık ısı haritası. Kutunun koyuluğu o günün puanından gelir;
 * dondurulmuş günler kesikli çerçeveyle gösterilir.
 */
export default function Heatmap({ days, columns = 14 }: HeatmapProps) {
  const theme = useTheme();
  const t = useT();

  const rows: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += columns) {
    rows.push(days.slice(i, i + columns));
  }
  const hasObjective = days.some((d) => (d.objectiveScore ?? 0) > 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.label, { color: theme.sub }]}>{t('DEVAMLILIK')}</Text>

      <View style={styles.grid}>
        {rows.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((day) => {
              const filled = day.score > 0;
              // Puan 1-10 → %25-100 opaklık.
              const opacity = filled ? 0.25 + (day.score / 10) * 0.75 : 1;
              const objective = day.objectiveScore ?? 0;
              return (
                <View key={day.date} style={styles.cellWrap}>
                  <View
                    style={[
                      styles.cell,
                      filled
                        ? { backgroundColor: theme.pulse, opacity }
                        : { backgroundColor: theme.border },
                      day.frozen && !filled && {
                        borderWidth: 1,
                        borderColor: theme.pulse,
                        backgroundColor: 'transparent',
                      },
                    ]}
                  />
                  {hasObjective ? (
                    <View
                      style={[
                        styles.objectiveStrip,
                        {
                          backgroundColor:
                            objective > 0 ? theme.glow : 'transparent',
                          opacity: objective > 0 ? 0.35 + (objective / 10) * 0.65 : 1,
                        },
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.footnote, { color: theme.faint }]}>
        {hasObjective
          ? t(
              'Koyuluk günün puanı, alttaki şerit kamera/nefes/refleks ölçümü · çerçeveli kutular dondurulmuş günler'
            )
          : t('Koyuluk o günün puanı · çerçeveli kutular dondurulmuş günler')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20 },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
  },
  grid: { marginTop: 16, gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cellWrap: { flex: 1, maxWidth: 22 },
  cell: {
    aspectRatio: 1,
    borderRadius: 4,
  },
  objectiveStrip: {
    height: 3,
    borderRadius: 2,
    marginTop: 3,
  },
  footnote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    marginTop: 14,
  },
});
