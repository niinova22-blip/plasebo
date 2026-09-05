/**
 * Fiyat matematiği — bağımlılıksız.
 *
 * NEDEN AYRI DOSYA
 *
 * Bu fonksiyonların doğal yeri `plans.ts`, ama orası `react-native`
 * içinden `Platform` alıyor ve o import bütün dosyayı test koşucusunun
 * dışına itiyor: `src/__tests__/logic.test.ts` React Native'i çözemiyor,
 * çünkü paket kaynak hâlinde Flow tipleriyle geliyor. Sonuç, indirim
 * hesabının hiç sınanamaması olurdu.
 *
 * Ekranda "%36 indirim" yazan bir satır, sınanmadan bırakılacak bir yer
 * değil: yanlış bir yüzde, Apple'ın yanıltıcı fiyat beyanı kuralına
 * doğrudan giriyor. Bu yüzden hesap buraya, hiçbir şeye bağlı olmayan
 * bir dosyaya alındı; `plans.ts` onu yeniden dışa aktarıyor, yani
 * çağıran taraflar için hiçbir şey değişmiyor.
 *
 * BURADAKİ TUTARLAR YEDEKTİR. Ekranda gösterilen fiyat mağazadan okunur
 * (`utils/billing.ts` → `fetchPlanProducts`); bunlar yalnızca mağazaya
 * ulaşılamadığında kullanılıyor ve Türkiye fiyatıdır.
 */

/**
 * Aylık planın Türkiye fiyatı (yedek).
 *
 * ₺149,99 — çünkü Apple serbest tutar kabul etmiyor, kademe seçtiriyor ve
 * Türkiye listesinde ₺149,00 diye bir kademe yok. App Store Connect'te
 * seçilen gerçek kademe budur; buradaki sayı onunla aynı kalmalı.
 */
export const MONTHLY_PRICE_TRY = 149.99;
/** Yıllık planın Türkiye fiyatı (yedek). */
export const YEARLY_PRICE_TRY = 1159.99;

/**
 * Yıllık planın aylığa göre indirim yüzdesi (tam sayıya yuvarlanmış).
 *
 * Aylık fiyat okunamadıysa sıfır dönüyor; sıfır bir indirim iddiası
 * değil, "hesaplayamadım" demek ve çağıran taraf rozeti hiç göstermiyor.
 */
export function yearlyDiscountPercent(monthly: number, yearly: number): number {
  if (monthly <= 0) return 0;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

/** Yıllık planın aya düşen tutarı. */
export function yearlyPerMonth(yearly: number): number {
  return yearly / 12;
}

/**
 * Mağazadan gelen biçimlenmiş fiyattan sayıyı çıkarır.
 *
 * Gerekli, çünkü indirim rozetinin **ekranda yazan** fiyatlardan
 * hesaplanması gerekiyor. Koda gömülü tutarlardan hesaplansaydı ve
 * Apple tarafındaki fiyat kademesi bir gün değiştirilseydi, rozet
 * gerçekte olmayan bir indirimi ilan ederdi.
 *
 * Biçimler ülkeye göre değişiyor: `₺1.159,99`, `$1,159.99`,
 * `1 159,99 TL`. Kural şu — son ayırıcıdan sonra tam iki basamak varsa o
 * ayırıcı ondalıktır, kalan bütün ayırıcılar binliktir. Hiç ayırıcı
 * yoksa sayı zaten tamdır.
 *
 * Kuralın bilinen sınırı: ondalığı tek basamakla yazan bir biçimde
 * (`1,5`) ayırıcı binlik sanılır. Böyle bir para birimi biçimi App
 * Store'da kullanılmıyor; buna karşılık `₺1.159` gibi ondalıksız
 * tutarların doğru çözülmesi gerçekten gerekiyor, o yüzden kural bu
 * yönde seçildi.
 *
 * Çözülemeyen bir biçimde `null` dönüyor: yanlış bir yüzde göstermektense
 * hiç göstermemek doğru.
 */
export function parseDisplayPrice(display: string): number | null {
  const cleaned = display.replace(/[^\d.,]/g, '');
  if (!cleaned) return null;

  const lastSep = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  let normalized: string;
  if (lastSep === -1) {
    normalized = cleaned;
  } else if (cleaned.length - lastSep - 1 === 2) {
    // Son ayırıcı ondalık; öncesindeki bütün ayırıcılar binlik.
    normalized = `${cleaned.slice(0, lastSep).replace(/[.,]/g, '')}.${cleaned.slice(lastSep + 1)}`;
  } else {
    // Hepsi binlik ayırıcı (ör. "1.159" ya da "1,159").
    normalized = cleaned.replace(/[.,]/g, '');
  }

  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}
