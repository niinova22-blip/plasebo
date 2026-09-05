/**
 * `withIosWidget` eklentisinin Xcode projesine yaptığı işin sınanması.
 *
 * Windows'ta `expo prebuild --platform ios` iOS projesi üretmiyor, yani
 * eklentinin doğruluğunu ancak bir derleme harcayarak görebiliyorduk. Bu
 * test o bağımlılığı kaldırıyor: gerçek bir `.pbxproj` ayrıştırılıp
 * eklentinin saf kısmı üzerinde çalıştırılıyor ve sonuç, düşen ilk
 * derlemede karşılaşılan hataların her biri için ayrı ayrı denetleniyor.
 *
 * Çalıştırma: node plugins/__tests__/ios-widget.test.js
 */
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const xcode = require('xcode');

const {
  applyWidgetTarget,
  findTarget,
  TARGET_NAME,
  APPLE_TEAM_ID,
} = require('../withIosWidget');

/**
 * Sınama için asgari ama gerçek bir proje.
 *
 * Depoda `ios/` klasörü olmadığı için proje burada elle kuruluyor:
 * kök grup, bir uygulama hedefi ve onun sürüm ayarları. Bunlar
 * eklentinin dokunduğu her şeyin karşılığı — fazlası testi Xcode'un
 * şablonunu taklit etmeye çevirirdi.
 */
function makeProject() {
  // node-xcode, nesneleri `/* Begin ... section */` yorumlarına göre
  // gruplandırıyor; bölüm işaretleri olmadan `pbxProjectSection()` boş
  // dönüyor. Bu yüzden sabit, gerçek bir dosyanın iskeletini birebir
  // taşıyor.
  const text = `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 46;
	objects = {

/* Begin PBXBuildFile section */
		13B07FBC1A68108700A75B9A /* AppDelegate.swift in Sources */ = {isa = PBXBuildFile; fileRef = 13B07FB01A68108700A75B9A /* AppDelegate.swift */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		13B07FB01A68108700A75B9A /* AppDelegate.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = AppDelegate.swift; path = Plasebo/AppDelegate.swift; sourceTree = "<group>"; };
		13B07F961A680F5B00A75B9B /* Plasebo.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Plasebo.app; sourceTree = BUILT_PRODUCTS_DIR; };
/* End PBXFileReference section */

/* Begin PBXGroup section */
		83CBB9F71A601CBA00E9B192 = {
			isa = PBXGroup;
			children = (
				83CBBA001A601CBA00E9B193 /* Products */,
			);
			sourceTree = "<group>";
		};
		83CBBA001A601CBA00E9B193 /* Products */ = {
			isa = PBXGroup;
			children = (
				13B07F961A680F5B00A75B9B /* Plasebo.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		13B07F961A680F5B00A75B9A /* Plasebo */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 13B07F931A680F5B00A75B9A /* Build configuration list for PBXNativeTarget "Plasebo" */;
			buildPhases = (
			);
			buildRules = (
			);
			dependencies = (
			);
			name = Plasebo;
			productName = Plasebo;
			productReference = 13B07F961A680F5B00A75B9B /* Plasebo.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		83CBB9F61A601CBA00E9B192 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				LastUpgradeCheck = 1130;
			};
			buildConfigurationList = 83CBBA001A601CBA00E9B192 /* Build configuration list for PBXProject "Plasebo" */;
			compatibilityVersion = "Xcode 3.2";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
			);
			mainGroup = 83CBB9F71A601CBA00E9B192;
			productRefGroup = 83CBBA001A601CBA00E9B193 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				13B07F961A680F5B00A75B9A /* Plasebo */,
			);
		};
/* End PBXProject section */

/* Begin XCBuildConfiguration section */
		13B07F941A680F5B00A75B9A /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				CURRENT_PROJECT_VERSION = 15;
				MARKETING_VERSION = 1.2.0;
				PRODUCT_NAME = "Plasebo";
			};
			name = Debug;
		};
		13B07F951A680F5B00A75B9A /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				CURRENT_PROJECT_VERSION = 15;
				MARKETING_VERSION = 1.2.0;
				PRODUCT_NAME = "Plasebo";
			};
			name = Release;
		};
		83CBBA201A601CBA00E9B192 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		13B07F931A680F5B00A75B9A /* Build configuration list for PBXNativeTarget "Plasebo" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				13B07F941A680F5B00A75B9A /* Debug */,
				13B07F951A680F5B00A75B9A /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		83CBBA001A601CBA00E9B192 /* Build configuration list for PBXProject "Plasebo" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				83CBBA201A601CBA00E9B192 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = 83CBB9F61A601CBA00E9B192 /* Project object */;
}
`;

  const tmp = path.join(
    process.env.TEMP || process.env.TMPDIR || '.',
    `plasebo-test-${Date.now()}.pbxproj`
  );
  fs.writeFileSync(tmp, text);
  const project = xcode.project(tmp);
  project.parseSync();
  return { project, tmp };
}

function settingsFor(project, productName) {
  const configs = project.pbxXCBuildConfigurationSection();
  return Object.keys(configs)
    .map((k) => configs[k].buildSettings)
    .filter((s) => s && s.PRODUCT_NAME === `"${productName}"`);
}

const { project, tmp } = makeProject();

const added = applyWidgetTarget(project, {
  bundleIdentifier: 'com.plasebo.app',
  version: '9.9.9',
  buildNumber: '999',
});
assert.strictEqual(added, true, 'hedef eklenmeli');

