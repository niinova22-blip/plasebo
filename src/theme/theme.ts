import { colors } from '../constants/colors';

/**
 * Üç tema: Şafak (varsayılan), Sis, Açık.
 *
 * Önceden bir de `system` vardı ve varsayılan oydu; uygulama cihaz açık
 * temadaysa açık başlıyordu. Sistem seçeneği kaldırıldı, varsayılan önce
 * koyuya sonra Sis'e taşındı.
 *
 * "Koyu" 2026 Eylül'ünde kaldırıldı ve yerine Şafak geldi. Koyu, Sis'in
 * sertleştirilmiş hâliydi — saf siyah zemin, saf beyaz metin — ve Sis
 * dururken kendine ait bir işi kalmamıştı: iki koyu tema arasındaki fark
 * yalnızca sertlikti. Şafak ise eksik olanı veriyor, aydınlık ve sıcak
 * bir seçenek. Varsayılan da o.
 *
 * Ritüel ekranları (RitualScreen, ScoreAfterScreen) temadan bağımsız
 * olarak koyu kalmaya devam ediyor; ritüelin kendisi karanlıkta yapılan
 * bir şey. Tema yalnızca ritüel dışındaki ekranları değiştiriyor.
 */
export type ThemeMode = 'dawn' | 'mist' | 'light';
export type ThemeName = 'dawn' | 'mist' | 'light';

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

/**
 * Şafak — varsayılan tema.
 *
 * Sis'in aydınlık karşılığı: aynı beş rollük kuruluş (zemin, yüzey,
 * metin, ikincil, vurgu), yalnızca değerler sıcak tarafa alınmış. Açık
 * temadan farkı da bu sıcaklık — Açık nötr gri-bej bir kâğıt, Şafak
 * krem ve kayısı.
 *
 * Koyu vurgu kartı burada siyah değil, yumuşak bir alacakaranlık moru:
 * aydınlık bir zeminde saf siyah bir kart delik gibi duruyordu.
 */
export const dawnTheme: ThemeColors = {
  bg: colors.safakBg,
  surface: colors.safakSurface,
  inkCard: colors.safakCard,
  onInk: colors.safakOnCard,
  onInkSub: colors.safakOnCardSub,
  text: colors.safakText,
  sub: colors.safakSub,
  faint: colors.safakFaint,
  border: colors.safakBorder,
  accentSoft: colors.safakAccentSoft,
  tabBar: 'rgba(251,244,238,0.95)',
  blurTint: 'light',
  statusBar: 'dark',
  ...accents,
};

/**
 * Sis — koyu tema.
 *
 * "Koyu"dan farkı sertliğin alınması: zemin saf siyaha yakın değil,
 * metin saf beyaz değil, kenarlıklar zeminden yalnızca bir tık ayrı.
 * Kaldırılan koyu tema bir kontrast temasıydı; Sis bir okuma teması.
 *
 * Beş renkten kuruluyor (zemin, yüzey, metin, ikincil, vurgu); aşağıdaki
 * bütün token'lar bu beşinin ya kendisi ya tonu.
 */
export const mistTheme: ThemeColors = {
  bg: colors.ink,
  surface: colors.sisSurface,
  inkCard: colors.sisCard,
  onInk: colors.sisText,
  onInkSub: colors.sisSub,
  text: colors.sisText,
  sub: colors.sisSub,
  faint: colors.sisFaint,
  border: colors.sisBorder,
  accentSoft: colors.sisAccentSoft,
  tabBar: 'rgba(21,22,26,0.95)',
  blurTint: 'dark',
  statusBar: 'light',
  ...accents,
};

export function themeFor(name: ThemeName): ThemeColors {
  if (name === 'mist') return mistTheme;
  return name === 'light' ? lightTheme : dawnTheme;
}
