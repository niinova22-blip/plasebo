/**
 * Reklam katmanı — yalnız geçiş (interstitial) reklamı.
 *
 * NEREDE ÇIKIYOR
 *
 * Tek bir yer var: seans özetindeki "Ana Sayfaya Dön" düğmesi. Yani reklam
 * kullanıcı bir işi bitirdiğinde, iki iş arasındaki doğal boşlukta çıkıyor.
 * Ritüelin, ölçümün ya da nefes egzersizinin ortasına hiçbir koşulda
 * girmiyor: uygulamanın bütün vaadi sakinleşme ve dikkat toplama, tam o
 * sırada tam ekran bir reklam bu vaadi bozardı. Google'ın geçiş reklamı
 * ölçütü de aynı yeri işaret ediyor — reklam işin ortasında değil,
 * bittiğinde.
 *
 * Banner bilerek yok. Plasebo'nun ekranları büyük boşluklar üzerine
 * kurulu; ekranın dibinde sürekli duran bir kutu bu düzeni bozuyor.
 * (Gelişim Takip'te tersi geçerli ve orada banner var.)
 *
 * SIKLIK SINIRI
 *
 * Sınır AdMob panelinde değil burada. Sebebi teşhis: reklam çıkmadığında
 * "sınıra mı takıldı, dolum mu yok, rıza mı yok" sorusunun cevabı tek
 * yerden okunabilmeli. Panelde de sınır açılsaydı iki sınır birbirini
 * gölgeler, hangisinin durdurduğu anlaşılmazdı.
 *
 * KİMLİKLER
 *
 * Geliştirmede Google'ın test birimi kullanılıyor. Gerçek reklama kendi
 * cihazından tıklamak Google tarafından "geçersiz trafik" sayılıyor ve
 * AdMob hesabının askıya alınmasına yol açabiliyor — hesap yeni açıldığı
 * için bu risk gerçek. `__DEV__` yalnız geliştirme derlemesini yakalıyor;
 * TestFlight derlemesi App Store derlemesiyle aynı ikili olduğu için
 * ayırt edilemiyor. TestFlight'ta gerçek reklam görmemek isteyen cihaz
 * `EXPO_PUBLIC_ADS_TEST_DEVICE_ID` ile kaydedilmeli — Google'ın bu soruna
 * kendi çözümü bu; kayıtlı cihaz, gerçek birim kimliğiyle bile test
 * reklamı alır.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';

/** AdMob → Plasebo · Zihin Protokolü → "Plasebo iOS Gecis - Seans Sonu". */
const LIVE_INTERSTITIAL_ID = 'ca-app-pub-8209061391650271/9735707560';

const AD_UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : LIVE_INTERSTITIAL_ID;

/**
 * Reklam yalnız iOS'ta. AdMob'daki Plasebo kaydı bir iOS uygulaması ve
 * birim kimlikleri o kayda ait; Android'de aynı kimlikle istek atmak dolum
 * getirmez, raporlamayı da bozar. Android sürümü yayına hazırlandığında
 * AdMob'da ayrı bir uygulama ve ayrı bir birim açılması gerekiyor.
 */
const SUPPORTED = Platform.OS === 'ios';

const CAP_KEY = '@plasebo/ads-cap';
/** Günde en çok bu kadar geçiş reklamı. */
const MAX_PER_DAY = 3;
/** İki reklam arasında en az bu kadar süre. */
const MIN_GAP_MS = 3 * 60 * 1000;

type Cap = { day: string; count: number; lastAt: number };

let initialized = false;
let canRequestAds = false;
let interstitial: InterstitialAd | null = null;
let loaded = false;

/** Yerel gün anahtarı — sınır takvim gününe göre sıfırlanıyor. */
function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function readCap(): Promise<Cap> {
  const empty: Cap = { day: today(), count: 0, lastAt: 0 };
  try {
    const raw = await AsyncStorage.getItem(CAP_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Cap>;
    // Gün değiştiyse sayaç sıfırlanıyor. lastAt de sıfırlanıyor: dünkü
    // reklamın bugünkü ilk reklamı geciktirmesi için bir sebep yok.
    if (parsed.day !== empty.day) return empty;
    return {
      day: empty.day,
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      lastAt: typeof parsed.lastAt === 'number' ? parsed.lastAt : 0,
    };
  } catch {
    // Bozuk kayıt sınırı kilitlememeli; sıfırdan sayılıyor.
    return empty;
  }
}

async function bumpCap(): Promise<void> {
  try {
    const cap = await readCap();
    const next: Cap = { day: cap.day, count: cap.count + 1, lastAt: Date.now() };
    await AsyncStorage.setItem(CAP_KEY, JSON.stringify(next));
  } catch {
    // Sayaç yazılamazsa reklam yine de gösterildi; sessiz geçiyoruz.
  }
}

/** Yeni bir geçiş reklamı nesnesi kurup yüklemeyi başlatır. */
function preload(): void {
  if (!SUPPORTED || !canRequestAds) return;
  loaded = false;
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
  interstitial = ad;
  const off = ad.addAdEventsListener(({ type }) => {
    if (type === AdEventType.LOADED) {
      loaded = true;
      off();
    }
    // Yükleme başarısızsa burada yeniden denemiyoruz: dolum yokken sıkı
    // bir yeniden deneme döngüsü hem pil harcar hem Google tarafında
    // gereksiz istek sayılır. Bir sonraki seans sonunda yeniden denenecek.
    if (type === AdEventType.ERROR) {
      loaded = false;
      off();
    }
  });
  ad.load();
}

/** `EXPO_PUBLIC_ADS_TEST_DEVICE_ID` — virgülle ayrılmış cihaz kimlikleri. */
function testDevices(): string[] {
  const raw = process.env.EXPO_PUBLIC_ADS_TEST_DEVICE_ID;
  if (!raw) return [];
  return raw
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean);
}

