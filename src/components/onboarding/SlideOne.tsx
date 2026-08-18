import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Reveal from './Reveal';
import HighlightText from './HighlightText';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useMotion } from '../../hooks/useMotion';
import { useResponsive } from '../../hooks/useResponsive';
import { useT } from '../../context/SettingsContext';

const W = 260;
const H = 190;
const DOOR_W = 60;
const DOOR_H = 74;
const DOOR_LEFT = 100;
const DOOR_TOP = 64;

/**
 * Hastane koridoru — yalnızca çizgi.
 *
 * Perspektif tek bir kaçış noktasına kuruluyor: tavan ve zemin çizgileri
 * koridorun sonundaki kapıya doğru daralıyor. Slayt açılınca kapı,
 * sol kenarındaki menteşesinden yavaşça aralanıyor ve arkasından ışık
 * sızıyor. Görsel dosya yok — hepsi vektör.
 */
function Corridor({ active }: { active: boolean }) {
  const motion = useMotion();
  const { s } = useResponsive();
  const open = useSharedValue(0);
  // Çizim ekranla birlikte küçülüyor; viewBox sabit kaldığı için oranlar
  // ve kapının konumu bozulmadan ölçekleniyor.
  const w = s(W);
  const h = s(H);

  useEffect(() => {
    if (motion.reduced) {
      open.value = 1;
      return;
    }
    if (!active) {
      open.value = 0;
      return;
    }
    open.value = withDelay(
      500,
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) })
    );
  }, [active, motion.reduced, open]);

  const doorStyle = useAnimatedStyle(() => ({
    transformOrigin: 'left center',
    transform: [{ scaleX: 1 - 0.78 * open.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({ opacity: open.value * 0.22 }));

  // Kapı ve ışık, çizimin üstüne mutlak konumla oturuyor; ölçek
  // değiştiğinde onların da aynı oranda kayması gerekiyor.
  const doorBox = {
    left: s(DOOR_LEFT),
    top: s(DOOR_TOP),
    width: s(DOOR_W),
    height: s(DOOR_H),
  };

  return (
    <View style={[styles.corridor, { width: w, height: h }]}>
      <Svg width={w} height={h} viewBox="0 0 260 190">
        <G stroke={colors.pulse} strokeWidth={1.2} fill="none" opacity={0.75}>
          <Line x1={0} y1={6} x2={96} y2={62} />
          <Line x1={260} y1={6} x2={164} y2={62} />
          <Line x1={0} y1={184} x2={96} y2={140} />
          <Line x1={260} y1={184} x2={164} y2={140} />
          <Line x1={40} y1={34} x2={40} y2={162} />
          <Line x1={72} y1={50} x2={72} y2={152} />
          <Line x1={220} y1={34} x2={220} y2={162} />
          <Line x1={188} y1={50} x2={188} y2={152} />
          <Rect x={96} y={62} width={68} height={78} />
        </G>
      </Svg>

      <Animated.View style={[styles.glow, doorBox, glowStyle]} />
      <Animated.View style={[styles.door, doorBox, doorStyle]} />
    </View>
  );
}

/** Sonraki slayta çağıran, sağa sola salınan ok. */
function FlowArrow({ active, onPress }: { active: boolean; onPress: () => void }) {
  const motion = useMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (motion.reduced || !active) {
      cancelAnimation(drift);
      drift.value = 0;
      return;
    }
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(-1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    return () => cancelAnimation(drift);
  }, [active, motion.reduced, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 8 }],
  }));

  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={16}>
      <Animated.Text style={[styles.arrow, style]}>→</Animated.Text>
    </Pressable>
  );
}

export interface SlideOneProps {
  width: number;
  active: boolean;
  /** Oka dokunulunca sonraki slayta geçer. */
  onNext: () => void;
}

/**
 * Hikâyenin başlangıcı.
 *
 * Paragraflar sırayla beliriyor; anlatı, okuyanın gözüyle aynı hızda
 * açılsın diye. Her paragraf kendi gecikmesiyle giren ayrı bir katman.
 */
