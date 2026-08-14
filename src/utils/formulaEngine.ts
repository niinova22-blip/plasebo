import {
  BASIC_POOLS,
  BREATH_FACTS,
  COLOR_FACTS,
  FULL_POOLS,
  SOUND_FACTS,
  WORD_FACTS,
  type BreathId,
  type FormulaPools,
} from '../constants/formulaPools';
import { PACK_CONTENT } from '../constants/packs';
import type { PackId } from '../constants/plans';
import type { Formula, Goal, StepKind } from '../types';

/**
 * Formül motoru — tamamen saf. Hiçbir fonksiyon depolamaya yazmaz,
 * tarih dışında dış duruma bakmaz.
 */

const GOAL_PREFIX: Record<string, string> = {
  focus: 'Odak',
  sleep: 'Uyku',
  anxiety: 'Sükunet',
  energy: 'Enerji',
};

/** Uygulamadaki tüm hedefler — her kademede dördü de kullanılabilir. */
export const ALL_GOALS: Goal[] = ['focus', 'sleep', 'anxiety', 'energy'];

export const GOAL_LABELS: Record<Goal, string> = {
  focus: 'Odak',
  sleep: 'Uyku',
  anxiety: 'Kaygı',
  energy: 'Enerji',
};

/** Yerel gün başlangıcına göre YYYY-MM-DD. */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Tarih + hedeften türeyen seed.
 *
 * Tasarım tarihçesi, çünkü buradaki hata uygulamanın en görünür kusuruydu:
 * ilk sürüm karakter **toplamı** kullanıyordu (`'2026-08-14'` → 517 gibi).
 * Toplam, bir yıl boyunca yalnızca ~50 farklı değer üretiyor; üstelik
 * "01-02" ile "02-01" gibi tarihler aynı toplamı veriyor. Sonuç: havuzlar
 * ne kadar büyük olursa olsun bir yılda topu topu ~19 farklı formül
 * çıkıyordu. Artık dizgenin tamamı FNV-1a ile karılıyor; her gün ayrı bir
 * seed alıyor ve determinizm korunuyor (aynı gün + aynı hedef = aynı seed).
 */
export function seedFor(date: string, goal: string): number {
  return fnv1a(`${date}|${goal}`);
}

/** FNV-1a, 32 bit. Kısa dizgeleri iyi dağıtır ve her yerde aynı sonucu verir. */
function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** `YYYY-MM-DD` → sabit bir başlangıçtan bu yana geçen gün sayısı. */
function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const EPOCH = Date.UTC(2020, 0, 1);
  return Math.round((Date.UTC(y, (m || 1) - 1, d || 1) - EPOCH) / 86400000);
}

/**
 * `n` ile aralarında asal, n'in yarısına yakın bir adım.
 *
 * Günlük formül, havuz uzunluklarının çarpımı kadar büyüklükteki bir
 * halkada `adım` kadar ilerleyerek seçiliyor. Adım n ile aralarında asal
 * olduğunda dizi, başa dönmeden önce **bütün** kombinasyonları geziyor —
 * yani havuz 365'ten büyükse bir yıl boyunca hiçbir formül tekrar etmiyor.
 */
function coprimeStep(n: number): number {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  let step = Math.max(1, Math.floor(n * 0.618)); // altın oran: iyi dağılım
  while (step > 1 && gcd(step, n) !== 1) step--;
  return step || 1;
}

/**
 * Seed'i bir tuza göre dağıtan karma (murmur3 son karıştırma adımı).
 *
 * Önceki sürüm `(seed * çarpan) % havuzUzunluğu` kullanıyordu ve
 * çarpanların havuz uzunluğuyla aralarında asal olmasını gerektiriyordu
 * — 6 elemanlı havuzda `(seed*3)%6` yalnızca 0 ve 3 üretir, yani sesin
 * dördü hiç çıkmazdı. Kademeler ve içerik paketleriyle birlikte havuz
 * uzunlukları artık kullanıcıdan kullanıcıya değiştiği için o kural
 * korunamaz hale geldi. Karma, uzunluk ne olursa olsun dengeli dağıtır.
 */
