import { colors } from '../constants/colors';

/**
 * Tema seçimi yalnızca iki durumdan biri.
 *
 * Önceden bir de `system` vardı ve varsayılan oydu; uygulama cihaz açık
 * temadaysa açık başlıyordu. Plasebo'nun ritüel ekranları koyu zemin
 * üzerine kurulu (neon çekirdek, ışıma, parçacıklar), o yüzden varsayılan
 * koyuya sabitlendi ve sistem seçeneği kaldırıldı — kullanıcı iki temadan
 * birini açıkça seçiyor.
 */
export type ThemeMode = 'light' | 'dark';
export type ThemeName = 'light' | 'dark';

/**
 * Semantik renk token'ları.
 *
 * Palet değişmiyor — `constants/colors.ts` tek kaynak. Burada yalnızca
 * hangi rengin hangi rolü üstlendiği tanımlanıyor, böylece koyu tema
 * yeni renk uydurmadan mevcut paletle kuruluyor.
 */
export interface ThemeColors {
  /** Ekran arka planı. */
  bg: string;
  /** Kartlar, girdi alanları. */
  surface: string;
  /** Koyu vurgu kartı (formül kartı, skor kartı). */
  inkCard: string;
  /** Koyu kart üzerindeki başlık rengi. */
  onInk: string;
  /** Koyu kart üzerindeki ikincil metin. */
  onInkSub: string;
  /** Birincil metin. */
  text: string;
  /** İkincil metin. */
  sub: string;
  /** Soluk metin / ipucu. */
  faint: string;
  /** Kenarlıklar ve ayırıcılar. */
  border: string;
  /** Yumuşak vurgu zemini (seri çubuğu, içgörü kartı). */
  accentSoft: string;
  /** Tab bar zemini. */
  tabBar: string;
  /** Blur tonu. */
  blurTint: 'light' | 'dark';
  /** Durum çubuğu içeriği. */
  statusBar: 'light' | 'dark';

  // Vurgu renkleri her iki temada da aynı.
  pulse: string;
  glow: string;
  warn: string;
  white: string;
}

const accents = {
  pulse: colors.pulse,
  glow: colors.glow,
  warn: colors.warn,
  white: colors.white,
} as const;

export const lightTheme: ThemeColors = {
  bg: colors.ghost,
  surface: colors.white,
  inkCard: colors.ink,
  onInk: colors.white,
  onInkSub: colors.haze,
  text: colors.ink,
  sub: colors.sub,
  faint: colors.haze,
  border: colors.mist,
  accentSoft: colors.pulseSoft,
  tabBar: 'rgba(255,255,255,0.95)',
  blurTint: 'light',
  statusBar: 'dark',
  ...accents,
};

export const darkTheme: ThemeColors = {
  bg: colors.ink,
  // Koyu temada yüzeyler zeminden bir tık açık olsun diye ink üzerine
  // ghost'un düşük opaklıklı katmanı kullanılıyor.
  surface: '#191922',
  inkCard: '#12121A',
  onInk: colors.white,
  onInkSub: colors.haze,
  text: colors.ghost,
  sub: colors.haze,
  faint: '#6B6B7A',
  border: '#262632',
  accentSoft: '#211F3A',
  tabBar: 'rgba(14,14,18,0.95)',
  blurTint: 'dark',
  statusBar: 'light',
  ...accents,
};

export function themeFor(name: ThemeName): ThemeColors {
  return name === 'dark' ? darkTheme : lightTheme;
}
