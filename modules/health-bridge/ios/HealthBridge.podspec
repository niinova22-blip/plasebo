Pod::Spec.new do |s|
  s.name           = 'HealthBridge'
  s.version        = '1.0.0'
  s.summary        = 'Read-only HealthKit bridge for Plasebo'
  s.description    = 'Local Expo module: reads last night sleep duration and resting heart rate from HealthKit. Read-only, nothing is written back.'
  s.author         = ''
  s.homepage       = 'https://plasebo.app'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'HealthKit'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
