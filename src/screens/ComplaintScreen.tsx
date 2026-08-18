import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import {
  COMPLAINTS,
  CUSTOM_COMPLAINT_ID,
  type Complaint,
} from '../constants/complaints';
import { useT, useTheme } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
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
  const { user } = useUser();
  const [selected, setSelected] = useState<Complaint | null>(null);
  /** Listedeki hazır şikayetler yerine kendi cümlesini yazıyor mu? */
  const [custom, setCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const customReady = customText.trim().length >= 3;
  const canContinue = custom ? customReady : selected !== null;

  const start = () => {
    if (!canContinue) return;
    haptics.tap();
    navigation.navigate('Examination', {
      complaintId: custom ? CUSTOM_COMPLAINT_ID : (selected as Complaint).id,
      customText: custom ? customText.trim() : undefined,
    });
  };

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

        {/* Kurulumdan hemen sonra buraya düşüldüğü için ilk satır
            kişisel: beklenti etkisini adıyla başlatıyor. */}
        {user.name ? (
          <>
            <Text style={[styles.greeting, { color: theme.text }]}>
              {t('Merhaba {ad}.', { ad: user.name })}
            </Text>
            <Text style={[styles.question, { color: theme.sub }]}>
              {t('Bugün ne hissediyorsun?')}
            </Text>
          </>
        ) : (
          // Ad yoksa soru başlığın kendisi olur; ekran başsız kalmasın.
          <Text style={[styles.title, { color: theme.text }]}>
            {t('Bugün ne hissediyorsun?')}
          </Text>
        )}
        <Text style={[styles.sub, { color: theme.sub }]}>
          {t('Dürüst ol. Beklenti protokolü dürüstlükle daha iyi çalışır.')}
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
                setCustom(false);
              }}
            />
          ))}

          {/* Listede karşılığı olmayan durumlar için: kendi cümlesi. */}
          <PressableScale
            onPress={() => {
              haptics.tap();
              setCustom(true);
              setSelected(null);
            }}
            pressedScale={0.99}
            accessibilityRole="button"
            accessibilityState={{ selected: custom }}
            style={[
              styles.row,
              {
                backgroundColor: custom ? theme.accentSoft : theme.surface,
                borderColor: custom ? theme.pulse : theme.border,
              },
            ]}
          >
            <Text style={styles.icon}>✍️</Text>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('Kendim anlatayım')}
            </Text>
          </PressableScale>

          {custom ? (
            <View style={styles.customWrap}>
              <TextInput
                value={customText}
                onChangeText={setCustomText}
                placeholder={t('Örn. Sabahları kalkmakta zorlanıyorum')}
                placeholderTextColor={theme.faint}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                multiline
                maxLength={120}
                autoFocus
              />
              <Text style={[styles.inputHint, { color: theme.faint }]}>
                {t(
                  'Kendi cümlen reçetenin adını ve formülün hedefini belirler. {kalan} karakter kaldı.',
                  { kalan: 120 - customText.length }
                )}
              </Text>
            </View>
          ) : null}
        </View>

        <TransparencyPill
          light
          style={styles.pill}
          text={t('⚗️ Şikayetin formülün adını belirler; etkiyi belirleyen sensin.')}
        />

        <PressableScale
          onPress={start}
          disabled={!canContinue}
          accessibilityRole="button"
          style={[
            styles.cta,
            { backgroundColor: canContinue ? colors.pulse : theme.border },
          ]}
        >
          <Text
            style={[styles.ctaText, { color: canContinue ? colors.white : theme.faint }]}
          >
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
  greeting: { fontFamily: fonts.serif, fontSize: 28, marginTop: 10 },
  question: { fontFamily: fonts.sans, fontSize: 16, marginTop: 4 },
  // Selamlama varken başlık ona yapışsın diye üst boşluk küçük.
  title: { fontFamily: fonts.serif, fontSize: 30, marginTop: 4 },
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
  customWrap: { marginTop: 2, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 92,
    textAlignVertical: 'top',
  },
  inputHint: { fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: 6 },
  pill: { marginTop: 8 },
  cta: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: { fontFamily: fonts.sansBold, fontSize: 15 },
});
