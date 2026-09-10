/**
 * Reklam kitaplığının boş karşılığı — yalnızca ekran görüntüsü kipinde.
 *
 * NEDEN VAR
 *
 * Mağaza kareleri Android emülatöründe alınıyor (bkz.
 * `src/utils/screenshotSeed.ts`). O derlemede `react-native-google-mobile-ads`
 * yerel modülü yok: kitaplığın getirdiği AdMob SDK'sı Kotlin 2.3 ile
 * derlenmiş, projenin yerel araç zinciri ise Kotlin 2.1'de kalıyor ve
 * modül derlenmiyor. Emülatörde reklam zaten hiç çalışmıyor — reklam
 * yalnız iOS'ta açık (`src/utils/ads.ts` → `SUPPORTED`) — ama kitaplık
 * *import edildiği anda* yerel modülü arıyor ve bulamayınca uygulama
 * açılışta düşüyordu.
 *
 * Bu dosya o import'un yerine geçiyor. Devreye yalnızca
 * `EXPO_PUBLIC_SCREENSHOT_MODE=1` iken, `metro.config.js` içindeki
 * yönlendirmeyle giriyor; TestFlight, App Store ve Play derlemeleri
 * gerçek kitaplığı kullanmaya devam ediyor.
 */

export const TestIds = {
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
};

export const AdEventType = {
  LOADED: 'loaded',
  ERROR: 'error',
  CLOSED: 'closed',
  OPENED: 'opened',
} as const;

export const MaxAdContentRating = { G: 'G', PG: 'PG', T: 'T', MA: 'MA' } as const;

export const AdsConsent = {
  async gatherConsent() {
    return { canRequestAds: false };
  },
};

export class InterstitialAd {
  static createForAdRequest(): InterstitialAd {
    return new InterstitialAd();
  }

  addAdEventsListener(): () => void {
    return () => {};
  }

  load(): void {}

  show(): Promise<void> {
    return Promise.resolve();
  }
}

export default function mobileAds() {
  return {
    async setRequestConfiguration() {},
    async initialize() {
      return [];
    },
  };
}
