import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import ScoreSlider from '../components/ScoreSlider';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreBefore'>;

/**
 * Ritüel öncesi ölçüm.
 *
 * Ölçek bilerek ters: yüksek puan **kötü** (çok dağınık, çok gergin).
 * Böylece ritüel sonrası düşen sayı doğrudan "azaldı" olarak okunuyor ve
 * iki ekran arasındaki fark tek bakışta anlaşılıyor.
 */
export default function ScoreBeforeScreen({ navigation, route }: Props) {
  const t = useT();
  const complaint = resolveComplaint(route.params.complaintId, route.params.customText);
  const [score, setScore] = useState(6);

  return (
    <Screen background={colors.ink} style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{t('RİTÜEL ÖNCESİ ÖLÇÜM')}</Text>
        <Text style={styles.question}>
          {t(complaint?.measureQuestion ?? 'Şu an nasılsın?')}
        </Text>

        <Text style={styles.value}>{score}</Text>
        <Text style={styles.scale}>{t('1 = hiç yok  ·  10 = dayanılmaz')}</Text>

        <View style={styles.sliderWrap}>
          <ScoreSlider value={score} onChange={setScore} />
        </View>

        <TransparencyPill
          style={styles.pill}
          text={t('⚗️ Bu ölçüm senin izlenimin — plasebo araştırmalarının ölçtüğü de bu.')}
        />
      </View>

      <PressableScale
        onPress={() => {
          haptics.tap();
          navigation.navigate('Ritual', {
            formula: route.params.formula,
            complaintId: route.params.complaintId,
            customText: route.params.customText,
            scoreBefore: score,
          });
        }}
        accessibilityRole="button"
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t('Ölçüm Tamam')}</Text>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, justifyContent: 'space-between' },
  body: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.haze,
    textAlign: 'center',
  },
  question: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    marginTop: 10,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.pulse,
    textAlign: 'center',
    marginTop: 28,
    includeFontPadding: false,
  },
  scale: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.haze,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  sliderWrap: { marginTop: 20 },
  pill: { marginTop: 28 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
});
