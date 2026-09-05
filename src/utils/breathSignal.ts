/**
 * Nefes adımı sırasında toplanan mikrofon genlik (dB) örneklerinden bir
 * "düzenlilik" skoru çıkarır.
 *
 * Model yok, eğitim yok: genlik zarfındaki tepe noktaları (nefes verme
 * anları, sesin en yüksek olduğu yer) bulunup aralarındaki sürelerin ne
 * kadar tutarlı olduğuna bakılıyor. Gerçek bir duygu ya da stres teşhisi
 * değil — puanın yanına konan, "bu nefes ritmi ne kadar
 * düzenliydi" sorusuna bir yanıt.
 *
 * Tasarım notu (önemli): ilk sürüm eşik olarak **global ortalamayı**
 * kullanıyordu ve bu ölçülebilir biçimde bozuktu — simülasyonda mutlak
 * sessizlik bile %71 "düzenlilik" üretiyordu, çünkü sessiz tabandaki
 * mikro gürültü ortalamayı sürekli geçip onlarca sahte tepe yaratıyordu.
 * Bu sürüm üç kapı ekliyor:
 *   1. Dinamik aralık kapısı — sinyal düzse (sessizlik/sabit gürültü) hiç
 *      skor üretilmez.
 *   2. Yüzdelik tabanlı eşik + yumuşatma — mikro gürültü tepe sayılmaz.
 *   3. Beklenen döngüyle eşleşme — uygulama nefes ritmini kendisi dayattığı
 *      için ölçülen döngü ona yakın değilse (gürültü, konuşma, müzik)
 *      sonuç reddedilir.
 * Simülasyonda 12 senaryonun 11'i doğru sınıflandı; kalan tek durum
 * (duyulamayacak kadar zayıf nefes) saf gürültüyle aynı dinamik aralığa
 * sahip, yani ayrılması bilgi kuramsal olarak mümkün değil — orada sayı
 * uydurmak yerine "sinyal yok" deniyor.
 */

export interface MeteringSample {
  /** Kayıt başladıktan sonra geçen milisaniye. */
  t: number;
  /** dB cinsinden genlik (genelde negatif; 0'a yakın = yüksek ses). */
  db: number;
}

/** Zarfı yumuşatma penceresi (örnek sayısı; 200ms örneklemede ~600ms). */
const SMOOTH_WINDOW = 3;
/** Anlamlı bir ölçüm için gereken en kısa kayıt süresi. */
const MIN_DURATION_MS = 12000;
/** p90-p10 farkı bunun altındaysa ortada nefes sinyali yok demektir. */
const MIN_RANGE_DB = 3.5;
/** Eşik, dinamik aralığın bu oranında (p10 + ratio × aralık). */
const THRESHOLD_RATIO = 0.55;
/** İki tepe arasındaki en küçük boşluk, beklenen döngünün bu oranı kadar. */
const GAP_RATIO = 0.55;
/** Ölçülen döngü / beklenen döngü bu aralıkta değilse sonuç güvenilmez. */
const CYCLE_TOLERANCE_LO = 0.6;
const CYCLE_TOLERANCE_HI = 1.5;
/**
 * Bulunan tepe sayısı, beklenen nefes sayısının bu katından fazlaysa
 * ortada nefes değil gürültü var demektir.
 *
 * Bu kapı ölçülerek eklendi: `GAP_RATIO` tek başına yoğun gürültüde
 * *yapay bir düzenlilik* imal ediyordu — tepeler zorunlu asgari boşluğa
 * sıkışıp neredeyse eşit aralıklı çıkıyor ve %94 gibi sahte bir skor
 * üretiyordu. 40 tohumlu simülasyonda bu kapıyla birlikte dört gürültü
 * senaryosunun (sessizlik, düşük/yüksek gürültü, konuşma-müzik) tamamı
 * %100 elendi; duyulur nefes senaryoları ise %100 geçmeye devam etti.
 */
const MAX_PEAKS_PER_CYCLE = 1.6;
/**
 * Tempo taramasının en küçük tepe boşluğu.
 *
 * İnsanın alabileceği en hızlı nefes bile bundan seyrek; daha küçük bir
 * değer tek bir nefesin zarfındaki dalgalanmayı iki nefes sayardı.
 */
const RATE_MIN_GAP_MS = 1500;
/** Derinlik ölçeğinin üst ucu: bu dinamik aralık ve üstü "derin" sayılır. */
const DEPTH_FULL_DB = 18;

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * (p / 100);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Zarftaki tepeleri bulur.
 *
 * `minGap`, iki tepe arasında zorunlu en küçük boşluk: tek bir nefesin
 * zarfındaki dalgalanmanın iki ayrı tepe sayılmasını engelliyor.
 */
function detectPeaks(
  values: number[],
  samples: MeteringSample[],
  threshold: number,
  minGap: number
): number[] {
  const peaks: number[] = [];
  let inSegment = false;
  let bestT = 0;
  let bestValue = -Infinity;

  const closeSegment = () => {
    if (!peaks.length || bestT - peaks[peaks.length - 1] >= minGap) {
      peaks.push(bestT);
    }
    bestValue = -Infinity;
  };

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value > threshold) {
      inSegment = true;
      if (value > bestValue) {
        bestValue = value;
        bestT = samples[i].t;
      }
    } else if (inSegment) {
      inSegment = false;
      closeSegment();
    }
  }
  if (inSegment) closeSegment();
  return peaks;
}

/** Aralıkların medyanı — tek bir sapan aralık ortalamayı bozuyordu. */
function medianInterval(peaks: number[]): number | null {
  if (peaks.length < 2) return null;
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1]);
  const sorted = [...intervals].sort((a, b) => a - b);
  return percentile(sorted, 50);
}

