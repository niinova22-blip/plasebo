/**
 * Yayın imzalama anahtarını Android projesine bağlayan Expo eklentisi.
 *
 * Neden eklenti? `android/` klasörü `expo prebuild` ile **yeniden
 * üretiliyor**; oraya elle yazılan bir imzalama ayarı ilk prebuild'de
 * siliniyor. Eklenti, prebuild her çalıştığında ayarı yeniden kurar.
 *
 * Anahtarın kendisi ve şifreleri depoda değil: proje kökündeki
 * `keys/` klasöründe durur ve `.gitignore` ile dışarıda tutulur.
 *
 *   keys/plasebo-upload.jks      imzalama anahtarı
 *   keys/keystore.properties     dosya adı, alias ve şifreler
 *
 * `keys/keystore.properties` yoksa hiçbir şey değişmez ve derleme
 * eskisi gibi debug anahtarıyla imzalanır — yani bu depoyu klonlayan
 * biri anahtar olmadan da APK derleyebilir, yalnızca o çıktı Play'e
 * yüklenemez.
 */
const { withAppBuildGradle, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = 'keys';
const PROPS_FILE = 'keystore.properties';

/** Kök dizindeki keys/keystore.properties okunur. */
function readKeystoreProps(projectRoot) {
  const file = path.join(projectRoot, KEYS_DIR, PROPS_FILE);
  if (!fs.existsSync(file)) return null;

  const props = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf('=');
    if (at < 0) continue;
    props[trimmed.slice(0, at).trim()] = trimmed.slice(at + 1).trim();
  }
  return props.storeFile && props.keyAlias ? props : null;
}

/** Anahtar dosyasını android/app/ içine kopyalar (Gradle oradan okur). */
const withKeystoreFile = (config) =>
  withDangerousMod(config, [
    'android',
    (cfg) => {
      const props = readKeystoreProps(cfg.modRequest.projectRoot);
      if (!props) return cfg;

      const source = path.join(
        cfg.modRequest.projectRoot,
        KEYS_DIR,
        props.storeFile
      );
      if (!fs.existsSync(source)) {
        throw new Error(
          `Yayın anahtarı bulunamadı: ${source}. keys/keystore.properties içindeki storeFile değerini kontrol et.`
        );
      }
      fs.copyFileSync(
        source,
        path.join(cfg.modRequest.platformProjectRoot, 'app', props.storeFile)
      );
      return cfg;
    },
  ]);

/** build.gradle'a release imzalama yapılandırmasını yazar. */
const withReleaseSigning = (config) =>
  withAppBuildGradle(config, (cfg) => {
    const props = readKeystoreProps(cfg.modRequest.projectRoot);
    if (!props) return cfg;

    const signing = `        release {
            storeFile file('${props.storeFile}')
            storePassword '${props.storePassword ?? ''}'
            keyAlias '${props.keyAlias}'
            keyPassword '${props.keyPassword ?? ''}'
        }
`;

    let contents = cfg.modResults.contents;

    // 1) signingConfigs bloğuna release'i ekle (varsa tekrar ekleme).
    if (!/signingConfigs\s*\{[^}]*release\s*\{/s.test(contents)) {
      contents = contents.replace(
        /(signingConfigs\s*\{\s*\n)/,
        `$1${signing}`
      );
    }

    // 2) release derlemesi debug anahtarı yerine bu anahtarı kullansın.
    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    cfg.modResults.contents = contents;
    return cfg;
  });

module.exports = (config) => withReleaseSigning(withKeystoreFile(config));
