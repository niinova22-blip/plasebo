/**
 * Google oturum açma yapılandırması.
 *
 * Giriş `@react-native-google-signin/google-signin` ile native olarak
 * yapılır — sistemin hesap seçici penceresi açılır, tarayıcıya çıkılmaz.
 * Bu yüzden Expo Go'da çalışmaz; cihaza kurulan derleme gerekir.
 *
 * Google Cloud Console'da iki istemci oluşturulmalı:
 *
 *   1. Android istemcisi — paket adı `com.plasebo.app`, imza SHA-1
 *      parmak izi derlemenin anahtarından alınır. Bu istemcinin kimliği
 *      koda yazılmaz; Google girişi paket adı + parmak izi eşleşmesine
 *      bakar. Yoksa giriş DEVELOPER_ERROR ile düşer.
 *   2. Web istemcisi — kimliği aşağıdaki `web` alanına girilir. Kimlik
 *      belirteci (idToken) bu istemci adına düzenlenir.
 *
 * Kimlikler projenin köküne açılan `.env` dosyasından okunur:
 *
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...apps.googleusercontent.com
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...apps.googleusercontent.com
 *
 * `EXPO_PUBLIC_` öneki taşıyan değerler istemci paketine gömülür; OAuth
 * istemci kimliği zaten herkese açık bir değerdir, gizli anahtar değil.
 *
 * Web istemci kimliği tanımlı değilse uygulama giriş butonunu gizleyip
 * yapılandırma uyarısı gösterir.
 */
export const googleClientIds = {
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
} as const;

export const isGoogleConfigured = Boolean(googleClientIds.web);
