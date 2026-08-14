import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ParticleField from '../components/ParticleField';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { complaintById } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Examination'>;

const SIZE = 132;
const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CHECK_PATH = 'M 42 68 L 58 84 L 92 46';
const CHECK_LENGTH = 72;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Aşama metinleri — sırayla değişir. */
const STAGES = [
  'Şikayet analiz ediliyor...',
  'Nöral örüntüler taranıyor...',
  'Formülün hazırlanıyor...',
];

/**
 * Sahte muayene ekranı.
 *
 * Hiçbir hesap yapılmıyor: üç saniye boyunca bir daire doluyor, metin
 * değişiyor ve sonunda onay işareti çıkıyor. Bu, uygulamanın en dürüst
 * biçimde sahte olan parçası — ekranın altında zaten bunun plasebo olduğu
 * yazıyor. Beklemenin kendisi ritüelin bir parçası: bir şeyin "hazırlandığı"
 * hissi, beklentiyi kuran şeyin ta kendisi.
 */
export default function ExaminationScreen({ navigation, route }: Props) {
  const t = useT();
  const motion = useMotion();
  const complaint = complaintById(route.params.complaintId);
  const [stage, setStage] = useState(0);

  const progress = useSharedValue(0); // daire dolumu
  const check = useSharedValue(0); // onay işareti
  const fade = useSharedValue(1); // çıkış sönümü

  useEffect(() => {
    // Süreler: 0.0 tarama · 1.0 dolum · 2.0 onay · 3.0 geçiş
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (motion.reduced) {
      progress.value = 1;
      check.value = 1;
    } else {
      progress.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) });
    }

    timers.push(setTimeout(() => setStage(1), 1000));
    timers.push(
      setTimeout(() => {
        setStage(2);
        haptics.step();
        if (!motion.reduced) {
          check.value = withSpring(1, { damping: 12, stiffness: 180 });
        }
      }, 2000)
    );
    timers.push(
      setTimeout(() => {
        if (!motion.reduced) {
          fade.value = withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) });
        }
      }, 2800)
    );
    timers.push(
      setTimeout(() => {
        navigation.replace('Prescription', { complaintId: route.params.complaintId });
      }, 3050)
    );

    return () => timers.forEach(clearTimeout);
  }, [navigation, route.params.complaintId, motion.reduced, progress, check, fade]);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - check.value),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.6 + check.value * 0.4 }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: 0.95 + fade.value * 0.05 }],
  }));

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={10} />

      <Animated.View style={[styles.center, screenStyle]}>
        <View style={styles.markWrap}>
          <Svg width={SIZE} height={SIZE}>
            {/* Arka halka — dolan dairenin izi. */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={2}
              fill="none"
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={colors.pulse}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={circleProps}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>

          <Animated.View style={[styles.check, checkStyle]} pointerEvents="none">
            <Svg width={SIZE} height={SIZE}>
              <AnimatedPath
                d={CHECK_PATH}
                stroke={colors.glow}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={CHECK_LENGTH}
                animatedProps={checkProps}
              />
            </Svg>
          </Animated.View>
        </View>

        <Text style={styles.stage}>{t(STAGES[stage])}</Text>
        {complaint ? (
          <Text style={styles.complaint}>{t(complaint.label)}</Text>
        ) : null}
      </Animated.View>

      <Text style={styles.footnote}>
        {t('⚗️ Bu analiz plasebodur. Yine de beynin şu an buna inanıyor.')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between', paddingHorizontal: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { position: 'absolute' },
  stage: {
    fontFamily: fonts.sans,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.haze,
    marginTop: 34,
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
