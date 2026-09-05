import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useAudioRecorder,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import Screen from '../components/Screen';
import BreathingCircle from '../components/BreathingCircle';
import PhaseLabel from '../components/PhaseLabel';
import CountdownNumber from '../components/CountdownNumber';
import CompletionScreen from '../components/CompletionScreen';
import RisingBubbles from '../components/RisingBubbles';
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
import { getCachedHealthSnapshot } from '../utils/health';
import {
  breathPhases,
  breathRoundSeconds,
  factForStep,
  MOOD_ADJUST_THRESHOLD,
  poolsFor,
  seedFor,
  stepSeconds,
  type BreathAction,
} from '../utils/formulaEngine';
import { playTone, prepareAudioMode, stopTone } from '../utils/audio';
import {
  breathMetricsFrom,
  type BreathAnalysis,
  type MeteringSample,
} from '../utils/breathSignal';
import { newSessionId } from '../utils/storage';
import { resolveComplaint } from '../constants/complaints';
import { getDailyWord, motivationCategory } from '../constants/motivationWords';
import { pacedLines, storyFor, storyLineIndex } from '../constants/calmingStories';
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
  const { formula, complaintId, customText, scoreBefore, faceMoodScore, reactionBeforeMs } =
    route.params;
  const { user, recordSession } = useUser();
  /** Ritüelin gerçekte ne kadar sürdüğü — seans özetinde gösteriliyor. */
  const startedAt = useRef(Date.now());
  const { settings } = useSettings();
  const t = useT();
  const { isPremium, packs, limits } = usePremium();
  const pools = useMemo(() => poolsFor(isPremium, packs), [isPremium, packs]);
  const motion = useMotion();

  // Sahte ritüelde adımlar çalıştırılmaz; tek bir bekleme adımı gelir.
  //
  // `useMemo` şart: dizi her render'da yeniden üretildiğinde `goNext`
  // geri çağrısı da yenileniyor, o da geri sayım efektini her render'da
  // yeniden kuruyordu. Ritüel ekranı saniyede bir render alan, animasyon
  // yüklü bir ekran; bu, düşük donanımlı cihazda ilk tökezleyecek yerdi.
  const steps: StepKind[] = useMemo(
    () => (formula.sham ? ['color'] : formula.stepOrder),
    [formula.sham, formula.stepOrder]
  );
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

  /**
   * Ritüelin ortasında duran motivasyon kelimesi.
   *
   * Şikâyete zıt ama umut veren bir kelime seçiliyor: "kafam dağınık"
   * diyene BERRAK, "kalkamıyorum" diyene BAŞLA. Şikâyet yoksa (ana
   * ekrandan doğrudan başlatılan günlük formül) formülün kendi kelimesi
   * kullanılıyor, böylece merkez hiç boş kalmıyor.
   */
  const motivationWord = useMemo(() => {
    const complaint = resolveComplaint(complaintId, customText);
    if (!complaint) return null;
    const category = motivationCategory(complaint.category, complaint.goal);
    return getDailyWord(category, user.streak);
  }, [complaintId, customText, user.streak]);

  /**
   * Ritüel boyunca akan metin.
   *
   * Hikâye güne göre seçiliyor (aynı gün tekrar edilirse metin
   * değişmesin) ve ritüelin **tamamına** yayılıyor: satır başına düşen
   * süre toplam süreden hesaplandığı için son satır, son saniyede
   * ekranda duran satır oluyor.
   *
   * Doz da hesaba giriyor: çift doz bütün süreleri ikiye katladığı için
   * metin de iki hikâye uzunluğunda geliyor, böylece satır başına düşen
   * süre dozdan bağımsız olarak üç ilâ dört saniyede kalıyor.
   */
  const story = useMemo(() => storyFor(seed, formula.dose ?? 1), [seed, formula.dose]);
  const totalRitualSeconds = useMemo(
    () => steps.reduce((sum, kind) => sum + stepSeconds(formula, kind), 0),
    [steps, formula]
  );

  /**
   * Ekranda gerçekten görünecek satırlar.
   *
   * Havuzdaki 45 satırın hepsi gösterilseydi satır başına üç saniye
   * düşerdi; `pacedLines` süreyi bölerek her satıra yedi buçuk saniye
   * kalacak kadarını seçiyor.
   */
  const lines = useMemo(
    () => pacedLines(story.lines, totalRitualSeconds),
    [story, totalRitualSeconds]
  );

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => stepSeconds(formula, steps[0]));
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[index];

  /**
   * Nefes adımı sırasında mikrofon genliği örneklenir; ses hiçbir yere
   * kaydedilmez/gönderilmez, sadece anlık genlik (dB) okunur. İzin
   * verilmezse ya da bir hata olursa ritüel sessizce sürer — bu sinyal
   * hiçbir zaman akışı durdurmaz.
   */
  const breathRecorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });
  const breathSamplesRef = useRef<MeteringSample[]>([]);
  const breathStartRef = useRef(0);
  const breathPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Kayıt bir kez durduruldu mu — serbest bırakılmış kaydediciye iki kez dokunmamak için. */
  const breathStoppedRef = useRef(false);
  const breathRegularityRef = useRef<number | undefined>(undefined);
  /**
   * Aynı kayıttan çıkan diğer ölçütler (dakikadaki nefes, derinlik).
   * Düzenlilikle birlikte hesaplanıyor; ayrı bir izin ya da ikinci bir
   * kayıt gerektirmiyor.
   */
  const breathMetricsRef = useRef<BreathAnalysis | undefined>(undefined);
  /** Ölçüm çıkmadıysa nedeni — ölçüm ekranında açık bir mesaja çevrilir. */
  const breathMicOutcomeRef = useRef<'denied' | 'no-mic-data' | 'no-signal' | undefined>(undefined);
  /**
   * Mikrofonun o anki durumu — ekranda görünür bir gösterge olsun diye.
   * Önceki sürümde bu tamamen sessiz çalışıyordu; kullanıcı ne olduğunu
   * göremiyordu ("çalışmıyor" gibi görünüyordu).
   */
  const [micStatus, setMicStatus] = useState<
    'idle' | 'requesting' | 'listening' | 'denied' | 'error'
  >('idle');
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

  /**
   * Faz değişiminde titreşim.
   *
   * Yönerge daha önce yalnızca ekranın altındaki yazıdaydı ve onu okumak
   * için bakışın dairenin merkezinden ayrılması gerekiyordu — "ne zaman
   * alacağımı anlamıyorum, aşağı bakınca da odağım kaçıyor" şikâyeti tam
   * olarak buydu. Titreşim aynı bilgiyi bakmadan veriyor.
   *
   * Tetikleyici, fazın kimliği: tur numarası + faz sırası. Süreye ya da
   * `action` alanına bakılsaydı arka arkaya gelen iki "al" fazı
   * (fizyolojik iç çekişte var) tek bir faz sanılırdı.
   */
  const lastPhaseRef = useRef<string | null>(null);
  useEffect(() => {
    if (!breath || finished) {
      lastPhaseRef.current = null;
      return;
    }
    const key = `${breath.round}-${breath.phaseIndex}`;
    if (lastPhaseRef.current === key) return;
    lastPhaseRef.current = key;

    if (breath.action === 'inhale') haptics.breathInhale();
    else if (breath.action === 'hold') haptics.breathHold();
    else if (breath.action === 'exhale') haptics.breathExhale();
    // 'pause' bilerek sessiz: beklemenin işareti hiçbir şey olmaması.
  }, [breath, finished]);

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

  /**
   * Mikrofon kaydını güvenle durdurur.
   *
   * Ekran kapanırken `useAudioRecorder` kaydediciyi native tarafta serbest
   * bırakıyor. Kayıt hâlâ sürerken ekranı kapatmak, bizim `stop()`
   * çağrımızla o serbest bırakma işlemini aynı ana getiriyordu ve
   * uygulama anında çöküyordu — nokta atışı reçete akışında ritüel
   * ekranı ölçüm ekranıyla **değiştirildiği** için tam olarak bu oluyordu.
   * Ana ekrandan başlatılan ritüelde ekran açık kaldığından aynı hata
   * görünmüyordu.
   *
   * Bu yüzden kayıt artık her zaman gezinmeden **önce** ve tek seferde
   * durduruluyor; `stopped` bayrağı ikinci çağrının serbest bırakılmış
   * kaydediciye dokunmasını engelliyor.
   */
  const stopBreathCapture = useCallback(async () => {
    if (breathPollRef.current) {
      clearInterval(breathPollRef.current);
      breathPollRef.current = null;
    }
    if (breathStoppedRef.current) return;
    breathStoppedRef.current = true;
    try {
      if (breathRecorder.isRecording) await breathRecorder.stop();
    } catch {
      // yoksay — ölçüm bir kolaylık, ritüelin koşulu değil.
    }
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // yoksay
    }
  }, [breathRecorder]);

  /**
   * Ekran hangi yoldan kapanırsa kapansın kayıt önce durur.
   *
   * `goNext` ve geri düğmesi kaydı zaten kendileri durduruyor; ama iOS'ta
   * ekrandan kenardan kaydırarak da çıkılabiliyor ve o yol hiçbirinden
   * geçmiyor. `beforeRemove`, ekran gezinme ağacından çıkarılmadan önce
   * çalışan tek ortak nokta — çökmeye yol açan yarış burada da kapanıyor.
   */
  useEffect(
    () => navigation.addListener('beforeRemove', () => void stopBreathCapture()),
    [navigation, stopBreathCapture]
  );

  // Nefes adımı boyunca mikrofon genliği örneklenir; adım bitince
  // `goNext` bu örneklerden düzenlilik skorunu çıkarır. Durum, ekranda
  // görünen `micStatus`'a yazılıyor — kullanıcı ne olduğunu görebilsin.
  useEffect(() => {
    /*
     * Nefes analizi Plus'a ait.
     *
     * Kapalıyken mikrofon izni **hiç istenmiyor**: ölçümü yapmayacaksak
     * izin sormak hem anlamsız hem de kullanıcıya yanlış bir şey vaat
     * ediyor. Ritüelin nefes adımı aynen çalışmaya devam ediyor — kilit
     * ölçümde, ritüelde değil.
     */
    if (step !== 'breath' || finished || formula.sham || !limits.breathAnalysis) {
      setMicStatus('idle');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setMicStatus('requesting');
        const current = await getRecordingPermissionsAsync();
        const granted = current.granted
          ? true
          : (await requestRecordingPermissionsAsync()).granted;
        if (cancelled) return;
        if (!granted) {
          setMicStatus('denied');
          return;
        }
        // iOS'ta `allowsRecording` açık olmadan `record()` sessizce hiçbir
        // şey kaydetmiyor — ses oturumunun kayda izin verdiğini burada
        // açıkça belirtiyoruz, adım bitince kapatıyoruz.
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        if (cancelled) return;
        breathSamplesRef.current = [];
        breathStartRef.current = Date.now();
        breathStoppedRef.current = false;

        /*
         * `prepareToRecordAsync` ATLANAMAZ ve seçenekler ona da verilmeli.
         *
         * expo-audio'da kaydedici önce hazırlanmak zorunda; hazırlanmadan
         * çağrılan `record()` hata fırlatmıyor, sessizce hiçbir şey
         * yapmıyor. Sonuç: `getStatus().metering` hep `null` dönüyor, tek
         * bir örnek bile toplanmıyor ve nefes ölçümü her seferinde
         * "sinyal yok" ile bitiyordu. Kullanıcı ortam sesi vererek
         * denediğinde de aynı sonucu alıyordu, çünkü mikrofon hiç
         * dinlemiyordu.
         *
         * Kaydedici `stop()` sonrası geçersizleşiyor, bu yüzden hazırlık
         * her nefes adımında yeniden yapılıyor.
         *
         * Seçenekler burada bir kez daha veriliyor: `isMeteringEnabled`
         * hazırlık aşamasında geçerli değilse `getStatus().metering`
         * tanımsız dönüyor ve ortada kayıt varken bile tek bir örnek
         * toplanmıyor.
         */
        await breathRecorder.prepareToRecordAsync({
          ...RecordingPresets.LOW_QUALITY,
          isMeteringEnabled: true,
        });
        if (cancelled) return;

        breathRecorder.record();
        setMicStatus('listening');
        breathPollRef.current = setInterval(() => {
          const status = breathRecorder.getStatus();
          if (status.metering != null) {
            breathSamplesRef.current.push({
              t: Date.now() - breathStartRef.current,
              db: status.metering,
            });
          }
        }, 200);
      } catch {
        if (!cancelled) setMicStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      void stopBreathCapture();
    };
  }, [step, finished, formula.sham, limits.breathAnalysis, breathRecorder, stopBreathCapture]);

  const goNext = useCallback(async () => {
    stopTone();

    // Nefes adımından çıkılıyor: örnekler henüz elde, ekran değişmeden
    // önce düzenlilik skorunu hesaplıyoruz. Kayıt da burada, gezinmeden
    // önce durduruluyor (bkz. `stopBreathCapture`).
    if (step === 'breath') {
      await stopBreathCapture();
      if (breathSamplesRef.current.length) {
        // Beklenen tur süresi de veriliyor: ölçülen ritim uygulamanın
        // dayattığı ritme yakın değilse (gürültü, konuşma, müzik) sonuç
        // reddediliyor — sahte bir sayı üretilmiyor.
        breathMetricsRef.current =
          breathMetricsFrom(
            breathSamplesRef.current,
            breathRoundSeconds(formula.breath.pattern) * 1000
          ) ?? undefined;
        breathRegularityRef.current = breathMetricsRef.current?.regularity;
      }
      // Sonuç ölçüm ekranında da görünsün diye bir sonuca dönüştürülüyor:
      // ölçü çıktıysa ayrıca bir not gerekmez, çıkmadıysa nedeni taşınır.
      /*
       * Başarısızlığın nedeni ayrıştırılıyor.
       *
       * Eskiden izin dışındaki her durum "sinyal yok" diye tek bir
       * mesaja düşüyordu ve iki tamamen farklı arıza aynı görünüyordu:
       * (a) mikrofon hiç çalışmadı, tek örnek bile gelmedi; (b) mikrofon
       * çalıştı ama gelen sinyal nefes gibi görünmedi. Birincisi bir
       * yazılım hatası, ikincisi ölçümün kendi kararı — ayrı yazmazsak
       * hangisinin olduğunu anlamanın yolu yok.
       */
      if (breathRegularityRef.current == null) {
        breathMicOutcomeRef.current =
          micStatus === 'denied'
            ? 'denied'
            : breathSamplesRef.current.length === 0
              ? 'no-mic-data'
              : 'no-signal';
      }
    }

    if (index < steps.length - 1) {
      const next = index + 1;
      haptics.step();
      setIndex(next);
      setRemaining(stepSeconds(formula, steps[next]));
      return;
    }

    haptics.success();

    // Şikayet akışından gelindiyse kayıt burada değil, ölçüm ekranında
    // yazılıyor: "sonra" puanı olmadan seansın yarısı eksik kalır.
    if (complaintId && scoreBefore !== undefined) {
      navigation.replace('ScoreAfter', {
        complaintId,
        customText,
        formula,
        scoreBefore,
        durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        steps: [...steps],
        faceMoodScore,
        reactionBeforeMs,
        breathRegularity: breathRegularityRef.current,
        breathsPerMinute: breathMetricsRef.current?.breathsPerMinute,
        breathDepth: breathMetricsRef.current?.depth,
        breathMicOutcome: breathMicOutcomeRef.current,
      });
      return;
    }

    setFinished(true);
  }, [
    index,
    steps,
    formula,
    complaintId,
    customText,
    scoreBefore,
    faceMoodScore,
    reactionBeforeMs,
    step,
    micStatus,
    navigation,
    stopBreathCapture,
  ]);

  useEffect(() => {
    if (remaining === 0 && !finished) void goNext();
  }, [remaining, finished, goNext]);

  // Geri çıkışta da kayıt önce durduruluyor: ekran burada da kapanıyor,
  // yani `stopBreathCapture`'daki çakışma riski birebir aynı.
  const exit = async () => {
    stopTone();
    await stopBreathCapture();
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
      faceMoodBefore: faceMoodScore,
      reactionBeforeMs,
      breathRegularity: breathRegularityRef.current,
      // Sağlık verisi açıksa o günün bağlamı da kayda giriyor: haftalık
      // desen kartı uykuyla puanı ancak ikisi aynı kayıtta durursa
      // karşılaştırabiliyor.
      sleepMinutes: getCachedHealthSnapshot()?.sleepMinutes ?? undefined,
      restingHeartRate: getCachedHealthSnapshot()?.restingHeartRate ?? undefined,
      breathsPerMinute: breathMetricsRef.current?.breathsPerMinute,
      breathDepth: breathMetricsRef.current?.depth,
    });
    navigation.goBack();
  };

  /**
   * Adım değişimi yumuşak geçsin.
   *
   * Renk → ses → nefes geçişinde başlık, alt not ve bulgu aynı anda
   * yerinde değişiyordu; üç metnin birden takla atması, ritüelin
   * ortasında sert bir kesme gibi duruyordu. Şimdi hepsi birlikte kısa
   * bir süre sönüp aşağıdan yerine yerleşiyor.
   */
  const stepFade = useSharedValue(1);
  useEffect(() => {
    if (motion.reduced) {
      stepFade.value = 1;
      return;
    }
    stepFade.value = 0;
    stepFade.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [index, motion.reduced, stepFade]);

  const stepTextStyle = useAnimatedStyle(() => ({
    opacity: stepFade.value,
    transform: [{ translateY: (1 - stepFade.value) * 12 }],
  }));

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
          breathRegularity={breathRegularityRef.current}
          breathMicOutcome={breathMicOutcomeRef.current}
        />
      </Screen>
    );
  }

  // Bulgu, o an ekranda olan şeyle uyuşur: ses adımında çalan sesin,
  // nefes adımında uygulanan desenin bulgusu gösterilir. İlk adımda,
  // kamera kullanıldıysa gerçek karşılığı olan bir mesaj bunun yerine
  // geçer — kötü ruh halinde bir tur eklendiğini de burada söylüyoruz.
  const moodInsight =
    index === 0 && faceMoodScore != null && faceMoodScore >= MOOD_ADJUST_THRESHOLD
      ? t(
          '🤖 Yapay zeka duygularını anladı: bugünkü ritüele ekstra bir sakinleştirme turu eklendi.'
        )
      : null;
  const fact = moodInsight ?? t(factForStep(formula, step, index, pools));

  /**
   * Akan metnin o anki cümlesi.
   *
   * Geçen süre, tamamlanan adımların toplamına o adımın içinde geçen
   * süre eklenerek bulunuyor — cümle sırası tek bir adıma değil ritüelin
   * tamamına bağlı, böylece son cümle son saniyeye denk geliyor.
   */
  const elapsedTotal =
    steps.slice(0, index).reduce((sum, kind) => sum + stepSeconds(formula, kind), 0) +
    elapsedInStep;
  const storyLine = t(lines[storyLineIndex(elapsedTotal, totalRitualSeconds, lines.length)]);

  const action: BreathAction = breath ? breath.action : 'inhale';
  const phaseSecondsValue = breath ? breath.seconds : totalForStep;
  const phaseKey = breath
    ? `${index}-${breath.round}-${breath.phaseIndex}`
    : `${index}`;

  return (
    <Screen background={colors.ink} style={styles.container}>
      {/* Ritüelin arkasında yavaşça yükselen baloncuklar — ekranın geri
          kalanı sayaç ve metinken, gözün dinlendiği yer burası. */}
      <RisingBubbles />

      <View style={styles.topBar}>
        <PressableScale
          onPress={() => void exit()}
          accessibilityRole="button"
          style={styles.back}
        >
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
          // Merkezde artık tek bir kelime değil, ritüelin tamamına
          // yayılan bir metin akıyor: kelime ilk saniyede okunup
          // bitiyordu, cümleler ise ritüel boyunca takip edilecek bir şey
          // veriyor ve sonunda kapanıyor.
          sentence={storyLine}
          // Renk ve ses adımlarında faz yok; daire kendi nabzıyla döner.
          ambient={step !== 'breath'}
        />
      </View>

      <Animated.View style={stepTextStyle}>
        <PhaseLabel
          text={
            breath
              ? t('{faz} · {tur}. tur', { faz: t(breath.label), tur: breath.round })
              : copy[step].title
          }
        />
        <Text style={styles.subText}>{breath ? copy.breath.sub : copy[step].sub}</Text>
        {step === 'breath' && micStatus !== 'idle' ? (
          <Text style={styles.micStatus}>
            {micStatus === 'requesting'
              ? t('🎙️ Mikrofon izni isteniyor…')
              : micStatus === 'listening'
                ? t('🎙️ Nefesin dinleniyor')
                : micStatus === 'denied'
                  ? t('🎙️ Mikrofon izni verilmedi — nefes ölçümü olmadan devam edeceksin')
                  : t('🎙️ Mikrofon kullanılamadı')}
          </Text>
        ) : null}
      </Animated.View>

      <CountdownNumber
        value={breath ? `${breath.left}` : formatTime(remaining)}
        style={styles.counter}
      />

      <View style={styles.bottom}>
        <Animated.View style={stepTextStyle}>
          <TransparencyPill text={fact} />
        </Animated.View>

        <PressableScale
          onPress={() => void goNext()}
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
  micStatus: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.glow,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },
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
