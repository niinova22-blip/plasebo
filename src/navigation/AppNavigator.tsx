import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/TabBar';
import { useUser } from '../context/UserContext';
import SplashScreen from '../screens/SplashScreen';
import SignInScreen from '../screens/SignInScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PreparationScreen from '../screens/PreparationScreen';
import HowItWorksScreen from '../screens/HowItWorksScreen';
import LegalScreen from '../screens/LegalScreen';
import PlansScreen from '../screens/PlansScreen';
import { PREMIUM_ENABLED } from '../constants/plans';
import { FORCE_FREE_TIER } from '../constants/devTier';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RitualScreen from '../screens/RitualScreen';
import CheckinScreen from '../screens/CheckinScreen';
import DailyReportScreen from '../screens/DailyReportScreen';
import ComplaintScreen from '../screens/ComplaintScreen';
import ExaminationScreen from '../screens/ExaminationScreen';
import PrescriptionScreen from '../screens/PrescriptionScreen';
import ScoreBeforeScreen from '../screens/ScoreBeforeScreen';
import ScoreAfterScreen from '../screens/ScoreAfterScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import { useSettings } from '../context/SettingsContext';
import { isPlaceholderName, useAuth } from '../context/AuthContext';
import { isOnboarded } from '../utils/storage';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { theme } = useSettings();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.bg },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Archive" component={ArchiveScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Bildirime dokunulduğunda ilgili ekranı açar.
 *
 * 24 saatlik döngünün iki bildirimi var: ölçüm daveti ve sabah raporu.
 * İkisi de içeriklerindeki işaretle ayırt ediliyor (bkz. `reminders.ts`).
 * Gezinme, konteynerin hazır olmasını bekliyor — uygulama bildirime
 * dokunularak açıldığında dinleyici, ağaç kurulmadan da tetiklenebiliyor.
 */
function useNotificationRouting(): void {
  useEffect(() => {
    const go = (route: 'Checkin' | 'DailyReport') => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(route);
        return;
      }
      // Konteyner henüz hazır değilse kısa bir süre sonra tekrar denenir.
      const timer = setTimeout(() => {
        if (navigationRef.isReady()) navigationRef.navigate(route);
      }, 600);
      return () => clearTimeout(timer);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | null;
        if (data?.plaseboCheckin) go('Checkin');
        else if (data?.plaseboReport) go('DailyReport');
      }
    );
    return () => subscription.remove();
  }, []);
}

export default function AppNavigator() {
  const { theme } = useSettings();
  const { account, ready: authReady } = useAuth();
  const { user, update: updateUser } = useUser();
  const [onboarded, setOnboardedState] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboarded().then(setOnboardedState);
  }, []);

  // Profil adını hesaptan tohumla.
  //
  // Bu iş eskiden yalnızca giriş ekranında yapılıyordu; oysa oraya
  // yalnızca yeni giriş yapan uğruyor. Zaten oturumu açık olan biri
  // (uygulamayı her açtığında doğrudan ana ekrana düşen kullanıcı) adı
  // boş kalmışsa hiçbir zaman doldurmuyordu — reçetede "Misafir",
  // selamlamada boşluk görünüyordu. Kontrol artık kökte, her açılışta.
  //
  // Yalnızca boşken — ya da yer tutucudayken — yazıyor. Kullanıcı adını
  // Ayarlar'dan değiştirdiyse hesaptan gelen değer onu ezmemeli; ama
  // "Apple kullanıcısı" kimsenin seçtiği bir ad değil, sağlayıcı ad
  // vermediği için yazılmış bir doldurma. Hesap tarafı sonradan gerçek
  // bir ada kavuşursa (e-postadan türetilen karşılığı da dahil) profil
  // onun peşinden gitmeli, yoksa doldurma kalıcı hâle geliyordu.
  useEffect(() => {
    if (!authReady || !account) return;
    if (!isPlaceholderName(user.name)) return;
    const next = account.name.trim();
    if (next && next !== user.name.trim() && !isPlaceholderName(next)) {
      updateUser({ name: next });
    }
  }, [authReady, account, user.name, updateUser]);

  useNotificationRouting();

  if (onboarded === null || !authReady) return null;

  // Oturum açma zorunlu: kurulumu bitirmiş ama hesabı olmayan kullanıcı
  // (örneğin oturumu kapattıysa) doğrudan giriş ekranına düşer.
  const initialRoute: keyof RootStackParamList = !onboarded
    ? 'Splash'
    : account
      ? 'Main'
      : 'SignIn';

  // React Navigation'ın kendi taban teması, aşağıda ezilmeyen birkaç
  // rengi (perde arkası, basış dalgası) belirliyor. Doğru tabanı seçmek
  // için tema adına değil koyuluğuna bakılıyor: "koyu" adlı tema
  // kaldırıldı ve geriye kalan koyu tema Sis; ada bakan eski koşul Sis
  // seçiliyken aydınlık tabanı veriyordu.
  const base = theme.statusBar === 'light' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.bg,
      card: theme.surface,
      primary: theme.pulse,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen
          name="Preparation"
          component={PreparationScreen}
          // Hazırlık kendiliğinden biter; geri dönülecek bir şey yok.
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
        <Stack.Screen name="Legal" component={LegalScreen} />
        {/* Plan ekranı yalnızca satın alma gerçekten açıkken var olur;
            kapalıyken hiç kaydedilmez ki hiçbir yoldan açılamasın.

            Geliştirme derlemesinde ücretsiz kademe zorlanmışsa da
            kaydediliyor: kilitli satırlar plan ekranına gidiyor ve o ekran
            yoksa dokunuş var olmayan bir rotaya düşerdi. */}
        {PREMIUM_ENABLED || FORCE_FREE_TIER ? (
          <Stack.Screen
            name="Plans"
            component={PlansScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        ) : null}
        <Stack.Screen name="Main" component={MainTabs} />
        {/* Şikayet → muayene → reçete → ölçüm → ritüel → ölçüm → özet */}
        <Stack.Screen
          name="Complaint"
          component={ComplaintScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Examination"
          component={ExaminationScreen}
          // Muayene kendiliğinden ilerler; geri dönülecek bir şey yok.
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Prescription"
          component={PrescriptionScreen}
          options={{ animation: 'fade' }}
        />
        {/* Elle ölçüm — yüz taraması yapılamadığında ritüelin girişi. */}
        <Stack.Screen
          name="ScoreBefore"
          component={ScoreBeforeScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Ritual"
          component={RitualScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
        {/* 24 saatlik döngü: gün içi ölçüm ve ertesi sabahki rapor. */}
        <Stack.Screen
          name="Checkin"
          component={CheckinScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="DailyReport"
          component={DailyReportScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ScoreAfter"
          component={ScoreAfterScreen}
          options={{ animation: 'fade_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="SessionSummary"
          component={SessionSummaryScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
