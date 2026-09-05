/**
 * Çeviri kapsamı denetimi.
 *
 * Uygulama Türkçe yazılıp `t()` ile İngilizceye çevriliyor; karşılığı
 * olmayan bir metin uygulamayı bozmuyor, sadece o satırı İngilizce
 * arayüzde Türkçe bırakıyor. Sessiz olduğu için de gözden kaçıyor.
 *
 * Bu betik `t('...')` biçiminde **doğrudan yazılmış** metinleri toplayıp
 * sözlükte karşılığı olmayanları listeliyor. Değişkenle çağrılanlar
 * (`t(complaint.label)`) statik olarak izlenemiyor; onlar zaten sabit
 * dosyalarındaki anahtarlar ve elle denetleniyor.
 *
 * Çalıştırma: node scripts/check-i18n.js
 */
const fs = require('fs');
const path = require('path');

const SRC = 'src';
const DICT = path.join('src', 'i18n', 'en.ts');

/** Sözlükteki anahtarlar — `'anahtar':` satırlarından toplanıyor. */
function readDictionaryKeys() {
  const text = fs.readFileSync(DICT, 'utf8');
  const keys = new Set();
  // Anahtar satırı: iki boşluk + tırnaklı metin + iki nokta.
  const re = /^ {2}('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*:/gm;
  let m;
  while ((m = re.exec(text))) {
    keys.add(unquote(m[1]));
  }
  return keys;
}

function unquote(literal) {
  const quote = literal[0];
  const body = literal.slice(1, -1);
  return body.replace(new RegExp(`\\\\${quote}`, 'g'), quote).replace(/\\\\/g, '\\');
}

/** Kaynak dosyalardaki `t('...')` çağrılarının metinleri. */
function collectUsages(dir, found = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Testler ekran metni içermiyor; `i18n/` ise çeviri altyapısının
      // kendisi ve doküman yorumlarında örnek `t()` çağrıları geçiyor.
      if (entry.name === '__tests__' || entry.name === 'i18n') continue;
      collectUsages(full, found);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (full.replace(/\\/g, '/').endsWith('src/i18n/en.ts')) continue;

    const text = fs.readFileSync(full, 'utf8');
    // `t(` ardından (boşluk/satır sonu olabilir) tırnaklı bir metin.
    const re = /\bt\(\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
    let m;
    while ((m = re.exec(text))) {
      const key = unquote(m[1]);
      if (!key.trim()) continue;
      const line = text.slice(0, m.index).split('\n').length;
      if (!found.has(key)) found.set(key, `${full}:${line}`);
    }
  }
  return found;
}

/**
 * `t()` ile değil, sabit listelerden çevrilen metinler.
 *
 * Bildirim havuzu (`nudges.ts`) ekranda `t(nudge.title)` biçiminde
 * çevriliyor; değişkenle çağrıldığı için yukarıdaki tarama onu
 * göremiyor. Sonuç sessiz bir hataydı: havuza yeni bir bildirim
 * eklendiğinde denetim "eksik yok" diyor, İngilizce arayüzdeki
 * kullanıcıya ise Türkçe bildirim düşüyordu. Bu dosyalardaki
 * `title:`/`body:` metinleri de sözlükte aranıyor.
 */
const LITERAL_LISTS = [
  { file: path.join('src', 'constants', 'nudges.ts'), fields: ['title', 'body'] },
];

/**
 * Dizi hâlinde duran metinler — ritüelde akan hikâye cümleleri.
 *
 * `lines: [...]` içindeki her cümle `t()` ile çevriliyor; bunlar da
 * değişkenle çağrıldığı için yukarıdaki taramaya girmiyor.
 */
const LITERAL_ARRAYS = [
  { file: path.join('src', 'constants', 'calmingStories.ts'), field: 'lines' },
];

function collectLiteralArrays(found = new Map()) {
  for (const { file, field } of LITERAL_ARRAYS) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const blockRe = new RegExp(`\\b${field}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'g');
    let block;
    while ((block = blockRe.exec(text))) {
      const strRe = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
      let m;
      while ((m = strRe.exec(block[1]))) {
        const key = unquote(m[1]);
        if (!key.trim()) continue;
        const line = text.slice(0, block.index + m.index).split('\n').length;
        if (!found.has(key)) found.set(key, `${file}:${line}`);
      }
    }
  }
  return found;
}

function collectLiteralLists(found = new Map()) {
  for (const { file, fields } of LITERAL_LISTS) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const re = new RegExp(
      `\\b(${fields.join('|')})\\s*:\\s*('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`,
      'g'
    );
    let m;
    while ((m = re.exec(text))) {
      const key = unquote(m[2]);
      if (!key.trim()) continue;
      const line = text.slice(0, m.index).split('\n').length;
      if (!found.has(key)) found.set(key, `${file}:${line}`);
    }
  }
  return found;
}

const dictionary = readDictionaryKeys();
const usages = collectLiteralArrays(collectLiteralLists(collectUsages(SRC)));

const missing = [];
for (const [key, where] of usages) {
  if (!dictionary.has(key)) missing.push({ key, where });
}

console.log(`Sözlükte ${dictionary.size} anahtar, kodda ${usages.size} doğrudan metin.`);

if (missing.length) {
  console.error(`\nÇEVİRİ DENETİMİ: ${missing.length} metnin İngilizcesi yok`);
  for (const { key, where } of missing) {
    const short = key.length > 70 ? key.slice(0, 67) + '…' : key;
    console.error(`  ✗ ${where}\n      ${short}`);
  }
  process.exit(1);
}
console.log('ÇEVİRİ DENETİMİ: eksik yok');
