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
import LedgerChart from '../components/LedgerChart';
import PressableScale from '../components/PressableScale';
import { colors } from '../constants/colors';
import { fonts, type as typeScale } from '../constants/typography';
import { radius, space } from '../constants/layout';
import { useUser } from '../context/UserContext';
import { useT, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import GoalTag from '../components/GoalTag';
import { resolveComplaint } from '../constants/complaints';
import {
  ALL_GOALS,
  GOAL_LABELS,
  applyDose,
  generateDailyFormula,
  isShamDay,
  poolsFor,
} from '../utils/formulaEngine';
import {
  canFreeze,
  freezeYesterday,
  heatmapDays,
  ledgerSeries,
} from '../utils/storage';
import { useToday } from '../hooks/useToday';
import { STEP_SHORT, writeWidgetSnapshot } from '../utils/widget';
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

  // Gün dönerse tarih kendini tazeler: uygulama gece boyunca açık kalsa
  // bile ana ekran dünün formülünde takılı kalmaz.
  const today = useToday();
  /** Ölçüm defterinin ana ekrandaki kısa hâli. */
  const ledger = useMemo(
    () => ledgerSeries(user.sessions, 7, today),
    [user.sessions, today]
  );
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
  // En son yazılan reçete geçerli: kayıtlar eskiden yeniye eklendiği için
  // sondan başa aranıyor.
  const todaySession = [...user.sessions]
    .reverse()
    .find((s) => s.date === today && s.complaintId !== undefined);
  /**
   * Ücretsiz kademede günde **bir reçete yazılır**, ama o reçete
   * istenildiği kadar tekrar uygulanabilir: sınır üretimde, kullanımda
   * değil. Yeni bir reçete yazdırmak (günde birden fazla) premium'a
   * kalacak.
   */
  const targetedUsed = Boolean(todaySession) && !limits.unlimitedPrescriptions;

  /**
   * Bugünün reçetesini yeniden uygular — ölçüm baştan alınır.
   *
   * Reçete ekranına gidiyor, doğrudan ritüele değil: ritüelin başlangıç
   * puanı artık fotoğraftan geliyor ve o kamera adımı reçete ekranında
   * duruyor. Buradan ritüele atlamak, ölçümsüz bir seans yaratırdı.
   */
  const repeatTargeted = () => {
    if (!todaySession?.complaintId) return;
    navigation.navigate('Prescription', {
      complaintId: todaySession.complaintId,
      customText: todaySession.complaintText,
    });
  };

  /**
   * Hedef seçici her zaman dört hedefi birden gösterir.
   *
   * Her hedefin o güne ait kendi formülü var; buradan hangisine
   * dokunulursa kartta o günün o hedefe ait formülü açılır ve istenildiği
   * kadar tekrar oynatılabilir. Ücretsiz kademede de böyle: sınır yeni
   * formül **üretmekte** (kriz modu), günün formüllerine erişmekte değil.
   */
  const selectGoal = (goal: Goal) => {
    // `goals` dördü birden kalır: seçim yalnızca aktif hedefi değiştirir.
    // Eskiden burada listeye tek hedef yazılıyordu; hedefler kümesi bir
    // seçim gibi davrandığı için "hangi hedefler açık" sorusunun cevabı
    // son dokunulan hedefe göre değişiyordu.
    update({ goals: [...ALL_GOALS], activeGoal: goal });
  };

  /**
   * Ana ekran widget'ının okuduğu özet, ana ekran her çizildiğinde
   * güncelleniyor: kullanıcı uygulamayı açtıkça widget da tazeleniyor.
   */
  useEffect(() => {
    // Son 7 günün her biri için "o gün bir seans var mı". Isı haritasıyla
    // aynı kaynaktan geliyor ki widget ile İstatistik ekranı asla farklı
    // bir hikâye anlatmasın.
    const last7 = heatmapDays(user, 7, today).map((d) => d.score > 0);
    const last = user.sessions[user.sessions.length - 1];
    const drop =
      last?.scoreBefore != null && last?.scoreAfter != null
        ? last.scoreBefore - last.scoreAfter
        : null;

    void writeWidgetSnapshot({
      formula: translateFormulaName(formula.name, t),
      state: t(doneToday ? 'Bugün tamamlandı' : 'Bugün formülün hazır'),
      streak: user.streak,
      streakLabel: t('{gun} gün serisi', { gun: user.streak }),
      doneToday,
      steps: formula.stepOrder.map((s) => t(STEP_SHORT[s])).join(' · '),
      last7,
      dayLabel: t('GÜN'),
      deltaLabel:
        drop != null && drop > 0
          ? t('son seansta {fark} puan azaldı', { fark: drop })
          : undefined,
    });
  }, [formula.name, formula.stepOrder, doneToday, user, today, t]);

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

        {/* Nokta atışı reçete: şikayet → muayene → reçete akışı.
            Ekranın en üstünde duruyor — uygulamanın asıl vaadi bu ve
            aşağıda kaldığında hedef seçiciyle günlük formülün altında
            gözden kaçıyordu.

            Kart bir zamanlar yumuşak zemin + ince çerçeveydi; yerinin en
            üstte olması yetmiyordu, o hâliyle bir bilgi kutusu gibi
            okunuyor ve göz üstünden kayıyordu. Şimdi ekranın tek dolgulu
            yüzeyi: vurgu renginin kendisi zemin, yazı beyaz. Bir şeyin
            "burada" olduğunu söylemenin en ucuz yolu onu çerçevelemek,
            en açık yolu ise doldurmak. */}
        <AnimatedIn delay={120} style={styles.targetedWrap}>
          <PressableScale
            onPress={() => {
              if (targetedUsed) {
                repeatTargeted();
                return;
              }
              navigation.navigate('Complaint');
            }}
            accessibilityRole="button"
            style={[styles.targeted, { backgroundColor: theme.pulse }]}
          >
            <View style={styles.targetedTextWrap}>
              <Text style={styles.targetedTitle}>
                {targetedUsed && todaySession?.prescriptionName
                  ? t('{recete} · tekrar uygula', {
                      recete: t(todaySession.prescriptionName),
                    })
                  : t('Nokta atışı reçete al')}
              </Text>
              <Text style={styles.targetedSub}>
                {t(
                  targetedUsed
                    ? 'Bugünkü reçeten hazır; istediğin kadar tekrar uygulayabilirsin. Yeni reçete yarın.'
                    : 'Şikayetini anlat, sana özel bir reçete hazırlansın. Günde bir kez.'
                )}
              </Text>
            </View>
            <Text style={styles.targetedChevron}>›</Text>
          </PressableScale>

          {/* Bugünün sonucuna dönüş — tekrar uygulamayı bloklamasın diye
              ayrı ve küçük bir bağlantı. */}
          {targetedUsed && todaySession ? (
            <PressableScale
              onPress={() =>
                navigation.navigate('SessionSummary', {
                  complaintId: todaySession.complaintId ?? '',
                  customText: todaySession.complaintText,
                  formula,
                  scoreBefore: todaySession.scoreBefore ?? 0,
                  scoreAfter: todaySession.scoreAfter ?? 0,
                  durationSeconds: todaySession.durationSeconds ?? 0,
                })
              }
              accessibilityRole="button"
              style={styles.summaryLink}
            >
              <Text style={[styles.summaryLinkText, { color: theme.sub }]}>
                {t('Bugünkü sonucu gör')}
              </Text>
            </PressableScale>
          ) : null}
        </AnimatedIn>

        <AnimatedIn delay={150} style={styles.goalRow}>
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

        {/* Ölçüm defterinin kısa hâli. Uygulamanın en özgün çıktısı bu
            olduğu için ana ekranda duruyor; ayrıntısı İstatistik'te. */}
        {ledger.length ? (
          <AnimatedIn delay={170}>
            <PressableScale
              onPress={() => navigation.navigate('Main', { screen: 'Stats' })}
              accessibilityRole="button"
              style={[styles.ledgerCard, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.ledgerTitle, { color: theme.sub }]}>
                {t('ÖLÇÜM DEFTERİ · SON 7 GÜN')}
              </Text>
              <LedgerChart data={ledger} />
            </PressableScale>
          </AnimatedIn>
        ) : null}

        <AnimatedIn delay={180} style={styles.coach}>
          <CoachCard />
        </AnimatedIn>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Alt boşluk sekme çubuğunun altından geçen içerik için; ölçek
  // basamağı değil, ölçülmüş bir yükseklik.
  content: { padding: space.xl, paddingBottom: 130 },
  ledgerCard: { borderRadius: radius.xxl, padding: space.xl, marginTop: space.xl },
  ledgerTitle: { fontFamily: fonts.sansMedium, fontSize: typeScale.micro, letterSpacing: 2 },
  ledgerNote: {
    fontFamily: fonts.sans,
    fontSize: typeScale.micro,
    lineHeight: 16,
    marginTop: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.xl,
  },
  headerText: { flex: 1 },
  greeting: {
    fontFamily: fonts.sans,
    fontSize: typeScale.small,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: typeScale.display,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.sansBold,
    fontSize: typeScale.bodyLg,
    // Gradyan avatar her iki temada da açık renkli kalıyor.
    color: colors.ink,
  },
  freeze: { alignSelf: 'center', marginTop: space.sm, paddingVertical: 6 },
  freezeText: { fontFamily: fonts.sans, fontSize: typeScale.micro },
  goalRow: { marginTop: space.lg },
  goalLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: typeScale.micro,
    letterSpacing: 2,
    marginBottom: space.sm,
  },
  goalTags: { flexDirection: 'row', flexWrap: 'wrap' },
  cardSpacing: { marginTop: space.lg },
  diceWrap: { marginTop: space.md },
  dice: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  diceText: {
    fontFamily: fonts.sansMedium,
    fontSize: typeScale.small,
  },
  crisisNote: {
    marginTop: space.md,
    alignItems: 'center',
  },
  crisisNoteText: {
    fontFamily: fonts.sans,
    fontSize: typeScale.micro,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: space.xl,
  },
  crisisBack: { marginTop: space.xs, paddingVertical: 6, paddingHorizontal: space.md },
  crisisBackText: {
    fontFamily: fonts.sansMedium,
    fontSize: typeScale.micro,
  },
  targetedWrap: { marginTop: space.lg },
  // Dolgu düz `pulse`; bir ara vurgudan `glow`a giden bir gradyan
  // denendi ve geri alındı: gradyanın açık ucunda beyaz yazının
  // kontrastı 1,95'e düşüyordu (vurgunun kendisinde 3,65). Kartın öne
  // çıkması yazının okunmasından önemli değil.
  targeted: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    paddingVertical: space.xl,
    paddingHorizontal: space.xl,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  targetedTextWrap: { flex: 1 },
  // Dolgunun üstündeki yazı her temada beyaz: zemin artık temanın değil
  // vurgunun rengi ve o renk üç temada da aynı.
  targetedTitle: { fontFamily: fonts.sansBold, fontSize: typeScale.title, color: colors.white },
  targetedSub: {
    fontFamily: fonts.sans,
    fontSize: typeScale.small,
    lineHeight: 17,
    marginTop: space.xs,
    // Başlıktan bir tık soluk ama okunur: 0,92 opaklıkta kontrast
    // 3,34 (0,88'de 3,22 idi), dolgunun üstündeki başlıkta 3,65.
    color: 'rgba(255,255,255,0.92)',
  },
  targetedChevron: {
    fontFamily: fonts.sansBold,
    fontSize: typeScale.display,
    color: colors.white,
    marginLeft: space.md,
    includeFontPadding: false,
  },
  summaryLink: { alignSelf: 'center', paddingVertical: space.sm, paddingHorizontal: space.md },
  summaryLinkText: { fontFamily: fonts.sansMedium, fontSize: typeScale.small },
  coach: { marginTop: space.xxl },
  pill: { marginTop: space.xxl },
});
