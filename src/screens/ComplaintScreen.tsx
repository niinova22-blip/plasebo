import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { COMPLAINTS, type Complaint } from '../constants/complaints';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Complaint'>;

/**
 * Akışın ilk adımı: bugün ne şikayet var?
 *
 * Seçim, ritüelin hangi hedeften üretileceğini ve sonraki ekranlardaki
 * reçete metnini belirliyor. Tek seçim — "hepsi biraz" demenin ölçümü
 * anlamsızlaştıracağı bir akış bu.
 */
export default function ComplaintScreen({ navigation }: Props) {
  const theme = useTheme();
  const t = useT();
  const [selected, setSelected] = useState<Complaint | null>(null);

  return (
    <Screen background={theme.bg}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PressableScale
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={styles.back}
        >
          <Text style={[styles.backText, { color: theme.sub }]}>{t('‹ Geri')}</Text>
        </PressableScale>

        <Text style={[styles.title, { color: theme.text }]}>
          {t('Bugün ne hissediyorsun?')}
        </Text>
        <Text style={[styles.sub, { color: theme.sub }]}>
          {t('Dürüst ol. Plasebo dürüstlükle daha iyi çalışır.')}
        </Text>

        <View style={styles.list}>
          {COMPLAINTS.map((complaint) => (
            <ComplaintRow
              key={complaint.id}
              complaint={complaint}
              active={selected?.id === complaint.id}
              onPress={() => {
                haptics.tap();
                setSelected(complaint);
              }}
            />
          ))}
        </View>

        <TransparencyPill
          light
          style={styles.pill}
          text={t('⚗️ Şikayetin formülün adını belirler; etkiyi belirleyen sensin.')}
        />

        <PressableScale
          onPress={() => {
            if (!selected) return;
            haptics.tap();
            navigation.navigate('Examination', { complaintId: selected.id });
          }}
          disabled={!selected}
          accessibilityRole="button"
          style={[
            styles.cta,
            { backgroundColor: selected ? colors.pulse : theme.border },
          ]}
        >
          <Text style={[styles.ctaText, { color: selected ? colors.white : theme.faint }]}>
            {t('Devam Et')}
          </Text>
        </PressableScale>
      </ScrollView>
    </Screen>
  );
}

/** Tek şikayet kartı — seçilince kısa bir yaylanma yapar. */
function ComplaintRow({
  complaint,
  active,
  onPress,
}: {
  complaint: Complaint;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const motion = useMotion();
  const scale = useSharedValue(1);

  const press = () => {
    if (!motion.reduced) {
      scale.value = withSequence(
        withTiming(0.97, { duration: 90, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 11, stiffness: 220 })
      );
    }
    onPress();
  };

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <PressableScale
        onPress={press}
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[
          styles.row,
          {
            backgroundColor: active ? theme.accentSoft : theme.surface,
            borderColor: active ? theme.pulse : theme.border,
          },
        ]}
      >
        <Text style={styles.icon}>{complaint.icon}</Text>
        <Text style={[styles.label, { color: theme.text }]}>{t(complaint.label)}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  title: { fontFamily: fonts.serif, fontSize: 30, marginTop: 10 },
  sub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 19, marginTop: 6 },
  list: { marginTop: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  icon: {
    fontSize: 22,
    lineHeight: 28,
    marginRight: 14,
    includeFontPadding: false,
  },
  label: { flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  pill: { marginTop: 8 },
  cta: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: { fontFamily: fonts.sansBold, fontSize: 15 },
});
