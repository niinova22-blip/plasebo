import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnDeviceLLMModule, {
  type LLMUnavailableReason,
} from '../../modules/on-device-llm/src/OnDeviceLLMModule';
import type { Goal } from '../types';

/**
 * Cihaz üstü dil modelinin uygulama tarafındaki yüzü.
 *
 * Kural bir tane ve hiç esnetilmiyor: **model bir süs.** Üretilen her
 * metnin elle yazılmış bir karşılığı var ve model yoksa, yavaşsa ya da
 * saçmalarsa o karşılığa düşülüyor. Bu yüzden buradaki her fonksiyon
 * `null` dönebiliyor ve çağıran taraf `??` ile yedeğini veriyor.
 *
 * Neden sunucu yok: model Apple'ın sistem modeli, cihazda çalışıyor.
 * Ağ trafiği, API anahtarı, kullanım ücreti ve gizlilik sözünün
 * bozulması — dördü birden ortadan kalkıyor.
 */

const SUPPORTED = Platform.OS === 'ios';

/** Üretim bu süreyi aşarsa beklenmiyor; kullanıcı ekranda kalmasın. */
const TIMEOUT_MS = 6000;

/** Modelin rolü — her çağrıda aynı, böylece ton tutarlı kalıyor. */
const INSTRUCTIONS = [
  'Sen "Plasebo" adlı uygulamanın metin yazarısın.',
  'Uygulama açık açık plasebo etkisi üzerine kurulu: kullanıcı da bunun plasebo olduğunu biliyor.',
  'Türkçe yaz. Kısa, sakin, iddiasız cümleler kur.',
  'Asla tıbbi teşhis koyma, tedavi önerme, "iyileşeceksin" deme.',
  'Abartılı övgü, emoji ve ünlem kullanma.',
  'Sana verilen sayıların dışında bir veri uydurma.',
].join(' ');

export function localAIAvailable(): boolean {
  if (!SUPPORTED) return false;
  try {
    return OnDeviceLLMModule?.isAvailable() ?? false;
  } catch {
    return false;
  }
}

export function localAIUnavailableReason(): LLMUnavailableReason | null {
  if (!SUPPORTED) return 'unsupported';
  try {
    return OnDeviceLLMModule?.unavailableReason() ?? 'unsupported';
  } catch {
    return 'unsupported';
  }
}

