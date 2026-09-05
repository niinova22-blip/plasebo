import type { EmotionLabel } from '../../modules/face-mood-detector/src/FaceMoodDetector.types';

export type Emotions = Record<EmotionLabel, number>;

/** Model etiketlerinin Türkçe karşılığı — ekranda gösterilecek isim. */
export const EMOTION_LABELS_TR: Record<EmotionLabel, string> = {
  Anger: 'Kızgın',
  Disgust: 'Tiksinmiş',
  Fear: 'Kaygılı',
  Happiness: 'Mutlu',
  Neutral: 'Nötr',
  Sadness: 'Üzgün',
  Surprise: 'Şaşkın',
};

/** Yüzde sırasına göre (en yüksekten en düşüğe) [etiket, olasılık] listesi. */
export function sortedEmotions(emotions: Emotions): [EmotionLabel, number][] {
  return (Object.entries(emotions) as [EmotionLabel, number][]).sort((a, b) => b[1] - a[1]);
}

/** En yüksek olasılıklı duygu. */
export function topEmotion(emotions: Emotions): EmotionLabel {
  return sortedEmotions(emotions)[0][0];
}

/**
 * Birden çok karenin duygu dağılımını tek bir dağılıma indirir.
 *
 * Neden ortalama değil medyan: FER/AffectNet sınıflandırması tek karede
 * gürültülü ve ara sıra tek bir kare tamamen sapıyor (göz kırpma, hareket
 * bulanıklığı, anlık bir mimik). Ortalama o tek kareden etkileniyor,
 * medyan etkilenmiyor.
 *
 * Medyan alındıktan sonra toplam 1 olmadığı için yeniden normalize
 * ediliyor — `scoreFromEmotions` olasılıkların toplamının 1 olduğunu
 * varsayıyor.
 */
export function mergeEmotions(frames: Emotions[]): Emotions | null {
  if (!frames.length) return null;
  if (frames.length === 1) return frames[0];

  const labels = Object.keys(frames[0]) as EmotionLabel[];
  const merged = {} as Emotions;
  let total = 0;

  for (const label of labels) {
    const values = frames.map((f) => f[label]).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    merged[label] = median;
    total += median;
  }

  if (total <= 0) return frames[0];
  for (const label of labels) merged[label] = merged[label] / total;
  return merged;
}

/**
 * Yedi duygu olasılığından uygulamanın ölçeğine (1-10, yüksek = kötü) bir
 * skor türetir. Anger/Disgust/Fear/Sadness "kötü" tarafta, Happiness "iyi"
 * tarafta sayılıyor; Neutral/Surprise ikisini de çekmiyor, ortalamayı
 * ortaya yaklaştırıyor.
 */
export function scoreFromEmotions(emotions: Emotions): number {
  const negative = emotions.Anger + emotions.Disgust + emotions.Fear + emotions.Sadness;
  const positive = emotions.Happiness;
  const balance = (negative - positive + 1) / 2; // 0..1
  const score = Math.round(1 + Math.max(0, Math.min(1, balance)) * 9);
  return Math.max(1, Math.min(10, score));
}

/**
 * Kameradan çıkan en olası duyguyu, `goalForText`'in anahtar kelime
 * eşlemesiyle bir hedefe bağlanacak doğal bir Türkçe cümleye çevirir.
 */
export function moodComplaintTextFor(emotions: Emotions): string {
  const top = topEmotion(emotions);
  switch (top) {
    case 'Happiness':
      return 'Yüzümden anlaşılan: enerjik ve keyifli görünüyorum';
    case 'Sadness':
      return 'Yüzümden anlaşılan: üzgün ve yorgun görünüyorum';
    case 'Anger':
    case 'Disgust':
      return 'Yüzümden anlaşılan: gergin ve huzursuz görünüyorum';
    case 'Fear':
      return 'Yüzümden anlaşılan: kaygılı ve gergin görünüyorum';
    case 'Surprise':
      return 'Yüzümden anlaşılan: sakin görünüyorum ama zihnim biraz dağınık';
    case 'Neutral':
    default:
      return 'Yüzümden anlaşılan: sakin görünüyorum ama zihnim biraz dağınık';
  }
}
