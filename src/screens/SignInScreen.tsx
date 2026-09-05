import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import ConicRing from '../components/ConicRing';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

/** Google'ın çok renkli "G" işaretinin sade karşılığı. */
function GoogleMark() {
  return (
    <View style={styles.gMark}>
      <Text style={styles.gText}>G</Text>
    </View>
  );
}

/**
 * Oturum açma zorunlu: ileride premium üyelik hesaba bağlanacağı için
 * misafir modu yok. Android'de tek yol Google hesabıdır; iOS'ta ayrıca
 * Apple ile giriş sunulur — App Store kuralı 4.8, üçüncü taraf girişi
 * olan uygulamalarda bunu şart koşuyor.
 */
export default function SignInScreen({ navigation }: Props) {
  const {
    account,
    googleAvailable,
    googleReady,
    appleAvailable,
    signingIn,
    error,
    signInWithGoogle,
    signInWithApple,
  } = useAuth();
  const { user } = useUser();
  const t = useT();

  useEffect(() => {
    if (!account) return;
    haptics.success();
    // Adın hesaptan tohumlanması buradan alındı ve uygulama köküne
    // (AppNavigator) taşındı: bu ekrana yalnızca yeni giriş yapan
    // uğruyor, oysa adı boş kalmış bir kullanıcı buraya hiç gelmeden de
    // uygulamayı kullanabiliyordu.
    navigation.navigate('Preparation');
  }, [account, navigation]);

  return (
    <Screen background={colors.ink} style={styles.container}>
      <View style={styles.top}>
        <ConicRing size={96} thickness={8} durationMs={10000} />
        <View style={styles.ringHole} />
      </View>

      <Text style={styles.eyebrow}>{t('SON ADIM')}</Text>
      <Text style={styles.title}>
        {user.name ? t('Merhaba {ad}', { ad: user.name }) : t('Hoş geldin')}
      </Text>
      <Text style={styles.body}>
        {appleAvailable
          ? t(
              'Devam etmek için bir hesapla giriş yap. Hesap, serini ve ileride üyeliğini bu cihaza bağlamak için gerekiyor. Ritüel kayıtların yine telefonunda kalır.'
            )
          : t(
              'Devam etmek için Google hesabınla giriş yap. Hesap, serini ve ileride üyeliğini bu cihaza bağlamak için gerekiyor. Ritüel kayıtların yine telefonunda kalır.'
            )}
      </Text>

      {appleAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={14}
          style={[styles.appleButton, signingIn && styles.disabled]}
          onPress={() => {
            if (signingIn) return;
            haptics.tap();
            void signInWithApple();
          }}
        />
      ) : null}

      {googleAvailable ? (
        <PressableScale
          onPress={() => {
            haptics.tap();
            void signInWithGoogle();
          }}
          disabled={!googleReady || signingIn}
          accessibilityRole="button"
          style={[styles.googleButton, (!googleReady || signingIn) && styles.disabled]}
        >
          {signingIn ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <GoogleMark />
              <Text style={styles.googleText}>{t('Google ile devam et')}</Text>
            </>
          )}
        </PressableScale>
      ) : appleAvailable ? null : (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{t('Google girişi şu an kullanılamıyor')}</Text>
          <Text style={styles.noticeText}>
            {t(
              'Bu derlemede Google Web istemci kimliği tanımlı olmadığı için giriş yapılamıyor ve giriş zorunlu olduğundan uygulama burada duruyor. Kurulum için src/config/auth.ts dosyasındaki açıklamaya bak.'
            )}
          </Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text
        style={styles.legal}
        accessibilityRole="link"
        onPress={() => navigation.navigate('Legal', { doc: 'privacy' })}
      >
        {appleAvailable
          ? t(
              "Devam ederek Gizlilik Politikası'nı kabul etmiş olursun. Girişten yalnızca adın ve e-postan okunur; ritüel verilerin hiçbir sunucuya gönderilmez."
            )
          : t(
              "Devam ederek Gizlilik Politikası'nı kabul etmiş olursun. Google'dan yalnızca adın, e-postan ve profil fotoğrafın okunur; ritüel verilerin hiçbir sunucuya gönderilmez."
            )}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  top: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ringHole: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.ink,
  },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.haze,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    textAlign: 'center',
    marginTop: 8,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  appleButton: {
    height: 52,
    width: '100%',
    marginBottom: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 15,
    minHeight: 52,
  },
  disabled: { opacity: 0.5 },
  gMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  gText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  googleText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.text,
  },
  notice: {
    borderWidth: 1,
    borderColor: colors.warn,
    borderRadius: 14,
    padding: 16,
  },
  noticeTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.warn,
    textAlign: 'center',
    marginBottom: 6,
  },
  noticeText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 18,
    color: colors.haze,
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.warn,
    textAlign: 'center',
    marginTop: 12,
  },
  legal: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 16,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 18,
    textDecorationLine: 'underline',
  },
  pill: { marginTop: 30 },
});
