/**
 * Cihazdaki sağlık verisinden okunan anlık görüntü.
 *
 * Bütün alanlar isteğe bağlı: kullanıcı izin vermemiş, veri hiç yazılmamış
 * ya da cihaz desteklemiyor olabilir. Uygulama hiçbirinin varlığına
 * bel bağlamıyor — hepsi eksikken de akış aynen çalışıyor.
 */
export interface HealthSnapshot {
  /** Cihazda HealthKit var mı. */
  available: boolean;
  /** Dün gece toplam uyku (dakika). */
  sleepMinutes?: number | null;
  /** Uykunun bittiği an (epoch ms). */
  sleepEndedAt?: number | null;
  /** Dinlenme nabzı (atım/dakika), son 7 günün en yenisi. */
  restingHeartRate?: number | null;
  /** Kalp atış hızı değişkenliği SDNN (ms), son 7 günün en yenisi. */
  hrv?: number | null;
}
