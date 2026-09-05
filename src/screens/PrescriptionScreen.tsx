import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import CameraMoodCapture from '../components/CameraMoodCapture';
import TapReactionTest from '../components/TapReactionTest';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useSettings, useT, useTheme } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { usePremium } from '../context/PremiumContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import { prescriptionLine } from '../utils/localAI';
import {
  readHealthSnapshot,
  sleepShiftsToCalm,
  sleepVerdict,
  splitSleep,
  type HealthSnapshot,
} from '../utils/health';
import {
  applyDose,
  formulaTotalSeconds,
  GOAL_LABELS,
  generateDailyFormula,
  isShamDay,
  MOOD_ADJUST_THRESHOLD,
  poolsFor,
  withExtraCalmRound,
} from '../utils/formulaEngine';
import { consumeFaceScan, remainingFaceScans } from '../utils/faceScanQuota';
import { toISODate } from '../utils/storage';
import { translateFormulaName } from '../i18n';
import type { Lang, TranslateFn } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Prescription'>;

/** Kameradan çıkan skoru, kullanıcının okuyacağı bir tespit cümlesine çevirir. */
function moodDescriptor(score: number): string {
  if (score <= 3) return 'pozitif ve enerjik bir ifade';
  if (score <= 6) return 'nötr, hafif dağınık bir ifade';
  if (score <= 8) return 'gergin bir ifade';
  return 'çok gergin, bunalmış bir ifade';
}

/** Reçetedeki tarih — İngilizcede ay öne geçer. */
function formatDate(iso: string, t: TranslateFn, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  const month = t(months[m - 1]);
  return lang === 'en' ? `${month} ${d}, ${y}` : `${d} ${month} ${y}`;
}

/**
 * Reçete ekranı.
 *
 * Muayenenin çıktısı: kâğıt görünümlü bir kart. Kart bilerek tıbbi
 * reçeteye benziyor — üstte kırmızı çizgi, klinik adı, hasta satırı — ama
 * en altta ne olduğu açıkça yazıyor. Formül burada üretilmiyor; günün
 * formülü zaten hazır, kart yalnızca ona bir ad ve gerekçe giydiriyor.
 */
