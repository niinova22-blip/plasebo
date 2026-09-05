import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class WidgetBridgeModule extends NativeModule<{}> {
  /** Günün özetini App Group'a yazar ve widget'ı yeniler. */
  writeSnapshot(json: string): boolean;
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
export default requireOptionalNativeModule<WidgetBridgeModule>('WidgetBridge');
