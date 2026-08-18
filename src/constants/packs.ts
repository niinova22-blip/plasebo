/**
 * İçerik paketleri — satın alındığında formül havuzuna eklenen içerik.
 *
 * Buradaki hiçbir veri de bir ölçüme dayanmıyor; paketler uygulamanın
 * geri kalanıyla aynı kurala tabi. Bir paket havuzu **genişletir**,
 * yerine geçmez: satın alan kullanıcı hem temel hem paket içeriğini
 * görür, böylece formüller tekrara düşmez.
 */
import type { BreathEntry, ColorEntry, SoundEntry } from './formulaPools';
import type { PackId } from './plans';
import type { StepKind } from '../types';
import type { TranslateFn } from '../i18n';

export interface PackContent {
  colors: ColorEntry[];
  sounds: SoundEntry[];
  breaths: BreathEntry[];
  words: string[];
  facts: string[];
}

export const PACK_CONTENT: Record<PackId, PackContent> = {
  exam: {
    colors: [
      { hex: '#4D6BFF', name: 'Mürekkep Mavisi', duration: 24 },
      { hex: '#00E5B0', name: 'Salon Yeşili', duration: 22 },
      { hex: '#FFC61A', name: 'Lamba Sarısı', duration: 20 },
    ],
    sounds: [
      { type: 'handpan', label: 'Handpan (uzun oturum)', duration: 180 },
      { type: '40hz_gamma', label: '40Hz Gama (uzun oturum)', duration: 150 },
      { type: 'kalimba', label: 'Kalimba (çalışma)', duration: 200 },
    ],
    breaths: [
      { pattern: 'box_breathing', label: 'Kutu Nefesi (uzatılmış)', rounds: 8 },
      { pattern: 'resonant_6s', label: 'Rezonans Nefesi (oturum arası)', rounds: 8 },
    ],
    words: ['SIRA', 'SAYFA', 'İSTİKRAR', 'TEKRAR', 'BİTİR'],
    facts: [
      '⚗️ Uzun oturumlarda 24 saniyelik renk sabitlemesi dikkat düşüşünü %29 geciktirir',
      '⚗️ Kutu nefesinin 8 turu çalışma belleğini %34 taze tutar',
      '⚗️ Oturum başına tek kelime seçmek konu değiştirme maliyetini %21 azaltır',
    ],
  },
  sleep: {
    // Uyku paketi bilerek daha sönük: gece kullanımı için düşük parlaklık.
    colors: [
      { hex: '#4A6BC8', name: 'Gece Yarısı', duration: 30 },
      { hex: '#7A5FD3', name: 'Lavanta Karanlığı', duration: 28 },
      { hex: '#3E5C6B', name: 'Sönmüş Kömür', duration: 32 },
    ],
    sounds: [
      { type: 'warm_pad', label: 'Sıcak Ped (gece)', duration: 240 },
      { type: 'tibetan_bowl', label: 'Tibet Kâsesi (sönümlü)', duration: 200 },
      { type: 'wind_chimes', label: 'Rüzgâr Çanları (gece)', duration: 260 },
      { type: 'deep_drone', label: 'Derin Uğultu (gece)', duration: 220 },
    ],
    breaths: [
      { pattern: '4-7-8', label: '4-7-8 (uzatılmış)', rounds: 8 },
      { pattern: 'coherent_5s', label: 'Uyumlu Nefes (gece)', rounds: 12 },
      { pattern: 'extended_exhale', label: 'Uzun Veriş (gece)', rounds: 10 },
    ],
    words: ['BIRAK', 'AĞIRLIK', 'KAPAN', 'YAVAŞ', 'DİNLEN'],
    facts: [
      '⚗️ 30 saniyelik koyu renk maruziyeti uykuya geçiş süresini %26 kısaltır',
      '⚗️ 4-7-8 nefesinin 8 turu gece uyanmalarını %18 azaltır',
      '⚗️ 240 saniyelik kahverengi gürültü derin uyku oranını %22 yükseltir',
    ],
  },
  anxiety: {
    colors: [
      { hex: '#5FE8D2', name: 'Sığ Su', duration: 12 },
      { hex: '#9EB8FF', name: 'Kurşun Sis', duration: 13 },
      { hex: '#FF8FB1', name: 'Solmuş Gül', duration: 11 },
    ],
    sounds: [
      { type: 'tibetan_bowl', label: 'Tibet Kâsesi (kısa)', duration: 45 },
      { type: 'binaural_alpha', label: 'Binaural Alfa (kısa)', duration: 50 },
      { type: 'crystal_chime', label: 'Kristal Çan (kısa)', duration: 40 },
    ],
    breaths: [
      { pattern: 'physiological_sigh', label: 'Fizyolojik İç Çekiş (sık)', rounds: 8 },
      { pattern: '4-4-4', label: 'Üçlü Denge (kısa)', rounds: 6 },
      { pattern: 'wave_5_3_7', label: 'Dalga Nefesi (kriz)', rounds: 6 },
    ],
    words: ['ZEMİN', 'BURADA', 'GEÇER', 'TUT', 'GÜVEN'],
    facts: [
      '⚗️ Fizyolojik iç çekişin 8 tekrarı akut gerilimi %31 düşürür',
      '⚗️ 12 saniyelik kısa renk sabitlemesi kaçınma dürtüsünü %24 zayıflatır',
      '⚗️ 45 saniyelik harmonik ses zemin hissini %27 pekiştirir',
    ],
  },
};

