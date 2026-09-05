import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FaceMoodDetectorModule from '../../modules/face-mood-detector/src/FaceMoodDetectorModule';
import Screen from './Screen';
import PressableScale from './PressableScale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import {
  EMOTION_LABELS_TR,
  mergeEmotions,
  scoreFromEmotions,
  sortedEmotions,
  type Emotions,
} from '../utils/faceMood';

/** Modül şu an yalnızca iOS'ta var (Apple Vision framework). */
const SUPPORTED = Platform.OS === 'ios';

/**
 * Kaç kare alınıp birleştirileceği.
 *
 * Tek kare ölçülebilir biçimde kararsızdı: göz kırpma, hareket bulanıklığı
 * ya da anlık bir mimik skoru bütünüyle kaydırabiliyor ve kullanıcı aynı
 * anda iki kez ölçtüğünde iki farklı sayı görüyordu. Üç karenin medyanı
 * bu sapmayı büyük ölçüde siliyor; daha fazlası ise bekleme süresini
 * hissedilir hâle getiriyor.
 */
const FRAME_COUNT = 3;
/** Kareler arası bekleme — aynı anın üç kopyasını almamak için. */
const FRAME_GAP_MS = 280;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface CameraMoodResult {
  score: number;
  emotions: Emotions;
}

interface Props {
  visible: boolean;
  onCancel: () => void;
  onResult: (result: CameraMoodResult) => void;
  /**
   * Ölçümü elle yapmaya geçiş.
   *
   * Verildiğinde her durumda görünen bir çıkış oluyor: izin verilmedi,
   * cihaz desteklemiyor, yüz okunamadı. Verilmediğinde modal yalnız
   * "Vazgeç" ile kapanıyor — bu yalnızca ölçümün isteğe bağlı olduğu
   * yerlerde (şikayet girişi, ritüel sonrası) doğru.
   *
   * Ritüel öncesi ölçümde bu alan **zorunlu gibi davranmalı**: bir süre
   * öyle değildi ve kamera iznini reddeden kullanıcı ritüele hiç
   * giremedi. Modal kendi başına bunu bilemeyeceği için sorumluluk
   * çağıran ekranda.
   */
  onManual?: () => void;
  /** Elle puanlama düğmesinin yazısı — bağlama göre değişiyor. */
  manualLabel?: string;
}

type Phase = 'camera' | 'detecting' | 'result' | 'no-face';

/**
 * Kameradan tek kare alıp gerçek bir yüz-duygu modelinden (AffectNet,
 * Apache-2.0 — bkz. modules/face-mood-detector/EMOTION_MODEL_LICENSE.txt)
 * çıkan duygu dağılımını gösteren modal.
 *
 * Ölçümün kendisi bu: elle puan veren slider kaldırıldı, önce/sonra
 * puanları artık yalnızca buradan çıkıyor. Sonuç, kullanılmadan önce
 * açıkça gösteriliyor ve kullanıcı `onCancel` ile reddedebiliyor —
 * "analizle alakalı hiçbir dönüt yok" sorununun karşılığı burası.
 */
