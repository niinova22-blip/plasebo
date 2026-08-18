import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { translateFormulaName } from '../i18n';
import { useMotion } from '../hooks/useMotion';
import type { Formula, StepKind } from '../types';
import { packSourceFor } from '../constants/packs';
import { packById } from '../constants/plans';
import { STEP_ICONS, STEP_LABELS, breathTotalSeconds } from '../utils/formulaEngine';
import FormulaStep from './FormulaStep';
import PressableScale from './PressableScale';
import RadialGlow from './RadialGlow';

export interface FormulCardProps {
  formula: Formula;
  onStart: () => void;
  doneToday?: boolean;
}

export default function FormulCard({ formula, onStart, doneToday }: FormulCardProps) {
  const motion = useMotion();
  const theme = useTheme();
  const t = useT();
  const glow = useSharedValue(0.3);

  useEffect(() => {
    if (motion.reduced) {
      glow.value = 0.3;
      return;
    }
    // Sağ üst köşedeki ışıma sürekli nefes alıyor (3sn tur).
    glow.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    return () => cancelAnimation(glow);
  }, [motion.reduced, glow]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  /** Öğe bir içerik paketinden geldiyse paketin kısa adı. */
  const tagFor = (kind: StepKind, value: string) => {
    const id = packSourceFor(kind, value);
    return id ? packById(id)?.shortName : undefined;
  };

  /** Adım satırlarını formülün kendi sırasına göre çiziyoruz. */
  const rows = formula.stepOrder.map((step) => {
    switch (step) {
      case 'color':
        return {
          key: step,
          swatch: formula.color.hex,
          // Hex kodu kullanıcıya bir şey söylemiyordu; rengin adı yeterli.
          detail: t(formula.color.name),
          duration: t('{sure} sn', { sure: formula.color.duration }),
          tag: tagFor('color', formula.color.name),
        };
      case 'sound':
        return {
          key: step,
          swatch: colors.pulse,
          detail: t(formula.sound.label),
          duration: t('{sure} sn', { sure: formula.sound.duration }),
          tag: tagFor('sound', formula.sound.label),
        };
      case 'breath':
        return {
          key: step,
          swatch: colors.glow,
          detail: t('{ad} · ~{sure} sn', {
            ad: t(formula.breath.label),
            sure: breathTotalSeconds(formula),
          }),
          duration: t('{tur} tur', { tur: formula.breath.rounds }),
          tag: tagFor('breath', formula.breath.label),
        };
      default:
        return {
          key: step,
          swatch: colors.haze,
          detail: t(formula.word),
          duration: t('{sure} sn', { sure: 12 }),
          tag: tagFor('word', formula.word),
        };
    }
  });

  return (
    <PressableScale
      onPress={onStart}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={t('{formul} ritüelini başlat', {
        formul: translateFormulaName(formula.name, t),
      })}
      style={[styles.card, { backgroundColor: theme.inkCard }]}
    >
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
        <RadialGlow id="formulGlow" size={220} color={colors.pulse} intensity={0.9} />
      </Animated.View>

      <Text style={styles.eyebrow}>
        {t(formula.crisis ? 'KRİZ FORMÜLÜ' : 'BUGÜNÜN FORMÜLÜ')}
      </Text>
      <Text style={styles.title}>{translateFormulaName(formula.name, t)}</Text>
      <Text style={styles.disclaimer}>
        {t('⚗️ Etken madde yok — etki var. Bu bir beklenti protokolü.')}
      </Text>

      <View style={styles.steps}>
        {rows.map((row, i) => (
          <FormulaStep
            key={row.key}
            swatch={row.swatch}
            icon={STEP_ICONS[row.key]}
            label={t(STEP_LABELS[row.key])}
            detail={row.detail}
            duration={row.duration}
            tag={row.tag ? t(row.tag) : undefined}
            last={i === rows.length - 1}
          />
        ))}
      </View>

      <PressableScale onPress={onStart} accessibilityRole="button" style={styles.button}>
        <Text style={styles.buttonText}>
          {t('▶ Başlat')}
        </Text>
      </PressableScale>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -110,
    right: -90,
  },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.haze,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.white,
    marginTop: 6,
  },
  disclaimer: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.glow,
    marginTop: 6,
  },
  steps: { marginTop: 16, marginBottom: 18 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.white,
  },
});
