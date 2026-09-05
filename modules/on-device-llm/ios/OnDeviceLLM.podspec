Pod::Spec.new do |s|
  s.name           = 'OnDeviceLLM'
  s.version        = '1.0.0'
  s.summary        = 'On-device language model bridge (Apple Foundation Models)'
  s.description    = 'Local Expo module: short text generation through the on-device system language model. No network, no server, no API key.'
  s.author         = ''
  s.homepage       = 'https://plasebo.app'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
