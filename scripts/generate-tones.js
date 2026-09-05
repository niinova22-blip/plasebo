/**
 * Plasebo — ses üretici
 *
 * Ritüelin "ses" adımı için döngülenen WAV dosyaları üretir. Dosyalar
 * uygulama içinde `loop` ile formülün istediği süre kadar çalınır.
 *
 * Kullanım: node scripts/generate-tones.js
 *
 * ---------------------------------------------------------------------
 * Kalite notları (ilk sürümden neyin, neden değiştiği)
 *
 * İlk sürüm 22.05 kHz'de, 5 saniyelik dosyalar üretiyordu ve gürültü
 * dosyalarının başına/sonuna 100 ms fade konuyordu. İkisi de kulakta
 * belliydi:
 *
 *   1. 22 kHz örnekleme, duyulabilir bandı 11 kHz'de kesiyor — bu yüzden
 *      her şey "boğuk/uğultulu" çıkıyordu. Artık 44.1 kHz.
 *   2. Fade in/out, döngünün her turunda sesin kısılıp açılmasına yol
 *      açıyordu; tekrar noktası bu yüzden net duyuluyordu. Fade tamamen
 *      kaldırıldı. Yerine **sarmalı çapraz geçiş** kondu: ses, döngü
 *      uzunluğundan fazla üretilip fazlalık başlangıçla eşit güçte
 *      harmanlanıyor, böylece dosyanın sonu ile başı matematiksel olarak
 *      birbirinin devamı oluyor (bkz. `seamless`).
 *   3. 5 saniyelik döngü, gürültüde bile "desen" olarak duyuluyordu.
 *      Gürültüler 12, tonlar 8, çanlar 12 saniyeye çıkarıldı.
 *   4. Tonlar tek sinüstü ve steril/vızıltılı duyuluyordu. Artık
 *      harmonikleri, hafif hareketi ve çanlarda reverb kuyruğu var.
 *
 * Döngünün dikişsiz olmasının iki yolu var; ikisi de burada kullanılıyor:
 *   • Periyodik sesler (sinüs, dron): frekans × süre tam sayı olacak
 *     şekilde seçilir, dalga tam turda kapanır.
 *   • Periyodik olmayan sesler (gürültü, yağmur): sarmalı çapraz geçiş.
 *   • Çan/kâse: vuruş, döngü bitmeden tamamen sönümlenir; dosyanın sonu
 *     zaten sessizliktir, dolayısıyla dikiş yoktur.
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'audio');

/* ------------------------------------------------------------------ */
/* WAV yazımı                                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {string} filename
 * @param {Float32Array | Float32Array[]} samples tek kanal ya da [sol, sağ]
 */
