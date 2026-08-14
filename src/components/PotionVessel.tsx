import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import RadialGlow from './RadialGlow';

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

export interface PotionVesselProps {
  /** Hazırlığın toplam süresi (ms). Kap bu sürede dolar. */
  totalMs: number;
  /** "Hareketi azalt" açıksa animasyonlar kurulmaz. */
  reduced?: boolean;
  /** Kabın rengi — hazırlanan şeye göre değişebilir. */
  color?: string;
}

/**
 * İksir kabı.
 *
 * İki yerde kullanılıyor: kurulumdaki "günlük formüllerin hazırlanıyor"
 * ekranı ve şikayet akışındaki muayene. İkisi de aynı töreni gösteriyor,
 * yalnızca üstündeki metinler farklı — o yüzden animasyon burada tek
 * kopya duruyor.
 *
 * Kap süre boyunca kademeli doluyor, içinde sayfalar dönüyor, kabarcıklar
 * yükseliyor; sonunda kenar halkası tamamlanıp mühür (onay işareti)
 * çıkıyor. Hiçbir hesap yapılmıyor: ekranın tamamı bir bekleme töreni ve
 * beklentiyi kuran şey de bu.
 */
export default function PotionVessel({
  totalMs,
  reduced = false,
  color = colors.pulse,
}: PotionVesselProps) {
  const fill = useSharedValue(0);
  const ring = useSharedValue(0);
  const swirl = useSharedValue(0);
  const bubble = useSharedValue(0);
  const check = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      fill.value = 1;
      ring.value = 1;
      check.value = 1;
      return;
    }

    // Sıvı dört adımda yükselir: tek seferde dolsa "yükleniyor çubuğu"
    // gibi okunurdu, kademeli olunca bir işlem gibi duruyor.
    const quarter = (totalMs - 900) / 4;
    fill.value = withSequence(
      withTiming(0.22, { duration: quarter, easing: Easing.inOut(Easing.cubic) }),
      withTiming(0.48, { duration: quarter, easing: Easing.inOut(Easing.cubic) }),
      withTiming(0.72, { duration: quarter, easing: Easing.inOut(Easing.cubic) }),
      withTiming(0.92, { duration: quarter, easing: Easing.inOut(Easing.cubic) })
    );
    ring.value = withTiming(1, {
      duration: totalMs - 900,
      easing: Easing.inOut(Easing.quad),
    });
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

    const seal = setTimeout(() => {
      check.value = withSpring(1, { damping: 12, stiffness: 170 });
    }, totalMs - 900);

    return () => {
      clearTimeout(seal);
      cancelAnimation(swirl);
      cancelAnimation(bubble);
      cancelAnimation(fill);
      cancelAnimation(ring);
    };
  }, [totalMs, reduced, fill, ring, swirl, bubble, check]);

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

  const liquidStyle = useAnimatedStyle(() => ({
    height: `${fill.value * 100}%`,
    opacity: 0.55 + fill.value * 0.4,
  }));

  return (
    <View style={styles.vessel}>
      <View style={styles.glow} pointerEvents="none">
        <RadialGlow id="potionGlow" size={SIZE * 1.7} color={color} intensity={0.5} />
      </View>

      {/* Cam kap: içindeki her şey daire içinde kırpılır. */}
      <View style={styles.jar}>
        <Animated.View style={[styles.liquid, { backgroundColor: color }, liquidStyle]} />

        {PAGES.map((i) => (
          <Page key={i} index={i} swirl={swirl} reduced={reduced} />
        ))}
        {BUBBLES.map((i) => (
          <Bubble key={i} index={i} bubble={bubble} reduced={reduced} />
        ))}
      </View>

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
          stroke={color}
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
  );
}

/**
 * Kabın içinde dönen sayfa: dairenin çevresinde dolaşırken kendi ekseninde
 * de eğiliyor ve yandan görününce daralıyor — üst üste geldiklerinde kitap
 * karıştırma izlenimi veriyorlar.
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
  vessel: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: { position: 'absolute' },
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
  liquid: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  page: {
    position: 'absolute',
    width: 30,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.ghost,
  },
  bubble: { position: 'absolute', backgroundColor: colors.ghost },
  check: { position: 'absolute' },
});
