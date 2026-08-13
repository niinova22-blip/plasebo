/**
 * Satın alma katmanı.
 *
 * ŞU AN GERÇEK BİR SATIN ALMA YOK. Google Play'de dijital ürün satmak
 * için Play Faturalandırma Kitaplığı zorunludur (Play'in Ödemeler
 * politikası); başka bir ödeme yolu kullanmak uygulamanın kaldırılma
 * sebebidir. Kitaplığın bağlanabilmesi içinse önce Play Console'da
 * abonelik ve ürünlerin tanımlı olması, uygulamanın da en az bir kez
 * yüklenmiş olması gerekir — yani sıralama gereği bu adım yayına
 * hazırlıktan sonra gelir.
 *
 * Bu yüzden burada bilerek **sahte bir satın alma yok**: varsayılan
 * olarak `purchase` hiçbir yetki vermez ve arayüz "yakında" der.
 *
 * Tek istisna test bayrağıdır: `EXPO_PUBLIC_ALLOW_TEST_PURCHASES=1`
 * tanımlıyken satın alma yetkiyi doğrudan verir, böylece kilitler ve
 * paywall cihaza kurulan bir APK üzerinde denenebilir. Bayrak
 * `eas.json`'da yalnızca `preview` profilinde tanımlıdır; Play'e giden
 * `production` derlemesinde yoktur, dolayısıyla mağazadaki uygulamada
 * bu yol kapalıdır.
 *
 * Gerçek faturalandırmayı bağlarken yapılacaklar `store/RELEASE.md`
 * içindeki "Abonelik" bölümünde adım adım yazılı.
 */
import type { PackId, PlanId } from '../constants/plans';

/**
 * Test satın alması açık mı? Sürüm derlemesinde bayrak tanımlı
 * değilse kapalıdır — mağaza sürümünde asla açılmaz.
 */
const TEST_PURCHASES = process.env.EXPO_PUBLIC_ALLOW_TEST_PURCHASES === '1';

export interface PurchaseResult {
  ok: boolean;
  /** Kullanıcıya gösterilecek mesaj. */
  message: string;
}

const NOT_AVAILABLE: PurchaseResult = {
  ok: false,
  message:
    'Satın alma henüz açılmadı. Abonelikler Google Play üzerinden yakında etkinleşecek.',
};

export function isBillingAvailable(): boolean {
  return TEST_PURCHASES;
}

export async function purchasePlan(plan: PlanId): Promise<PurchaseResult> {
  if (!TEST_PURCHASES) return NOT_AVAILABLE;
  return {
    ok: true,
    message: `Test derlemesi: ${plan} açıldı. Bu gerçek bir satın alma değil.`,
  };
}

export async function purchasePack(pack: PackId): Promise<PurchaseResult> {
  if (!TEST_PURCHASES) return NOT_AVAILABLE;
  return {
    ok: true,
    message: `Test derlemesi: ${pack} paketi açıldı. Bu gerçek bir satın alma değil.`,
  };
}

/**
 * Play'in abonelik gereksinimlerinden biri: kullanıcı, satın alımlarını
 * yeni bir cihazda geri yükleyebilmeli. Gerçek uygulamada bu,
 * faturalandırma kitaplığından aktif satın alımların sorgulanmasıdır.
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  return {
    ok: false,
    message: 'Geri yüklenecek satın alma bulunamadı.',
  };
}
