/**
 * Saf mantığın sınanması.
 *
 * Buradaki her şey React'ten, cihazdan ve yerel modüllerden bağımsız:
 * ölçüm, istatistik ve yorumlama fonksiyonları. Amaç, bir EAS derlemesi
 * harcamadan "sayılar doğru mu" sorusunu yanıtlamak — uygulamanın en
 * çok yalan söyleyebileceği yer burası, çünkü kullanıcı bu sayıları
 * kendi hakkında bir bilgi olarak okuyor.
 *
 * Çalıştırma: npm run test:logic
 */

import {
  FALSE_START_MS,
  TIMEOUT_MS,
  reactionChangePercent,
  reactionResultFrom,
} from '../utils/reaction';
import { breathMetricsFrom, breathRegularityFrom } from '../utils/breathSignal';
import {
  CALMING_STORIES,
  LINES_PER_STORY,
  pacedLines,
  storyFor,
  storyLineIndex,
} from '../constants/calmingStories';
import {
  ALL_GOALS,
  applyDose,
  formulaTotalSeconds,
  generateDailyFormula,
  poolsFor,
  seedFor,
} from '../utils/formulaEngine';
import {
  checkinsInLast24h,
  dailyReport,
  pruneCheckins,
  reportHeadline,
} from '../utils/dailyCycle';
import {
  mergeEmotions,
  scoreFromEmotions,
  topEmotion,
  type Emotions,
} from '../utils/faceMood';
import {
  BLIND_MIN_DIFFERENCE,
  BLIND_MIN_PER_GROUP,

  blindTestResult,
  ledgerSeries,
  sleepEffectSummary,
  weeklyFacts,
} from '../utils/storage';
import {
  GOOD_SLEEP_MINUTES,
  SHORT_SLEEP_MINUTES,
  sleepShiftsToCalm,
  sleepVerdict,
  splitSleep,
} from '../utils/sleepScale';
import { defaultUser } from '../utils/storage';
import {
  consumeFrom,
  normalizeQuota,
  quotaDayOf,
  remainingFrom,
} from '../utils/faceScanQuota';
import {
  parseDisplayPrice,
  yearlyDiscountPercent,
  yearlyPerMonth,
} from '../constants/pricing';
import type { Session, UserData } from '../types';

/*
 * Küçük bir doğrulayıcı.
 *
 * `node:assert` kullanılmıyor: onun tipleri `@types/node` gerektiriyor ve
 * yalnızca test için bir bağımlılık eklemek, uygulamanın kurulum adımına
 * dokunmak demek. Buradaki üç fonksiyon ihtiyacın tamamını karşılıyor.
 */
function fail(message: string): never {
  throw new Error(message);
}

function eq<T>(actual: T, expected: T, message?: string): void {
  if (!Object.is(actual, expected)) {
    fail(`${message ?? 'eşit değil'}
    beklenen: ${String(expected)}
    gelen:    ${String(actual)}`);
  }
}

function deepEq(actual: unknown, expected: unknown, message?: string): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) fail(`${message ?? 'derin eşitlik yok'}
    beklenen: ${b}
    gelen:    ${a}`);
}

function truthy(value: unknown, message?: string): void {
  if (!value) fail(message ?? 'doğru olması bekleniyordu');
}

let passed = 0;
function ok(label: string) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}
function group(name: string) {
  console.log(`\n${name}`);
}

/** Sınama için seans kurar; verilmeyen alanlar makul varsayılanlara düşer. */
function S(o: Partial<Session>): Session {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2026-08-27',
    formulaId: 1,
    goal: 'focus',
    score: 5,
    steps: [],
    formulaName: 'Test',
    colorHex: '#7B6EF6',
    ...o,
  } as Session;
}

function U(sessions: Session[]): UserData {
  return { ...defaultUser, sessions };
}

/* ==================================================================
 * Refleks ölçümü
 * ================================================================== */
group('Refleks');

eq(reactionResultFrom([300, 320, 310, 290, 305])!.medianMs, 305);
ok('ortanca tepki süresi doğru');

eq(
  reactionResultFrom([300, 320, 310, 290, 305])!.rounds,
  5,
  'beş tur da geçerli sayılmalı'
);
ok('geçerli tur sayısı doğru');

