import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SlideOne from '../components/onboarding/SlideOne';
import SlideTwo from '../components/onboarding/SlideTwo';
import SlideThree from '../components/onboarding/SlideThree';
import SlideFour from '../components/onboarding/SlideFour';
import SlideFive from '../components/onboarding/SlideFive';
import SlideSix from '../components/onboarding/SlideSix';
import ProgressDots from '../components/onboarding/ProgressDots';
import OnboardingButton from '../components/onboarding/OnboardingButton';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useSettings, useT } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { ALL_GOALS } from '../utils/formulaEngine';
import { haptics } from '../utils/haptics';
import { requestPermission, scheduleNudges } from '../utils/reminders';
import { setOnboarded } from '../utils/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL = 6;
const LAST = TOTAL - 1;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

/**
 * Giriş dersi — altı slayt.
 *
 * Bu ekran, eskiden üç ayrı ekrana dağılmış olan kurulumun tamamını
 * üstleniyor: tanıtım slaytları (`Intro`), isim sorusu (`Name`) ve
 * formüllerin anlatıldığı özet. Üçü de kaldırıldı; kurulum artık tek bir
 * yatay akış.
 *
 * Depolama tarafında yeni bir anahtar açılmadı. Uygulamanın açılışta
 * hangi ekrana gideceğine `@plasebo/onboarded` (bkz. `storage.ts`) karar
 * veriyor ve isim `@plasebo/user` içinde duruyor; buraya ayrı bir
 * `onboarding_completed`/`user_name` çifti koymak, aynı bilginin iki
 * kopyasını üretir ve Ayarlar'dan isim değiştirildiğinde ikisi ayrışırdı.
 */
