import WidgetKit
import SwiftUI

/**
 * Plasebo widget'ı — ana ekran ve kilit ekranı.
 *
 * Kendi formül mantığı yok: uygulama her açılışında günün özetini
 * App Group'a yazıyor (bkz. modules/widget-bridge), widget da yalnızca
 * onu okuyor. Android tarafındaki widget da tam olarak aynı biçimde
 * çalışıyor; böylece formül motoru üç dilde üç kopya olarak yaşamıyor.
 *
 * Düzen, alışkanlık uygulamalarının (Streaks, Gentler Streak) kurduğu
 * dile yakın: ortada seri sayısı, çevresinde tamamlanma halkası. İlk
 * sürüm yalnızca bir emoji ve iki satır yazıydı; widget'a bakan kişi
 * "bugün yaptım mı" sorusunun cevabını göremiyordu — tek bakışta
 * okunan şey artık bu.
 */

private let suiteName = "group.com.plasebo.app"
private let snapshotKey = "widgetSnapshot"

/**
 * Uygulamanın kendi paleti — `src/constants/colors.ts` ile aynı iki renk.
 *
 * Değerler oradaki `pulse` (#6E88A8) ve `glow` (#A7BCD4). Palet
 * yumuşatıldığında burası elle güncellenmek zorunda: widget ayrı bir
 * hedef, uygulamanın JavaScript sabitlerini okuyamıyor.
 */
private let pulse = Color(red: 0.431, green: 0.533, blue: 0.659)
private let glow = Color(red: 0.655, green: 0.737, blue: 0.831)

struct PlaseboSnapshot: Decodable {
    var formula: String
    var state: String
    var streak: Int
    var streakLabel: String
    var doneToday: Bool
    var steps: String
    var last7: [Bool]
    var dayLabel: String
    var deltaLabel: String?

    /**
     * Anahtarlar elle yazılmak zorunda.
     *
     * Swift, `CodingKeys`i yalnızca `init(from:)`ı da kendisi ürettiğinde
     * sentezliyor. Aşağıdaki çözücü elle yazıldığı için sentez kapanıyor ve
     * enum burada olmazsa uzantı derlenmiyor.
     */
    private enum CodingKeys: String, CodingKey {
        case formula, state, streak, streakLabel, doneToday
        case steps, last7, dayLabel, deltaLabel
    }

    /**
     * Yeni alanlar isteğe bağlı okunuyor.
     *
     * Uygulama güncellenmeden widget güncellenebiliyor (kullanıcı
     * uygulamayı açana kadar App Group'ta eski biçimde bir özet duruyor).
     * Eksik alan bu yüzden bir hata değil, beklenen durum: eskisi
     * okunabildiği kadarıyla gösteriliyor, gerisi makul varsayılana
     * düşüyor.
     */
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        formula = (try? c.decode(String.self, forKey: .formula)) ?? "Plasebo"
        state = (try? c.decode(String.self, forKey: .state)) ?? ""
        streak = (try? c.decode(Int.self, forKey: .streak)) ?? 0
        streakLabel = (try? c.decode(String.self, forKey: .streakLabel)) ?? ""
        doneToday = (try? c.decode(Bool.self, forKey: .doneToday)) ?? false
        steps = (try? c.decode(String.self, forKey: .steps)) ?? ""
        last7 = (try? c.decode([Bool].self, forKey: .last7)) ?? []
        dayLabel = (try? c.decode(String.self, forKey: .dayLabel)) ?? "GÜN"
        deltaLabel = try? c.decode(String.self, forKey: .deltaLabel)
    }

    init(
        formula: String,
        state: String,
        streak: Int,
        streakLabel: String,
        doneToday: Bool,
        steps: String,
        last7: [Bool],
        dayLabel: String,
        deltaLabel: String?
    ) {
        self.formula = formula
        self.state = state
        self.streak = streak
        self.streakLabel = streakLabel
        self.doneToday = doneToday
        self.steps = steps
        self.last7 = last7
        self.dayLabel = dayLabel
        self.deltaLabel = deltaLabel
    }

    static let placeholder = PlaseboSnapshot(
        formula: "Plasebo",
        state: "Bugünün formülü için dokun",
        streak: 0,
        streakLabel: "",
        doneToday: false,
        steps: "renk · ses · nefes",
        last7: [],
        dayLabel: "GÜN",
        deltaLabel: nil
    )

    /// Paylaşılan alandan okur. Kayıt yoksa ya da bozuksa tanıtım metni döner.
    static func load() -> PlaseboSnapshot {
        guard
            let defaults = UserDefaults(suiteName: suiteName),
            let raw = defaults.string(forKey: snapshotKey),
            let data = raw.data(using: .utf8),
            let decoded = try? JSONDecoder().decode(PlaseboSnapshot.self, from: data)
        else {
            return .placeholder
        }
        return decoded
    }
}

