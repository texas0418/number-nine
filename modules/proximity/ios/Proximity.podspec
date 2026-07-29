Pod::Spec.new do |s|
  s.name           = 'Proximity'
  s.version        = '1.0.0'
  s.summary        = 'Ear-proximity sense for Number Nine'
  s.description    = 'UIDevice proximity events — the whisper gate (B4). iOS only.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
