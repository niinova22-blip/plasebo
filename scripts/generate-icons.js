/**
 * Plasebo — uygulama simgesi üretici
 *
 *   node scripts/generate-icons.js   (npm run icons)
 *
 * Simge tek bir yerden, kodla çiziliyor: aynı işaret hem uygulama
 * simgesinde, hem Android uyarlanabilir simgenin ön planında, hem de
 * açılış (splash) ekranında kullanılıyor. Böylece üçü birbirinden
 * ayrışmıyor ve palet değişirse tek dosyayı düzenlemek yetiyor.
 *
 * İşaret: yumuşak bir ışık küresi ve etrafında ince bir halka — ritüel
 * ekranındaki nefes dairesinin durgun hâli. Renkler uygulamanın
 * paletinden geliyor (mor `pulse`, yeşil `glow`, zemin `ink`).
 *
 * Üretilen dosyalar:
 *   assets/icon.png                       1024  zeminli tam simge (iOS/mağaza)
 *   assets/android-icon-foreground.png    1024  yalnızca işaret (şeffaf)
 *   assets/android-icon-background.png    1024  yalnızca zemin
 *   assets/android-icon-monochrome.png    1024  tek renk siluet (temalı simge)
 *   assets/splash-icon.png                1024  açılış ekranı işareti (şeffaf)
 *   assets/favicon.png                      96  web
 *
 * Kenar yumuşatma, hedef boyutun 3 katında çizip kutu filtresiyle
 * küçülterek yapılıyor — ayrı bir çizim kütüphanesine gerek kalmıyor.
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ASSETS = path.join(__dirname, '..', 'assets');
const SS = 3; // süper örnekleme katsayısı

/** Palet — src/constants/colors.ts ile aynı kalmalı. */
const INK = [0x0e, 0x0e, 0x12];
const PULSE = [0x7b, 0x6e, 0xf6];
const GLOW = [0xa8, 0xff, 0x78];
const LIGHT = [0xef, 0xec, 0xff];

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/** Yumuşak kenar: [e0, e1] aralığında 0→1 geçişi. */
function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/**
 * İşaretin bir noktadaki katkısı.
 *
 * `u`, `v` merkeze göre -0.5..0.5 aralığında normalize edilmiş koordinat.
 * Dönen değer: { color, alpha }.
 */
function mark(u, v, opts = {}) {
  const { halo = true, flat = false } = opts;
  const d = Math.hypot(u, v);

  const R_ORB = 0.225; // ışık küresi
  const R_RING = 0.360; // ince halka
  const RING_W = 0.013;

  // --- küre --------------------------------------------------------
  // Renk çapraz bir geçiş: sol altta yeşil, sağ üstte mor.
  const t = clamp((u - v) / (2 * R_ORB) * 0.5 + 0.5);
  let color = mix(GLOW, PULSE, t);
  // Sol üstten gelen yumuşak ışık; küreyi düz bir daire olmaktan çıkarır.
  const spec = smoothstep(0.85, 0.0, Math.hypot(u + 0.085, v + 0.095) / R_ORB);
  color = mix(color, LIGHT, spec * 0.3);
  const orbA = 1 - smoothstep(R_ORB - 0.006, R_ORB + 0.006, d);

  // --- halka -------------------------------------------------------
  const ringA =
    (1 - smoothstep(RING_W - 0.004, RING_W + 0.004, Math.abs(d - R_RING))) * 0.42;

  // --- ışıma -------------------------------------------------------
  const haloA = halo ? Math.exp(-Math.pow((d - R_ORB) / 0.135, 2)) * 0.42 : 0;

  if (flat) {
    // Tek renk siluet: küre + halka, ışıma yok.
    return { color: [255, 255, 255], alpha: clamp(Math.max(orbA, ringA / 0.42)) };
  }

  const out = [0, 0, 0];
  let alpha = 0;

  // Işıma → halka → küre sırasıyla üst üste bindiriliyor.
  const layers = [
    { c: PULSE, a: haloA },
    { c: mix(LIGHT, PULSE, 0.35), a: ringA },
    { c: color, a: orbA },
  ];
  for (const layer of layers) {
    const a = clamp(layer.a);
    if (a <= 0) continue;
    for (let i = 0; i < 3; i++) {
      out[i] = (out[i] * alpha * (1 - a) + layer.c[i] * a) / (alpha * (1 - a) + a);
    }
    alpha = alpha + a - alpha * a;
  }

  return { color: out, alpha };
}

