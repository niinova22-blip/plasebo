import React, { useEffect, useMemo, useState } from 'react';
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
  generateCrisisFormula,
  generateDailyFormula,
  isShamDay,
  poolsFor,
} from '../utils/formulaEngine';
import { canFreeze, freezeYesterday, toISODate } from '../utils/storage';
import { writeWidgetSnapshot } from '../utils/widget';
import { translateFormulaName } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import type { Formula, Goal } from '../types';
import type { RootStackParamList } from '../navigation/types';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler,';
  if (h < 12) return 'Günaydın,';
  if (h < 18) return 'İyi günler,';
  return 'İyi akşamlar,';
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

  /** Kriz modunda üretilen geçici formül; null ise günün formülü geçerli. */
  const [crisisFormula, setCrisisFormula] = useState<Formula | null>(null);
  const formula = crisisFormula ?? dailyFormula;

  const doneToday = user.lastRitualDate === today;

  /**
   * Hedef seçici her zaman dört hedefi birden gösterir.
   *
   * Her hedefin o güne ait kendi formülü var; buradan hangisine
   * dokunulursa kartta o günün o hedefe ait formülü açılır ve istenildiği
   * kadar tekrar oynatılabilir. Ücretsiz kademede de böyle: sınır yeni
   * formül **üretmekte** (kriz modu), günün formüllerine erişmekte değil.
   */
  const selectGoal = (goal: Goal) => {
    setCrisisFormula(null);
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
            onStart={() => navigation.navigate('Ritual', { formula })}
          />
        </AnimatedIn>

        <AnimatedIn delay={150} style={styles.diceWrap}>
          <PressableScale
            onPress={() => {
              if (!limits.crisisMode) {
                navigation.navigate('Plans');
                return;
              }
              setCrisisFormula(generateCrisisFormula(activeGoal, pools));
            }}
            accessibilityRole="button"
            style={[
              styles.dice,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.diceText, { color: theme.sub }]}>
              {t(limits.crisisMode ? '🎲 Farklı formül dene' : '🔒 Kriz modu · yakında')}
            </Text>
          </PressableScale>

          {crisisFormula ? (
            <View style={styles.crisisNote}>
              <Text style={[styles.crisisNoteText, { color: theme.sub }]}>
                {t('Bu bugünkü formülün değil. Yarın normal formülüne döneceksin.')}
              </Text>
              <PressableScale
                onPress={() => setCrisisFormula(null)}
                accessibilityRole="button"
                style={styles.crisisBack}
              >
                <Text style={[styles.crisisBackText, { color: theme.pulse }]}>
                  {t('Günün formülüne dön')}
                </Text>
              </PressableScale>
            </View>
          ) : null}
        </AnimatedIn>

        <AnimatedIn delay={180} style={styles.coach}>
          <CoachCard />
        </AnimatedIn>

        <AnimatedIn delay={200}>
          <TransparencyPill
            light
            style={styles.pill}
            text={t(
              '⚗️ Bu ritüelin ölçülmüş bir etkisi yok. Sadece devam ettiğinin kaydı tutuluyor.'
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
  coach: { marginTop: 22 },
  pill: { marginTop: 26 },
});
