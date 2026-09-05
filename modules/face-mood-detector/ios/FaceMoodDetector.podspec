Pod::Spec.new do |s|
  s.name           = 'FaceMoodDetector'
  s.version        = '1.0.0'
  s.summary        = 'On-device face-mood heuristic using Apple Vision'
  s.description    = 'Local Expo module: rough smile-score from Apple Vision face landmarks, no third-party ML dependency'
  s.author         = ''
  s.homepage       = 'https://plasebo.app'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'Vision', 'UIKit'

  s.dependency 'ExpoModulesCore'
  # Google'ın resmi on-device çıkarım motoru — model dosyasının kendisi
  # ayrı bir depodan (Apache-2.0, bkz. EMOTION_MODEL_LICENSE.txt) geliyor,
  # bu sadece onu çalıştıran kütüphane.
  s.dependency 'TensorFlowLiteSwift', '~> 2.17'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  # AffectNet üzerinde eğitilmiş (EfficientNet-B2 tabanlı), Apache-2.0
  # lisanslı duygu modeli — bkz. EMOTION_MODEL_LICENSE.txt.
  # Kaynak: github.com/sb-ai-lab/EmotiEffLib
  s.resource_bundles = {
    'FaceMoodDetectorResources' => ['emotion_model.tflite']
  }
end
