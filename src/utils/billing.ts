/**
 * Satın alma katmanı — StoreKit 2 (iOS) / Play Faturalandırma (Android).
 *
 * NEDEN `expo-iap`
 * Uygulamanın sunucusu yok ve olmasını da istemiyoruz. RevenueCat gibi bir
 * hizmet satın alma verisini üçüncü bir tarafa taşırdı; uygulamanın
 * "veriler cihazdan çıkmaz" sözüyle çelişirdi. `expo-iap` yalnızca yerel
 * mağaza API'sinin üzerine ince bir katman: iOS'ta StoreKit 2'ye,
 * Android'de Play Faturalandırma Kitaplığı'na bağlanıyor, aradan kimse
 * geçmiyor. Doğrulamayı mağazanın kendisi yapıyor (imzalı işlem), bu
 * yüzden makbuz doğrulayacak bir sunucuya da gerek kalmıyor.
 *
 * TEK DOĞRULUK KAYNAĞI MAĞAZA
 * Uygulama kendi tuttuğu bir tarihe bakmıyor; yetkiyi her açılışta
 * cihazdaki işlemlerden okuyor (`syncEntitlement`). Abonelik iptal
 * edildiğinde ya da iade alındığında hak listeden düşüyor ve premium
 * kendiliğinden kapanıyor.
 *
 * SATIN ALMA OLAY TABANLI
 * `requestPurchase` sonucu döndürmüyor; sonuç `purchaseUpdatedListener` /
 * `purchaseErrorListener` üzerinden geliyor. Arayüzün "bekle ve sonucu
 * göster" diyebilmesi için bu iki olayı burada bir söze (promise)
 * bağlıyoruz.
 *
 * BAĞLANTI NE ZAMAN KURULUYOR
 * `PREMIUM_ENABLED` kapalıyken mağazaya hiç bağlanılmıyor: satılacak bir
 * şey yokken bağlantı açmak, kullanıcıya gereksiz bir Apple hesabı
 * penceresi çıkarma riski demek.
 */
import { Platform } from 'react-native';
import {
  deepLinkToSubscriptions,
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases as storeRestorePurchases,
} from 'expo-iap';
import type { Purchase } from 'expo-iap';
import {
  PREMIUM_ENABLED,
  SUBSCRIPTION_OPTION_IDS,
  optionForProductId,
  productIdFor,
  type PurchaseOptionId,
} from '../constants/plans';

export interface PurchaseResult {
  ok: boolean;
  /** Kullanıcıya gösterilecek mesaj. Boşsa hiçbir şey gösterilmez —
   *  kullanıcı vazgeçtiğinde uyarı çıkarmak yanlış olurdu. */
  message: string;
  /** Kullanıcı Apple/Play penceresini kendisi kapattı. Hata değil. */
  cancelled?: boolean;
}

/** Mağazadan okunan ürün bilgisi. Fiyat metni doğrudan mağazanın
 *  biçimlendirdiği hâliyle geliyor — para birimi ve ayraçlar dahil. */
export interface StoreProductInfo {
  option: PurchaseOptionId;
  price: string;
  /**
   * Ücretsiz tanıtım teklifi varsa süresi — hazır bir cümle yerine sayı ve
   * birim olarak. Cümleyi burada kurmak, uygulamanın İngilizce dilinde de
   * Türkçe bir metin göstermesi demekti: çeviri sözlüğünün anahtarı metnin
   * kendisi ve içinde değişken olan bir cümle hiçbir anahtara uymuyor.
   */
  introCount?: number;
  introUnit?: 'day' | 'week' | 'month' | 'year';
}

export interface EntitlementSnapshot {
  premium: boolean;
  /** Hangi seçenekten geldiği — ekranda "ömür boyu" ile "aylık"ı
   *  ayırabilmek için. */
  option?: PurchaseOptionId;
  /** Aboneliğin bitiş anı (ms). Mağaza vermediyse tanımsız. */
  expiresAt?: number;
}

const EMPTY: EntitlementSnapshot = { premium: false };

let connected = false;
let connecting: Promise<boolean> | null = null;

/**
 * Mağaza bağlantısını kurar. Birden fazla yerden çağrılabilir; ilk çağrı
 * bağlantıyı açar, sonrakiler aynı sözü bekler.
 */
