import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import RadialGlow from './RadialGlow';

export interface ScoreBigProps {
  score: number;
  improvement: number; // yüzde
  comparedDays: number;
}

export default function ScoreBig({ score, improvement, comparedDays }: ScoreBigProps) {
  const theme = useTheme();
  const t = useT();
  const positive = improvement >= 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.inkCard }]}>
      <RadialGlow
        id="scoreGlow"
        size={200}
        color={colors.glow}
        intensity={0.22}
        style={styles.glow}
      />
      <Text style={styles.score}>{score}</Text>
      <View style={styles.right}>
        <Text style={styles.label}>{t('Genel Etki Skoru')}</Text>
        {/* Karşılaştıracak veri yokken "%0 iyileşme" göstermek yanıltıcı olur. */}
        {comparedDays > 0 ? (
          <>
            <Text style={[styles.delta, !positive && { color: colors.warn }]}>
              {positive ? '↑' : '↓'} %{Math.abs(improvement)}{' '}
              {t(positive ? 'iyileşme' : 'düşüş')}
            </Text>
            <Text style={styles.note}>
              {t('{gun} gün öncesine göre', { gun: comparedDays })}
            </Text>
          </>
        ) : (
          <Text style={styles.note}>
            {t('Karşılaştırma için veri toplanıyor — birkaç ritüel daha.')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: -90, left: -70 },
  score: {
    fontFamily: fonts.serif,
    fontSize: 52,
    lineHeight: 60,
    color: colors.glow,
    marginRight: 18,
  },
  right: { flex: 1 },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.white,
  },
  delta: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.glow,
    marginTop: 4,
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.white,
    opacity: 0.3,
    marginTop: 4,
  },
});
