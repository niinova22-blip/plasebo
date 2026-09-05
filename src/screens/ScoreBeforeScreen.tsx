import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import ScoreSlider from '../components/ScoreSlider';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts, type as typeScale } from '../constants/typography';
import { radius, space, SCREEN_PADDING } from '../constants/layout';
import { resolveComplaint } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreBefore'>;

/**
 * Ritüel öncesi **elle** ölçüm.
 *
 * Ölçümün asıl yolu yüz taraması: kamera önce ve sonra aynı yöntemle
 * ölçtüğü için aradaki fark tek bir cinsten oluyor. Bu ekran onun yerine
 * geçen yol ve üç durumda açılıyor — ücretsiz kademede günlük tarama
 * hakkı bittiğinde, kamera izni verilmediğinde, yüz okunamadığında.
 *
 * Bir süre hiç yoktu: slider kaldırılmış, başlangıç puanı yalnızca
 * kameradan alınır olmuştu. Sonucu şuydu — kamera iznini vermeyen
 * kullanıcı "Evet, uygula" düğmesine bastığında modal açılıyor,
 * "Vazgeç"ten başka düğme bulamıyor ve ritüele hiç giremiyordu. Ölçümün
 * tek bir yola bağlanması, o yol kapandığında uygulamanın tamamını
 * kapatıyor. Bu yüzden geri geldi ve bundan sonra da kalacak.
 *
 * Ölçek bilerek ters: yüksek puan **kötü** (çok dağınık, çok gergin).
 * Böylece ritüel sonrası düşen sayı doğrudan "azaldı" olarak okunuyor ve
 * iki ekran arasındaki fark tek bakışta anlaşılıyor. Kameradan çıkan
 * skor da aynı yönde, yani iki yöntem aynı ölçeği paylaşıyor.
 */
export default function ScoreBeforeScreen({ navigation, route }: Props) {
  const t = useT();
  const complaint = resolveComplaint(route.params.complaintId, route.params.customText);
  const [score, setScore] = useState(6);

  return (
    <Screen background={colors.ink} style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{t('RİTÜEL ÖNCESİ ÖLÇÜM')}</Text>
        {/* Şikayete özel soru cümleleri kaldırılmıştı (`measureQuestion`
            alanı artık yok); geriye tek bir doğru soru kalıyor ve
            şikayetin kendisi hemen altında zaten yazıyor. */}
        <Text style={styles.question}>{t('Şu an nasılsın?')}</Text>
        {complaint ? (
          <Text style={styles.complaint}>“{t(complaint.label)}”</Text>
        ) : null}

        <Text style={styles.value}>{score}</Text>
        <Text style={styles.scale}>{t('1 = hiç yok  ·  10 = dayanılmaz')}</Text>

        <View style={styles.sliderWrap}>
          <ScoreSlider value={score} onChange={setScore} />
        </View>

        <TransparencyPill
          style={styles.pill}
          text={t('⚗️ Bu ölçüm senin izlenimin. Araştırmalarda ölçülen de tam olarak bu.')}
        />
      </View>

      <PressableScale
        onPress={() => {
          haptics.tap();
          // `faceMoodScore` bilerek gönderilmiyor: bu sayı bir ölçüm
          // değil, beyan. Sonraki ekranlar ikisini ayırt edebilsin diye
          // yalnız `scoreBefore` doluyor — istatistikte "kamerayla
          // ölçülmüş" ile "kendi puanı" aynı kefeye girmemeli.
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
        <Text style={styles.buttonText}>{t('Ölçüm tamam')}</Text>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SCREEN_PADDING, justifyContent: 'space-between' },
  body: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: typeScale.micro,
    letterSpacing: 2,
    color: colors.haze,
    textAlign: 'center',
  },
  question: {
    fontFamily: fonts.serif,
    fontSize: typeScale.display,
    color: colors.white,
    textAlign: 'center',
    marginTop: space.sm,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: typeScale.hero,
    color: colors.pulse,
    textAlign: 'center',
    marginTop: space.xxl,
    includeFontPadding: false,
  },
  scale: {
    fontFamily: fonts.sans,
    fontSize: typeScale.micro,
    color: colors.haze,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: space.xs,
  },
  complaint: {
    fontFamily: fonts.sans,
    fontSize: typeScale.small,
    color: colors.haze,
    textAlign: 'center',
    marginTop: space.sm,
  },
  sliderWrap: { marginTop: space.xl },
  pill: { marginTop: space.section },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
    marginBottom: space.xl,
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: typeScale.bodyLg,
    color: colors.white,
  },
});