// Erken dokunuşlar (tahmin) ve zaman aşımları elenmeli.
const mixed = reactionResultFrom([FALSE_START_MS - 1, 300, 310, 320, TIMEOUT_MS + 1]);
eq(mixed!.rounds, 3, 'erken ve geç turlar elenmeli');
eq(mixed!.medianMs, 310);
ok('erken dokunuş ve zaman aşımı ölçüme girmiyor');

eq(reactionResultFrom([300, 310]), null, 'iki tur yetmemeli');
eq(reactionResultFrom([50, 60, 70]), null, 'hepsi erkense ölçüm yok');
ok('yetersiz veride sayı uydurmuyor');

// Tutarlılık: aynı hızda turlar 1'e yakın, savrulan turlar düşük olmalı.
const steady = reactionResultFrom([300, 300, 300, 300, 300])!;
const jumpy = reactionResultFrom([200, 400, 250, 500, 300])!;
truthy(steady.consistency > 0.99, `sabit turlar: ${steady.consistency}`);
truthy(jumpy.consistency < 0.8, `savrulan turlar: ${jumpy.consistency}`);
ok('tutarlılık savrulmayı yakalıyor');

eq(reactionChangePercent(400, 300), 25);
eq(reactionChangePercent(300, 400), -33);
eq(reactionChangePercent(0, 300), 0, 'sıfıra bölünmemeli');
ok('değişim yüzdesi doğru, sıfıra bölünmüyor');

/* ==================================================================
 * Nefes sinyali
 * ================================================================== */
group('Nefes');

const CYCLE = 12000;

/** Verilen döngüyle düzenli nefes alan bir dB dizisi üretir. */
function breathing(cycleMs: number, count = 300, jitter = 0) {
  return Array.from({ length: count }, (_, i) => {
    const t = i * 200;
    const wobble = jitter ? Math.sin(i) * jitter : 0;
    const phase = ((t + wobble) % cycleMs) / cycleMs;
    return { t, db: -50 + (phase > 0.5 && phase < 0.75 ? 20 : 0) };
  });
}

const silence = Array.from({ length: 200 }, (_, i) => ({
  t: i * 200,
  db: -40 + Math.random() * 0.4,
}));
eq(breathMetricsFrom(silence, CYCLE), null, 'sessizlik reddedilmeli');
ok('sessizlikten sahte düzenlilik üretmiyor');

const loudNoise = Array.from({ length: 300 }, (_, i) => ({
  t: i * 200,
  db: -60 + Math.random() * 30,
}));
eq(breathMetricsFrom(loudNoise, CYCLE), null, 'gürültü reddedilmeli');
ok('gürültüyü nefes sanmıyor');

eq(
  breathMetricsFrom(breathing(CYCLE, 40), CYCLE),
  null,
  'çok kısa kayıt reddedilmeli'
);
ok('çok kısa kayıtta ölçüm yok');

const clean = breathMetricsFrom(breathing(CYCLE), CYCLE)!;
truthy(clean, 'düzenli nefes ölçülebilmeli');
truthy(clean.regularity > 0.9, `düzenlilik: ${clean.regularity}`);
truthy(Math.abs(clean.breathsPerMinute - 5) < 0.5, `tempo: ${clean.breathsPerMinute}`);
truthy(clean.depth > 0.5, `derinlik: ${clean.depth}`);
ok('düzenli nefes doğru ölçülüyor (düzenlilik, tempo, derinlik)');

// Yönergeden hızlı nefes alındığında tempo **gerçek** değeri vermeli.
// Düzenlilik taraması beklenen döngüden türetilmiş bir boşluk kullanıyor
// ve o boşluk gerçek tepeleri eziyordu; tempo bu yüzden ayrı taranıyor.
const fast = breathMetricsFrom(breathing(3000), CYCLE);
truthy(fast, '3 saniyelik döngü ölçülebilmeli');
truthy(
  Math.abs(fast!.breathsPerMinute - 20) < 1,
  `hızlı nefes tempo: ${fast!.breathsPerMinute} (20 olmalı)`
);
ok('yönergeden hızlı nefeste tempo gerçek değeri veriyor');

// Tolerans içinde kalan yavaş bir ritim de doğru ölçülmeli.
// (16 sn / beklenen 12 sn = 1.33; üst tolerans 1.5.)
const slow = breathMetricsFrom(breathing(16000, 400), CYCLE);
truthy(slow, '16 saniyelik döngü ölçülebilmeli');
truthy(
  Math.abs(slow!.breathsPerMinute - 3.75) < 0.5,
  `yavaş nefes tempo: ${slow!.breathsPerMinute} (3.75 olmalı)`
);
ok('tolerans içindeki yavaş nefeste tempo doğru');