function hash(seed: number, salt: number): number {
  let h = (Math.abs(Math.round(seed)) ^ Math.imul(salt, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function pick<T>(pool: T[], seed: number, salt: number): T {
  return pool[hash(seed, salt) % pool.length];
}

/** Alan başına sabit tuzlar — aynı seed'den farklı seçimler çıksın diye. */
const SALT = {
  color: 1,
  sound: 2,
  breath: 3,
  word: 4,
  fact: 5,
} as const;

/**
 * Kullanıcının kademesine ve satın aldığı paketlere göre havuz.
 *
 * Paketler havuzu genişletir, yerine geçmez — satın alan kullanıcı hem
 * temel hem paket içeriğini görür.
 */
export function poolsFor(premium: boolean, packs: PackId[] = []): FormulaPools {
  const base = premium ? FULL_POOLS : BASIC_POOLS;
  if (!packs.length) return base;

  const extra = packs.map((id) => PACK_CONTENT[id]).filter(Boolean);
  return {
    colors: [...base.colors, ...extra.flatMap((p) => p.colors)],
    sounds: [...base.sounds, ...extra.flatMap((p) => p.sounds)],
    breaths: [...base.breaths, ...extra.flatMap((p) => p.breaths)],
    words: [...base.words, ...extra.flatMap((p) => p.words)],
    facts: [...base.facts, ...extra.flatMap((p) => p.facts)],
  };
}

/** Hedefe göre adım sırası. */
export function getStepOrder(goal: string): StepKind[] {
  switch (goal) {
    case 'anxiety':
      return ['breath', 'color', 'sound'];
    case 'sleep':
      return ['sound', 'breath', 'color'];
    case 'energy':
      return ['color', 'breath', 'sound'];
    case 'focus':
    default:
      return ['color', 'sound', 'breath'];
  }
}

function buildFormula(
  seed: number,
  goal: string,
  date: string,
  pools: FormulaPools,
  crisis = false
): Formula {
  return {
    id: Math.abs(seed) % 1000,
    name: `${GOAL_PREFIX[goal] ?? 'Denge'} #${Math.abs(seed) % 100}`,
    goal,
    color: { ...pick(pools.colors, seed, SALT.color) },
    sound: { ...pick(pools.sounds, seed, SALT.sound) },
    breath: { ...pick(pools.breaths, seed, SALT.breath) },
    word: pick(pools.words, seed, SALT.word),
    stepOrder: getStepOrder(goal),
    pseudoScienceFact: pick(pools.facts, seed, SALT.fact),
    generatedAt: date,
    crisis,
  };
}

/**
 * Günün renk/ses/nefes üçlüsünü **tekrarsız** seçer.
 *
 * Rastgele seçim (karma → mod) bir yılda kaçınılmaz olarak çakışır: 365
 * çekilişte, 480 elemanlı bir havuzda bile doğum günü paradoksu yüzünden
 * yüzlerce tekrar olur. Bunun yerine üçlü, havuz büyüklüğü kadar bir
 * halkada sabit adımlarla dolaşılıyor: adım havuzla aralarında asal
 * olduğu için dizi bütün kombinasyonları gezmeden başa dönmüyor.
 * Havuz 365'ten büyük olduğu sürece bir yıl boyunca aynı üçlü iki kez
 * gelmiyor — hedefler de birbirinden farklı bir noktadan başlıyor.
 */
function dailyTriple(
  goal: string,
  date: string,
  pools: FormulaPools
): { color: number; sound: number; breath: number; word: number } {
  const C = pools.colors.length;
  const S = pools.sounds.length;
  const B = pools.breaths.length;
  const W = pools.words.length;
  const total = C * S * B;

  const day = dayNumber(date);
  const goalOffset = fnv1a(goal) % total;
  const index = (((day * coprimeStep(total) + goalOffset) % total) + total) % total;

  // Karışık tabanlı çözme: index → (renk, ses, nefes)
  const color = index % C;
  const sound = Math.floor(index / C) % S;
  const breath = Math.floor(index / (C * S)) % B;

  // Kelime kendi halkasında döner; üçlüyle aynı ritmi tutmasın diye ayrı.
  const wordIndex = (day * coprimeStep(W) + (fnv1a(`${goal}|word`) % W)) % W;

  return { color, sound, breath, word: ((wordIndex % W) + W) % W };
}

/**
 * Günün formülü. Aynı gün + aynı hedef + aynı havuz her zaman aynı
 * formülü verir, farklı gün farklı formül üretir.
 *
 * `date` yalnızca geçmiş bir günün formülünü yeniden kurmak için
 * (arşiv ekranı) veriliyor; normal kullanımda bugünün tarihi kullanılır.
 *
 * `pools` verilmezse temel havuz kullanılır — böylece havuz bilmeyen
 * çağrı yerleri (arşivdeki eski kayıt onarımı gibi) çalışmaya devam eder.
 */
export function generateDailyFormula(
  goal: string,
  date: string = todayISO(),
  pools: FormulaPools = BASIC_POOLS
): Formula {
  const seed = seedFor(date, goal);
  const idx = dailyTriple(goal, date, pools);
  const base = buildFormula(seed, goal, date, pools);
  return {
    ...base,
    color: { ...pools.colors[idx.color] },
    sound: { ...pools.sounds[idx.sound] },
    breath: { ...pools.breaths[idx.breath] },
    word: pools.words[idx.word],
  };
}

/**
 * Kriz modu formülü — her çağrıda farklı. Günün formülünün yerine
 * geçmez, yalnızca o an için üretilir.
 */
export function generateCrisisFormula(
  goal: string = 'anxiety',
  pools: FormulaPools = BASIC_POOLS
): Formula {
  const now = Date.now();
  const formula = buildFormula(now, goal, todayISO(), pools, true);
  return { ...formula, name: `Kriz #${now % 100}` };
}

/**
 * Kör test: günün "sahte ritüel" günü olup olmadığını belirler.
 *
 * Tarihe bağlı deterministik bir karar; yaklaşık 3 günde 1 sahte gün
 * çıkar. Kullanıcı hangi günün sahte olduğunu ritüel bitene kadar
 * bilmez — karşılaştırmanın anlamlı olması için gereken tek şey bu.
 */
export function isShamDay(date: string): boolean {
  const seed = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return seed % 3 === 0;
}

/** Doz çarpanını formüldeki sürelere uygular. */
export function applyDose(formula: Formula, dose: number): Formula {
  if (dose <= 1) return { ...formula, dose: 1 };
  return {
    ...formula,
    dose,
    color: { ...formula.color, duration: formula.color.duration * dose },
    sound: { ...formula.sound, duration: formula.sound.duration * dose },
    breath: { ...formula.breath, rounds: formula.breath.rounds * dose },
  };
}

/** Bir sonraki uydurma bulgu — adım geçişlerinde döndürmek için. */
export function rotateFact(
  seed: number,
  offset: number,
  pools: FormulaPools = BASIC_POOLS
): string {
  const base = hash(seed, SALT.fact);
  return pools.facts[(base + offset) % pools.facts.length];
}

/** Hedefe göre bulgu havuzu; tanınmayan hedefte odak havuzuna düşer. */
function factsForGoal(pool: Record<Goal, string[]>, goal: string): string[] {
  return pool[goal as Goal] ?? pool.focus;
}

/**
 * O anki adımın içeriğiyle uyuşan bulgu.
 *
 * Ses adımında çalan sesin, nefes adımında uygulanan desenin bulgusu
 * gösterilir; renk ve kelime adımlarında eylemin kendisine dair bir
 * bulgu seed'e göre seçilir. Sahte ritüelde (kör test) gösterilecek bir
 * içerik olmadığından genel havuza düşülür.
 */
export function factForStep(
  formula: Formula,
  step: StepKind,
  offset = 0,
  pools: FormulaPools = BASIC_POOLS
): string {
  const seed = seedFor(formula.generatedAt, formula.goal);
  if (formula.sham) return rotateFact(seed, offset, pools);

  switch (step) {
    case 'sound':
      return SOUND_FACTS[formula.sound.type] ?? rotateFact(seed, offset, pools);
    case 'breath':
      return BREATH_FACTS[formula.breath.pattern] ?? rotateFact(seed, offset, pools);
    case 'color':
      return pick(factsForGoal(COLOR_FACTS, formula.goal), seed, SALT.fact);
    case 'word':
    default:
      return pick(factsForGoal(WORD_FACTS, formula.goal), seed, SALT.fact);
  }
}

/* ------------------------------------------------------------------ */
/* Nefes desenleri                                                     */
/* ------------------------------------------------------------------ */

export type BreathAction = 'inhale' | 'hold' | 'exhale' | 'pause';

export interface BreathPhase {
  label: string;
  seconds: number;
  action: BreathAction;
}

export function breathPhases(pattern: BreathId): BreathPhase[] {
  switch (pattern) {
    case '4-7-8':
      return [
        { label: 'Nefes Al', seconds: 4, action: 'inhale' },
        { label: 'Tut', seconds: 7, action: 'hold' },
        { label: 'Nefes Ver', seconds: 8, action: 'exhale' },
      ];
    case 'box_breathing':
      return [
        { label: 'Nefes Al', seconds: 4, action: 'inhale' },
        { label: 'Tut', seconds: 4, action: 'hold' },
        { label: 'Nefes Ver', seconds: 4, action: 'exhale' },
        { label: 'Bekle', seconds: 4, action: 'pause' },
      ];
    case '4-4-4':
      return [
        { label: 'Nefes Al', seconds: 4, action: 'inhale' },
        { label: 'Nefes Ver', seconds: 4, action: 'exhale' },
        { label: 'Bekle', seconds: 4, action: 'pause' },
      ];
    case 'coherent_5s':
      return [
        { label: 'Nefes Al', seconds: 5, action: 'inhale' },
        { label: 'Nefes Ver', seconds: 5, action: 'exhale' },
      ];
    case 'extended_exhale':
      // Verişi alıştan uzun tutmak ritüelin ölçülebilir tek etkeni.
      return [
        { label: 'Nefes Al', seconds: 4, action: 'inhale' },
        { label: 'Uzun Ver', seconds: 8, action: 'exhale' },
      ];
    case 'resonant_6s':
      return [
        { label: 'Nefes Al', seconds: 6, action: 'inhale' },
        { label: 'Nefes Ver', seconds: 6, action: 'exhale' },
      ];
    case 'triangle_369':
      return [
        { label: 'Nefes Al', seconds: 3, action: 'inhale' },
        { label: 'Tut', seconds: 6, action: 'hold' },
        { label: 'Nefes Ver', seconds: 9, action: 'exhale' },
      ];
    case 'wave_5_3_7':
      return [
        { label: 'Nefes Al', seconds: 5, action: 'inhale' },
        { label: 'Tut', seconds: 3, action: 'hold' },
        { label: 'Nefes Ver', seconds: 7, action: 'exhale' },
        { label: 'Bekle', seconds: 2, action: 'pause' },
      ];
    case 'physiological_sigh':
    default:
      return [
        { label: 'Kısa Al', seconds: 2, action: 'inhale' },
        { label: 'Bir Kez Daha Al', seconds: 1, action: 'inhale' },
        { label: 'Uzun Ver', seconds: 6, action: 'exhale' },
      ];
  }
}

/** Tek turun toplam süresi (saniye). */
export function breathRoundSeconds(pattern: BreathId): number {
  return breathPhases(pattern).reduce((a, p) => a + p.seconds, 0);
}

/** Nefes adımının toplam süresi (saniye). */
export function breathTotalSeconds(formula: Formula): number {
  return breathRoundSeconds(formula.breath.pattern) * formula.breath.rounds;
}

/** Bir adımın saniye cinsinden süresi. */
export function stepSeconds(formula: Formula, step: StepKind): number {
  switch (step) {
    case 'color':
      return formula.color.duration;
    case 'sound':
      return formula.sound.duration;
    case 'breath':
      return breathTotalSeconds(formula);
    case 'word':
    default:
      return 12;
  }
}

/** Formülün tahmini toplam süresi (saniye). */
export function formulaTotalSeconds(formula: Formula): number {
  return formula.stepOrder.reduce((a, s) => a + stepSeconds(formula, s), 0);
}

export const STEP_LABELS: Record<StepKind, string> = {
  color: 'Renk',
  sound: 'Ses',
  breath: 'Nefes',
  word: 'Kelime',
};

export const STEP_ICONS: Record<StepKind, string> = {
  color: '🎨',
  sound: '🎧',
  breath: '🌬️',
  word: '🔤',
};

/** Her ekranda görünen şeffaflık cümleleri. */
export const TRANSPARENCY_LINES = [
  '⚗️ Plasebo etkisi aktif — Harvard çalışması: %62 iyileşme',
  '⚗️ Bu adımın bilinen bir fizyolojik etkisi yok. Yine de sayılıyor.',
  '⚗️ Açık etiketli plasebo: ne olduğunu bilmen etkiyi bozmuyor.',
  '⚗️ Hiçbir şey yapmıyoruz. Beraber yapıyoruz.',
];
