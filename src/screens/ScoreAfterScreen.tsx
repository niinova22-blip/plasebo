import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import CameraMoodCapture from '../components/CameraMoodCapture';
import TapReactionTest from '../components/TapReactionTest';
import ScoreSlider from '../components/ScoreSlider';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useT } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { haptics } from '../utils/haptics';
import { getCachedHealthSnapshot } from '../utils/health';
import { newSessionId } from '../utils/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreAfter'>;

/**
 * Ritüel sonrası ölçüm.
 *
 * KURAL: önce ve sonra **aynı yöntemle** ölçülür.
 *
 * Bir önce/sonra çiftinin anlamı olması için iki ucun aynı cinsten
 * olması gerekiyor. Başlangıç puanı kameradan geldiyse bitişin de
 * kameradan gelmesi gerekir; kişinin beyanıysa bitiş de beyan olmalı.
 * İkisini karıştırmak iki ayrı ölçeği yan yana koymak demek ve "3 puan
 * azaldı" cümlesi tam da o karşılaştırmadan çıktığı için dayanaksız
 * kalırdı.
 *
 * Bu yüzden ekranın iki hâli var ve hangisinin açılacağını `faceMoodScore`
 * belirliyor — dolu ise seans kamerayla ölçülmüş demektir:
 *
 *   - **Kamerayla:** ekran açılır açılmaz kamera açılıyor, kullanıcıdan
 *     istenen tek şey fotoğrafı çekmek.
 *   - **Elle:** 1-10 arası puan kaydırıcısı. Ücretsiz kademede günlük
 *     tarama hakkı bittiğinde, kamera izni verilmediğinde ya da yüz
 *     okunamadığında akış buradan geçiyor.
 *
 * Kameralı seansın "sonra" ölçümü günlük haktan **düşmüyor**: karşılığı
 * olmayan bir "önce" değeri hiçbir işe yaramaz, yarım kalan bir çift
 * kullanıcıya hakkını harcatıp hiçbir şey göstermemiş olurdu.
 *
 * Kayıt burada yazılıyor: eski `score` alanı (yüksek = iyi) geriye dönük
 * uyum için `11 - scoreAfter` olarak türetiliyor, böylece istatistik ve
 * arşiv ekranları eski kayıtlarla birlikte çalışmaya devam ediyor.
 */
