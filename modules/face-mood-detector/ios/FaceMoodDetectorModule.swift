import ExpoModulesCore
import Vision
import UIKit
import TensorFlowLite

/**
 * Yüz + duygu tespiti.
 *
 * Yüz konumu Apple'ın kendi (iOS'a gömülü) Vision çerçevesiyle bulunuyor.
 * Duygu sınıflandırması AffectNet üzerinde eğitilmiş, EfficientNet-B2
 * tabanlı gerçek bir modelden geliyor (Apache-2.0 —
 * github.com/sb-ai-lab/EmotiEffLib, bkz. EMOTION_MODEL_LICENSE.txt).
 * Önceki iki sürüm (elle yazılmış "ağız genişliği" sezgisi, ardından
 * FER-2013 tabanlı küçük bir model) gerçek yüzlerde yeterince güvenilir
 * çıkmadı — bu model daha güncel ve daha büyük bir veri setinde eğitildi.
 */
public struct FaceMoodResult: Record {
  public init() {}

  @Field var faceFound: Bool = false
  /** Etiket → olasılık (0-1). Toplamı ~1 olan bir softmax çıktısı. */
  @Field var emotions: [String: Double]? = nil
}

/** AffectNet'in sabit 7 sınıf sırası (bkz. EmotiEffLib facial_analysis.py). */
private let EMOTION_LABELS = ["Anger", "Disgust", "Fear", "Happiness", "Neutral", "Sadness", "Surprise"]

/** Modelin girdi boyutu (EfficientNet-B2, 260x260 RGB). */
private let MODEL_SIDE = 260

/** ImageNet normalizasyonu — modelin eğitildiği ön işleme ile aynı olmalı. */
private let CHANNEL_MEAN: [Float32] = [0.485, 0.456, 0.406]
private let CHANNEL_STD: [Float32] = [0.229, 0.224, 0.225]

extension Data {
  init<T>(copyingBufferOf array: [T]) {
    self = array.withUnsafeBufferPointer(Data.init)
  }
}

extension Array {
  init?(unsafeData: Data) {
    guard unsafeData.count % MemoryLayout<Element>.stride == 0 else { return nil }
    self = unsafeData.withUnsafeBytes { .init($0.bindMemory(to: Element.self)) }
  }
}

public class FaceMoodDetectorModule: Module {
  private var interpreter: Interpreter?

  public func definition() -> ModuleDefinition {
    Name("FaceMoodDetector")

    AsyncFunction("detectSmile") { (imageUri: String, promise: Promise) in
      guard
        let url = URL(string: imageUri),
        let originalImage = UIImage(contentsOfFile: url.path)
      else {
        promise.reject("E_IMAGE_LOAD", "Görsel okunamadı: \(imageUri)")
        return
      }

      let normalized = FaceMoodDetectorModule.normalizedOrientation(originalImage)
      guard let cgImage = normalized.cgImage else {
        promise.reject("E_IMAGE_LOAD", "Görsel CGImage'a çevrilemedi")
        return
      }

      let request = VNDetectFaceLandmarksRequest()
      let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

      do {
        try handler.perform([request])
      } catch {
        promise.reject("E_VISION", "Vision isteği başarısız: \(error.localizedDescription)")
        return
      }

      var result = FaceMoodResult()
      guard let face = request.results?.first else {
        promise.resolve(result)
        return
      }
      result.faceFound = true

      guard
        let faceCrop = FaceMoodDetectorModule.cropToFace(cgImage: cgImage, boundingBox: face.boundingBox),
        let pixels = FaceMoodDetectorModule.rgbPixels(from: faceCrop, side: MODEL_SIDE)
      else {
        promise.resolve(result)
        return
      }

      result.emotions = self.runEmotionModel(pixels: pixels)
      promise.resolve(result)
    }
  }

  private func loadInterpreter() -> Interpreter? {
    if let interpreter = interpreter { return interpreter }
    guard
      let bundleURL = Bundle(for: FaceMoodDetectorModule.self)
        .url(forResource: "FaceMoodDetectorResources", withExtension: "bundle"),
      let resourceBundle = Bundle(url: bundleURL),
      let modelPath = resourceBundle.path(forResource: "emotion_model", ofType: "tflite")
    else { return nil }

    do {
      let newInterpreter = try Interpreter(modelPath: modelPath)
      try newInterpreter.allocateTensors()
      interpreter = newInterpreter
      return newInterpreter
    } catch {
      return nil
    }
  }

  /** RGB, ImageNet-normalize piksellerden 7 duygu olasılığı çıkarır. */
  private func runEmotionModel(pixels: [Float32]) -> [String: Double]? {
    guard let interpreter = loadInterpreter() else { return nil }
    do {
      try interpreter.copy(Data(copyingBufferOf: pixels), toInputAt: 0)
      try interpreter.invoke()
      let output = try interpreter.output(at: 0)
      guard let logits = [Float32](unsafeData: output.data), logits.count == EMOTION_LABELS.count else {
        return nil
      }

      // Model son katmanda softmax uygulamıyor — ham skorları (logit)
      // kendimiz olasılığa çeviriyoruz.
      let maxLogit = logits.max() ?? 0
      let expValues = logits.map { exp($0 - maxLogit) }
      let sumExp = expValues.reduce(0, +)
      guard sumExp > 0 else { return nil }

      var map: [String: Double] = [:]
      for (i, label) in EMOTION_LABELS.enumerated() {
        map[label] = Double(expValues[i] / sumExp)
      }
      return map
    } catch {
      return nil
    }
  }

