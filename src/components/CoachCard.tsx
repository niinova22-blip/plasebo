import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../constants/typography';
import { COACH_TIPS } from '../constants/coach';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import PressableScale from './PressableScale';

/**
 * Ana ekrandaki rehber kartı.
 *
 * "Plasebo nedir, ne değildir, günlük hayata nasıl yerleştirilir" sorusunun
 * cevabı tek bir uzun ekrana sıkıştırılmak yerine buradan parça parça
 * veriliyor: kart her dokunuşta sıradaki ipucuna geçiyor. Başlangıç
 * noktası güne göre kayıyor, yani uygulamayı her açan aynı cümleyle
 * karşılaşmıyor.
 */
export default function CoachCard() {
  const theme = useTheme();
  const t = useT();
  const motion = useMotion();

  // Gün numarasına göre farklı bir yerden başla — her gün başka bir ipucu.
  const [index, setIndex] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return day % COACH_TIPS.length;
  });

  const tip = COACH_TIPS[index % COACH_TIPS.length];

  // İpucu değişirken kart içeriği kısa bir süre sönüp yerine oturur;
  // metnin anında değişmesi "sayfa atladı" gibi duruyordu.
  const fade = useSharedValue(1);
  useEffect(() => {
    if (motion.reduced) {
      fade.value = 1;
      return;
    }
    fade.value = 0;
    fade.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
  }, [index, motion.reduced, fade]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 8 }],
  }));

  const next = () => {
    haptics.tap();
    setIndex((i) => (i + 1) % COACH_TIPS.length);
  };

  return (
    <PressableScale
      onPress={next}
      pressedScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={t('Sıradaki ipucu')}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={styles.head}>
        <Text style={[styles.tag, { color: theme.pulse }]}>{t(tip.tag)}</Text>
        <Text style={[styles.counter, { color: theme.faint }]}>
          {`${(index % COACH_TIPS.length) + 1}/${COACH_TIPS.length}`}
        </Text>
      </View>

      <Animated.View style={contentStyle}>
        <Text style={[styles.title, { color: theme.text }]}>{t(tip.title)}</Text>
        <Text style={[styles.body, { color: theme.sub }]}>{t(tip.body)}</Text>
      </Animated.View>

      <Text style={[styles.hint, { color: theme.faint }]}>
        {t('Dokun → sıradaki ipucu')}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  counter: {
    fontFamily: fonts.sans,
    fontSize: 10,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 19,
    marginTop: 8,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  hint: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    marginTop: 14,
  },
});
