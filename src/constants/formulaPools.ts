/**
 * Formül havuzları.
 *
 * Buradaki hiçbir veri bir ölçüme dayanmıyor. Süreler, isimler ve
 * "bulgular" tamamen uydurma — uygulamanın tamamı bunu açıkça söylüyor.
 */
// Yalnızca tip olarak alınıyor; derlemede silindiği için `types.ts` ile
// aradaki karşılıklı bağ çalışma zamanında bir döngü oluşturmuyor.
import type { Goal } from '../types';

export interface ColorEntry {
  hex: string;
  name: string;
  duration: number; // saniye
}

export interface SoundEntry {
  type: SoundId;
  label: string;
  duration: number; // saniye
}

export interface BreathEntry {
  pattern: BreathId;
  label: string;
  rounds: number;
}

export type SoundId =
  | '40hz_gamma'
  | '528hz_solfeggio'
  | 'brown_noise'
  | 'binaural_alpha'
  | 'tibetan_bowl'
  | 'white_noise'
  | '432hz_verdi'
  | 'pink_noise'
  | 'rain_layer'
  | 'binaural_theta'
  | 'deep_drone'
  | 'crystal_chime';

export type BreathId =
  | '4-7-8'
  | 'box_breathing'
  | '4-4-4'
  | 'coherent_5s'
  | 'physiological_sigh'
  | 'extended_exhale'
  | 'resonant_6s'
  | 'triangle_369'
  | 'wave_5_3_7';

/**
 * Havuzların başındaki elemanlar ücretsiz kademeye düşer (bkz.
 * `BASIC_POOL_SIZES`), sonrakiler premium ile açılır. Bu yüzden yeni
 * içerik listenin **sonuna** eklenir — ücretsiz kademenin gördüğü
 * içerik sürüm değiştikçe yerinden oynamasın diye.
 */
/**
 * Renkler neon aralığına çekildi: yüksek doygunluk, koyu zeminde parlayan
 * tonlar. Ritüel ekranı bu hex'ten çekirdek, halka ve ışıma katmanlarını
 * türetiyor (bkz. `BreathingCircle`), o yüzden pastel tonlar orada sönük
 * kalıyordu — mat bir dolgu gibi görünüyor, "ışık" gibi görünmüyordu.
 */
export const COLOR_POOL: ColorEntry[] = [
  { hex: '#2E9BFF', name: 'Gece Mavisi', duration: 17 },
  { hex: '#9B5CFF', name: 'Mor Titreşim', duration: 21 },
  { hex: '#2BFFB0', name: 'Yosun Nefesi', duration: 19 },
  { hex: '#FFD400', name: 'Altın Eşik', duration: 15 },
  { hex: '#FF7A45', name: 'Bakır Şafak', duration: 18 },
  { hex: '#C77DFF', name: 'Menekşe Sis', duration: 23 },
  { hex: '#FF3D6E', name: 'Kızıl Uyarı', duration: 14 },
  { hex: '#22F5E0', name: 'Buzul Işığı', duration: 20 },
  { hex: '#00A6FF', name: 'Derin Akım', duration: 22 },
  { hex: '#7CFF5C', name: 'Islak Çimen', duration: 16 },
  { hex: '#FFB454', name: 'Kum Saati', duration: 19 },
  { hex: '#FF2E9A', name: 'Nabız Pembesi', duration: 13 },
  { hex: '#8AA0FF', name: 'Yağmur Öncesi', duration: 25 },
  { hex: '#14E8A0', name: 'Sığ Tropik', duration: 18 },
  { hex: '#7B5CFF', name: 'Uyku Moru', duration: 27 },
  { hex: '#FFF03D', name: 'Erken Uyanış', duration: 12 },
];

