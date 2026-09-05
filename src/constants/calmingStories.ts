/**
 * Ritüel boyunca akan sakinleştirici metin.
 *
 * Eskiden ekranın ortasında tek bir kelime duruyordu (BERRAK, BAŞLA…).
 * Tek kelime ilk saniyede okunup bitiyor, kalan iki dakika boyunca da
 * yerinde kalıyordu: bakılacak bir şey vardı ama takip edilecek bir şey
 * yoktu. Bunun yerine kısa satırlardan kurulu bir metin akıyor.
 *
 * Ton bilinçli olarak bir çocuk kitabının tonu: kısa cümleler, somut
 * görüntüler, açıklama değil gösterme. Soyut öğüt ("kendine iyi bak")
 * ekranda okunmuyor bile; bir göl, bir çatı, gevşeyen bir çene ise
 * okunuyor. Metin hiçbir şey vaat etmiyor, hiçbir teşhis koymuyor ve
 * kimseyi "iyileşeceksin" diye avutmuyor.
 *
 * Kurallar:
 *   - Her hikâye bir **yay** çizer: içeride başlar, dışarı açılır,
 *     sonunda kişiyi durulmuş bir yere bırakır. Son satır bilerek bir
 *     kapanış — ritüelin son saniyesinde ekranda o durur.
 *   - Her satır bir **nefeslik**: üç ilâ altı kelime. Uzun cümle hem
 *     ekrana sığmıyor hem de dört saniyede okunmuyor.
 *   - Her hikâye tam olarak `LINES_PER_STORY` satır. Sebebi aşağıda.
 *   - Metin `t()` ile çevriliyor; İngilizce karşılıkları `i18n/en.ts`
 *     içinde.
 */

export interface CalmingStory {
  /** Havuzda ayırt etmek için — arayüzde görünmüyor. */
  id: string;
  /** Sırayla akacak satırlar; sonuncusu kapanış satırıdır. */
  lines: string[];
}

/**
 * Hikâye başına satır sayısı — keyfi değil, süreden türetilmiş bir sayı.
 *
 * Bu sayı ekranda görünecek satır sayısı **değil**, havuzun boyu.
 * Ritüeller tek dozda 134-182 saniye sürüyor (çift dozda iki katı) ve
 * satır başına yedi buçuk saniye istendiği için ekranda 18-24 satır
 * görünüyor; hangileri olduğunu `pacedLines` seçiyor.
 *
 * Havuzun bundan geniş olması bilinçli: seyreltme eşit aralıklı olduğu
 * için havuz büyüdükçe farklı sürelerde farklı ara satırlar geliyor ve
 * aynı hikâye iki ritüelde birebir aynı akmıyor.
 *
 * Bütün hikâyelerin aynı uzunlukta olması, seyreltmenin dozdan bağımsız
 * çalışması için gerekli; testler (`src/__tests__/logic.test.ts`) hem
 * bunu hem de satır başına düşen süreyi denetliyor.
 */
export const LINES_PER_STORY = 45;

/**
 * Bir satırın ekranda kalmasını istediğimiz süre.
 *
 * Önce 3-4 saniyeydi ve o da bir önceki 13-18 saniyeye göre doğru yöndü;
 * ama okunduktan sonra üzerinde durulacak vakit bırakmıyordu — metin
 * akmıyor, geçiyordu. Yedi buçuk saniye, kısa bir cümleyi okuyup bir
 * nefes boyunca öylece bakmaya yetiyor.
 */
export const SECONDS_PER_LINE = 7.5;

/**
 * Metni ritüelin süresine göre seyreltir.
 *
 * Havuzda 45 satır var ama 134 saniyelik bir ritüelde hepsini göstermek
 * satır başına üç saniye demek. Sabit bir satır sayısı da işe yaramıyor:
 * ritüeller 134 ile 182 saniye arasında değişiyor (çift dozda iki katı)
 * ve tek bir sayı bu aralığın iki ucunda birden 7-8 saniyeyi tutturamıyor.
 *
 * Bu yüzden satır sayısı süreden hesaplanıyor ve havuzdan **eşit
 * aralıklarla** seçiliyor. İlk ve son satır her zaman içeride: hikâyenin
 * açılışı ve kapanışı seyrelmeden kalıyor, aradan atlanan satırlar ise
 * zaten aynı yayın ara basamakları.
 */
