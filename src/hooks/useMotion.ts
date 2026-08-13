import { useReducedMotion } from 'react-native-reanimated';

export interface Motion {
  /** Cihazda "Hareketi Azalt" açıksa true — animasyonlar kapatılır. */
  reduced: boolean;
  /** Süreyi geçer: hareket azaltılmışsa 0 döner (anında son duruma atlar). */
  ms: (duration: number) => number;
}

/**
 * Tüm animasyonlu bileşenlerin ortak giriş noktası. Erişilebilirlik
 * ayarı açıkken animasyonlar tamamen devre dışı kalır; bileşenler yine
 * de son (görünür) durumlarına ayarlanır, hiçbir şey kaybolmaz.
 */
export function useMotion(): Motion {
  const reduced = useReducedMotion();
  return {
    reduced,
    ms: (duration: number) => (reduced ? 0 : duration),
  };
}