function writeWav(filename, samples) {
  const channels = Array.isArray(samples) ? samples : [samples];
  const channelCount = channels.length;
  const frameCount = channels[0].length;
  const dataLength = frameCount * channelCount * 2;
  const buffer = Buffer.alloc(44 + dataLength);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2 * channelCount, 28); // byte rate
  buffer.writeUInt16LE(2 * channelCount, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  let offset = 44;
  for (let i = 0; i < frameCount; i++) {
    for (let c = 0; c < channelCount; c++) {
      const clamped = Math.max(-1, Math.min(1, channels[c][i]));
      // 16-bit'e yuvarlarken TPDF dither: sabit tonlarda kuantizasyon
      // çarpıtmasını duyulmaz gürültüye çevirir.
      const dither = (Math.random() + Math.random() - 1) / 32768;
      const v = Math.max(-1, Math.min(1, clamped + dither));
      buffer.writeInt16LE(Math.round(v * 32767), offset);
      offset += 2;
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
  const seconds = frameCount / SAMPLE_RATE;
  console.log(
    `✓ ${filename.padEnd(24)} ${seconds.toFixed(0)}s · ${channelCount === 2 ? 'stereo' : 'mono'} · ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
  );
}

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const samples = (seconds) => Math.round(seconds * SAMPLE_RATE);

/** Tepe değeri hedefe çeken normalizasyon — dosyalar arası seviye farkını kapatır. */
function normalize(buf, peak = 0.8) {
  let max = 0;
  for (let i = 0; i < buf.length; i++) max = Math.max(max, Math.abs(buf[i]));
  if (max === 0) return buf;
  const k = peak / max;
  for (let i = 0; i < buf.length; i++) buf[i] *= k;
  return buf;
}

/** RBJ biquad katsayıları. type: 'lowpass' | 'highpass' | 'bandpass' */
function biquad(type, freq, q = 0.707) {
  const w0 = (TAU * freq) / SAMPLE_RATE;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * q);
  let b0, b1, b2;
  switch (type) {
    case 'highpass':
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = b0;
      break;
    case 'bandpass':
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      break;
    case 'lowpass':
    default:
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = b0;
      break;
  }
  const a0 = 1 + alpha;
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: (-2 * cos) / a0,
    a2: (1 - alpha) / a0,
  };
}

/** Biquad'ı diziye uygular (yeni dizi döner). */
function filter(buf, coeffs) {
  const out = new Float32Array(buf.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x0 = buf[i];
    const y0 =
      coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
    out[i] = y0;
  }
  return out;
}

/**
 * Periyodik bir döngüye süzgeç uygularken kullanılır.
 *
 * Süzgeçler nedensel: ilk örneklerde henüz oturmamış olurlar, dolayısıyla
 * dosyanın başı ile sonu artık birbirinin devamı olmaz — döngüde tık
 * duyulur (`deep_drone` ilk denemede tam olarak bunu yapıyordu). Çözüm:
 * sesi üç kez arka arkaya süzüp ortadaki turu almak. Ortadaki tur,
 * süzgecin kalıcı rejimidir ve kendi başına dikişsizdir.
 */
function filterPeriodic(buf, coeffs) {
  const n = buf.length;
  const tripled = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) tripled[i] = buf[i % n];
  const filtered = filter(tripled, coeffs);
  return filtered.slice(n, n * 2);
}

/**
 * Dikişsiz döngü: `make(n)` ile döngü uzunluğundan `xf` kadar fazla ses
 * üretilir, sondaki fazlalık başlangıçla eşit güçte harmanlanır.
 *
 * Sonuç: dosyanın son örneğinin ardından ilk örnek geldiğinde dalga
 * biçimi kesintisiz devam eder — ne tık, ne de fade'in yol açtığı
 * "nefes alma" duyulur.
 */
function seamless(seconds, make, crossfadeSeconds = 2) {
  const n = samples(seconds);
  const xf = samples(crossfadeSeconds);
  const warm = samples(0.5); // filtre oturma payı, sonra atılır
  const raw = make(warm + n + xf);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = raw[warm + i];
  for (let i = 0; i < xf; i++) {
    const t = i / xf;
    // Eşit güç (sin/cos) — doğrusal harman ortada seviye düşürürdü.
    out[i] = out[i] * Math.sin((Math.PI * t) / 2) + raw[warm + n + i] * Math.cos((Math.PI * t) / 2);
  }
  return out;
}

/** Beyaz gürültü kaynağı. */
function white(n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

/** Schroeder reverb — çanlara mekân hissi veren kısa kuyruk. */
function reverb(buf, { mix = 0.32, decay = 0.78 } = {}) {
  const combDelays = [0.0297, 0.0371, 0.0411, 0.0437]; // saniye, asal oranlı
  const allpassDelays = [0.005, 0.0017];
  const wet = new Float32Array(buf.length);

  for (const d of combDelays) {
    const delay = samples(d);
    const line = new Float32Array(delay);
    let idx = 0;
    for (let i = 0; i < buf.length; i++) {
      const delayed = line[idx];
      wet[i] += delayed * 0.25;
      line[idx] = buf[i] + delayed * decay;
      idx = (idx + 1) % delay;
    }
  }

  let stage = wet;
  for (const d of allpassDelays) {
    const delay = samples(d);
    const line = new Float32Array(delay);
    const out = new Float32Array(buf.length);
    let idx = 0;
    const g = 0.5;
    for (let i = 0; i < buf.length; i++) {
      const delayed = line[idx];
      const v = stage[i] + delayed * -g;
      out[i] = delayed + v * g;
      line[idx] = v;
      idx = (idx + 1) % delay;
    }
    stage = out;
  }

  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] * (1 - mix) + stage[i] * mix;
  return out;
}

/**
 * Harmonik yığın. `partials`: [harmonik çarpanı, kazanç] çiftleri.
 * Frekanslar döngüde tam tur kapatsın diye `base` × `seconds` tam sayı
 * seçilmeli (aşağıdaki çağrılarda öyle).
 */
function harmonicTone(seconds, base, partials, { shimmerHz = 0, shimmer = 0 } = {}) {
  const n = samples(seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const [mult, gain] of partials) v += Math.sin(TAU * base * mult * t) * gain;
    if (shimmer > 0) v *= 1 - shimmer + shimmer * (0.5 + 0.5 * Math.sin(TAU * shimmerHz * t));
    out[i] = v;
  }
  return out;
}

/**
 * Vurmalı ton (çan/kâse): kısmi frekanslar ayrı sönüm hızlarıyla.
 * Kuyruk döngü bitmeden sıfıra indiği için dikiş oluşmaz.
 */
function struck(seconds, partials) {
  const n = samples(seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const p of partials) {
      v += Math.sin(TAU * p.freq * t + (p.phase ?? 0)) * p.gain * Math.exp(-t * p.decay);
    }
    // 3 ms'lik atak — örnek 0'da sıçrama olmasın diye.
    const attack = Math.min(1, i / samples(0.003));
    out[i] = v * attack;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Stereo                                                              */
/* ------------------------------------------------------------------ */

/**
 * Neden stereo?
 *
 * İlk sürümde binaural dışındaki her şey tek kanaldı. Tek kanallı bir
 * ped ya da gürültü kulaklıkta "kafanın ortasında" duruyor: kaynak
 * noktasal, alan yok. Bu, sesin kalitesizliğinden değil genişliğinin
 * olmamasından gelen bir his — ve kapatması en kolay fark bu.
 *
 * İki yöntem kullanılıyor:
 *
 *   • Gürültüler için **bağımsız iki kanal**: sol ve sağ ayrı üretiliyor.
 *     Tam genişlik verir ve mono'ya indiğinde (telefon hoparlörü) yine
 *     gürültü olarak toplanır — Haas gecikmesi ya da faz kaydırma gibi
 *     yöntemlerin aksine tarak (comb) filtresi oluşturmaz.
 *   • Tonlar için **karşıt fazlı yavaş kıpırtı**: iki kanalın parlaklığı
 *     ters yönlerde çok yavaş salınır. Frekanslar aynı kaldığı için mono
 *     toplamda hiçbir şey kaybolmaz, kulaklıkta ise ses "nefes alır".
 */

/** Aynı üreticiyi iki kez çalıştırıp bağımsız iki kanal üretir. */
function stereoIndependent(make) {
  return [make(), make()];
}

/**
 * Tek kanaldan, karşıt fazlı yavaş kıpırtıyla stereo.
 *
 * `rateHz` döngü uzunluğunda tam tur kapatmalı (8 sn için 0.125'in
 * katları), yoksa döngü başı ile sonu arasında seviye sıçraması olur.
 */
function stereoShimmer(buf, { rateHz = 0.125, depth = 0.16 } = {}) {
  const left = new Float32Array(buf.length);
  const right = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const lfo = Math.sin(TAU * rateHz * (i / SAMPLE_RATE));
    left[i] = buf[i] * (1 + depth * lfo);
    right[i] = buf[i] * (1 - depth * lfo);
  }
  return [normalize(left, 0.72), normalize(right, 0.72)];
}

/**
 * Vurmalı seslerde stereo: kuru sinyal ortada, reverb kuyruğu iki kanalda
 * ayrı hesaplanır. Kuyruklar birbirinden bağımsız olduğu için çan,
 * noktasal bir kaynak yerine küçük bir odada duruyormuş gibi çınlar.
 */
function stereoReverb(raw, opts) {
  const left = reverb(raw, opts);
  const right = reverb(raw, { ...opts, decay: (opts.decay ?? 0.8) * 0.94 });
  return [normalize(left, 0.78), normalize(right, 0.78)];
}

/* ------------------------------------------------------------------ */
/* Sesler                                                              */
/* ------------------------------------------------------------------ */

const TONE_SECONDS = 8;
const NOISE_SECONDS = 12;
const BELL_SECONDS = 12;

/**
 * Saf ton + zayıf harmonikler. Tek sinüs kulakta "sinyal" gibi duruyordu;
 * 2. ve 3. harmonik çok düşük kazançla eklenince ton yumuşuyor.
 */
function pureTone(freq) {
  return normalize(
    harmonicTone(
      TONE_SECONDS,
      freq,
      [
        [1, 1.0],
        [2, 0.06],
        [3, 0.025],
      ],
      { shimmerHz: 0.125, shimmer: 0.1 } // 8 sn'de tam 1 tur
    ),
    0.62
  );
}

/** 40Hz gama: 200Hz taşıyıcının 40Hz ile genlik modülasyonu. */
function gamma40() {
  const n = samples(TONE_SECONDS);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const carrier =
      Math.sin(TAU * 200 * t) * 1.0 + Math.sin(TAU * 400 * t) * 0.12 + Math.sin(TAU * 600 * t) * 0.05;
    // Modülasyon derinliği bilerek düşük: %85'te saniyede 40 kez sıfıra
    // yaklaşan zarf, küçük hoparlörde "pat pat" gibi duyuluyordu.
    const mod = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(TAU * 40 * t));
    out[i] = carrier * mod;
  }
  return normalize(out, 0.6);
}

/** Kahverengi gürültü: sızıntılı integral + DC'yi alan yüksek geçiren. */
function brownNoise() {
  const make = () => {
    const buf = seamless(NOISE_SECONDS, (n) => {
    const w = white(n);
    const out = new Float32Array(n);
    let last = 0;
    for (let i = 0; i < n; i++) {
      last = (last + 0.02 * w[i]) / 1.02;
      out[i] = last;
    }
    // 55Hz altı telefon hoparlöründe patlama/çıtırtıya dönüşüyor (bkz.
    // deepDrone'daki not), o bandı tamamen kesiyoruz.
      return filter(out, biquad('highpass', 55, 0.7));
    });
    return normalize(buf, 0.62);
  };
  return stereoIndependent(make);
}

/** Beyaz gürültü: 14 kHz üstü hafifçe yumuşatılmış — tiz ama kulak yakmıyor. */
function whiteNoise() {
  const make = () =>
    normalize(
      seamless(NOISE_SECONDS, (n) => filter(white(n), biquad('lowpass', 14000, 0.6))),
      0.62
    );
  return stereoIndependent(make);
}

/** Pembe gürültü: Paul Kellett filtresi (3 kutuplu yaklaşım). */
function pinkNoise() {
  const make = () => {
    const buf = seamless(NOISE_SECONDS, (n) => {
    const w = white(n);
    const out = new Float32Array(n);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) {
      b0 = 0.99765 * b0 + w[i] * 0.0990460;
      b1 = 0.96300 * b1 + w[i] * 0.2965164;
      b2 = 0.57000 * b2 + w[i] * 1.0526913;
      out[i] = b0 + b1 + b2 + w[i] * 0.1848;
    }
      return filter(out, biquad('highpass', 50, 0.7));
    });
    return normalize(buf, 0.66);
  };
  return stereoIndependent(make);
}

/**
 * Yağmur: üç katman — alçak zemin, bant sınırlı hışırtı ve seyrek
 * damlalar. Damlalar çapraz geçiş bölgesinin dışına yerleştiriliyor ki
 * döngü sırasında yarım kesilmesinler.
 */
function rainLayer() {
  const make = () => {
    const buf = seamless(
    NOISE_SECONDS,
    (n) => {
      const w = white(n);
      const bed = filter(w, biquad('lowpass', 700, 0.6));
      const hiss = filter(white(n), biquad('bandpass', 4200, 0.5));
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / SAMPLE_RATE;
        // Çok yavaş yoğunluk dalgası — yağmurun "gelip geçmesi".
        const swell = 0.82 + 0.18 * Math.sin(TAU * 0.07 * t);
        out[i] = (bed[i] * 1.6 + hiss[i] * 0.55) * swell;
      }
      // Damlalar: kısa, bant sınırlı, hızlı sönümlü.
      const dropCount = Math.floor((n / SAMPLE_RATE) * 7);
      const dropLen = samples(0.06);
      for (let d = 0; d < dropCount; d++) {
        const start = Math.floor(Math.random() * (n - dropLen));
        const freq = 900 + Math.random() * 2600;
        const gain = 0.05 + Math.random() * 0.09;
        for (let i = 0; i < dropLen; i++) {
          const t = i / SAMPLE_RATE;
          // 4 ms atak: damla tam genlikten başlarsa tık gibi duyuluyor.
          const attack = Math.min(1, i / samples(0.004));
          out[start + i] += Math.sin(TAU * freq * t) * gain * attack * Math.exp(-t * 90);
        }
      }
      return out;
    },
      2.5
    );
    return normalize(buf, 0.72);
  };
  // Yağmurun iki kanalı bağımsız: damlalar solda ve sağda ayrı yerlere
  // düşüyor, bu da tek katmanlı hışırtıyı gerçek bir yağmura yaklaştırıyor.
  return stereoIndependent(make);
}

/**
 * Binaural: iki kanal arasında sabit frekans farkı. Fark yalnızca
 * kulaklıkta "vuruş" olarak algılanır. Her iki frekans da 8 saniyede
 * tam tur kapatıyor (200×8, 210×8, 206×8 tam sayı).
 */
function binaural(leftHz, rightHz) {
  const n = samples(TONE_SECONDS);
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Aynı harmonik yapı iki kanalda — tek sinüsten daha dolgun.
    left[i] = Math.sin(TAU * leftHz * t) + Math.sin(TAU * leftHz * 2 * t) * 0.07;
    right[i] = Math.sin(TAU * rightHz * t) + Math.sin(TAU * rightHz * 2 * t) * 0.07;
  }
  normalize(left, 0.6);
  normalize(right, 0.6);
  return [left, right];
}

/**
 * Derin uğultu: 110Hz (A2) temelli harmonik yığın.
 *
 * İlk sürüm 55Hz'den (A1) kuruluydu ve telefon hoparlöründe "patlama"
 * gibi duyuluyordu. Sebep dosyada bir hata değil, fiziksel bir sınır:
 * telefon hoparlörleri ~300Hz altını üretemez, o bandı beslediğinde
 * diyafram kendi sınırına dayanır ve düzgün ton yerine çıtırtı/patlama
 * çıkarır. Temel 110Hz'e taşındı, 55Hz yalnızca çok düşük kazançlı bir
 * "alt renk" olarak duruyor ve 60Hz altı süzülüyor — kulaklıkta gövde
 * korunuyor, hoparlörde patlama kalmıyor.
 */
function deepDrone() {
  const tone = harmonicTone(
    TONE_SECONDS,
    55,
    [
      [1, 0.12], // 55Hz — yalnızca renk
      [2, 1.0], // 110Hz temel
      [3, 0.34], // 165Hz
      [4, 0.2],
      [6, 0.09],
      [8, 0.04],
    ],
    { shimmerHz: 0.25, shimmer: 0.18 }
  );
  const shaped = filterPeriodic(tone, biquad('lowpass', 1400, 0.7));
  return normalize(filterPeriodic(shaped, biquad('highpass', 60, 0.7)), 0.7);
}

/**
 * Tibet kâsesi: hafif uyumsuz kısmi frekanslar (gerçek kâseler tam
 * harmonik değildir), uzun sönüm ve reverb kuyruğu.
 */
function tibetanBowl() {
  const raw = struck(BELL_SECONDS, [
    { freq: 214.5, gain: 1.0, decay: 0.55 },
    { freq: 432.8, gain: 0.5, decay: 0.75 },
    { freq: 641.2, gain: 0.28, decay: 1.05, phase: 0.7 },
    { freq: 985.6, gain: 0.16, decay: 1.5, phase: 1.4 },
    { freq: 1523.4, gain: 0.07, decay: 2.2, phase: 2.1 },
  ]);
  return stereoReverb(raw, { mix: 0.34, decay: 0.8 });
}

/** Kristal çan: daha parlak, daha seyrek kısmi frekanslar, hızlı sönüm. */
function crystalChime() {
  const raw = struck(BELL_SECONDS, [
    { freq: 659.3, gain: 1.0, decay: 1.1 },
    { freq: 1318.5, gain: 0.34, decay: 1.6 },
    { freq: 1976.0, gain: 0.14, decay: 2.4, phase: 0.9 },
    { freq: 2637.0, gain: 0.06, decay: 3.4, phase: 1.8 },
    { freq: 3956.0, gain: 0.02, decay: 4.6, phase: 2.6 },
  ]);
  return stereoReverb(raw, { mix: 0.4, decay: 0.82 });
}

/* ------------------------------------------------------------------ */
/* Tonal dokular — gürültülerin yerine                                 */
/* ------------------------------------------------------------------ */

/**
 * Zamana yayılmış vuruşlar.
 *
 * Beyaz/pembe/kahverengi gürültü ve yağmur katmanı kaldırıldı: dördü de
 * geniş bantlı gürültüydü ve uzun dinlemede dinlendirmek yerine yoruyordu.
 * Yerlerine gelen sesler tınılı — yani bir perdesi var. Dikişsizlik burada
 * kendiliğinden sağlanıyor: son vuruş döngü bitmeden tamamen sönümlendiği
 * için dosyanın sonu sessizliktir.
 */
function plucked(seconds, events) {
  const n = samples(seconds);
  const out = new Float32Array(n);
  for (const ev of events) {
    const start = samples(ev.at);
    const slowest = Math.min(...ev.partials.map((p) => p.decay));
    // Duyulmaz hâle geldiği yerde kes — tüm dosyayı taramaya gerek yok.
    const tail = Math.min(n - start, samples(Math.log(1e5) / slowest));
    for (let i = 0; i < tail; i++) {
      const t = i / SAMPLE_RATE;
      let v = 0;
      for (const p of ev.partials) {
        v += Math.sin(TAU * p.freq * t + (p.phase ?? 0)) * p.gain * Math.exp(-t * p.decay);
      }
      const attack = Math.min(1, i / samples(0.004));
      out[start + i] += v * attack * (ev.gain ?? 1);
    }
  }
  return out;
}

/** Bir notanın kısmi frekansları: temel + oktav + beşli, azalan kazançla. */
function note(freq, { decay = 1.1, bright = 1 } = {}) {
  return [
    { freq, gain: 1.0, decay },
    { freq: freq * 2, gain: 0.4 * bright, decay: decay * 1.45 },
    { freq: freq * 3, gain: 0.16 * bright, decay: decay * 2.0, phase: 0.6 },
    { freq: freq * 4.2, gain: 0.05 * bright, decay: decay * 2.8, phase: 1.3 },
  ];
}

/**
 * Handpan: D minör pentatonik, orta register, geniş aralıklarla vurulmuş.
 * Vuruşlar arası boşluk bilerek uzun — doldurulmuş bir ses değil, nefes
 * alan bir ses isteniyor.
 */
function handpan() {
  const D3 = 146.83, F3 = 174.61, A3 = 220, C4 = 261.63, D4 = 293.66, E4 = 329.63;
  const events = [
    { at: 0.0, freq: D3, gain: 1.0 },
    { at: 1.7, freq: A3, gain: 0.72 },
    { at: 3.0, freq: F3, gain: 0.6 },
    { at: 4.5, freq: C4, gain: 0.66 },
    { at: 5.9, freq: D4, gain: 0.55 },
    { at: 7.2, freq: A3, gain: 0.5 },
    { at: 8.6, freq: E4, gain: 0.44 },
    { at: 9.9, freq: D3, gain: 0.6 },
  ].map((e) => ({ at: e.at, gain: e.gain, partials: note(e.freq, { decay: 0.85 }) }));
  return stereoReverb(plucked(BELL_SECONDS, events), { mix: 0.34, decay: 0.8 });
}

/**
 * Kalimba: küçük, parlak, desenli. Handpan'den register ve yoğunlukla
 * ayrılıyor — notalar daha sık ve daha yukarıda.
 */
function kalimba() {
  const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880;
  const pattern = [C5, G5, E5, A5, D5, G5, C5, E5, D5, G5, A5, E5];
  const events = pattern.map((freq, i) => ({
    at: 0.15 + i * 0.92,
    gain: i % 3 === 0 ? 0.9 : 0.62,
    partials: note(freq, { decay: 1.9, bright: 0.7 }),
  }));
  return stereoReverb(plucked(BELL_SECONDS, events), { mix: 0.38, decay: 0.78 });
}

/**
 * Rüzgâr çanları: seyrek, yüksek, düzensiz aralıklı. Zamanlamalar elle
 * yazıldı — rastgele üretilseydi her derlemede başka bir dosya çıkardı.
 */
function windChimes() {
  const notes = [1046.5, 1244.5, 1396.9, 1568.0, 1864.7, 2093.0];
  const times = [0.2, 0.55, 1.9, 2.15, 3.7, 5.1, 5.35, 6.8, 8.2, 8.5, 9.6];
  const events = times.map((at, i) => ({
    at,
    gain: 0.4 + ((i * 7) % 5) * 0.1,
    partials: note(notes[(i * 5) % notes.length], { decay: 1.6, bright: 0.5 }),
  }));
  return stereoReverb(plucked(BELL_SECONDS, events), { mix: 0.45, decay: 0.84 });
}

/**
 * Sıcak ped: Am9 akoru (A2-A3-C4-E4-B4), sürekli ve yumuşak.
 *
 * Bütün frekanslar 0.125 Hz'in katı seçildi; 8 saniyelik döngüde her biri
 * tam turda kapandığı için başa dönüşte sıçrama olmuyor.
 */
function warmPad() {
  const voices = [
    [110.0, 0.55],
    [220.0, 0.4],
    [261.625, 0.3],
    [329.625, 0.26],
    [493.875, 0.16],
  ];
  const n = samples(TONE_SECONDS);
  const out = new Float32Array(n);
  voices.forEach(([freq, gain], index) => {
    const v = harmonicTone(
      TONE_SECONDS,
      freq,
      [
        [1, 1.0],
        [2, 0.14],
        [3, 0.05],
      ],
      // Her ses ayrı hızda kıpırdıyor: birlikte "koro" hissi veriyor.
      // Hızlar 0.125'in katı, yani 8 saniyede tam tur kapatıyor.
      { shimmerHz: 0.125 * (index + 1), shimmer: 0.12 }
    );
    for (let i = 0; i < n; i++) out[i] += v[i] * gain;
  });
  const shaped = filterPeriodic(out, biquad('lowpass', 2200, 0.7));
  return stereoShimmer(normalize(shaped, 0.75), { rateHz: 0.125, depth: 0.18 });
}

/**
 * Arayüz tıklaması: tanıtım akışındaki "Sonraki" düğmesi için kısa,
 * yumuşak bir tık.
 *
 * Ritüel sesleriyle aynı ailede dursun diye saf vuruş kullanılıyor —
 * telefonun kendi klik sesi gibi kuru değil, hafif tınılı. 90 ms'de
 * biter; daha uzunu arka arkaya basıldığında üst üste biniyor.
 */
function uiTap() {
  const seconds = 0.25;
  const n = samples(seconds);
  const out = new Float32Array(n);
  const partials = [
    { freq: 1320, gain: 1.0, decay: 42 },
    { freq: 1980, gain: 0.35, decay: 60 },
    { freq: 660, gain: 0.3, decay: 30 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const p of partials) v += Math.sin(TAU * p.freq * t) * p.gain * Math.exp(-t * p.decay);
    // 1.5 ms atak — tık, çıtırtıya dönüşmeden yumuşak başlasın.
    const attack = Math.min(1, i / samples(0.0015));
    out[i] = v * attack;
  }
  return normalize(filter(out, biquad('lowpass', 6000, 0.7)), 0.5);
}

/* ------------------------------------------------------------------ */

fs.mkdirSync(OUT_DIR, { recursive: true });

// Tonlar karşıt fazlı kıpırtıyla, gürültüler bağımsız iki kanalla,
// çanlar ayrı reverb kuyruklarıyla stereo yazılıyor.
writeWav('40hz_gamma.wav', stereoShimmer(gamma40(), { rateHz: 0.125, depth: 0.1 }));
writeWav('528hz_solfeggio.wav', stereoShimmer(pureTone(528)));
writeWav('432hz_verdi.wav', stereoShimmer(pureTone(432)));
writeWav('handpan.wav', handpan());
writeWav('kalimba.wav', kalimba());
writeWav('wind_chimes.wav', windChimes());
writeWav('warm_pad.wav', warmPad());
writeWav('deep_drone.wav', stereoShimmer(deepDrone(), { rateHz: 0.125, depth: 0.2 }));
writeWav('tibetan_bowl.wav', tibetanBowl());
writeWav('crystal_chime.wav', crystalChime());
writeWav('binaural_alpha.wav', binaural(200, 210));
writeWav('binaural_theta.wav', binaural(200, 206));

writeWav('ui_tap.wav', uiTap());