// Tolerans dışı bir ritim ise reddedilmeli: uygulama ritmi kendi
// dayattığı için ölçülen döngü ondan çok uzaksa sinyalin nefes olduğuna
// güvenilemez ve sayı uydurmak yerine "ölçüm yok" denir.
eq(
  breathMetricsFrom(breathing(20000, 400), CYCLE),
  null,
  'beklenen döngünün 1.67 katı reddedilmeli'
);
ok('tolerans dışı ritimde sayı uydurmuyor');

eq(
  breathRegularityFrom(breathing(CYCLE), CYCLE),
  clean.regularity,
  'eski API aynı değeri vermeli'
);
ok('geriye dönük uyumlu API aynı sonucu veriyor');

/* ==================================================================
 * Yüz analizi — çok kare birleştirme
 * ================================================================== */
group('Yüz analizi');

const calm: Emotions = {
  Anger: 0.05,
  Disgust: 0.05,
  Fear: 0.05,
  Happiness: 0.6,
  Neutral: 0.15,
  Sadness: 0.05,
  Surprise: 0.05,
};
const angry: Emotions = {
  Anger: 0.7,
  Disgust: 0.05,
  Fear: 0.05,
  Happiness: 0.05,
  Neutral: 0.05,
  Sadness: 0.05,
  Surprise: 0.05,
};

eq(mergeEmotions([]), null, 'kare yoksa sonuç yok');
deepEq(mergeEmotions([calm]), calm, 'tek kare olduğu gibi dönmeli');
ok('boş ve tek kare durumları doğru');

const merged = mergeEmotions([calm, angry, calm])!;
eq(topEmotion(merged), 'Happiness', 'sapan kare sonucu ele geçirmemeli');
truthy(
  Math.abs(scoreFromEmotions(merged) - scoreFromEmotions(calm)) <= 1,
  'medyan sapmayı elemeli'
);
ok('tek karelik sapma medyanla eleniyor');

const total = Object.values(merged).reduce((a, v) => a + v, 0);
truthy(Math.abs(total - 1) < 1e-9, `toplam 1 olmalı: ${total}`);
ok('birleştirilen dağılım yeniden normalize ediliyor');

truthy(scoreFromEmotions(angry) > scoreFromEmotions(calm), 'kızgın yüz daha kötü puan');
truthy(scoreFromEmotions(calm) >= 1 && scoreFromEmotions(angry) <= 10, 'ölçek 1-10');
ok('duygu → puan dönüşümü yönü ve sınırları doğru');

/* ==================================================================
 * Ölçüm defteri
 * ================================================================== */
group('Ölçüm defteri');

/*
 * Defter artık önce/sonra gösteriyor.
 *
 * Eskiden "beyan" ile "ölçüm" karşılaştırılıyordu; elle puan veren
 * kaydırıcı kalkıp iki uç da fotoğrafa taşınınca o çift anlamını
 * yitirdi — iki çubuk da aynı sayıyı çizerdi.
 */
const ledgerSessions = [
  S({ date: '2026-08-25', scoreBefore: 6, scoreAfter: 3 }),
  S({ date: '2026-08-26', scoreBefore: 5, scoreAfter: 2 }),
  S({ date: '2026-08-27', scoreBefore: 7, scoreAfter: 4 }),
];

const series = ledgerSeries(ledgerSessions, 7, '2026-08-27');
eq(series.length, 7);
eq(series[6].before, 7, 'bugünün öncesi');
eq(series[6].after, 4, 'bugünün sonrası');
eq(series[0].before, null, 'veri olmayan gün boş kalmalı');
eq(series[0].after, null);
ok('grafik serisi boş günleri sıfırla doldurmuyor');

// Aynı gün iki seans varsa ortalaması alınıyor.
const twice = ledgerSeries(
  [
    S({ date: '2026-08-27', scoreBefore: 8, scoreAfter: 4 }),
    S({ date: '2026-08-27', scoreBefore: 6, scoreAfter: 2 }),
  ],
  1,
  '2026-08-27'
);
eq(twice[0].before, 7, 'aynı günün öncesi ortalanmalı');
eq(twice[0].after, 3, 'aynı günün sonrası ortalanmalı');

// Ölçümü olmayan seans grafiği kirletmemeli.
const noScore = ledgerSeries([S({ date: '2026-08-27' })], 1, '2026-08-27');
eq(noScore[0].before, null, 'puansız seans boş kalmalı');
eq(noScore[0].after, null);
ok('ölçümsüz seans grafikte sıfır göstermiyor');