struct PlaseboEntry: TimelineEntry {
    let date: Date
    let snapshot: PlaseboSnapshot
}

struct PlaseboProvider: TimelineProvider {
    func placeholder(in context: Context) -> PlaseboEntry {
        PlaseboEntry(date: Date(), snapshot: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (PlaseboEntry) -> Void) {
        completion(PlaseboEntry(date: Date(), snapshot: PlaseboSnapshot.load()))
    }

    /**
     * Zaman çizelgesi gece yarısında yenileniyor: özetin "bugün" kısmı
     * gün dönünce eskiyor. Gün içindeki değişiklikler zaten uygulama
     * tarafından `reloadAllTimelines` ile itiliyor.
     */
    func getTimeline(in context: Context, completion: @escaping (Timeline<PlaseboEntry>) -> Void) {
        let entry = PlaseboEntry(date: Date(), snapshot: PlaseboSnapshot.load())
        let midnight = Calendar.current.nextDate(
            after: Date(),
            matching: DateComponents(hour: 0, minute: 1),
            matchingPolicy: .nextTime
        ) ?? Date().addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(midnight)))
    }
}

/**
 * Seri halkası: ortada gün sayısı, çevresinde bugünün durumu.
 *
 * Halka dolu ve yeşilse bugün tamamlandı, boş ve morsa bekliyor. Sayının
 * kendisi seriyi, halkanın hâli ise "şu an ne yapmalıyım"ı anlatıyor;
 * ikisi tek bir şekle sığdığı için widget'ın en küçük boyu bile bir şey
 * söylüyor.
 */
