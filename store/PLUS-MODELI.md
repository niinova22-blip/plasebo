# Plasebo Plus — free / plus modeli

Bu belge, uygulamanın ücretsiz ve ücretli kademelerinin ne olduğunu ve
neden öyle olduğunu anlatır. Mağaza tarafındaki adımlar (ürün oluşturma,
sözleşme, sandbox testi) ayrı bir dosyada: `store/ABONELIK.md`.

Önce **senin yapacakların**, sonra **benim yaptıklarım** var.

---

## AYRIM İLKESİ

> **Ritüel herkese açık. Plus, ölçümü açar.**

Uygulamanın vaadi olan günlük plasebo ritüeli ücretsiz kademede eksiksiz
çalışır: dört formül, sınırsız tekrar, günde bir nokta atışı reçete.
Bunun iki gerekçesi var. Biri etik — bir sakinleşme uygulaması insanı
ödeme duvarının önünde bırakmamalı. Diğeri pratik: Apple'ın 2.1 (App
Completeness) maddesi tam olarak buna bakıyor ve 1.1.1 sürümü satın
alınamayan kilitli özellikler yüzünden reddedildi.

Plus'ın sattığı şey **kanıt katmanı**: "ritüeli yaptım"ı "şu kadar
değişti"ye çeviren nesnel araçlar. Yüz taraması ve nefes analizi bu
katmanın ta kendisi, bu yüzden plan ekranının en üstünde duruyorlar.

Satış cümlesi: *"Ritüel ücretsiz ve öyle kalacak. Plus, ritüelin sende
işe yarayıp yaramadığını sana ölçerek söyler."*

---

## FREE

| Ne | Durum |
| --- | --- |
| Dört günlük formül | sınırsız tekrar |
| Nokta atışı reçete | **günde 1** |
| Yüz taramalı ölçüm | **günde 1** |
| Önce/sonra ölçüm (hak bitince) | kendi puanın, 1–10 kaydırıcı |
| Refleks testi | açık |
| Geçmiş | 7 gün |
| Widget, hatırlatıcı, kör test, tema | açık |
| Reklam | seans sonunda geçiş reklamı, günde en çok 3 |

**Yüz taraması neden tamamen kilitli değil.** Görmediği bir özelliğe kimse
para vermez. Günde bir ölçüm, Plus'ın ne sattığını yaşatıyor; hem de
1.2.0'dan gelen kullanıcı için sert bir geri alma olmuyor. Sınırsız
vermek ise satacak bir şey bırakmazdı.

**Refleks testi neden ücretsiz.** Kameraya ve Sağlık verisine ihtiyacı
yok, yani bize maliyeti düşük; buna karşılık kullanıcıya "bu uygulama
gerçekten ölçüyor" hissini bedavaya veriyor. Plus'ın ne olduğunu anlatan
en ucuz kanıt bu.

---

## PLUS — ₺149,99/ay · ₺1.159,99/yıl

Yıllık plan, aylığın on iki katına göre **%36 indirimli**; aya düşen
tutar **₺96,67**. Bu satır plan ekranında ekranda yazan iki fiyattan
hesaplanıyor, sabit yazılmıyor.

Öne çıkan üç özellik (plan ekranının en üstünde, kendi ikonlarıyla):

1. **Yüz taramasıyla ölçüm** — önce ve sonra puanını sen tahmin etme,
   kamera ölçsün. Cihaz üstündeki duygu modeli yüz ifadeni okur, fotoğraf
   telefondan çıkmaz.
2. **Nefes analizi** — ritüel sırasında nefesinin düzenliliğini,
   derinliğini ve dakikadaki sayısını ölçer.
3. **Gün içi ölçüm ve sabah raporu** — gün içinde üç kısa nefes ölçümü,
   ertesi sabah uyku ve nabızla birleşen tek bir rapor.

Listenin kalanı:

4. Sınırsız nokta atışı reçete (günde bir sınırı kalkar)
5. Reçete takibi — hangi şikayette ne kadar iyileştiğin
6. Tüm geçmiş ve gelişmiş formül havuzu
7. Çift doz — ritüel süresini kendin ayarlama
8. **Reklamsız**

---

## SENİN YAPACAKLARIN

### 1. App Store Connect'te iki abonelik ürününü oluştur

Kod tarafı bitti ama **`PREMIUM_ENABLED` bayrağı hâlâ `false`**. Bilerek:
satın alınamayan bir plan ekranıyla derleme göndermek, 1.1.1'i düşüren
2.1 reddini birebir tekrarlar.

Adım adım anlatımı `store/ABONELIK.md` içinde — özellikle şu üç bölüm:

