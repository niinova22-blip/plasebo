/**
 * Dil desteği.
 *
 * Uygulamanın kaynak dili Türkçe: metinler kodun içinde Türkçe yazılır ve
 * `t()` onları çeviri sözlüğünden geçirir. Sözlüğün anahtarı Türkçe
 * metnin kendisidir (`src/i18n/en.ts`).
 *
 * Neden anahtar yerine metnin kendisi? İki nedeni var. Birincisi, kodu
 * okuyan biri ekranda ne yazdığını doğrudan görüyor — `t('home.greeting')`
 * gibi bir anahtar ne olduğunu göstermiyor. İkincisi, bir çeviri eksik
 * kalırsa uygulama boş anahtar ya da hata göstermek yerine Türkçesini
 * gösteriyor; yani eksik çeviri uygulamayı bozmuyor.
 *
 * Değişken geçirmek için `{ad}` biçimi kullanılır:
 *
 *   t('Merhaba {ad}', { ad: 'Rahile' })
 */
import { getLocales } from 'expo-localization';
import { EN } from './en';

export type Lang = 'tr' | 'en';

/** Ayarlardaki seçim: cihazı izle ya da bir dile sabitle. */
export type LanguagePref = 'system' | Lang;

/** Cihazın dili — Türkçe değilse İngilizceye düşülür. */
export function deviceLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode;
    return code === 'tr' ? 'tr' : 'en';
  } catch {
    // Yerelleştirme modülü okunamazsa uygulamanın kaynak diliyle devam.
    return 'tr';
  }
}

export function resolveLang(pref: LanguagePref): Lang {
  return pref === 'system' ? deviceLang() : pref;
}

type Vars = Record<string, string | number>;

function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? `${vars[key]}` : match
  );
}

/**
 * Metni verilen dile çevirir. Çeviri yoksa Türkçesi olduğu gibi döner —
 * bu bilinçli bir davranış, eksik çeviri ekranı boş bırakmaz.
 */
export function translate(text: string, lang: Lang, vars?: Vars): string {
  if (lang === 'tr') return fill(text, vars);
  return fill(EN[text] ?? text, vars);
}

export type TranslateFn = (text: string, vars?: Vars) => string;

/** Bir dile bağlanmış çeviri fonksiyonu üretir. */
export function translatorFor(lang: Lang): TranslateFn {
  return (text, vars) => translate(text, lang, vars);
}

/**
 * Formül adları "Uyku #33" biçiminde üretiliyor: yalnızca baştaki kelime
 * çevrilebilir, numara olduğu gibi kalır.
 */
export function translateFormulaName(name: string, t: TranslateFn): string {
  const at = name.lastIndexOf(' #');
  if (at < 0) return t(name);
  return `${t(name.slice(0, at))}${name.slice(at)}`;
}

export const LANGUAGE_LABELS: Record<LanguagePref, string> = {
  system: 'Sistem',
  tr: 'Türkçe',
  en: 'English',
};