export const SOUND_POOL: SoundEntry[] = [
  { type: '40hz_gamma', label: '40Hz Gama Dalgası', duration: 90 },
  { type: '528hz_solfeggio', label: '528Hz Solfeggio', duration: 80 },
  { type: 'brown_noise', label: 'Kahverengi Gürültü', duration: 100 },
  { type: 'binaural_alpha', label: 'Binaural Alfa (10Hz)', duration: 95 },
  { type: 'tibetan_bowl', label: 'Tibet Kâsesi', duration: 75 },
  { type: 'white_noise', label: 'Beyaz Gürültü', duration: 85 },
  { type: '432hz_verdi', label: '432Hz Verdi Akordu', duration: 85 },
  { type: 'pink_noise', label: 'Pembe Gürültü', duration: 100 },
  { type: 'rain_layer', label: 'Yağmur Katmanı', duration: 110 },
  { type: 'binaural_theta', label: 'Binaural Teta (6Hz)', duration: 95 },
  { type: 'deep_drone', label: 'Derin Uğultu (110Hz)', duration: 105 },
  { type: 'crystal_chime', label: 'Kristal Çan', duration: 70 },
];

export const BREATH_POOL: BreathEntry[] = [
  { pattern: '4-7-8', label: '4-7-8 Tekniği', rounds: 3 },
  { pattern: 'box_breathing', label: 'Kutu Nefesi', rounds: 4 },
  { pattern: '4-4-4', label: 'Üçlü Denge', rounds: 4 },
  { pattern: 'coherent_5s', label: 'Uyumlu Nefes', rounds: 6 },
  { pattern: 'physiological_sigh', label: 'Fizyolojik İç Çekiş', rounds: 5 },
  { pattern: 'extended_exhale', label: 'Uzun Veriş', rounds: 5 },
  { pattern: 'resonant_6s', label: 'Rezonans Nefesi', rounds: 5 },
  { pattern: 'triangle_369', label: 'Üçgen Nefes', rounds: 4 },
  { pattern: 'wave_5_3_7', label: 'Dalga Nefesi', rounds: 4 },
];

export const WORD_POOL: string[] = [
  'AKIŞ',
  'ODAK',
  'SÜKUNET',
  'NİYET',
  'ŞİMDİ',
  'VAROLUŞ',
  'IŞIK',
  'DENGE',
  'GÜÇ',
  'NEFES',
  'EŞİK',
  'DURULUK',
  'KÖK',
  'AÇIKLIK',
  'SESSİZLİK',
  'YÖN',
  'TEMAS',
  'GENİŞLİK',
  'SABIR',
  'İZ',
  'ZEMİN',
  'AKIL',
  'YAVAŞLIK',
  'ARALIK',
  'TAZE',
  'DÜĞÜM',
  'BAŞLANGIÇ',
  'SICAKLIK',
  'BOŞLUK',
  'DEVAM',
  'HAFİFLİK',
  'KIYI',
  'UYANIŞ',
  'SIRA',
  'TOPARLAN',
  'DERİNLİK',
];

/**
 * Ritüel sırasında dönen "bulgular". Hepsi uydurma — ölçüm de kaynak da
 * yok. Ritüel ekranı bunları tek başına gösterir; altındaki "bu bulgu
 * uydurmadır" satırı kaldırıldı — aynı mesaj tanıtım akışında, "Nasıl
 * Çalışır" ekranında ve bulguyu taşıyan ⚗️ etiketinin kendisinde zaten
 * var, ritüelin ortasında tekrar edilmesi akışı bölüyordu.
 */