/** Zaman aşımı olan tek üretim çağrısı. Hata da zaman aşımı da `null`. */
async function generate(prompt: string, maxTokens: number): Promise<string | null> {
  if (!localAIAvailable()) return null;
  try {
    const text = await Promise.race([
      OnDeviceLLMModule?.generate(INSTRUCTIONS, prompt, maxTokens) ?? Promise.resolve(null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
    ]);
    const clean = text?.trim();
    return clean ? clean : null;
  } catch {
    return null;
  }
}

/* ==================================================================
 * Önbellek
 * ------------------------------------------------------------------
 * Aynı gün aynı metni tekrar tekrar üretmek hem yavaş hem gereksiz.
 * Anahtar, metni belirleyen her şeyi içeriyor; girdi değişmediği sürece
 * kullanıcı hep aynı cümleyi görüyor — reçete metninin ekran her
 * yenilendiğinde başkalaşması güven kırıcı olurdu.
 * ================================================================== */

const CACHE_PREFIX = '@plasebo/ai/';

async function cached(key: string, produce: () => Promise<string | null>): Promise<string | null> {
  const storageKey = CACHE_PREFIX + key;
  try {
    const hit = await AsyncStorage.getItem(storageKey);
    if (hit) return hit;
  } catch {
    // Önbellek okunamazsa üretmeye devam.
  }
  const produced = await produce();
  if (produced) {
    try {
      await AsyncStorage.setItem(storageKey, produced);
    } catch {
      // yoksay
    }
  }
  return produced;
}

/* ==================================================================
 * Reçete metni
 * ================================================================== */

export interface PrescriptionContext {
  /** Kullanıcının şikayeti — seçtiği ya da yazdığı hâliyle. */
  complaint: string;
  /** Bugünün formülünün hedefi. */
  goal: Goal;
  /** Kameradan çıkan ruh hali skoru (1-10, yüksek = kötü), varsa. */
  faceMoodScore?: number;
  /** Dün geceki uyku (dakika), varsa. */
  sleepMinutes?: number;
  /** Kaç günlük seri. */
  streak: number;
  /** Önbellek anahtarını gün bazında ayırmak için. */
  date: string;
}

const GOAL_WORDS: Record<Goal, string> = {
  focus: 'odaklanma',
  sleep: 'uyku',
  anxiety: 'sakinleşme',
  energy: 'enerji',
};

/**
 * Reçete kartının üstündeki bir cümlelik gerekçe.
 *
 * Eskiden bu satır yedi sabit cümleden biriydi ve aynı ruh hali iki gün
 * üst üste çıkınca birebir aynı metin görünüyordu. Model varsa cümle
 * bugünün bütün bağlamını (şikayet, yüz, uyku, seri) kullanıyor.
 */
export async function prescriptionLine(
  context: PrescriptionContext
): Promise<string | null> {
  const key = [
    'presc',
    context.date,
    context.goal,
    context.faceMoodScore ?? '-',
    context.sleepMinutes != null ? Math.round(context.sleepMinutes / 30) : '-',
    context.complaint.slice(0, 40),
  ].join('|');

  return cached(key, () =>
    generate(
      [
        'Bugünkü ritüel için tek cümlelik bir gerekçe yaz.',
        `Şikayet: "${context.complaint}".`,
        `Ritüelin hedefi: ${GOAL_WORDS[context.goal]}.`,
        context.faceMoodScore != null
          ? `Kameradan ölçülen gerginlik: 10 üzerinden ${context.faceMoodScore}.`
          : '',
        context.sleepMinutes != null
          ? `Dün gece uyku: ${Math.round(context.sleepMinutes / 60)} saat.`
          : '',
        context.streak > 1 ? `Üst üste ${context.streak} gündür yapıyor.` : '',
        'Tek cümle yaz, en fazla 25 kelime. Tırnak işareti kullanma.',
      ]
        .filter(Boolean)
        .join('\n'),
      80
    )
  );
}

/* ==================================================================
 * Serbest metin → hedef sınıflandırma
 * ================================================================== */

const GOAL_FROM_WORD: Record<string, Goal> = {
  odak: 'focus',
  odaklanma: 'focus',
  focus: 'focus',
  uyku: 'sleep',
  sleep: 'sleep',
  kaygi: 'anxiety',
  kaygı: 'anxiety',
  sakinlesme: 'anxiety',
  sakinleşme: 'anxiety',
  anxiety: 'anxiety',
  enerji: 'energy',
  energy: 'energy',
};

/**
 * Kullanıcının kendi cümlesini dört hedeften birine bağlar.
 *
 * Yedeği `goalForText`'in anahtar kelime eşlemesi; o da eşleşmezse
 * metnin karmasından bir hedef seçiyor, yani "Sabahları kalkmakta
 * zorlanıyorum" gibi anahtar kelime içermeyen cümleler rastgele bir
 * hedefe düşüyordu. Model varsa cümlenin anlamına bakıyor.
 *
 * Modelin yanıtı beklenen dört kelimeden biri değilse yok sayılıyor —
 * serbest metni olduğu gibi hedefe çevirmek, modele uygulamanın akışını
 * belirletmek olurdu.
 */
export async function classifyComplaintGoal(text: string): Promise<Goal | null> {
  const clean = text.trim();
  if (clean.length < 3) return null;

  const answer = await cached(`goal|${clean.slice(0, 60)}`, () =>
    generate(
      [
        'Aşağıdaki cümleyi şu dört kategoriden birine ata.',
        'Kategoriler: odak, uyku, kaygı, enerji.',
        'Yalnızca kategori adını yaz, başka hiçbir şey yazma.',
        `Cümle: "${clean}"`,
      ].join('\n'),
      10
    )
  );
  if (!answer) return null;

  const word = answer.toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü]/g, '');
  return GOAL_FROM_WORD[word] ?? null;
}

/* ==================================================================
 * Haftalık desen özeti
 * ================================================================== */

export interface WeeklyContext {
  /** Kaç seans üzerinden konuşuluyor. */
  sessions: number;
  /** Ortalama etki (önce − sonra), tek ondalık. */
  averageEffect: number;
  /** En iyi geçen gün adı ve yüzdesi, varsa. */
  bestDay?: { day: string; percent: number };
  /** Beyan ile ölçüm arasındaki ortalama fark, varsa. */

  /** Az uyunan günlerin ortalama etkisi ile diğerlerinin farkı, varsa. */
  sleepEffect?: { shortNights: number; otherNights: number };
  /** Önbellek anahtarı için — haftada bir yenilensin. */
  weekKey: string;
}

/**
 * İstatistik ekranındaki haftalık özet paragrafı.
 *
 * Sayıların hepsi burada hesaplanıp modele **veri olarak** veriliyor;
 * modelden istenen tek şey onları bir paragrafa dizmek. Yorumu modele
 * bırakmak, olmayan bir bulguyu cümleye çevirmesi demek olurdu.
 */
export async function weeklySummary(context: WeeklyContext): Promise<string | null> {
  const key = ['week', context.weekKey, context.sessions, context.averageEffect].join('|');

  return cached(key, () =>
    generate(
      [
        'Aşağıdaki verilerden en fazla üç cümlelik bir haftalık özet yaz.',
        'Yalnızca verilen sayıları kullan, yeni bir bulgu uydurma.',
        'Nedensellik iddia etme; "ilişkili görünüyor" gibi temkinli bir dil kullan.',
        `Seans sayısı: ${context.sessions}.`,
        `Ortalama etki (ritüel öncesi puan eksi sonrası): ${context.averageEffect}.`,
        context.bestDay
          ? `En iyi geçen gün: ${context.bestDay.day}, ortalamanın %${context.bestDay.percent} üstünde.`
          : '',
        context.sleepEffect
          ? `Az uyunan gecelerin ortalama etkisi ${context.sleepEffect.shortNights}, diğer gecelerin ${context.sleepEffect.otherNights}.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      160
    )
  );
}

/** Ayarlar'dan "yapay zekâ metinlerini sıfırla" için. */
export async function clearLocalAICache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    // yoksay
  }
}
