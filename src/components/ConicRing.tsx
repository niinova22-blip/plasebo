import React, { useEffect, useMemo } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';

interface Props {
  size: number;
  thickness?: number;
  /** Tam tur süresi (ms). */
  durationMs?: number;
  segments?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const p = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x1, y1] = p(from);
  const [x2, y2] = p(to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/**
 * Dönen konik gradyan halka (pulse → glow → pulse).
 * React Native'de conic-gradient olmadığı için halka küçük yaylara
 * bölünüp her yay açısına göre renk interpolasyonu yapılıyor.
 */
export default function ConicRing({
  size,
  thickness = 10,
  durationMs = 8000,
  segments = 72,
}: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: durationMs, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(rotation);
  }, [durationMs, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const paths = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - thickness) / 2;
    const step = 360 / segments;

    return Array.from({ length: segments }, (_, i) => {
      const from = i * step;
      const to = from + step + 0.6; // dikişleri kapatmak için hafif bindirme
      const t = i / segments;
      // 0 → 0.5 arası pulse'tan glow'a, 0.5 → 1 arası geri pulse'a.
      const color = t < 0.5 ? mix(colors.pulse, colors.glow, t * 2) : mix(colors.glow, colors.pulse, (t - 0.5) * 2);
      return { d: arcPath(cx, cy, r, from, to), color };
    });
  }, [size, thickness, segments]);

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {paths.map((p, i) => (
          <Path
            key={i}
            d={p.d}
            stroke={p.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
