import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useMotion } from '../hooks/useMotion';
import { useUser } from '../context/UserContext';
import { useT } from '../context/SettingsContext';
import { translateFormulaName } from '../i18n';
import { receiptText, shareReceipt } from '../utils/receipt';
import { haptics } from '../utils/haptics';
import type { Formula } from '../types';
import ScoreSlider from './ScoreSlider';
import PressableScale from './PressableScale';
import TransparencyPill from './TransparencyPill';

const SIZE = 132;
const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CHECK_PATH = 'M 42 68 L 58 84 L 92 46';
const CHECK_LENGTH = 72; // yaklaşık yol uzunluğu

const CIRCLE_MS = 700;
const CHECK_MS = 500;
const BURST_COUNT = 12;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface CompletionScreenProps {
  formula: Formula;
  stepCount: number;
  score: number;
  onScoreChange: (score: number) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onSave: () => void;
}

function BurstParticle({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const angle = (index / BURST_COUNT) * Math.PI * 2;
  const color = index % 2 === 0 ? colors.pulse : colors.glow;

  const style = useAnimatedStyle(() => {
    const distance = interpolate(progress.value, [0, 1], [0, 96]);
    return {
      opacity: interpolate(progress.value, [0, 0.25, 1], [0, 1, 0]),
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: interpolate(progress.value, [0, 1], [1, 0.4]) },
      ],
    };
  });

  return <Animated.View style={[styles.burstDot, { backgroundColor: color }, style]} />;
}

/**
 * Ritüel bitiş ekranı: daire çizilir → tik çizilir → parçacık patlaması,
 * ardından metinler ve puanlama sırayla belirir.
 */
export default function CompletionScreen({
  formula,
  stepCount,
  score,
  onScoreChange,
  note,
  onNoteChange,
  onSave,
}: CompletionScreenProps) {
  const motion = useMotion();
  const { user } = useUser();
  const t = useT();

  const circle = useSharedValue(0); // 0 → 1 daire çizimi
  const check = useSharedValue(0); // 0 → 1 tik çizimi
  const burst = useSharedValue(0);
  const title = useSharedValue(0);
  const question = useSharedValue(0);

  useEffect(() => {
    if (motion.reduced) {
      circle.value = 1;
      check.value = 1;
      burst.value = 0;
      title.value = 1;
      question.value = 1;
      return;
    }

    circle.value = withTiming(1, {
      duration: CIRCLE_MS,
      easing: Easing.inOut(Easing.cubic),
    });
    check.value = withDelay(
      CIRCLE_MS,
      withTiming(1, { duration: CHECK_MS, easing: Easing.out(Easing.cubic) })
    );
    // Tik tamamlanır tamamlanmaz patlama (toplam 1.2sn).
    burst.value = withDelay(
      CIRCLE_MS + CHECK_MS,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    title.value = withDelay(
      CIRCLE_MS + CHECK_MS,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    question.value = withDelay(
      CIRCLE_MS + CHECK_MS + 500,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );

    return () => {
      cancelAnimation(circle);
      cancelAnimation(check);
      cancelAnimation(burst);
      cancelAnimation(title);
      cancelAnimation(question);
    };
  }, [motion.reduced, circle, check, burst, title, question]);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - circle.value),
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - check.value),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: title.value,
    transform: [{ translateY: (1 - title.value) * 12 }],
  }));

  const questionStyle = useAnimatedStyle(() => ({
    opacity: question.value,
    transform: [{ translateY: (1 - question.value) * 12 }],
  }));

  const burstIndices = useMemo(
    () => Array.from({ length: BURST_COUNT }, (_, i) => i),
    []
  );

  const onShare = () => {
    haptics.tap();
    void shareReceipt(
      receiptText({
        formula,
        score,
        streak: user.streak,
        date: formula.generatedAt,
        t,
      })
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.markWrap}>
        <Svg width={SIZE} height={SIZE}>
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.glow}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={circleProps}
            // Çizim tepeden başlasın.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
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

        <View style={styles.burstLayer} pointerEvents="none">
          {burstIndices.map((i) => (
            <BurstParticle key={i} index={i} progress={burst} />
          ))}
        </View>
      </View>

      <Animated.View style={titleStyle}>
        <Text style={styles.title}>{t('Formül tamamlandı')}</Text>
        <Text style={styles.subtitle}>
          {formula.sham
            ? t('{formul} · bekleme', {
                formul: translateFormulaName(formula.name, t),
              })
            : t('{formul} · {adim} adım · {kelime}', {
                formul: translateFormulaName(formula.name, t),
                adim: stepCount,
                kelime: t(formula.word),
              })}
        </Text>
      </Animated.View>

      {/* Kör testin açıklaması ancak burada yapılır. */}
      {formula.sham ? (
        <Animated.View style={[styles.revealCard, questionStyle]}>
          <Text style={styles.revealTitle}>{t('Bu bir sahte ritüeldi')}</Text>
          <Text style={styles.revealText}>
            {t(
              'Bugün sana renk, ses ya da nefes verilmedi — sadece bekledin. Kör test açık olduğu için bunu önceden söylemedik. Puanın, gerçek ritüel günlerinin ortalamasıyla İstatistik ekranında karşılaştırılacak.'
            )}
          </Text>
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.scoreBlock, questionStyle]}>
        <Text style={styles.question}>{t('Nasıl hissediyorsun?')}</Text>
        <ScoreSlider value={score} onChange={onScoreChange} />

        <TextInput
          value={note}
          onChangeText={onNoteChange}
          placeholder={t('Kısa bir not bırak (isteğe bağlı)')}
          placeholderTextColor="rgba(255,255,255,0.28)"
          style={styles.noteInput}
          maxLength={140}
          multiline
        />

        <TransparencyPill
          style={styles.pill}
          text={t('⚗️ Bu puan bir ölçüm değil, senin izlenimin. Ölçtüğümüz tek şey bu.')}
        />

        <PressableScale onPress={onSave} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>{t('Kaydet')}</Text>
        </PressableScale>

        <PressableScale
          onPress={onShare}
          accessibilityRole="button"
          style={styles.secondary}
        >
          <Text style={styles.secondaryText}>{t('🧾 Makbuzu paylaş')}</Text>
        </PressableScale>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  markWrap: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.white,
    textAlign: 'center',
    marginTop: 28,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 6,
  },
  revealCard: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: colors.glow,
    borderRadius: 16,
    padding: 16,
  },
  revealTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.glow,
    marginBottom: 6,
  },
  revealText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.haze,
  },
  noteInput: {
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.white,
    textAlignVertical: 'top',
  },
  secondary: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  secondaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.haze,
  },
  scoreBlock: { marginTop: 30 },
  question: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 18,
  },
  pill: { marginTop: 24 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
