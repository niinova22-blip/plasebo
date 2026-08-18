import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ParticleField from '../components/ParticleField';
import PotionVessel from '../components/PotionVessel';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Examination'>;

/**
 * Aşamalar ve başlangıç anları (ms). Toplam ~8.5 saniye: iksirin
 * hazırlanması gerçekten bir işlem gibi dursun diye bilerek uzun.
 */
const STAGES: { text: string; at: number }[] = [
  { text: 'Şikayet analiz ediliyor...', at: 0 },
  { text: 'Arşiv taranıyor, sayfalar karıştırılıyor...', at: 1700 },
  { text: 'Bileşenler kaba dökülüyor...', at: 3400 },
  { text: 'Karışım demleniyor...', at: 5300 },
  { text: 'Formülün mühürleniyor...', at: 7000 },
];
const TOTAL_MS = 8500;

/**
 * Sahte muayene / iksir hazırlama ekranı.
 *
 * Hiçbir hesap yapılmıyor; ekranın tamamı bir bekleme töreni. Kap
 * (`PotionVessel`) dolarken metinler değişiyor, sonunda formül
 * mühürlenip reçeteye geçiliyor. Altındaki dipnot bunun plasebo
 * olduğunu söylüyor.
 */
export default function ExaminationScreen({ navigation, route }: Props) {
  const t = useT();
  const motion = useMotion();
  const complaint = resolveComplaint(route.params.complaintId, route.params.customText);
  const [stage, setStage] = useState(0);

  const fade = useSharedValue(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGES.slice(1).forEach((s, i) => {
      timers.push(
        setTimeout(() => {
          setStage(i + 1);
          haptics.tap();
        }, s.at)
      );
    });

    timers.push(setTimeout(() => haptics.step(), TOTAL_MS - 900));
    timers.push(
      setTimeout(() => {
        if (!motion.reduced) {
          fade.value = withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) });
        }
      }, TOTAL_MS - 300)
    );
    timers.push(
      setTimeout(() => {
        navigation.replace('Prescription', {
          complaintId: route.params.complaintId,
          customText: route.params.customText,
        });
      }, TOTAL_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [
    navigation,
    route.params.complaintId,
    route.params.customText,
    motion.reduced,
    fade,
  ]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: 0.95 + fade.value * 0.05 }],
  }));

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={12} />

      <Animated.View style={[styles.center, screenStyle]}>
        <PotionVessel totalMs={TOTAL_MS} reduced={motion.reduced} />

        <Text style={styles.stage}>{t(STAGES[stage].text)}</Text>
        {complaint ? <Text style={styles.complaint}>{t(complaint.label)}</Text> : null}
      </Animated.View>

      <Text style={styles.footnote}>
        {t('⚗️ Bu analiz de plasebo. Burada hesaplanan hiçbir şey yok — yalnızca beklemek var.')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between', paddingHorizontal: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stage: {
    fontFamily: fonts.sans,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.haze,
    marginTop: 38,
    textAlign: 'center',
  },
  complaint: {
    fontFamily: fonts.serifItalic,
    fontSize: 13,
    color: colors.mist,
    opacity: 0.5,
    marginTop: 10,
    textAlign: 'center',
  },
  footnote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.glow,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
});