/* ==================================================================
 * Kör test
 * ================================================================== */
group('Kör test');

const blindEffect = blindTestResult([
  ...Array.from({ length: 4 }, () => S({ scoreBefore: 8, scoreAfter: 4, sham: false })),
  ...Array.from({ length: 4 }, () => S({ scoreBefore: 8, scoreAfter: 7, sham: true })),
])!;
eq(blindEffect.metric, 'effect', 'önce/sonra varsa etki ölçüsü');
eq(blindEffect.real, 4);
eq(blindEffect.sham, 1);
eq(blindEffect.difference, 3);
eq(blindEffect.meaningful, true);
ok('etki ölçüsü tercih ediliyor ve doğru hesaplanıyor');

const blindLegacy = blindTestResult([
  ...Array.from({ length: 4 }, () => S({ score: 8, sham: false })),
  ...Array.from({ length: 4 }, () => S({ score: 5, sham: true })),
])!;
eq(blindLegacy.metric, 'score', 'eski kayıtlarda gün sonu puanı');
eq(blindLegacy.real, 8);
ok('eski kayıtlar için gün sonu puanına düşüyor');

const tooFew = blindTestResult([
  ...Array.from({ length: 2 }, () => S({ scoreBefore: 8, scoreAfter: 3, sham: false })),
  ...Array.from({ length: 2 }, () => S({ scoreBefore: 8, scoreAfter: 7, sham: true })),
])!;
eq(
  tooFew.meaningful,
  false,
  `grup başına ${BLIND_MIN_PER_GROUP} kayıttan az yorumlanmamalı`
);
const tooClose = blindTestResult([
  ...Array.from({ length: 4 }, () => S({ scoreBefore: 8, scoreAfter: 5, sham: false })),
  ...Array.from({ length: 4 }, () => S({ scoreBefore: 8, scoreAfter: 5.5, sham: true })),
])!;
eq(
  tooClose.meaningful,
  false,
  `${BLIND_MIN_DIFFERENCE} puandan küçük fark yorumlanmamalı`
);
ok('yetersiz veri ve küçük fark "sonuç" sayılmıyor');

eq(
  blindTestResult([S({ sham: false }), S({ sham: false })]),
  null,
  'sahte gün yoksa karşılaştırma yok'
);
ok('tek taraflı veride kart hiç görünmüyor');

/* ==================================================================
 * Uyku
 * ================================================================== */
group('Uyku');

eq(sleepVerdict(SHORT_SLEEP_MINUTES - 1), 'short');
eq(sleepVerdict(SHORT_SLEEP_MINUTES), 'ok');
eq(sleepVerdict(GOOD_SLEEP_MINUTES), 'good');
ok('uyku eşikleri sınır değerlerde doğru');

deepEq(splitSleep(445), { hours: 7, minutes: 25 });
deepEq(splitSleep(60), { hours: 1, minutes: 0 });
ok('saat/dakika ayrıştırma doğru');

eq(sleepShiftsToCalm({ sleepMinutes: 300 }), true);
eq(sleepShiftsToCalm({ sleepMinutes: 480 }), false);
eq(sleepShiftsToCalm(null), false, 'veri yoksa reçete değişmemeli');
eq(sleepShiftsToCalm({}), false);
ok('reçete yalnızca gerçekten az uykuda değişiyor');

const sleepEffect = sleepEffectSummary([
  ...Array.from({ length: 2 }, () => S({ sleepMinutes: 300, scoreBefore: 8, scoreAfter: 6 })),
  ...Array.from({ length: 2 }, () => S({ sleepMinutes: 480, scoreBefore: 8, scoreAfter: 4 })),
])!;
eq(sleepEffect.shortNights, 2);
eq(sleepEffect.otherNights, 4);
ok('az uyunan gecelerin etkisi ayrı hesaplanıyor');

eq(
  sleepEffectSummary([S({ sleepMinutes: 300, scoreBefore: 8, scoreAfter: 6 })]),
  null,
  'tek kayıttan çıkarım yapılmamalı'
);
ok('yetersiz veride uyku karşılaştırması gösterilmiyor');

/* ==================================================================
 * Haftalık özet
 * ================================================================== */
group('Haftalık özet');

