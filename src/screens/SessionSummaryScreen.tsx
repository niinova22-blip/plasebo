import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { complaintById } from '../constants/complaints';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { translateFormulaName } from '../i18n';
import { shareReceipt } from '../utils/receipt';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

/**
 * Seans özeti — akışın son ekranı.
 *
 * Önce/sonra ölçümü tek bakışta karşılaştırılıyor. Başlık üç durumdan
 * birini alıyor; kötüleşme de "yanlış" değil, bir sonuç olarak sunuluyor.
 * "Ana sayfaya dön" yığını sıfırlıyor, yani buradan geri gidilemiyor.
 */
export default function SessionSummaryScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const t = useT();
  const motion = useMotion();
  const { complaintId, formula, scoreBefore, scoreAfter, durationSeconds } = route.params;
  const complaint = complaintById(complaintId);

  const diff = scoreBefore - scoreAfter;
  const percent = scoreBefore > 0 ? Math.round((diff / scoreBefore) * 100) : 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  const title =
    diff > 0 ? 'Etki Gözlemlendi ⚗️' : diff === 0 ? 'Veri Toplandı 📊' : 'Yarın Tekrar 🔄';

  const enter = useSharedValue(motion.reduced ? 1 : 0);
  useEffect(() => {
    if (motion.reduced) return;
    enter.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
  }, [enter, motion.reduced]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value * 1.3),
    transform: [{ translateY: (1 - enter.value) * 26 }],
  }));

  // Etki çubuğu: iyileşme yüzdesi kadar dolar.
  const bar = useSharedValue(0);
  useEffect(() => {
    const target = Math.max(0, Math.min(100, percent)) / 100;
    bar.value = motion.reduced
      ? target
      : withDelay(320, withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [bar, percent, motion.reduced]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${bar.value * 100}%`,
  }));

  const share = () => {
    void shareReceipt(
      [
        t('Bugün "{sikayet}" için plasebo ritüeli yaptım.', {
          sikayet: t(complaint?.label ?? ''),
        }),
        diff > 0
          ? t('Etki: %{yuzde} azalma 🧪', { yuzde: percent })
          : t('Etki: değişim yok — o da veri 🧪'),
        t('— Plasebo · bilerek inan'),
      ].join('\n')
    );
  };

  return (
    <Screen background={theme.bg}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={titleStyle}>
          <Text style={[styles.title, { color: theme.text }]}>{t(title)}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            cardStyle,
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.sub }]}>
            {t('📋 SEANS ÖZETİ')}
          </Text>

          <Field label={t('Şikayet')} value={t(complaint?.label ?? '—')} />
          <Divider />
          <Field
            label={t('Reçete')}
            value={`${t(complaint?.prescriptionName ?? '—')} #${formula.id % 100}`}
          />
          <Field label={t('Formül')} value={translateFormulaName(formula.name, t)} />
          <Field
            label={t('Süre')}
            value={t('{dk} dakika {sn} saniye', { dk: minutes, sn: seconds })}
          />
          <Divider />

          <View style={styles.scores}>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreValue, { color: theme.sub }]}>{scoreBefore}</Text>
              <Text style={[styles.scoreLabel, { color: theme.faint }]}>{t('Önce')}</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.faint }]}>→</Text>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreValue, { color: theme.pulse }]}>{scoreAfter}</Text>
              <Text style={[styles.scoreLabel, { color: theme.faint }]}>{t('Sonra')}</Text>
            </View>
          </View>

          <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
            <Animated.View style={[styles.barFill, barStyle]} />
          </View>
          <Text style={[styles.barLabel, { color: theme.sub }]}>
            {diff > 0
              ? t('%{yuzde} etki gözlemlendi', { yuzde: percent })
              : diff === 0
                ? t('Değişim yok — bu da veri')
                : t('Bugün zordu. Yarın tekrar.')}
          </Text>

          <Divider />
          <Text style={[styles.note, { color: theme.sub }]}>
            {t(
              '“Beklenti etkisi aktive edildi. Plasebo olduğunu bilmen etkiyi azaltmadı.”'
            )}
          </Text>
        </Animated.View>

        <TransparencyPill
          light
          style={styles.pill}
          text={t('⚗️ Ölçtüğün şey senin izlenimin — plasebo araştırmaları da bunu ölçer.')}
        />

        <PressableScale
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          accessibilityRole="button"
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{t('Ana Sayfaya Dön')}</Text>
        </PressableScale>

        <PressableScale
          onPress={share}
          accessibilityRole="button"
          style={[styles.ghost, { borderColor: theme.border }]}
        >
          <Text style={[styles.ghostText, { color: theme.sub }]}>{t('Paylaş')}</Text>
        </PressableScale>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.faint }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 20,
  },
  cardLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 14,
  },
  field: { marginBottom: 10 },
  fieldLabel: { fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1 },
  fieldValue: { fontFamily: fonts.sans, fontSize: 14, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  scores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  scoreBox: { alignItems: 'center', minWidth: 74 },
  scoreValue: { fontFamily: fonts.mono, fontSize: 38, includeFontPadding: false },
  scoreLabel: { fontFamily: fonts.sans, fontSize: 11, marginTop: 2 },
  arrow: { fontFamily: fonts.sans, fontSize: 20, marginHorizontal: 10 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 14,
  },
  barFill: { height: '100%', backgroundColor: colors.glow, borderRadius: 4 },
  barLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  note: {
    fontFamily: fonts.serifItalic,
    fontSize: 12,
    lineHeight: 19,
  },
  pill: { marginTop: 20 },
  primary: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
  ghost: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  ghostText: { fontFamily: fonts.sansMedium, fontSize: 13 },
});
