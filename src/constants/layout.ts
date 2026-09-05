/**
 * Boşluk ve köşe ölçeği.
 *
 * Bu dosya açılmadan önce uygulamada 30 farklı boşluk (1, 2, 3, 4, 5, 6,
 * 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34,
 * 36, 38, 40, 60, 64, 130) ve 20 farklı köşe yarıçapı vardı. Bu kadar
 * çok değerin hiçbiri bir karar değildi — her biri o an gözle
 * ayarlanmıştı ve 14 ile 15, 10 ile 11 arasındaki fark kimsenin
 * göremeyeceği ama düzenin ritmini bozan bir fark.
 *
 * Profesyonel görünen arayüzü profesyonel yapan şey genelde şu: aynı
 * boşluk hep aynı yerde tekrar eder. Göz farkı ayırt edemese bile
 * düzensizliği hisseder.
 *
 * Ölçek 4'ün katları üzerine kurulu. Ara değer gerekiyorsa ölçeğe yeni
 * bir basamak eklemek yerine düzeni gözden geçir — çoğu zaman sorun
 * boşluğun değeri değil, hiyerarşinin yanlış kurulmuş olması.
 */
export const space = {
  /** 4 — ikonla yazısı, etiketle değeri gibi ayrılmaz ikililer. */
  xs: 4,
  /** 8 — aynı grubun satırları. */
  sm: 8,
  /** 12 — kart içi bölümler. */
  md: 12,
  /** 16 — kartın iç boşluğu, ekran kenar boşluğu. */
  lg: 16,
  /** 20 — ekran kenar boşluğu (geniş), kart iç boşluğu (geniş). */
  xl: 20,
  /** 24 — ayrı kartlar arası. */
  xxl: 24,
  /** 32 — bölümler arası. */
  section: 32,
  /** 40 — ekranın altındaki nefes payı. */
  page: 40,
} as const;

/**
 * Köşe yarıçapı.
 *
 * Kural: kutu büyüdükçe yarıçap büyür ama oran sabit kalmaz — büyük
 * kartta küçük yarıçap sert, küçük rozette büyük yarıçap şişkin durur.
 */
export const radius = {
  /** 8 — rozet, etiket, küçük kutu. */
  sm: 8,
  /** 12 — satır ikonu kutusu, girdi alanı. */
  md: 12,
  /** 16 — kart. */
  lg: 16,
  /** 20 — öne çıkan kart. */
  xl: 20,
  /** 24 — formül kartı gibi büyük yüzeyler. */
  xxl: 24,
  /** Tam yuvarlak — hap düğmeler, noktalar. */
  pill: 999,
} as const;

/** Ekranın yatay kenar boşluğu. Bütün ekranlarda aynı olmalı. */
export const SCREEN_PADDING = space.xl;
