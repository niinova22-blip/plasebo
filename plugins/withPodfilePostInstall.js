/**
 * Pod kaynak paketlerinin (resource bundle) kod imzasını kapatan Expo eklentisi.
 *
 * İkinci düşen derlemenin hatası buradan geliyordu: Xcode 14'ten beri her
 * kaynak paketi hedefi kendi geliştirici ekibini istiyor, ama CocoaPods'un
 * ürettiği paketler (ör. GoogleSignIn, RNSVG gibi bağımlılıkların
 * `.bundle` hedefleri) hiçbir zaman imzalanacak şekilde kurulmuyor —
 * onlar zaten ana uygulamanın `.app`'i içine kopyalanıyor, ayrı bir
 * imzaya ihtiyaçları yok. Widget uzantısına (`withIosWidget.js`) ekip
 * kimliği yazmak ilk hatayı çözdü ama bu, ondan bağımsız bir hata:
 * `XCODE_RESOURCE_BUNDLE_CODE_SIGNING_ERROR`, hedef `PlaseboWidget`
 * değil, Pods projesindeki paket hedefleriydi.
 *
 * Resmi çözüm (Expo'nun derleme hatası sayfasının önerdiği gibi) bu
 * hedeflerde imzalamayı tamamen kapatmak: `CODE_SIGNING_ALLOWED = NO`.
 * `ios/` klasörü depoda tutulmadığından (her prebuild'de yeniden
 * üretiliyor) bu ayar Podfile'a elle yazılamıyor; her prebuild'de
 * otomatik enjekte edilmesi gerekiyor.
 */
const { withPodfile } = require('expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const TAG = 'plasebo-resource-bundle-signing';

const SNIPPET = `    installer.pods_project.targets.each do |target|
      if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
        target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end`;

function applyPodfilePostInstall(contents) {
  return mergeContents({
    tag: TAG,
    src: contents,
    newSrc: SNIPPET,
    anchor: /post_install do \|installer\|/,
    offset: 1,
    comment: '#',
  }).contents;
}

module.exports = (config) =>
  withPodfile(config, (cfg) => {
    cfg.modResults.contents = applyPodfilePostInstall(cfg.modResults.contents);
    return cfg;
  });

module.exports.applyPodfilePostInstall = applyPodfilePostInstall;
module.exports.TAG = TAG;