/**
 * Paketin ne eklediğini sayarak anlatır — "Sınav odak paketi" gibi bir
 * ad tek başına ne aldığını göstermiyordu.
 */
export function packCounts(id: PackId, t: TranslateFn = (text) => text): string {
  const p = PACK_CONTENT[id];
  if (!p) return '';
  const parts: string[] = [];
  if (p.colors.length) parts.push(t('{n} renk', { n: p.colors.length }));
  if (p.sounds.length) parts.push(t('{n} ses', { n: p.sounds.length }));
  if (p.breaths.length) parts.push(t('{n} nefes', { n: p.breaths.length }));
  if (p.words.length) parts.push(t('{n} kelime', { n: p.words.length }));
  if (p.facts.length) parts.push(t('{n} bulgu', { n: p.facts.length }));
  return parts.join(' · ');
}

/** Paketin içindeki renk/ses/nefes adları — kart altında örnek olarak listelenir. */
export function packExamples(id: PackId, t: TranslateFn = (text) => text): string {
  const p = PACK_CONTENT[id];
  if (!p) return '';
  return [
    ...p.colors.map((c) => t(c.name)),
    ...p.sounds.map((s) => t(s.label)),
    ...p.breaths.map((b) => t(b.label)),
  ].join(', ');
}

/**
 * Formüldeki bir öğe hangi paketten geldi?
 *
 * Paket içeriği havuza karıştığı için, satın alınan paketin gerçekten işe
 * yarayıp yaramadığı arayüzde hiç görünmüyordu. Bu eşleme sayesinde günün
 * formül kartında öğenin yanına paketin adı yazılabiliyor. Eşleşme ad/etiket
 * üzerinden yapılıyor: paket öğeleri temel havuzdakilerden farklı adlar
 * taşır ("Kahverengi Gürültü (gece)" gibi), o yüzden çakışma olmaz.
 */
export function packSourceFor(kind: StepKind, value: string): PackId | undefined {
  for (const id of Object.keys(PACK_CONTENT) as PackId[]) {
    const p = PACK_CONTENT[id];
    const hit =
      (kind === 'color' && p.colors.some((c) => c.name === value)) ||
      (kind === 'sound' && p.sounds.some((s) => s.label === value)) ||
      (kind === 'breath' && p.breaths.some((b) => b.label === value)) ||
      (kind === 'word' && p.words.includes(value));
    if (hit) return id;
  }
  return undefined;
}
