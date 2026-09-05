export type EmotionLabel = 'Anger' | 'Disgust' | 'Fear' | 'Happiness' | 'Neutral' | 'Sadness' | 'Surprise';

export interface FaceMoodResult {
  faceFound: boolean;
  /** Etiket → olasılık (0-1). Yüz bulunamadıysa veya model çalışamadıysa null. */
  emotions: Record<EmotionLabel, number> | null;
}