export async function initBilling(): Promise<boolean> {
  if (!PREMIUM_ENABLED) return false;
  if (connected) return true;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      await initConnection();
      connected = true;
      return true;
    } catch {
      // Mağazaya ulaşılamıyor (ağ yok, simülatör, mağaza arızası).
      // Uygulamanın geri kalanı çalışmaya devam etmeli.
      connected = false;
      return false;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

export async function closeBilling(): Promise<void> {
  if (!connected) return;
  connected = false;
  try {
    await endConnection();
  } catch {
    // Kapatma hatası kullanıcıyı ilgilendirmiyor.
  }
}

export function isBillingAvailable(): boolean {
  return PREMIUM_ENABLED && connected;
}

/**
 * Ürünleri ve YEREL PARA BİRİMİNDEKİ fiyatlarını mağazadan okur.
 *
 * Yalnız abonelik sorgulanıyor: ömür boyu ürünü kaldırıldığından tek
 * seferlik ('in-app') bir ürün kalmadı. İkinci sorgu dururken hep boş
 * dönüyor ve her plan açılışında gereksiz bir mağaza gidiş dönüşü
 * ekliyordu.
 */
export async function fetchPlanProducts(): Promise<StoreProductInfo[]> {
  if (!(await initBilling())) return [];
  const out: StoreProductInfo[] = [];

  try {
    const subs = await fetchProducts({
      skus: SUBSCRIPTION_OPTION_IDS.map(productIdFor),
      type: 'subs',
    });
    for (const product of (subs ?? []) as any[]) {
      const option = optionForProductId(product.id);
      if (!option) continue;
      const info: StoreProductInfo = { option, price: product.displayPrice };
      // Ücretsiz deneme, App Store Connect'te aboneliğe bağlanan bir
      // tanıtım teklifi. Varsa satın alma kararını en çok etkileyen bilgi
      // odur; plan notunun yerine onu gösteriyoruz.
      if (product.introductoryPricePaymentModeIOS === 'free-trial') {
        const unit = product.introductoryPriceSubscriptionPeriodIOS;
        if (unit === 'day' || unit === 'week' || unit === 'month' || unit === 'year') {
          info.introUnit = unit;
          info.introCount = Number(product.introductoryPriceNumberOfPeriodsIOS ?? 1) || 1;
        }
      }
      out.push(info);
    }
  } catch {
    // Sessiz geçiyoruz: fiyat okunamazsa ekran yedek tutarı gösterir.
  }

  return out;
}

/**
 * Satın alma akışını başlatır ve sonucunu bekler.
 *
 * `requestPurchase` olay tabanlı olduğu için başarı ve hata olaylarını
 * geçici olarak dinleyip ilk gelene göre sözü çözüyoruz. Dinleyiciler her
 * durumda (başarı, hata, istisna) kaldırılıyor; kalırsa bir sonraki satın
 * alma iki kez işlenir.
 */
export async function purchaseOption(option: PurchaseOptionId): Promise<PurchaseResult> {
  if (!(await initBilling())) {
    return { ok: false, message: 'Mağazaya bağlanılamadı. Bağlantını kontrol et.' };
  }

  const sku = productIdFor(option);

  return new Promise<PurchaseResult>((resolve) => {
    let settled = false;
    const finish = (result: PurchaseResult) => {
      if (settled) return;
      settled = true;
      successSub.remove();
      errorSub.remove();
      resolve(result);
    };

    const successSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      // Aynı anda başka bir ürünün işlemi de düşebilir (ör. yenilenen
      // abonelik). Beklediğimiz ürün değilse karışmıyoruz; onu açılıştaki
      // eşitleme zaten yakalıyor.
      if (purchase.productId !== sku) return;
      try {
        // İşlem bitirilmezse iOS onu her açılışta yeniden sunuyor,
        // Android ise üç gün sonra parayı kendiliğinden iade ediyor.
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        // Bitirme hatası yetkinin verilmesini engellememeli; işlem
        // mağazada duruyor ve bir sonraki açılışta tekrar sunuluyor.
      }
      finish({ ok: true, message: 'Plasebo Plus açıldı.' });
    });

    const errorSub = purchaseErrorListener((error) => {
      const code = String((error as any)?.code ?? '');
      // Kullanıcı pencereyi kapattı: bu bir hata değil, uyarı da
      // gösterilmemeli.
      if (code.includes('USER_CANCEL') || code.includes('UserCancel')) {
        finish({ ok: false, cancelled: true, message: '' });
        return;
      }
      if (code.includes('DEFERRED') || code.includes('Deferred')) {
        finish({
          ok: false,
          message: 'Satın alma onay bekliyor. Onaylandığında Plus açılacak.',
        });
        return;
      }
      finish({
        ok: false,
        message: (error as any)?.message || 'Satın alma tamamlanamadı. Tekrar dene.',
      });
    });

    requestPurchase({
      request: {
        apple: { sku },
        google: { skus: [sku] },
      },
      // Satılan her ürün abonelik; tek seferlik ürün kalmadı.
      type: 'subs',
    }).catch((error) => {
      finish({
        ok: false,
        message: (error as any)?.message || 'Satın alma başlatılamadı.',
      });
    });
  });
}