export default function OnboardingScreen({ navigation }: Props) {
  const { user, update } = useUser();
  const { account } = useAuth();
  const { settings, update: updateSettings } = useSettings();
  const t = useT();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [current, setCurrent] = useState(0);
  const [name, setName] = useState(user.name);
  const [finishing, setFinishing] = useState(false);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  /**
   * Sayfaların dikey iç boşluğu.
   *
   * Alt boşluk, altta duran ilerleme noktaları ve "Devam" düğmesinin
   * kapladığı yer: içerik oraya kadar uzarsa düğmenin altında kalıyor.
   */
  const pageTop = insets.top + 40;
  const pageBottom = insets.bottom + 140;

  /**
   * Aktif slayt yalnızca kaydırma durduğunda güncelleniyor. Her karede
   * güncellemek, slayt animasyonlarını parmak hareketinin ortasında
   * tetikliyor ve giriş yarıda kalmış gibi duruyordu.
   */
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    if (slide !== current) {
      setCurrent(slide);
      haptics.tap();
    }
  };

  const goNext = () => {
    if (current >= LAST) return;
    haptics.tap();
    scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
  };

  /**
   * Bildirim izni ve bir haftalık dürtme kuyruğu.
   *
   * Kurulumun geri kalanını BEKLETMEZ. Kuyruk gün başına düşen dürtme
   * sayısı kadar ayrı bildirim kuruyor (7 gün × 2 = 14 native çağrı) ve
   * yavaş cihazlarda bu on saniyeleri buluyordu; `finish` bunu beklediği
   * sürece hem "İlk protokolümü başlat" hem de "Atla" tıklandıktan sonra
   * donmuş görünüyordu. Artık ekran geçişi hemen oluyor, kuyruk arkada
   * kuruluyor. İzin verilmezse ayar dürüst kalsın diye kapatılıyor.
   */
  const setUpNudges = async () => {
    const granted = await requestPermission();
    if (!granted) {
      updateSettings({ smartNudges: false });
      return;
    }
    const ok = await scheduleNudges(settings.nudgesPerDay, t);
    if (!ok) updateSettings({ smartNudges: false });
  };

  /**
   * Kurulumu kapatır.
   *
   * Dört hedefin tamamı açılır (seçim yok). Giriş zorunlu olduğu için
   * hesabı olmayan kullanıcı buradan oturum açma ekranına gider.
   */
  const finish = async (withName: string) => {
    if (finishing) return;
    setFinishing(true);
    haptics.success();

    update({
      name: withName.trim(),
      goals: [...ALL_GOALS],
      activeGoal: 'focus',
    });

    await setOnboarded();
    navigation.replace(account ? 'Preparation' : 'SignIn');

    // Ekran değiştikten sonra: izin penceresi sonraki ekranın üstünde
    // açılır, kuyruk da kimseyi bekletmeden dolar.
    if (settings.smartNudges) void setUpNudges();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AnimatedScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          onMomentumScrollEnd={onMomentumEnd}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          // Dikey iç boşluk artık burada DEĞİL, her sayfanın kendi dikey
          // kaydırıcısında. Burada durduğunda sayfanın kullanabileceği
          // yüksekliği kısıyor ve uzun slaytların taşmasını büyütüyordu.
        >
          <Page index={0} width={width} scrollX={scrollX} reduced={motion.reduced} paddingTop={pageTop} paddingBottom={pageBottom}>
            <SlideOne width={width} active={current === 0} onNext={goNext} />
          </Page>
          <Page index={1} width={width} scrollX={scrollX} reduced={motion.reduced} paddingTop={pageTop} paddingBottom={pageBottom}>
            <SlideTwo width={width} active={current === 1} />
          </Page>
          <Page index={2} width={width} scrollX={scrollX} reduced={motion.reduced} paddingTop={pageTop} paddingBottom={pageBottom}>
            <SlideThree width={width} active={current === 2} />
          </Page>
          <Page index={3} width={width} scrollX={scrollX} reduced={motion.reduced} paddingTop={pageTop} paddingBottom={pageBottom}>
            <SlideFour width={width} active={current === 3} />
          </Page>
          <Page index={4} width={width} scrollX={scrollX} reduced={motion.reduced} paddingTop={pageTop} paddingBottom={pageBottom}>
            <SlideFive width={width} active={current === 4} />
          </Page>
          <Page index={5} width={width} scrollX={scrollX} reduced={motion.reduced} paddingTop={pageTop} paddingBottom={pageBottom}>
            <SlideSix
              width={width}
              active={current === 5}
              name={name}
              onNameChange={setName}
              onComplete={() => void finish(name)}
              loading={finishing}
            />
          </Page>
        </AnimatedScrollView>
      </KeyboardAvoidingView>

      {/* Atla — ilk dört slaytta. Son iki slaytta zaten bitişe bir adım
          kaldığı için gösterilmiyor. */}
      {current < 4 ? (
        <Pressable
          onPress={() => void finish(name)}
          disabled={finishing}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.skip,
            { top: insets.top + 8 },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.skipText}>{t('Atla')}</Text>
        </Pressable>
      ) : null}

      {current < LAST ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 22 }]}>
          <ProgressDots total={TOTAL} current={current} />
          <View style={styles.buttonWrap}>
            <OnboardingButton label={t('Devam')} onPress={goNext} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Sayfa sarmalayıcı: kaydırma sırasında pasif slaytlar hem küçülür hem
 * söner, böylece geçiş bir kart destesi gibi duruyor.
 *
 * Her sayfa kendi **dikey** kaydırıcısını taşıyor. Dıştaki kaydırıcı
 * yatay olduğu için dikeyde kaydıramıyor; içeriği ekrandan uzun olan bir
 * slayt (özellikle 1955 hikâyesi, ~840 piksel) sessizce taşıyor, alttaki
 * ok ve düğmeler görünür alanın dışında kalıyordu — küçük ekranlı bir
 * telefonda slayt "kocaman" görünüp hiçbir yere basılamıyordu. İçerik
 * ekrana sığdığında `flexGrow` + `justifyContent: center` sayesinde
 * görüntü değişmiyor; yalnızca sığmadığında kaydırma devreye giriyor.
 */
function Page({
  index,
  width,
  scrollX,
  reduced,
  paddingTop,
  paddingBottom,
  children,
}: {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  reduced: boolean;
  paddingTop: number;
  paddingBottom: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    if (reduced) return { opacity: 1, transform: [{ scale: 1 }] };
    const range = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(scrollX.value, range, [0.4, 1, 0.4], 'clamp'),
      transform: [{ scale: interpolate(scrollX.value, range, [0.92, 1, 0.92], 'clamp') }],
    };
  });

  // Burada `flex: 1` YOK: yatay ScrollView'ün içerik kabı bir satır
  // olduğu için flex yatayda büyütür ve sayfa genişliğini bozar. Yükseklik
  // zaten varsayılan `alignItems: stretch` ile doluyor.
  return (
    <Animated.View style={[{ width }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Dıştaki yatay kaydırıcı sayfa geçişini yönetmeye devam etsin
        // diye dikey kaydırma yalnızca gerektiğinde devreye giriyor.
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop,
          paddingBottom,
        }}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  flex: { flex: 1 },
  skip: {
    position: 'absolute',
    right: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.haze,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  buttonWrap: { marginTop: 18 },
});
