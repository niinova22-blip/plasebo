import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Ekran boyutuna göre ölçekleme.
 *
 * Uygulamanın ölçüleri, yaklaşık 380×800 dp'lik orta boy bir telefona
 * göre yazıldı. Bunun altındaki ekranlarda — küçük telefonlar, ama asıl
 * önemlisi sistem "Ekran boyutu / Yazı tipi boyutu" ayarı büyütülmüş
 * cihazlar — sabit ölçüler olduğu gibi kalınca içerik ekrandan taşıyor,
 * uzun bir slaytta alttaki düğmeler görünür alanın dışında kalıyordu.
 *
 * Ölçek hem genişliğe hem yüksekliğe bakıyor: dar ama uzun bir ekranda
 * yatay taşma, geniş ama kısa bir ekranda dikey taşma oluyor; sınırlayıcı
 * olan hangisiyse o belirliyor.
 *
 * Alt sınır 0.78: bunun altında metin okunaksızlaşıyor ve dokunma
 * hedefleri erişilebilirlik için fazla küçülüyor. O noktadan sonrasını
 * ölçek değil, kaydırma çözüyor (bkz. OnboardingScreen'deki `Page`).
 * Üst sınır 1.06: büyük ekranlarda tasarım şişmesin, yalnızca nefes alsın.
 */
const BASE_WIDTH = 380;
const BASE_HEIGHT = 800;
const MIN_FACTOR = 0.78;
const MAX_FACTOR = 1.06;

export interface Responsive {
  /** Ölçeklenmiş değer (yuvarlanmış). */
  s: (value: number) => number;
  /** Ham çarpan — oransal hesap gerektiğinde. */
  factor: number;
  width: number;
  height: number;
  /** Kısa ekran mı? Boşlukları kısmak için. */
  compact: boolean;
}

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const raw = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
    const factor = Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, raw));
    return {
      s: (value: number) => Math.round(value * factor),
      factor,
      width,
      height,
      compact: height < BASE_HEIGHT,
    };
  }, [width, height]);
}
