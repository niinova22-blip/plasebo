import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import StreakBar from '../components/StreakBar';
import FormulCard from '../components/FormulCard';
import AnimatedIn from '../components/AnimatedIn';
import CoachCard from '../components/CoachCard';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useT, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import GoalTag from '../components/GoalTag';
import {
  ALL_GOALS,
  GOAL_LABELS,
  applyDose,
  generateDailyFormula,
  isShamDay,
  poolsFor,
} from '../utils/formulaEngine';
import { canFreeze, freezeYesterday, toISODate } from '../utils/storage';
import { writeWidgetSnapshot } from '../utils/widget';
import { translateFormulaName } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import type { Goal } from '../types';
import type { RootStackParamList } from '../navigation/types';

/**
 * Saate göre selamlama.
 *
 * Aralıklar bilerek eşit değil: "günaydın" sabahın dar bir bandına ait,
 * gündüzün tamamı ise nötr bir "merhaba" ile geçiliyor.
 *   05:00–09:00 Günaydın · 09:00–19:00 Merhaba
 *   19:00–22:00 İyi akşamlar · 22:00–05:00 İyi geceler
 */
function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return 'Günaydın,';
  if (h >= 9 && h < 19) return 'Merhaba,';
  if (h >= 19 && h < 22) return 'İyi akşamlar,';
  return 'İyi geceler,';
}

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, update } = useUser();
  const { settings } = useSettings();
  const { isPremium, packs, limits } = usePremium();
  const theme = useTheme();
  const t = useT();

  const today = toISODate();
  const activeGoal = user.activeGoal ?? user.goals[0] ?? 'focus';
  const pools = useMemo(() => poolsFor(isPremium, packs), [isPremium, packs]);

  const dailyFormula = useMemo(() => {
    const base = generateDailyFormula(activeGoal, today, pools);
    const dosed = applyDose(base, limits.customDose ? settings.dose : 1);
    // Kör test açıkken bazı günler sahte ritüel gelir; hangisi olduğu
    // ritüel bitene kadar arayüzde belli edilmez.
    return settings.blindTest && isShamDay(today) ? { ...dosed, sham: true } : dosed;
  }, [activeGoal, today, pools, settings.dose, settings.blindTest, limits.customDose]);

  const formula = dailyFormula;

  const doneToday = user.lastRitualDate === today;
  /**
   * Nokta atışı reçete günde bir kez üretilir.
   *
   * Ücretsiz kademenin sınırı burada: dört sabit formül her zaman açık ve
   * sınırsız tekrar edilebilir, şikayete özel reçete ise günde bir. Sınır
   * ayrı bir sayaçla değil, o güne ait şikayetli bir seans olup olmadığına
   * bakılarak uygulanıyor — yarım kalan akış hakkı yakmıyor.
   */
  const todaySession = user.sessions.find(
    (s) => s.date === today && s.complaintId !== undefined
  );
  const targetedUsed = Boolean(todaySession) && !limits.crisisMode;

  /**
   * Hedef seçici her zaman dört hedefi birden gösterir.
   *
   * Her hedefin o güne ait kendi formülü var; buradan hangisine
   * dokunulursa kartta o günün o hedefe ait formülü açılır ve istenildiği
   * kadar tekrar oynatılabilir. Ücretsiz kademede de böyle: sınır yeni
   * formül **üretmekte** (kriz modu), günün formüllerine erişmekte değil.
   */
  const selectGoal = (goal: Goal) => {
    update({ goals: [goal], activeGoal: goal });
  };

  /**
   * Ana ekran widget'ının okuduğu özet, ana ekran her çizildiğinde
   * güncelleniyor: kullanıcı uygulamayı açtıkça widget da tazeleniyor.
   */
  useEffect(() => {
    void writeWidgetSnapshot({
      formula: translateFormulaName(formula.name, t),
      state: t(doneToday ? 'Bugün tamamlandı' : 'Bugün formülün hazır'),
      streak: user.streak,
      streakLabel: t('{gun} gün serisi', { gun: user.streak }),
    });
  }, [formula.name, doneToday, user.streak, t]);

  return (
    <Screen background={theme.bg}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedIn offsetY={20}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: theme.sub }]}>
                {t(greeting())}
              </Text>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                {user.name || t('Misafir')}
              </Text>
            </View>
            <LinearGradient
              colors={[theme.pulse, theme.glow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {(user.name || 'P').trim().charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
        </AnimatedIn>

        <AnimatedIn delay={100}>
          <StreakBar streak={user.streak} doneToday={doneToday} />
          {!doneToday && user.streak > 0 && canFreeze(user, today) ? (
            <PressableScale
              onPress={() => update(freezeYesterday(user, today))}
              accessibilityRole="button"
              style={styles.freeze}
            >
              <Text style={[styles.freezeText, { color: theme.sub }]}>
                {t('❄️ Dünü dondur — seri kopmasın (haftada 1)')}
              </Text>
            </PressableScale>
          ) : null}
        </AnimatedIn>

        <AnimatedIn delay={120} style={styles.goalRow}>
          <Text style={[styles.goalLabel, { color: theme.sub }]}>
            {t('FORMÜLÜ BELİRLEYEN HEDEF')}
          </Text>
          <View style={styles.goalTags}>
            {ALL_GOALS.map((goal) => (
              <GoalTag
                key={goal}
                label={t(GOAL_LABELS[goal])}
                active={goal === activeGoal}
                onPress={() => selectGoal(goal)}
              />
            ))}
          </View>
        </AnimatedIn>

        <AnimatedIn style={styles.cardSpacing}>
          <FormulCard
            formula={formula}
            doneToday={doneToday}
            // Dört sabit formül her zaman serbest: doğrudan ritüele girer
            // ve istenildiği kadar tekrar oynatılır.
            onStart={() => navigation.navigate('Ritual', { formula })}
          />
        </AnimatedIn>

        {/* Nokta atışı reçete: şikayet → muayene → reçete akışı. */}
        <AnimatedIn delay={150} style={styles.targetedWrap}>
          <PressableScale
            onPress={() => {
              if (targetedUsed && todaySession) {
                // Hak kullanıldıysa buton, o günün özetini açar.
                navigation.navigate('SessionSummary', {
                  complaintId: todaySession.complaintId ?? '',
                  customText: todaySession.complaintText,
                  formula,
                  scoreBefore: todaySession.scoreBefore ?? 0,
                  scoreAfter: todaySession.scoreAfter ?? 0,
                  durationSeconds: todaySession.durationSeconds ?? 0,
                });
                return;
              }
              navigation.navigate('Complaint');
            }}
            accessibilityRole="button"
            style={[
              styles.targeted,
              {
                backgroundColor: targetedUsed ? theme.surface : theme.accentSoft,
                borderColor: targetedUsed ? theme.border : theme.pulse,
              },
            ]}
          >
            <Text
              style={[
                styles.targetedTitle,
                { color: targetedUsed ? theme.sub : theme.pulse },
              ]}
            >
              {t(
                targetedUsed
                  ? '✓ Bugünkü nokta atışı reçeten alındı'
                  : '🩺 Nokta atışı reçete al'
              )}
            </Text>
            <Text style={[styles.targetedSub, { color: theme.faint }]}>
              {t(
                targetedUsed
                  ? 'Sonucu görmek için dokun. Yarın yeni bir reçete hakkın olacak.'
                  : 'Şikayetini anlat, sana özel bir reçete hazırlansın. Günde bir kez.'
              )}
            </Text>
          </PressableScale>
        </AnimatedIn>

        <AnimatedIn delay={180} style={styles.coach}>
          <CoachCard />
        </AnimatedIn>

        <AnimatedIn delay={200}>
          <TransparencyPill
            light
            style={styles.pill}
            text={t(
              '⚗️ Plasebo yanıtı ölçülmüş, tekrarlanmış bir olgudur. Devam ettikçe güçlenir.'
            )}
          />
        </AnimatedIn>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 130 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: { flex: 1 },
  greeting: {
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 26,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    // Gradyan avatar her iki temada da açık renkli kalıyor.
    color: colors.ink,
  },
  freeze: { alignSelf: 'center', marginTop: 8, paddingVertical: 6 },
  freezeText: { fontFamily: fonts.sans, fontSize: 11 },
  goalRow: { marginTop: 16 },
  goalLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  goalTags: { flexDirection: 'row', flexWrap: 'wrap' },
  cardSpacing: { marginTop: 16 },
  diceWrap: { marginTop: 12 },
  dice: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  diceText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  crisisNote: {
    marginTop: 10,
    alignItems: 'center',
  },
  crisisNoteText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  crisisBack: { marginTop: 6, paddingVertical: 6, paddingHorizontal: 12 },
  crisisBackText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
  },
  targetedWrap: { marginTop: 14 },
  targeted: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  targetedTitle: { fontFamily: fonts.sansBold, fontSize: 14 },
  targetedSub: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  coach: { marginTop: 22 },
  pill: { marginTop: 26 },
});
