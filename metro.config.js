/**
 * Metro yapılandırması.
 *
 * Tek işi var: **ekran görüntüsü kipinde** reklam kitaplığını boş bir
 * karşılıkla değiştirmek. Bunun dışında Expo'nun varsayılan ayarları
 * olduğu gibi kullanılıyor.
 *
 * Gerekçe `src/utils/adsStubForScreenshots.ts` içinde uzun uzun yazılı;
 * kısacası mağaza kareleri Android emülatöründe alınıyor ve o derlemede
 * AdMob'un yerel modülü bulunmuyor (SDK Kotlin 2.3 ile derlenmiş, yerel
 * araç zinciri Kotlin 2.1'de). Kitaplık import edilir edilmez yerel
 * modülü aradığı için uygulama açılışta düşüyordu.
 *
 * Yönlendirme yalnızca `EXPO_PUBLIC_SCREENSHOT_MODE=1` iken kuruluyor.
 * O değişken yayın derlemelerinde tanımsız — TestFlight, App Store ve
 * Play derlemeleri gerçek kitaplığı alıyor.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

if (process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1') {
  const stub = path.resolve(__dirname, 'src/utils/adsStubForScreenshots.ts');
  const defaultResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-native-google-mobile-ads') {
      return { type: 'sourceFile', filePath: stub };
    }
    const next = defaultResolveRequest ?? context.resolveRequest;
    return next(context, moduleName, platform);
  };
}

module.exports = config;
