/**
 * Dinamik yapılandırma — statik değerler `app.json` içinde kalır.
 *
 * Burada yalnızca derleme anında ortam değişkeninden türetilmesi gereken
 * tek bir şey var: Google girişinin iOS tarafında kullandığı URL şeması.
 *
 * iOS'ta Google, oturum açma penceresinden uygulamaya geri dönerken
 * "ters çevrilmiş istemci kimliği" biçiminde bir URL şeması kullanır:
 *
 *   İstemci kimliği : 1234-abcd.apps.googleusercontent.com
 *   URL şeması      : com.googleusercontent.apps.1234-abcd
 *
 * Bu şema Info.plist'e yazılmazsa giriş penceresi açılır ama uygulamaya
 * geri dönemez. Kimlik gizli bir değer değildir; yine de depoya
 * yazılmasın diye `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` içinden okunuyor
 * (yerelde `.env`, EAS derlemelerinde `eas env:create` ile tanımlı).
 *
 * Kimlik tanımlı değilse eklenti seçeneksiz bırakılır: Android derlemesi
 * bugünkü gibi çalışmaya devam eder, yalnızca iOS'ta Google girişi
 * yapılandırılmamış olur.
 */
const GOOGLE_PLUGIN = '@react-native-google-signin/google-signin';

/** `...apps.googleusercontent.com` → `com.googleusercontent.apps....` */
function reversedClientId(clientId) {
  const suffix = '.apps.googleusercontent.com';
  if (!clientId || !clientId.endsWith(suffix)) return null;
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}

module.exports = ({ config }) => {
  const scheme = reversedClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  if (!scheme) return config;

  return {
    ...config,
    plugins: config.plugins.map((entry) =>
      entry === GOOGLE_PLUGIN ? [GOOGLE_PLUGIN, { iosUrlScheme: scheme }] : entry
    ),
  };
};