export const PSEUDO_SCIENCE_FACTS: string[] = [
  '⚗️ 40Hz gama dalgaları prefrontal korteksi %23 aktive eder',
  '⚗️ Mavi tonlara 17 saniye bakmak dikkat süresini %31 uzatır',
  '⚗️ 4-7-8 nefesi vagal tonu 2.4 kat yükseltir',
  '⚗️ 528Hz frekansı hücresel rezonansı %19 senkronize eder',
  '⚗️ Kahverengi gürültü arka plan düşünce sayısını %42 azaltır',
  '⚗️ Binaural alfa dalgaları hemisfer eşzamanlılığını %37 artırır',
  '⚗️ Tibet kâsesi harmonikleri kalp ritmi değişkenliğini %28 dengeler',
  '⚗️ Fizyolojik iç çekiş alveol geri kazanımını %15 hızlandırır',
  '⚗️ Kutu nefesi çalışma belleği kapasitesini %26 genişletir',
  '⚗️ Tek bir kelimeye odaklanmak zihinsel gürültüyü %33 bastırır',
  '⚗️ Uyumlu nefes 5.5 saniyede kalp-solunum uyumunu %48 yükseltir',
  '⚗️ Ritüel tekrarı 21. günde bazal farkındalığı %12 yeniden kalibre eder',
  '⚗️ 432Hz akordu iç kulak mikro-titreşimini %17 yumuşatır',
  '⚗️ Pembe gürültü hafıza pekiştirme penceresini %21 uzatır',
  '⚗️ Yağmur dokusu zihinsel gezinme sıklığını %35 seyreltir',
  '⚗️ Binaural teta yaratıcı çağrışım hızını %29 artırır',
  '⚗️ 110Hz derin uğultu kas gerilim eşiğini %14 aşağı çeker',
  '⚗️ Kristal çan tınısı dikkat sıfırlamasını 1.8 kat hızlandırır',
  '⚗️ Uzun veriş nefesi parasempatik geçişi %26 öne alır',
  '⚗️ Rezonans nefesi baroreseptör hassasiyetini %33 senkronize eder',
  '⚗️ Üçgen nefes zihinsel yük dağılımını %19 eşitler',
  '⚗️ Dalga nefesi solunum düzensizliğini %24 törpüler',
  '⚗️ Sabit bir renge bakarken göz kırpma aralığı %38 uzar',
  '⚗️ Aynı saatte tekrarlanan ritüel beklenti tepkisini %44 güçlendirir',
  '⚗️ Ritüel sonrası 10 saniyelik sessizlik etkiyi %16 "sabitler"',
  '⚗️ Kendi seçtiğin kelime, verilen kelimeye göre %27 daha çok tutunur',
];

/**
 * Ritüel sırasında **o an ekranda olan şeye** ait bulgu.
 *
 * Önceden bulgu, adım sırasına göre havuzdan sırayla dönüyordu; bu yüzden
 * Tibet kâsesi çalarken ekranda binaural alfa dalgalarının bulgusu
 * görünebiliyordu. Artık ses adımında çalan sesin, nefes adımında
 * uygulanan desenin bulgusu gösteriliyor. Hepsi yine uydurma — sadece
 * doğru şeyin uydurması.
 */
export const SOUND_FACTS: Record<SoundId, string> = {
  '40hz_gamma': '⚗️ 40Hz gama dalgaları prefrontal korteksi %23 aktive eder',
  '528hz_solfeggio': '⚗️ 528Hz frekansı hücresel rezonansı %19 senkronize eder',
  brown_noise: '⚗️ Kahverengi gürültü arka plan düşünce sayısını %42 azaltır',
  binaural_alpha: '⚗️ Binaural alfa dalgaları hemisfer eşzamanlılığını %37 artırır',
  tibetan_bowl: '⚗️ Tibet kâsesi harmonikleri kalp ritmi değişkenliğini %28 dengeler',
  white_noise: '⚗️ Beyaz gürültü işitsel dikkat dağınıklığını %31 maskeler',
  '432hz_verdi': '⚗️ 432Hz akordu iç kulak mikro-titreşimini %17 yumuşatır',
  pink_noise: '⚗️ Pembe gürültü hafıza pekiştirme penceresini %21 uzatır',
  rain_layer: '⚗️ Yağmur dokusu zihinsel gezinme sıklığını %35 seyreltir',
  binaural_theta: '⚗️ Binaural teta yaratıcı çağrışım hızını %29 artırır',
  deep_drone: '⚗️ 110Hz derin uğultu kas gerilim eşiğini %14 aşağı çeker',
  crystal_chime: '⚗️ Kristal çan tınısı dikkat sıfırlamasını 1.8 kat hızlandırır',
};

