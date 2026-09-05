/**
 * iOS ana ekran + kilit ekranı widget'ını projeye ekleyen Expo eklentisi.
 *
 * Android tarafındaki `withWidget.js` ile aynı fikir: `ios/` klasörü
 * prebuild ile yeniden üretildiği için widget'ın kaynakları depoda
 * `plugins/ios-widget/` altında duruyor, eklenti her prebuild'de onları
 * yerine kopyalayıp Xcode projesine yeni bir uygulama uzantısı (app
 * extension) hedefi olarak bağlıyor.
 *
 * Uygulama ile widget iki ayrı süreç olduğu için veri App Group üzerinden
 * paylaşılıyor: uygulama `modules/widget-bridge` ile yazıyor, widget
 * `UserDefaults(suiteName:)` ile okuyor. Bu yüzden App Group entitlement'ı
 * hem ana uygulamaya hem de uzantıya ekleniyor — ikisinden biri eksik
 * kalırsa widget her zaman tanıtım metnini gösterir.
 *
 * Xcode projesine dokunan kısım (`applyWidgetTarget`) bilerek saf bir
 * fonksiyon ve dışa da veriliyor: Windows'ta `expo prebuild` iOS projesi
 * üretemediği için bu mantığın tek sınanma yolu onu doğrudan bir proje
 * nesnesi üzerinde çalıştırmak (bkz. `plugins/__tests__/ios-widget.test.js`).
 */
const {
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/** Uzantının hedef adı; klasör adı ve ürün adı olarak da kullanılıyor. */
const TARGET_NAME = 'PlaseboWidget';
/** Uygulama ile widget'ın ortak veri alanı. */
const APP_GROUP = 'group.com.plasebo.app';
const SOURCE_DIR = path.join('plugins', 'ios-widget');
/**
 * Uzantının imzalanacağı Apple ekibi.
 *
 * Ana uygulamanın ekibini EAS, kimlik bilgilerini kurarken projeye kendisi
 * yazıyor; uzantı hedefi o adımda henüz bilinmediği için ayarsız kalıyor ve
 * Xcode "Signing for PlaseboWidget requires a development team" diyerek
 * düşüyor — ilk derleme tam olarak buradan düştü. Değer `eas.json`
 * içindeki `submit.production.ios.appleTeamId` ile aynı olmalı; ortam
 * değişkeniyle ezilebiliyor ki başka bir hesapla derlemek isteyen kodu
 * değiştirmek zorunda kalmasın.
 */
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || 'ML3UZXMU3D';

const FILES = ['PlaseboWidget.swift', 'Info.plist', 'PlaseboWidget.entitlements'];

/** Kaynakları `ios/PlaseboWidget/` altına kopyalar. */
const withWidgetFiles = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const from = path.join(cfg.modRequest.projectRoot, SOURCE_DIR);
      const to = path.join(cfg.modRequest.platformProjectRoot, TARGET_NAME);
      fs.mkdirSync(to, { recursive: true });
      for (const name of FILES) {
        fs.copyFileSync(path.join(from, name), path.join(to, name));
      }
      return cfg;
    },
  ]);

/** Ana uygulamaya App Group ekler — widget'ın okuyacağı alan bu. */
const withAppGroup = (config) =>
  withEntitlementsPlist(config, (cfg) => {
    const key = 'com.apple.security.application-groups';
    const groups = new Set(cfg.modResults[key] ?? []);
    groups.add(APP_GROUP);
    cfg.modResults[key] = [...groups];
    return cfg;
  });

/**
 * Hedefi adına göre bulur.
 *
 * `pbxTargetByName` kullanılamıyor: o, hedefi bölüm yorumuna göre arıyor
 * ve `addTarget` yorumu **tırnaklı** yazıyor (`"PlaseboWidget"`), yani
 * tırnaksız bir adla hiçbir zaman eşleşmiyor. Bunun sonucu sessiz ve
 * pahalıydı — ikinci bir prebuild'de aynı hedef ikinci kez ekleniyor ve
 * derleme "duplicate output file" hatasıyla düşüyordu.
 */
