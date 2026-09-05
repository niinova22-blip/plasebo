/**
 * Geliştirme derlemesinde ücretsiz kademeyi zorlama anahtarı.
 *
 * NEDEN GEREKLİ
 *
 * `PREMIUM_ENABLED` 1.4.0 ile açıldı, yani ücretsiz kademe sınırları
 * artık gerçekten uygulanıyor. Buna rağmen bu bayrak duruyor: Plus satın
 * almış bir geliştirici hesabında ücretsiz kademenin yolları — günlük
 * tarama hakkının bitmesi, elle puanlamaya düşme, nefes analizinin
 * kapalı olması, kilitli ayar satırları — yine denenemez hâle geliyor.
 * Bu bayrak o yolları satın alma yapmadan açıp kapatmayı sağlıyor.
 *
 * NASIL KULLANILIR
 *
 * Proje kökündeki `.env` dosyasına şunu ekle ve Metro'yu yeniden başlat:
 *
 *     EXPO_PUBLIC_FORCE_FREE_TIER=1
 *
 * Uygulama o andan itibaren ücretsiz kademe gibi davranır: günde bir yüz
 * taraması, nefes analizi kapalı, 24 saatlik döngü kilitli, seans sonunda
 * reklam. Plan ekranı da gezinme ağacına eklenir, yoksa kilitli satırlara
 * dokunulduğunda var olmayan bir ekrana gidilirdi.
 *
 * NEDEN GÜVENLİ
 *
 * `__DEV__` koşulu yüzünden yayın derlemesinde **her zaman** `false`.
 * TestFlight ve App Store derlemeleri `__DEV__` içermez, dolayısıyla
 * ortam değişkeni orada tanımlı kalsa bile hiçbir etkisi olmaz.
 *
 * Bayrak açıldığından beri `FORCE_FREE_TIER` ile gerçek ücretsiz kademe
 * arasındaki tek fark, birincisinin satın almayı hiç sormaması.
 */
export const FORCE_FREE_TIER =
  __DEV__ && process.env.EXPO_PUBLIC_FORCE_FREE_TIER === '1';
