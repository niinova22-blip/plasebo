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
import { useT } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preparation'>;

/** Aşamalar ve başlangıç anları (ms). Toplam 7.5 saniye. */
const STAGES: { text: string; at: number }[] = [
  { text: 'Kayıt açılıyor...', at: 0 },
  { text: 'Dört temel formülün hazırlanıyor', at: 1500 },
  { text: 'Renkler ve sesler eşleştiriliyor...', at: 3000 },
  { text: 'Nefes desenleri ayarlanıyor...', at: 4500 },
  { text: 'Günlük formüllerin mühürleniyor...', at: 6000 },
];
const TOTAL_MS = 7500;

/**
 * Kurulumun son töreni: dört günlük formülün "hazırlanması".
 *
 * Muayene ekranıyla aynı kabı kullanıyor (`PotionVessel`), yalnızca
 * metinler farklı. İşlevsel olarak hiçbir şey hesaplanmıyor — formüller
 * zaten tarihten deterministik olarak üretiliyor. Buradaki bekleme, ilk
 * açılışta uygulamanın ne vaat ettiğini bir kez de göstererek kuruyor:
 * dört formül, her gün yenilenen.
 */
export default function PreparationScreen({ navigation }: Props) {
  const t = useT();
  const motion = useMotion();
  const { user } = useUser();
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

    timers.push(setTimeout(() => haptics.success(), TOTAL_MS - 900));
    timers.push(
      setTimeout(() => {
        if (!motion.reduced) {
          fade.value = withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) });
        }
      }, TOTAL_MS - 300)
    );
    timers.push(
      setTimeout(() => {
        // Kurulumdan sonraki ilk ekran sikayet sorusu: kisisellestirme
        // beklenti etkisini hemen tetikliyor. Ana ekran altta duruyor ki
        // geri tusu bosluga dusmesin.
        navigation.reset({
          index: 1,
          routes: [{ name: 'Main' }, { name: 'Complaint' }],
        });
      }, TOTAL_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [navigation, motion.reduced, fade]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: 0.95 + fade.value * 0.05 }],
  }));

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={14} />

      <Animated.View style={[styles.center, screenStyle]}>
        <PotionVessel totalMs={TOTAL_MS} reduced={motion.reduced} color={colors.glow} />

        <Text style={styles.stage}>{t(STAGES[stage].text)}</Text>
        <Text style={styles.name}>
          {user.name
            ? t('{ad} için kişisel olarak hazırlanıyor', { ad: user.name })
            : t('Senin için kişisel olarak hazırlanıyor')}
        </Text>
      </Animated.View>

      <Text style={styles.footnote}>
        {t('⚗️ Hazırlanan şey bir ilaç değil, bir ritüel. Etkiyi kuran beklenti.')}
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
  name: {
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
