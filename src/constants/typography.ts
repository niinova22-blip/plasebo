import { Platform } from 'react-native';

/**
 * Font aileleri tek yerden yönetiliyor: fontlar App.tsx içinde
 * useFonts ile yüklendiği için isimler birebir paket sabitleriyle aynı.
 */
export const fonts = {
  serif: 'DMSerifDisplay_400Regular',
  serifItalic: 'DMSerifDisplay_400Regular_Italic',
  /**
   * Ritüelde akan hikâye metni.
   *
   * Başlık yüzleriyle aynı olamaz: başlık bir kez okunur, hikâye iki
   * dakika boyunca takip edilir. EB Garamond'un italik kesimi kitap
   * sayfasının tonunu taşıyor ve ince yerleri küçük puntoda kaybolmuyor.
   */
  story: 'EBGaramond_500Medium_Italic',
  storyLight: 'EBGaramond_400Regular_Italic',
  sans: 'SpaceGrotesk_400Regular',
  sansMedium: 'SpaceGrotesk_500Medium',
  sansBold: 'SpaceGrotesk_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

/**
 * Punto ölçeği.
 *
 * Bu ölçek tanımlanmadan önce uygulamada 25 farklı punto vardı ve
 * bunların 195 kullanımı 10-11-12-13 bandına sıkışmıştı. Dört punto,
 * telefonda gözle ayırt edilemeyecek kadar birbirine yakın — yani dört
 * ayrı basamak gibi davranıyor ama üç ayrı hiyerarşi kurmuyorlardı.
 * Sonuç, hiyerarşisi olmayan ama tutarlı da olmayan bir tipografiydi.
 *
 * Aşağıdaki sekiz basamağın her biri bir öncekinden gözle görülür
 * biçimde ayrı. Yeni bir metin yazarken "burası biraz daha küçük olsun"
 * diye ara değer uydurmak yerine, o metnin hangi basamağa ait olduğuna
 * karar ver.
 *
 * `hero` yalnızca sayılar için: puan, geri sayım, süre. Harf için
 * kullanılmıyor.
 */
export const type = {
  /** 11 — büyük harf bölüm etiketleri, ipuçları, dipnotlar. */
  micro: 11,
  /** 12 — ikincil satırlar, kart altı açıklamaları. */
  small: 12,
  /** 13 — gövde metni, liste satırı. */
  body: 13,
  /** 15 — öne çıkan gövde, düğme yazısı. */
  bodyLg: 15,
  /** 17 — kart başlığı. */
  title: 17,
  /** 20 — ekran içi bölüm başlığı. */
  headline: 20,
  /** 26 — ekran başlığı (serif). */
  display: 26,
  /** 34 — karşılama başlığı (serif). */
  displayLg: 34,
  /** 48 — yalnızca sayılar: puan, geri sayım. */
  hero: 48,
} as const;