eq(
  weeklyFacts(U([S({ date: '2026-08-27' })]), '2026-08-27'),
  null,
  'üç seanstan az veri yetmemeli'
);
ok('yetersiz veride haftalık kart görünmüyor');

const facts = weeklyFacts(
  U([
    S({ date: '2026-08-25', scoreBefore: 8, scoreAfter: 4, faceMoodBefore: 8 }),
    S({ date: '2026-08-26', scoreBefore: 7, scoreAfter: 4, faceMoodBefore: 7 }),
    S({ date: '2026-08-27', scoreBefore: 6, scoreAfter: 3, faceMoodBefore: 6 }),
  ]),
  '2026-08-27'
)!;
eq(facts.sessions, 3);
eq(facts.averageEffect, 3.3, `ortalama etki: ${facts.averageEffect}`);
ok('haftalık bulgular doğru hesaplanıyor');

// Pencere dışı kayıtlar sayılmamalı.
const windowed = weeklyFacts(
  U([
    S({ date: '2026-01-01', scoreBefore: 9, scoreAfter: 1 }),
    S({ date: '2026-08-25', scoreBefore: 8, scoreAfter: 4 }),
    S({ date: '2026-08-26', scoreBefore: 7, scoreAfter: 4 }),
    S({ date: '2026-08-27', scoreBefore: 6, scoreAfter: 3 }),
  ]),
  '2026-08-27'
)!;
eq(windowed.sessions, 3, 'yalnızca son 7 gün sayılmalı');
ok('haftalık pencere dışındaki kayıtlar sızmıyor');

/* ==================================================================
 * Akan metin
 * ------------------------------------------------------------------
 * Metnin ritüelle **aynı anda** bitmesi bir tasarım sözü: son cümle,
 * son saniyede ekranda duran cümle olmalı. Süre formüle göre değiştiği
 * için bu sabit bir aralıkla değil orantıyla sağlanıyor — sınanan da
 * tam olarak o orantı.
 * ================================================================== */
group('Akan metin');

{
  const lines = 10;
  const total = 150;

  eq(storyLineIndex(0, total, lines), 0, 'ilk saniyede ilk cümle');
  eq(storyLineIndex(total / 2, total, lines), 5, 'ortada ortadaki cümle');
  eq(storyLineIndex(total - 0.01, total, lines), lines - 1, 'son anda son cümle');
  eq(storyLineIndex(total, total, lines), lines - 1, 'süre dolduğunda son cümle');
  eq(storyLineIndex(total * 5, total, lines), lines - 1, 'süre aşılsa da taşmıyor');
  eq(storyLineIndex(-30, total, lines), 0, 'negatif süre ilk cümleye düşüyor');
  ok('cümle sırası ritüel süresine tam oturuyor');

  const seen = new Set<number>();
  for (let sec = 0; sec < total; sec += 0.5) seen.add(storyLineIndex(sec, total, lines));
  eq(seen.size, lines, 'her cümle sırası bir kez görünmeli');
  ok('hiçbir cümle atlanmıyor');

  eq(storyLineIndex(89.9, 90, lines), lines - 1, 'kısa ritüelde de son cümle sonda');
  eq(storyLineIndex(0, 0, lines), lines - 1, 'süre yoksa kapanış cümlesi');
  eq(storyLineIndex(10, 100, 0), 0, 'cümle yoksa çökmüyor');
  ok('sınır durumlarda çökmüyor');
}

{
  for (const seed of [0, 1, 7, 12345, -3, -999999]) {
    const story = storyFor(seed);
    truthy(story, `seed ${seed} için hikâye yok`);
    truthy(story.lines.length > 0, `seed ${seed} için cümle yok`);
  }
  eq(storyFor(5).id, storyFor(5).id, 'aynı seed aynı hikâyeyi vermeli');
  ok('hikâye seçimi her seed için güvenli');

  // Boş ya da çok uzun cümle daire içine sığmaz.
  for (const story of CALMING_STORIES) {
    truthy(story.lines.length >= 6, `${story.id}: hikâye çok kısa`);
    for (const line of story.lines) {
      truthy(line.trim().length > 0, `${story.id}: boş cümle var`);
      truthy(line.length <= 60, `${story.id}: cümle çok uzun → ${line}`);
    }
  }
  ok('havuzdaki cümleler daireye sığacak uzunlukta');
}