/** Kayan ortalama — tek örneklik gürültü sıçramalarını siler. */
function smooth(values: number[], window: number): number[] {
  if (window <= 1) return values;
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const lo = Math.max(0, i - half);
    const hi = Math.min(values.length, i + half + 1);
    let sum = 0;
    for (let j = lo; j < hi; j++) sum += values[j];
    return sum / (hi - lo);
  });
}

/**
 * 0-1 arası düzenlilik skoru üretir (1 = ritme birebir uymuş). Sinyal
 * yoksa, çok kısaysa ya da ölçülen ritim beklenenle uyuşmuyorsa `null`
 * döner — uygulama o zaman sahte bir sayı göstermek yerine nedenini yazar.
 *
 * @param expectedCycleMs Formülün dayattığı tek nefes turunun süresi (ms).
 */
function analyze(
  samples: MeteringSample[],
  expectedCycleMs: number
): BreathAnalysis | null {
  if (samples.length < 20) return null;
  if (samples[samples.length - 1].t - samples[0].t < MIN_DURATION_MS) return null;
  if (!(expectedCycleMs > 0)) return null;

  const values = smooth(
    samples.map((s) => s.db),
    SMOOTH_WINDOW
  );
  const sorted = [...values].sort((a, b) => a - b);
  const p10 = percentile(sorted, 10);
  const p90 = percentile(sorted, 90);
  const dynamicRange = p90 - p10;
  if (dynamicRange < MIN_RANGE_DB) return null;

  const threshold = p10 + THRESHOLD_RATIO * dynamicRange;
  const minGap = Math.max(1500, GAP_RATIO * expectedCycleMs);

  const peaks = detectPeaks(values, samples, threshold, minGap);
  if (peaks.length < 3) return null;

  // Gürültü kapısı: beklenenden çok daha fazla tepe varsa bu nefes değil.
  const duration = samples[samples.length - 1].t - samples[0].t;
  const expectedPeaks = duration / expectedCycleMs;
  if (expectedPeaks > 0 && peaks.length / expectedPeaks > MAX_PEAKS_PER_CYCLE) {
    return null;
  }

  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1]);

  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  const median = percentile(sortedIntervals, 50);
  const ratio = median / expectedCycleMs;
  if (ratio < CYCLE_TOLERANCE_LO || ratio > CYCLE_TOLERANCE_HI) return null;

  const mean = intervals.reduce((a, v) => a + v, 0) / intervals.length;
  if (mean <= 0) return null;
  const variance =
    intervals.reduce((a, v) => a + (v - mean) ** 2, 0) / intervals.length;
  const coeffOfVariation = Math.sqrt(variance) / mean;

  /*
   * Tempo, **ayrı** bir tepe taramasından geliyor.
   *
   * Yukarıdaki tarama `minGap`'i beklenen döngüden türetiyor (uygulamanın
   * dayattığı ritim); bu, düzenlilik için doğru ama tempo için değil.
   * Kullanıcı yönergeden çok daha hızlı nefes aldığında o boşluk gerçek
   * tepeleri eziyor ve dakikadaki nefes sayısı olduğundan küçük çıkıyordu
   * — ölçülen 20 yerine 7 yazılıyordu. Tempo taraması bu yüzden yalnızca
   * mutlak alt sınırı (tek bir nefesin zarfını bölmeyecek kadar) kullanıyor.
   */
  const rateMedian = medianInterval(detectPeaks(values, samples, threshold, RATE_MIN_GAP_MS));

  return {
    regularity: Math.max(0, Math.min(1, 1 - coeffOfVariation)),
    // Dakikadaki nefes sayısı: medyan aralıktan türetiliyor. Tepe sayısını
    // doğrudan süreye bölmek, kayıt başındaki/sonundaki yarım döngüler
    // yüzünden sistematik olarak düşük çıkıyordu.
    breathsPerMinute: Math.round((60000 / (rateMedian ?? median)) * 10) / 10,
    // Derinlik: zarfın dinamik aralığı. Duyulur bir nefes ~4-18 dB
    // aralık üretiyor; bu pencere 0-1'e serilip kırpılıyor.
    depth: Math.max(0, Math.min(1, (dynamicRange - MIN_RANGE_DB) / (DEPTH_FULL_DB - MIN_RANGE_DB))),
  };
}

/**
 * Nefes adımının bütün ölçütleri. `regularity` dışındakiler yalnızca
 * anlatım için: bir teşhis değil, "bu ritim neye benziyordu" kaydı.
 */
export interface BreathAnalysis {
  /** 0-1 düzenlilik (1 = ritme birebir uymuş). */
  regularity: number;
  /** Dakikada kaç nefes — yavaş nefes (< 8) sakinleşmenin bilinen işareti. */
  breathsPerMinute: number;
  /** 0-1 derinlik: zarfın dinamik aralığından türetilen kaba bir ölçü. */
  depth: number;
}

/**
 * Aynı kayıttan çıkan bütün ölçütler. Yeni bir izin ya da yeni bir sensör
 * gerektirmiyor — mevcut dB örnekleri zaten toplanıyordu, önceki sürüm
 * bunların yalnızca düzenlilik kısmını kullanıp gerisini atıyordu.
 */
export function breathMetricsFrom(
  samples: MeteringSample[],
  expectedCycleMs: number
): BreathAnalysis | null {
  return analyze(samples, expectedCycleMs);
}

/** Geriye dönük uyum: yalnızca düzenlilik skoru. */
export function breathRegularityFrom(
  samples: MeteringSample[],
  expectedCycleMs: number
): number | null {
  return analyze(samples, expectedCycleMs)?.regularity ?? null;
}
