Pod::Spec.new do |s|
  s.name           = 'WidgetBridge'
  s.version        = '1.0.0'
  s.summary        = 'App Group bridge for the Plasebo iOS widget'
  s.description    = 'Local Expo module: writes the daily widget snapshot into the shared App Group so the WidgetKit extension can read it.'
  s.author         = ''
  s.homepage       = 'https://plasebo.app'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'WidgetKit'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
