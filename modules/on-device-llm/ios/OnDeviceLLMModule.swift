import ExpoModulesCore

#if canImport(FoundationModels)
import FoundationModels
#endif

/**
 * Cihaz üstü dil modeli köprüsü.
 *
 * Apple'ın sistem diline gömülü modelini (Foundation Models, iOS 26+)
 * kullanır: ağ yok, sunucu yok, API anahtarı yok, ücret yok. Metin
 * cihazdan hiç çıkmıyor — uygulamanın "hepsi telefonunun içinde kalıyor"
 * sözü bu köprüde de bozulmuyor.
 *
 * Üç kat koruma var, çünkü bu API her cihazda bulunmuyor:
 *   1. `canImport(FoundationModels)` — eski Xcode ile de derlenebilsin.
 *   2. `#available(iOS 26.0, *)` — eski iOS'ta çağrılmasın.
 *   3. `SystemLanguageModel.availability` — cihaz destekliyor ama model
 *      indirilmemiş / Apple Intelligence kapalı olabilir.
 * Üçünden biri bile tutmazsa `isAvailable` false döner ve uygulama
 * elle yazılmış sabit metinlerle devam eder.
 */
public class OnDeviceLLMModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OnDeviceLLM")

    /** Model şu anda kullanılabilir mi. */
    Function("isAvailable") { () -> Bool in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        // `==` yerine desen eşleme: `Availability` ilişkili değer taşıyan
        // bir enum ve Equatable uyumu API'nin garantisi değil. Desen
        // eşleme her hâlükârda derleniyor.
        if case .available = SystemLanguageModel.default.availability {
          return true
        }
        return false
      }
      #endif
      return false
    }

    /**
     * Neden kullanılamıyor.
     *
     * Bilerek kaba: "unsupported" (bu iOS ya da bu cihaz modeli
     * desteklemiyor) ve "unavailable" (destekleniyor ama şu an hazır
     * değil — Apple Intelligence kapalı ya da model henüz inmemiş).
     * Daha ince ayrım, `Availability.UnavailableReason` durumlarının
     * adlarına bağlı olurdu; derlenmeyen tek bir ad bütün derlemeyi
     * düşürdüğü için o bağımlılık bilerek kurulmuyor.
     */
    Function("unavailableReason") { () -> String? in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        if case .available = SystemLanguageModel.default.availability {
          return nil
        }
        return "unavailable"
      }
      #endif
      return "unsupported"
    }

    /**
     * Kısa bir metin üretir.
     *
     * `instructions` modelin rolünü, `prompt` ise o seferki isteği
     * taşıyor. Uzunluk ve sıcaklık ayarı bilerek verilmiyor: çıktının
     * kısa kalması istemin kendisinde söyleniyor ve `GenerationOptions`
     * yerine en sade çağrı kullanılıyor — doğrulayamadığım her ek
     * parametre etiketi, derlenmeme riski demek.
     *
     * `maxTokens` imzada duruyor ama şu an kullanılmıyor; JS tarafının
     * çağrısını bozmamak ve ileride bir sınır koyacak olursak imzayı
     * değiştirmemek için.
     */
    AsyncFunction("generate") { (instructions: String, prompt: String, maxTokens: Int, promise: Promise) in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        guard case .available = SystemLanguageModel.default.availability else {
          promise.reject("E_LLM_UNAVAILABLE", "Cihaz üstü model şu anda kullanılamıyor.")
          return
        }
        Task {
          do {
            _ = maxTokens
            /*
             * Not: Aşağıdaki iki çağrı düz `String` alıyor ve bu biçim,
             * EAS'in kullandığı SDK ile (iPhoneOS26.5) **gerçekten
             * derlendiği doğrulanmış** biçimdir: 31.08.2026 tarihli 21
             * numaralı derlemenin ürettiği ikilide `LanguageModelSession`
             * ve `SystemLanguageModel` sembolleri var, yani bu blok
             * `canImport` korumasından geçip derlenmiş.
             *
             * Apple'ın **güncel** belgeleri ise daha yeni bir SDK'yı
             * anlatıyor: orada `respond(to:)` yalnızca `Prompt` alıyor ve
             * `instructions:` bir `@InstructionsBuilder` kapanışı
             * istiyor. EAS o SDK'ya geçtiğinde bu iki satır derlenmez ve
             * kapanış biçimine çevrilmeleri gerekir:
             *
             *     let session = LanguageModelSession(instructions: { instructions })
             *     let response = try await session.respond { prompt }
             *
             * Şimdilik doğrulanmamış biçime geçilmiyor: derleme hakkı
             * sınırlı ve elde derlendiği kanıtlanmış bir biçim var.
             */
            let session = LanguageModelSession(instructions: instructions)
            let response = try await session.respond(to: prompt)
            promise.resolve(response.content)
          } catch {
            promise.reject("E_LLM_FAILED", error.localizedDescription)
          }
        }
        return
      }
      #endif
      promise.reject("E_LLM_UNAVAILABLE", "Bu iOS sürümünde cihaz üstü model yok.")
    }
  }
}
