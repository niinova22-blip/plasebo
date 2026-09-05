import { NativeModule, requireOptionalNativeModule } from 'expo';

/**
 * Modelin neden kullanılamadığı.
 *
 * `unsupported`: bu iOS sürümü ya da bu cihaz modeli desteklemiyor.
 * `unavailable`: destekleniyor ama şu an hazır değil (Apple Intelligence
 * kapalı ya da model henüz inmemiş). Daha ince bir ayrım, Apple'ın
 * `UnavailableReason` durum adlarına bağlı olurdu; o bağımlılık bilerek
 * kurulmuyor (bkz. `OnDeviceLLMModule.swift`).
 */
export type LLMUnavailableReason = 'unsupported' | 'unavailable';

declare class OnDeviceLLMModule extends NativeModule<{}> {
  isAvailable(): boolean;
  unavailableReason(): LLMUnavailableReason | null;
  /**
   * Kısa bir metin üretir. Ağ kullanılmaz; her şey cihazda çalışır.
   * Model yoksa ya da üretim başarısızsa hata fırlatır — çağıran taraf
   * her zaman elle yazılmış bir yedek metne düşer.
   */
  generate(instructions: string, prompt: string, maxTokens: number): Promise<string>;
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
export default requireOptionalNativeModule<OnDeviceLLMModule>('OnDeviceLLM');