- **2a. Sözleşmeler, Vergi ve Bankacılık** — bu "Etkin" görünmeden
  abonelik ürünü oluşturulamıyor. Banka hesabı ve W-8BEN vergi formu
  gerekiyor, ikisi de hesap sahibinin adına.
- **2b. Abonelik grubu ve ürünler** — iki ürün, ürün kimlikleri ve
  fiyatlar orada tablo hâlinde.
- **2f. Test** — sandbox hesabıyla denenecekler listesi.

Bittiğinde bana söyle: bayrağı `true` yapıp derlemeye hazır hâle
getireyim.

### 2. Fiyat kademesi tutmazsa haber ver

Apple serbest tutar kabul etmiyor, listeden fiyat kademesi seçtiriyor.
Kademeler App Store Connect'te seçildi: ₺149,99 ve ₺1.159,99. ₺149,00
diye bir kademe yok; ileride kademe değiştirilirse en yakınını seç ve
seçtiğin tutarları bana söyle — koddaki yedek tutarları
(`src/constants/pricing.ts`) ona göre düzelteyim.

Ekranda görünen fiyat zaten mağazadan okunuyor, yani kullanıcı her
hâlükârda doğru tutarı görür. Düzeltilmesi gereken tek şey, mağazaya
ulaşılamadığında gösterilen yedek ve ondan hesaplanan indirim rozeti.

### 3. Karar: mevcut kullanıcıya ne söylenecek?

1.2.0'da yüz taraması ve nefes analizi **herkese açıktı**, çünkü
`PREMIUM_ENABLED` kapalıyken kimseye sınır uygulanmıyor. Bayrağı açtığımız
anda mevcut kullanıcılar nefes analizini ve sınırsız yüz taramasını
kaybedecek.

Uygulama çok yeni olduğu için katlanılabilir, ama **sessizce alınan
özellik kötü yorum getirir**. Üç seçenek var:

| Seçenek | Ne demek |
| --- | --- |
| Tek seferlik bilgi ekranı | Güncellemeden sonraki ilk açılışta neyin değiştiğini ve neyin ücretsiz kaldığını anlatan bir ekran. Dürüst yol. |
| Mevcut kullanıcıya kalıcı muafiyet | Bu sürümden önce kurmuş olanlar eski hakları korur. En cömerdi, ama kodda kalıcı bir ayrık durum demek. |
| Hiçbir şey | En ucuzu, en riskli olanı. |

Önerim birincisi. Hangisini istediğini söyle, ona göre yapayım.

---

## BENİM YAPTIKLARIM

### Modelin koda geçirilmesi

| Dosya | Ne |
| --- | --- |
| `src/constants/plans.ts` | Kademe tanımları, özellik listeleri, öne çıkan üç özellik, `FREE_LIMITS` |
| `src/constants/pricing.ts` | **Yeni.** Yedek tutarlar, indirim yüzdesi, mağaza fiyatı çözücü — bağımlılıksız, sınanıyor |
| `src/context/PremiumContext.tsx` | Yetki tablosuna dört yeni alan: `faceScansPerDay`, `breathAnalysis`, `dailyReport`, `adFree` |
| `src/utils/faceScanQuota.ts` | **Yeni.** Günlük yüz taraması sayacı; saf kısmı ayrı durduğu için sınanabiliyor |
| `src/screens/PlansScreen.tsx` | Öne çıkan üç özellik, indirim rozeti, Plus adlandırması |
| `src/screens/ScoreBeforeScreen.tsx` | **Geri geldi.** Elle ölçüm — aşağıdaki tıkanmanın çözümü |

### Düzeltilen tıkanma: ücretsiz kademe hiç çalışamazdı

Modeli kurmadan önce çıkan en önemli şey bu. `ScoreBeforeScreen` bir
önceki turda silinmiş, elle puan veren kaydırıcı kaldırılmış ve ritüelin
**başlangıç puanı yalnızca yüz taramasından** alınır olmuştu.

Sonuç şuydu: "Evet, uygula" düğmesi kamerayı açıyor, kullanıcı kamera
iznini vermezse ya da yüz okunamazsa modalde "Vazgeç"ten başka düğme
bulunmuyor ve **ritüel hiç başlamıyordu**. Bu, Plus'tan bağımsız olarak
bugün de bir hataydı; Plus'la birlikte ücretsiz kademenin tamamını
kullanılamaz hâle getirecekti.

Yapılanlar:

- `ScoreBeforeScreen` geri geldi ve gezinme ağacına bağlandı.
- `CameraMoodCapture` artık her durumda **"Kamera olmadan elle puanla"**
  çıkışı gösteriyor: izin verilmedi, cihaz desteklemiyor, yüz okunamadı.
