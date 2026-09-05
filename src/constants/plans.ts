/**
 * Abonelik kademeleri.
 *
 * AYRIM İLKESİ: **ritüel herkese açık, ölçüm Plus'ta.**
 *
 * Uygulamanın vaadi olan günlük plasebo ritüeli ücretsiz kademede
 * eksiksiz çalışır — dört formül, sınırsız tekrar, günde bir nokta atışı
 * reçete. Bu hem etik gereklilik (bir sakinleşme uygulaması insanı
 * ödeme duvarının önünde bırakmamalı) hem de App Store Review Guideline
 * 2.1'in beklediği şey: 1.1.1 sürümü tam olarak satın alınamayan kilitli
 * özellikler yüzünden reddedildi.
 *
 * Plus'ın sattığı şey **kanıt katmanı**: "ritüeli yaptım"ı "şu kadar
 * değişti"ye çeviren nesnel araçlar. Yüz taraması ve nefes analizi bu
 * katmanın ta kendisi, bu yüzden plan ekranının en üstünde duruyorlar.
 *
 * FİYATLAR BURADA YEDEKTİR. Ekranda gösterilen tutar mağazadan okunuyor
 * (`src/utils/billing.ts` → `fetchPlanProducts`), çünkü Apple gösterilen
 * fiyatın App Store Connect'teki fiyatla uyuşmasını şart koşuyor ve
 * kullanıcının kendi ülkesinin para biriminde doğru tutarı görmesi
 * gerekiyor. Buradaki `fallbackPrice` yalnızca mağazaya ulaşılamadığında
 * (uçak kipi, mağaza arızası) ekranın boş kalmaması için var; Türkiye
 * fiyatıdır.
 *
 * `productId` alanları App Store Connect'te açılacak ürün kimlikleriyle
 * birebir aynı olmalı — bir harf farkı ürünü "bulunamadı" yapar ve satın
 * alma hiç başlamaz. Kimlikler bir kez oluşturulduktan sonra Apple
 * tarafında **değiştirilemez**.
 */
import { Platform } from 'react-native';

/** Aboneliğin kullanıcıya görünen adı. Tek yerde duruyor ki kaymasın. */
export const PLAN_NAME = 'Plasebo Plus';

/**
 * Plus arayüzü açık mı? — **1.4.0 ile açıldı.**
 *
 * Bayrak uzun süre `false` durdu, çünkü satın alma kodu hazır olduğu
 * hâlde ürünler App Store Connect'te yoktu. Apple, Guideline 2.1 (App
 * Completeness) gereği çalışmayan bir satın alma akışına izin vermiyor;
 * 1.1.1 sürümü tam da Plan ekranındaki "yakında" rozetleri yüzünden
 * reddedilmişti.
 *
 * 5 Eylül 2026'da iki abonelik ürünü oluşturuldu — grup `Plasebo Premium`
 * (22361536), `...premium.monthly` (₺149,99) ve `...premium.yearly`
 * (₺1.159,99), ikisinde de bir haftalık ücretsiz deneme. Ürünler artık
 * gerçekten satın alınabildiği için bayrak açıldı. Kurulumun tam kaydı:
 * `store/ASC-ABONELIK-KURULUMU.md`.
 *
 * Bayrak açık olduğunda:
 *   - Plan ekranı gezinme ağacına ekleniyor ve Ayarlar'daki Plan satırı
 *     görünüyor,
 *   - ücretsiz kademe sınırları uygulanıyor (`FREE_LIMITS`),
 *   - açılışta mağaza bağlantısı kuruluyor ve yetki cihazdaki imzalı
 *     işlemlerden okunuyor.
 *
 * Reklam bundan bağımsız: bayrak kapalıyken de gösteriliyordu, çünkü
 * reklamın kaldırılması bir satın alma vaadi değil, Plus'ın yan faydası.
 * Artık Plus üyesi reklamı hiç görmüyor.
 *
 * Geri kapatmak gerekirse tek satır yeter; ekran, Ayarlar satırı ve
 * sınırlar aynı anda kaybolur.
 */
export const PREMIUM_ENABLED = true;

/**
 * İçerik paketleri satışa açık mı?
 *
 * İlk sürümde yalnız abonelik satılıyor. Paketlerin her biri App Store
 * Connect'te ayrı bir ürün, ayrı metadata ve ayrı inceleme demek;
 * içerikleri zaten Plus havuzunun içinde. Tanımları duruyor, satışı
 * kapalı.
 */
export const PACKS_FOR_SALE = false;

/**
 * Kullanıcının sahip olduğu kademe. Satın alınan seçenek ne olursa olsun
 * açılan yetki aynı: `premium`.
 *
 * Kimlik `premium` olarak kaldı, kullanıcıya görünen ad `PLAN_NAME`.
 * İkisini ayrı tutmak, ad değiştiğinde kayıtlı yetkilerin ve mağaza
 * eşleşmesinin bozulmamasını sağlıyor.
 */
