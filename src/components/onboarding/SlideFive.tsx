import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reveal from './Reveal';
import SlideShell from './SlideShell';
import HighlightText from './HighlightText';
import QuoteBox from './QuoteBox';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useMotion } from '../../hooks/useMotion';
import { useT } from '../../context/SettingsContext';

const COUNT_MS = 1400;

/** Sayan rakam — 1,4 saniyede easeOut ile hedefe çıkar. */
function CountUp({ to, active, delay }: { to: number; active: boolean; delay: number }) {
  const motion = useMotion();
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stop = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (timer.current !== null) clearTimeout(timer.current);
    };
    stop();
    if (!active) {
      setValue(0);
      return;
    }
    if (motion.reduced) {
      setValue(to);
      return;
    }
    timer.current = setTimeout(() => {
      const started = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now() - started) / COUNT_MS);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    }, delay);
    return stop;
  }, [active, delay, motion.reduced, to]);

  return <Text style={styles.percent}>%{value}</Text>;
}

const GROUPS: { label: string; percent: number }[] = [
  { label: '“İşe yaramaz” diye başlayanlar', percent: 71 },
  { label: '“Saçmalık” diyenler', percent: 68 },
  { label: 'Doktorlar', percent: 74 },
  { label: 'Psikologlar', percent: 69 },
  { label: 'Mühendisler', percent: 72 },
];

/**
 * "İnanmak zorunda değilsin" — şüpheci okuyucuya yazılmış slayt.
 *
 * Anlatı paragraf paragraf açılıyor; ortadaki alıntı kutusu, deneyde
 * hastalara söylenen cümlenin kendisi. Sondaki büyük rakam yaylanarak
 * geliyor ve kaynağı hemen altında duruyor.
 */
export default function SlideFive({ width, active }: { width: number; active: boolean }) {
  const t = useT();

  return (
    <SlideShell
      active={active}
      width={width}
      art={
        <View style={styles.art}>
          <Text style={styles.question} pointerEvents="none">
            ?
          </Text>

          <View style={styles.head}>
            <Text style={styles.headLeft}>{t('Şüpheciler de dahil')}</Text>
            <Text style={styles.headRight}>{t('olumlu etki bildirdi')}</Text>
          </View>

          {GROUPS.map((group, i) => (
            <Reveal key={group.label} active={active} delay={i * 140} offsetY={12} style={styles.row}>
              <View style={styles.rowInner}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.label} numberOfLines={1}>
                  {t(group.label)}
                </Text>
                <CountUp to={group.percent} active={active} delay={300 + i * 140} />
              </View>
            </Reveal>
          ))}

          <View style={styles.rule} />

          <Reveal active={active} delay={900} offsetY={8}>
            <Text style={styles.disclaimer}>{t('* Temsili dağılım')}</Text>
          </Reveal>
        </View>
      }
      title={t('İnanmak zorunda değilsin.')}
    >
      <Reveal active={active} delay={250} offsetY={18}>
        <Text style={styles.body}>{t('2010 yılında Harvard’da\nbir deney yapıldı.')}</Text>
      </Reveal>

      <Reveal active={active} delay={650} offsetY={18}>
        <Text style={styles.body}>
          <HighlightText type="negative">{t('Kronik ağrısı')}</HighlightText>
          {t(' olan hastalara\nküçük bir hap verildi.')}
        </Text>
      </Reveal>

      <Reveal active={active} delay={1050} offsetY={18} style={styles.quoteWrap}>
        <QuoteBox>
          <Text style={styles.quote}>
            {t('Tedaviniz için bu hapı kullanacaksınız.')}
            {'\n\n'}
            {t('Ancak bu hap tamamen ')}
            <HighlightText type="positive" italic>
              {t('şekerden yapılmış')}
            </HighlightText>
            {'. '}
            <HighlightText type="negative" italic strike>
              {t('İçinde hiçbir etken madde yok.')}
            </HighlightText>
            {'\n\n'}
            {t('Yine de ')}
            <HighlightText type="positive" italic>
              {t('fayda görebilirsiniz')}
            </HighlightText>
            {'.'}
          </Text>
        </QuoteBox>
      </Reveal>

      <Reveal active={active} delay={1650} offsetY={18}>
        <Text style={styles.body}>
          {t('Hastalar hapı aldı.')}
          {'\n\n'}
          {t('Hapın plasebo olduğunu\n')}
          <HighlightText type="science" bold italic>
            {t('bildikleri halde...')}
          </HighlightText>
        </Text>
      </Reveal>

      <Reveal active={active} delay={2450} offsetY={0} scaleFrom={0.8} spring>
        <Text style={styles.result}>{t('%59’u iyileşme bildirdi.')}</Text>
      </Reveal>

      <Reveal active={active} delay={2650} offsetY={8}>
        <Text style={styles.source}>
          {t('— Kaptchuk et al., Harvard Medical School, 2010')}
        </Text>
      </Reveal>
    </SlideShell>
  );
}

const styles = StyleSheet.create({
  art: { alignSelf: 'stretch', justifyContent: 'center' },
  question: {
    position: 'absolute',
    alignSelf: 'center',
    top: -14,
    fontFamily: fonts.serif,
    fontSize: 120,
    color: colors.pulse,
    opacity: 0.15,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  headLeft: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  headRight: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
  },
  row: { marginBottom: 8 },
  rowInner: { flexDirection: 'row', alignItems: 'center' },
  check: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.glow,
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
  },
  percent: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.pulse,
    marginLeft: 10,
    minWidth: 48,
    textAlign: 'right',
  },
  rule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 6,
  },
  disclaimer: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.6,
    marginTop: 8,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 28,
    color: colors.haze,
    marginTop: 14,
  },
  quoteWrap: { marginTop: 18 },
  quote: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    lineHeight: 26,
    color: colors.white,
  },
  result: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.glow,
    textAlign: 'center',
    marginTop: 22,
  },
  source: {
    fontFamily: fonts.serifItalic,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 6,
  },
});