/*
 * Satır başına düşen süre.
 *
 * Bu sayı iki kez ayarlandı. Başta hikâyeler 10 satırdı ve satır başına
 * 13-18 saniye düşüyordu; sonra 45 satıra çıkarıldı ve bu sefer 3-4
 * saniyeye indi — okunuyor ama üzerinde durulamıyordu. Hedef artık yedi
 * buçuk saniye ve satır sayısı süreden hesaplanıyor. Aşağıdaki test
 * gerçek formüllerden gerçek süreler üretip her satırın ekranda yedi ilâ
 * sekiz saniye kaldığını doğruluyor.
 *
 * Çift doz ayrıca sınanıyor, çünkü bütün süreleri ikiye katlıyor ve
 * metin buna uymazsa sorun yalnızca çift dozda sessizce geri geliyor.
 */
{
  for (const story of CALMING_STORIES) {
    eq(story.lines.length, LINES_PER_STORY, `${story.id}: satır sayısı sabit olmalı`);
  }
  ok(`her hikâye ${LINES_PER_STORY} satır`);

  const pools = poolsFor(false, []);
  const perLine: number[] = [];
  for (const goal of ALL_GOALS) {
    for (let day = 1; day <= 28; day++) {
      const date = `2026-09-${String(day).padStart(2, '0')}`;
      const base = generateDailyFormula(goal, date, pools);
      for (const dose of [1, 2]) {
        const formula = applyDose(base, dose);
        const total = formulaTotalSeconds(formula);
        const story = storyFor(seedFor(date, goal), dose);
        eq(
          story.lines.length,
          LINES_PER_STORY * dose,
          `doz ${dose}: havuz doz kadar hikâye uzunluğunda olmalı`
        );
        const shown = pacedLines(story.lines, total);
        truthy(shown.length >= 2, 'seyreltme en az iki satır bırakmalı');
        eq(shown[0], story.lines[0], 'açılış satırı seyreltmede kaybolmamalı');
        eq(
          shown[shown.length - 1],
          story.lines[story.lines.length - 1],
          'kapanış satırı seyreltmede kaybolmamalı'
        );
        perLine.push(total / shown.length);
      }
    }
  }

  const fastest = Math.min(...perLine);
  const slowest = Math.max(...perLine);
  truthy(fastest >= 7.0, `satır çok hızlı akıyor: ${fastest.toFixed(2)} sn`);
  truthy(slowest <= 8.0, `satır ekranda çok uzun kalıyor: ${slowest.toFixed(2)} sn`);
  ok(`satır başına ${fastest.toFixed(1)}-${slowest.toFixed(1)} sn (tek ve çift dozda)`);

  // Çift dozda ikinci hikâye gerçekten farklı olmalı; aynı hikâyenin iki
  // kez akması, uzun ritüeli tekrar hissi verirdi.
  const doubled = storyFor(0, 2);
  const single = storyFor(0, 1);
  eq(doubled.lines.slice(0, LINES_PER_STORY).join('|'), single.lines.join('|'));
  truthy(
    doubled.lines.slice(LINES_PER_STORY).join('|') !== single.lines.join('|'),
    'çift dozda ikinci hikâye birincinin aynısı olmamalı'
  );
  ok('çift dozda metin ikinci bir hikâyeyle sürüyor');
}

/* ==================================================================
 * 24 saatlik döngü
 * ------------------------------------------------------------------
 * Rapor, kullanıcının kendisi hakkında okuyacağı bir metin üretiyor;
 * bu yüzden "az veriden çok cümle kurma" kuralı burada en sıkı hâliyle
 * geçerli. Sınananlar: pencere doğru mu, yetersiz veride susuyor mu,
 * en sakin/en gergin an doğru mu.
 * ================================================================== */
group('24 saatlik döngü');

