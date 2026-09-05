/**
 * Bütün denetimleri sırayla çalıştırır.
 *
 * Bir EAS derlemesi hem yavaş hem sınırlı; bu yüzden derlemeden **önce**
 * yerelde yakalanabilecek her şeyin yakalanması gerekiyor. Buradaki altı
 * adım tam olarak bunun için:
 *
 *   1. typecheck  — TypeScript tarafında tip hatası kalmasın.
 *   2. logic      — ölçüm ve istatistik fonksiyonları doğru sayı üretsin.
 *   3. plugin     — widget uzantısı Xcode projesine doğru bağlansın.
 *   4. podfile    — Pod kaynak paketleri imza hatasıyla derlemeyi düşürmesin.
 *   5. swift      — Swift kaynaklarında ucuz yapı hataları kalmasın.
 *   6. i18n       — İngilizce sürümde eksik metin kalmasın.
 *
 * Çalıştırma: npm test
 */
const { spawnSync } = require('child_process');

const steps = [
  { name: 'TypeScript', cmd: 'npx', args: ['tsc', '--noEmit'] },
  { name: 'Mantık testleri', cmd: 'npx', args: ['tsx', 'src/__tests__/logic.test.ts'] },
  { name: 'Widget eklentisi', cmd: 'node', args: ['plugins/__tests__/ios-widget.test.js'] },
  {
    name: 'Podfile imza yaması',
    cmd: 'node',
    args: ['plugins/__tests__/podfile-post-install.test.js'],
  },
  { name: 'Swift yapısı', cmd: 'node', args: ['scripts/check-swift.js'] },
  { name: 'Çeviri kapsamı', cmd: 'node', args: ['scripts/check-i18n.js'] },
];

const failures = [];

for (const step of steps) {
  console.log(`\n${'='.repeat(58)}\n${step.name}\n${'='.repeat(58)}`);
  const result = spawnSync(step.cmd, step.args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) failures.push(step.name);
}

console.log(`\n${'='.repeat(58)}`);
if (failures.length) {
  console.error(`SONUÇ: ${failures.length} adım düştü → ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`SONUÇ: ${steps.length}/${steps.length} adım geçti — derlemeye hazır.`);