  private static func normalizedOrientation(_ image: UIImage) -> UIImage {
    if image.imageOrientation == .up { return image }
    UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale)
    image.draw(in: CGRect(origin: .zero, size: image.size))
    let fixed = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return fixed ?? image
  }

  /**
   * Vision'ın normalize edilmiş (sol-alt orijinli) yüz kutusunu piksel
   * uzayına çevirir ve etrafına biraz pay ekler — model, yüzün etrafında
   * biraz bağlam (saç/çene hattı) da olan kırpımlarla eğitildi.
   */
  private static func cropToFace(cgImage: CGImage, boundingBox: CGRect) -> CGImage? {
    let imgW = CGFloat(cgImage.width)
    let imgH = CGFloat(cgImage.height)

    let rawX = boundingBox.origin.x * imgW
    let rawY = (1 - boundingBox.origin.y - boundingBox.height) * imgH
    let rawW = boundingBox.width * imgW
    let rawH = boundingBox.height * imgH

    // Pay, gerçek fotoğraflarla ölçülerek seçildi: 5 test görüntüsünde
    // 0.00-0.10 aralığı 4/5 doğru verirken 0.15 ve üstü bozuluyordu
    // (kızgın yüz "üzgün"e kayıyor). Modelin eğitim kodu da (EmotiEffLib)
    // dedektör kutusunu hiç pay eklemeden kullanıyor — yani model dar
    // kırpım bekliyor. Buradaki küçük pay yalnızca Vision'ın kutusunun
    // çeneyi/kaşı kırpma ihtimaline karşı bir emniyet payı.
    let margin: CGFloat = 0.10
    var x = rawX - rawW * margin
    var y = rawY - rawH * margin
    var w = rawW * (1 + margin * 2)
    var h = rawH * (1 + margin * 2)

    // Kare olmayan bir kırpım, kareye sıkıştırılırken yüzü esnetip
    // modele bozuk bir görüntü verir — kısa kenarı uzatıp kareye
    // tamamlıyoruz, esnetmek yerine.
    if w > h {
      y -= (w - h) / 2
      h = w
    } else if h > w {
      x -= (h - w) / 2
      w = h
    }

    let clamped = CGRect(x: x, y: y, width: w, height: h)
      .intersection(CGRect(x: 0, y: 0, width: imgW, height: imgH))
    guard clamped.width > 1, clamped.height > 1 else { return nil }
    return cgImage.cropping(to: clamped)
  }

  /**
   * Verilen görseli `side`x`side` boyutuna indirgeyip RGB kanallarını
   * ImageNet ortalama/std'sine göre normalize eder — modelin eğitildiği
   * ön işlemeyle birebir aynı olması gerekiyor (bkz. EmotiEffLib
   * facial_analysis.py `_preprocess`).
   */
  private static func rgbPixels(from cgImage: CGImage, side: Int) -> [Float32]? {
    let bytesPerPixel = 4
    let bytesPerRow = side * bytesPerPixel
    guard
      let context = CGContext(
        data: nil,
        width: side,
        height: side,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
      )
    else { return nil }

    // NOT: Daha önce burada bir eksen çevirme (translateBy/scaleBy) vardı
    // ("ham CGContext ters çizer" varsayımıyla eklenmişti). Gerçek
    // fotoğraflarla test edince tam tersi oldu: model dikey ters çevrilmiş
    // görüntüye Şaşkın/Üzgün ağırlıklı, tutarsız sonuçlar veriyordu —
    // Python'da aynı fotoğrafı bilerek dikey çevirince BİREBİR aynı örüntü
    // çıktı. Bu context + bitmapInfo (RGB, noneSkipLast) kombinasyonunda
    // çevirme gerekmiyormuş; kaldırıldı.
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: side, height: side))
    guard let data = context.data else { return nil }

    let buffer = data.bindMemory(to: UInt8.self, capacity: side * side * bytesPerPixel)
    // NHWC sırası: modelin beklediği (1, side, side, 3) girdiyle birebir
    // aynı — piksel piksel, kanal kanal (R,G,B) sırayla dolduruluyor.
    var pixels = [Float32](repeating: 0, count: side * side * 3)
    for p in 0..<(side * side) {
      let base = p * bytesPerPixel
      for c in 0..<3 {
        let v = Float32(buffer[base + c]) / 255.0
        pixels[p * 3 + c] = (v - CHANNEL_MEAN[c]) / CHANNEL_STD[c]
      }
    }
    return pixels
  }
}
