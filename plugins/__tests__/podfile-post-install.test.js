/**
 * `withPodfilePostInstall` eklentisinin Podfile'a yazdığı yamanın sınanması.
 *
 * İkinci düşen derlemenin hatası (`XCODE_RESOURCE_BUNDLE_CODE_SIGNING_ERROR`)
 * buradan geliyordu; bu test o yamanın gerçekten `post_install` bloğuna
 * girdiğini ve tekrar çalıştırmada çoğalmadığını doğruluyor.
 *
 * Çalıştırma: node plugins/__tests__/podfile-post-install.test.js
 */
const assert = require('node:assert');
const { applyPodfilePostInstall, TAG } = require('../withPodfilePostInstall');

const PODFILE = `platform :ios, '15.1'

target 'Plasebo' do
  use_expo_modules!

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
  end
end
`;

/* --- 1. Yama post_install bloğuna giriyor mu --- */
const once = applyPodfilePostInstall(PODFILE);
assert.ok(once.includes("CODE_SIGNING_ALLOWED"), 'imza kapatma satırı eklenmemiş');
assert.ok(
  once.indexOf('post_install do |installer|') < once.indexOf('CODE_SIGNING_ALLOWED'),
  'yama post_install bloğundan önce eklenmiş'
);
console.log('1 ✓ yama post_install bloğuna eklendi');

/* --- 2. Var olan react_native_post_install çağrısı korunuyor mu --- */
assert.ok(once.includes('react_native_post_install('), 'mevcut post_install içeriği silinmiş');
console.log('2 ✓ mevcut post_install içeriği korundu');

/* --- 3. İkinci çalıştırmada çoğalmıyor mu (her prebuild'de tekrar uygulanıyor) --- */
const twice = applyPodfilePostInstall(once);
const count = twice.split('CODE_SIGNING_ALLOWED').length - 1;
assert.strictEqual(count, 1, 'yama ikinci çalıştırmada çoğalmış');
console.log(`3 ✓ tekrar çalıştırmada çoğalmıyor (etiket: ${TAG})`);

console.log('\nPODFILE POST_INSTALL EKLENTİSİ: 3/3 GEÇTİ');
