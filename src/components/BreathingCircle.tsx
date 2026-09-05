import React, { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
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
import GhostSentence from './GhostSentence';
import type { BreathAction } from '../utils/formulaEngine';
import type { BreathId } from '../constants/formulaPools';
import RadialGlow from './RadialGlow';

/**
 * Halka yığınının ölçüleri artık sabit piksel değil, ekranın kısa
 * kenarına bağlı oranlar.
 *
 * Dinlenme hâlindeki top eskiden 160 pikseldi — 1080 piksel genişliğinde
 * bir ekranda kısa kenarın yalnızca %15'i. Ritüelin merkezi olması
 * gereken şey, ekranın ortasında küçük bir nokta gibi duruyordu. Yeni
 * taban %30: top gözle "orada duran bir şey" hâline geliyor, yayılan
 * ışık da onun etrafından açılıyor.
 */
const BALL_RATIO = 0.3;
const MIDDLE_RATIO = 0.85;
const INNER_RATIO = 0.7;
const CORE_RATIO = 0.65;
const BLOOM_RATIO = 1.9;

/**
 * Nefes alırken daire ne kadar büyüyor?
 *
 * Küçülme sınırı (0.7) bilerek olduğu gibi bırakıldı — veriş sonunda daire
 * yeterince toparlanıyor. Büyüme sınırı iki adımda 1.0'dan 1.62'ye çıktı:
 * alış fazında halka ve ışıma ekranın ortasını gerçekten dolduruyor,
 * böylece "nefes al" komutunu okumaya gerek kalmadan hareketin kendisi
 * anlaşılıyor. Alt katmanlar (halo ve bloom) bu değerin katları olarak
 * büyüdüğü için artış orada daha da belirgin.
 */
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.62;

/**
 * Yayılan ışık katmanı.
 *
 * Halkalar sabit 160 pikselde duruyor; asıl büyüme artık onların
 * arkasındaki bu katmanda. Ölçü ekranın kısa kenarına bağlı, çünkü
 * "ekranı doldurma" hissi piksel sayısına değil cihazın enine göre
 * değişiyor. En büyük hâlinde ekranı taşıyor (1.8 kat) — merkez hiç
 * kaybolmadığı için kullanıcı yönünü şaşırmıyor, yalnızca ışık yayılıyor.
 *
 * Boyut `width/height` yerine `scale` ile değiştiriliyor: ölçü
 * animasyonu her karede yeniden yerleşim (layout) tetikler ve JS
 * tarafına düşer; ölçek dönüşümü UI iş parçacığında kalır.
 */
const WASH_MAX_RATIO = 1.8;
/** Hareket azaltılmışken büyüme neredeyse yok. */
const WASH_REDUCED_RATIO = 0.22;

/**
 * Nefes dışındaki adımlarda (renk, ses) topun tek bir açılıp kapanma
 * süresi. Gerçek bir nefes fazı olmadığı için sakin ve uzun tutuldu.
 */
const AMBIENT_CYCLE_MS = 5200;

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
   * Merkezde gösterilecek cümle — verilirse `word`'ün yerine geçer.
   *
   * Kelime tek satırda, harf aralıklı ve büyük harflerle bir etiket gibi
   * duruyor; cümle ise okunacak bir metin. İkisi aynı stille çizilemez,
   * o yüzden ayrı bir alan: cümle serif, aralıksız ve çok satırlı.
   */
  sentence?: string;
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
  sentence,
  ambient = false,
}: BreathingCircleProps) {
  const motion = useMotion();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const base = Math.min(winWidth, winHeight);
  // Işık, topun kendi boyutundan başlayıp ekranı taşacak kadar açılıyor.
  const outer = base * BALL_RATIO;
  const middle = outer * MIDDLE_RATIO;
  const inner = outer * INNER_RATIO;
  const core = outer * CORE_RATIO;
  const bloom = outer * BLOOM_RATIO;
  const washMin = outer;
  const washMax = base * (motion.reduced ? WASH_REDUCED_RATIO : WASH_MAX_RATIO);

  /**
   * Tek ilerleme: 0 = top en küçük hâlinde ve ışık toplanmış,
   * 1 = top en büyük hâlinde ve ışık en geniş hâlinde.
   *
   * Halkalar, parlaklık, yayılan ışık ve ekran tonu — hepsi bundan
   * türüyor. Ayrı ayrı zamanlayıcılarla sürüldüklerinde aralarında
   * sürekli bir kayma oluyordu: top küçülürken ışık büyüyor, top
   * dururken ışık patlıyordu. Tek kaynak bunu yapısal olarak imkânsız
   * kılıyor.
   */
  const progress = useSharedValue(0);

  useEffect(() => {
    if (motion.reduced) {
      // Hareket azaltılmışsa her şey sabit, okunur bir orta noktada durur.
      cancelAnimation(progress);
      progress.value = action === 'inhale' || action === 'hold' ? 0.6 : 0.35;
      return;
    }

    cancelAnimation(progress);

    if (ambient) {
      // Nefes dışındaki adımlarda gerçek bir faz yok: top tek bir sakin
      // ritimde açılıp kapanıyor, ışık da onunla birlikte.
      progress.value = withRepeat(
        withTiming(1, {
          duration: AMBIENT_CYCLE_MS,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
      return () => cancelAnimation(progress);
    }

    const durationMs = Math.max(phaseSeconds, 0.2) * 1000;
    // Uyumlu nefeste hiç sert geçiş olmasın diye sinüs easing kullanıyoruz.
    const easing =
      pattern === 'coherent_5s' ? Easing.inOut(Easing.sin) : Easing.inOut(Easing.ease);

    // Nefes adımında süreler formülün kendi deseninden geliyor: 4-7-8 ile
    // kutu nefesi aynı hızda açılsaydı desenin bir anlamı kalmazdı.
    switch (action) {
      case 'inhale':
        progress.value = withTiming(1, { duration: durationMs, easing });
        break;

      case 'exhale':
        progress.value = withTiming(0, { duration: durationMs, easing });
        break;

      case 'hold':
        // Açık hâlde duruyor; yalnızca çok hafif bir salınım var ki
        // ekran donmuş gibi görünmesin.
        progress.value = withSequence(
          withTiming(1, { duration: 300, easing }),
          withRepeat(
            withSequence(
              withTiming(0.97, { duration: 700, easing: Easing.inOut(Easing.sin) }),
              withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
          )
        );
        break;

      case 'pause':
      default:
        progress.value = withTiming(0, { duration: 400, easing });
        break;
    }

    return () => cancelAnimation(progress);
    // phaseKey her faz değişiminde değişir; animasyon böylece yeniden kurulur.
  }, [phaseKey, action, phaseSeconds, pattern, motion.reduced, ambient, progress]);

  /**
   * Ekranın tamamına yayılan hafif renk tonu — topla birlikte koyulaşıp
   * topla birlikte çekiliyor.
   */
  /*
   * Aşağıdaki katmanların hepsi tek bir `progress` üzerinden türüyor.
   * Top hangi anda ne kadar büyükse ışık da tam o kadar geniş: en büyük
   * hâlde saçılma en geniş, toplandığında saçılma yok.
   */

  /** Halkaların ortak ölçeği: 0 → MIN_SCALE, 1 → MAX_SCALE. */
  const ringScale = (p: number) => {
    'worklet';
    return MIN_SCALE + p * (MAX_SCALE - MIN_SCALE);
  };

  /** Parlaklık da aynı yerden: taban 0.25, tepe 1. */
  const glowOf = (p: number) => {
    'worklet';
    return 0.25 + p * 0.75;
  };

  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.13]),
  }));

  /**
   * Yayılan ışık.
   *
   * Ölçek topun kendi boyutundan ekranı taşan boyuta gidiyor; opaklık
   * toplanmışken sıfır, en geniş hâlde en yüksek. Eskiden zirveye
   * varmadan sönüyordu: top hâlâ büyürken ışık çekiliyor, ikisi ayrı
   * şeyler yapıyormuş gibi duruyordu.
   */
  const washStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 1], [0, 0.08, 0.6]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [washMin / washMax, 1]) },
    ],
  }));

  /**
   * Ortadaki kelimenin ölçüleri.
   *
   * Kelime artık hiç kıpırdamıyor. Önce ışıkla birlikte büyüyüp
   * sönüyordu; ritüelin tek sabit noktası olması gereken şey, döngünün
   * yarısında kayboluyordu. Şimdi baştan sona aynı yerde ve aynı
   * boyutta duruyor.
   *
   * Punto çekirdeğe göre hesaplanıyor: halka yığını ekran genişliğine
   * bağlı olduğu için sabit bir punto, küçük ekranda taşıyor, büyük
   * ekranda kayboluyordu.
   */
  const wordSize = Math.round(core * 0.24);
  const wordTracking = wordSize * 0.1;
  const ruleWidth = core * 0.42;
  // Kelime parlak çekirdeğin içinde kalmalı: dışına taştığında harflerin
  // ucu koyu zemine düşüyor ve aynı kelimenin yarısı okunmuyordu.
  const wordMaxWidth = core * 0.86;
  /**
   * Akan cümle çekirdeğe değil ekrana göre ölçülüyor.
   *
   * Önce `word` ile aynı kutuyu paylaşıyordu: çekirdeğin %86'sı, yani
   * iPhone 11'de 69 piksel genişlik ve 9 piksel yazı. Cümleler o kutuya
   * sığmadığı için `adjustsFontSizeToFit` devreye giriyor ve metni 6
   * piksele kadar küçültüyordu — okunacak bir metin olarak tasarlanan şey
   * okunamaz hâle geliyordu. Etiket gibi duran tek kelimenin çekirdeğe
   * bağlı kalması doğru; okunacak bir cümlenin değil.
   */
  const sentenceMaxWidth = base * 0.74;
  const sentenceSize = Math.round(base * 0.056);

  const outerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glowOf(progress.value) * 0.2,
    transform: [{ scale: 0.97 + ringScale(progress.value) * 0.03 }],
  }));

  const middleStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glowOf(progress.value) * 0.5,
    transform: [{ scale: 0.94 + ringScale(progress.value) * 0.06 }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + glowOf(progress.value) * 0.5,
    transform: [{ scale: 0.9 + ringScale(progress.value) * 0.1 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale(progress.value) }],
    // iOS'ta gerçek gölge yarıçapı, Android'de aşağıdaki ışıma katmanı çalışır.
    ...(Platform.OS === 'ios'
      ? {
          shadowRadius: glowOf(progress.value) * 20,
          shadowOpacity: 0.4 + glowOf(progress.value) * 0.5,
        }
      : null),
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + glowOf(progress.value) * 0.65,
    transform: [{ scale: 0.8 + ringScale(progress.value) * 0.5 }],
  }));

  // Geniş bloom halodan daha yavaş büyür ve daha sönük kalır; yoksa
  // ekranın yarısını dolduran düz bir renk lekesine dönüşüyor.
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + glowOf(progress.value) * 0.5,
    transform: [{ scale: 0.85 + ringScale(progress.value) * 0.2 }],
  }));

  return (
    <View style={styles.wrap}>
      {/* Ekran boyunca uzanan renk tonu. Sarmalayıcı ekranın ortasında
          durduğu için, ekran ölçüsünde ve ortalanmış bir katman tüm
          yüzeyi kaplıyor. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.tint,
          {
            width: winWidth * 1.2,
            height: winHeight * 1.2,
            backgroundColor: colorHex,
          },
          tintStyle,
        ]}
      />

      {/* Yayılan ışık — halkaların arkasında, ekranı taşacak boyutta.
          Sert kenarlı bir disk yerine radyal geçiş: kenarı belli olan
          bir daire, büyürken ekrana yapıştırılmış bir leke gibi
          duruyordu. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.wash, { width: washMax, height: washMax }, washStyle]}
      >
        <RadialGlow
          id="breathWash"
          size={washMax}
          color={colorHex}
          intensity={0.7}
          falloff="bloom"
        />
      </Animated.View>

      {/* En arkada, halkaların dışına taşan geniş neon parlaması. */}
      <Animated.View style={[styles.bloom, bloomStyle]} pointerEvents="none">
        <RadialGlow id="breathBloom" size={bloom} color={colorHex} intensity={0.5} falloff="bloom" />
      </Animated.View>

      <Animated.View
        style={[
          styles.circle,
          styles.outer,
          { width: outer, height: outer, borderColor: withAlpha(colorHex, 0.55) },
          outerStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.middle,
          {
            width: middle,
            height: middle,
            borderColor: withAlpha(lighten(colorHex, 0.25), 0.8),
          },
          middleStyle,
        ]}
      />

      <Animated.View
        style={[styles.circle, styles.inner, { width: inner, height: inner }, innerStyle]}
      >
        <RadialGlow
          id="breathInner"
          size={inner}
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
          size={outer}
          color={colorHex}
          intensity={0.85}
          falloff="bloom"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.coreWrap,
          { borderRadius: core / 2, shadowColor: colorHex },
          coreStyle,
        ]}
      >
        <LinearGradient
          // Sıcak merkez → saf renk → hafif koyu kenar: tüpün içi yanıyor
          // gibi dursun diye. Düz dolgu, koyu zeminde mat bir daire oluyordu.
          colors={[lighten(colorHex, 0.72), colorHex, withAlpha(colorHex, 0.85)]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.25, y: 0.05 }}
          end={{ x: 0.85, y: 1 }}
          style={[
            styles.core,
            {
              width: core,
              height: core,
              borderRadius: core / 2,
              borderColor: withAlpha(lighten(colorHex, 0.85), 0.9),
            },
          ]}
        />
      </Animated.View>

      {/* Kelime çekirdeğin üstünde, her şeyin önünde. Çekirdeğin içine
          konsaydı onunla birlikte ölçeklenir ve nefes alırken okunmaz
          hâle gelirdi.

          Üstündeki ve altındaki ince çizgiler kelimeyi bir eczane
          etiketine benzetiyor: tek başına duran bir kelime, parlak
          çekirdeğin üstünde havada asılı kalıyordu. Gölge rengi
          formülün rengi değil koyu mürekkep — açık renkli çekirdeklerde
          (sarı, açık yeşil) beyaz yazı kendi ışığında kayboluyordu. */}
      {sentence ? (
        <View style={[styles.wordWrap, { maxWidth: sentenceMaxWidth }]} pointerEvents="none">
          <GhostSentence
            text={sentence}
            glowColor={colorHex}
            style={[
              styles.sentence,
              { fontSize: sentenceSize, lineHeight: Math.round(sentenceSize * 1.42) },
            ]}
          />
        </View>
      ) : word ? (
        <View style={[styles.wordWrap, { maxWidth: wordMaxWidth }]} pointerEvents="none">
          <View style={[styles.wordRule, { width: ruleWidth }]} />
          <Text
            style={[
              styles.word,
              { fontSize: wordSize, letterSpacing: wordTracking },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {word}
          </Text>
          <View style={[styles.wordRule, { width: ruleWidth }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  outer: { borderWidth: 1 },
  middle: {
    // İç halka biraz daha kalın: neon tüplerde parlak çizgi hep en içte.
    borderWidth: 1.5,
  },
  inner: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  halo: { position: 'absolute' },
  bloom: { position: 'absolute' },
  // İkisi de sarmalayıcıdan taşıyor; hiçbir üst görünümde
  // `overflow: 'hidden'` olmamalı, yoksa ışık kenardan kesilir.
  tint: { position: 'absolute', borderRadius: 0 },
  wash: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreWrap: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    // Burada `elevation` YOK. Android'de elevation, kardeşler arasındaki
    // çizim sırasını ağaçtaki sıradan bağımsız olarak belirliyor: yükseltilen
    // çekirdek, kendisinden sonra gelen kelimenin de üstüne çıkıyor ve
    // merkezdeki kelime topun altında kayboluyordu. Android'de çekirdeğin
    // ışıması zaten `halo`/`bloom` katmanlarından geliyor, gölgeye gerek yok;
    // yukarıdaki shadow* değerleri yalnızca iOS'ta iş görüyor.
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    // Kenardaki ince açık çizgi neon tüpün camı gibi duruyor.
    borderWidth: 1,
  },
  wordWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordRule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 5,
  },
  sentence: {
    // Kitap serifi (EB Garamond italik): metin bir arayüz etiketi değil,
    // iki dakika boyunca takip edilen bir hikâye.
    fontFamily: fonts.story,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 10,
    includeFontPadding: false,
    // Gölge yalnızca parlak çekirdek üstünde okunabilirlik için var.
    // Yarıçap 6'ydı ve 9 piksellik yazıyı görünür biçimde bulanıklaştırıyordu;
    // yazı büyüdüğü için artık ince bir kontur yetiyor.
    textShadowColor: 'rgba(14,14,18,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  word: {
    fontFamily: fonts.serif,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 4,
    includeFontPadding: false,
    // Koyu gölge okunurluk için: parlak çekirdek üstünde beyaz yazı
    // gölgesiz okunmuyordu. Renk formülden değil sabit mürekkepten.
    textShadowColor: 'rgba(14,14,18,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
