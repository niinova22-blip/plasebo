import ExpoModulesCore
import HealthKit

/**
 * Sağlık verisi köprüsü — yalnızca **okuma**.
 *
 * Uygulama iki şey soruyor: dün gece ne kadar uyunmuş ve dinlenme nabzı
 * ne. İkisi de reçetenin kişiselleştirilmesi için; hiçbir şey yazılmıyor,
 * hiçbir şey cihazdan çıkmıyor.
 *
 * Tasarım notu: izin durumu HealthKit'te **okuma için sorulamaz**. Apple,
 * "kullanıcı bu veriyi paylaşmayı reddetti mi" bilgisini bilerek
 * gizliyor (aksi hâlde uygulama, verinin varlığını izin durumundan çıkarıp
 * kullanıcıyı profillerdi). Bu yüzden burada "izin var mı" diye bir
 * fonksiyon yok: sorgu çalıştırılır, sonuç boş gelirse "veri yok" denir.
 * Kullanıcıya da tam olarak bu söylenmeli — "izin vermedin" değil.
 */
public struct SleepSummary: Record {
  public init() {}

  /** Dün gece toplam uyku süresi (dakika). Veri yoksa nil. */
  @Field var minutes: Double? = nil
  /** Uykunun bittiği an (ms cinsinden epoch) — "dün gece" doğrulaması için. */
  @Field var endedAt: Double? = nil
}

public struct HealthSnapshot: Record {
  public init() {}

  @Field var available: Bool = false
  @Field var sleepMinutes: Double? = nil
  @Field var sleepEndedAt: Double? = nil
  /** Dinlenme nabzı (atım/dakika) — son 7 günün en yenisi. */
  @Field var restingHeartRate: Double? = nil
  /** Kalp atış hızı değişkenliği, SDNN (ms) — son 7 günün en yenisi. */
  @Field var hrv: Double? = nil
}

public class HealthBridgeModule: Module {
  private let store = HKHealthStore()