/**
 * Uygulama açılışında bir kez çağrılır.
 *
 * SIRA ÖNEMLİ: önce rıza, sonra yapılandırma, sonra başlatma. Rıza
 * bilinmeden başlatılan SDK kişiselleştirilmemiş reklama düşüyor ve bu
 * kalıcı olarak geliri azaltıyor. iOS'un izleme izni (ATT) penceresi de bu
 * adımda çıkıyor: AdMob panelinde yayınlanan "IDFA Açıklayıcı" mesajını
 * UMP gösteriyor ve sistem penceresini o tetikliyor. Bu yüzden ayrıca bir
 * ATT çağrısı yok — pencerede görünen metin `app.json` içindeki
 * `userTrackingUsageDescription` alanından geliyor.
 */
export async function initAds(): Promise<void> {
  if (!SUPPORTED || initialized) return;
  initialized = true;

  try {
    const info = await AdsConsent.gatherConsent({
      // Uygulama 13 yaş altına yönelik değil. Bu etiket açılırsa UMP
      // kişiselleştirilmiş reklam seçeneğini kullanıcıya hiç sunmuyor.
      tagForUnderAgeOfConsent: false,
    });
    canRequestAds = info.canRequestAds;
  } catch {
    // Ağ yoksa ya da UMP yanıt vermezse reklamı tümden kapatmıyoruz:
    // kullanıcıların ezici çoğunluğu Türkiye'de, yani AEA dışında ve rıza
    // zaten gerekmiyor. Rıza gerçekten gereken bir kullanıcıda Google kendi
    // tarafında kişiselleştirilmemiş reklama düşüyor, yani rızasız
    // kişiselleştirme riski doğmuyor.
    canRequestAds = true;
  }

  try {
    await mobileAds().setRequestConfiguration({
      // COPPA / çocuğa yönelik içerik. AdMob panelinde böyle bir ayar yok;
      // Google bunu yalnız SDK'nın RequestConfiguration nesnesinden okuyor,
      // yani beyanın tek yeri burası. Plasebo 13 yaş altına yönelik değil.
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      // Sakinleşme uygulamasının seans sonunda kumar ya da yetişkin
      // içerikli reklam göstermesi, uygulamanın kendi vaadiyle çelişirdi.
      maxAdContentRating: MaxAdContentRating.PG,
      testDeviceIdentifiers: testDevices(),
    });
    await mobileAds().initialize();
    preload();
  } catch {
    // Başlatma hatası uygulamayı etkilemiyor: reklam gösterilmez, akış
    // olduğu gibi devam eder.
    canRequestAds = false;
  }
}

/**
 * Seans sonunda çağrılır. Reklam gösterilebiliyorsa gösterir ve reklam
 * kapanınca `done` çalışır; gösterilemiyorsa `done` hemen çalışır.
 *
 * `done` her yolda tam olarak bir kez çağrılıyor. Akışın devamı buna bağlı:
 * iki kez çağrılırsa gezinti yığını bozulur, hiç çağrılmazsa kullanıcı özet
 * ekranında kilitli kalır.
 */
export function showSessionEndAd(adFree: boolean, done: () => void): void {
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    done();
  };

  const ad = interstitial;
  if (!SUPPORTED || !canRequestAds || adFree || !ad || !loaded) {
    finish();
    return;
  }

  void (async () => {
    const cap = await readCap();
    if (cap.count >= MAX_PER_DAY || Date.now() - cap.lastAt < MIN_GAP_MS) {
      finish();
      return;
    }

    const off = ad.addAdEventsListener(({ type }) => {
      // CLOSED reklam kapatıldığında, ERROR gösterim başarısız olduğunda
      // geliyor; ikisi de akışın devam etmesi gereken an.
      if (type === AdEventType.CLOSED || type === AdEventType.ERROR) {
        off();
        loaded = false;
        // Sayaç yalnız reklam gerçekten kapandığında artıyor. Eskiden
        // `show()` çağrılmadan önce artıyordu; gösterim hata verdiğinde
        // kullanıcı hiçbir reklam görmediği hâlde günlük üç hakkından
        // biri harcanmış oluyordu. Sayacın işi gösterimi saymak, denemeyi
        // değil.
        if (type === AdEventType.CLOSED) void bumpCap();
        // Sonraki seans için yeni bir reklam yükleniyor: aynı nesne ikinci
        // kez gösterilemiyor, her gösterim yeni nesne istiyor.
        preload();
        finish();
      }
    });

    try {
      await ad.show();
    } catch {
      off();
      loaded = false;
      preload();
      finish();
    }
  })();
}

/**
 * Ayarlardaki "reklam gizlilik tercihleri" girişi için. AB'de rıza bir kez
 * alınıp bitmiyor; kullanıcı sonradan fikrini değiştirebilmeli ve UMP bunun
 * için uygulamada bir giriş noktası bulunmasını şart koşuyor.
 */
export async function showAdsPrivacyOptions(): Promise<void> {
  if (!SUPPORTED) return;
  try {
    await AdsConsent.showPrivacyOptionsForm();
    const info = await AdsConsent.getConsentInfo();
    canRequestAds = info.canRequestAds;
    if (canRequestAds && !loaded) preload();
  } catch {
    // Form açılamazsa mevcut durum korunuyor.
  }
}

/** Gizlilik tercihleri girişinin gösterilip gösterilmeyeceği. */
export async function adsPrivacyOptionsRequired(): Promise<boolean> {
  if (!SUPPORTED) return false;
  try {
    const info = await AdsConsent.getConsentInfo();
    return info.privacyOptionsRequirementStatus === 'REQUIRED';
  } catch {
    return false;
  }
}