{
  const now = new Date('2026-08-31T20:00:00').getTime();
  const hoursAgo = (h: number) => now - h * 3600_000;

  const entries = [
    { at: hoursAgo(30), regularity: 0.1 }, // pencere dışı
    { at: hoursAgo(10), regularity: 0.4 },
    { at: hoursAgo(6), regularity: 0.9 },
    { at: hoursAgo(2), regularity: 0.6 },
    { at: hoursAgo(1) }, // ölçülemedi — sayılmamalı
  ];

  const inWindow = checkinsInLast24h(entries, now);
  eq(inWindow.length, 4, 'yalnızca son 24 saat');
  ok('pencere dışındaki ölçümler sızmıyor');

  const report = dailyReport(entries, now)!;
  truthy(report, 'rapor üretilmeliydi');
  eq(report.count, 3, 'ölçülemeyen kayıt rapora girmemeli');
  eq(report.averageRegularity, 0.63, `ortalama: ${report.averageRegularity}`);
  eq(report.calmestHour, new Date(hoursAgo(6)).getHours(), 'en düzenli an yanlış');
  eq(report.tensestHour, new Date(hoursAgo(10)).getHours(), 'en gergin an yanlış');
  eq(report.trend, 0.2, `yön: ${report.trend}`);
  ok('rapor doğru hesaplanıyor');

  eq(dailyReport([], now), null, 'ölçüm yoksa rapor yok');
  eq(
    dailyReport([{ at: hoursAgo(3), regularity: 0.5 }], now),
    null,
    'tek ölçümden rapor çıkarılmamalı'
  );
  eq(
    dailyReport([{ at: hoursAgo(3) }, { at: hoursAgo(2) }], now),
    null,
    'ölçülemeyen kayıtlardan rapor çıkarılmamalı'
  );
  ok('yetersiz veride rapor gösterilmiyor');

  // Sağlık verisi varsa rapora giriyor, yoksa alanlar boş kalıyor.
  const withHealth = dailyReport(entries, now, {
    available: true,
    sleepMinutes: 402,
    restingHeartRate: 58,
  } as never)!;
  eq(withHealth.sleepMinutes, 402, 'uyku rapora girmeli');
  eq(withHealth.restingHeartRate, 58, 'nabız rapora girmeli');
  eq(report.sleepMinutes, undefined, 'sağlık kapalıyken uyku alanı boş kalmalı');
  ok('sağlık verisi varsa ekleniyor, yoksa uydurulmuyor');

  // Yön yorumu üç durumu da doğru ayırmalı.
  eq(reportHeadline({ ...report, trend: 0.2 }), 'Gün ilerledikçe nefesin düzene girdi.');
  eq(reportHeadline({ ...report, trend: -0.2 }), 'Gün ilerledikçe nefesin dağıldı.');
  eq(reportHeadline({ ...report, trend: 0 }), 'Gün boyunca nefesin benzer bir düzende kaldı.');
  ok('günün yönü doğru yorumlanıyor');

  // Eski kayıtlar temizleniyor, sıra korunuyor.
  const pruned = pruneCheckins(
    [
      { at: hoursAgo(70), regularity: 0.5 },
      { at: hoursAgo(5), regularity: 0.5 },
      { at: hoursAgo(20), regularity: 0.5 },
    ],
    now
  );
  eq(pruned.length, 2, 'iki günden eski kayıt atılmalı');
  truthy(pruned[0].at < pruned[1].at, 'kayıtlar eskiden yeniye sıralanmalı');
  ok('eski ölçümler temizleniyor');
}

/* ==================================================================
 * Plasebo Plus — günlük yüz taraması hakkı
 * ------------------------------------------------------------------
 * Ücretsiz kademede günde bir ölçüm var. Sayaç yanlış çalışırsa iki
 * yönde de zarar veriyor: fazla sayarsa parasını ödemiş gibi davranan
 * kullanıcıyı hakkından ediyor, hiç saymazsa Plus'ın sattığı şeyi
 * bedavaya dağıtıyor. Sınananlar: gün dönümünde sıfırlanma, bozuk
 * kayıtta çökmeme, Plus'ta sınırsızlık.
 * ================================================================== */
group('Günlük ölçüm hakkı');

