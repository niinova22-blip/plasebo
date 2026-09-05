import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ScoreBig from '../components/ScoreBig';
import ChartArea from '../components/ChartArea';
import InsightCard from '../components/InsightCard';
import Heatmap from '../components/Heatmap';
import LedgerChart from '../components/LedgerChart';
import BadgeGrid from '../components/BadgeGrid';
import PressableScale from '../components/PressableScale';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useT, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import {
  badgesFor,
  bestWeekday,
  blindTestResult,
  dailyScores,
  heatmapDays,
  improvementByCategory,
  improvementPercent,
  ledgerSeries,
  overallScore,
  weeklyFacts,
  BLIND_MIN_DIFFERENCE,
  BLIND_MIN_PER_GROUP,
} from '../utils/storage';
import { weeklySummary } from '../utils/localAI';
import { colors } from '../constants/colors';
import { useToday } from '../hooks/useToday';
import { CATEGORY_LABELS } from '../constants/complaints';
import type { RootStackParamList } from '../navigation/types';
import { PLAN_NAME, PREMIUM_ENABLED } from '../constants/plans';
import { FORCE_FREE_TIER } from '../constants/devTier';

/** Isı haritasının premium'da kapsadığı gün sayısı. */
const FULL_HEATMAP_DAYS = 28;

/**
 * Haftanın günü deseni için gereken en az ritüel sayısı — `bestWeekday`
 * bu eşiğin altında `null` döner. Ekranda kaç ritüel kaldığını
 * söyleyebilmek için burada da duruyor.
 */
const PATTERN_MIN_SESSIONS = 3;

