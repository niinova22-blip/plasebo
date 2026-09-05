import { NativeModule, requireOptionalNativeModule } from 'expo';
import type { HealthSnapshot } from './HealthBridge.types';

declare class HealthBridgeModule extends NativeModule<{}> {
  isAvailable(): boolean;
  /**
   * İzin diyaloğunu açar. Dönen `true`, "kullanıcı kabul etti" demek
   * değildir — HealthKit okuma izninin sonucunu bilerek açıklamaz. Gerçek
   * yanıt `readSnapshot` boş dönüp dönmediğinden anlaşılır.
   */
  requestAuthorization(): Promise<boolean>;
  readSnapshot(): Promise<HealthSnapshot>;
}


/**
 * Modül **isteğe bağlı** yükleniyor.
 *
 * Bu modülün yalnızca Apple tarafı var (bkz. `expo-module.config.json`).
 * `requireNativeModule` bulunmayan bir modülde hata fırlatıyor ve bu
 * dosya uygulama açılışında yüklendiği için Android'de uygulama daha ilk
 * karede çöküyordu. `requireOptionalNativeModule` yoksa `null` dönüyor;
 * çağıran taraflar zaten platform kontrolü yapıyor, artık tip sistemi de
 * bunu zorunlu kılıyor.
 */
export default requireOptionalNativeModule<HealthBridgeModule>('HealthBridge');
