import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ScoreBig from '../components/ScoreBig';
import ChartArea from '../components/ChartArea';
import InsightCard from '../components/InsightCard';
import Heatmap from '../components/Heatmap';
import BadgeGrid from '../components/BadgeGrid';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
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
  improvementPercent,
  overallScore,
  toISODate,
} from '../utils/storage';
import type { RootStackParamList } from '../navigation/types';

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
  const today = toISODate();

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
          {heatmapWindow < FULL_HEATMAP_DAYS ? (
            <PressableScale
              onPress={() => navigation.navigate('Plans')}
              accessibilityRole="button"
              style={styles.upsell}
            >
              <Text style={[styles.upsellText, { color: theme.sub }]}>
                {t(
                  '🔒 Ücretsiz kademe son {gun} günü gösterir. Tüm geçmiş yakında açılacak.',
                  { gun: heatmapWindow }
                )}
              </Text>
            </PressableScale>
          ) : null}
        </View>

        {blind ? (
          <View style={styles.block}>
            <InsightCard
              title={t('🔬 Kör test karşılaştırması')}
              text={
                t(
                  'Gerçek ritüel ortalaman {gercek}/10 ({gercekAdet} kez), sahte ritüel ortalaman {sahte}/10 ({sahteAdet} kez). ',
                  {
                    gercek: blind.real,
                    gercekAdet: blind.realCount,
                    sahte: blind.sham,
                    sahteAdet: blind.shamCount,
                  }
                ) +
                t(
                  Math.abs(blind.real - blind.sham) < 0.5
                    ? 'Aradaki fark neredeyse yok — bu da bir bulgu.'
                    : blind.real > blind.sham
                      ? 'Fark sende; ritüel bir çerçeve kuruyor.'
                      : 'Sahte günlerin daha iyi geçmiş. Bu da mümkün.'
                )
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

        <Text style={[styles.sectionLabel, { color: theme.sub }]}>
          {t('KİLOMETRE TAŞLARI')}
        </Text>
        <BadgeGrid badges={badges} />

        <TransparencyPill
          light
          style={styles.pill}
          text={t('⚗️ Burada gördüğün senin plasebo yanıtın — araştırmaların ölçtüğü de tam olarak bu.')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 130 },
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
});
