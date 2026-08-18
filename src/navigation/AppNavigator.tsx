import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/TabBar';
import SplashScreen from '../screens/SplashScreen';
import SignInScreen from '../screens/SignInScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PreparationScreen from '../screens/PreparationScreen';
import HowItWorksScreen from '../screens/HowItWorksScreen';
import LegalScreen from '../screens/LegalScreen';
import PlansScreen from '../screens/PlansScreen';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RitualScreen from '../screens/RitualScreen';
import ComplaintScreen from '../screens/ComplaintScreen';
import ExaminationScreen from '../screens/ExaminationScreen';
import PrescriptionScreen from '../screens/PrescriptionScreen';
import ScoreBeforeScreen from '../screens/ScoreBeforeScreen';
import ScoreAfterScreen from '../screens/ScoreAfterScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
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

export default function AppNavigator() {
  const { theme, themeName } = useSettings();
  const { account, ready: authReady } = useAuth();
  const [onboarded, setOnboardedState] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboarded().then(setOnboardedState);
  }, []);

  if (onboarded === null || !authReady) return null;

  // Oturum açma zorunlu: kurulumu bitirmiş ama hesabı olmayan kullanıcı
  // (örneğin oturumu kapattıysa) doğrudan giriş ekranına düşer.
  const initialRoute: keyof RootStackParamList = !onboarded
    ? 'Splash'
    : account
      ? 'Main'
      : 'SignIn';

  const base = themeName === 'dark' ? DarkTheme : DefaultTheme;
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
    <NavigationContainer theme={navTheme}>
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
        <Stack.Screen
          name="Plans"
          component={PlansScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
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
        <Stack.Screen
          name="ScoreBefore"
          component={ScoreBeforeScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Ritual"
          component={RitualScreen}
          options={{ animation: 'fade_from_bottom' }}
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
