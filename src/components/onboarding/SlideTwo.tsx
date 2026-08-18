import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import SlideShell from './SlideShell';
import Reveal from './Reveal';
import HighlightText from './HighlightText';
import { useResponsive } from '../../hooks/useResponsive';
import WordReveal from './WordReveal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useMotion } from '../../hooks/useMotion';
import { useT } from '../../context/SettingsContext';

const W = 220;
const H = 150;

/** Beynin içinde ateşlenen nöronlar — her biri kendi ritminde yanıp söner. */
const NEURONS: { x: number; y: number; delay: number }[] = [
  { x: 74, y: 54, delay: 0 },
  { x: 104, y: 44, delay: 260 },
  { x: 132, y: 58, delay: 520 },
  { x: 88, y: 78, delay: 180 },
  { x: 118, y: 84, delay: 640 },
  { x: 146, y: 76, delay: 400 },
  { x: 96, y: 102, delay: 760 },
  { x: 128, y: 106, delay: 320 },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Neuron({ x, y, delay, active }: { x: number; y: number; delay: number; active: boolean }) {
  const motion = useMotion();
  const glow = useSharedValue(0.15);

  useEffect(() => {
    if (motion.reduced || !active) {
      cancelAnimation(glow);
      glow.value = 0.5;
      return;
    }
    glow.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
    return () => cancelAnimation(glow);
  }, [active, delay, motion.reduced, glow]);

  // SVG düğümlerinde opaklık `style` yerine `animatedProps` üzerinden
  // veriliyor: react-native-svg bunu doğrudan yerel niteliğe yazıyor.
  const props = useAnimatedProps(() => ({ opacity: glow.value }));

  return <AnimatedCircle cx={x} cy={y} r={3.4} fill={colors.glow} animatedProps={props} />;
}

/** Beyin — tek parça çizgi konturu, içinde ateşlenen noktalar. */
function Brain({ active }: { active: boolean }) {
  // Çizim ekranla birlikte küçülüyor; viewBox sabit olduğu için oranlar
  // korunuyor.
  const { s } = useResponsive();
  const w = s(W);
  const h = s(H);

  return (
    <View style={[styles.art, { width: w, height: h }]}>
      <Svg width={w} height={h} viewBox="0 0 220 150">
        <Path
          d="M62 96 C40 92 34 68 50 54 C46 34 66 22 84 30 C94 16 118 16 128 30 C148 22 170 34 166 54 C182 68 176 92 154 96 C152 116 132 128 116 120 C106 130 90 128 84 118 C70 122 60 112 62 96 Z"
          stroke={colors.pulse}
          strokeWidth={1.4}
          fill="none"
          opacity={0.8}
        />
        {/* İç kıvrımlar */}
        <Path
          d="M108 26 L108 120 M84 44 C98 50 96 66 84 70 M136 44 C122 50 124 66 136 70 M78 92 C92 88 100 98 96 110 M142 92 C128 88 120 98 124 110"
          stroke={colors.pulse}
          strokeWidth={1}
          fill="none"
          opacity={0.4}
        />
        {NEURONS.map((n, i) => (
          <Neuron key={i} x={n.x} y={n.y} delay={n.delay} active={active} />
        ))}
      </Svg>
    </View>
  );
}

export default function SlideTwo({ width, active }: { width: number; active: boolean }) {
  const t = useT();

  return (
    <SlideShell
      active={active}
      width={width}
      art={
        <View style={styles.wrap}>
          <Brain active={active} />
          <View style={styles.quote}>
            <WordReveal
              active={active}
              delay={600}
              style={styles.quoteText}
              text={t(
                '“Beyin bir sinyal aldığında ‘bu işe yarayacak’ diye karar verirse — gerçekten işe yarıyor.”'
              )}
            />
          </View>
        </View>
      }
      title={t('Buna beklenti etkisi deniyor.')}
    >
      {/* Gövde düz metin değil: renkler anlam taşıdığı için parçalara
          bölündü. Kırmızı şikâyeti, yeşil sonucu, mor bilimsel terimi
          gösteriyor — aynı düzen sonraki slaytlarda da sürüyor. */}
      <Reveal active={active} delay={250} offsetY={20}>
        <Text style={styles.body}>
          {t('Beyin, inanılan şeyi\ngerçekleştirmek için\n')}
          <HighlightText type="positive">{t('gerçek kimyasallar')}</HighlightText>
          {t(' salgılıyor.')}
          {'\n\n'}
          <HighlightText type="science">{t('Endorfin.')}</HighlightText>
          {' '}
          <HighlightText type="positive">{t('Dopamin.')}</HighlightText>
          {' '}
          <HighlightText type="key">{t('Serotonin.')}</HighlightText>
          {'\n\n'}
          <HighlightText type="negative">{t('Sahte bir tetikleyici')}</HighlightText>
          {','}
          {'\n'}
          <HighlightText type="positive" italic>
            {t('gerçek bir sonuç')}
          </HighlightText>
          {'.'}
        </Text>
      </Reveal>
    </SlideShell>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', alignItems: 'center' },
  // Ölçü bileşende hesaplanıyor (bkz. `Brain`).
  art: {},
  quote: { marginTop: 10, alignSelf: 'stretch' },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 28,
    color: colors.haze,
    marginTop: 14,
  },
  quoteText: {
    fontFamily: fonts.serifItalic,
    fontSize: 17,
    lineHeight: 27,
    color: colors.white,
  },
});
