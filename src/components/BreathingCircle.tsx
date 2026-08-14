import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { lighten, withAlpha } from '../utils/color';
import { useMotion } from '../hooks/useMotion';
import type { BreathAction } from '../utils/formulaEngine';
import type { BreathId } from '../constants/formulaPools';
import RadialGlow from './RadialGlow';

const OUTER = 160;
const MIDDLE = 136;
const INNER = 112;
const CORE = 76;
/** Halkaların dışına taşan neon parlaması — bloom bu boyutta çiziliyor. */
const BLOOM = 300;

/**
 * Kelimenin çekirdeğe sığması için punto ve harf aralığı.
 *
 * Çekirdek 76 piksel; sabit 13 punto ve 1.5 harf aralığıyla "BAŞLANGIÇ"
 * ya da "SESSİZLİK" gibi uzun kelimeler sığmayıp alt satıra taşıyordu.
 * Uzunluğa göre küçültüyoruz; `adjustsFontSizeToFit` de son bir emniyet
 * olarak duruyor (kelime havuzuna beklenmedik uzunlukta bir şey girerse).
 */
function wordSize(word: string): { fontSize: number; letterSpacing: number } {
  const n = word.length;
  if (n <= 5) return { fontSize: 13, letterSpacing: 1.5 };
  if (n <= 7) return { fontSize: 11, letterSpacing: 0.8 };
  if (n <= 9) return { fontSize: 9.5, letterSpacing: 0.3 };
  return { fontSize: 8.5, letterSpacing: 0 };
}

/**
 * Nefes alırken daire ne kadar büyüyor?
 *
 * Küçülme sınırı (0.7) bilerek olduğu gibi bırakıldı — veriş sonunda daire
 * yeterince toparlanıyor. Büyüme sınırı 1.0'dan 1.45'e çıkarıldı: alış
 * fazında halka ve ışıma ekranın ortasını gerçekten dolduruyor, böylece
 * "nefes al" komutunu okumaya gerek kalmadan hareketin kendisi anlaşılıyor.
 * Alt katmanlar (halo ve bloom) bu değerin katları olarak büyüdüğü için
 * artış orada da hissediliyor.
 */
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.45;

export interface BreathingCircleProps {
  /** Nefes deseni — geçişlerin sertliğini belirler. */
  pattern: BreathId;
  /** Şu anki fazın türü. */
  action: BreathAction;
  /** Fazın toplam süresi (saniye). */
  phaseSeconds: number;
  /** Faz değiştiğinde animasyonu yeniden tetikleyen anahtar. */
  phaseKey: string;
  /** Formülün rengi (formula.color.hex). */
  colorHex: string;
  /** Merkezde gösterilecek kelime. */
  word?: string;
  /**
   * Nefes dışındaki adımlar (renk, ses) için sakin, kendi kendine
   * yinelenen bir nabız.
   *
   * Bunlarda gerçek bir faz yok; daire eskiden tek bir "nefes al"
   * hareketi sanıp adımın tamamı boyunca (renkte 24, seste 90 saniye)
   * sönükten parlağa açılıyordu. Sonuç: adımın ilk yarısında neon
   * çekirdek neredeyse görünmüyordu. Ambient modda parlaklık yüksek bir
   * tabandan başlar ve yavaşça gidip gelir.
   */
  ambient?: boolean;
}

/**
 * Ritüelin nefes animasyonu.
 *
 * Üç iç içe halka + merkezde formülün renginde bir çekirdek. Çekirdek
 * fazın türüne göre büyür (al), sabit kalıp hafifçe titrer (tut),
 * küçülür (ver) ya da hiç kıpırdamaz (bekle).
 */
