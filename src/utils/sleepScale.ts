/**
 * Uyku verisinin yorumlanması — saf kısım.
 *
 * `health.ts`'ten ayrı duruyor, çünkü orası HealthKit köprüsünü ve
 * `react-native`'i içe aktarıyor; bu dosya ise hiçbir şeye bağlı değil.
 * Ayrım yalnızca test için değil: "kaç saat uyku az sayılır" sorusu bir
 * ürün kararı, "veriyi cihazdan nasıl okurum" ise bir altyapı ayrıntısı.
 *
 * Eşikler bilerek geniş — bunlar bir teşhis değil, reçetenin tonunu
 * belirleyen kaba bir bağlam.
 */

/** Bu sürenin altındaki uyku "az uyku" sayılıyor (dakika). */
export const SHORT_SLEEP_MINUTES = 6 * 60;
/** Bu sürenin üstü "iyi uyku". */
export const GOOD_SLEEP_MINUTES = 7.5 * 60;

export type SleepVerdict = 'short' | 'ok' | 'good';

export function sleepVerdict(minutes: number): SleepVerdict {
  if (minutes < SHORT_SLEEP_MINUTES) return 'short';
  if (minutes < GOOD_SLEEP_MINUTES) return 'ok';
  return 'good';
}

/** "7 saat 25 dakika" biçimi için parçalar. */
export function splitSleep(minutes: number): { hours: number; minutes: number } {
  const total = Math.round(minutes);
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/**
 * Sağlık verisinden reçeteye geçen tek karar: az uyunmuşsa ritüele
 * fazladan bir sakinleştirme turu ekleniyor ve reçete metninde nedeni
 * yazıyor. Bundan fazlası (nabız, HRV) yalnızca anlatımda kullanılıyor —
 * bir sağlık iddiası kurmadan.
 *
 * Veri yoksa `false`: eksik veri, akışı hiçbir yönde değiştirmemeli.
 */
export function sleepShiftsToCalm(snapshot: { sleepMinutes?: number | null } | null): boolean {
  const minutes = snapshot?.sleepMinutes;
  return minutes != null && sleepVerdict(minutes) === 'short';
}
