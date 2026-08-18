import React, { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ConicRing from '../components/ConicRing';
import ParticleField from '../components/ParticleField';
import PressableScale from '../components/PressableScale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

/** Ad ile alt başlık arasındaki çizginin tam genişliği. */
const RULE_WIDTH = 40;

export default function SplashScreen({ navigation }: Props) {
  const t = useT();

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={20} />

      <View style={styles.ringWrap}>
        <ConicRing size={168} thickness={12} durationMs={8000} />
        <View style={styles.ringHole} />
        {/* Marka mührü halkanın göbeğinde. Mutlak konumlu: normal akışta
            kalsaydı halkanın altına iner, deliğin içine oturmazdı. */}
        <Reveal delay={0} scaleFrom={0} spring style={styles.markWrap}>
          <Text style={styles.mark}>⚗️</Text>
        </Reveal>
      </View>

      {/* Ad, çizgi ve alt başlık sırayla giriyor; sıra bilerek yukarıdan
          aşağıya, okuma yönüyle aynı. */}
      <Reveal delay={300} offsetY={10}>
        <Text style={styles.title}>Plasebo</Text>
      </Reveal>
      <Rule delay={500} />
      <Reveal delay={700}>
        <Text style={styles.tagline}>{t('ZİHİN PROTOKOLÜ')}</Text>
      </Reveal>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          {t('Bu uygulama tamamen ')}
          <Text style={styles.highlight}>{t('plasebo')}</Text>
          {t(' içerir. Bunu biliyorsun. Yine de ')}
          <Text style={styles.highlight}>{t('işe yarayacak')}</Text>
          {t('.')}
        </Text>
      </View>

      <PressableScale
        onPress={() => navigation.navigate('Onboarding')}
        accessibilityRole="button"
        style={styles.primary}
      >
        <Text style={styles.primaryText}>{t('Başla')}</Text>
      </PressableScale>

      <Pressable
        onPress={() => navigation.navigate('HowItWorks')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.ghostText}>{t('Nasıl çalışır?')}</Text>
      </Pressable>
    </Screen>
  );
}

/**
 * Açılış girişleri: her parça kendi gecikmesiyle beliriyor.
 *
 * `AnimatedIn` bileşeni de benzerini yapıyor ama sabit bir yaylanma
 * kullanıyor; buradaki sıralamada ölçekten gelen bir "mühür basma"
 * hareketi gerekiyordu, o yüzden ayrı tutuldu.
 */
function Reveal({
  delay,
  offsetY = 0,
  scaleFrom,
  spring = false,
  style: outerStyle,
  children,
}: {
  delay: number;
  offsetY?: number;
  scaleFrom?: number;
  spring?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const motion = useMotion();
  const p = useSharedValue(motion.reduced ? 1 : 0);

  useEffect(() => {
    if (motion.reduced) {
      p.value = 1;
      return;
    }
    p.value = withDelay(
      delay,
      spring
        ? withSpring(1, { damping: 12, stiffness: 150 })
        : withTiming(1, { duration: 300 })
    );
  }, [delay, motion.reduced, p, spring]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, p.value)),
    transform: [
      { translateY: offsetY ? (1 - p.value) * offsetY : 0 },
      { scale: scaleFrom !== undefined ? scaleFrom + (1 - scaleFrom) * p.value : 1 },
    ],
  }));

  return <Animated.View style={[outerStyle, style]}>{children}</Animated.View>;
}

/** Ad ile alt başlık arasındaki ince çizgi — genişleyerek çiziliyor. */
function Rule({ delay }: { delay: number }) {
  const motion = useMotion();
  const w = useSharedValue(motion.reduced ? RULE_WIDTH : 0);

  useEffect(() => {
    if (motion.reduced) {
      w.value = RULE_WIDTH;
      return;
    }
    w.value = withDelay(delay, withTiming(RULE_WIDTH, { duration: 300 }));
  }, [delay, motion.reduced, w]);

  const style = useAnimatedStyle(() => ({ width: w.value }));

  return <Animated.View style={[styles.rule, style]} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringHole: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.ink,
  },
  markWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { fontSize: 44 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 42,
    letterSpacing: -1,
    color: colors.white,
    marginTop: 34,
  },
  rule: {
    height: 1,
    backgroundColor: colors.pulse,
    opacity: 0.4,
    marginTop: 12,
  },
  tagline: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 4,
    color: colors.haze,
    marginTop: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 34,
  },
  cardText: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    lineHeight: 24,
    color: colors.mist,
    textAlign: 'center',
  },
  highlight: { color: colors.glow },
  primary: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 64,
    marginTop: 34,
  },
  primaryText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  ghost: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 16 },
  ghostText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
  },
});