{
  const day = '2026-09-05';

  eq(quotaDayOf(new Date(2026, 8, 5, 23, 59)), day, 'gün anahtarı yerel takvimden çıkmalı');
  eq(quotaDayOf(new Date(2026, 0, 1, 0, 0)), '2026-01-01', 'ay ve gün iki basamağa tamamlanmalı');
  ok('gün anahtarı doğru üretiliyor');

  // Aynı günün kaydı korunuyor, başka günün kaydı sıfırlanıyor.
  eq(normalizeQuota({ day, count: 1 }, day).count, 1, 'bugünün sayacı korunmalı');
  eq(normalizeQuota({ day: '2026-09-04', count: 3 }, day).count, 0, 'dünün sayacı sıfırlanmalı');
  ok('sayaç gün dönümünde sıfırlanıyor');

  // Bozuk kayıt kullanıcıyı hakkından etmemeli: hepsi sıfırdan başlıyor.
  eq(normalizeQuota(null, day).count, 0, 'kayıt yoksa sıfırdan');
  eq(normalizeQuota('bozuk', day).count, 0, 'metin kayıt sıfırdan');
  eq(normalizeQuota({ day, count: -5 }, day).count, 0, 'negatif sayaç sıfırlanmalı');
  eq(normalizeQuota({ day, count: 2.7 }, day).count, 2, 'kesirli sayaç aşağı yuvarlanmalı');
  ok('bozuk kayıt sayacı kilitlemiyor');

  // Kalan hak: ücretsiz kademe 1, Plus sonsuz.
  eq(remainingFrom({ day, count: 0 }, 1), 1, 'hiç ölçmeyen kullanıcının bir hakkı var');
  eq(remainingFrom({ day, count: 1 }, 1), 0, 'bir ölçümden sonra hak bitmeli');
  eq(remainingFrom({ day, count: 9 }, 1), 0, 'kalan hak negatife düşmemeli');
  eq(
    remainingFrom({ day, count: 40 }, Number.POSITIVE_INFINITY),
    Number.POSITIVE_INFINITY,
    "Plus'ta hak tükenmemeli"
  );
  ok('kalan hak doğru hesaplanıyor');

  // Harcama saf: girdiyi değiştirmiyor, yeni bir kayıt döndürüyor.
  const before = { day, count: 0 };
  const after = consumeFrom(before);
  eq(before.count, 0, 'harcama girdiyi değiştirmemeli');
  eq(after.count, 1, 'harcama sayacı bir artırmalı');
  eq(after.day, day, 'harcama günü değiştirmemeli');
  ok('hak harcama saf çalışıyor');
}

/* ==================================================================
 * Plasebo Plus — yıllık indirim hesabı
 * ------------------------------------------------------------------
 * Rozetteki yüzde, ekranda yazan iki fiyattan çıkıyor. Fiyatlar
 * mağazadan biçimlenmiş metin olarak geliyor ve biçim ülkeye göre
 * değişiyor. Yanlış çözülen bir fiyat, olmayan bir indirimi ilan eden
 * bir rozet demek — Apple'ın yanıltıcı fiyat beyanı kuralı tam olarak
 * buna bakıyor, o yüzden çözülemeyen biçimde rozet hiç çıkmıyor.
 * ================================================================== */
group('Yıllık indirim');

{
  // Türkiye biçimi: nokta binlik, virgül ondalık.
  eq(parseDisplayPrice('₺1.159,99'), 1159.99, 'TL biçimi çözülmeli');
  eq(parseDisplayPrice('₺149,00'), 149, 'ondalığı sıfır olan tutar çözülmeli');
  // ABD biçimi: virgül binlik, nokta ondalık.
  eq(parseDisplayPrice('$1,159.99'), 1159.99, 'dolar biçimi çözülmeli');
  eq(parseDisplayPrice('$11.99'), 11.99, 'küçük dolar tutarı çözülmeli');
  // Ayırıcısız ve boşluklu biçimler.
  eq(parseDisplayPrice('1 159,99 TL'), 1159.99, 'boşluklu biçim çözülmeli');
  eq(parseDisplayPrice('¥1200'), 1200, 'ayırıcısız tutar çözülmeli');
  // Ondalık olmayan tek ayırıcı binliktir: "1.159" bin yüz elli dokuz.
  eq(parseDisplayPrice('₺1.159'), 1159, 'üç basamaklı ek binlik sayılmalı');
  ok('mağaza fiyatları doğru çözülüyor');

  eq(parseDisplayPrice('Ücretsiz'), null, 'sayı içermeyen metin çözülmemeli');
  eq(parseDisplayPrice(''), null, 'boş metin çözülmemeli');
  eq(parseDisplayPrice('₺0,00'), null, 'sıfır tutar geçerli fiyat sayılmamalı');
  ok('çözülemeyen biçimde null dönüyor');

  // Mağazadaki gerçek kademeler: 149,99 × 12 = 1799,88, yıllık 1159,99.
  eq(yearlyDiscountPercent(149.99, 1159.99), 36, 'yıllık plan %36 indirimli olmalı');
  eq(Math.round(yearlyPerMonth(1159.99) * 100) / 100, 96.67, 'aya düşen tutar doğru olmalı');
  eq(yearlyDiscountPercent(0, 1159.99), 0, 'aylık fiyat okunamazsa indirim iddia edilmemeli');
  ok('indirim yüzdesi ve aylık karşılığı doğru');
}

console.log(`\nMANTIK TESTLERİ: ${passed}/${passed} GEÇTİ`);
