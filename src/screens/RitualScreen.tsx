import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import BreathingCircle from '../components/BreathingCircle';
import PhaseLabel from '../components/PhaseLabel';
import CountdownNumber from '../components/CountdownNumber';
import CompletionScreen from '../components/CompletionScreen';
import TransparencyPill from '../components/TransparencyPill';
import PressableScale from '../components/PressableScale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { STEP_NOTES } from '../constants/formulaPools';
import { useUser } from '../context/UserContext';
import { useSettings, useT } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import {
  breathPhases,
  breathRoundSeconds,
  factForStep,
  poolsFor,
  seedFor,
  stepSeconds,
  type BreathAction,
} from '../utils/formulaEngine';
import { playTone, prepareAudioMode, stopTone } from '../utils/audio';
import { newSessionId } from '../utils/storage';
import type { StepKind } from '../types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Ritual'>;

interface StepCopy {
  title: string;
  sub: string;
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${`${s}`.padStart(2, '0')}` : `${s}`;
}

export default function RitualScreen({ navigation, route }: Props) {
  const { formula } = route.params;
  const { recordSession } = useUser();
  const { settings } = useSettings();
  const t = useT();
  const { isPremium, packs } = usePremium();
  const pools = useMemo(() => poolsFor(isPremium, packs), [isPremium, packs]);
  const motion = useMotion();

  // Sahte ritüelde adımlar çalıştırılmaz; tek bir bekleme adımı gelir.
  const steps: StepKind[] = formula.sham ? ['color'] : formula.stepOrder;
  const seed = useMemo(
    () => seedFor(formula.generatedAt, formula.goal),
    [formula.generatedAt, formula.goal]
  );

  /** Adımın notunu havuzdan seed'e göre seçer — her ritüelde aynı olmasın. */
  const noteFor = useCallback(
    (kind: keyof typeof STEP_NOTES) => {
      const pool = STEP_NOTES[kind];
      return pool[seed % pool.length];
    },
    [seed]
  );

  const copy: Record<StepKind, StepCopy> = useMemo(
    () => ({
      color: formula.sham
        ? {
            // Sahte ritüelde de aynı çerçeve kurulur; fark sonda açıklanır.
            title: t('Otur ve bekle.'),
            sub: t('Bugün başka bir şey yapmayacaksın'),
          }
        : {
            title: t('{renk} — sadece bak.', { renk: t(formula.color.name) }),
            sub: t(noteFor('color')),
          },
      sound: {
        title: t('{ses} çalıyor. Dinle.', { ses: t(formula.sound.label) }),
        sub: t(noteFor('sound')),
      },
      breath: {
        title: t(formula.breath.label),
        sub: t(noteFor('breath')),
      },
      word: {
        title: t('Bugünün kelimesi: {kelime}', { kelime: t(formula.word) }),
        sub: t(noteFor('word')),
      },
    }),
    [formula, noteFor, t]
  );

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => stepSeconds(formula, steps[0]));
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[index];
  const totalForStep = stepSeconds(formula, step);
  const elapsedInStep = totalForStep - remaining;

  /** Nefes adımının o anki fazı, turu ve faz içinde kalan süresi. */
  const breath = useMemo(() => {
    if (step !== 'breath') return null;
    const phases = breathPhases(formula.breath.pattern);
    const roundSeconds = breathRoundSeconds(formula.breath.pattern);
    const round = Math.min(
      Math.floor(elapsedInStep / roundSeconds) + 1,
      formula.breath.rounds
    );
    const inRound = elapsedInStep % roundSeconds;

    let acc = 0;
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (inRound < acc + phase.seconds) {
        return {
          ...phase,
          left: acc + phase.seconds - inRound,
          round,
          phaseIndex: i,
        };
      }
      acc += phase.seconds;
    }
    return { ...phases[0], left: phases[0].seconds, round, phaseIndex: 0 };
  }, [step, elapsedInStep, formula.breath]);

  // Geri sayım
  useEffect(() => {
    if (finished) return;
    timer.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [index, finished]);

  // Ses adımında tonu çal, adım değişince durdur.
  useEffect(() => {
    let cancelled = false;
    // Sahte ritüelde hiç ses çalmaz. Ses seviyesi 0 ise ayardan kapalıdır.
    if (step === 'sound' && !finished && !formula.sham && settings.soundVolume > 0) {
      prepareAudioMode().then(() => {
        if (!cancelled) playTone(formula.sound.type, settings.soundVolume);
      });
    } else {
      stopTone();
    }
    return () => {
      cancelled = true;
    };
  }, [step, formula.sound.type, formula.sham, finished, settings.soundVolume]);

  // Ekran tamamen kapanırken sönümü bekletecek bir şey kalmıyor; anında kes.
  useEffect(() => () => stopTone(true), []);

  const goNext = useCallback(() => {
    stopTone();
    if (index < steps.length - 1) {
      const next = index + 1;
      haptics.step();
      setIndex(next);
      setRemaining(stepSeconds(formula, steps[next]));
    } else {
      haptics.success();
      setFinished(true);
    }
  }, [index, steps, formula]);

  useEffect(() => {
    if (remaining === 0 && !finished) goNext();
  }, [remaining, finished, goNext]);

  const exit = () => {
    stopTone();
    navigation.goBack();
  };

  const complete = () => {
    recordSession({
      id: newSessionId(),
      date: formula.generatedAt,
      formulaId: formula.id,
      goal: formula.goal,
      score,
      steps: [...steps],
      formulaName: formula.name,
      colorHex: formula.color.hex,
      crisis: formula.crisis,
      sham: formula.sham,
      dose: formula.dose ?? 1,
      note: note.trim() || undefined,
    });
    navigation.goBack();
  };

  // İlerleme çubuğu
  const target = finished
    ? 1
    : (index + (totalForStep ? elapsedInStep / totalForStep : 0)) / steps.length;
  const progress = useDerivedValue(
    () => (motion.reduced ? target : withTiming(target, { duration: 400 })),
    [target, motion.reduced]
  );
  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, progress.value * 100)}%`,
  }));

  if (finished) {
    return (
      <Screen background={colors.ink} topInset={false}>
        <CompletionScreen
          formula={formula}
          stepCount={steps.length}
          score={score}
          onScoreChange={setScore}
          note={note}
          onNoteChange={setNote}
          onSave={complete}
        />
      </Screen>
    );
  }

  // Bulgu, o an ekranda olan şeyle uyuşur: ses adımında çalan sesin,
  // nefes adımında uygulanan desenin bulgusu gösterilir.
  const fact = t(factForStep(formula, step, index, pools));
  const action: BreathAction = breath ? breath.action : 'inhale';
  const phaseSecondsValue = breath ? breath.seconds : totalForStep;
  const phaseKey = breath
    ? `${index}-${breath.round}-${breath.phaseIndex}`
    : `${index}`;

  return (
    <Screen background={colors.ink} style={styles.container}>
      <View style={styles.topBar}>
        <PressableScale onPress={exit} accessibilityRole="button" style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </PressableScale>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.stepCount}>
          {index + 1}/{steps.length}
        </Text>
      </View>

      <View style={styles.center}>
        <BreathingCircle
          pattern={formula.breath.pattern}
          action={action}
          phaseSeconds={phaseSecondsValue}
          phaseKey={phaseKey}
          colorHex={formula.color.hex}
          word={step === 'color' ? undefined : t(formula.word)}
          // Renk ve ses adımlarında faz yok; daire kendi nabzıyla döner.
          ambient={step !== 'breath'}
        />
      </View>

      <PhaseLabel
        text={
          breath
            ? t('{faz} · {tur}. tur', { faz: t(breath.label), tur: breath.round })
            : copy[step].title
        }
      />
      <Text style={styles.subText}>{breath ? copy.breath.sub : copy[step].sub}</Text>

      <CountdownNumber
        value={breath ? `${breath.left}` : formatTime(remaining)}
        style={styles.counter}
      />

      <View style={styles.bottom}>
        <TransparencyPill text={fact} />

        <PressableScale
          onPress={goNext}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {t(index === steps.length - 1 ? 'Ritüeli Bitir →' : 'Sonraki Adım →')}
          </Text>
        </PressableScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  back: { paddingRight: 14, paddingVertical: 6 },
  backText: { fontSize: 20, color: colors.haze },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.pulse,
  },
  stepCount: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.haze,
    marginLeft: 14,
    minWidth: 30,
    textAlign: 'right',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    color: colors.white,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: 8,
  },
  counter: { marginTop: 16 },
  // Alt güvenli alan `Screen` tarafından ekleniyor.
  bottom: { paddingBottom: 16, marginTop: 26 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