export type PlanId = 'free' | 'premium';

/**
 * Satın alınabilir seçenekler. İkisi de aynı `premium` yetkisini açar,
 * yalnızca ödeme dönemi farklı.
 *
 * Ömür boyu ürünü **kaldırıldı**. Tek seferlik bir ödeme, yinelenen
 * gelirin yerini uzun vadede almıyor; üstelik App Store Connect'te ayrı
 * bir ürün türü, ayrı inceleme ve `syncEntitlement` içinde ayrı bir dal
 * demekti. İki abonelik dönemi hem satış tarafında hem kodda daha az yer
 * kaplıyor.
 */
export type PurchaseOptionId = 'monthly' | 'yearly';

export type PackId = 'exam' | 'sleep' | 'anxiety';

export interface PurchaseOption {
  id: PurchaseOptionId;
  label: string;
  /** Fiyatın yanındaki dönem eki. */
  suffix: string;
  /** Mağaza cevap vermezse gösterilecek Türkiye fiyatı. */
  fallbackPrice: string;
  note: string;
  /** Kart üzerinde "En avantajlı" rozeti. */
  best?: boolean;
}

/**
 * Ürün kimlikleri platforma göre ayrı tutuluyor. Apple ters alan adı
 * biçimini bekliyor; Play tarafında ise alt çizgili kimlikler zaten
 * planlanmıştı. Tek bir kimlik listesi kullanmak, iki mağazadan birinde
 * istenmeyen bir biçime mahkûm olmak demekti.
 */
const PRODUCT_IDS: Record<PurchaseOptionId, { ios: string; android: string }> = {
  monthly: {
    ios: 'com.plasebo.app.premium.monthly',
    android: 'plasebo_premium_monthly',
  },
  yearly: {
    ios: 'com.plasebo.app.premium.yearly',
    android: 'plasebo_premium_yearly',
  },
};

export function productIdFor(option: PurchaseOptionId): string {
  const ids = PRODUCT_IDS[option];
  return Platform.OS === 'android' ? ids.android : ids.ios;
}

export function optionForProductId(productId: string): PurchaseOptionId | undefined {
  return (Object.keys(PRODUCT_IDS) as PurchaseOptionId[]).find(
    (id) => PRODUCT_IDS[id].ios === productId || PRODUCT_IDS[id].android === productId
  );
}

/** Abonelik ürünleri — mağazaya 'subs' türüyle sorulur. */
export const SUBSCRIPTION_OPTION_IDS: PurchaseOptionId[] = ['monthly', 'yearly'];

/**
 * Fiyat matematiği `constants/pricing.ts` içinde ve buradan yeniden dışa
 * aktarılıyor.
 *
 * Sebebi test: bu dosya `react-native` içinden `Platform` aldığı için
 * test koşucusuna giremiyor, oysa "%36 indirim" yazan bir hesabın
 * sınanmadan kalması olmaz. Çağıran taraflar için hiçbir şey değişmiyor —
 * ister buradan ister `pricing.ts` içinden alsınlar, aynı fonksiyon.
 */
export {
  MONTHLY_PRICE_TRY,
  YEARLY_PRICE_TRY,
  parseDisplayPrice,
  yearlyDiscountPercent,
  yearlyPerMonth,
} from './pricing';

export const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'monthly',
    label: 'Aylık',
    suffix: '/ay',
    fallbackPrice: '₺149,99',
    note: 'İstediğin an durdur',
  },
  {
    id: 'yearly',
    label: 'Yıllık',
    suffix: '/yıl',
    fallbackPrice: '₺1.159,99',
    note: 'Aylık plana göre çok daha ucuz',
    best: true,
  },
];

export function optionById(id: PurchaseOptionId): PurchaseOption {
  return PURCHASE_OPTIONS.find((o) => o.id === id) ?? PURCHASE_OPTIONS[0];
}

/**
 * Ücretsiz kademenin ekranda anlatılan hâli.
 *
 * "Kendi puanın" maddesi bilerek ilk sırada değil ama listede: ücretsiz
 * kullanıcının ritüele girecek bir yolu olduğunu açıkça söylüyor. O yol
 * olmasaydı yüz taraması kilitlendiği anda ücretsiz kademe çalışmaz
 * hâle gelirdi.
 */
export const FREE_FEATURES: string[] = [
  'Dört günlük formül — her gün yenilenir, sınırsız tekrar',
  'Günde 1 nokta atışı reçete (şikayete özel)',
  'Günde 1 yüz taramalı ölçüm, sonrası kendi puanın',
  'Refleks testi — önce/sonra tepki süresi',
  '7 günlük geçmiş, günlük hatırlatıcı, kör test',
];