export default function StatsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const { limits } = usePremium();
  const theme = useTheme();
  const t = useT();
  // Ana ekranla aynı davranış: gün dönünce grafikler de kayar.
  const today = useToday();

  const heatmapWindow = Math.min(FULL_HEATMAP_DAYS, limits.historyDays);

  const chartData = useMemo(
    () =>
      dailyScores(user.sessions, 7, today).map((d) => ({
        label: d.label,
        score: d.score,
        date: d.date,
      })),
    [user.sessions, today]
  );

  const score = overallScore(user);
  const improvement = improvementPercent(user);
  const best = bestWeekday(user.sessions);
  const missingForPattern = Math.max(0, PATTERN_MIN_SESSIONS - user.sessions.length);
  const blind = blindTestResult(user.sessions);
  const badges = badgesFor(user);
  const byCategory = improvementByCategory(user.sessions);
  // Ölçüm defteri: her seansın önce/sonra çifti.
  const ledger = useMemo(
    () => ledgerSeries(user.sessions, 7, today),
    [user.sessions, today]
  );

  /**
   * Haftalık özet. Bulgular saf fonksiyonlarla burada hesaplanıyor;
   * cihaz üstü model varsa onları bir paragrafa diziyor, yoksa aşağıdaki
   * elle yazılmış cümleler görünüyor. Yani kart her koşulda dolu.
   */
  const facts = useMemo(() => weeklyFacts(user, today), [user, today]);
  const [weeklyText, setWeeklyText] = useState<string | null>(null);
  useEffect(() => {
    if (!facts) {
      setWeeklyText(null);
      return;
    }
    let alive = true;
    void weeklySummary({
      sessions: facts.sessions,
      averageEffect: facts.averageEffect,
      bestDay: facts.bestDay ?? undefined,
      sleepEffect: facts.sleepEffect
        ? {
            shortNights: facts.sleepEffect.shortNights,
            otherNights: facts.sleepEffect.otherNights,
          }
        : undefined,
      weekKey: facts.weekKey,
    }).then((text) => {
      if (alive) setWeeklyText(text);
    });
    return () => {
      alive = false;
    };
  }, [facts]);
  // Çubukların ölçeği en yüksek etkiye göre; 1 puanın altında da görünsün.
  const maxEffect = Math.max(1, ...byCategory.map((c) => c.average));

  return (
    <Screen background={theme.bg}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>{t('İçgörüler')}</Text>
        <Text style={[styles.sub, { color: theme.sub }]}>{t('Son 14 gün')}</Text>

        <View style={styles.block}>
          <ScoreBig
            score={score}
            improvement={improvement}
            comparedDays={user.sessions.length >= 8 ? 12 : 0}
          />
        </View>

        <View style={styles.block}>
          <ChartArea data={chartData} />
        </View>

        <View style={styles.block}>
          <Heatmap days={heatmapDays(user, heatmapWindow, today)} />
          {(PREMIUM_ENABLED || FORCE_FREE_TIER) && heatmapWindow < FULL_HEATMAP_DAYS ? (
            <PressableScale
              onPress={() => navigation.navigate('Plans')}
              accessibilityRole="button"
              style={styles.upsell}
            >
              <Text style={[styles.upsellText, { color: theme.sub }]}>
                {t(
                  '🔒 Ücretsiz kademe son {gun} günü gösterir. Tüm geçmiş {plan} ile açılır.',
                  { gun: heatmapWindow, plan: PLAN_NAME }
                )}
              </Text>
            </PressableScale>
          ) : null}
        </View>

        {ledger.length ? (
          <View style={styles.block}>
            <Text style={[styles.sectionLabel, { color: theme.sub }]}>
              {t('ÖLÇÜM DEFTERİ')}
            </Text>
            <View style={[styles.objCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.objIntro, { color: theme.sub }]}>
                {t('Her ritüelin öncesi ve sonrası, aynı yöntemle ölçülmüş hâliyle.')}
              </Text>

              <LedgerChart data={ledger} />
            </View>
          </View>
        ) : null}

        {blind ? (
          <View style={styles.block}>
            <Text style={[styles.sectionLabel, { color: theme.sub }]}>
              {t('KÖR TEST')}
            </Text>
            <View style={[styles.objCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.objIntro, { color: theme.sub }]}>
                {t(
                  blind.metric === 'effect'
                    ? 'Ölçülen şey ritüelin etkisi: o günün öncesi eksi sonrası. Sahte günlerde renk, ses ve nefes verilmiyor — yalnızca aynı süre bekleniyor.'
                    : 'Eski kayıtlarda önce/sonra ölçümü olmadığı için gün sonu puanı karşılaştırılıyor; bu ölçü ritüel dışındaki her şeyden de etkilenir.'
                )}
              </Text>

              <View style={styles.objRow}>
                <View style={styles.objBox}>
                  <Text style={[styles.objValue, { color: theme.pulse }]}>
                    {blind.real.toFixed(1)}
                  </Text>
                  <Text style={[styles.objCaption, { color: theme.faint }]}>
                    {t('Gerçek ({adet})', { adet: blind.realCount })}
                  </Text>
                </View>
                <View style={styles.objBox}>
                  <Text style={[styles.objValue, { color: colors.glow }]}>
                    {blind.sham.toFixed(1)}
                  </Text>
                  <Text style={[styles.objCaption, { color: theme.faint }]}>
                    {t('Sahte ({adet})', { adet: blind.shamCount })}
                  </Text>
                </View>
              </View>

              <Text style={[styles.objNote, { color: theme.faint }]}>
                {!blind.meaningful
                  ? t(
                      'Aradaki fark {fark} puan. Yorumlamak için her iki tarafta en az {gereken} kayıt ve en az {esik} puan fark gerekiyor — şu an bu bir sonuç değil, biriken bir kayıt.',
                      {
                        fark: Math.abs(blind.difference).toFixed(1),
                        gereken: BLIND_MIN_PER_GROUP,
                        esik: BLIND_MIN_DIFFERENCE,
                      }
                    )
                  : blind.difference > 0
                    ? t(
                        'Gerçek ritüel günlerin sahte günlerden {fark} puan iyi geçmiş. Fark sende; ritüel bir çerçeve kuruyor.',
                        { fark: blind.difference.toFixed(1) }
                      )
                    : t(
                        'Sahte günlerin {fark} puan daha iyi geçmiş. Bu da mümkün ve bir hata değil — beklentinin ritüele ihtiyacı olmayabilir.',
                        { fark: Math.abs(blind.difference).toFixed(1) }
                      )}
              </Text>
            </View>
          </View>
        ) : null}

        {facts ? (
          <View style={styles.block}>
            <InsightCard
              title={t('📅 Bu haftanın özeti')}
              text={
                weeklyText ??
                [
                  t('Son 7 günde {adet} ritüel yaptın; ortalama etki {etki} puan.', {
                    adet: facts.sessions,
                    etki: facts.averageEffect.toFixed(1),
                  }),
                  facts.bestDay
                    ? t('En iyi geçen gün {gun}, ortalamanın %{yuzde} üstünde.', {
                        gun: t(facts.bestDay.day),
                        yuzde: facts.bestDay.percent,
                      })
                    : '',
                  facts.sleepEffect
                    ? t(
                        'Az uyuduğun gecelerin ortalama etkisi {az}, diğer gecelerin {cok}. Bu bir neden-sonuç değil, yalnızca bir eşlik.',
                        {
                          az: facts.sleepEffect.shortNights.toFixed(1),
                          cok: facts.sleepEffect.otherNights.toFixed(1),
                        }
                      )
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            />
          </View>
        ) : null}

        <View style={styles.block}>
          <InsightCard
            title={t('🧠 Haftanın günü deseni')}
            text={
              best
                ? t(
                    '{gun} günleri ritüel sonrası kendine verdiğin puan, tüm günlerin ortalamasının %{yuzde} üstünde. Bu, formülün o gün daha çok işe yaradığını göstermez — yalnızca o günlerin senin için daha iyi geçtiğini.',
                    { gun: t(best.day), yuzde: best.percent }
                  )
                : missingForPattern > 0
                  ? t(
                      'Bu kart, haftanın hangi gününde kendini daha yüksek puanladığını arar. Karşılaştırma için en az {gereken} ritüel gerekiyor; şu an {mevcut} tane var. {kalan} ritüel sonra burada bir gün adı belirecek.',
                      {
                        gereken: PATTERN_MIN_SESSIONS,
                        mevcut: user.sessions.length,
                        kalan: missingForPattern,
                      }
                    )
                  : t(
                      'Şimdilik hiçbir gün diğerlerinden ayrışmıyor — puanların günlere neredeyse eşit dağılmış. Bir gün öne çıkarsa burada yazacak.'
                    )
            }
          />
        </View>

        {(PREMIUM_ENABLED || FORCE_FREE_TIER) && !limits.prescriptionTracking ? (
          <View style={styles.block}>
            <Text style={[styles.sectionLabel, { color: theme.sub }]}>
              {t('ŞİKAYETE GÖRE')}
            </Text>
            <PressableScale
              onPress={() => navigation.navigate('Plans')}
              accessibilityRole="button"
              style={[styles.categoryCard, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.categoryName, { color: theme.sub }]}>
                {t('🔒 Reçete takibi · {plan}', { plan: PLAN_NAME })}
              </Text>
              <Text style={[styles.categoryNote, { color: theme.faint }]}>
                {t(
                  'Hangi şikayette ne kadar iyileştiğini gösteren takip {plan} ile açılır.',
                  { plan: PLAN_NAME }
                )}
              </Text>
            </PressableScale>
          </View>
        ) : byCategory.length ? (
          <View style={styles.block}>
            <Text style={[styles.sectionLabel, { color: theme.sub }]}>
              {t('ŞİKAYETE GÖRE')}
            </Text>
            <View style={[styles.categoryCard, { backgroundColor: theme.surface }]}>
              {byCategory.map((row) => (
                <View key={row.category} style={styles.categoryRow}>
                  <View style={styles.categoryHead}>
                    <Text style={[styles.categoryName, { color: theme.text }]}>
                      {t(CATEGORY_LABELS[row.category] ?? row.category)}
                    </Text>
                    <Text style={[styles.categoryValue, { color: theme.pulse }]}>
                      {t('{deger} puan', { deger: row.average.toFixed(1) })}
                    </Text>
                  </View>
                  <View style={[styles.categoryTrack, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.categoryFill,
                        {
                          backgroundColor: theme.pulse,
                          width: `${Math.max(4, (row.average / maxEffect) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.categoryCount, { color: theme.faint }]}>
                    {t('{adet} seans', { adet: row.count })}
                  </Text>
                </View>
              ))}
              <Text style={[styles.categoryNote, { color: theme.faint }]}>
                {t('Ortalama düşüş: ritüel öncesi puan eksi sonrası puan.')}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: theme.sub }]}>
          {t('KİLOMETRE TAŞLARI')}
        </Text>
        <BadgeGrid badges={badges} />

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 130 },
  categoryCard: { borderRadius: 24, padding: 20 },
  categoryRow: { marginBottom: 14 },
  categoryHead: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryName: { fontFamily: fonts.sansMedium, fontSize: 13 },
  categoryValue: { fontFamily: fonts.sansBold, fontSize: 13 },
  categoryTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  categoryFill: { height: '100%', borderRadius: 4 },
  categoryCount: { fontFamily: fonts.sans, fontSize: 10, marginTop: 4 },
  categoryNote: { fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: 4 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 4,
  },
  block: { marginTop: 18 },
  sectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 26,
    marginBottom: 12,
  },
  upsell: { marginTop: 10, paddingVertical: 4 },
  upsellText: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16 },
  pill: { marginTop: 26 },
  objCard: { borderRadius: 24, padding: 20 },
  objIntro: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
  objRow: { flexDirection: 'row', justifyContent: 'center', gap: 36, marginTop: 16 },
  objBox: { alignItems: 'center' },
  objValue: { fontFamily: fonts.mono, fontSize: 30, includeFontPadding: false },
  objCaption: { fontFamily: fonts.sans, fontSize: 10, marginTop: 4 },
  objNote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 12,
  },
});
