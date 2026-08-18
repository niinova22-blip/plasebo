/**
 * Plasebo rehberi — ana ekrandaki yardımcı kartın içeriği.
 *
 * Amaç, kullanıcıya "bu uygulama ne işe yarıyor?" sorusunun cevabını tek
 * seferde değil, her gün bir parça vermek. Kart dokunuldukça sıradaki
 * ipucuna geçiyor.
 *
 * Ton kuralı burada da aynı: hiçbir madde bir fayda vaat etmiyor. Ritüelin
 * ne yaptığı (bir çerçeve kurmak) ile ne yapmadığı (tedavi etmek) ayrı ayrı
 * söyleniyor; "şunu yaparsan iyileşirsin" cümlesi kurulmuyor. Örnekler
 * gündelik ve somut: nereye, ne zaman, neyin yanına yerleştirileceği.
 */

export interface CoachTip {
  /** Kısa başlık — kartın üstünde büyük görünür. */
  title: string;
  /** İki-üç cümlelik açıklama. */
  body: string;
  /** Rozet metni: ipucunun türü. */
  tag: string;
}

export const COACH_TIPS: CoachTip[] = [
  /* --- Plasebo nedir --------------------------------------------- */
  {
    tag: 'TEMEL',
    title: 'Plasebo nedir?',
    body: 'Etkin maddesi olmayan bir şeyin yine de bir etki yaratmasına plasebo deniyor. Buradaki formülün içinde etkin madde yok: renk, ses ve nefesten ibaret. Etkiyi yaratan şey, senin ona ayırdığın iki dakika.',
  },
  {
    tag: 'TEMEL',
    title: 'Bildiğin hâlde işe yarayabilir',
    body: 'Açık etiketli plasebo çalışmalarında insanlara "bu bir plasebo" dendiği hâlde bazı belirtilerde iyileşme bildirildi. Bu yüzden burada hiçbir şey gizlenmiyor — bilmen deneyi bozmuyor.',
  },
  {
    tag: 'TEMEL',
    title: 'Asıl iş ritüelde',
    body: 'Formülün üç adımı bir çerçeve kuruyor: durursun, bir şeye bakarsın, nefesini sayarsın. Çerçevenin kendisi, içine koyduğun şeyden bağımsız olarak günü bölüyor.',
  },
  {
    tag: 'TEMEL',
    title: 'Tek gerçek etken: nefes',
    body: 'Yavaş ve verişi uzun tutulan nefesin sakinleştirici etkisi gerçek. Renk, frekans ve kelime ise tamamen senin inancına kalmış. İkisini birbirine karıştırmıyoruz.',
  },

  /* --- Günlük hayata yerleştirme --------------------------------- */
  {
    tag: 'UYGULAMA',
    title: 'Var olan bir alışkanlığın yanına koy',
    body: 'Yeni bir alışkanlık, boşluğa değil var olanın yanına tutunur. Sabah kahveni koyduğun anla ritüeli birleştir: su ısınırken formülü başlat. "Kahve yaparım" hatırlatıcın olur.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Kapı eşiği kuralı',
    body: 'Eve girdiğin ilk iki dakikayı ritüele ayır. Ayakkabını çıkarmak ile telefona bakmak arasına sıkıştır: dışarıdaki günü içeriye taşımadan bir ara vermiş olursun.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Sınav ve sunum öncesi',
    body: 'Odak hedefini seç, ritüeli başlamadan 5 dakika önce çalıştır. Amaç bilgi yüklemek değil; ellerin işe başlamadan önce zihnin nereye bakacağını bilmesi.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Yatmadan önce',
    body: 'Uyku hedefinde ses adımı öne geçer ve süreler uzar. Telefonu bırakmadan önceki son iş olsun; ritüel bitince ekranı kapat, çünkü asıl fark ondan sonra geliyor.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Toplantı arası',
    body: 'İki toplantı arasında 90 saniyen varsa kulaklığı tak ve yalnızca ses adımını dinle. Ritüelin tamamını yapmak zorunda değilsin; yarısı da bir aradır.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Kaygı yükseldiğinde',
    body: 'Kaygı hedefinde nefes adımı başa geçer. Panik anında sayıları tutturmaya çalışma; sadece verişi alıştan uzun tut. Sayılar keyfi, ritim değil.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Yolda, otobüste, sırada',
    body: 'Renk adımı için sessizlik gerekmiyor. Kalabalıkta ekrana bakmak da bir sabitleme; gözün tek bir yerde durması, zihnin de orada durması demek.',
  },
  {
    tag: 'UYGULAMA',
    title: 'Aynı saat, aynı yer',
    body: 'Ritüeli her gün aynı saatte ve aynı köşede yapmayı dene. Tekrarlanan bağlam beklentiyi güçlendirir — plasebonun çalıştığı iddia edilen tek yer de burası zaten.',
  },

  /* --- Sürdürme -------------------------------------------------- */
  {
    tag: 'SÜREKLİLİK',
    title: 'Kaçırdığın gün başarısızlık değil',
    body: 'Seri kopabilir; uygulama seni bunun için azarlamıyor. Haftada bir "dünü dondur" hakkın var. Amaç kusursuz bir tablo değil, geri dönebilmek.',
  },
  {
    tag: 'SÜREKLİLİK',
    title: 'İki dakika kuralı',
    body: 'İsteksiz olduğun gün ritüeli tamamlamak zorunda değilsin: tek adım yap ve bırak. Küçük tutulan gün, atlanan günden daha kolay tekrarlanır.',
  },
  {
    tag: 'SÜREKLİLİK',
    title: 'Puan bir not değil',
    body: 'Ritüel sonundaki puan senin izlenimin; doğru cevabı yok. Düşük puan da veri — İstatistik ekranında günlerin nasıl dağıldığını görmek için orada duruyor.',
  },
  {
    tag: 'SÜREKLİLİK',
    title: 'Hedefi değiştirmek serbest',
    body: 'Dört hedefin de her gün ayrı bir formülü var ve hepsi açık. Sabah odak, gece uyku seçebilirsin; formül anında değişir, seri bozulmaz.',
  },

  /* --- Plasebonun gücü ------------------------------------------- */
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Beklenti etkisi gerçektir',
    body: 'Klinik çalışmalarda plasebo alan grup düzenli olarak iyileşme bildirir; bu, tekrar tekrar ölçülmüş bir olgu. "Hayal görmek" değil — beklentinin, bedenin sinyalleri nasıl işlediğini değiştirmesi.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Beklenti bedende karşılık buluyor',
    body: 'Plasebo ile ağrının azaldığı çalışmalarda, bedenin kendi ağrı kesici sistemlerinin devreye girdiği görüldü; etkiyi bu sistemleri bloke eden bir madde zayıflatabiliyor. Yani beklenti, fizyolojiye dokunan bir yol izliyor.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Ritüel etkiyi büyütüyor',
    body: 'Araştırmalarda plasebo yanıtı, işlem ne kadar özenli ve düzenliyse o kadar güçlü çıkıyor: ayrılan zaman, tekrar ve ilgi tek başına fark yaratıyor. Bu uygulamanın yaptığı da tam olarak bu — sana her gün özenli bir iki dakika kurmak.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Bildiğin hâlde çalışıyor',
    body: 'Açık etiketli plasebo çalışmaları, insanlara "bu bir plasebo" denildiği hâlde belirtilerde iyileşme bildirildiğini gösteriyor. Bu yüzden burada hiçbir şeyi saklamamıza gerek yok: bilmek etkiyi bozmuyor.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Etki bırakınca da sürebiliyor',
    body: 'Kanser sonrası yorgunlukta yapılan bir çalışmada, açık etiketli plasebo bırakıldıktan sonra da iyileşmenin bir süre korunduğu bildirildi. Kurulan beklenti, kaynağı ortadan kalksa bile bir süre ayakta kalıyor.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Kendi üstünde ölçebilirsin',
    body: 'Ayarlardaki kör testi açarsan bazı günler ritüel yerine eşit süreli bir bekleme gelir; hangisi olduğunu ancak sonunda öğrenirsin. İstatistik ekranı iki grubun ortalamasını karşılaştırır — kendi plasebo yanıtını kendin görürsün.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Beklentiyi korumak',
    body: 'Kötü bir şey olacağını düşünmek de gerçek şikâyet üretebiliyor (nocebo). Bu yüzden burada hiçbir gün "kötü gün" diye etiketlenmiyor ve düşük puan bir başarısızlık olarak sunulmuyor — beklentin senin lehine kalsın diye.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Yanında durur, yerine geçmez',
    body: 'Plasebo yanıtı gerçek olsa da bir tedavinin yerini almaz. Süregelen bir şikâyetin varsa hekimine danış; bu ritüel onun yanında, günlük bir alışkanlık olarak durmak için var.',
  },
  {
    tag: 'PLASEBONUN GÜCÜ',
    title: 'Veriler telefonda kalıyor',
    body: 'Ritüel kayıtların, puanların ve notların cihazından çıkmıyor; sunucu yok. Ayarlardan tek dokunuşla hepsini kalıcı olarak silebilirsin.',
  },

  /* --- Formülün mantığı ------------------------------------------ */
  {
    tag: 'FORMÜL',
    title: 'Formül nereden geliyor?',
    body: 'İki girdi var: günün tarihi ve seçtiğin hedef. Aynı gün, aynı hedef her zaman aynı formülü verir — rastgele değil, tekrarlanabilir.',
  },
  {
    tag: 'FORMÜL',
    title: 'Bir yıl boyunca tekrar yok',
    body: 'Renk, ses ve nefes üçlüsü bir yıl boyunca kendini tekrar etmeyecek biçimde seçiliyor. Her hedef de farklı bir noktadan başlıyor; aynı gün iki hedef aynı formülü vermiyor.',
  },
  {
    tag: 'FORMÜL',
    title: 'Adım sırası hedefe göre değişir',
    body: 'Kaygıda nefes başa geçer, uykuda ses. Sıra, "önce neyi yavaşlatmak istiyorsun" sorusunun cevabı — ölçülmüş bir gerekçesi yok, ama tutarlı.',
  },
  {
    tag: 'FORMÜL',
    title: 'Kelime bir talimat değil',
    body: 'Merkezdeki kelimeyi tekrarlamak zorunda değilsin; bakman yeterli. Anlamı sonradan gelir, bazen hiç gelmez. İkisi de olur.',
  },
  {
    tag: 'FORMÜL',
    title: 'Kulaklık şart değil',
    body: 'Ses adımı hoparlörden de çalışır; kulaklık etkiyi değil deneyimi değiştirir. Ses seviyesini Ayarlar’dan kısabilir, tamamen kapatabilirsin.',
  },
  {
    tag: 'FORMÜL',
    title: 'Aynı formülü tekrar oynat',
    body: 'Günün formülünü istediğin kadar tekrar başlatabilirsin; sınır yok. Sabah bir, akşam bir yapmak da geçerli bir kullanım.',
  },
];