export default function SlideOne({ width, active, onNext }: SlideOneProps) {
  const t = useT();
  const { s } = useResponsive();

  // Bu slaydın metni uygulamadaki en uzun metin; puntolar ve satır
  // yükseklikleri ekranla birlikte küçülüyor ki kısa ekranlarda kaydırma
  // gerekmeden sığsın.
  const titleType = { fontSize: s(34), lineHeight: s(42) };
  const bodyType = { fontSize: s(15), lineHeight: s(28), marginTop: s(16) };
  const closingType = { fontSize: s(26), lineHeight: s(34), marginTop: s(32) };

  return (
    <View style={[styles.page, { width }]}>
      <Reveal active={active} scaleFrom={0.7} spring style={[styles.art, { marginBottom: s(26) }]}>
        <Corridor active={active} />
      </Reveal>

      <Reveal active={active} delay={100} offsetY={30}>
        <Text style={[styles.title, titleType]}>{t('1955. Boston, Amerika.')}</Text>
      </Reveal>

      {/* Vurgular tam cümle/öbek düzeyinde: " vardı." gibi tek başına
          anlamsız parçalar çeviri sözlüğüne anahtar olarak girseydi hem
          İngilizce sözdizimi bozulur hem aynı parça iki farklı yerde
          çakışırdı. */}
      {/* Anlatım bilerek belgesel dilinde: yalın geçmiş zaman, abartısız
          sıfat yok, sonuç "iyileşti" değil "bildirdi". Uygulamanın geri
          kalanı çalışmaları böyle anlatıyor; giriş dersinin ondan daha
          iddialı konuşması, ilk ekranda verdiği sözü bozardı. */}
      <Reveal active={active} delay={400} offsetY={16}>
        <Text style={[styles.body, bodyType]}>
          {t('Bir hasta, ')}
          <HighlightText type="negative">
            {t('aylardır geçmeyen bir ağrıyla')}
          </HighlightText>
          {t(' hastaneye başvurdu.')}
          {'\n\n'}
          <HighlightText type="negative">
            {t('Denenen ilaçlar sonuç vermedi.')}
          </HighlightText>
        </Text>
      </Reveal>

      {/* Beklentinin kurulduğu cümle mor: hikâyenin çevirdiği yer burası.
          Kırmızı şikâyeti, mor verilen sözü, yeşil sonucu gösteriyor. */}
      <Reveal active={active} delay={1200} offsetY={16}>
        <Text style={[styles.body, bodyType]}>
          {t('Dr. Henry Beecher ona bir enjeksiyon yaptı.')}
          {'\n\n'}
          <HighlightText type="science">
            {t('İçeriğinin özel olduğunu ve ağrısını mutlaka dindireceğini söyledi.')}
          </HighlightText>
          {'\n\n'}
          {t('Şırıngada')}{' '}
          <HighlightText type="positive">{t('yalnızca tuzlu su vardı.')}</HighlightText>
        </Text>
      </Reveal>

      <Reveal active={active} delay={1800} offsetY={16}>
        <Text style={[styles.body, bodyType]}>
          {t('Yirmi dakika sonra hasta,')}
          {'\n'}
          <HighlightText type="positive" italic style={styles.quoted}>
            {t('ağrısının geçtiğini bildirdi.')}
          </HighlightText>
        </Text>
      </Reveal>

      <Reveal active={active} delay={2400} offsetY={20}>
        <Text style={[styles.closing, closingType]}>
          {t('Bu uygulamanın çıkış\nnoktası o çalışma.')}
        </Text>
      </Reveal>

      <Reveal active={active} delay={2700} offsetY={10} style={styles.arrowWrap}>
        <FlowArrow active={active} onPress={onNext} />
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    // `flex: 1` YOK: sayfa artık dikey bir kaydırıcının içinde duruyor ve
    // yüksekliğini içeriğinden almalı. Flex verilseydi kaydırıcının
    // yüksekliğine sabitlenir, taşan içerik yine kesilirdi. Ortalamayı
    // kaydırıcının `justifyContent` değeri yapıyor.
    paddingHorizontal: 28,
  },
  art: { alignItems: 'center', marginBottom: 26 },
  // Ölçüler artık burada değil, `useResponsive` ile hesaplanıp bileşende
  // veriliyor — ekran küçüldüğünde çizim de küçülsün diye.
  corridor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.glow,
  },
  door: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: colors.pulse,
    backgroundColor: colors.ink,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 42,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 28,
    color: colors.haze,
    marginTop: 16,
  },
  quoted: { fontSize: 16 },
  closing: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 34,
    color: colors.white,
    marginTop: 32,
  },
  arrowWrap: { marginTop: 16 },
  arrow: {
    fontFamily: fonts.sans,
    fontSize: 22,
    color: colors.pulse,
  },
});