/**
 * Cihazdaki geçerli satın alımları okuyup yetkiye çevirir.
 *
 * Açılışta ve plan ekranı her açıldığında çalışıyor. Hata durumunda
 * `null` dönüyor — bu "yetkisi yok" demek değil, "okuyamadım" demek:
 * çağıran taraf elindeki son duruma dokunmadan devam ediyor. Ağ yokken
 * kullanıcıyı üyeliğinden etmek olmaz.
 */
export async function syncEntitlement(): Promise<EntitlementSnapshot | null> {
  if (!(await initBilling())) return null;
  try {
    const purchases = await getAvailablePurchases();
    let best: EntitlementSnapshot | null = null;

    for (const purchase of (purchases ?? []) as any[]) {
      const option = optionForProductId(purchase.productId);
      if (!option) continue;

      // Bitiş anı geçmişse abonelik artık geçerli değil. iOS bunu
      // `expirationDateIOS` ile veriyor; alan yoksa (Android) mağaza
      // listeye zaten yalnız geçerli olanları koyuyor.
      const expiresAt =
        typeof purchase.expirationDateIOS === 'number' ? purchase.expirationDateIOS : undefined;
      if (typeof expiresAt === 'number' && expiresAt <= Date.now()) continue;

      if (!best || (expiresAt ?? 0) > (best.expiresAt ?? 0)) {
        best = { premium: true, option, expiresAt };
      }
    }

    return best ?? EMPTY;
  } catch {
    return null;
  }
}

/**
 * Mağazayla eşitleyip yetkileri yeniden okur.
 *
 * App Store ve Play, abonelik satan her uygulamada bunu zorunlu tutuyor:
 * telefon değiştiren ya da uygulamayı silip kuran kullanıcı üyeliğine
 * parasını yeniden ödemeden kavuşabilmeli. Uygulamanın kendi verisi
 * cihazda kaldığı için tek kaynak mağazanın işlem kayıtları.
 */
export async function restorePurchases(): Promise<{
  result: PurchaseResult;
  entitlement: EntitlementSnapshot | null;
}> {
  if (!(await initBilling())) {
    return {
      result: { ok: false, message: 'Mağazaya bağlanılamadı. Bağlantını kontrol et.' },
      entitlement: null,
    };
  }
  try {
    await storeRestorePurchases();
  } catch {
    // Kullanıcı Apple ID penceresini kapatmış olabilir; bu bir hata
    // değil. Elimizdeki kayıtlarla devam ediyoruz.
  }
  const entitlement = await syncEntitlement();
  if (!entitlement) {
    return {
      result: { ok: false, message: 'Satın alımlar okunamadı. Tekrar dene.' },
      entitlement: null,
    };
  }
  return {
    result: entitlement.premium
      ? { ok: true, message: 'Plus üyeliğin geri yüklendi.' }
      : { ok: false, message: 'Bu hesapta etkin bir üyelik bulunamadı.' },
    entitlement,
  };
}

/**
 * Aboneliği yönetme/iptal ekranını açar.
 *
 * İptal yeri mağazanın kendi ekranı olmak zorunda: uygulama içinden
 * kapatmak App Store'da gerçek bir iptal sayılmıyor ve kullanıcı
 * "iptal ettim" sanırken ücret çekilmeye devam ederdi.
 */
export async function openManageSubscriptions(): Promise<void> {
  try {
    await deepLinkToSubscriptions({
      skuAndroid: productIdFor('monthly'),
      packageNameAndroid: 'com.plasebo.app',
    });
  } catch {
    // Derin bağlantı açılamadıysa yapılabilecek bir şey yok; kullanıcı
    // ayarlardan da ulaşabiliyor.
  }
}

/**
 * Apple'ın standart lisans sözleşmesi (EULA). Kendi sözleşmemizi
 * yazmadığımız sürece App Store Connect uygulamaya bunu uyguluyor ve
 * bağlantısının satın alma ekranında bulunmasını şart koşuyor.
 */
export const APPLE_EULA_URL =
  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

/** Abonelik yönetim ekranının web karşılığı — derin bağlantı çalışmazsa. */
export const MANAGE_SUBSCRIPTIONS_URL =
  Platform.OS === 'android'
    ? 'https://play.google.com/store/account/subscriptions'
    : 'https://apps.apple.com/account/subscriptions';