export default function PrescriptionScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const t = useT();
  const { lang, settings } = useSettings();
  const { user } = useUser();
  const { isPremium, packs, limits } = usePremium();
  const motion = useMotion();

  const complaint = resolveComplaint(route.params.complaintId, route.params.customText);
  const today = toISODate();
  const { faceMoodScore } = route.params;
  const moodAdjusted = faceMoodScore != null && faceMoodScore >= MOOD_ADJUST_THRESHOLD;

  /**
   * Ritüel öncesi ölçüm artık ayrı bir ekran değil.
   *
   * Önce "anlattığın şeyin şiddetini puanla" diye bir slider ekranı
   * vardı. İki sorunu vardı: kişiden kendi hâlini bir sayıya çevirmesini
   * istiyordu (herkesin ölçeği başka) ve fotoğrafla gelenler için bu
   * ölçüm zaten yapılmıştı — aynı şey iki kez soruluyordu.
   *
   * Başlangıç puanı artık her zaman fotoğraftan geliyor. Fotoğrafla
   * gelindiyse elde zaten var; kendi cümlesini yazarak gelindiyse ritüele
   * basıldığı anda kamera açılıyor. Böylece önce/sonra çifti baştan sona
   * aynı yöntemle ölçülmüş oluyor — biri beyan biri ölçüm değil.
   */
  const [baselineOpen, setBaselineOpen] = useState(false);
  /** Refleks ölçümü isteğe bağlı; yapıldıysa ritüel sonrasıyla eşlenir. */
  const [reactionOpen, setReactionOpen] = useState(false);
  const [reactionMs, setReactionMs] = useState<number | undefined>(undefined);

  /**
   * Bugün kaç yüz taraması hakkı kaldı?
   *
   * Plus'ta sonsuz. Ücretsiz kademede günde bir: özelliği hiç görmeyen
   * kullanıcı ona abone olmaz, ama sınırsız veren de abone olmaz. `null`
   * "henüz okunmadı" demek — okunmadan karar verilmiyor, yoksa ekran ilk
   * karesinde yanlış yolu seçebilir.
   */
  const [scansLeft, setScansLeft] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    void remainingFaceScans(limits.faceScansPerDay).then((left) => {
      if (alive) setScansLeft(left);
    });
    return () => {
      alive = false;
    };
  }, [limits.faceScansPerDay]);

  /**
   * Ritüele geçiş.
   *
   * `fromCamera`, puanın ölçümden mi beyandan mı geldiğini söylüyor ve
   * yalnız ölçümse `faceMoodScore` dolduruluyor. İkisini aynı alana
   * yazmak, istatistikte "kamerayla ölçülmüş" ile "kendi verdiği puan"ı
   * aynı kefeye koyardı — oysa uygulamanın bütün iddiası ikisinin farklı
   * şeyler olduğu.
   */
  const startRitual = (scoreBefore: number, fromCamera: boolean) => {
    navigation.navigate('Ritual', {
      formula,
      complaintId: complaint?.id ?? route.params.complaintId,
      customText: route.params.customText,
      scoreBefore,
      faceMoodScore: fromCamera ? scoreBefore : undefined,
      reactionBeforeMs: reactionMs,
    });
  };

  /** Elle ölçüme geçiş — kamera yoksa, hak bittiyse ya da izin verilmediyse. */
  const goManual = () => {
    setBaselineOpen(false);
    navigation.navigate('ScoreBefore', {
      complaintId: complaint?.id ?? route.params.complaintId,
      customText: route.params.customText,
      formula,
    });
  };

  /**
   * Sağlık verisi (varsa) reçeteye tek bir yerden giriyor: az uyunmuş bir
   * gecede fazladan bir sakinleştirme turu ekleniyor ve nedeni kartın
   * üstünde yazıyor. Kapalıysa ya da veri yoksa akış hiç değişmiyor.
   */
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  useEffect(() => {
    let alive = true;
    void readHealthSnapshot().then((snapshot) => {
      if (alive) setHealth(snapshot);
    });
    return () => {
      alive = false;
    };
  }, []);
  const sleepAdjusted = sleepShiftsToCalm(health);

  /**
   * Cihaz üstü modelin yazdığı bir cümlelik gerekçe. Model yoksa,
   * yavaşsa ya da hata verirse `null` kalıyor ve kart aşağıdaki sabit
   * metinlerle aynen çalışmaya devam ediyor — bu satır bir süs.
   */
  const [aiLine, setAiLine] = useState<string | null>(null);

  const formula = useMemo(() => {
    const goal = complaint?.goal ?? 'focus';
    const pools = poolsFor(isPremium, packs);
    const base = generateDailyFormula(goal, today, pools);
    const dosed = applyDose(base, limits.customDose ? settings.dose : 1);
    const adjusted = moodAdjusted || sleepAdjusted ? withExtraCalmRound(dosed) : dosed;
    return settings.blindTest && isShamDay(today) ? { ...adjusted, sham: true } : adjusted;
  }, [
    complaint,
    isPremium,
    packs,
    today,
    limits.customDose,
    settings.dose,
    settings.blindTest,
    moodAdjusted,
    sleepAdjusted,
  ]);

  useEffect(() => {
    if (!complaint) return;
    let alive = true;
    void prescriptionLine({
      complaint: complaint.label,
      goal: complaint.goal,
      faceMoodScore,
      sleepMinutes: health?.sleepMinutes ?? undefined,
      streak: user.streak,
      date: today,
    }).then((line) => {
      if (alive) setAiLine(line);
    });
    return () => {
      alive = false;
    };
  }, [complaint, faceMoodScore, health?.sleepMinutes, user.streak, today]);

  const minutes = Math.max(1, Math.round(formulaTotalSeconds(formula) / 60));

  // Kart aşağıdan yaylanarak gelir.
  const enter = useSharedValue(motion.reduced ? 1 : 0);
  useEffect(() => {
    if (motion.reduced) return;
    enter.value = withSpring(1, { damping: 14, stiffness: 120 });
  }, [enter, motion.reduced]);

  const cardStyle = useAnimatedStyle(() => ({
    // Opaklık doğrudan ilerlemeden okunuyor: `withTiming` burada hareketli
    // bir hedefi kovalıyordu ve kart yarı saydam kalabiliyordu.
    opacity: Math.min(1, enter.value * 1.4),
    transform: [{ translateY: (1 - enter.value) * 40 }],
  }));

  /**
   * Şikayet çözülemezse (bozuk kayıt ya da elden geçmiş bir bağlantı)
   * ekran boş kalmasın diye geri dönülür.
   *
   * Bu geri dönüş eskiden doğrudan render gövdesinde çağrılıyordu; React,
   * çizim sırasında başka bir bileşenin durumunu güncellemekten şikâyet
   * eder ve yönlendirme yarıda kalabilir. Artık çizim bittikten sonra,
   * yan etki olarak yapılıyor.
   */
  useEffect(() => {
    if (!complaint) navigation.goBack();
  }, [complaint, navigation]);

  if (!complaint) return null;

  return (
    <Screen background={theme.bg}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: theme.sub }]}>{t('BUGÜNÜN REÇETESİ')}</Text>

        {faceMoodScore != null ? (
          <View style={styles.aiNote}>
            <Text style={styles.aiNoteText}>
              {t('🤖 Yüz ifadenden {tespit} algılandı, buna göre {hedef} odaklı bir reçete hazırlandı.', {
                tespit: t(moodDescriptor(faceMoodScore)),
                hedef: t(GOAL_LABELS[complaint.goal]),
              })}
              {moodAdjusted
                ? ` ${t('Gerginliğe karşı ekstra bir sakinleştirme turu da eklendi.')}`
                : ''}
            </Text>
          </View>
        ) : null}

        {/* Uyku verisi geldiyse: kaç saat uyunduğu ve reçeteye ne
            yaptığı. Bir sağlık iddiası kurulmuyor — yalnızca bugünün
            bağlamı yazılıyor. */}
        {health?.sleepMinutes != null ? (
          <View style={styles.aiNote}>
            <Text style={styles.aiNoteText}>
              {t('🛏️ Dün gece {saat} saat {dakika} dakika uyumuşsun.', {
                saat: splitSleep(health.sleepMinutes).hours,
                dakika: splitSleep(health.sleepMinutes).minutes,
              })}{' '}
              {t(
                sleepVerdict(health.sleepMinutes) === 'short'
                  ? 'Kısa bir geceydi; bugünün reçetesine fazladan bir sakinleştirme turu eklendi.'
                  : sleepVerdict(health.sleepMinutes) === 'ok'
                    ? 'Orta bir geceydi; reçete olduğu gibi bırakıldı.'
                    : 'İyi bir geceydi; reçete olduğu gibi bırakıldı.'
              )}
              {health.restingHeartRate != null
                ? ` ${t('Son dinlenme nabzın {nabiz}.', {
                    nabiz: Math.round(health.restingHeartRate),
                  })}`
                : ''}
            </Text>
          </View>
        ) : null}

        {/* Cihazda üretilmiş gerekçe. Model yoksa bu blok hiç çizilmiyor
            ve kartın kendi sabit metinleri yeterli oluyor. */}
        {aiLine ? (
          <View style={styles.aiNote}>
            <Text style={styles.aiNoteText}>{aiLine}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.card, cardStyle]}>
          {/* Reçete kâğıdı bilerek her temada beyaz: tıbbi çağrışım
              rengin kendisinden geliyor. */}
          <View style={styles.rule} />

          <View style={styles.cardHead}>
            <View style={styles.clinic}>
              <Text style={styles.clinicName}>{t('Plasebo Protokol Merkezi')}</Text>
              <Text style={styles.clinicDoctor}>{t('Dr. Plasebo, Nörobilim')}</Text>
            </View>
            <Text style={styles.mark}>⚗️</Text>
          </View>

          <View style={styles.divider} />

          <Row label={t('Hasta')} value={user.name || t('Misafir')} />
          <Row label={t('Tarih')} value={formatDate(today, t, lang)} />
          <Row label={t('Şikayet')} value={t(complaint.label)} />

          <View style={styles.divider} />

          <Text style={styles.prescription}>
            {t(complaint.prescriptionName)} #{formula.id % 100}
          </Text>
          <Text style={styles.desc}>“{t(complaint.formulaDesc)}”</Text>

          <View style={styles.spacer} />
          <Row label={t('Uygulama')} value={t('1 × günlük')} />
          <Row label={t('Süre')} value={t('{dk} dakika', { dk: minutes })} />
          <Row
            label={t('Formül')}
            value={translateFormulaName(formula.name, t)}
          />

        </Animated.View>

        <TapReactionTest
          visible={reactionOpen}
          onCancel={() => setReactionOpen(false)}
          onResult={(result) => {
            setReactionMs(result.medianMs);
            setReactionOpen(false);
          }}
        />

        <CameraMoodCapture
          visible={baselineOpen}
          onCancel={() => setBaselineOpen(false)}
          onManual={goManual}
          manualLabel={t('Kamera olmadan elle puanla')}
          onResult={({ score }) => {
            setBaselineOpen(false);
            haptics.success();
            // Hak, ölçüm **başarıyla bittiğinde** düşüyor: vazgeçilen ya
            // da yüz bulunamayan bir deneme hak yakmamalı.
            void consumeFaceScan();
            setScansLeft((left) => (left == null ? left : Math.max(0, left - 1)));
            startRitual(score, true);
          }}
        />

        <Text style={[styles.question, { color: theme.text }]}>
          {t('Reçeteni kabul ediyor musun?')}
        </Text>

        <View style={styles.actions}>
          <PressableScale
            onPress={() => {
              haptics.tap();
              // Üç yol var ve sırası önemli:
              //   1. Fotoğraf şikayet ekranında zaten çekildiyse ölçüm
              //      elde — ikinci kez istemek hem hak yakar hem sinir
              //      bozar.
              //   2. Tarama hakkı varsa kamera açılıyor: asıl yol bu.
              //   3. Hak bittiyse (ya da kota henüz okunmadıysa) elle
              //      ölçüme gidiliyor. Kota okunmadan kamerayı açmak,
              //      hakkı olmayan kullanıcıya ölçüm yaptırıp sonra geri
              //      almak olurdu.
              if (faceMoodScore != null) startRitual(faceMoodScore, true);
              else if (scansLeft != null && scansLeft > 0) setBaselineOpen(true);
              else goManual();
            }}
            accessibilityRole="button"
            style={[styles.accept, { backgroundColor: colors.pulse }]}
          >
            <Text style={styles.acceptText}>{t('Evet, uygula')}</Text>
          </PressableScale>

          <PressableScale
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={[styles.ghost, { borderColor: theme.border }]}
          >
            <Text style={[styles.ghostText, { color: theme.sub }]}>
              {t('Farklı şikayet')}
            </Text>
          </PressableScale>
        </View>

        {/* Refleks ölçümü isteğe bağlı ve tamamen nesnel: kişinin
            beyanından bağımsız bir önce/sonra çifti veriyor.
            Ritüelden önce yapılması gerekiyor, o yüzden bu ekranda.

            Eskiden reçete kartıyla "Reçeteni kabul ediyor musun?"
            sorusunun arasında, ortalanmış tek bir bağlantı olarak
            duruyordu. Akışın tam ortasına düşen, hiçbir şeye tutunmayan
            bir satırdı: asıl yol (reçete → kabul → başla) onun üstünden
            atlamak zorunda kalıyordu. Şimdi asıl yolun altında, kendi
            çerçevesi ve açıklamasıyla — isteğe bağlı bir şeyin durması
            gereken yerde. */}
        <PressableScale
          onPress={() => {
            haptics.tap();
            setReactionOpen(true);
          }}
          accessibilityRole="button"
          style={[
            styles.reaction,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={styles.reactionMark}>⚡</Text>
          <View style={styles.reactionTextWrap}>
            <Text style={[styles.reactionTitle, { color: theme.text }]}>
              {reactionMs != null
                ? t('Refleks: {ms} ms — yeniden ölç', { ms: reactionMs })
                : t('Refleksini de ölç')}
            </Text>
            <Text style={[styles.reactionNote, { color: theme.faint }]}>
              {t(
                'İsteğe bağlı. Ritüelden önce ve sonra tepki süreni ölçüp farkı görebilirsin.'
              )}
            </Text>
          </View>
        </PressableScale>
      </ScrollView>
    </Screen>
  );
}

