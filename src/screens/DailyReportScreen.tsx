import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import {
  REPORT_MIN_CHECKINS,
  dailyReport,
  readCheckins,
  reportHeadline,
  type DailyReport,
} from '../utils/dailyCycle';
import {
  getCachedHealthSnapshot,
  readHealthSnapshot,
  splitSleep,
  sleepVerdict,
} from '../utils/health';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyReport'>;

/** "14" → "14:00" — rapor saatleri tam saat olarak gösteriliyor. */
function hourLabel(hour: number): string {
  return `${`${hour}`.padStart(2, '0')}:00`;
}

/**
 * 24 saatlik döngünün çıktısı.
 *
 * Gün içindeki kısa ölçümler ve (açıksa) Sağlık verisi tek bir yerde
 * birleşiyor. Rapor hiçbir şey teşhis etmiyor: yalnızca ne ölçüldüğünü ve
 * hangi saatte ölçüldüğünü söylüyor. Yeterli ölçüm yoksa rapor da yok —
 * iki ölçümden bir "gün" anlatmak, veriden fazlasını söylemek olurdu.
 */
export default function DailyReportScreen({ navigation }: Props) {
  const t = useT();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      // Sağlık verisi açıksa tazeleniyor; kapalıysa `null` dönüyor ve
      // rapor yalnızca nefes ölçümlerinden kuruluyor.
      await readHealthSnapshot();
      const entries = await readCheckins();
      if (!alive) return;
      setReport(dailyReport(entries, Date.now(), getCachedHealthSnapshot()));
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{t('SON 24 SAAT')}</Text>

        {!ready ? (
          <Text style={styles.sub}>{t('Okunuyor…')}</Text>
        ) : !report ? (
          <>
            <Text style={styles.title}>{t('Henüz yeterli ölçüm yok')}</Text>
            <Text style={styles.sub}>
              {t(
                'Günlük rapor için en az {adet} kısa ölçüm gerekiyor. Bildirim geldiğinde 45 saniyeni ayırman yeterli.',
                { adet: REPORT_MIN_CHECKINS }
              )}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t(reportHeadline(report))}</Text>
            <Text style={styles.sub}>
              {t('{adet} ölçümün ortalaması: %{yuzde} düzen.', {
                adet: report.count,
                yuzde: Math.round(report.averageRegularity * 100),
              })}
            </Text>

            <View style={styles.rows}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t('En düzenli an')}</Text>
                <Text style={styles.rowValue}>
                  {t('{saat} · %{yuzde}', {
                    saat: hourLabel(report.calmestHour),
                    yuzde: Math.round(report.calmestRegularity * 100),
                  })}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t('En gergin an')}</Text>
                <Text style={styles.rowValue}>
                  {t('{saat} · %{yuzde}', {
                    saat: hourLabel(report.tensestHour),
                    yuzde: Math.round(report.tensestRegularity * 100),
                  })}
                </Text>
              </View>
              {report.sleepMinutes != null ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{t('Dün gece uyku')}</Text>
                  <Text style={styles.rowValue}>
                    {t('{saat} sa {dakika} dk', {
                      saat: splitSleep(report.sleepMinutes).hours,
                      dakika: splitSleep(report.sleepMinutes).minutes,
                    })}
                  </Text>
                </View>
              ) : null}
              {report.restingHeartRate != null ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{t('Dinlenme nabzı')}</Text>
                  <Text style={styles.rowValue}>
                    {t('{nabiz} atım/dk', { nabiz: Math.round(report.restingHeartRate) })}
                  </Text>
                </View>
              ) : null}
            </View>

            {report.sleepMinutes != null ? (
              <Text style={styles.note}>
                {t(
                  sleepVerdict(report.sleepMinutes) === 'short'
                    ? 'Kısa bir geceydi; bugünkü reçetene fazladan bir sakinleştirme turu eklendi.'
                    : sleepVerdict(report.sleepMinutes) === 'ok'
                      ? 'Uykun ortalama bir gecedeydi.'
                      : 'Uykun yeterliydi.'
                )}
              </Text>
            ) : null}
          </>
        )}

        <TransparencyPill
          text={t(
            'Bu rapor bir teşhis değil: yalnızca senin yaptığın ölçümlerin ve Sağlık verinin yan yana konmuş hâli.'
          )}
        />
      </ScrollView>

      <PressableScale
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t('Kapat')}</Text>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  body: { paddingTop: 24, paddingBottom: 24, gap: 12 },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.pulse,
  },
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.white },
  sub: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.haze },
  rows: { marginTop: 12, gap: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingBottom: 10,
  },
  rowLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.haze },
  rowValue: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.white },
  note: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.haze,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
});
