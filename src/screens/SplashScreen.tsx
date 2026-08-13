import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import ConicRing from '../components/ConicRing';
import ParticleField from '../components/ParticleField';
import PressableScale from '../components/PressableScale';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const t = useT();

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={20} />

      <View style={styles.ringWrap}>
        <ConicRing size={168} thickness={12} durationMs={8000} />
        <View style={styles.ringHole} />
      </View>

      <Text style={styles.title}>Plasebo</Text>
      <Text style={styles.tagline}>{t('BİLEREK İNAN')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          {t('Bu uygulama tamamen ')}
          <Text style={styles.highlight}>{t('plasebo')}</Text>
          {t(' içerir. Bunu biliyorsun. Yine de ')}
          <Text style={styles.highlight}>{t('işe yarayacak')}</Text>
          {t('.')}
        </Text>
      </View>

      <PressableScale
        onPress={() => navigation.navigate('Intro')}
        accessibilityRole="button"
        style={styles.primary}
      >
        <Text style={styles.primaryText}>{t('Başla')}</Text>
      </PressableScale>

      <Pressable
        onPress={() => navigation.navigate('HowItWorks')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.ghostText}>{t('Nasıl çalışır?')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringHole: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.ink,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.white,
    marginTop: 34,
  },
  tagline: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.haze,
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 34,
  },
  cardText: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    lineHeight: 24,
    color: colors.mist,
    textAlign: 'center',
  },
  highlight: { color: colors.glow },
  primary: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 64,
    marginTop: 34,
  },
  primaryText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  ghost: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 16 },
  ghostText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.haze,
  },
});