/**
 * Plus'ın öne çıkan üç özelliği.
 *
 * Plan ekranının en üstünde, kendi ikonlarıyla duruyorlar; geri kalanı
 * altta düz liste. Sebebi şu: sekiz maddelik bir liste okunmuyor, göz
 * üstünden kayıyor. Kararı verdiren şey ilk iki satır, o yüzden ölçümü
 * anlatan iki özellik oraya konuldu.
 */
export interface PlanHighlight {
  /** `components/Icon.tsx` içindeki ikon adı. */
  icon: 'camera' | 'wind' | 'chart';
  title: string;
  description: string;
}

export const PLUS_HIGHLIGHTS: PlanHighlight[] = [
  {
    icon: 'camera',
    title: 'Yüz taramasıyla ölçüm',
    description:
      'Önce ve sonra puanını sen tahmin etme — kamera ölçsün. Cihaz üstündeki duygu modeli yüz ifadeni okur, fotoğraf telefonundan çıkmaz.',
  },
  {
    icon: 'wind',
    title: 'Nefes analizi',
    description:
      'Ritüel sırasında nefesinin düzenliliğini, derinliğini ve dakikadaki sayısını ölçer. Sakinleştiğini hissetmekle ölçmek ayrı şeyler.',
  },
  {
    icon: 'chart',
    title: 'Gün içi ölçüm ve sabah raporu',
    description:
      'Gün içinde üç kısa nefes ölçümü, ertesi sabah uyku ve nabzınla birleşen tek bir rapor. Günün hangi saatinde en sakin olduğunu gösterir.',
  },
];

/**
 * Plus'ın açtıklarının tamamı — öne çıkan üçü de dahil.
 *
 * Sınırların gerçekten kaldırıldığı yer `FREE_LIMITS`; buradaki liste
 * onun kullanıcıya anlatılan karşılığı. İkisi birbirinden ayrı düşerse
 * ekranda yazan ile gerçekte açılan farklı olur.
 */
export const PREMIUM_FEATURES: string[] = [
  'Sınırsız yüz taramalı ölçüm (günde 1 sınırı kalkar)',
  'Nefes analizi — düzenlilik, derinlik, dakikadaki nefes',
  'Gün içi ölçüm daveti ve ertesi sabah günlük rapor',
  'Sınırsız nokta atışı reçete (günde bir sınırı kalkar)',
  'Reçete takibi — hangi şikayette ne kadar iyileştiğini izle',
  'Tüm geçmiş ve gelişmiş formül havuzu',
  'Çift doz — ritüel süresini kendin ayarla',
  'Reklamsız',
];

export interface ContentPack {
  id: PackId;
  productId: string;
  name: string;
  /** Formül kartındaki rozet için kısa ad — tam ad oraya sığmıyor. */
  shortName: string;
  price: string;
  description: string;
}

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
 * Ücretsiz kademenin sınırları. Plus hepsini kaldırır.
 *
 * Hedef sayısı burada bir sınır değil: dört hedefin (odak, uyku, kaygı,
 * enerji) her biri için her gün bir formül üretilir ve hepsi her
 * kademede açıktır — kullanıcı ana ekrandan hangisini isterse ona geçer,
 * aynı formülü istediği kadar tekrar oynatır. Ücretsiz ile Plus
 * arasındaki fark "üretim": Plus kriz moduyla istenildiği an yeni formül
 * üretir, ücretsiz kademe günün dört formülüyle sınırlıdır.
 */
export const FREE_LIMITS = {
  historyDays: 7,
  /** Günde birden fazla nokta atışı reçete yazdırmak. */
  unlimitedPrescriptions: false,
  /** Şikayete göre iyileşme takibi (İstatistik ekranındaki bölüm). */
  prescriptionTracking: false,
  customDose: false,
  /**
   * Günde kaç kez yüz taramasıyla ölçüm yapılabilir.
   *
   * Sıfır değil bir: özelliği hiç görmeyen kullanıcı ona para vermez.
   * Günde bir ölçüm hem Plus'ın ne sattığını yaşatıyor hem de 1.2.0'dan
   * gelen kullanıcı için sert bir geri alma olmuyor. Sayaç
   * `src/utils/faceScanQuota.ts` içinde, takvim gününe göre sıfırlanıyor.
   */
  faceScansPerDay: 1,
  /** Ritüel sırasında nefes analizi ve seans sonundaki nefes özeti. */
  breathAnalysis: false,
  /** Gün içi ölçüm daveti ve ertesi sabah günlük rapor. */
  dailyReport: false,
  /** Seans sonu geçiş reklamı gösterilmiyor mu. */
  adFree: false,
} as const;

export function packById(id: PackId): ContentPack | undefined {
  return CONTENT_PACKS.find((p) => p.id === id);
}
