/**
 * Refleks (tepki süresi) ölçümünün istatistiği.
 *
 * Bu, uygulamanın tek **tamamen** objektif ölçümü: kamera ve mikrofonun
 * aksine bir model ya da sinyal işleme yorumu içermiyor, yalnızca iki
 * zaman damgası arasındaki fark. Yeni bir izin de gerektirmiyor.
 *
 * Ölçülen şey bir "iyilik hâli" değil, uyanıklık/dikkat toplama hızı.
 * Ritüel öncesi ve sonrası aynı testin karşılaştırılması, kişinin kendi
 * puanının yanına konabilecek bağımsız bir referans veriyor.
 */

/** Turda bu süreden hızlı bir dokunuş, tahmin sayılır — tur geçersiz. */
export const FALSE_START_MS = 120;
/** Bu süreden yavaş turlar dikkat dağılması sayılıp ölçüme katılmaz. */
export const TIMEOUT_MS = 3000;
/** Bir ölçümün geçerli sayılması için gereken en az tur sayısı. */
export const MIN_VALID_ROUNDS = 3;
/** Testin tur sayısı. */
export const TOTAL_ROUNDS = 5;

export interface ReactionResult {
  /** Turların medyan tepki süresi (ms). Ortalama değil: tek bir dalgınlık turu ortalamayı bozuyordu. */
  medianMs: number;
  /** 0-1 tutarlılık (1 = bütün turlar aynı hızda). */
  consistency: number;
  /** Ölçüme katılan geçerli tur sayısı. */
  rounds: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Geçerli turlardan sonucu çıkarır. Yeterli tur yoksa `null` döner —
 * iki turdan bir "refleks skoru" uydurmak, olmayan bir kesinlik iddiası
 * olurdu.
 */
export function reactionResultFrom(samplesMs: number[]): ReactionResult | null {
  const valid = samplesMs.filter((ms) => ms >= FALSE_START_MS && ms <= TIMEOUT_MS);
  if (valid.length < MIN_VALID_ROUNDS) return null;

  const med = median(valid);
  const mean = valid.reduce((a, v) => a + v, 0) / valid.length;
  const variance = valid.reduce((a, v) => a + (v - mean) ** 2, 0) / valid.length;
  const coeffOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;

  return {
    medianMs: Math.round(med),
    consistency: Math.max(0, Math.min(1, 1 - coeffOfVariation)),
    rounds: valid.length,
  };
}

/**
 * İki ölçüm arasındaki değişimi kullanıcıya okunacak bir cümleye çevirir.
 * Eşik bilerek yüksek: tepki süresi gün içinde kendiliğinden ±%10
 * oynuyor, bunun altındaki farkı "değişim" diye sunmak yanıltıcı olurdu.
 */
export const REACTION_MEANINGFUL_PERCENT = 10;

export function reactionChangePercent(beforeMs: number, afterMs: number): number {
  if (!(beforeMs > 0)) return 0;
  return Math.round(((beforeMs - afterMs) / beforeMs) * 100);
}
