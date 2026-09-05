import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from './Screen';
import PressableScale from './PressableScale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import {
  FALSE_START_MS,
  TIMEOUT_MS,
  TOTAL_ROUNDS,
  reactionResultFrom,
  type ReactionResult,
} from '../utils/reaction';

/** Hazırlık bekleyişinin alt/üst sınırı — tahmin edilebilir olmasın diye rastgele. */
const WAIT_MIN_MS = 900;
const WAIT_MAX_MS = 2600;
/** Bekleme alanının rengi — mordan ("şimdi") açıkça ayrılsın diye koyu. */
const WAITING_BG = '#1A1A22';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onResult: (result: ReactionResult) => void;
}

type Phase = 'intro' | 'waiting' | 'go' | 'tooSoon' | 'timeout' | 'done' | 'failed';

/**
 * Refleks ölçümü — beş turluk bir tepki süresi testi.
 *
 * Neden burada: uygulamanın diğer iki objektif sinyali (kamera, mikrofon)
 * bir modelin ya da sinyal işlemenin yorumuna dayanıyor. Bu ise iki zaman
 * damgası arasındaki fark; yorumu yok, izni yok, kalibrasyonu yok. Ritüel
 * öncesi ve sonrası aynı test yapıldığında ortaya yüz okumasından
 * bağımsız bir önce/sonra çifti çıkıyor.
 *
 * Erken dokunuş (tahmin) turu geçersiz kılıyor ve tur yeniden başlıyor;
 * böylece "beklemeden bas" ile sahte bir hız üretilemiyor.
 */
