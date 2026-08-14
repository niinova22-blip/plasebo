import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ParticleField from '../components/ParticleField';
import RadialGlow from '../components/RadialGlow';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Examination'>;

const SIZE = 190;
const RADIUS = 86;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CHECK_PATH = 'M 66 96 L 86 116 L 128 66';
const CHECK_LENGTH = 96;

/** Kabın içinde dönen "sayfalar" — kitap karıştırma hissi. */
const PAGES = [0, 1, 2, 3, 4, 5];
/** Sıvıdan yükselen kabarcıklar. */
const BUBBLES = [0, 1, 2, 3, 4];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Aşamalar ve süreleri (ms). Toplam ~8.5 saniye: iksirin hazırlanması
 * gerçekten bir işlem gibi dursun diye bilerek uzun tutuldu.
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
 * Hiçbir hesap yapılmıyor; ekranın tamamı bir bekleme törenidir. Ortadaki
 * kap dolarken içinde sayfalar dönüyor, kabarcıklar yükseliyor ve renk
 * kademe kademe koyulaşıyor. Bu bilerek uzun: bir şeyin "hazırlandığını"
 * izlemek, beklentiyi kuran şeyin ta kendisi — ve uygulamanın iddiası da
 * zaten beklentinin gerçek bir mekanizma olduğu. Altındaki dipnot bunun
 * plasebo olduğunu söylüyor.
 */
export default function ExaminationScreen({ navigation, route }: Props) {
  const t = useT();
  const motion = useMotion();
  const complaint = resolveComplaint(route.params.complaintId, route.params.customText);
  const [stage, setStage] = useState(0);

  const fill = useSharedValue(0); // kaptaki sıvı seviyesi
  const ring = useSharedValue(0); // dış halkanın dolumu
  const swirl = useSharedValue(0); // sayfaların dönüşü
  const bubble = useSharedValue(0); // kabarcıkların yükselişi
  const check = useSharedValue(0); // onay işareti
  const fade = useSharedValue(1); // çıkış sönümü

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (motion.reduced) {
      fill.value = 1;
      ring.value = 1;
      check.value = 1;
    } else {
      // Sıvı kademeli yükselir: her aşamada bir miktar daha dolar.
      fill.value = withSequence(
        withTiming(0.22, { duration: 1700, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.48, { duration: 1700, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.72, { duration: 1900, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.92, { duration: 1700, easing: Easing.inOut(Easing.cubic) })
      );
      ring.value = withTiming(1, {
        duration: TOTAL_MS - 900,
        easing: Easing.inOut(Easing.quad),
      });
      // Sayfalar sürekli döner; karıştırma hissi bundan geliyor.
      swirl.value = withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.linear }),
        -1,
        false
      );
      bubble.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.linear }),
        -1,
        false
      );
    }

    for (const s of STAGES.slice(1)) {
      timers.push(
        setTimeout(() => {
          setStage(STAGES.indexOf(s));
          haptics.tap();
        }, s.at)
      );
    }

    timers.push(
      setTimeout(() => {
        haptics.step();
        if (!motion.reduced) {
          check.value = withSpring(1, { damping: 12, stiffness: 170 });
        }
      }, TOTAL_MS - 900)
    );
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

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimation(swirl);
      cancelAnimation(bubble);
    };
  }, [
    navigation,
    route.params.complaintId,
    route.params.customText,
    motion.reduced,
    fill,
    ring,
    swirl,
    bubble,
    check,
    fade,
  ]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - ring.value),
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - check.value),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.6 + check.value * 0.4 }],
  }));

  // Sıvı: kabın altından yukarı doğru yükselen renkli katman.
  const liquidStyle = useAnimatedStyle(() => ({
    height: `${fill.value * 100}%`,
    opacity: 0.55 + fill.value * 0.4,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: 0.95 + fade.value * 0.05 }],
  }));

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={12} />

      <Animated.View style={[styles.center, screenStyle]}>
        <View style={styles.vessel}>
          {/* Kabın arkasındaki ışıma — sıvı yükseldikçe güçlenir. */}
          <View style={styles.glow} pointerEvents="none">
            <RadialGlow id="examGlow" size={SIZE * 1.7} color={colors.pulse} intensity={0.5} />
          </View>

          {/* Cam kap: içindeki her şey daire içinde kırpılır. */}
          <View style={styles.jar}>
            <Animated.View style={[styles.liquid, liquidStyle]} />

            {PAGES.map((i) => (
              <Page key={i} index={i} swirl={swirl} reduced={motion.reduced} />
            ))}

            {BUBBLES.map((i) => (
              <Bubble key={i} index={i} bubble={bubble} reduced={motion.reduced} />
            ))}
          </View>

          {/* Dolum halkası — kabın kenarında ilerler. */}
          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
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
              animatedProps={ringProps}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>

          <Animated.View style={[styles.check, checkStyle]} pointerEvents="none">
            <Svg width={SIZE} height={SIZE}>
              <AnimatedPath
                d={CHECK_PATH}
                stroke={colors.glow}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={CHECK_LENGTH}
                animatedProps={checkProps}
              />
            </Svg>
          </Animated.View>
        </View>

        <Text style={styles.stage}>{t(STAGES[stage].text)}</Text>
        {complaint ? <Text style={styles.complaint}>{t(complaint.label)}</Text> : null}
      </Animated.View>

      <Text style={styles.footnote}>
        {t('⚗️ Bu analiz plasebodur. Yine de beynin şu an buna inanıyor.')}
      </Text>
    </Screen>
  );
}

