/**
 * Google Play mağaza görsellerini üretir.
 *
 *   npm run store:assets
 *
 * Çıktılar `store/graphics/` altına yazılır:
 *
 *   icon-512.png          Play Console "Uygulama simgesi" (512x512, 32-bit PNG)
 *   feature-graphic.png   Play Console "Öne çıkan grafik" (1024x500)
 *
 * Öne çıkan grafik, uyarlanabilir simgenin zemin rengi üzerine ön plan
 * katmanının ortalanmasıyla kurulur — yani mağaza görseli uygulamanın
 * simgesiyle aynı paletten çıkar. Metin eklenmez: Play listelemede
 * uygulama adını grafiğin üstüne kendisi basar ve grafiğe gömülü metin
 * küçük ekranlarda kırpılır.
 *
 * Ekran görüntüleri buradan üretilmez — onlar cihazdan alınmalıdır.
 */
const path = require('path');
const fs = require('fs');
const { generateImageAsync } = require('@expo/image-utils');
// Zemin doğrudan jimp ile kuruluyor: @expo/image-utils'in
// `generateImageBackgroundAsync` fonksiyonu, sistemde `sharp` yoksa jimp
// yedeğine düşüyor ve orada `height` yok sayılıp kare üretiliyor — öne
// çıkan grafiğin 1024x500 olması gerektiği için burada işe yaramıyor.
const Jimp = require('jimp-compact');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'store', 'graphics');

/** Uyarlanabilir simgenin zemin rengi — app.json ile aynı kalmalı. */
const BACKGROUND = '#0E0E12';

const FEATURE_W = 1024;
const FEATURE_H = 500;
const BADGE = 320;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // --- 512x512 mağaza simgesi -------------------------------------------
  // Play şeffaf simge kabul etmez, bu yüzden düz zemine oturtuluyor.
  const icon = await generateImageAsync(
    { projectRoot: ROOT, cacheType: 'plasebo-store-icon' },
    {
      src: path.join(ASSETS, 'icon.png'),
      width: 512,
      height: 512,
      resizeMode: 'cover',
      backgroundColor: BACKGROUND,
    }
  );
  fs.writeFileSync(path.join(OUT, 'icon-512.png'), icon.source);
  console.log('✔ store/graphics/icon-512.png (512x512)');

  // --- 1024x500 öne çıkan grafik ----------------------------------------
  const background = new Jimp(FEATURE_W, FEATURE_H, BACKGROUND);

  const badge = await generateImageAsync(
    { projectRoot: ROOT, cacheType: 'plasebo-store-badge' },
    {
      src: path.join(ASSETS, 'android-icon-foreground.png'),
      width: BADGE,
      height: BADGE,
      resizeMode: 'contain',
      backgroundColor: BACKGROUND,
    }
  );

  background.composite(
    await Jimp.read(badge.source),
    Math.round((FEATURE_W - BADGE) / 2),
    Math.round((FEATURE_H - BADGE) / 2)
  );
  fs.writeFileSync(
    path.join(OUT, 'feature-graphic.png'),
    await background.getBufferAsync(Jimp.MIME_PNG)
  );
  console.log('✔ store/graphics/feature-graphic.png (1024x500)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