- `ScoreAfterScreen` ikiye ayrıldı. Kural: **önce ve sonra aynı yöntemle
  ölçülür.** Seansın başı kamerayla ölçüldüyse sonu da kamerayla, elle
  puanlandıysa sonu da kaydırıcıyla. İkisini karıştırmak iki ayrı ölçeği
  yan yana koymak olurdu ve "3 puan azaldı" cümlesi dayanaksız kalırdı.
- Kayıttaki `scoreAfterFromCamera` alanı artık puanın varlığına değil ham
  yüz okumasının varlığına bakıyor; elle verilen puan kamerayla ölçülmüş
  gibi kaydedilmiyor.

### Günlük ölçüm hakkının kuralları

- Hak, ölçüm **başarıyla bittiğinde** düşüyor. Vazgeçilen ya da yüz
  bulunamayan bir deneme hak yakmıyor.
- Kamerayla ölçülen bir seansın "sonra" ölçümü haktan **düşmüyor**:
  karşılığı olmayan bir "önce" değeri hiçbir işe yaramaz.
- Sayaç takvim gününe göre sıfırlanıyor, "son 24 saat"e göre değil —
  ritüel günlük, ölçüm de aynı ritme oturuyor.
- Bozuk kayıt sayacı kilitlemiyor, sıfırdan başlıyor: sayaç bir kolaylık,
  lisans denetimi değil.
- Hesap silinince sayaç da siliniyor.

### Kilitlerin nerede olduğu

| Özellik | Kilit nerede | Kilitliyken ne oluyor |
| --- | --- | --- |
| Yüz taraması | `PrescriptionScreen`, `ComplaintScreen` | Elle puanlamaya düşüyor; şikayet ekranındaki kart plan ekranına götürüyor |
| Nefes analizi | `RitualScreen` | **Mikrofon izni hiç istenmiyor.** Ritüelin nefes adımı aynen çalışıyor |
| Gün içi döngü | `SettingsScreen`, `App.tsx` | Anahtar yerine plan ekranına giden bir satır; bildirimler kurulmuyor |
| Reklam | `SessionSummaryScreen` | Plus üyesi geçiş reklamını hiç görmüyor |

Mikrofon izninin hiç istenmemesi bilinçli: ölçümü yapmayacaksak izin
sormak hem anlamsız hem de kullanıcıya yanlış bir şey vaat ediyor.

Bildirim tarafında yetki de denetleniyor, yalnız ayar değil. Abonelik
bittiğinde ayardaki anahtar açık kalıyor (kullanıcı onu kapatmadı) ama
artık açılamayan bir ekrana davet göndermek olmaz; kuyruk her açılışta
yeniden kurulduğu için döngü bir sonraki açılışta kendiliğinden susuyor.

### Yol boyunca düzeltilen iki şey

- **Reklam sayacı.** Günlük üç reklam hakkı `show()` çağrılmadan önce
  artıyordu; gösterim hata verdiğinde kullanıcı hiçbir reklam görmediği
  hâlde bir hakkı harcanmış oluyordu. Sayaç artık yalnız reklam gerçekten
  kapandığında artıyor.
- **Ayarlar ekranı.** Reklam rızası durumunu okuyan `useEffect`'te iptal
  koruması yoktu; ekran cevap gelmeden kapatılırsa sökülmüş bileşene
  yazılıyordu. Hemen altındaki sağlık denetimiyle aynı hâle getirildi.

### Ömür boyu ürünü kaldırıldı

Tek seferlik ödeme yinelenen gelirin yerini uzun vadede almıyor; üstelik
App Store Connect'te ayrı bir ürün türü, ayrı inceleme ve satın alma
katmanında ayrı bir dal demekti. `PurchaseOptionId` artık iki değer
taşıyor ve `billing.ts` yalnız abonelik sorguluyor — her plan açılışında
boş dönen ikinci bir mağaza sorgusu da böylece kalktı.

### Doğrulama

| Adım | Sonuç |
| --- | --- |
| TypeScript (katı kip) | temiz |
| Mantık testleri | **54/54** (46'ydı; 8 yeni test) |
| Widget eklentisi / Podfile / Swift | 8/8, 3/3, 5 dosya temiz |
| Çeviri kapsamı | 29 yeni metin eklendi, eksik yok |

Yeni testler günlük hak sayacını (gün dönümü, bozuk kayıt, Plus'ta
sınırsızlık, harcamanın saflığı) ve fiyat çözücüyü (TL/dolar biçimleri,
ondalıksız tutarlar, çözülemeyen biçimde `null`, %35 hesabı) kapsıyor.
