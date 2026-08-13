import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import ParticleField from '../components/ParticleField';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useMotion } from '../hooks/useMotion';
import { haptics } from '../utils/haptics';
import { playUiSound, prepareAudioMode } from '../utils/audio';
import { useSettings, useT } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Intro'>;

interface Slide {
  emoji: string;
  title: string;
  body: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '⚗️',
    title: 'Bu bir plasebo',
    body: 'Plasebo, hiçbir etkin maddesi olmayan bir şeyin yine de bir etki yaratmasıdır. Bu uygulamanın içinde etkin madde yok. Bunu saklamıyoruz — tam tersine, her ekranda yazıyor.',
    accent: colors.glow,
  },
  {
    emoji: '🧪',
    title: 'Her gün bir formül',
    body: 'Her sabah bir renk, bir ses ve bir nefes tekniğinden oluşan bir formül üretilir. Formülü iki şey belirler: günün tarihi ve seçtiğin hedef. Aynı gün, aynı hedef — hep aynı formül. Rastgele değil; her gün aynı yere dönebildiğin, tekrarlanabilir bir ritüel.',
    accent: colors.pulse,
  },
  {
    emoji: '🌬️',
    title: 'Üç adım, birkaç dakika',
    body: 'Renge bakarsın, sesi dinlersin, nefesini sayarsın. Yavaş nefes gerçekten sakinleştirir. Gerisi — renk, frekans, kelime — tamamen senin inancına kalmış.',
    accent: colors.glow,
  },
  {
    emoji: '🔒',
    title: 'Kayıtlar sende kalır',
    body: 'Ritüellerin, serin ve puanların telefonunda saklanır. Google hesabı yalnızca kimliğin ve ileride üyeliğin için kullanılır — ritüel verilerin cihazdan çıkmaz.',
    accent: colors.pulse,
  },
];

export default function IntroScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const t = useT();
  const motion = useMotion();
  const { settings } = useSettings();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  // Tık, ritüel sesinden belirgin biçimde kısık olmalı — bir düğme sesi
  // ekranın önüne geçmemeli.
  const tapVolume = settings.soundVolume * 0.5;

  // Sesin ilk basışta gecikmesin diye ses modunu baştan hazırlıyoruz.
  useEffect(() => {
    void prepareAudioMode();
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) {
      setIndex(next);
      haptics.tap();
    }
  };

  const goNext = () => {
    playUiSound('tap', tapVolume);
    haptics.tap();
    if (isLast) {
      navigation.navigate('Name');
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: !motion.reduced });
  };

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={14} />

      <PressableScale
        onPress={() => navigation.navigate('Name')}
        accessibilityRole="button"
        style={styles.skip}
      >
        <Text style={styles.skipText}>{t('Atla')}</Text>
      </PressableScale>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.pager}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <View style={[styles.badge, { borderColor: slide.accent }]}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
            <Text style={styles.title}>{t(slide.title)}</Text>
            <Text style={styles.body}>{t(slide.body)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((slide, i) => (
          <Dot key={slide.title} active={i === index} reduced={motion.reduced} />
        ))}
      </View>

      <PressableScale onPress={goNext} accessibilityRole="button" style={styles.button}>
        <Text style={styles.buttonText}>{t(isLast ? 'Devam' : 'Sonraki')}</Text>
      </PressableScale>
    </Screen>
  );
}

function Dot({ active, reduced }: { active: boolean; reduced: boolean }) {
  const style = useAnimatedStyle(() => {
    const width = active ? 20 : 6;
    return {
      width: reduced ? width : withTiming(width, { duration: 220 }),
      opacity: active ? 1 : 0.35,
    };
  }, [active, reduced]);

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  skip: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.haze,
  },
  pager: { flexGrow: 0 },
  slide: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 40,
    // Android'de emoji glifi satır kutusundan taşıp üstten kırpılıyordu:
    // yazı tipi dolgusu kapatılıp satır yüksekliği glife göre açıldı.
    lineHeight: 52,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.white,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 23,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.pulse,
  },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 24,
    // Alt güvenli alan `Screen` tarafından ekleniyor; buradaki boşluk
    // yalnızca butonun kenara yapışmaması içindir.
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
