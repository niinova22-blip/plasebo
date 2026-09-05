/**
 * Swift kaynakları için kaba bir yapı denetimi.
 *
 * Windows'ta Swift derleyicisi yok, yani bu dosyalar ancak bir EAS
 * derlemesi harcanarak sınanabiliyor. Bu betik derleyicinin yerini
 * tutmuyor; yalnızca derlemeyi düşüren ucuz ve sık hataları — dengesiz
 * parantez, kapanmamış `#if`, kapanmamış dize — daha ucuza yakalıyor.
 *
 * Ayrıca projeye özgü üç kural denetleniyor:
 *   1. iOS 16+ ile gelen kilit ekranı aileleri, sürüm koruması olmadan
 *      kullanılamaz (uzantının tabanı 15.1). İlk elden bilinen bir
 *      derleme hatası buydu.
 *   2. `FoundationModels` her Xcode'da yok; ona değen her satır
 *      `#if canImport(FoundationModels)` içinde kalmalı.
 *   3. Elle yazılmış `init(from:)` ya da `encode(to:)` varsa Swift
 *      `CodingKeys`i artık sentezlemiyor; enum açıkça yazılmalı. Widget
 *      uzantısı bir kez tam olarak bu yüzden derlenmedi.
 *
 * Çalıştırma: node scripts/check-swift.js
 */
const fs = require('fs');
const path = require('path');

const ROOTS = ['modules', 'plugins'];
const problems = [];

/** Dizeleri ve yorumları söker; sayım onların içindekilere takılmasın. */
function strip(source) {
  let out = '';
  let i = 0;
  let state = 'code';
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (state === 'code') {
      if (c === '/' && next === '/') {
        state = 'line';
        i += 2;
        continue;
      }
      if (c === '/' && next === '*') {
        state = 'block';
        i += 2;
        continue;
      }
      if (c === '"') {
        state = 'string';
        i += 1;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }
    if (state === 'line') {
      if (c === '\n') {
        state = 'code';
        out += '\n';
      }
      i += 1;
      continue;
    }
    if (state === 'block') {
      if (c === '*' && next === '/') {
        state = 'code';
        i += 2;
        continue;
      }
      if (c === '\n') out += '\n';
      i += 1;
      continue;
    }
    // state === 'string'
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '"') {
      state = 'code';
    }
    i += 1;
  }
  if (state === 'string') return null; // kapanmamış dize
  return out;
}

function checkBalance(file, code) {
  const pairs = { '{': '}', '(': ')', '[': ']' };
  const closers = { '}': '{', ')': '(', ']': '[' };
  const stack = [];
  let line = 1;
  for (const ch of code) {
    if (ch === '\n') line += 1;
    if (pairs[ch]) stack.push({ ch, line });
    else if (closers[ch]) {
      const top = stack.pop();
      if (!top || top.ch !== closers[ch]) {
        problems.push(`${file}:${line} eşleşmeyen '${ch}'`);
        return;
      }
    }
  }
  if (stack.length) {
    const top = stack[stack.length - 1];
    problems.push(`${file}:${top.line} kapanmamış '${top.ch}'`);
  }
}

function checkDirectives(file, source) {
  const lines = source.split('\n');
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith('#if')) depth += 1;
    else if (t.startsWith('#endif')) depth -= 1;
    if (depth < 0) {
      problems.push(`${file}:${i + 1} fazladan #endif`);
      return;
    }
  }
  if (depth !== 0) problems.push(`${file} kapanmamış #if (${depth})`);
}

/** iOS 16 ile gelen aileler, sürüm koruması olmadan yazılamaz. */
function checkAvailability(file, source) {
  const guarded = /#available\(iOS 16/.test(source);
  const usesAccessory = /\.accessory(Rectangular|Inline|Circular)/.test(source);
  if (usesAccessory && !guarded) {
    problems.push(
      `${file} kilit ekranı aileleri kullanıyor ama #available(iOS 16) koruması yok`
    );
  }
}

/** FoundationModels'a değen her satır canImport korumasında olmalı. */
function checkFoundationModels(file, source) {
  if (!/SystemLanguageModel|LanguageModelSession/.test(source)) return;
  if (!/#if canImport\(FoundationModels\)/.test(source)) {
    problems.push(`${file} FoundationModels kullanıyor ama canImport koruması yok`);
  }
}

/**
 * Elle yazılmış `init(from:)` / `encode(to:)` sentezi kapatır.
 *
 * Swift, `CodingKeys` enum'unu yalnızca çözücüyü/kodlayıcıyı da kendisi
 * ürettiğinde sentezliyor. Biri elle yazıldığında enum yoksa dosya
 * derlenmiyor ve asıl hata ("cannot find 'CodingKeys' in scope") onlarca
 * takip hatasının altında kayboluyor. Widget uzantısı bir kez tam olarak
 * bu yüzden derlenmedi.
 */
function checkCodingKeys(file, source) {
  const manual =
    /init\s*\(\s*from\s+\w+\s*:\s*Decoder/.test(source) ||
    /func\s+encode\s*\(\s*to\s+\w+\s*:\s*Encoder/.test(source);
  if (!manual) return;
  if (!/enum\s+CodingKeys\b/.test(source)) {
    problems.push(`${file} elle init(from:)/encode(to:) var ama enum CodingKeys yok`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.swift')) check(full);
  }
}

let count = 0;
function check(file) {
  count += 1;
  const source = fs.readFileSync(file, 'utf8');
  const code = strip(source);
  if (code === null) {
    problems.push(`${file} kapanmamış dize`);
    return;
  }
  checkBalance(file, code);
  checkDirectives(file, source);
  checkAvailability(file, source);
  checkFoundationModels(file, source);
  checkCodingKeys(file, source);
}

for (const root of ROOTS) {
  if (fs.existsSync(root)) walk(root);
}

if (problems.length) {
  console.error(`SWIFT DENETİMİ: ${problems.length} sorun`);
  for (const p of problems) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log(`SWIFT DENETİMİ: ${count} dosya, sorun yok`);