export function pacedLines(lines: string[], totalSeconds: number): string[] {
  if (lines.length === 0) return lines;
  if (totalSeconds <= 0) return lines;

  const wanted = Math.max(2, Math.round(totalSeconds / SECONDS_PER_LINE));
  const count = Math.min(lines.length, wanted);
  if (count >= lines.length) return lines;

  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(lines[Math.round((i * (lines.length - 1)) / (count - 1))]);
  }
  return out;
}

export const CALMING_STORIES: CalmingStory[] = [
  {
    id: 'uzaklas',
    lines: [
      'Bugün seni yoran bir şey var.',
      'Ona şimdilik bir isim verme.',
      'Sadece orada olduğunu bil.',
      'Omuzların yerini bulsun.',
      'Şimdi biraz geriye çekil.',
      'Sanki iki adım geriye.',
      'O düşünce hâlâ orada.',
      'Ama artık biraz uzakta.',
      'Bulunduğun odaya bak.',
      'Duvarlar sessizce duruyor.',
      'Oda, o düşünceden büyük.',
      'Şimdi biraz daha geriye.',
      'Çatının üstünden bak.',
      'Çatılar sıralanmış.',
      'Sokak lambaları yanıyor.',
      'Şehir, odandan büyük.',
      'Biraz daha yukarı.',
      'Bulutlar altında kaldı.',
      'Işıklar noktalara döndü.',
      'Ülke, şehirden büyük.',
      'Daha da yukarıda.',
      'Şimdi denizler görünüyor.',
      'Mavi, hepsini çevreliyor.',
      'Dünya, ülkeden büyük.',
      'Dünya bu sabah da döndü.',
      'Kimseden izin istemedi.',
      'Gökyüzü hepsinin üstünde.',
      'Yıldızlar yerlerinde duruyor.',
      'Işıkları yıllar önce yola çıktı.',
      'Buradan bakınca sessizler.',
      'Şimdi yavaşça geri dön.',
      'Deniz, ülke, şehir.',
      'Sokak, bina, oda.',
      'Ve oturduğun yer.',
      'Ve senin nefesin.',
      'O düşünce hâlâ burada.',
      'Kaybolmasını istemiyoruz.',
      'Yalnızca boyutunu görüyoruz.',
      'Bir yer kaplıyor.',
      'Ama hepsini değil.',
      'Sen ondan geniş bir yerdesin.',
      'Acele edecek bir şey yok.',
      'Nefesin yerinde.',
      'Omuzların yerinde.',
      'Sen de buradasın.',
    ],
  },
  {
    id: 'beden',
    lines: [
      'Şimdi bedenine dön.',
      'Hiçbir şeyi değiştirme.',
      'Sadece nerede olduğunu fark et.',
      'Ayaklarından başla.',
      'Zemin onları tutuyor.',
      'Tutmak için çabalamıyorlar.',
      'Bacakların ağırlığını bırakıyor.',
      'Altındaki şey seni taşıyor.',
      'Ona güvenebilirsin.',
      'Karnın yumuşasın.',
      'Nefes oraya kadar insin.',
      'Zorlamadan, kendiliğinden.',
      'Göğsün yavaşça açılıyor.',
      'Sonra yavaşça kapanıyor.',
      'Bunu sen yapmıyorsun.',
      'Yalnızca izin veriyorsun.',
      'Şimdi omuzlarına gel.',
      'Gün boyu yukarıdaydılar.',
      'Bıraksınlar biraz.',
      'Bir parmak kadar aşağı.',
      'Sonra bir parmak daha.',
      'Ellerin nerede?',
      'Belki sıkılmışlardır.',
      'Parmakların açılsın.',
      'Avuçların yukarı baksın.',
      'Tutacak bir şey yok.',
      'Çeneni fark et.',
      'Dişlerin birbirine değiyor mu?',
      'Aralarına boşluk bırak.',
      'Dilin damağından ayrılsın.',
      'Şimdi alnını düşün.',
      'Kaşlarının arasındaki çizgi.',
      'O çizgi gevşesin.',
      'Gözlerin ağırlaşsın.',
      'Onları kimse izlemiyor.',
      'Şimdi hepsini birden hisset.',
      'Baştan ayağa tek parça.',
      'Nefes içinden geçiyor.',
      'Girerken serin.',
      'Çıkarken ılık.',
      'Hiçbir şeyi tutmuyorsun.',
      'Hiçbir yere yetişmiyorsun.',
      'Beden zaten biliyordu.',
      'Sen yalnızca yerini aldın.',
      'Burası, şu an, yeterli.',
    ],
  },
  {
    id: 'su',
    lines: [
      'Bir göl hayal et.',
      'Sabahın erken saati.',
      'Yüzeyi düz duruyor.',
      'Kıyıda taşlar var.',
      'Sen kıyıdasın.',
      'Şimdi bir düşünce geliyor.',
      'Suya bir taş düşüyor.',
      'Halkalar dışarı açılıyor.',
      'Bir, iki, üç.',
      'Sonra giderek zayıflıyor.',
      'Su yine düzleşiyor.',
      'Taşı sen atmadın.',
      'Halkaları da durduramazsın.',
      'Ama beklemeyi bilirsin.',
      'Başka bir düşünce.',
      'Başka bir taş.',
      'Yine halkalar.',
      'Yine sessizlik.',
      'Düşünceler suya benziyor.',
      'Gelirler ve geçerler.',
      'Hepsini durdurman gerekmiyor.',
      'Bir dalga yükseliyor.',
      'Sonra kendiliğinden alçalıyor.',
      'Onu ittirmedin.',
      'Onu çekmedin de.',
      'Sen dalga değilsin.',
      'Sen kıyısın.',
      'Kıyı dalgayla tartışmaz.',
      'Yalnızca orada durur.',
      'Su bazen yükselir.',
      'Bazen geri çekilir.',
      'Kıyı ikisini de tanır.',
      'Şimdi suyun altına bak.',
      'Yüzey kıpırdasa bile.',
      'Derinde hiçbir şey sallanmıyor.',
      'Orada taşlar duruyor.',
      'Işık yavaşça iniyor.',
      'Ses oraya ulaşmıyor.',
      'Sende de böyle bir yer var.',
      'Yüzeyin altında, sakin.',
      'Bugün onu bulman gerekmiyor.',
      'Var olduğunu bilmek yeter.',
      'Su çekilince kum düzleşir.',
      'Şimdi sessiz bir yer var.',
      'O yer hep buradaydı.',
    ],
  },
  {
    id: 'gun',
    lines: [
      'Gün bugün de eskisi gibi başladı.',
      'Bir alarm çaldı.',
      'Bir liste vardı.',
      'Liste hâlâ duruyor.',
      'Yapılmamış işler yerinde.',
      'Hiçbiri kaçmadı.',
      'Hiçbiri de büyümedi.',
      'Şimdi onlara bakma.',
      'Hiçbiri bu iki dakikaya sığmaz.',
      'O yüzden şimdi burada değiller.',
      'Bu süre sana ait.',
      'Kimse kapıyı çalmayacak.',
      'Kimseye bir şey ispat etmiyorsun.',
      'İyi hissetmek zorunda değilsin.',
      'Rahatlamak zorunda da değilsin.',
      'Yalnızca duruyorsun.',
      'Durmak da bir şey yapmaktır.',
      'Bugün olanları düşün.',
      'Bir şey iyi gitmedi belki.',
      'Bir cümle aklında kaldı.',
      'Bir bakış, bir sessizlik.',
      'Onu şimdi çözmeyeceğiz.',
      'Yalnızca yerini gösteriyoruz.',
      'Aklın bugün çok çalıştı.',
      'Sabahtan beri hiç durmadı.',
      'Şimdi ona ara veriyorsun.',
      'Bunu hak etti.',
      'Dışarıda gün sürüyor.',
      'Arabalar geçiyor.',
      'Biri yemek pişiriyor.',
      'Biri eve dönüyor.',
      'Dünya seni beklemiyor.',
      'Ama seni zorlamıyor da.',
      'Akşam yine gelecek.',
      'Yarın yine sabah olacak.',
      'Bu düzen senden önce vardı.',
      'Senden sonra da olacak.',
      'İçinde küçük bir yer kapladın.',
      'O yer yeterince büyük.',
      'Şimdi nefesine dön.',
      'Bir kere içeri.',
      'Bir kere dışarı.',
      'Liste hâlâ yerinde duruyor.',
      'Ama sen biraz daha buradasın.',
      'Bitince gün seni bekliyor olacak.',
    ],
  },
];

