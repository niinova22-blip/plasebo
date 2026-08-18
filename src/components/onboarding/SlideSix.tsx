import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Reveal from './Reveal';
import OnboardingButton from './OnboardingButton';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useMotion } from '../../hooks/useMotion';
import { useT } from '../../context/SettingsContext';

const RING = 132;

export interface SlideSixProps {
  width: number;
  active: boolean;
  name: string;
  onNameChange: (value: string) => void;
  onComplete: () => void;
  loading: boolean;
}

export default function SlideSix({
  width,
  active,
  name,
  onNameChange,
  onComplete,
  loading,
}: SlideSixProps) {
  const t = useT();
  const motion = useMotion();
  const [focused, setFocused] = useState(false);

  /** İnce halka: 20 saniyede bir tur. Fark edilmesi değil, hissedilmesi için. */
  const spin = useSharedValue(0);
  useEffect(() => {
    if (motion.reduced || !active) {
      cancelAnimation(spin);
      return;
    }
    spin.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(spin);
  }, [active, motion.reduced, spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  // Klavye açılınca üstteki animasyon küçülüp yukarı çekiliyor; yoksa
  // isim alanı klavyenin altında kalıyor.
  const shrink = useSharedValue(0);
  useEffect(() => {
    const target = focused ? 1 : 0;
    shrink.value = motion.reduced ? target : withSpring(target, { damping: 16, stiffness: 140 });
  }, [focused, motion.reduced, shrink]);

  const areaStyle = useAnimatedStyle(() => ({
    height: interpolate(shrink.value, [0, 1], [RING, 62]),
    opacity: interpolate(shrink.value, [0, 1], [1, 0.4]),
    transform: [{ scale: interpolate(shrink.value, [0, 1], [1, 0.48]) }],
  }));

  const trimmed = name.trim();

  return (
    <View style={[styles.page, { width }]}>
      <Reveal active={active} scaleFrom={0.5} spring>
        <Animated.View style={[styles.ringArea, areaStyle]}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Text style={styles.mark}>⚗️</Text>
        </Animated.View>
      </Reveal>

      <Reveal active={active} delay={200} offsetY={20} style={styles.nameBlock}>
        <Text style={styles.nameLabel}>{t('ADIN NE?')}</Text>
        <TextInput
          value={name}
          onChangeText={onNameChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('Adını yaz...')}
          placeholderTextColor="rgba(255,255,255,0.24)"
          style={[styles.input, focused && styles.inputFocused]}
          maxLength={24}
          returnKeyType="done"
          autoCapitalize="words"
          autoCorrect={false}
        />
      </Reveal>

      {/* İsim yazılınca beliren kişisel satır. `key` ile birlikte
          değiştiği için her yeni isimde giriş yeniden oynuyor. */}
      {trimmed ? (
        <Reveal key="greeting" active delay={0} offsetY={12} style={styles.greetingWrap}>
          <Text style={styles.greeting}>
            {t('{ad}, beynin\nseni bekliyor.', { ad: trimmed })}
          </Text>
        </Reveal>
      ) : (
        <View style={styles.greetingSpacer} />
      )}

      <Reveal active={active} delay={320} offsetY={20} style={styles.buttonWrap}>
        <OnboardingButton
          full
          label={loading ? t('Hazırlanıyor...') : t('İlk protokolümü başlat →')}
          onPress={onComplete}
          disabled={!trimmed}
          loading={loading}
        />
        <Text style={styles.footnote}>
          {t('Verin cihazında kalır · Ücretsiz başla')}
        </Text>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    // `flex: 1` YOK — sayfa dikey kaydırıcının içinde, yüksekliğini
    // içeriğinden alıyor. Bkz. OnboardingScreen'deki `Page`.
    paddingHorizontal: 28,
  },
  ringArea: {
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 1,
    borderColor: colors.pulse,
    // Üst kenar biraz daha parlak: dönüş ancak böyle fark ediliyor.
    borderTopColor: colors.glow,
  },
  mark: { fontSize: 32 },
  nameBlock: { marginTop: 28 },
  nameLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.haze,
    textAlign: 'center',
  },
  input: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.haze,
    paddingVertical: 8,
    marginTop: 6,
  },
  inputFocused: { borderBottomColor: colors.pulse },
  greetingWrap: { marginTop: 22, minHeight: 62 },
  // Sabit yükseklik değil: sistem yazı tipi büyütüldüğünde selamlama iki
  // satıra çıkıyor ve sabit kutu metni kesiyordu.
  greetingSpacer: { minHeight: 84 },
  greeting: {
    fontFamily: fonts.serifItalic,
    fontSize: 22,
    lineHeight: 31,
    color: colors.white,
    textAlign: 'center',
  },
  buttonWrap: { marginTop: 20 },
  footnote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 10,
  },
});
