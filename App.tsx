import React, { useEffect } from 'react';
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
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { AuthProvider } from './src/context/AuthContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { setHapticsEnabled } from './src/utils/haptics';
import { scheduleNudges } from './src/utils/reminders';
import { colors } from './src/constants/colors';

/**
 * Ayarları uygulama genelindeki yan modüllere bağlar ve durum çubuğunu
 * aktif temaya göre ayarlar.
 */
function ThemedApp() {
  const { settings, ready, themeName, theme, t } = useSettings();

  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

  /**
   * Akıllı hatırlatıcılar önden zamanlanıyor (arka planda çalışan bir
   * servis yok), bu yüzden kuyruk uygulama her açıldığında yeniden
   * dolduruluyor. Ayar kapalıysa hiçbir şey yapılmaz — kapatma anında
   * zaten iptal ediliyor.
   */
  useEffect(() => {
    if (!ready || !settings.smartNudges) return;
    void scheduleNudges(settings.nudgesPerDay, t);
  }, [ready, settings.smartNudges, settings.nudgesPerDay, t]);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
  });

  if (!fontsLoaded) {
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