function findTarget(project, name) {
  const targets = project.hash.project.objects.PBXNativeTarget || {};
  for (const key of Object.keys(targets)) {
    if (key.endsWith('_comment')) continue;
    const raw = targets[key] && targets[key].name;
    if (typeof raw !== 'string') continue;
    if (raw.replace(/^"|"$/g, '') === name) return targets[key];
  }
  return undefined;
}

/**
 * Ana uygulama hedefinin bir derleme ayarını okur.
 *
 * Sürüm numaraları için gerekiyor: App Store, uzantının `CFBundleVersion`
 * ve `CFBundleShortVersionString` değerlerinin uygulamanınkiyle **birebir**
 * aynı olmasını şart koşuyor, aksi hâlde yükleme reddediliyor. Bu yüzden
 * değerler yapılandırmadan tahmin edilmiyor; projede gerçekten yazan değer
 * okunuyor, bulunamazsa yapılandırmadaki değere düşülüyor.
 */
function appTargetSetting(project, name) {
  const app = project.getFirstTarget();
  if (!app) return undefined;
  const listId = app.firstTarget.buildConfigurationList;
  const lists = project.pbxXCConfigurationList();
  const configs = project.pbxXCBuildConfigurationSection();
  const entries = (lists && lists[listId] && lists[listId].buildConfigurations) || [];
  for (const entry of entries) {
    const settings = configs && configs[entry.value] && configs[entry.value].buildSettings;
    if (settings && settings[name] !== undefined) return settings[name];
  }
  return undefined;
}

/**
 * Xcode projesine uzantı hedefini ekler ve derleme ayarlarını yazar.
 *
 * Gömme ve bağımlılık işini `addTarget`'ın kendisi yapıyor: `app_extension`
 * türü için ana hedefe bir "Copy Files" aşaması (PlugIns, dstSubfolderSpec
 * 13) açıp `.appex` ürününü oraya koyuyor ve hedefi ana hedefin bağımlılığı
 * olarak ekliyor. Burada elle yapılan tek şey ayarlar.
 *
 * Hedef zaten varsa hiçbir şey yapılmıyor: prebuild bazen aynı proje
 * üzerinde iki kez çalışabiliyor ve hedefin ikinci kopyası derlemeyi
 * "duplicate output file" hatasıyla düşürüyor.
 *
 * @returns Hedef eklendiyse `true`, zaten varsa `false`.
 */
