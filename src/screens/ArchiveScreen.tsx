import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useLang, useT, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import { GOAL_LABELS, generateDailyFormula } from '../utils/formulaEngine';
import { daysBetween, toISODate } from '../utils/storage';
import type { RootStackParamList } from '../navigation/types';
import { PLAN_NAME, PREMIUM_ENABLED } from '../constants/plans';
import { FORCE_FREE_TIER } from '../constants/devTier';
import Icon, { type IconName } from '../components/Icon';
import type { Goal, Session } from '../types';
import { translateFormulaName, type Lang, type TranslateFn } from '../i18n';

/**
 * Kayıt satırındaki adım ikonları.
 *
 * Emoji dizisiydi ("🎨 🎧 🌬️") ve tek bir metin satırına yazılıyordu.
 * Artık çizgi ikon: rengini temadan alıyor ve listede yanındaki
 * yazıyla aynı ağırlıkta okunuyor. `color` burada da yok — o adımı
 * satırın solundaki renk örneği zaten gösteriyor.
 */
const STEP_ICONS: Record<string, IconName> = {
  sound: 'wave',
  breath: 'wind',
  word: 'quote',
};

/** Tarih başlığı — İngilizcede ay öne geçer. */
function formatDate(iso: string, t: TranslateFn, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  const month = t(months[m - 1]);
  return lang === 'en' ? `${month} ${d}, ${y}` : `${d} ${month} ${y}`;
}

function SessionRow({ session }: { session: Session }) {
  const theme = useTheme();
  const t = useT();
  // Yeni kayıtlar formülün adını ve rengini kendi içinde taşır; eski
  // kayıtlar için o günün formülü tarihten yeniden üretilir.
  const fallback = generateDailyFormula(session.goal, session.date);
  const name = session.formulaName ?? fallback.name;
  const hex = session.colorHex ?? fallback.color.hex;

  return (
    <View style={[styles.row, { backgroundColor: theme.surface }]}>
      <View style={[styles.swatch, { backgroundColor: hex }]} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>
          {translateFormulaName(name, t)}
          {session.crisis ? t(' · kriz') : ''}
        </Text>
        <View style={styles.rowSubLine}>
          <Text style={[styles.rowSub, { color: theme.sub }]}>
            {t(GOAL_LABELS[session.goal as Goal] ?? session.goal)}
          </Text>
          {session.steps
            .filter((s) => STEP_ICONS[s])
            .map((s, i) => (
              <Icon
                key={`${s}-${i}`}
                name={STEP_ICONS[s]}
                size={13}
                color={theme.faint}
                strokeWidth={1.6}
                style={styles.stepIcon}
              />
            ))}
        </View>
      </View>
      <Text style={[styles.score, { color: theme.pulse }]}>{session.score}/10</Text>
    </View>
  );
}

export default function ArchiveScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const { limits } = usePremium();
  const theme = useTheme();
  const t = useT();
  const lang = useLang();
  const today = toISODate();

  // Ücretsiz kademede yalnızca son N gün görünür. Kayıtlar silinmiyor —
  // yalnızca gösterilmiyor; plan yükseltilince hepsi geri gelir.
  const { sections, hiddenCount } = useMemo(() => {
    const withinWindow = (date: string) =>
      daysBetween(date, today) < limits.historyDays;

    const visible = user.sessions.filter((s) => withinWindow(s.date));
    const byDate = new Map<string, Session[]>();
    [...visible].reverse().forEach((s) => {
      const list = byDate.get(s.date) ?? [];
      list.push(s);
      byDate.set(s.date, list);
    });

    return {
      sections: Array.from(byDate.entries()).map(([date, data]) => ({
        title: formatDate(date, t, lang),
        data,
      })),
      hiddenCount: user.sessions.length - visible.length,
    };
  }, [user.sessions, today, limits.historyDays, t, lang]);

  return (
    <Screen background={theme.bg}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{t('Arşiv')}</Text>
            <Text style={[styles.sub, { color: theme.sub }]}>
              {t('{adet} ritüel · hepsi telefonunda', {
                adet: user.sessions.length,
              })}
            </Text>
            {(PREMIUM_ENABLED || FORCE_FREE_TIER) && hiddenCount > 0 ? (
              <PressableScale
                onPress={() => navigation.navigate('Plans')}
                accessibilityRole="button"
                style={styles.upsell}
              >
                <Text style={[styles.upsellText, { color: theme.sub }]}>
                  {t(
                    '🔒 {gizli} eski kayıt gizli. Ücretsiz kademe son {gun} günü gösterir — kayıtlar silinmedi, {plan} ile hepsi geri gelir.',
                    { gizli: hiddenCount, gun: limits.historyDays, plan: PLAN_NAME }
                  )}
                </Text>
              </PressableScale>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.sub }]}>
              {t(
                'Henüz kayıt yok. İlk ritüelini tamamladığında burada birikmeye başlayacak.'
              )}
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: theme.sub }]}>
            {section.title.toLocaleUpperCase(lang === 'en' ? 'en-US' : 'tr-TR')}
          </Text>
        )}
        renderItem={({ item }) => <SessionRow session={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 130 },
  header: { marginBottom: 10 },
  title: { fontFamily: fonts.serif, fontSize: 30 },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  swatch: { width: 10, height: 36, borderRadius: 5, marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.sansMedium, fontSize: 14 },
  rowSubLine: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  stepIcon: { marginLeft: 6 },
  // Üst boşluk artık satırı saran kutuda; burada kalsaydı ikisi
  // toplanıyordu.
  rowSub: {
    fontFamily: fonts.sans,
    fontSize: 11,
  },
  score: { fontFamily: fonts.sansBold, fontSize: 13 },
  upsell: { marginTop: 10, paddingVertical: 4 },
  upsellText: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16 },
  empty: { paddingVertical: 40 },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  pill: { marginTop: 28 },
});