export default function BreathingCircle({
  pattern,
  action,
  phaseSeconds,
  phaseKey,
  colorHex,
  word,
  ambient = false,
}: BreathingCircleProps) {
  const motion = useMotion();
  const scale = useSharedValue(MIN_SCALE);
  const intensity = useSharedValue(0); // 0 = sönük, 1 = parlak

  useEffect(() => {
    if (motion.reduced) {
      // Hareket azaltılmışsa daireler sabit, okunur bir boyutta durur.
      scale.value = 0.85;
      intensity.value = action === 'inhale' || action === 'hold' ? 0.8 : 0.35;
      return;
    }

    if (ambient) {
      cancelAnimation(scale);
      cancelAnimation(intensity);
      scale.value = 0.88;
      intensity.value = 0.72;
      const pulse = { duration: 3400, easing: Easing.inOut(Easing.sin) };
      scale.value = withRepeat(withTiming(1.14, pulse), -1, true);
      intensity.value = withRepeat(withTiming(1, pulse), -1, true);
      return () => {
        cancelAnimation(scale);
        cancelAnimation(intensity);
      };
    }

    const durationMs = Math.max(phaseSeconds, 0.2) * 1000;
    // Uyumlu nefeste hiç sert geçiş olmasın diye sinüs easing kullanıyoruz.
    const easing =
      pattern === 'coherent_5s' ? Easing.inOut(Easing.sin) : Easing.inOut(Easing.ease);

    cancelAnimation(scale);

    switch (action) {
      case 'inhale':
        scale.value = withTiming(MAX_SCALE, { duration: durationMs, easing });
        intensity.value = withTiming(1, { duration: durationMs, easing });
        break;

      case 'exhale':
        scale.value = withTiming(MIN_SCALE, { duration: durationMs, easing });
        intensity.value = withTiming(0, { duration: durationMs, easing });
        break;

      case 'hold':
        // Boyut sabit; daireler yalnızca ±0.02 titrer.
        intensity.value = withTiming(1, { duration: 300 });
        scale.value = withRepeat(
          withSequence(
            withTiming(MAX_SCALE + 0.02, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(MAX_SCALE - 0.02, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'pause':
      default:
        scale.value = withTiming(MIN_SCALE, { duration: 400, easing });
        intensity.value = withTiming(0.15, { duration: 400, easing });
        break;
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(intensity);
    };
    // phaseKey her faz değişiminde değişir; animasyon böylece yeniden kurulur.
  }, [phaseKey, action, phaseSeconds, pattern, motion.reduced, ambient, scale, intensity]);

  const outerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + intensity.value * 0.2,
    transform: [{ scale: 0.97 + scale.value * 0.03 }],
  }));

  const middleStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + intensity.value * 0.5, // 0.3 → 0.8
    transform: [{ scale: 0.94 + scale.value * 0.06 }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + intensity.value * 0.5,
    transform: [{ scale: 0.9 + scale.value * 0.1 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    // iOS'ta gerçek gölge yarıçapı, Android'de aşağıdaki ışıma katmanı çalışır.
    ...(Platform.OS === 'ios'
      ? { shadowRadius: intensity.value * 20, shadowOpacity: 0.4 + intensity.value * 0.5 }
      : null),
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + intensity.value * 0.65,
    transform: [{ scale: 0.8 + scale.value * 0.5 }],
  }));

  // Geniş bloom halodan daha yavaş büyür ve daha sönük kalır; yoksa
  // ekranın yarısını dolduran düz bir renk lekesine dönüşüyor.
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + intensity.value * 0.5,
    transform: [{ scale: 0.85 + scale.value * 0.2 }],
  }));

  return (
    <View style={styles.wrap}>
      {/* En arkada, halkaların dışına taşan geniş neon parlaması. */}
      <Animated.View style={[styles.bloom, bloomStyle]} pointerEvents="none">
        <RadialGlow id="breathBloom" size={BLOOM} color={colorHex} intensity={0.5} falloff="bloom" />
      </Animated.View>

      <Animated.View
        style={[styles.circle, styles.outer, { borderColor: withAlpha(colorHex, 0.55) }, outerStyle]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.middle,
          { borderColor: withAlpha(lighten(colorHex, 0.25), 0.8) },
          middleStyle,
        ]}
      />

      <Animated.View style={[styles.circle, styles.inner, innerStyle]}>
        <RadialGlow
          id="breathInner"
          size={INNER}
          color={colorHex}
          intensity={0.55}
          falloff="bloom"
          style={StyleSheet.absoluteFill as never}
        />
      </Animated.View>

      {/* Nefes alırken genişleyen ışıma — Android'de box-shadow yerine geçer. */}
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
        <RadialGlow
          id="breathHalo"
          size={OUTER}
          color={colorHex}
          intensity={0.85}
          falloff="bloom"
        />
      </Animated.View>

      <Animated.View style={[styles.coreWrap, coreStyle, { shadowColor: colorHex }]}>
        <LinearGradient
          // Sıcak merkez → saf renk → hafif koyu kenar: tüpün içi yanıyor
          // gibi dursun diye. Düz dolgu, koyu zeminde mat bir daire oluyordu.
          colors={[lighten(colorHex, 0.72), colorHex, withAlpha(colorHex, 0.85)]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.25, y: 0.05 }}
          end={{ x: 0.85, y: 1 }}
          style={[styles.core, { borderColor: withAlpha(lighten(colorHex, 0.85), 0.9) }]}
        >
          {word ? (
            <Text
              style={[styles.word, wordSize(word), { textShadowColor: colorHex }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {word}
            </Text>
          ) : null}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: OUTER,
    height: OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  outer: {
    width: OUTER,
    height: OUTER,
    borderWidth: 1,
  },
  middle: {
    width: MIDDLE,
    height: MIDDLE,
    // İç halka biraz daha kalın: neon tüplerde parlak çizgi hep en içte.
    borderWidth: 1.5,
  },
  inner: {
    width: INNER,
    height: INNER,
    overflow: 'hidden',
  },
  halo: { position: 'absolute' },
  bloom: { position: 'absolute' },
  coreWrap: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 18,
    borderRadius: CORE / 2,
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Kenardaki ince açık çizgi neon tüpün camı gibi duruyor.
    borderWidth: 1,
  },
  word: {
    fontFamily: fonts.sansBold,
    color: colors.white,
    textAlign: 'center',
    // Çekirdeğin kenarına dayanmasın; sığdırma hesabı bu boşluğu varsayıyor.
    paddingHorizontal: 6,
    maxWidth: CORE,
    includeFontPadding: false,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
