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
  /** Ölçüm ekranlarında sorulan soru. */
  measureQuestion: string;
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
    measureQuestion: 'Zihnindeki dağınıklığı şu an puanla',
    icon: '🎯',
  },
  {
    id: 'tight',
    label: 'İçim sıkışık, bunaltıcı hissediyorum',
    category: 'anxiety',
    goal: 'anxiety',
    prescriptionName: 'Nefes Açıcı',
    formulaDesc: 'Göğüs bölgesindeki sempatik sinir aktivasyonunu yatıştırır',
    measureQuestion: 'İçindeki sıkışıklığı şu an puanla',
    icon: '🫁',
  },
  {
    id: 'noenergy',
    label: 'Enerjim sıfır, hiçbir şey yapmak istemiyorum',
    category: 'energy',
    goal: 'energy',
    prescriptionName: 'Aktivasyon',
    formulaDesc: 'Uyuyan dopamin devrelerini düşük frekanslı uyarıyla harekete geçirir',
    measureQuestion: 'Enerji eksikliğini şu an puanla',
    icon: '⚡',
  },
  {
    id: 'noisy',
    label: 'Kafam çok kalabalık, düşünceler durmuyor',
    category: 'rumination',
    goal: 'sleep',
    prescriptionName: 'Sessizleştirici',
    formulaDesc: 'Varsayılan mod ağı aktivitesini frekans entrainment ile filtreler',
    measureQuestion: 'Kafandaki kalabalığı şu an puanla',
    icon: '🌫️',
  },
  {
    id: 'tense',
    label: 'Gerginim, bedenimde gerilim var',
    category: 'stress',
    goal: 'anxiety',
    prescriptionName: 'Kas Sıfırlayıcı',
    formulaDesc: 'Kronik kas gerilimini tetikleyen kortikal uyarımı baskılar',
    measureQuestion: 'Bedenindeki gerilimi şu an puanla',
    icon: '🪢',
  },
  {
    id: 'unmotivated',
    label: 'Motivasyonum yok, başlayamıyorum',
    category: 'motivation',
    goal: 'energy',
    prescriptionName: 'Başlatıcı',
    formulaDesc: 'Harekete geçişi engelleyen prefrontal frenleme döngüsünü keser',
    measureQuestion: 'Hareketsizlik hissini şu an puanla',
    icon: '🚀',
  },
];

/** Kategorilerin ekranda görünen adı. */
export const CATEGORY_LABELS: Record<string, string> = {
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
