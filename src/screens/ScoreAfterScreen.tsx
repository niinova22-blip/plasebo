import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import ScoreSlider from '../components/ScoreSlider';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { haptics } from '../utils/haptics';
import { newSessionId } from '../utils/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreAfter'>;

/**
 * Ritüel sonrası ölçüm.
 *
 * Aynı soru, aynı ölçek. Kullanıcı değeri seçtiği anda farkı gösteriyoruz
 * — kaydetmeden önce, çünkü asıl merak edilen şey bu. Kötüleşme de bir
 * sonuç olarak sunuluyor; "yanlış yaptın" demiyoruz.
 *
 * Kayıt burada yazılıyor: eski `score` alanı (yüksek = iyi) geriye dönük
 * uyum için `11 - scoreAfter` olarak türetiliyor, böylece istatistik ve
 * arşiv ekranları eski kayıtlarla birlikte çalışmaya devam ediyor.
 */
export default function ScoreAfterScreen({ navigation, route }: Props) {
  const t = useT();
  const { recordSession } = useUser();
  const { formula, complaintId, customText, scoreBefore, durationSeconds, steps } =
    route.params;
  const complaint = resolveComplaint(complaintId, customText);

  const [score, setScore] = useState(scoreBefore);
  const [touched, setTouched] = useState(false);

  const diff = scoreBefore - score;
  const percent = scoreBefore > 0 ? Math.round((diff / scoreBefore) * 100) : 0;

  const save = () => {
    haptics.success();
    recordSession({
      id: newSessionId(),
      date: formula.generatedAt,
      formulaId: formula.id,
      goal: formula.goal,
      // Eski ölçek: yüksek = iyi. Yeni ölçekte yüksek = kötü olduğu için
      // ters çevriliyor.
      score: Math.max(1, Math.min(10, 11 - score)),
      steps,
      formulaName: formula.name,
      colorHex: formula.color.hex,
      crisis: formula.crisis,
      sham: formula.sham,
      dose: formula.dose ?? 1,
      complaintId,
      // Serbest metin de saklanıyor: arşivde "kendi cümlen" satırının
      // ne olduğu sonradan okunabilsin diye.
      complaintText: customText,
      prescriptionName: complaint?.prescriptionName,
      scoreBefore,
      scoreAfter: score,
      durationSeconds,
    });
    navigation.replace('SessionSummary', {
      complaintId,
      customText,
      formula,
      scoreBefore,
      scoreAfter: score,
      durationSeconds,
    });
  };

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{t('RİTÜEL SONRASI ÖLÇÜM')}</Text>
        <Text style={styles.question}>
          {t(complaint?.measureQuestion ?? 'Şu an nasılsın?')}
        </Text>
        <Text style={styles.now}>{t('Şimdi nasılsın?')}</Text>

        {/* Kör testte sahte ritüel ancak burada açıklanır. */}
        {formula.sham ? (
          <View style={styles.reveal}>
            <Text style={styles.revealTitle}>{t('Bu bir sahte ritüeldi')}</Text>
            <Text style={styles.revealText}>
              {t(
                'Bugün sana renk, ses ya da nefes verilmedi — sadece bekledin. Kör test açık olduğu için bunu önceden söylemedik. Puanın, gerçek ritüel günlerinin ortalamasıyla İstatistik ekranında karşılaştırılacak.'
              )}
            </Text>
          </View>
        ) : null}

        <Text style={styles.value}>{score}</Text>
        <Text style={styles.scale}>{t('1 = hiç yok  ·  10 = dayanılmaz')}</Text>

        <View style={styles.sliderWrap}>
          <ScoreSlider
            value={score}
            onChange={(v) => {
              setScore(v);
              setTouched(true);
            }}
          />
        </View>

        {/* Fark, kaydetmeden önce görünür — asıl merak edilen bu. */}
        <View style={styles.deltaWrap}>
          {!touched ? (
            <Text style={[styles.delta, { color: colors.haze }]}>
              {t('Kaydırarak şu anki hâlini işaretle')}
            </Text>
          ) : diff > 0 ? (
            <>
              <Text style={[styles.delta, { color: colors.glow }]}>
                {t('↓ {fark} puan azaldı', { fark: diff })}
              </Text>
              <Text style={styles.deltaSub}>{t('%{yuzde} fark', { yuzde: percent })}</Text>
            </>
          ) : diff === 0 ? (
            <Text style={[styles.delta, { color: colors.haze }]}>
              {t('Değişim yok — bu da veri')}
            </Text>
          ) : (
            <Text style={[styles.delta, { color: colors.warn }]}>
              {t('Bugün zordu. Yarın tekrar dene.')}
            </Text>
          )}
        </View>
      </ScrollView>

      <PressableScale onPress={save} accessibilityRole="button" style={styles.button}>
        <Text style={styles.buttonText}>{t('Sonucu Gör')}</Text>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.glow,
    textAlign: 'center',
  },
  question: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    marginTop: 10,
  },
  now: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 6,
  },
  reveal: {
    borderWidth: 1,
    borderColor: colors.glow,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  revealTitle: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.glow },
  revealText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    color: colors.haze,
    marginTop: 6,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.pulse,
    textAlign: 'center',
    marginTop: 24,
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
  deltaWrap: { alignItems: 'center', marginTop: 26, minHeight: 46 },
  delta: { fontFamily: fonts.sansBold, fontSize: 16 },
  deltaSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
});