function applyWidgetTarget(project, { bundleIdentifier, version, buildNumber }) {
  if (findTarget(project, TARGET_NAME)) return false;

  const bundleId = `${bundleIdentifier}.${TARGET_NAME}`;

  // Sürümler önce projeden okunuyor (bkz. `appTargetSetting`), yoksa
  // yapılandırmadan geliyor. Sıra önemli: `addTarget` çağrıldıktan sonra
  // "ilk hedef" hâlâ uygulama olsa da, okumayı önce yapmak niyeti
  // açıkça gösteriyor.
  const marketingVersion =
    appTargetSetting(project, 'MARKETING_VERSION') || `"${version || '1.0.0'}"`;
  const projectVersion =
    appTargetSetting(project, 'CURRENT_PROJECT_VERSION') || `"${buildNumber || '1'}"`;

  /*
   * `addTarget`, uzantıyı ana hedefin bağımlılığı yapmak için
   * `addTargetDependency`'yi çağırıyor; ama o fonksiyon
   * `PBXTargetDependency` ve `PBXContainerItemProxy` bölümleri projede
   * **zaten varsa** iş yapıyor, yoksa sessizce geçiyor. Tek hedefli bir
   * Expo projesinde bu iki bölüm hiç bulunmuyor, dolayısıyla bağımlılık
   * hiç kurulmuyordu. Bölümler önceden açılıyor ki uzantı, gömme
   * aşamasından önce derlenmesi garanti olsun — aksi hâlde kopyalama
   * "No such file" ile düşebiliyor.
   */
  project.hash.project.objects.PBXTargetDependency =
    project.hash.project.objects.PBXTargetDependency || {};
  project.hash.project.objects.PBXContainerItemProxy =
    project.hash.project.objects.PBXContainerItemProxy || {};

  const target = project.addTarget(TARGET_NAME, 'app_extension', TARGET_NAME, bundleId);

  // Uzantının kendi derleme aşamaları. Kaynak listesi boş başlıyor,
  // aşağıda `addSourceFile` ile dolduruluyor.
  project.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
  project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
  // Çerçeve listesi bilerek boş: WidgetKit ve SwiftUI Swift tarafından
  // kendiliğinden bağlanıyor. Adlarını elle eklemek, projeye çözülemeyen
  // dosya başvuruları yazıp derlemeyi düşürebiliyor.
  project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);

  // Dosyaları projeye tanıt ve kaynağı derleme aşamasına bağla.
  const group = project.addPbxGroup(FILES, TARGET_NAME, TARGET_NAME);
  const groups = project.hash.project.objects.PBXGroup;
  for (const key of Object.keys(groups)) {
    // Kök grup: adı ve yolu olmayan tek grup budur.
    if (groups[key].name === undefined && groups[key].path === undefined) {
      project.addToPbxGroup(group.uuid, key);
      break;
    }
  }
  project.addSourceFile(
    `${TARGET_NAME}/PlaseboWidget.swift`,
    { target: target.uuid },
    group.uuid
  );

  // Uzantıya özgü derleme ayarları. Ana uygulamanınkiler miras
  // alınmıyor; hepsi burada açıkça yazılmak zorunda.
  const configurations = project.pbxXCBuildConfigurationSection();
  let touched = 0;
  for (const key of Object.keys(configurations)) {
    const buildSettings = configurations[key].buildSettings;
    if (!buildSettings || buildSettings.PRODUCT_NAME !== `"${TARGET_NAME}"`) continue;

    buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleId}"`;
    buildSettings.INFOPLIST_FILE = `"${TARGET_NAME}/Info.plist"`;
    buildSettings.CODE_SIGN_ENTITLEMENTS = `"${TARGET_NAME}/${TARGET_NAME}.entitlements"`;
    // Ana uygulamayla aynı taban: uzantının hedefi uygulamanınkinden
    // düşük olduğunda bağlayıcı uyarı üretiyor. Kilit ekranı aileleri
    // iOS 16 ile geldiği için kodda ayrıca `#available` koruması var.
    buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '"15.1"';
    buildSettings.SWIFT_VERSION = '"5.0"';
    buildSettings.TARGETED_DEVICE_FAMILY = '"1"';
    buildSettings.SKIP_INSTALL = '"YES"';
    buildSettings.CODE_SIGN_STYLE = '"Automatic"';
    buildSettings.DEVELOPMENT_TEAM = `"${APPLE_TEAM_ID}"`;
    buildSettings.MARKETING_VERSION = marketingVersion;
    buildSettings.CURRENT_PROJECT_VERSION = projectVersion;
    touched += 1;
  }
  if (touched === 0) {
    throw new Error(
      `${TARGET_NAME} hedefi eklendi ama derleme ayarları bulunamadı — ` +
        'imzalanamayan bir uzantı üretilirdi.'
    );
  }

  return true;
}

const withWidgetTarget = (config) =>
  withXcodeProject(config, (cfg) => {
    applyWidgetTarget(cfg.modResults, {
      bundleIdentifier: cfg.ios.bundleIdentifier,
      version: cfg.version,
      buildNumber: cfg.ios && cfg.ios.buildNumber,
    });
    return cfg;
  });

module.exports = (config) =>
  withWidgetTarget(withAppGroup(withWidgetFiles(config)));

// Sınanabilsin diye dışa veriliyor; eklentinin kendisi varsayılan dışa
// aktarım olmaya devam ediyor.
module.exports.applyWidgetTarget = applyWidgetTarget;
module.exports.TARGET_NAME = TARGET_NAME;
module.exports.APP_GROUP = APP_GROUP;
module.exports.APPLE_TEAM_ID = APPLE_TEAM_ID;
module.exports.findTarget = findTarget;
