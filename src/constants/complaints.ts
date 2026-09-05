import type { Goal } from '../types';

/**
 * Şikayet havuzu — "Şikayet → Muayene → Reçete" akışının girdisi.
 *
 * Her şikayet, uygulamanın mevcut dört hedefinden birine bağlanıyor:
 * formül motoru hedeften üretiyor, şikayet ise o formüle bir **ad ve
 * gerekçe** veriyor. Yani şikayetler yeni bir motor değil, var olan
 * motorun üstüne geçirilen bir çerçeve.
 *
 * `formulaDesc` bilerek bilimsel görünümlü ve bilerek uydurma; reçete
 * ekranında hemen altında bunun plasebo olduğu yazıyor.
 */
export interface Complaint {
  id: string;
  /** Kullanıcının gördüğü şikayet cümlesi. */
  label: string;
  /** İç kategori — istatistiklerde gruplama için. */
  category: string;
  /** Formülün hangi hedeften üretileceği. */
  goal: Goal;
  /** Reçetenin adı. */
  prescriptionName: string;
  /** Reçetedeki sözde etki açıklaması. */
  formulaDesc: string;
  /** Kart üzerindeki simge. */
  icon: string;
}

export const COMPLAINTS: Complaint[] = [
  {
    id: 'scattered',
    label: 'Zihnim dağınık, odaklanamıyorum',
    category: 'focus',
    goal: 'focus',
    prescriptionName: 'Zihin Berraklığı',
    formulaDesc: 'Dağınık nöral bağlantıları tek odak noktasında toplar',
    icon: '🎯',
  },
  {
    id: 'tight',
    label: 'İçim sıkışık, bunaltıcı hissediyorum',
    category: 'anxiety',
    goal: 'anxiety',
    prescriptionName: 'Nefes Açıcı',
    formulaDesc: 'Göğüs bölgesindeki sempatik sinir aktivasyonunu yatıştırır',
    icon: '🫁',
  },
  {
    id: 'noenergy',
    label: 'Enerjim sıfır, hiçbir şey yapmak istemiyorum',
    category: 'energy',
    goal: 'energy',
    prescriptionName: 'Aktivasyon',
    formulaDesc: 'Uyuyan dopamin devrelerini düşük frekanslı uyarıyla harekete geçirir',
    icon: '⚡',
  },
  {
    id: 'noisy',
    label: 'Kafam çok kalabalık, düşünceler durmuyor',
    category: 'rumination',
    goal: 'sleep',
    prescriptionName: 'Sessizleştirici',
    formulaDesc: 'Varsayılan mod ağı aktivitesini frekans entrainment ile filtreler',
    icon: '🌫️',
  },
  {
    id: 'tense',
    label: 'Gerginim, bedenimde gerilim var',
    category: 'stress',
    goal: 'anxiety',
    prescriptionName: 'Kas Sıfırlayıcı',
    formulaDesc: 'Kronik kas gerilimini tetikleyen kortikal uyarımı baskılar',
    icon: '🪢',
  },
  {
    id: 'unmotivated',
    label: 'Motivasyonum yok, başlayamıyorum',
    category: 'motivation',
    goal: 'energy',
    prescriptionName: 'Başlatıcı',
    formulaDesc: 'Harekete geçişi engelleyen prefrontal frenleme döngüsünü keser',
    icon: '🚀',
  },
];

/** Kategorilerin ekranda görünen adı. */
export const CATEGORY_LABELS: Record<string, string> = {
  custom: 'Kendi cümlen',
  focus: 'Odak',
  anxiety: 'Kaygı',
  energy: 'Enerji',
  rumination: 'Düşünce yoğunluğu',
  stress: 'Gerginlik',
  motivation: 'Motivasyon',
};

export function complaintById(id?: string): Complaint | undefined {
  return id ? COMPLAINTS.find((c) => c.id === id) : undefined;
}

/* ------------------------------------------------------------------ */
/* Kendi cümlesiyle anlatan kullanıcı                                  */
/* ------------------------------------------------------------------ */

/** Serbest metinle açılan şikayetin kimliği. */
export const CUSTOM_COMPLAINT_ID = 'custom';

/**
 * Hedef, kullanıcının yazdığı cümleden çıkarılır.
 *
 * Anahtar kelime eşlemesi bilerek basit: gerçek bir dil işleme yok,
 * olduğunu da iddia etmiyoruz. Hiçbir kelime tutmazsa cümlenin karması
 * hedefi belirler — yani sonuç yine deterministik: aynı cümle her zaman
 * aynı hedefi verir.
 */