export const BREATH_FACTS: Record<BreathId, string> = {
  '4-7-8': '⚗️ 4-7-8 nefesi vagal tonu 2.4 kat yükseltir',
  box_breathing: '⚗️ Kutu nefesi çalışma belleği kapasitesini %26 genişletir',
  '4-4-4': '⚗️ Üçlü denge nefesi solunum ritmini %22 düzleştirir',
  coherent_5s: '⚗️ Uyumlu nefes 5.5 saniyede kalp-solunum uyumunu %48 yükseltir',
  physiological_sigh: '⚗️ Fizyolojik iç çekiş alveol geri kazanımını %15 hızlandırır',
  extended_exhale: '⚗️ Uzun veriş nefesi parasempatik geçişi %26 öne alır',
  resonant_6s: '⚗️ Rezonans nefesi baroreseptör hassasiyetini %33 senkronize eder',
  triangle_369: '⚗️ Üçgen nefes zihinsel yük dağılımını %19 eşitler',
  wave_5_3_7: '⚗️ Dalga nefesi solunum düzensizliğini %24 törpüler',
};

/**
 * Renk ve kelime adımlarının bulguları hedefe göre ayrılır.
 *
 * Ses ve nefes adımlarının bulgusu çalan sesi / uygulanan deseni anlatır,
 * yani zaten formüle özeldir. Renge bakmak ve bir kelimeye bakmaksa her
 * hedefte aynı eylem olduğu için bulgular tek havuzdan geliyordu; uyku
 * ritüelinin ortasında "dikkat süresini uzatır" yazması bundandı. Artık
 * dördü de kendi diliyle konuşuyor.
 */
export const COLOR_FACTS: Record<Goal, string[]> = {
  focus: [
    '⚗️ Doygun tonlara 17 saniye bakmak dikkat süresini %31 uzatır',
    '⚗️ Renk sabitlemesi zihinsel konu değiştirme maliyetini %21 düşürür',
    '⚗️ Tek bir ışık kaynağına odaklanmak görsel gürültüyü %27 bastırır',
  ],
  sleep: [
    '⚗️ Sabit bir renge bakarken göz kırpma aralığı %38 uzar',
    '⚗️ Uzun renk bakışı uykuya geçiş süresini %18 kısaltır',
    '⚗️ Ekranda tek bir tona kilitlenmek zihinsel uyarılmayı %24 düşürür',
  ],
  anxiety: [
    '⚗️ Tek bir renge bakmak tetikte kalma tepkisini %26 yumuşatır',
    '⚗️ Görüş alanını daraltmak tehdit taramasını %22 seyreltir',
    '⚗️ Sabit bakış, hızlanmış düşünce akışını %29 yavaşlatır',
  ],
  energy: [
    '⚗️ Parlak tonlara bakmak öznel uyanıklığı %23 yukarı çeker',
    '⚗️ Sıcak renkler harekete geçme eşiğini %19 aşağı çeker',
    '⚗️ Göz açıklığının artması algılanan enerjiyi %16 yükseltir',
  ],
};

/** Kelime adımı için bulgular — o da hedefe göre. */
export const WORD_FACTS: Record<Goal, string[]> = {
  focus: [
    '⚗️ Tek bir kelimeye odaklanmak zihinsel gürültüyü %33 bastırır',
    '⚗️ Oturum başına tek kelime seçmek konu değiştirmeyi %21 azaltır',
  ],
  sleep: [
    '⚗️ Tek bir kelimeyi tekrarlamak zihinsel gezinmeyi %27 seyreltir',
    '⚗️ Gece okunan tek kelime, uykuya geçişte zihni %15 sadeleştirir',
  ],
  anxiety: [
    '⚗️ Bir kelimeye tutunmak düşünce döngüsünü %24 kısaltır',
    '⚗️ Kendi seçtiğin kelime, verilen kelimeye göre %27 daha çok tutunur',
  ],
  energy: [
    '⚗️ Kısa ve emir kipli kelimeler harekete geçişi %18 hızlandırır',
    '⚗️ Güne tek kelimeyle başlamak niyet sürekliliğini %22 artırır',
  ],
};

