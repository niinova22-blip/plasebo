import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from '@expo-google-fonts/dm-serif-display';
// Ritüelde akan hikâye metninin yüzü. DM Serif Display bir *başlık*
// yüzü: küçük puntoda ince yerleri kayboluyor ve uzun okumada yoruyor.
// EB Garamond bir kitap yüzü — italik kesimi akan metne kitap sayfası
// tonunu veriyor ve 20-24 punto aralığında ekranda rahat okunuyor.
import {
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium_Italic,
} from '@expo-google-fonts/eb-garamond';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PremiumProvider, usePremium } from './src/context/PremiumContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { setHapticsEnabled } from './src/utils/haptics';
import { initAds } from './src/utils/ads';
import {
  cancelDailyCycle,
  cancelUnmarked,
  hasPermission,
  scheduleDailyCycle,
  scheduleDailyReminder,
  scheduleNudges,
} from './src/utils/reminders';
import { colors } from './src/constants/colors';
import { SCREENSHOT_MODE, seedScreenshotData } from './src/utils/screenshotSeed';

/**
 * Ayarları uygulama genelindeki yan modüllere bağlar ve durum çubuğunu
 * aktif temaya göre ayarlar.
 */
function ThemedApp() {
  const { settings, ready, theme, t } = useSettings();
  const { account } = useAuth();
  const { limits } = usePremium();

  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

  /**
   * Reklam altyapısı kullanıcı oturum açtıktan sonra kuruluyor, açılışta
   * değil.
   *
   * Sebep, kurulumun ilk çağrısının sessiz olmaması: UMP rıza formu ve
   * onun tetiklediği iOS izleme izni penceresi bu adımda çıkıyor. Açılışa
   * bağlansaydı, uygulamayı ilk kez açan kullanıcı daha ne olduğunu
   * görmeden iki sistem penceresiyle karşılaşırdı. Hesap dolduğunda
   * kurulum ve giriş bitmiş, kullanıcı ana ekrana geçiyor demektir.
   *
   * Erken çağrılması yine de gerekli: geçiş reklamı seans sonunda
   * gösterilecek ve önden yüklenmiş olması lazım. O anda yüklemeye
   * başlansaydı reklam çoğu zaman yetişemezdi.
   */
  useEffect(() => {
    if (!ready || !account) return;
    void initAds();
  }, [ready, account]);

  /**
   * Bildirim kuyruğu uygulama her açıldığında yeniden kuruluyor.
   *
   * Arka planda çalışan bir servis yok: akıllı hatırlatıcının dürtmeleri
   * bir haftalık olarak önden zamanlanıyor, o yüzden kuyruğun tazelenmesi
   * gerekiyor. Aynı yerde günlük hatırlatıcı da yeniden kuruluyor, çünkü
   * `cancelUnmarked()` eski sürümlerden kalan işaretsiz bildirimleri
   * temizliyor ve açık olan hatırlatıcının geri gelmesi gerekiyor.
   *
   * İzin sorulmuyor, yalnızca var olan izne bakılıyor: izin isteme yeri
   * kurulum ekranı ve ayarlardaki anahtarlar. Böylece uygulama açılışta
   * kullanıcının önüne beklenmedik bir sistem penceresi çıkarmıyor.
   */
  useEffect(() => {
    if (!ready) return;
    void (async () => {
      if (!(await hasPermission())) return;
      await cancelUnmarked();
      if (settings.reminderEnabled) {
        await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute, t);
      }
      if (settings.smartNudges) {
        await scheduleNudges(settings.nudgesPerDay, t);
      }
      /*
       * 24 saatlik döngü: gün içi ölçüm davetleri ve sabah raporu.
       *
       * Yetki de denetleniyor, yalnız ayar değil. Abonelik bittiğinde
       * ayardaki anahtar açık kalıyor (kullanıcı onu kapatmadı) ama
       * bildirimlerin gelmeye devam etmesi, artık açılamayan bir ekrana
       * davet göndermek olurdu. Kuyruk her açılışta yeniden kurulduğu
       * için denetimin doğru yeri burası: bir sonraki açılışta döngü
       * kendiliğinden susuyor.
       */
      if (settings.dailyCycle && limits.dailyReport) {
        await scheduleDailyCycle(t);
      } else {
        await cancelDailyCycle();
      }
    })();
  }, [
    ready,
    limits.dailyReport,
    settings.smartNudges,
    settings.nudgesPerDay,
    settings.dailyCycle,
    settings.reminderEnabled,
    settings.reminderHour,
    settings.reminderMinute,
    t,
  ]);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Durum çubuğunun rengini temanın kendi token'ı söylüyor. Eskiden
          burada tema adına bakılıyordu ("dark" ise açık içerik); o koşul,
          "koyu" adlı tema kaldırıldıktan sonra geriye kalan koyu temada
          (Sis) koyu üstüne koyu veriyordu. */}
      <StatusBar style={theme.statusBar} />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  /*
   * Mağaza ekran görüntüsü kipi. Kapalıyken (yayın derlemelerinde her
   * zaman kapalı) tek yaptığı `true` ile başlayıp hiçbir şey çalıştırmamak.
   * Açıkken depo sağlayıcılar okumadan önce yazılmalı: hesap, kurulum
   * işareti ve seans geçmişi sonradan yazılsaydı ekranlar önce boş
   * hâlleriyle çizilirdi. Ayrıntı: `src/utils/screenshotSeed.ts`.
   */
  const [seeded, setSeeded] = useState(!SCREENSHOT_MODE);
  useEffect(() => {
    if (!SCREENSHOT_MODE) return;
    void seedScreenshotData().finally(() => setSeeded(true));
  }, []);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium_Italic,
  });

  if (!fontsLoaded || !seeded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.pulse} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AuthProvider>
            <PremiumProvider>
              <UserProvider>
                <ThemedApp />
              </UserProvider>
            </PremiumProvider>
          </AuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
});