/**
 * Kabın içinde dönen sayfa.
 *
 * Her sayfa dairenin çevresinde farklı bir noktadan başlıyor ve dönerken
 * kendi ekseninde de eğiliyor; üst üste gelen dikdörtgenler kitap
 * karıştırma izlenimi veriyor.
 */
function Page({
  index,
  swirl,
  reduced,
}: {
  index: number;
  swirl: SharedValue<number>;
  reduced: boolean;
}) {
  const offset = index / PAGES.length;
  const radius = 34 + (index % 3) * 9;

  const style = useAnimatedStyle(() => {
    if (reduced) return { opacity: 0.2 };
    const phase = (swirl.value + offset) % 1;
    const angle = phase * Math.PI * 2;
    return {
      opacity: 0.18 + 0.42 * Math.abs(Math.sin(angle)),
      transform: [
        { translateX: Math.cos(angle) * radius },
        { translateY: Math.sin(angle) * radius * 0.55 },
        { rotateZ: `${phase * 360 + index * 18}deg` },
        // Sayfanın yandan görünüp kaybolması: genişliği daralıyor.
        { scaleX: 0.35 + 0.65 * Math.abs(Math.cos(angle)) },
      ],
    };
  });

  return <Animated.View style={[styles.page, style]} pointerEvents="none" />;
}

/** Sıvıdan yükselen kabarcık. */
function Bubble({
  index,
  bubble,
  reduced,
}: {
  index: number;
  bubble: SharedValue<number>;
  reduced: boolean;
}) {
  const offset = index / BUBBLES.length;
  const x = -40 + index * 20;
  const size = 4 + (index % 3) * 2;

  const style = useAnimatedStyle(() => {
    if (reduced) return { opacity: 0 };
    const phase = (bubble.value + offset) % 1;
    return {
      opacity: phase < 0.15 ? phase / 0.15 : phase > 0.85 ? (1 - phase) / 0.15 : 0.75,
      transform: [
        { translateX: x + Math.sin(phase * Math.PI * 4) * 6 },
        { translateY: 60 - phase * 130 },
      ],
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  return <Animated.View style={[styles.bubble, style]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between', paddingHorizontal: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vessel: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: { position: 'absolute' },
  // Kap: içeriği kırpan daire.
  jar: {
    position: 'absolute',
    width: RADIUS * 2 - 6,
    height: RADIUS * 2 - 6,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(123,110,246,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.pulse,
  },
  page: {
    position: 'absolute',
    width: 30,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.ghost,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.ghost,
  },
  check: { position: 'absolute' },
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
