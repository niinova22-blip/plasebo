/**
 * Mağaza ekran görüntülerini "tanıtım kartı" hâline getirir.
 *
 *   node scripts/generate-store-screenshots.js
 *
 * Girdi:  store/graphics/screenshots/raw/*.png   (cihazdan alınan ham kareler)
 * Çıktı:  store/graphics/screenshots/play/*.png  (1080×1920, Google Play)
 *         store/graphics/screenshots/ios/*.png   (1290×2796, App Store)
 *
 * Neden ham kareyi doğrudan yüklemiyoruz? Play listelemesinde ekran
 * görüntüleri küçük görünür; ham bir uygulama ekranı orada ne olduğunu
 * anlatmaz. Kart düzeni — üstte bir cümle, altta telefon içinde ekran —
 * hem neyin gösterildiğini söyler hem de listeleme boyunca tutarlı bir
 * görsel dil kurar.
 *
 * Bu dosya yalnızca bir tarif; asıl iş `scripts/store-screenshots.py`
 * içinde yapılır çünkü kompozisyon (yuvarlatılmış maske, gerçek TTF ile
 * metin dizme, radyal ışıma) Pillow ile birkaç satır, Node tarafında ise
 * ek bağımlılık gerektiriyor. Python 3 + Pillow gerekir.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'store-screenshots.py');
// Ek argumanlar Python tarafina gecer: `npm run store:shots -- ios`
const result = spawnSync('python', [script, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (result.error || result.status !== 0) {
  console.error(
    '\nÜretim başarısız. Python 3 ve Pillow gerekiyor:\n  pip install Pillow\n'
  );
  process.exit(1);
}
