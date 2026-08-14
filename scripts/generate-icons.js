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
 *   assets/notification-icon.png           256  bildirim küçük simgesi (siluet)
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
 * İşaret bir **kapsül**: eğik duran, ortadan ikiye ayrılmış bir hap.
 * Önceki sürüm iç içe halkalardan oluşuyordu ve küçültüldüğünde kamera
 * lensine benziyordu — uygulamayla hiçbir ilgisi olmayan bir çağrışım.
 * Kapsül ise uygulamanın kendisini anlatıyor: içinde etkin madde olmayan
 * bir hap. Üst yarısı mor, alt yarısı yeşil; ikisi arasında ince bir dikiş.
 *
 * `u`, `v` merkeze göre -0.5..0.5 aralığında normalize edilmiş koordinat.
 */
function mark(u, v, opts = {}) {
  const { halo = true, flat = false } = opts;

  // --- kapsülün geometrisi ------------------------------------------
  const ANGLE = (-38 * Math.PI) / 180; // sağ üste doğru eğik
  const HALF = 0.135; // gövdenin yarı uzunluğu
  const R = 0.115; // uçların yarıçapı
  const dirX = Math.cos(ANGLE);
  const dirY = Math.sin(ANGLE);

  // Noktanın eksen üzerindeki izdüşümü ve eksene uzaklığı.
  const t = clamp(u * dirX + v * dirY, -HALF, HALF);
  const px = u - dirX * t;
  const py = v - dirY * t;
  const d = Math.hypot(px, py); // eksene dik uzaklık
  const along = u * dirX + v * dirY; // hangi yarıda?

  const bodyA = 1 - smoothstep(R - 0.005, R + 0.005, d);

  // --- dikiş: iki yarının arasındaki ince çizgi ----------------------
  const seam = 1 - smoothstep(0.004, 0.010, Math.abs(along));

  if (flat) {
    // Tek renk siluet (bildirim simgesi, temalı simge): dolu kapsül.
    return { color: [255, 255, 255], alpha: clamp(bodyA) };
  }

  // --- renkler -------------------------------------------------------
  // Üst yarı mor, alt yarı yeşil; her ikisinde de içten dışa hafif koyulaşma.
  // İki yarı arasında çok dar bir geçiş: dikiş keskin kalsın ama
  // pikselleşmesin.
  const side = smoothstep(-0.006, 0.006, along);
  const MINT = [0x8c, 0xf0, 0xa8]; // neon yeşil yerine daha yumuşak nane
  const half = mix(MINT, PULSE, side);
  const edge = 1 - smoothstep(R * 0.35, R, d); // merkeze yakın yerler parlak
  let color = mix(mix(half, [0, 0, 0], 0.18), lightenOf(half), edge * 0.75);

  // Sol üstten gelen ışık.
  const spec = smoothstep(0.9, 0.0, Math.hypot(u + 0.09, v + 0.1) / (R * 2.4));
  color = mix(color, LIGHT, spec * 0.35);

  // Dikiş, gövdeyi koyultarak çiziliyor.
  color = mix(color, [0x14, 0x14, 0x1a], seam * 0.55 * bodyA);

  // --- ışıma ---------------------------------------------------------
  const haloA = halo ? Math.exp(-Math.pow((d - R) / 0.105, 2)) * 0.38 : 0;
  // Işımanın rengi geniş bir bantta karışıyor; sert geçiş, zeminde
  // kapsülün dışına taşan bir çapraz çizgi bırakıyordu.
  const haloColor = mix([0x8c, 0xf0, 0xa8], PULSE, smoothstep(-0.22, 0.22, along));

  const out = [0, 0, 0];
  let alpha = 0;
  const layers = [
    { c: haloColor, a: clamp(haloA) },
    { c: color, a: clamp(bodyA) },
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

/** Bir rengin açık tonu — kapsülün iç parlaklığı için. */
function lightenOf(c) {
  return mix(c, [255, 255, 255], 0.45);
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
  write('icon.png', render(1024, composite(0.92)));

  // Uyarlanabilir simge: ön plan, maskelenen alanın dışında kalmamalı.
  // Android 108dp tuvalin yalnızca ortadaki ~72dp'sini garanti ediyor,
  // bu yüzden işaret %60'a çekiliyor.
  write('android-icon-foreground.png', render(1024, markAt(0.66)));
  write('android-icon-background.png', render(1024, (u, v) => ({
    color: backgroundColor(u, v),
    alpha: 1,
  })));
  write('android-icon-monochrome.png', render(1024, markAt(0.66, { flat: true })));

  // Açılış ekranı: koyu zemin app.json'dan geliyor, işaret şeffaf.
  write('splash-icon.png', render(1024, markAt(1.0)));

  // Bildirim simgesi: Android küçük simgeyi tek renge indirip kendi
  // rengiyle boyar, o yüzden şeffaf zeminde beyaz siluet olmalı.
  write('notification-icon.png', render(256, markAt(0.78, { flat: true })));

  write('favicon.png', render(96, composite(0.92)));
}

main();