const KEYWORDS: { goal: Goal; words: string[] }[] = [
  {
    goal: 'sleep',
    words: ['uyu', 'uyku', 'uykusuz', 'yorgun', 'yatak', 'gece', 'sleep', 'insomnia'],
  },
  {
    goal: 'anxiety',
    words: [
      'kaygı', 'kaygi', 'endişe', 'endise', 'gergin', 'stres', 'panik', 'korku',
      'sıkış', 'sikis', 'anxious', 'stress', 'panic', 'worry',
    ],
  },
  {
    goal: 'energy',
    words: [
      'enerji', 'motivasyon', 'isteksiz', 'halsiz', 'tembel', 'başlaya', 'baslaya',
      'energy', 'motivation', 'tired', 'lazy',
    ],
  },
  {
    goal: 'focus',
    words: [
      'odak', 'dikkat', 'dağınık', 'dagilan', 'dagitik', 'konsantre', 'focus',
      'concentrat', 'distract',
    ],
  },
];

function hashText(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function goalForText(text: string): Goal {
  const lower = text.toLocaleLowerCase('tr-TR');
  for (const entry of KEYWORDS) {
    if (entry.words.some((w) => lower.includes(w))) return entry.goal;
  }
  const goals: Goal[] = ['focus', 'sleep', 'anxiety', 'energy'];
  return goals[hashText(lower) % goals.length];
}

/**
 * Cihaz üstü modelin bulduğu hedefler — metin → hedef.
 *
 * `customComplaint` senkron kalmak zorunda: akıştaki her ekran şikayet
 * nesnesini bu metinden yeniden kuruyor ve hiçbiri `await` edemez. Model
 * ise asenkron. Çözüm, sınıflandırmayı akış başlarken bir kez yapıp
 * sonucu buraya bırakmak; `customComplaint` de varsa onu, yoksa anahtar
 * kelime eşlemesini kullanıyor.
 *
 * Bellekte duruyor, diske yazılmıyor: bu eşleme yalnızca o anki akış
 * boyunca gerekli — seans kaydedilirken hedef zaten kaydın içine
 * yazılıyor, yani geçmiş kayıtlar bu tabloya bağlı değil.
 */
const textGoalOverrides = new Map<string, Goal>();

/** Sınıflandırma sonucunu, akışın geri kalanının görebileceği yere koyar. */
export function rememberTextGoal(text: string, goal: Goal): void {
  textGoalOverrides.set(text.trim().toLocaleLowerCase('tr-TR'), goal);
}

/** Serbest şikayet için reçete adları — metnin karmasına göre seçilir. */
const CUSTOM_NAMES = [
  'Kişiye Özel Karışım',
  'Tarif Dışı Formül',
  'Özel Terkip',
  'Ad Hoc Reçete',
];

/** Serbest şikayet için sözde etki açıklamaları. */
const CUSTOM_DESCS = [
  'Anlattığın tabloya göre hazırlanmış, tek seferlik bir bileşim',
  'Cümlendeki örüntüye eşlenen renk, ses ve nefes üçlüsü',
  'Tarif ettiğin duruma göre ayarlanmış özel bir terkip',
  'Yalnızca bugünün ve senin cümlenin belirlediği bir formül',
];

/**
 * Kullanıcının yazdığı cümleden bir şikayet nesnesi kurar.
 *
 * Sabit şikayetlerle aynı yapıda döner, böylece akışın geri kalanı
 * (muayene, reçete, ölçüm, özet) hiçbir özel durum bilmek zorunda kalmaz.
 */
export function customComplaint(text: string): Complaint {
  const clean = text.trim();
  const hash = hashText(clean.toLocaleLowerCase('tr-TR'));
  return {
    id: CUSTOM_COMPLAINT_ID,
    label: clean,
    category: 'custom',
    goal:
      textGoalOverrides.get(clean.toLocaleLowerCase('tr-TR')) ?? goalForText(clean),
    prescriptionName: CUSTOM_NAMES[hash % CUSTOM_NAMES.length],
    formulaDesc: CUSTOM_DESCS[(hash >>> 8) % CUSTOM_DESCS.length],
    icon: '✍️',
  };
}

/** Kimlik + serbest metinden şikayeti çözer. */
export function resolveComplaint(
  id?: string,
  customText?: string
): Complaint | undefined {
  if (id === CUSTOM_COMPLAINT_ID && customText) return customComplaint(customText);
  return complaintById(id);
}
