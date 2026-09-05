import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import RisingBubbles from '../components/RisingBubbles';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import CountdownNumber from '../components/CountdownNumber';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import { addCheckin } from '../utils/dailyCycle';
import { breathMetricsFrom, type MeteringSample } from '../utils/breathSignal';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkin'>;

/** Ölçümün uzunluğu — bir günde üç kez yapılacak kadar kısa. */
const DURATION_SECONDS = 45;
/** Ölçüm sırasında uygulanan tempo (saniye) — 5 saniyelik uyumlu nefes. */
const ROUND_MS = 10_000;

/**
 * Gün içi kısa nefes ölçümü.
 *
 * 24 saatlik döngünün tek "aktif" parçası: kullanıcı bildirime dokunup
 * 45 saniye nefes alıyor, sonuç günün raporuna giriyor. Mikrofon yalnızca
 * bu ekran açıkken çalışıyor — arka planda dinleyen hiçbir şey yok, bu
 * bilerek böyle (bkz. `utils/dailyCycle.ts`).
 */
export default function CheckinScreen({ navigation }: Props) {
  const t = useT();
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const [phase, setPhase] = useState<'intro' | 'measuring' | 'done' | 'denied'>('intro');
  const [regularity, setRegularity] = useState<number | null>(null);

  const recorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });
  const samplesRef = useRef<MeteringSample[]>([]);
  const startRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Kayıt bir kez durduruldu mu — ritüel ekranındaki çökmenin aynısı burada da olmasın. */
  const stoppedRef = useRef(false);

  const stopCapture = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    try {
      if (recorder.isRecording) await recorder.stop();
    } catch {
      // yoksay
    }
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // yoksay
    }
  }, [recorder]);

  // Ekran hangi yoldan kapanırsa kapansın kayıt önce duruyor (bkz.
  // RitualScreen: serbest bırakılmış kaydediciye dokunmak uygulamayı
  // anında çökertiyor).
  useEffect(
    () => navigation.addListener('beforeRemove', () => void stopCapture()),
    [navigation, stopCapture]
  );
  useEffect(() => () => void stopCapture(), [stopCapture]);

  const finish = useCallback(async () => {
    await stopCapture();
    const metrics = samplesRef.current.length
      ? breathMetricsFrom(samplesRef.current, ROUND_MS)
      : null;
    setRegularity(metrics?.regularity ?? null);
    setPhase('done');
    haptics.success();
    await addCheckin({
      at: Date.now(),
      regularity: metrics?.regularity,
      breathsPerMinute: metrics?.breathsPerMinute,
      depth: metrics?.depth,
    });
  }, [stopCapture]);

  const start = useCallback(async () => {
    try {
      const current = await getRecordingPermissionsAsync();
      const granted = current.granted
        ? true
        : (await requestRecordingPermissionsAsync()).granted;
      if (!granted) {
        setPhase('denied');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      samplesRef.current = [];
      startRef.current = Date.now();
      stoppedRef.current = false;
      recorder.record();
      setPhase('measuring');
      haptics.step();

      pollRef.current = setInterval(() => {
        const status = recorder.getStatus();
        if (status.metering != null) {
          samplesRef.current.push({
            t: Date.now() - startRef.current,
            db: status.metering,
          });
        }
      }, 200);
      tickRef.current = setInterval(() => {
        setRemaining((r) => (r > 0 ? r - 1 : 0));
      }, 1000);
    } catch {
      setPhase('denied');
    }
  }, [recorder]);

  useEffect(() => {
    if (phase === 'measuring' && remaining === 0) void finish();
  }, [phase, remaining, finish]);

  const body = () => {
    if (phase === 'denied') {
      return (
        <>
          <Text style={styles.title}>{t('Mikrofon izni yok')}</Text>
          <Text style={styles.sub}>
            {t('Nefes ölçümü için mikrofon gerekiyor. İzin vermeden de uygulamayı kullanabilirsin.')}
          </Text>
        </>
      );
    }
    if (phase === 'done') {
      return (
        <>
          <Text style={styles.title}>{t('Ölçüm kaydedildi')}</Text>
          <Text style={styles.sub}>
            {regularity != null
              ? t('Nefesin %{yuzde} düzenliydi. Yarın sabah günün raporunda görünecek.', {
                  yuzde: Math.round(regularity * 100),
                })
              : t('Sinyal yakalanamadı — çok sessiz ya da çok kısa bir kayıt olabilir.')}
          </Text>
        </>
      );
    }
    if (phase === 'measuring') {
      return (
        <>
          <Text style={styles.title}>{t('Nefesin dinleniyor')}</Text>
          <Text style={styles.sub}>{t('Doğal nefes al. Sayıları tutturmak zorunda değilsin.')}</Text>
        </>
      );
    }
    return (
      <>
        <Text style={styles.title}>{t('45 saniyelik ölçüm')}</Text>
        <Text style={styles.sub}>
          {t('Mikrofon yalnızca bu ekran açıkken çalışır. Ses kaydedilmez, cihazdan çıkmaz.')}
        </Text>
      </>
    );
  };

  return (
    <Screen background={colors.ink} style={styles.container}>
      <RisingBubbles />

      <View style={styles.center}>
        <BreathingCircle
          pattern="coherent_5s"
          action={phase === 'measuring' ? 'inhale' : 'pause'}
          phaseSeconds={5}
          phaseKey={phase}
          colorHex={colors.pulse}
          ambient
          sentence={phase === 'measuring' ? t('Sadece nefes al.') : undefined}
        />
      </View>

      {phase === 'measuring' ? (
        <CountdownNumber value={`${remaining}`} style={styles.counter} />
      ) : null}

      <View style={styles.textWrap}>{body()}</View>

      <View style={styles.bottom}>
        <TransparencyPill
          text={t('Gün içindeki ölçümler yalnızca cihazında saklanır; hiçbir yere gönderilmez.')}
        />
        <PressableScale
          onPress={() => {
            if (phase === 'intro') {
              void start();
              return;
            }
            navigation.goBack();
          }}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {phase === 'intro'
              ? t('Ölçümü başlat')
              : phase === 'measuring'
                ? t('Vazgeç')
                : t('Kapat')}
          </Text>
        </PressableScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  counter: { textAlign: 'center' },
  textWrap: { alignItems: 'center', gap: 8, marginTop: 12 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.haze,
    textAlign: 'center',
  },
  bottom: { gap: 14, marginBottom: 24, marginTop: 20 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
});