/** Zemin: ink üzerine merkezden yayılan çok yumuşak bir mor ışıma. */
function backgroundColor(u, v) {
  const d = Math.hypot(u, v);
  return mix(INK, mix(INK, PULSE, 0.55), Math.exp(-Math.pow(d / 0.42, 2)) * 0.34);
}

/**
 * Bir kareyi çizer.
 *
 * @param size      hedef kenar uzunluğu (px)
 * @param draw      (u, v) -> { color:[r,g,b], alpha:0..1 }
 */
function render(size, draw) {
  const big = size * SS;
  const png = new PNG({ width: size, height: size });
  const acc = new Float64Array(size * size * 4);

  for (let y = 0; y < big; y++) {
    const v = (y + 0.5) / big - 0.5;
    const ty = (y / SS) | 0;
    for (let x = 0; x < big; x++) {
      const u = (x + 0.5) / big - 0.5;
      const { color, alpha } = draw(u, v);
      const i = (ty * size + ((x / SS) | 0)) * 4;
      // Kenar yumuşatma için renk, alfa ile ağırlıklandırılarak toplanır.
      acc[i] += color[0] * alpha;
      acc[i + 1] += color[1] * alpha;
      acc[i + 2] += color[2] * alpha;
      acc[i + 3] += alpha;
    }
  }

  const samples = SS * SS;
  for (let p = 0; p < size * size; p++) {
    const i = p * 4;
    const a = acc[i + 3] / samples;
    // Ağırlıklı toplamdan düz renge dönüş (premultiplied → straight).
    const w = acc[i + 3] || 1;
    png.data[i] = Math.round(clamp(acc[i] / w, 0, 255));
    png.data[i + 1] = Math.round(clamp(acc[i + 1] / w, 0, 255));
    png.data[i + 2] = Math.round(clamp(acc[i + 2] / w, 0, 255));
    png.data[i + 3] = Math.round(clamp(a) * 255);
  }
  return png;
}

/** İşareti belirli bir ölçekte çizen fonksiyon üretir. */
function markAt(scale, opts) {
  return (u, v) => mark(u / scale, v / scale, opts);
}

/** İşareti zeminin üstüne yerleştirir. */
function composite(scale, opts) {
  return (u, v) => {
    const bg = backgroundColor(u, v);
    const fg = mark(u / scale, v / scale, opts);
    return { color: mix(bg, fg.color, fg.alpha), alpha: 1 };
  };
}

function write(name, png) {
  const file = path.join(ASSETS, name);
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log(`✔ assets/${name} (${png.width}x${png.height})`);
}

function main() {
  // Tam simge — işaret kenarlardan rahat dursun diye biraz küçültülüyor.
  write('icon.png', render(1024, composite(0.82)));

  // Uyarlanabilir simge: ön plan, maskelenen alanın dışında kalmamalı.
  // Android 108dp tuvalin yalnızca ortadaki ~72dp'sini garanti ediyor,
  // bu yüzden işaret %60'a çekiliyor.
  write('android-icon-foreground.png', render(1024, markAt(0.6)));
  write('android-icon-background.png', render(1024, (u, v) => ({
    color: backgroundColor(u, v),
    alpha: 1,
  })));
  write('android-icon-monochrome.png', render(1024, markAt(0.6, { flat: true })));

  // Açılış ekranı: koyu zemin app.json'dan geliyor, işaret şeffaf.
  write('splash-icon.png', render(1024, markAt(0.95)));

  write('favicon.png', render(96, composite(0.82)));
}

main();