/**
 * Adımın altında görünen küçük not. Önceden adım başına tek sabit cümle
 * vardı ve her ritüelde birebir aynı okunuyordu; havuza çevrildi, formülün
 * seed'ine göre dönüyor. Ton aynı kalıyor: ne yaptığını dürüstçe söylemek.
 */
export const STEP_NOTES: Record<'color' | 'sound' | 'breath' | 'word', string[]> = {
  color: [
    'Bakmak beklentiyi kuruyor; beklenti bedende karşılık buluyor',
    'Bakışını tek bir yerde tutmak, zihni de orada tutuyor',
    'Bir şey yapmayı bırakmak da bir eylem — beden bunu fark ediyor',
    'Göz sabitlendiğinde düşünce de yavaşlar — mekanizma bu kadar',
    'Burada kaldığın her saniye, ritüeli biraz daha senin yapıyor',
  ],
  sound: [
    'Ses dikkati tutuyor; tutulan dikkat beklentiyi güçlendiriyor',
    'Ses bir örtü; altındaki sessizliği duyman için var',
    'Kulaklıkla dinlemek etkiyi değil deneyimi değiştirir',
    'Bu ton senin bu iki dakikan için üretildi',
    'Duyduğun şey bir zemin — üstünde durabileceğin bir yer',
  ],
  breath: [
    'Yavaş nefes gerçekten sakinleştirir; beklenti bunu büyütüyor',
    'Verişi alıştan uzun tutmak, bedenin kendi frenine dokunuyor',
    'Sayılar bir öneri, ritim ise gerçek. Ritme uy, sayıyı dert etme',
    'Nefes, ölçülebilir olanla inanılan şeyin buluştuğu yer',
    'Zorlama yok; kaçırdığın turu bir sonraki kapatır',
  ],
  word: [
    'Kelimenin gücü ona verdiğin anlamdan gelir — o anlam gerçek',
    'Bugün bu kelime, yarın başkası. Değişen tek şey sen değilsin',
    'Tekrarlamak zorunda değilsin; bakman yeterli',
    'Anlamı sonradan gelir, bazen hiç gelmez. İkisi de olur',
  ],
};

/* ------------------------------------------------------------------ */
/* Kademeler                                                           */
/* ------------------------------------------------------------------ */

/**
 * Ücretsiz kademenin gördüğü "temel formül" havuzu — her havuzun ilk
 * bölümü. Premium tam havuzu açar, satın alınan içerik paketleri de
 * üstüne ekler.
 *
 * Kesme sayıları **bir yıl tekrarsız** olacak şekilde belirlendi:
 * 10 renk × 8 ses × 6 nefes = 480 üçlü. Günlük formül bu havuzu sabit
 * adımlarla gezdiği için (bkz. `dailyTriple`), 480 > 365 olduğu sürece
 * aynı renk/ses/nefes bileşimi bir yıl boyunca iki kez gelmiyor.
 * Önceki değerler (5 × 4 × 3 = 60) bunun çok altındaydı.
 */
export const BASIC_POOL_SIZES = {
  colors: 10,
  sounds: 8,
  breaths: 6,
  words: 20,
  facts: 14,
} as const;

export interface FormulaPools {
  colors: ColorEntry[];
  sounds: SoundEntry[];
  breaths: BreathEntry[];
  words: string[];
  facts: string[];
}

export const BASIC_POOLS: FormulaPools = {
  colors: COLOR_POOL.slice(0, BASIC_POOL_SIZES.colors),
  sounds: SOUND_POOL.slice(0, BASIC_POOL_SIZES.sounds),
  breaths: BREATH_POOL.slice(0, BASIC_POOL_SIZES.breaths),
  words: WORD_POOL.slice(0, BASIC_POOL_SIZES.words),
  facts: PSEUDO_SCIENCE_FACTS.slice(0, BASIC_POOL_SIZES.facts),
};

export const FULL_POOLS: FormulaPools = {
  colors: COLOR_POOL,
  sounds: SOUND_POOL,
  breaths: BREATH_POOL,
  words: WORD_POOL,
  facts: PSEUDO_SCIENCE_FACTS,
};