export default function CameraMoodCapture({
  visible,
  onCancel,
  onResult,
  onManual,
  manualLabel,
}: Props) {
  const t = useT();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<Phase>('camera');
  const [emotions, setEmotions] = useState<Emotions | null>(null);
  /** Sonuca kaç karenin katıldığı — ekranda ölçümün gücünü göstermek için. */
  const [frameCount, setFrameCount] = useState(0);
  /**
   * Ham hata metni — "yüz bulunamadı" her zaman aynı görünse de sebebi
   * çok farklı olabilir (gerçekten yüz yok, ya da model hiç çalışmadı).
   * Kullanıcı bunu görüp bize aktarabilsin diye ekranda gösteriliyor;
   * sessizce yutulmuyor.
   */
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  /**
   * Modal her açıldığında baştan başlar.
   *
   * Bileşen `visible={false}` olduğunda unmount olmuyor (üst ekran bu
   * bileşeni hep JSX'te tutuyor, sadece `Modal`'ın görünürlüğü değişiyor)
   * — bu yüzden durum bir önceki kapanıştan kalabiliyordu.
   */
  useEffect(() => {
    if (visible) {
      setPhase('camera');
      setErrorDetail(null);
      setEmotions(null);
      setFrameCount(0);
    }
  }, [visible]);

  const capture = async () => {
    const camera = cameraRef.current;
    if (!camera) return;
    haptics.tap();
    setPhase('detecting');
    setErrorDetail(null);
    try {
      /**
       * Üç kare alınıp medyanı kullanılıyor. Kareler tek tek başarısız
       * olabilir (göz kırpma, kadraj dışına çıkma); en az biri geçtiği
       * sürece ölçüm yapılıyor, hiçbiri geçmezse "yüz bulunamadı" deniyor.
       */
      const frames: Emotions[] = [];
      let lastError: string | null = null;

      for (let i = 0; i < FRAME_COUNT; i++) {
        if (i > 0) await wait(FRAME_GAP_MS);
        const photo = await camera.takePictureAsync({ quality: 0.5, shutterSound: false });
        if (!photo?.uri) {
          lastError = t('Fotoğraf alınamadı.');
          continue;
        }
        try {
          // Modül yalnızca iOS'ta var; burası zaten `SUPPORTED` arkasında
          // ama kontrol açıkça yapılıyor — modülün varlığını varsaymak,
          // Android'de sessiz bir çökmeye dönüşen türden bir varsayım.
          if (!FaceMoodDetectorModule) {
            lastError = t('Bu özellik bu cihazda kullanılamıyor.');
            break;
          }
          const result = await FaceMoodDetectorModule.detectSmile(photo.uri);
          if (result.faceFound && result.emotions) frames.push(result.emotions);
          else if (result.faceFound) lastError = t('Yüz bulundu ama ifade okunamadı.');
        } catch (frameError) {
          lastError = frameError instanceof Error ? frameError.message : String(frameError);
        }
      }

      const merged = mergeEmotions(frames);
      if (!merged) {
        setErrorDetail(lastError);
        setPhase('no-face');
        return;
      }

      haptics.success();
      setFrameCount(frames.length);
      setEmotions(merged);
      setPhase('result');
    } catch (e) {
      setErrorDetail(e instanceof Error ? e.message : String(e));
      setPhase('no-face');
    }
  };

  const reset = () => {
    setErrorDetail(null);
    setEmotions(null);
    setFrameCount(0);
    setPhase('camera');
  };

  const confirmResult = () => {
    if (!emotions) return;
    haptics.tap();
    onResult({ score: scoreFromEmotions(emotions), emotions });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Screen background={colors.ink} style={styles.container}>
        <Text style={styles.title}>{t('Kamerayla ölç')}</Text>
        <Text style={styles.subtitle}>
          {t('Yüzünü çerçeveye al, doğal ifadenle bekle. Fotoğraf cihazından çıkmaz.')}
        </Text>

        <View style={styles.cameraWrap}>
          {!SUPPORTED ? (
            <View style={styles.center}>
              <Text style={styles.hint}>
                {t('Bu özellik şu an yalnızca iPhone’da kullanılabiliyor.')}
              </Text>
            </View>
          ) : !permission ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.pulse} />
            </View>
          ) : !permission.granted ? (
            <View style={styles.center}>
              <Text style={styles.hint}>{t('Kamera izni gerekiyor.')}</Text>
              <PressableScale
                onPress={requestPermission}
                accessibilityRole="button"
                style={styles.smallButton}
              >
                <Text style={styles.smallButtonText}>{t('İzin ver')}</Text>
              </PressableScale>
            </View>
          ) : phase === 'result' && emotions ? (
            <View style={styles.resultWrap}>
              <Text style={styles.resultTitle}>{t('🤖 Analiz sonucu')}</Text>
              {sortedEmotions(emotions)
                .slice(0, 4)
                .map(([label, prob]) => (
                  <View key={label} style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{t(EMOTION_LABELS_TR[label])}</Text>
                    <View style={styles.resultTrack}>
                      <View
                        style={[styles.resultFill, { width: `${Math.round(prob * 100)}%` }]}
                      />
                    </View>
                    <Text style={styles.resultPercent}>{Math.round(prob * 100)}%</Text>
                  </View>
                ))}
              {/* Ölçümün kaç kareye dayandığı yazıyor: tek kareye düşmüş
                  bir ölçüm ile üç karenin medyanı aynı güvende değil. */}
              <Text style={styles.frameNote}>
                {frameCount > 1
                  ? t('{adet} karenin ortancası alındı — tek karelik sapmalar elendi.', {
                      adet: frameCount,
                    })
                  : t('Yalnızca tek kare okunabildi; sonuç daha oynak olabilir.')}
              </Text>
            </View>
          ) : (
            <>
              <CameraView ref={cameraRef} style={styles.camera} facing="front" />
              <View style={styles.guideWrap} pointerEvents="none">
                <View style={styles.guideOval} />
              </View>
              {phase === 'detecting' ? (
                <View style={[styles.overlay, styles.center]}>
                  <ActivityIndicator color={colors.pulse} />
                  <Text style={styles.hint}>{t('Yüz ifaden okunuyor…')}</Text>
                </View>
              ) : null}
              {phase === 'no-face' ? (
                <View style={[styles.overlay, styles.center]}>
                  <Text style={styles.hint}>
                    {t('Yüz bulunamadı. Işığı ve kadrajı kontrol edip tekrar dene.')}
                  </Text>
                  {errorDetail ? (
                    <Text style={styles.errorDetail}>{errorDetail}</Text>
                  ) : null}
                  <PressableScale
                    onPress={reset}
                    accessibilityRole="button"
                    style={styles.smallButton}
                  >
                    <Text style={styles.smallButtonText}>{t('Tekrar dene')}</Text>
                  </PressableScale>
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Elle puanlama her zaman görünür: kamera çalışmadığında tek
            çıkış bu, çalıştığında da kullanıcıyı ölçüme mecbur etmemek
            gerekiyor. Vurgusuz bir düğme, çünkü asıl yol tarama. */}
        {onManual ? (
          <PressableScale
            onPress={onManual}
            accessibilityRole="button"
            style={styles.manualLink}
          >
            <Text style={styles.manualLinkText}>
              {manualLabel ?? t('Kamera olmadan elle puanla')}
            </Text>
          </PressableScale>
        ) : null}

        <View style={styles.actions}>
          <PressableScale
            onPress={onCancel}
            accessibilityRole="button"
            style={[styles.button, styles.cancelButton]}
          >
            <Text style={styles.buttonText}>{t('Vazgeç')}</Text>
          </PressableScale>

          {SUPPORTED && permission?.granted && phase === 'camera' ? (
            <PressableScale onPress={capture} accessibilityRole="button" style={styles.button}>
              <Text style={styles.buttonText}>{t('Çek')}</Text>
            </PressableScale>
          ) : null}

          {phase === 'result' ? (
            <PressableScale onPress={confirmResult} accessibilityRole="button" style={styles.button}>
              <Text style={styles.buttonText}>{t('Kullan')}</Text>
            </PressableScale>
          ) : null}
        </View>
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  manualLink: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  manualLinkText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.haze,
    textDecorationLine: 'underline',
  },
  container: { paddingHorizontal: 24 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.white,
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 8,
  },
  cameraWrap: {
    flex: 1,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  camera: { flex: 1 },
  guideWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideOval: {
    width: '62%',
    height: '46%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(14,14,18,0.72)',
    paddingHorizontal: 24,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.haze,
    textAlign: 'center',
  },
  errorDetail: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.warn,
    textAlign: 'center',
    opacity: 0.8,
  },
  smallButton: {
    backgroundColor: colors.pulse,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  smallButtonText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.white },
  actions: { flexDirection: 'row', gap: 10, marginVertical: 20 },
  button: {
    flex: 1,
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: 'rgba(255,255,255,0.1)' },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.white },
  resultWrap: { flex: 1, padding: 20, justifyContent: 'center' },
  resultTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 18,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  resultLabel: {
    width: 72,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.haze,
  },
  resultTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  resultFill: { height: '100%', backgroundColor: colors.pulse, borderRadius: 4 },
  frameNote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    color: colors.haze,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 12,
  },
  resultPercent: {
    width: 38,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.white,
    textAlign: 'right',
  },
});
