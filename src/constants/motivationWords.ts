import type { Goal } from '../types';

/**
 * Ritüelin ortasında duran motivasyon kelimesi.
 *
 * Mantık: kullanıcının seçtiği şikâyete **zıt ama umut uyandıran** bir
 * kelime göstermek. "Kafam dağınık" diyene BERRAK, "kalkamıyorum"
 * diyene BAŞLA. Kelime bir vaat değil, bir yön — ritüel boyunca renk
 * topunun içinde durup ışıkla birlikte yayılıyor.
 *
 * Anahtarlar uygulamanın şikâyet kategorileriyle eşleşiyor
 * (`src/constants/complaints.ts` → `category`). `heartache` ve `mood`
 * gibi henüz kategorisi olmayanlar ileride açılacak; hedef üzerinden
 * yapılan yedek eşleme onları şimdiden kullanılabilir kılıyor.
 */
export type MotivationCategory =
  | 'scattered'
  | 'tight'
  | 'noenergy'
  | 'noisy'
  | 'tense'
  | 'unmotivated'
  | 'heartache'
  | 'sleep'
  | 'mood';

export const MOTIVATION_WORDS: Record<MotivationCategory, string[]> = {
  // Zihin dağınıklığı, odak sorunu
  scattered: ['BERRAK', 'ODAK', 'AKIŞ', 'SAF', 'NET'],

  // Kaygı, sıkışıklık, bunaltı
  tight: ['NEFES', 'GENİŞ', 'SERBEST', 'AÇIL', 'HUZUR'],

  // Enerji eksikliği, isteksizlik
  noenergy: ['CANLAN', 'KIVILCIM', 'IŞIL', 'COŞKU', 'ATEŞ'],

  // Kafa kalabalığı, düşünce gürültüsü
  noisy: ['SESSİZ', 'DUR', 'DİNGİN', 'BOŞ', 'SUS'],

  // Bedensel gerilim, stres
  tense: ['ERİT', 'YUMUŞA', 'AK', 'BIRAK', 'ÇÖZ'],

  // Motivasyon eksikliği, başlayamama
  unmotivated: ['BAŞLA', 'ADIM', 'ŞİMDİ', 'İLERİ', 'HAREKET'],

  // Duygusal ağrı — kategorisi ileride eklenecek
  heartache: ['UMUT', 'IŞIK', 'YARIN', 'GEÇER', 'YENİ'],

  // Uyku sorunu
  sleep: ['SÜZÜL', 'BAT', 'DERİN', 'AĞIRLAŞ', 'BIRAK'],

  // Ruh hâli düşüklüğü
  mood: ['RENK', 'SICAK', 'GÜL', 'CANLI', 'SABAH'],
};

/**
 * Şikâyet kategorisi → motivasyon kümesi.
 *
 * Uygulamadaki kategoriler İngilizce anahtarlarla tutuluyor ama
 * isimleri birebir aynı değil; eşleme burada tek yerde duruyor ki
 * yeni bir şikâyet kategorisi eklendiğinde yalnızca bu tablo büyüsün.
 */
const CATEGORY_MAP: Record<string, MotivationCategory> = {
  focus: 'scattered',
  anxiety: 'tight',
  energy: 'noenergy',
  rumination: 'noisy',
  stress: 'tense',
  motivation: 'unmotivated',
};

/** Kategori yoksa (serbest metin) hedeften türetilen yedek eşleme. */
const GOAL_MAP: Record<Goal, MotivationCategory> = {
  focus: 'scattered',
  sleep: 'sleep',
  anxiety: 'tight',
  energy: 'noenergy',
};

export function motivationCategory(
  category?: string,
  goal?: Goal
): MotivationCategory {
  if (category && CATEGORY_MAP[category]) return CATEGORY_MAP[category];
  if (goal && GOAL_MAP[goal]) return GOAL_MAP[goal];
  return 'scattered';
}

/**
 * Günün kelimesi.
 *
 * Seri gününe göre ilerliyor: aynı şikâyeti üst üste seçen kullanıcı her
 * gün başka bir kelime görüyor, beş günde bir başa dönüyor. Rastgele
 * seçilseydi aynı kelime arka arkaya çıkabilirdi.
 */
export function getDailyWord(category: MotivationCategory, streakDay: number): string {
  const words = MOTIVATION_WORDS[category] ?? MOTIVATION_WORDS.scattered;
  const index = Math.abs(Math.floor(streakDay)) % words.length;
  return words[index];
}