  /** Okunacak türler — yazma kümesi bilerek boş. */
  private var readTypes: Set<HKObjectType> {
    var types = Set<HKObjectType>()
    if let sleep = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) {
      types.insert(sleep)
    }
    if let resting = HKObjectType.quantityType(forIdentifier: .restingHeartRate) {
      types.insert(resting)
    }
    if let hrv = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) {
      types.insert(hrv)
    }
    return types
  }

  public func definition() -> ModuleDefinition {
    Name("HealthBridge")

    /** Cihazda HealthKit var mı (iPad ve simülatörde olmayabilir). */
    Function("isAvailable") { () -> Bool in
      HKHealthStore.isHealthDataAvailable()
    }

    /**
     * İzin diyaloğunu açar. Dönen değer "izin verildi" demek değil,
     * yalnızca "diyalog gösterildi ve hata çıkmadı" demek (bkz. yukarıdaki
     * tasarım notu). Gerçek yanıt, veri gelip gelmediğinden anlaşılıyor.
     */
    AsyncFunction("requestAuthorization") { (promise: Promise) in
      guard HKHealthStore.isHealthDataAvailable() else {
        promise.resolve(false)
        return
      }
      // `toShare` bilerek nil: uygulama Sağlık'a hiçbir şey yazmıyor.
      // Boş küme yerine nil, Apple'ın belgelediği "paylaşılacak tür yok"
      // biçimi ve tür çıkarımında hiçbir belirsizlik bırakmıyor.
      self.store.requestAuthorization(toShare: nil, read: self.readTypes) { granted, error in
        if let error = error {
          promise.reject("E_HEALTH_AUTH", error.localizedDescription)
          return
        }
        promise.resolve(granted)
      }
    }

    /**
     * Dün geceki uyku + son dinlenme nabzı + son HRV.
     *
     * Üç sorgu paralel çalışıp tek bir sonuçta birleşiyor. Herhangi biri
     * boş dönerse o alan nil kalıyor — kısmi veri de kullanılabilir.
     */
    AsyncFunction("readSnapshot") { (promise: Promise) in
      guard HKHealthStore.isHealthDataAvailable() else {
        var empty = HealthSnapshot()
        empty.available = false
        promise.resolve(empty)
        return
      }

      /*
       * Üç sorgu paralel çalışıyor ve tamamlanma blokları HealthKit'in
       * kendi arka plan kuyruklarında dönüyor. Sonuçlar bu yüzden ortak
       * bir yapıya doğrudan yazılmıyor — üç ayrı iş parçacığının aynı
       * struct'ın alanlarına yazması bir veri yarışıdır. Değerler önce
       * seri bir kuyrukta biriktiriliyor, yapı ancak hepsi bittikten
       * sonra tek bir yerde kuruluyor.
       */
      let group = DispatchGroup()
      let lock = DispatchQueue(label: "app.plasebo.health.snapshot")

      var sleepMinutes: Double?
      var sleepEndedAt: Double?
      var restingHeartRate: Double?
      var hrv: Double?

      group.enter()
      self.readLastNightSleep { minutes, endedAt in
        lock.async {
          sleepMinutes = minutes
          sleepEndedAt = endedAt
          group.leave()
        }
      }

      group.enter()
      self.readLatestQuantity(.restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute())) { value in
        lock.async {
          restingHeartRate = value
          group.leave()
        }
      }

      group.enter()
      self.readLatestQuantity(.heartRateVariabilitySDNN, unit: HKUnit.secondUnit(with: .milli)) { value in
        lock.async {
          hrv = value
          group.leave()
        }
      }

      group.notify(queue: .main) {
        lock.async {
          var snapshot = HealthSnapshot()
          snapshot.available = true
          snapshot.sleepMinutes = sleepMinutes
          snapshot.sleepEndedAt = sleepEndedAt
          snapshot.restingHeartRate = restingHeartRate
          snapshot.hrv = hrv
          promise.resolve(snapshot)
        }
      }
    }
  }

  /**
   * "Dün gece" penceresi: dünkü öğleden bugün öğlene kadar. Uyku, gece
   * yarısını kestiği için takvim gününe göre toplamak yanlış sonuç
   * veriyor; öğleden öğlene pencere uykuyu tek parça hâlinde yakalıyor.
   */
  private func readLastNightSleep(completion: @escaping (Double?, Double?) -> Void) {
    guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
      completion(nil, nil)
      return
    }

    let calendar = Calendar.current
    let now = Date()
    guard
      let noonToday = calendar.date(bySettingHour: 12, minute: 0, second: 0, of: now),
      let noonYesterday = calendar.date(byAdding: .day, value: -1, to: noonToday)
    else {
      completion(nil, nil)
      return
    }
    // Öğleden önce açıldıysa pencere dünkü öğle → şimdi olmalı.
    let end = now < noonToday ? now : noonToday
    let start = noonYesterday

    let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
    let query = HKSampleQuery(
      sampleType: sleepType,
      predicate: predicate,
      limit: HKObjectQueryNoLimit,
      sortDescriptors: nil
    ) { _, samples, _ in
      guard let samples = samples as? [HKCategorySample], !samples.isEmpty else {
        completion(nil, nil)
        return
      }

      // Yalnızca gerçekten uyunmuş aralıklar: "yatakta" (inBed) sayılmıyor,
      // yoksa kitap okunan yarım saat de uyku olarak yazılırdı.
      let asleep = samples.filter { HealthBridgeModule.isAsleep($0) }
      guard !asleep.isEmpty else {
        completion(nil, nil)
        return
      }

      // Farklı kaynaklar (saat + telefon) aynı aralığı iki kez yazabiliyor;
      // aralıklar birleştirilmezse uyku süresi iki katı çıkıyordu.
      let merged = HealthBridgeModule.mergeIntervals(
        asleep.map { ($0.startDate, $0.endDate) }
      )
      let seconds = merged.reduce(0.0) { $0 + $1.1.timeIntervalSince($1.0) }
      let latestEnd = merged.map { $0.1 }.max()

      completion(
        seconds / 60.0,
        latestEnd.map { $0.timeIntervalSince1970 * 1000 }
      )
    }
    store.execute(query)
  }

  /** Uyku evresi değerleri iOS sürümleri arasında değişti; hepsi kapsanıyor. */
  private static func isAsleep(_ sample: HKCategorySample) -> Bool {
    if #available(iOS 16.0, *) {
      return [
        HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue,
        HKCategoryValueSleepAnalysis.asleepCore.rawValue,
        HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
        HKCategoryValueSleepAnalysis.asleepREM.rawValue,
      ].contains(sample.value)
    }
    return sample.value == HKCategoryValueSleepAnalysis.asleep.rawValue
  }

  /** Çakışan aralıkları birleştirir — çift kaynaktan gelen tekrarları siler. */
  private static func mergeIntervals(_ input: [(Date, Date)]) -> [(Date, Date)] {
    let sorted = input.sorted { $0.0 < $1.0 }
    var out: [(Date, Date)] = []
    for interval in sorted {
      if let last = out.last, interval.0 <= last.1 {
        out[out.count - 1] = (last.0, max(last.1, interval.1))
      } else {
        out.append(interval)
      }
    }
    return out
  }

  /** Son 7 gündeki en yeni tek örnek — yoksa nil. */
  private func readLatestQuantity(
    _ identifier: HKQuantityTypeIdentifier,
    unit: HKUnit,
    completion: @escaping (Double?) -> Void
  ) {
    guard let type = HKObjectType.quantityType(forIdentifier: identifier) else {
      completion(nil)
      return
    }
    let start = Calendar.current.date(byAdding: .day, value: -7, to: Date())
    let predicate = HKQuery.predicateForSamples(withStart: start, end: Date(), options: .strictEndDate)
    let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

    let query = HKSampleQuery(
      sampleType: type,
      predicate: predicate,
      limit: 1,
      sortDescriptors: [sort]
    ) { _, samples, _ in
      guard let sample = (samples as? [HKQuantitySample])?.first else {
        completion(nil)
        return
      }
      completion(sample.quantity.doubleValue(for: unit))
    }
    store.execute(query)
  }
}