/**
 * Güne ve doza göre akacak metni seçer.
 *
 * Aynı gün içinde hep aynı metin geliyor (ritüel tekrar edilirse metin
 * ortasından değişmesin), ertesi gün başkası. Seçim `seed`'e bağlı,
 * çünkü formülün geri kalanı da aynı sayıdan türüyor.
 *
 * **Doz burada belirleyici.** Çift doz formüldeki bütün süreleri iki
 * katına çıkarıyor (bkz. `formulaEngine.applyDose`). Metin tek bir
 * hikâyede kalsaydı satır süresi de iki katına çıkardı ve çift dozda her
 * satır altı ilâ sekiz saniye ekranda kalırdı — yani düzeltmeye
 * çalıştığımız sorun çift dozda aynen geri gelirdi. Onun yerine doz
 * kadar hikâye arka arkaya diziliyor: süre iki katına çıkarken satır
 * sayısı da iki katına çıkıyor, satır başına düşen süre sabit kalıyor.
 *
 * Diziye giren ikinci hikâye rastgele değil, havuzda bir sonraki olan;
 * böylece aynı gün aynı sırayla akıyor ve aynı hikâye iki kez gelmiyor.
 */
export function storyFor(seed: number, dose = 1): CalmingStory {
  const count = Math.max(1, Math.min(CALMING_STORIES.length, Math.round(dose)));
  const first = Math.abs(seed) % CALMING_STORIES.length;
  if (count === 1) return CALMING_STORIES[first];

  const parts: CalmingStory[] = [];
  for (let i = 0; i < count; i++) {
    parts.push(CALMING_STORIES[(first + i) % CALMING_STORIES.length]);
  }
  return {
    id: parts.map((p) => p.id).join('+'),
    lines: parts.flatMap((p) => p.lines),
  };
}

/**
 * Toplam süreyi satırlara böler ve o an gösterilecek satırın sırasını verir.
 *
 * Metin ritüelle **aynı anda** bitmeli: son satır, son saniyede ekranda
 * duran satırdır. Bu yüzden satır başına süre sabit değil, toplam süreden
 * türetiliyor — 134 saniyelik bir ritüelde de 364 saniyelik çift dozda da
 * metin tam ortada değil, tam sonunda kapanıyor.
 *
 * @param elapsed Ritüelin başından beri geçen süre (saniye).
 * @param total   Ritüelin toplam süresi (saniye).
 * @param count   Metindeki satır sayısı.
 */
export function storyLineIndex(elapsed: number, total: number, count: number): number {
  if (count <= 0) return 0;
  if (total <= 0) return count - 1;
  const ratio = Math.max(0, Math.min(0.999999, elapsed / total));
  return Math.min(count - 1, Math.floor(ratio * count));
}
