/**
 * Renk yardımcıları.
 *
 * Formül renkleri havuzda tek bir hex olarak duruyor; neon görünüm için
 * aynı renkten türetilmiş açık/koyu/saydam varyantlar gerekiyor. Bunlar
 * çalışma anında hesaplanır, palete yeni sabit eklenmez — havuza yarın
 * bir renk daha girdiğinde neon katmanları kendiliğinden doğru çıksın diye.
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parse(hex: string): Rgb {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.slice(0, 6);
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function toHex({ r, g, b }: Rgb): string {
  const part = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** İki rengi karıştırır. `t` = 0 → a, 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const x = parse(a);
  const y = parse(b);
  return toHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t,
  });
}

/** Rengi beyaza doğru çeker — neon çekirdeğin sıcak ortası için. */
export function lighten(hex: string, t: number): string {
  return mix(hex, '#FFFFFF', t);
}

/** Rengi siyaha doğru çeker. */
export function darken(hex: string, t: number): string {
  return mix(hex, '#000000', t);
}

/**
 * Renge alfa ekler (#RRGGBBAA). React Native 8 haneli hex'i her iki
 * platformda da destekliyor, `rgba()` string'i kurmaya gerek yok.
 */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  return `${hex.slice(0, 7)}${Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
