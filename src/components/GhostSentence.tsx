import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, type TextStyle, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useMotion } from '../hooks/useMotion';

/**
 * Cümleden cümleye hayalet geçiş.
 *
 * Metin ritüel boyunca akıyor; cümleler yerinde **değişirse** göz her
 * seferinde bir sıçrama görüyor ve sakinleştirmesi beklenen ekran tam
 * tersini yapıyor. Burada iki katman üst üste duruyor: giden cümle
 * yukarı doğru süzülüp siliniyor, gelen cümle aşağıdan hafifçe
 * belirerek yerine oturuyor. İkisi kısa bir süre birlikte görünüyor —
 * "hayalet" hissi tam olarak o çakışmadan geliyor.
 *
 * Hareketi azalt ayarı açıkken geçiş yok, metin doğrudan değişiyor.
 */

/**
 * Geçiş süreleri, cümlenin ekranda kaldığı süreye göre ayarlı.
 *
 * Süreler iki kez ayarlandı. Başta giden 900, gelen 1300 milisaniyeydi;
 * satır başına 13-18 saniye düştüğü için sorun değildi. Satırlar 3-4
 * saniyeye inince aynı süreler ekranın yarısını geçiş hâlinde bıraktı ve
 * geçici olarak yarıya indirildi — bu sefer de metin bir belirip bir
 * kaybolan, kesik kesik bir şeye dönüştü.
 *
 * Satır artık yedi buçuk saniye kalıyor ve geçişin yavaş olması için yer
 * var. Toplam geçiş ~2,6 saniye: giden satır ağır ağır siliniyor, gelen
 * satır o silinme bitmeden belirmeye başlıyor ve ikisi bir buçuk saniye
 * boyunca birlikte duruyor. Akıcılık hissi tam olarak o çakışmadan
 * geliyor; kalan beş saniyede satır kıpırdamadan okunuyor.
 */
const OUT_MS = 1500;
/** Gelen satırın belirme süresi — bilerek girişten uzun, daha yumuşak. */
const IN_MS = 2000;
/** Gelen satır, giden satır yarılanmadan başlamıyor. */
const IN_DELAY_MS = 600;
/** Süzülme mesafesi. Yavaş geçişte biraz daha uzun yol daha akışkan duruyor. */
const DRIFT = 20;

interface Props {
  text: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
  /**
   * Metnin arkasındaki neon parıltının rengi (genelde günün formül rengi).
   *
   * Verilirse her cümle iki kat çiziliyor: altta aynı metin, o renkte ve
   * geniş yarıçaplı bir gölgeyle — üstte ise beyaz, keskin metin. Parıltı
   * tek bir `textShadow` ile de kurulabilirdi, ama o zaman ya okunurluk
   * için gereken koyu hâleyi ya da neon etkisini seçmek gerekiyordu;
   * ikisi tek bir metinde birlikte bulunamıyor.
   */
  glowColor?: string;
}

/**
 * Bir cümlenin iki katmanı: arkada parıltı, önde keskin metin.
 *
 * İki katman aynı genişlikte ve aynı hizada çiziliyor, bu yüzden aynı
 * satırlara bölünüyorlar; parıltı katmanı mutlak konumlu olduğu için
 * kutunun yüksekliğini öndeki metin belirliyor.
 */
function SentenceLayer({
  text,
  style,
  numberOfLines,
  glowColor,
}: Omit<Props, 'text'> & { text: string }) {
  return (
    <View>
      {glowColor ? (
        <Text
          style={[
            style,
            styles.glow,
            { color: glowColor, textShadowColor: glowColor },
          ]}
          numberOfLines={numberOfLines}
          pointerEvents="none"
        >
          {text}
        </Text>
      ) : null}
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    </View>
  );
}

export default function GhostSentence({
  text,
  style,
  numberOfLines = 4,
  glowColor,
}: Props) {
  const motion = useMotion();
  const [current, setCurrent] = useState(text);
  const [ghost, setGhost] = useState<string | null>(null);
  /** Aynı metin tekrar geldiğinde geçiş başlatmamak için. */
  const shown = useRef(text);

  const inProgress = useSharedValue(1);
  const outProgress = useSharedValue(0);

  useEffect(() => {
    if (text === shown.current) return;
    const previous = shown.current;
    shown.current = text;

    if (motion.reduced) {
      setGhost(null);
      setCurrent(text);
      inProgress.value = 1;
      return;
    }

    setGhost(previous);
    setCurrent(text);
    outProgress.value = 0;
    inProgress.value = 0;
    outProgress.value = withTiming(1, {
      duration: OUT_MS,
      easing: Easing.out(Easing.quad),
    });
    inProgress.value = withDelay(
      IN_DELAY_MS,
      withTiming(1, { duration: IN_MS, easing: Easing.out(Easing.cubic) })
    );

    // Giden cümle silindikten sonra ağaçtan da çıkıyor: iki metin
    // gereksiz yere üst üste durmasın.
    const timer = setTimeout(() => setGhost(null), OUT_MS + 60);
    return () => clearTimeout(timer);
  }, [text, motion.reduced, inProgress, outProgress]);

  useEffect(
    () => () => {
      cancelAnimation(inProgress);
      cancelAnimation(outProgress);
    },
    [inProgress, outProgress]
  );

  /*
   * Ölçek animasyonu kaldırıldı.
   *
   * Metin belirirken 0.97'den 1'e büyüyordu; tam sayı olmayan ölçekte
   * çizilen yazı iOS'ta gözle görülür biçimde bulanıklaşıyor ve cümleler
   * hızlandığı için ekran çoğu zaman o ara ölçekte kalıyordu. Yumuşaklığı
   * artık yalnızca opaklık ve küçük bir dikey süzülme taşıyor — ikisi de
   * metnin keskinliğini bozmuyor.
   */
  const currentStyle = useAnimatedStyle(() => ({
    opacity: inProgress.value,
    transform: [{ translateY: (1 - inProgress.value) * DRIFT }],
  }));

  const ghostStyle = useAnimatedStyle(() => ({
    opacity: (1 - outProgress.value) * 0.5,
    transform: [{ translateY: -outProgress.value * DRIFT }],
  }));

  return (
    <View style={styles.wrap}>
      {ghost ? (
        <Animated.View style={[styles.ghostLayer, ghostStyle]} pointerEvents="none">
          <SentenceLayer
            text={ghost}
            style={style}
            numberOfLines={numberOfLines}
            glowColor={glowColor}
          />
        </Animated.View>
      ) : null}
      <Animated.View style={currentStyle}>
        {/*
          `adjustsFontSizeToFit` + `minimumFontScale={0.6}` kaldırıldı: kutu
          dar olduğu için neredeyse her cümle küçültülüyordu ve cümleden
          cümleye punto değiştiği için metin bir büyüyüp bir küçülüyordu.
          Kutu artık ekran genişliğine göre ölçüldüğünden kısa cümleler
          sığıyor; sığmayan uzun bir cümle varsa çözüm onu kısaltmak.
        */}
        <SentenceLayer
          text={current}
          style={style}
          numberOfLines={numberOfLines}
          glowColor={glowColor}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  /**
   * Parıltı katmanı.
   *
   * Öndeki metnin tam altında duruyor; kendi rengi düşük opaklıkta,
   * gölgesi ise geniş ve kaymasız — yani harfin kendisinden dışarı doğru
   * eşit yayılan bir ışık. Öndeki beyaz metin bunun üstünü kapattığı için
   * harfler keskin kalıyor, dışarı taşan kısım parıltı olarak görünüyor.
   */
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  ghostLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
