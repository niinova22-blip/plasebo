import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HealthBridgeModule from '../../modules/health-bridge/src/HealthBridgeModule';
import type { HealthSnapshot } from '../../modules/health-bridge/src/HealthBridge.types';

export type { HealthSnapshot };

/** Köprü şu an yalnızca iOS'ta var (HealthKit). */
export const HEALTH_SUPPORTED = Platform.OS === 'ios';

const ENABLED_KEY = '@plasebo/health-enabled';

/**
 * Sağlık verisi tamamen isteğe bağlı ve varsayılan olarak **kapalı**.
 *
 * Kullanıcı Ayarlar'dan açana kadar HealthKit'e hiç dokunulmuyor: izin
 * diyaloğunu uygulamanın ortasında kendiliğinden açmak, "neden benim uyku
 * verimi istiyor" sorusunu cevapsız bırakırdı. Tercih yerel olarak
 * saklanıyor; izin durumunun kendisi HealthKit'ten okunamıyor (Apple
 * okuma izinlerinin sonucunu bilerek gizler).
 */
export async function isHealthEnabled(): Promise<boolean> {
  if (!HEALTH_SUPPORTED) return false;
  try {
    return (await AsyncStorage.getItem(ENABLED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setHealthEnabled(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ENABLED_KEY, value ? '1' : '0');
  } catch {
    // yoksay — tercih bir kolaylık, akışın koşulu değil.
  }
}

/** Cihaz destekliyor mu (iPad/simülatörde HealthKit olmayabilir). */
export function healthAvailable(): boolean {
  if (!HEALTH_SUPPORTED) return false;
  try {
    return HealthBridgeModule?.isAvailable() ?? false;
  } catch {
    return false;
  }
}

export interface HealthConnection {
  /** İzin diyaloğu açılıp hatasız tamamlandı mı. */
  ok: boolean;
  /** Okumada gerçekten bir değer geldi mi. */
  hasData: boolean;
}

/**
 * İzin diyaloğunu açar ve ardından bir okuma dener.
 *
 * İki sonuç ayrı ayrı dönüyor, çünkü karıştırılmaları gerçek bir hataya
 * yol açtı: veri gelmemesi "izin verilmedi" sanılıp anahtar kendiliğinden
 * kapatılıyordu. Oysa Apple Watch'u olmayan ve uyku takibi yapmayan bir
 * kullanıcıda Sağlık'ta hiç uyku/nabız kaydı olmaz; izin verilmiş olsa
 * bile okuma boş döner. Tercih ile verinin varlığı bu yüzden ayrı iki
 * soru — anahtar tercihi gösteriyor, veri durumu ayrıca anlatılıyor.
 */
export async function connectHealth(): Promise<HealthConnection> {
  if (!healthAvailable()) return { ok: false, hasData: false };
  try {
    if (!HealthBridgeModule) return { ok: false, hasData: false };
    await HealthBridgeModule.requestAuthorization();
    const snapshot = await HealthBridgeModule.readSnapshot();
    return {
      ok: true,
      hasData: snapshot.sleepMinutes != null || snapshot.restingHeartRate != null,
    };
  } catch {
    return { ok: false, hasData: false };
  }
}

/**
 * Son okunan anlık görüntü.
 *
 * Seans kaydı, reçete ekranından üç ekran sonra yazılıyor. Veriyi bütün
 * o ekranlardan gezinme parametresi olarak taşımak, hiçbirinin
 * ilgilenmediği bir alanı dört imzaya birden eklemek olurdu; onun yerine
 * okunduğu yerde tutuluyor ve kayıt anında buradan alınıyor.
 */
let cached: HealthSnapshot | null = null;

export function getCachedHealthSnapshot(): HealthSnapshot | null {
  return cached;
}

/** Anlık görüntüyü okur; her türlü hata durumunda `null`. */
export async function readHealthSnapshot(): Promise<HealthSnapshot | null> {
  if (!healthAvailable()) return null;
  if (!(await isHealthEnabled())) {
    cached = null;
    return null;
  }
  try {
    if (!HealthBridgeModule) return null;
    const snapshot = await HealthBridgeModule.readSnapshot();
    cached = snapshot.available ? snapshot : null;
    return cached;
  } catch {
    return null;
  }
}

/* ==================================================================
 * Yorumlama
 * ------------------------------------------------------------------
 * Eşikler ve yorum `sleepScale.ts`'te duruyor: orası hiçbir yerel
 * modüle ya da `react-native`'e bağlı değil, dolayısıyla ayrıca
 * sınanabiliyor. Buradan yeniden dışa veriliyor ki çağıran ekranlar tek
 * bir yerden içe aktarmaya devam etsin.
 * ================================================================== */

export {
  GOOD_SLEEP_MINUTES,
  SHORT_SLEEP_MINUTES,
  sleepShiftsToCalm,
  sleepVerdict,
  splitSleep,
  type SleepVerdict,
} from './sleepScale';