/* --- 1. Hedef gerçekten oluştu mu --- */
const target = findTarget(project, TARGET_NAME);
assert.ok(target, 'PlaseboWidget hedefi bulunamadı');
assert.strictEqual(
  target.productType,
  '"com.apple.product-type.app-extension"',
  'ürün türü uygulama uzantısı olmalı'
);
console.log('1 ✓ uzantı hedefi oluşturuldu');

/* --- 2. Düşen derlemenin birinci hatası: geliştirici ekibi yok --- */
const widgetConfigs = settingsFor(project, TARGET_NAME);
assert.strictEqual(widgetConfigs.length, 2, 'Debug ve Release ayarları olmalı');
for (const s of widgetConfigs) {
  assert.strictEqual(s.DEVELOPMENT_TEAM, `"${APPLE_TEAM_ID}"`, 'DEVELOPMENT_TEAM eksik');
  assert.strictEqual(s.PRODUCT_BUNDLE_IDENTIFIER, '"com.plasebo.app.PlaseboWidget"');
  assert.strictEqual(s.INFOPLIST_FILE, '"PlaseboWidget/Info.plist"');
  assert.strictEqual(
    s.CODE_SIGN_ENTITLEMENTS,
    '"PlaseboWidget/PlaseboWidget.entitlements"'
  );
  assert.strictEqual(s.IPHONEOS_DEPLOYMENT_TARGET, '"15.1"');
  assert.strictEqual(s.SWIFT_VERSION, '"5.0"');
}
console.log('2 ✓ imzalama ayarları yazıldı (ilk derlemeyi düşüren hata)');

/* --- 3. Sürümler uygulamadan alındı mı (App Store bunu şart koşuyor) --- */
// Değerler projeden **birebir** kopyalanıyor; node-xcode sayıyı sayı
// olarak ayrıştırdığı için karşılaştırma metne çevrilerek yapılıyor.
// Önemli olan, yapılandırmadaki 9.9.9/999 değil uygulamanın gerçek
// değerinin yazılmış olması.
for (const s of widgetConfigs) {
  assert.strictEqual(String(s.MARKETING_VERSION), '1.2.0', 'sürüm uygulamadan okunmalı');
  assert.strictEqual(
    String(s.CURRENT_PROJECT_VERSION),
    '15',
    'derleme no uygulamadan okunmalı'
  );
}
console.log('3 ✓ sürüm ve derleme numarası uygulamayla aynı');

/* --- 4. Uzantı ana uygulamaya gömülüyor mu (.ipa içine girsin) --- */
const copyPhases = project.hash.project.objects.PBXCopyFilesBuildPhase || {};
const embed = Object.keys(copyPhases)
  .filter((k) => !k.endsWith('_comment'))
  .map((k) => copyPhases[k])
  .filter((p) => String(p.dstSubfolderSpec) === '13');
assert.ok(embed.length >= 1, 'PlugIns kopyalama aşaması yok — widget .ipa içine girmez');
const embedded = embed.some((p) =>
  (p.files || []).some((f) => String(f.comment || '').includes('PlaseboWidget.appex'))
);
assert.ok(embedded, 'PlaseboWidget.appex gömme aşamasına eklenmemiş');
console.log('4 ✓ .appex ana uygulamaya gömülüyor (PlugIns)');

/* --- 5. Ana hedef uzantıya bağımlı mı (derleme sırası) --- */
const deps = project.hash.project.objects.PBXTargetDependency || {};
const depCount = Object.keys(deps).filter((k) => !k.endsWith('_comment')).length;
assert.ok(depCount >= 1, 'hedef bağımlılığı eklenmemiş');
console.log('5 ✓ ana hedef uzantıya bağımlı');

/* --- 6. Swift kaynağı derleme aşamasına bağlı mı --- */
const sources = project.hash.project.objects.PBXSourcesBuildPhase || {};
const hasSwift = Object.keys(sources)
  .filter((k) => !k.endsWith('_comment'))
  .some((k) =>
    (sources[k].files || []).some((f) =>
      String(f.comment || '').includes('PlaseboWidget.swift')
    )
  );
assert.ok(hasSwift, 'PlaseboWidget.swift hiçbir Sources aşamasına eklenmemiş');
console.log('6 ✓ PlaseboWidget.swift derleniyor');

/* --- 7. İkinci kez çalıştırılınca hedefi çoğaltmıyor --- */
const again = applyWidgetTarget(project, { bundleIdentifier: 'com.plasebo.app' });
assert.strictEqual(again, false, 'ikinci çalıştırmada hedef eklenmemeli');
const targets = project.hash.project.objects.PBXNativeTarget;
const widgetTargets = Object.keys(targets)
  .filter((k) => !k.endsWith('_comment'))
  .filter((k) => String(targets[k].name).includes(TARGET_NAME));
assert.strictEqual(widgetTargets.length, 1, 'hedef çoğaltılmış');
console.log('7 ✓ tekrar çalıştırmada hedef çoğalmıyor');

/* --- 8. Yazılan proje yeniden ayrıştırılabiliyor mu --- */
const out = tmp.replace('.pbxproj', '-out.pbxproj');
fs.writeFileSync(out, project.writeSync());
const reread = xcode.project(out);
reread.parseSync();
assert.ok(findTarget(reread, TARGET_NAME), 'yazılan proje tekrar okunamadı');
console.log('8 ✓ üretilen .pbxproj geçerli ve tekrar okunabiliyor');

fs.unlinkSync(tmp);
fs.unlinkSync(out);
console.log('\nWIDGET EKLENTİSİ: 8/8 GEÇTİ');
