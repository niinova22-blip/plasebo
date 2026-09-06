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
 * Ücretsiz deneme süresinin birimi — dile göre, tekil/çoğul doğru.
 *
 * NEDEN `t()` YETMİYOR
 *
 * Çeviri sözlüğünün anahtarı Türkçe metnin kendisi. Türkçede sayıdan
 * sonra birim çoğullanmıyor ("1 hafta", "3 hafta"), İngilizcede
 * çoğullanıyor ("1 week", "3 weeks") — yani tek bir Türkçe anahtarın iki
 * ayrı İngilizce karşılığı olması gerekiyor ve sözlük bunu ifade
 * edemiyor. Sözlükte `'hafta': 'weeks'` yazdığı için satın alma ekranı
 * İngilizcede **"1 weeks free, then ₺1.159,99"** diyordu; hem dilbilgisi
 * hatası hem de hukuken anlamlı bir cümlenin içinde, üstelik incelemeyi
 * yapan kişinin okuduğu dilde.
 *
 * Bu yüzden birim sözlükten değil buradan geliyor: karar sayıya **ve**
 * dile bağlı, ikisi de burada elde.
 */
export type PriceLang = 'tr' | 'en';

const INTRO_UNITS: Record<PriceLang, Record<string, [string, string]>> = {
  tr: {
    day: ['gün', 'gün'],
    week: ['hafta', 'hafta'],
    month: ['ay', 'ay'],
    year: ['yıl', 'yıl'],
  },
  en: {
    day: ['day', 'days'],
    week: ['week', 'weeks'],
    month: ['month', 'months'],
    year: ['year', 'years'],
  },
};

/** Bilinmeyen bir birimde `null` döner; çağıran taraf cümleyi hiç kurmaz. */
export function introUnitLabel(
  unit: string,
  count: number,
  lang: PriceLang
): string | null {
  const forms = INTRO_UNITS[lang]?.[unit];
  if (!forms) return null;
  return count === 1 ? forms[0] : forms[1];
}

/**
 * Bir tutarı, ekranda duran başka bir fiyatın biçimiyle yazar.
 *
 * NEDEN GEREKLİ
 *
 * Yıllık kartın rozeti "%36 indirim · ayda {aylik}" şablonundan geliyordu
 * ve `{aylik}` çıplak bir sayıydı: ekranda **"36% off · 96.67 per month"**
 * yazıyordu. Satın alma noktasında para birimi olmayan bir tutar,
 * Guideline 3.1.2 açısından zayıf bir yer — kullanıcı hangi para
 * biriminden söz edildiğini ekrandan okuyamıyor.
 *
 * Tutarı kendi başımıza biçimlemek de çözüm değil: para biriminin
 * işareti, işaretin başta mı sonda mı durduğu, binlik ve ondalık
 * ayırıcıların ne olduğu mağazanın bulunduğu ülkeye göre değişiyor
 * (`₺1.159,99`, `$1,159.99`, `1 159,99 TL`). Doğru biçim zaten elimizde:
 * ekranda duran yıllık fiyatın kendisi. Bu fonksiyon o dizedeki sayıyı
 * yenisiyle değiştiriyor, geri kalan her şeye dokunmuyor.
 *
 * Kaynak fiyat ondalıksızsa (`¥1200`) sonuç da ondalıksız yuvarlanıyor —
 * o para biriminde kuruş yok.
 *
 * Sayı bulunamayan bir dizede `null` dönüyor: yanlış biçimde bir tutar
 * göstermektense rozeti hiç göstermemek doğru.
 */
export function formatLikeDisplay(display: string, value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;

  const match = display.match(/\d[\d., \s]*\d|\d/);
  if (!match) return null;
  const raw = match[0];

  // Ayırıcıların yerleri; sonuncusundan sonra tam iki basamak varsa o
  // ondalıktır, kalanların hepsi binliktir (parseDisplayPrice ile aynı kural).
  const seps: { ch: string; at: number }[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (/[., \s]/.test(raw[i])) seps.push({ ch: raw[i], at: i });
  }
  const last = seps[seps.length - 1];
  const decimal =
    last && raw.length - last.at - 1 === 2 && /^\d\d$/.test(raw.slice(last.at + 1))
      ? last
      : undefined;
  const grouping = seps.find((s) => s !== decimal)?.ch;

  const fixed = decimal ? value.toFixed(2) : `${Math.round(value)}`;
  const [intPart, frac] = fixed.split('.');
  const grouped = grouping
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, grouping)
    : intPart;
  const rendered = decimal ? `${grouped}${decimal.ch}${frac}` : grouped;

  return display.replace(raw, rendered);
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
