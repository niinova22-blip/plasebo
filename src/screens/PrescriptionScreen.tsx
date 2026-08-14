import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { complaintById } from '../constants/complaints';
import { useSettings, useT, useTheme } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { usePremium } from '../context/PremiumContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import {
  applyDose,
  formulaTotalSeconds,
  generateDailyFormula,
  isShamDay,
  poolsFor,
} from '../utils/formulaEngine';
import { toISODate } from '../utils/storage';
import { translateFormulaName } from '../i18n';
import type { Lang, TranslateFn } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Prescription'>;

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

  const complaint = complaintById(route.params.complaintId);
  const today = toISODate();

  const formula = useMemo(() => {
    const goal = complaint?.goal ?? 'focus';
    const pools = poolsFor(isPremium, packs);
    const base = generateDailyFormula(goal, today, pools);
    const dosed = applyDose(base, limits.customDose ? settings.dose : 1);
    return settings.blindTest && isShamDay(today) ? { ...dosed, sham: true } : dosed;
  }, [complaint, isPremium, packs, today, limits.customDose, settings.dose, settings.blindTest]);

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

  if (!complaint) {
    navigation.goBack();
    return null;
  }

  return (
    <Screen background={theme.bg}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: theme.sub }]}>{t('BUGÜNÜN REÇETESİ')}</Text>

        <Animated.View style={[styles.card, cardStyle]}>
          {/* Reçete kâğıdı bilerek her temada beyaz: tıbbi çağrışım
              rengin kendisinden geliyor. */}
          <View style={styles.rule} />

          <View style={styles.cardHead}>
            <View style={styles.clinic}>
              <Text style={styles.clinicName}>{t('Plasebo Kliniği')}</Text>
              <Text style={styles.clinicDoctor}>{t('Dr. Algoritma, Nörobilim')}</Text>
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

          <View style={styles.divider} />

          <Text style={styles.warn}>
            {t('⚠️ Bu reçete tamamen plasebodur. Etkisi beklentiden gelir.')}
          </Text>
        </Animated.View>

        <Text style={[styles.question, { color: theme.text }]}>
          {t('Reçeteni kabul ediyor musun?')}
        </Text>

        <View style={styles.actions}>
          <PressableScale
            onPress={() => {
              haptics.tap();
              navigation.navigate('ScoreBefore', {
                complaintId: complaint.id,
                formula,
              });
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
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 8,
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
