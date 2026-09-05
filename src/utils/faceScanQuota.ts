/**
 * Ücretsiz kademedeki günlük yüz taraması hakkı.
 *
 * NEDEN SAYAÇ VAR
 *
 * Yüz taraması Plus'ın öne çıkan özelliği, ama tamamen kilitlenmiyor:
 * ücretsiz kullanıcı günde bir kez ölçebiliyor. Görmediği bir özelliğe
 * kimse para vermez; bir kez ölçen kullanıcı ise "önce/sonra farkını
 * kendim tahmin etmek yerine ölçtürmek" fikrini yaşamış oluyor. Sınır
 * `FREE_LIMITS.faceScansPerDay` içinde, sayısı burada değil orada.
 *
 * NEDEN AYRI DOSYA
 *
 * Sayacın kendisi saf: `consumeFrom` ve `remainingFrom` depolamaya
 * dokunmuyor, yalnız kayıt ile bugünün tarihinden sonuç üretiyor. Böylece
 * gün dönümü, bozuk kayıt ve sınır aşımı davranışları bir derleme
 * harcamadan sınanabiliyor (`src/__tests__/logic.test.ts`).
 *
 * NEDEN TAKVİM GÜNÜ
 *
 * Sınır "son 24 saat" değil takvim günü: kullanıcı sabah ölçtüyse ertesi
 * sabah yine ölçebilmeli, saat başına bakan bir pencere ise hakkı gün
 * içinde rastgele bir ana kaydırıp anlaşılmaz hâle getirirdi. Ritüelin
 * kendisi de günlük, ölçüm de aynı ritme oturuyor.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@plasebo/face-scan-quota';

export interface FaceScanQuota {
  /** Yerel takvim günü, `YYYY-AA-GG`. */
  day: string;
  /** O gün yapılan ölçüm sayısı. */
  count: number;
}

/** Yerel gün anahtarı. `Date` üzerinden, çünkü sınır kullanıcının günü. */
export function quotaDayOf(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/**
 * Kayıttan bugünün sayacını çıkarır.
 *
 * Gün değiştiyse sayaç sıfırdan başlıyor; kayıt yoksa ya da bozuksa da
 * öyle. Bozuk kayıt kullanıcıyı hakkından etmemeli — sayaç bir kolaylık,
 * bir lisans denetimi değil.
 */
export function normalizeQuota(raw: unknown, day: string): FaceScanQuota {
  if (!raw || typeof raw !== 'object') return { day, count: 0 };
  const parsed = raw as Partial<FaceScanQuota>;
  if (parsed.day !== day) return { day, count: 0 };
  const count = typeof parsed.count === 'number' && parsed.count > 0 ? Math.floor(parsed.count) : 0;
  return { day, count };
}

/** Kalan hak. `perDay` sonsuzsa (Plus) sonsuz döner. */
export function remainingFrom(quota: FaceScanQuota, perDay: number): number {
  if (!Number.isFinite(perDay)) return Number.POSITIVE_INFINITY;
  return Math.max(0, perDay - quota.count);
}

/** Bir hak harcandıktan sonraki sayaç. Saf: çağıran tarafı yazar. */
export function consumeFrom(quota: FaceScanQuota): FaceScanQuota {
  return { day: quota.day, count: quota.count + 1 };
}

async function read(now: Date = new Date()): Promise<FaceScanQuota> {
  const day = quotaDayOf(now);
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return normalizeQuota(raw ? JSON.parse(raw) : null, day);
  } catch {
    return { day, count: 0 };
  }
}

/**
 * Bugün kaç ölçüm hakkı kaldı?
 *
 * `perDay` doğrudan `limits.faceScansPerDay` — Plus'ta sonsuz, ücretsiz
 * kademede 1. Sınırın sayısını bu dosya bilmiyor, yalnız uyguluyor.
 */
export async function remainingFaceScans(perDay: number): Promise<number> {
  if (!Number.isFinite(perDay)) return Number.POSITIVE_INFINITY;
  return remainingFrom(await read(), perDay);
}

/**
 * Bir ölçüm hakkı harcar.
 *
 * Ölçüm **başarıyla tamamlandığında** çağrılıyor, kamera açılırken değil:
 * yüz bulunamayan ya da vazgeçilen bir deneme hak yakmamalı. Aynı hata
 * reklam sayacında da vardı ve orada da düzeltildi.
 */
export async function consumeFaceScan(): Promise<void> {
  try {
    const current = await read();
    await AsyncStorage.setItem(KEY, JSON.stringify(consumeFrom(current)));
  } catch {
    // Yazılamazsa ölçüm yine de yapıldı; sessiz geçiyoruz. Sayacın
    // kaybolması kullanıcıya fazladan hak verir, eksik değil.
  }
}

/** Hesap silinirken çağrılıyor. */
export async function resetFaceScanQuota(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // yoksay
  }
}
