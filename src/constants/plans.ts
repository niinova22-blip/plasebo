/**
 * Abonelik kademeleri ve içerik paketleri.
 *
 * Fiyatlar burada yalnızca **gösterim** amaçlıdır. Gerçek satış Google
 * Play Faturalandırma üzerinden yapılır ve tutarlar Play Console'daki
 * ürün tanımlarından gelir; kullanıcıya gösterilen fiyat da oradan
 * okunmalıdır (bölgeye ve vergiye göre değişir). `productId` alanları
 * Play Console'da açılacak ürün kimlikleriyle birebir aynı olmalıdır.
 *
 * Satın alma akışının kendisi `src/utils/billing.ts` içinde duruyor.
 */

/**
 * Premium arayüzü açık mı?
 *
 * Satın alma henüz hiçbir mağazada bağlı değil. Apple, App Store
 * Review Guideline 2.1 (App Completeness) gereği yayımlanan bir
 * uygulamada çalışmayan, "yakında" diye duran özellik gösterilmesine
 * izin vermiyor — 1.1.1 sürümü tam da Plan ekranındaki "yakında"
 * rozetleri yüzünden reddedildi.
 *
 * Bu bayrak `false` olduğu sürece:
 *   - Plan ekranı gezinme ağacına hiç eklenmez, hiçbir yerden açılmaz,
 *   - ücretsiz kademe sınırları uygulanmaz; herkes tam sürümü kullanır,
 *     böylece kilitli ama açılamayan hiçbir özellik kalmaz.
 *
 * Satın alma gerçekten bağlandığında (bkz. `store/RELEASE.md`) tek
 * yapılacak şey bunu `true` yapmak; altındaki plan tanımları, sınırlar
 * ve `src/utils/billing.ts` o gün için olduğu gibi duruyor.
 */
export const PREMIUM_ENABLED = false;

export type PlanId = 'free' | 'premium';
export type PackId = 'exam' | 'sleep' | 'anxiety';

export interface PlanTier {
  id: PlanId;
  /** Play Console abonelik ürün kimliği. Ücretsiz kademede yok. */
  productId?: string;
  name: string;
  price: string;
  period?: string;
  tagline: string;
  features: string[];
}

export interface ContentPack {
  id: PackId;
  productId: string;
  name: string;
  /** Formül kartındaki rozet için kısa ad — tam ad oraya sığmıyor. */
  shortName: string;
  price: string;
  description: string;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Freemium',
    price: '₺0',
    tagline: 'Başlangıç için yeterli.',
    features: [
      'Dört sabit formül — her gün yenilenir, sınırsız tekrar',
      'Günde 1 nokta atışı reçete (şikayete özel)',
      'Temel formül havuzu',
      '7 günlük geçmiş',
      'Günlük hatırlatıcı ve kör test',
    ],
  },
  {
    id: 'premium',
    productId: 'plasebo_premium_monthly',
    name: 'Premium',
    price: '₺49',
    period: '/ay',
    tagline: 'Uygulamanın tamamı.',
    features: [
      'Sınırsız nokta atışı reçete (günde bir sınırı kalkar)',
      'Reçete takibi — hangi şikayette ne kadar iyileştiğini izle',
      'Gelişmiş formül havuzu',
      'Tüm geçmiş',
      'Çift doz — ritüel süresini kendin ayarla',
      'İçerik paketleri',
    ],
  },
];

export const CONTENT_PACKS: ContentPack[] = [
  {
    id: 'exam',
    productId: 'plasebo_pack_exam',
    name: 'Sınav odak paketi',
    shortName: 'Sınav',
    price: '₺29',
    description: 'Uzun oturumlar için tasarlanmış renkler, sesler ve kelimeler.',
  },
  {
    id: 'sleep',
    productId: 'plasebo_pack_sleep',
    name: 'Uyku paketi',
    shortName: 'Uyku',
    price: '₺29',
    description: 'Yavaşlatan tonlar ve uzun nefes turları.',
  },
  {
    id: 'anxiety',
    productId: 'plasebo_pack_anxiety',
    name: 'Kaygı paketi',
    shortName: 'Kaygı',
    price: '₺29',
    description: 'Kısa, sık ve yere basan bir ritüel dili.',
  },
];

/**
 * Ücretsiz kademenin sınırları. Premium hepsini kaldırır.
 *
 * Hedef sayısı burada bir sınır değil: dört hedefin (odak, uyku, kaygı,
 * enerji) her biri için her gün bir formül üretilir ve hepsi her
 * kademede açıktır — kullanıcı ana ekrandan hangisini isterse ona geçer,
 * aynı formülü istediği kadar tekrar oynatır. Ücretsiz ile premium
 * arasındaki fark "üretim": premium kriz moduyla istenildiği an yeni
 * formül üretir, ücretsiz kademe günün dört formülüyle sınırlıdır.
 */
export const FREE_LIMITS = {
  historyDays: 7,
  /** Günde birden fazla nokta atışı reçete yazdırmak. */
  unlimitedPrescriptions: false,
  /** Şikayete göre iyileşme takibi (İstatistik ekranındaki bölüm). */
  prescriptionTracking: false,
  customDose: false,
} as const;

export function planById(id: PlanId): PlanTier {
  return PLAN_TIERS.find((p) => p.id === id) ?? PLAN_TIERS[0];
}

export function packById(id: PackId): ContentPack | undefined {
  return CONTENT_PACKS.find((p) => p.id === id);
}
