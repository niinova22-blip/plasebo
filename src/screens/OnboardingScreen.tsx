import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import GoalTag from '../components/GoalTag';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useT, useTheme } from '../context/SettingsContext';
import { ALL_GOALS, GOAL_LABELS } from '../utils/formulaEngine';
import { setOnboarded } from '../utils/storage';
import type { Goal } from '../types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const GOAL_NOTES: Record<Goal, string> = {
  focus: 'Dikkatini toplamak istiyorsun',
  sleep: 'Daha kolay uyumak istiyorsun',
  anxiety: 'Zihnini yavaşlatmak istiyorsun',
  energy: 'Güne hız katmak istiyorsun',
};

/**
 * Kurulumun son adımı: bugün hangi hedefle başlanacağı.
 *
 * Burası önceden iki katmanlı bir seçimdi — önce "birden fazla hedef
 * seç", sonra "hangisi formülü belirlesin". O kurgu artık kendi içinde
 * tutarsız: dört hedefin de günlük formülü herkese açık ve ana ekrandaki
 * şerit dördünü birden gösteriyor, yani seçilmeyen hedefler de tek
 * dokunuşla açılıyor. "Hedeflerim" diye bir alt küme tutmanın hiçbir
 * karşılığı kalmadığı için ekran tek seçime indirildi: kullanıcı yalnızca
 * bugünün formülünü belirleyecek hedefi söylüyor.
 */
export default function OnboardingScreen({ navigation }: Props) {
  const { user, update } = useUser();
  const theme = useTheme();
  const t = useT();
  const [goal, setGoal] = useState<Goal>(user.activeGoal ?? user.goals[0] ?? 'focus');

  const finish = async () => {
    update({ goals: [goal], activeGoal: goal });
    await setOnboarded();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <Screen background={theme.bg}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.eyebrow, { color: theme.sub }]}>{t('KURULUM · 3/3')}</Text>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('Bugün hangisiyle başlıyorsun?')}
        </Text>
        <Text style={[styles.sub, { color: theme.sub }]}>
          {t(
            'Dört hedefin de her gün kendi formülü üretilir; hepsi açık. Burada yalnızca hangisiyle başlayacağını söylüyorsun — ana ekrandan istediğin an diğerine geçebilirsin.'
          )}
        </Text>

        <View style={styles.goals}>
          {ALL_GOALS.map((g) => (
            <View key={g} style={styles.goalRow}>
              <GoalTag
                label={t(GOAL_LABELS[g])}
                active={g === goal}
                onPress={() => setGoal(g)}
              />
              <Text style={[styles.goalNote, { color: theme.sub }]}>
                {t(GOAL_NOTES[g])}
              </Text>
            </View>
          ))}
        </View>

        <TransparencyPill
          light
          style={styles.pill}
          text={t(
            '⚗️ Seçimin formülün adını ve adım sırasını değiştirir, etkisini değil. Etki zaten sende.'
          )}
        />

        <PressableScale onPress={finish} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>{t('Formülümü oluştur')}</Text>
        </PressableScale>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48 },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    marginTop: 6,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  goals: { marginTop: 22 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalNote: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 11,
  },
  pill: { marginTop: 22 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 26,
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