/** Reçetedeki "etiket: değer" satırı. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const PAPER = '#FFFFFF';
const PAPER_INK = '#2C2C35';
const PAPER_SUB = '#6B6B7A';

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  // Refleks bağlantısı kaldırılan ölçüm ekranından buraya taşındı; bu
  // ekranın içinde de akışın ortasından altına indi.
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  reactionMark: {
    fontSize: 18,
    lineHeight: 24,
    marginRight: 12,
    includeFontPadding: false,
  },
  reactionTextWrap: { flex: 1 },
  reactionTitle: { fontFamily: fonts.sansMedium, fontSize: 13 },
  reactionNote: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 8,
  },
  aiNote: {
    borderWidth: 1,
    borderColor: 'rgba(123,110,246,0.35)',
    backgroundColor: 'rgba(123,110,246,0.08)',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  aiNoteText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.pulse,
  },
  card: {
    backgroundColor: PAPER,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: 24,
    marginTop: 12,
    overflow: 'hidden',
  },
  // Tıbbi reçetelerin üstündeki kırmızı bant.
  rule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.warn,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  clinic: { flex: 1 },
  clinicName: { fontFamily: fonts.sansMedium, fontSize: 10, color: PAPER_SUB },
  clinicDoctor: {
    fontFamily: fonts.serifItalic,
    fontSize: 10,
    color: PAPER_SUB,
    marginTop: 2,
  },
  mark: { fontSize: 22, lineHeight: 28, color: colors.pulse, includeFontPadding: false },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.mist,
    marginVertical: 14,
  },
  row: { flexDirection: 'row', marginBottom: 6 },
  rowLabel: {
    width: 74,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: PAPER_SUB,
  },
  rowValue: { flex: 1, fontFamily: fonts.sans, fontSize: 12, color: PAPER_INK },
  prescription: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: PAPER_INK,
  },
  desc: {
    fontFamily: fonts.serifItalic,
    fontSize: 12,
    lineHeight: 19,
    color: PAPER_SUB,
    marginTop: 6,
  },
  spacer: { height: 12 },
  warn: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 16,
    color: colors.warn,
  },
  question: {
    fontFamily: fonts.serif,
    fontSize: 19,
    textAlign: 'center',
    marginTop: 26,
  },
  actions: { marginTop: 16 },
  accept: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  acceptText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
  ghost: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  ghostText: { fontFamily: fonts.sansMedium, fontSize: 13 },
});