export default function TapReactionTest({ visible, onCancel, onResult }: Props) {
  const t = useT();
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [result, setResult] = useState<ReactionResult | null>(null);

  const samples = useRef<number[]>([]);
  const goAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    if (visible) {
      setPhase('intro');
      setRound(0);
      setLastMs(null);
      setResult(null);
      samples.current = [];
    }
    return clearTimer;
  }, [visible]);

  /** Bir turu başlatır: rastgele bir bekleyişten sonra ekran "şimdi" olur. */
  const startRound = useCallback(() => {
    clearTimer();
    setPhase('waiting');
    const wait = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
    timer.current = setTimeout(() => {
      goAt.current = Date.now();
      setPhase('go');
      haptics.tap();
      // Turu açık bırakmamak için üst sınır: dokunulmazsa tur boşa yazılır.
      timer.current = setTimeout(() => {
        samples.current.push(TIMEOUT_MS + 1);
        setPhase('timeout');
      }, TIMEOUT_MS);
    }, wait);
  }, []);

  /** Bütün turlar bitti — sonucu çıkar ya da "ölçülemedi" de. */
  const finish = useCallback(() => {
    const computed = reactionResultFrom(samples.current);
    if (!computed) {
      setPhase('failed');
      return;
    }
    setResult(computed);
    setPhase('done');
    haptics.success();
  }, []);

  const advance = useCallback(() => {
    const next = round + 1;
    setRound(next);
    if (next >= TOTAL_ROUNDS) finish();
    else startRound();
  }, [round, finish, startRound]);

  const onArenaPress = () => {
    if (phase === 'waiting') {
      // Erken dokunuş: tur geçersiz, aynı tur baştan.
      clearTimer();
      haptics.warning();
      setPhase('tooSoon');
      return;
    }
    if (phase === 'go') {
      clearTimer();
      const ms = Date.now() - goAt.current;
      samples.current.push(ms);
      setLastMs(ms);
      haptics.tap();
      advance();
    }
  };

  const arenaColor =
    phase === 'go'
      ? colors.pulse
      : phase === 'tooSoon'
        ? colors.warn
        : phase === 'waiting'
          ? WAITING_BG
          : 'transparent';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Screen background={colors.ink} style={styles.container}>
        <Text style={styles.eyebrow}>{t('⚡ REFLEKS ÖLÇÜMÜ')}</Text>

        {phase === 'intro' ? (
          <View style={styles.center}>
            <Text style={styles.title}>{t('Ne kadar çabuk toparlanıyorsun?')}</Text>
            <Text style={styles.body}>
              {t(
                'Ekran mora döndüğü anda dokun. {tur} tur sürer. Erken dokunursan o tur baştan başlar — tahmin etmenin bir faydası yok.'
              , { tur: TOTAL_ROUNDS })}
            </Text>
            <Text style={styles.note}>
              {t(
                'Bu bir zeka ya da sağlık testi değil. Yalnızca dikkatini ne kadar hızlı topladığının kaydı — puanların yanına konacak, ayrı bir ölçü.'
              )}
            </Text>
            <PressableScale
              onPress={() => {
                haptics.tap();
                startRound();
              }}
              accessibilityRole="button"
              style={styles.button}
            >
              <Text style={styles.buttonText}>{t('Başla')}</Text>
            </PressableScale>
            <PressableScale onPress={onCancel} accessibilityRole="button" style={styles.ghost}>
              <Text style={styles.ghostText}>{t('Vazgeç')}</Text>
            </PressableScale>
          </View>
        ) : phase === 'done' && result ? (
          <View style={styles.center}>
            <Text style={styles.big}>{t('{ms} ms', { ms: result.medianMs })}</Text>
            <Text style={styles.body}>
              {t('{tur} geçerli turun ortanca tepki süresi.', { tur: result.rounds })}
            </Text>
            <Text style={styles.note}>
              {t('Turların tutarlılığı: %{yuzde}', {
                yuzde: Math.round(result.consistency * 100),
              })}
            </Text>
            <PressableScale
              onPress={() => onResult(result)}
              accessibilityRole="button"
              style={styles.button}
            >
              <Text style={styles.buttonText}>{t('Kullan')}</Text>
            </PressableScale>
          </View>
        ) : phase === 'failed' ? (
          <View style={styles.center}>
            <Text style={styles.title}>{t('Ölçüm çıkmadı')}</Text>
            <Text style={styles.body}>
              {t(
                'Yeterince geçerli tur toplanamadı — çok erken ya da çok geç dokunulmuş olabilir. İstersen tekrar dene.'
              )}
            </Text>
            <PressableScale
              onPress={() => {
                samples.current = [];
                setRound(0);
                startRound();
              }}
              accessibilityRole="button"
              style={styles.button}
            >
              <Text style={styles.buttonText}>{t('Tekrar dene')}</Text>
            </PressableScale>
            <PressableScale onPress={onCancel} accessibilityRole="button" style={styles.ghost}>
              <Text style={styles.ghostText}>{t('Vazgeç')}</Text>
            </PressableScale>
          </View>
        ) : (
          <>
            <Text style={styles.progress}>
              {t('Tur {simdi}/{toplam}', { simdi: Math.min(round + 1, TOTAL_ROUNDS), toplam: TOTAL_ROUNDS })}
            </Text>
            <Pressable
              onPress={onArenaPress}
              accessibilityRole="button"
              accessibilityLabel={t('Ekran mora döndüğünde dokun')}
              style={[styles.arena, { backgroundColor: arenaColor }]}
            >
              <Text style={styles.arenaText}>
                {phase === 'waiting'
                  ? t('Bekle…')
                  : phase === 'go'
                    ? t('ŞİMDİ')
                    : phase === 'tooSoon'
                      ? t('Çok erken — bu tur baştan')
                      : t('Bu turda dokunulmadı')}
              </Text>
            </Pressable>

            {phase === 'tooSoon' || phase === 'timeout' ? (
              <PressableScale
                onPress={() => (phase === 'tooSoon' ? startRound() : advance())}
                accessibilityRole="button"
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t('Devam')}</Text>
              </PressableScale>
            ) : (
              <Text style={styles.note}>
                {lastMs != null
                  ? t('Önceki tur: {ms} ms', { ms: lastMs })
                  : t('Renk değişince dokun. Erken dokunma — {ms} ms altındaki dokunuşlar sayılmaz.', {
                      ms: FALSE_START_MS,
                    })}
              </Text>
            )}
          </>
        )}
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  center: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.glow,
    textAlign: 'center',
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.white,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 12,
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    color: colors.haze,
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 12,
  },
  big: {
    fontFamily: fonts.mono,
    fontSize: 52,
    color: colors.pulse,
    textAlign: 'center',
    includeFontPadding: false,
  },
  progress: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 10,
  },
  arena: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  arenaText: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
  ghost: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  ghostText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.haze },
});