export default function ScoreAfterScreen({ navigation, route }: Props) {
  const t = useT();
  const { recordSession } = useUser();
  const {
    formula,
    complaintId,
    customText,
    scoreBefore,
    durationSeconds,
    steps,
    faceMoodScore,
    reactionBeforeMs,
    breathRegularity,
    breathsPerMinute,
    breathDepth,
    breathMicOutcome,
  } = route.params;
  const complaint = resolveComplaint(complaintId, customText);

  /**
   * Seansın "önce" ucu kamerayla mı ölçüldü?
   *
   * `faceMoodScore` yalnız kameradan gelen ölçümde doluyor (bkz.
   * `PrescriptionScreen.startRitual`), yani bu tek alan iki yolu ayırmaya
   * yetiyor. Ayrı bir bayrak taşımak aynı bilginin ikinci bir kaynağı
   * olurdu ve ikisi zamanla ayrı düşerdi.
   */
  const measuredByCamera = faceMoodScore != null;

  /** Elle puanlamaya geçildi mi? Kameralı seansta da bir çıkış olarak açılabiliyor. */
  const [manualMode, setManualMode] = useState(!measuredByCamera);
  /**
   * Bitiş puanı — iki yolda da tek alan.
   *
   * Kamerayla ölçülecekse fotoğraf çekilene kadar boş; elle
   * puanlanacaksa kaydırıcının ortasından (5) başlıyor ve boş kalmıyor,
   * çünkü orada ölçülmeyi bekleyen bir şey yok, kullanıcı zaten bir değer
   * seçmiş durumda. Puanın kaynağını `score` değil `faceMoodAfter`
   * söylüyor.
   */
  const [score, setScore] = useState<number | null>(measuredByCamera ? null : 5);
  const [cameraOpen, setCameraOpen] = useState(measuredByCamera);
  /** Kamera bir kez kapatıldıysa kendiliğinden geri açılmıyor. */
  const [dismissed, setDismissed] = useState(false);
  /**
   * Kamerayla ölçülen "sonra" skoru.
   *
   * `score` ile aynı sayı; ayrıca taşınıyor çünkü kayıtta ham yüz
   * okumasının kendi alanı var (`faceMoodAfter`) ve ileride puan
   * hesabı değişirse ölçümün kendisi elde kalsın.
   */
  const [faceMoodAfter, setFaceMoodAfter] = useState<number | undefined>(undefined);
  /** Ritüel öncesinde refleks ölçüldüyse burada ikincisi isteniyor. */
  const [reactionOpen, setReactionOpen] = useState(false);
  const [reactionAfterMs, setReactionAfterMs] = useState<number | undefined>(undefined);

  const diff = score != null ? scoreBefore - score : null;
  const percent =
    diff != null && scoreBefore > 0 ? Math.round((diff / scoreBefore) * 100) : 0;

  useEffect(() => {
    if (dismissed) setCameraOpen(false);
  }, [dismissed]);

  const save = (finalScore: number | null) => {
    haptics.success();
    recordSession({
      id: newSessionId(),
      date: formula.generatedAt,
      formulaId: formula.id,
      goal: formula.goal,
      // Eski ölçek: yüksek = iyi. Yeni ölçekte yüksek = kötü olduğu için
      // ters çevriliyor.
      score: Math.max(1, Math.min(10, 11 - (finalScore ?? scoreBefore))),
      steps,
      formulaName: formula.name,
      colorHex: formula.color.hex,
      crisis: formula.crisis,
      sham: formula.sham,
      dose: formula.dose ?? 1,
      complaintId,
      // Serbest metin de saklanıyor: arşivde "kendi cümlen" satırının
      // ne olduğu sonradan okunabilsin diye.
      complaintText: customText,
      prescriptionName: complaint?.prescriptionName,
      scoreBefore,
      scoreAfter: finalScore ?? undefined,
      durationSeconds,
      faceMoodBefore: faceMoodScore,
      faceMoodAfter,
      reactionBeforeMs,
      reactionAfterMs,
      // Sağlık verisi açıksa o günün bağlamı da kayda giriyor: haftalık
      // desen kartı uykuyla puanı ancak ikisi aynı kayıtta durursa
      // karşılaştırabiliyor.
      sleepMinutes: getCachedHealthSnapshot()?.sleepMinutes ?? undefined,
      restingHeartRate: getCachedHealthSnapshot()?.restingHeartRate ?? undefined,
      // Ölçümün kamerayla mı yapıldığı, puanın var olup olmadığından
      // değil ham yüz okumasının varlığından çıkıyor: elle verilen bir
      // puan da dolu bir `finalScore` üretiyor.
      scoreAfterFromCamera: faceMoodAfter != null,
      breathRegularity,
      breathsPerMinute,
      breathDepth,
    });

    /* Ölçüm yapılamadıysa özet ekranına gitmenin anlamı yok: o ekranın
       tamamı önce/sonra karşılaştırması üzerine kurulu. Seans yine de
       kaydedildi (ritüel gerçekten yapıldı, seri kırılmamalı), kullanıcı
       ana sayfaya dönüyor. */
    if (finalScore == null) {
      navigation.navigate('Main');
      return;
    }

    navigation.replace('SessionSummary', {
      complaintId,
      customText,
      formula,
      scoreBefore,
      scoreAfter: finalScore,
      durationSeconds,
      faceMoodScore,
      faceMoodAfter,
      reactionBeforeMs,
      reactionAfterMs,
      scoreAfterFromCamera: faceMoodAfter != null,
      breathRegularity,
      breathsPerMinute,
      breathDepth,
    });
  };

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{t('RİTÜEL SONRASI ÖLÇÜM')}</Text>
        {/* Başlık eskiden şikayete özel bir cümleydi ("Anlattığın şeyin
            şiddetini şu an puanla", "Zihnindeki dağınıklığı şu an
            puanla"). Hepsi kullanıcıdan bir sayı vermesini istiyordu;
            oysa puanı artık kamera ölçüyor ve ekranda kaydırılacak bir
            şey yok. Kalan tek doğru soru bu, o yüzden alttaki ikinci
            satır da kaldırıldı: aynı şeyi iki kez sormuyordu, biri
            artık yapılmayan bir işi tarif ediyordu. */}
        <Text style={styles.question}>{t('Şimdi nasılsın?')}</Text>

        {/* Kör testte sahte ritüel ancak burada açıklanır. */}
        {formula.sham ? (
          <View style={styles.reveal}>
            <Text style={styles.revealTitle}>{t('Bu bir sahte ritüeldi')}</Text>
            <Text style={styles.revealText}>
              {t(
                'Bugün sana renk, ses ya da nefes verilmedi — sadece bekledin. Kör test açık olduğu için bunu önceden söylemedik. Puanın, gerçek ritüel günlerinin ortalamasıyla İstatistik ekranında karşılaştırılacak.'
              )}
            </Text>
          </View>
        ) : null}

        <Text style={styles.value}>{score ?? '—'}</Text>
        <Text style={styles.sourceTag}>
          {manualMode
            ? t('Bu puan senin izlenimin — başlangıç puanı da öyleydi')
            : score != null
              ? t('📷 Bu sayıyı kamera ölçtü')
              : t('📷 Ölçüm için bir fotoğraf gerekiyor')}
        </Text>

        {manualMode ? (
          <View style={styles.sliderWrap}>
            <Text style={styles.scale}>{t('1 = hiç yok  ·  10 = dayanılmaz')}</Text>
            <ScoreSlider value={score ?? 5} onChange={setScore} />
          </View>
        ) : score == null ? (
          <PressableScale
            onPress={() => {
              haptics.tap();
              setDismissed(false);
              setCameraOpen(true);
            }}
            accessibilityRole="button"
            style={styles.cameraLink}
          >
            <Text style={styles.cameraLinkText}>{t('📷 Fotoğrafı çek')}</Text>
          </PressableScale>
        ) : null}

        <CameraMoodCapture
          visible={cameraOpen}
          onCancel={() => {
            setCameraOpen(false);
            setDismissed(true);
          }}
          onManual={() => {
            // Kamera çalışmadıysa ölçüm elde kalmasın: seans yine de
            // puanlanabiliyor. Puan artık beyan olduğu için `faceMoodAfter`
            // boş kalıyor ve kayıt bunu doğru işaretliyor.
            setCameraOpen(false);
            setDismissed(true);
            setManualMode(true);
            setScore((current) => current ?? 5);
          }}
          manualLabel={t('Kamera olmadan elle puanla')}
          onResult={({ score: next }) => {
            setScore(next);
            setFaceMoodAfter(next);
            setCameraOpen(false);
          }}
        />

        {/* Refleks ölçümü ancak öncesinde de yapıldıysa isteniyor:
            karşılaştırılacak bir "önce" yoksa tek başına bir anlamı yok. */}
        {reactionBeforeMs != null ? (
          <PressableScale
            onPress={() => {
              haptics.tap();
              setReactionOpen(true);
            }}
            accessibilityRole="button"
            style={styles.cameraLink}
          >
            <Text style={styles.cameraLinkText}>
              {reactionAfterMs != null
                ? t('⚡ Refleks: {ms} ms — yeniden ölç', { ms: reactionAfterMs })
                : t('⚡ Refleksini yeniden ölç (önce {ms} ms idi)', { ms: reactionBeforeMs })}
            </Text>
          </PressableScale>
        ) : null}

        <TapReactionTest
          visible={reactionOpen}
          onCancel={() => setReactionOpen(false)}
          onResult={(result) => {
            setReactionAfterMs(result.medianMs);
            setReactionOpen(false);
          }}
        />

        {/* Fark, kaydetmeden önce görünür — asıl merak edilen bu. */}
        <View style={styles.deltaWrap}>
          {diff == null ? (
            <Text style={[styles.delta, { color: colors.haze }]}>
              {t('Fotoğrafı çektiğinde önce/sonra farkı burada çıkacak')}
            </Text>
          ) : diff === 0 && manualMode && score === 5 ? (
            /* Elle puanlamada kaydırıcı ortadan başlıyor; kullanıcı ona
               hiç dokunmadan "değişim yok" yazmak, verilmemiş bir cevabı
               cevap gibi göstermek olurdu. */
            <Text style={[styles.delta, { color: colors.haze }]}>
              {t('Puanı seçtiğinde önce/sonra farkı burada çıkacak')}
            </Text>
          ) : diff > 0 ? (
            <>
              <Text style={[styles.delta, { color: colors.glow }]}>
                {t('↓ {fark} puan azaldı', { fark: diff })}
              </Text>
              <Text style={styles.deltaSub}>{t('%{yuzde} fark', { yuzde: percent })}</Text>
            </>
          ) : diff === 0 ? (
            <Text style={[styles.delta, { color: colors.haze }]}>
              {t('Değişim yok — bu da veri')}
            </Text>
          ) : (
            <Text style={[styles.delta, { color: colors.warn }]}>
              {t('Bugün zordu. Yarın yeniden dene.')}
            </Text>
          )}
        </View>

        {breathRegularity != null ? (
          <View style={styles.objectiveBox}>
            <Text style={styles.objectiveLabel}>{t('🎙️ NEFES ÖLÇÜMÜ')}</Text>
            <Text style={styles.objectiveText}>
              {t('Nefesin ritüel sırasında %{yuzde} düzenliydi.', {
                yuzde: Math.round(breathRegularity * 100),
              })}
            </Text>
            {/* Aynı kayıttan çıkan iki ölçüt daha: yeni bir izin ya da
                ikinci bir kayıt gerekmiyor, veri zaten toplanıyordu. */}
            {breathsPerMinute != null ? (
              <Text style={styles.objectiveText}>
                {t('Dakikada {adet} nefes — {yorum}', {
                  adet: breathsPerMinute.toFixed(1),
                  yorum: t(
                    breathsPerMinute <= 8
                      ? 'yavaş ve sakin bir tempo'
                      : breathsPerMinute <= 12
                        ? 'dinlenme temposuna yakın'
                        : 'hızlı bir tempo'
                  ),
                })}
              </Text>
            ) : null}
            {breathDepth != null ? (
              <Text style={styles.objectiveText}>
                {t('Derinlik: {yorum}', {
                  yorum: t(
                    breathDepth >= 0.66
                      ? 'derin'
                      : breathDepth >= 0.33
                        ? 'orta'
                        : 'yüzeysel'
                  ),
                })}
              </Text>
            ) : null}
            <Text style={styles.objectiveNote}>
              {t(
                'Bu bir duygu teşhisi değil — mikrofonla ölçülen nefes ritmi, puanların yanına konan ayrı bir veri.'
              )}
            </Text>
          </View>
        ) : breathMicOutcome ? (
          <View style={[styles.objectiveBox, styles.objectiveBoxMuted]}>
            <Text style={styles.objectiveLabel}>{t('🎙️ NEFES ÖLÇÜMÜ')}</Text>
            <Text style={styles.objectiveNote}>
              {breathMicOutcome === 'no-mic-data'
                ? t('Mikrofon hiç veri göndermedi — ritüeli yeniden başlatmayı dene.')
                : breathMicOutcome === 'denied'
                ? t('Mikrofon izni verilmediği için nefes değerlendirmesi yapılamadı.')
                : t(
                    'Nefes sinyali yakalanamadı — çok kısa ya da çok sessiz bir nefes olabilir.'
                  )}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {score != null ? (
        <PressableScale
          onPress={() => save(score)}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t('Sonucu Gör')}</Text>
        </PressableScale>
      ) : (
        /* Ölçüm yapılamadıysa seans yine de kaydediliyor — ritüel
           gerçekten yapıldı — ama puan uydurulmuyor: kayıt bitiş puanı
           olmadan yazılıyor. */
        <PressableScale
          onPress={() => save(null)}
          accessibilityRole="button"
          style={[styles.button, styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{t('Ölçmeden bitir')}</Text>
        </PressableScale>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.glow,
    textAlign: 'center',
  },
  question: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    marginTop: 10,
  },
  reveal: {
    borderWidth: 1,
    borderColor: colors.glow,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  revealTitle: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.glow },
  revealText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    color: colors.haze,
    marginTop: 6,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.pulse,
    textAlign: 'center',
    marginTop: 24,
    includeFontPadding: false,
  },
  scale: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.haze,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  sourceTag: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    lineHeight: 16,
    color: colors.glow,
    textAlign: 'center',
    marginTop: 8,
  },
  sliderWrap: { marginTop: 20 },
  cameraLink: { alignItems: 'center', marginTop: 14, paddingVertical: 6 },
  cameraLinkText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.pulse },
  deltaWrap: { alignItems: 'center', marginTop: 26, minHeight: 46 },
  objectiveBox: {
    borderWidth: 1,
    borderColor: 'rgba(168,255,120,0.35)',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  objectiveBoxMuted: { borderColor: 'rgba(255,255,255,0.12)' },
  objectiveLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.glow,
  },
  objectiveText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.white,
    marginTop: 6,
  },
  objectiveNote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    color: colors.haze,
    marginTop: 4,
  },
  delta: { fontFamily: fonts.sansBold, fontSize: 16 },
  deltaSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
});