struct StreakRing: View {
    let streak: Int
    let doneToday: Bool
    let dayLabel: String
    var diameter: CGFloat = 78
    var lineWidth: CGFloat = 8

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.primary.opacity(0.15), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: doneToday ? 1 : 0.001)
                .stroke(
                    doneToday ? glow : pulse,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
            VStack(spacing: 0) {
                Text("\(streak)")
                    .font(.system(size: diameter * 0.38, weight: .bold, design: .rounded))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                Text(dayLabel)
                    .font(.system(size: diameter * 0.12, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .frame(width: diameter, height: diameter)
    }
}

/**
 * Son yedi günün noktaları.
 *
 * Dolu nokta o gün bir seans olduğunu gösteriyor. Sayı yerine nokta:
 * widget'ta okunacak değil, bakılacak bir şey olmalı — desenin kendisi
 * (aralıksız mı, delik dolu mu) tek bakışta görülüyor.
 */
struct WeekDots: View {
    let days: [Bool]
    var size: CGFloat = 7

    var body: some View {
        HStack(spacing: size * 0.7) {
            ForEach(Array(days.enumerated()), id: \.offset) { _, done in
                Circle()
                    .fill(done ? pulse : Color.clear)
                    .overlay(
                        Circle().stroke(Color.primary.opacity(done ? 0 : 0.28), lineWidth: 1)
                    )
                    .frame(width: size, height: size)
            }
        }
    }
}

/** Küçük boy: halka + formül adı + durum. */
struct PlaseboSmallView: View {
    let snapshot: PlaseboSnapshot

    var body: some View {
        VStack(spacing: 8) {
            StreakRing(
                streak: snapshot.streak,
                doneToday: snapshot.doneToday,
                dayLabel: snapshot.dayLabel
            )
            VStack(spacing: 2) {
                Text(snapshot.formula)
                    .font(.system(size: 14, weight: .semibold, design: .serif))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text(snapshot.state)
                    .font(.system(size: 10))
                    .foregroundColor(snapshot.doneToday ? .secondary : pulse)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/** Orta boy: solda halka, sağda günün formülü, adımlar ve son 7 gün. */
struct PlaseboMediumView: View {
    let snapshot: PlaseboSnapshot

    var body: some View {
        HStack(spacing: 14) {
            StreakRing(
                streak: snapshot.streak,
                doneToday: snapshot.doneToday,
                dayLabel: snapshot.dayLabel,
                diameter: 84,
                lineWidth: 9
            )

            VStack(alignment: .leading, spacing: 5) {
                Text(snapshot.state.uppercased())
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(pulse)
                    .lineLimit(1)
                Text(snapshot.formula)
                    .font(.system(size: 19, weight: .semibold, design: .serif))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                if !snapshot.steps.isEmpty {
                    Text(snapshot.steps)
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                if !snapshot.last7.isEmpty {
                    WeekDots(days: snapshot.last7, size: 8)
                        .padding(.top, 2)
                }
                if let delta = snapshot.deltaLabel {
                    Text(delta)
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

/** Kilit ekranı (accessory) görünümü — tek satır, renksiz. */
struct PlaseboAccessoryView: View {
    let snapshot: PlaseboSnapshot

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(snapshot.formula)
                .font(.system(size: 13, weight: .semibold))
                .lineLimit(1)
            Text(snapshot.streak > 0 ? snapshot.streakLabel : snapshot.state)
                .font(.system(size: 11))
                .lineLimit(1)
        }
    }
}

struct PlaseboWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: PlaseboEntry

    var body: some View {
        if isAccessory {
            PlaseboAccessoryView(snapshot: entry.snapshot)
        } else if isMedium {
            PlaseboMediumView(snapshot: entry.snapshot)
        } else {
            PlaseboSmallView(snapshot: entry.snapshot)
        }
    }

    /**
     * Kilit ekranı aileleri (`accessoryRectangular`, `accessoryInline`)
     * iOS 16 ile geldi ve bu hedefin tabanı 15.1.
     *
     * Bu yüzden o durumlar bir `switch` içinde doğrudan yazılamıyor:
     * derleyici "only available in iOS 16.0 or newer" diyerek durur.
     * Karar, sürüm korumasının içinde bir Bool'a indiriliyor; görünüm
     * kodu da sürümden habersiz kalıyor.
     */
    private var isAccessory: Bool {
        if #available(iOS 16.0, *) {
            return family == .accessoryRectangular || family == .accessoryInline
        }
        return false
    }

    private var isMedium: Bool {
        family == .systemMedium
    }
}

/// iOS 17'de zorunlu olan kapsayıcı zemini, eski sürümlerde yok.
extension View {
    @ViewBuilder
    func plaseboContainerBackground() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(.fill.tertiary, for: .widget)
        } else {
            self.padding()
        }
    }
}

struct PlaseboWidget: Widget {
    let kind = "PlaseboWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlaseboProvider()) { entry in
            PlaseboWidgetEntryView(entry: entry)
                .plaseboContainerBackground()
        }
        .configurationDisplayName("Plasebo")
        .description("Serin, bugünün formülü ve son yedi günün.")
        .supportedFamilies(supportedFamilies)
    }

    private var supportedFamilies: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline]
        }
        return [.systemSmall, .systemMedium]
    }
}

@main
struct PlaseboWidgetBundle: WidgetBundle {
    var body: some Widget {
        PlaseboWidget()
    }
}
