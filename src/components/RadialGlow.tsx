import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { lighten } from '../utils/color';

interface Props {
  size: number;
  color: string;
  /** Merkezdeki opaklık (0-1). */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  /** Benzersiz gradient id — aynı ekranda birden fazla ışıma varsa gerekli. */
  id?: string;
  /**
   * `soft` (varsayılan): geniş, yumuşak yayılım — kart köşelerindeki ışıma.
   * `bloom`: merkezde beyaza yakın sıcak nokta, sonra hızlı düşüş — neon
   * bir ışığın etrafındaki parlama. Neon çekirdek için bu gerekiyor,
   * çünkü yumuşak yayılım uzaktan mat bir daire gibi okunuyor.
   */
  falloff?: 'soft' | 'bloom';
}

/**
 * Radial gradient ışıma. React Native'de conic/radial CSS olmadığı için
 * SVG ile çiziliyor; genelde absolute konumlandırılıp kartın köşesine konur.
 */
export default function RadialGlow({
  size,
  color,
  intensity = 0.35,
  style,
  id = 'glow',
  falloff = 'soft',
}: Props) {
  const bloom = falloff === 'bloom';
  return (
    <Svg width={size} height={size} style={style} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {/* RadialGradient yalnızca dizi children kabul ediyor, fragment değil. */}
          {bloom
            ? [
                // Sıcak çekirdek: rengin kendisinden bir tık açık.
                <Stop key="0" offset="0%" stopColor={lighten(color, 0.5)} stopOpacity={intensity} />,
                <Stop key="1" offset="22%" stopColor={color} stopOpacity={intensity * 0.9} />,
                <Stop key="2" offset="48%" stopColor={color} stopOpacity={intensity * 0.42} />,
                <Stop key="3" offset="74%" stopColor={color} stopOpacity={intensity * 0.14} />,
                <Stop key="4" offset="100%" stopColor={color} stopOpacity={0} />,
              ]
            : [
                <Stop key="0" offset="0%" stopColor={color} stopOpacity={intensity} />,
                <Stop key="1" offset="60%" stopColor={color} stopOpacity={intensity * 0.35} />,
                <Stop key="2" offset="100%" stopColor={color} stopOpacity={0} />,
              ]}
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}
