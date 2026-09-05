import ExpoModulesCore
import WidgetKit

/**
 * Widget köprüsü.
 *
 * Uygulama ile widget iki ayrı süreç: aynı dosya sistemine bakmıyorlar.
 * Aralarındaki tek paylaşım noktası App Group. Uygulama günün özetini
 * buraya yazıyor, widget da yalnızca onu okuyor — formül mantığı
 * JavaScript tarafında tek kopya hâlinde kalıyor (Android widget'ında da
 * aynı yaklaşım kullanılıyor, bkz. plugins/widget/PlaseboWidget.kt).
 */
public class WidgetBridgeModule: Module {
  /** App Group kimliği — eklentideki entitlement ile birebir aynı olmalı. */
  private static let suiteName = "group.com.plasebo.app"
  private static let key = "widgetSnapshot"

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    /**
     * Özeti paylaşılan alana yazar ve widget'ın yenilenmesini ister.
     * Hata durumunda sessizce false döner: widget bir kolaylık, uygulamanın
     * çalışmasının koşulu değil.
     */
    Function("writeSnapshot") { (json: String) -> Bool in
      guard let defaults = UserDefaults(suiteName: WidgetBridgeModule.suiteName) else {
        return false
      }
      defaults.set(json, forKey: WidgetBridgeModule.key)
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
      return true
    }
  }
}
