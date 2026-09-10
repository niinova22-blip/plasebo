# 1.4.1 reddi — Kullanım Koşulları (EULA) bağlantısı eksik

Apple, 1.4.1 sürümünü **Guideline 3.1.2 (Subscriptions)** kapsamında
otomatik bir mesajla geri çevirdi. Mektubun özü tek cümle:

> The submission offers auto-renewable subscriptions, such as Plasebo Plus
> Aylık, Plasebo Plus Yıllık, but does not include a functional link to the
> Terms of Use (EULA) in the app metadata that appears on the app's App
> Store product page.

**Bu bir kod hatası değil.** Uygulamanın içi kuralı zaten karşılıyor:
satın alma ekranında (`src/screens/PlansScreen.tsx`) aboneliğin süresi,
tutarı, kendiliğinden yenilendiği, nasıl durdurulacağı yazıyor ve altında
"Gizlilik politikası · Kullanım koşulları · Abonelikler" bağlantıları
duruyor. Eksik olan, **App Store ürün sayfasında görünen metin** — yani
App Store Connect'teki *Açıklama* alanı. Apple aynı bağlantıyı hem
uygulamanın içinde hem de mağaza metninde arıyor; ikincisi hiç yoktu.

Sonuç: yeni derleme gerekmez, sürüm numarası artmaz. Yalnızca mağaza
metni düzeltilip aynı derleme yeniden incelemeye gönderilir.

---

## Benim yaptıklarım (depoda hazır)

| Ne | Nerede |
| --- | --- |
| Açıklamanın sonuna Kullanım Koşulları bağlantısı eklendi | `store/1.4.0-MAGAZA-METINLERI.md` → "Açıklama (4000)" |
| Neden orada durduğu, uygulamadaki adresle aynı kalması gerektiği not edildi | aynı dosya, bloğun altındaki açıklama |
| Yeni uzunluk ölçüldü: **3925 / 4000** karakter | — |

Eklenen iki satır, "ABONELİK KOŞULLARI" paragrafından hemen sonra:

```
Kullanım Koşulları (EULA):
https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Adres Apple'ın **standart** son kullanıcı sözleşmesi. Özel bir sözleşme
yazılmadığı için App Store Connect'teki *License Agreement* alanına
dokunulmadı; standart sözleşme kullanılırken Apple bağlantının açıklama
metninde olmasını istiyor. Aynı adres uygulama içinde de
`src/utils/billing.ts` → `APPLE_EULA_URL` olarak duruyor; biri
değişirse diğeri de değişmeli.

---

## App Store Connect'te yapılanlar (7 Eylül 2026)

Bu adımlar **tamamlandı**; kayıt olarak duruyor.

1. Açıklamanın sonuna Kullanım Koşulları bağlantısı eklendi ve kaydedildi
   (3.925 / 4.000 karakter). Yalnızca Türkçe yerelleştirme var.
2. Mağaza ekran görüntüleri **gerçek uygulama kareleriyle** yenilendi:
   emülatörde ekran görüntüsü kipiyle çekilen altı ekran, kart düzenine
   yerleştirilip 6.9" (1290×2796) yuvasına sırayla yüklendi; 6.5" yuvası
   aynı seti kullanıyor. Yolun tamamı: `store/EKRAN-GORUNTULERI.md`.
3. Sürüm yeniden incelemeye gönderildi — **1.4.1 (derleme 23)** ve üç
   abonelik öğesi "Waiting for Review" durumunda. Yeni derleme
   gerekmedi, sürüm numarası artmadı.

Kalan tek isteğe bağlı adım: Resolution Center'daki mesaja "Kullanım
Koşulları bağlantısı uygulama açıklamasına eklendi" diye kısa bir yanıt
bırakmak. Zorunlu değil.

---

## Adımların ayrıntısı (tekrar gerekirse)

1. <https://appstoreconnect.apple.com> → **Apps** → **Plasebo**.
2. Sol sütunda incelemeden dönen sürümü seç (**1.4.1 Hazırlanıyor** /
   *Rejected* rozetiyle duruyor).
3. **Açıklama** kutusunu bul. İçindeki metni tamamen sil ve
   `store/1.4.0-MAGAZA-METINLERI.md` içindeki güncel "Açıklama (4000)"
   bloğunu olduğu gibi yapıştır. (Tek fark sondaki iki satır; istersen
   yalnızca onları da ekleyebilirsin — sonuç aynı.)
4. Sağ üstteki **Kaydet**'e bas.
5. **İncelemeye Gönder**'e bas. Yeni derleme seçmene gerek yok; aynı
   derleme (23) yeniden gider.
6. İstersen *Resolution Center*'daki mesaja tek cümlelik bir yanıt bırak:
   "Kullanım Koşulları bağlantısı uygulama açıklamasına eklendi." Zorunlu
   değil ama incelemeciye ne değiştiğini söyler.

Bundan sonraki sürümlerde bu iki satır açıklamada kalmalı; silinirse aynı
red aynı gerekçeyle tekrar gelir.

---

## İkinci red — 8 Eylül 2026 (aynı sürüm, farklı gerekçe)

Yukarıdaki mağaza metni düzeltmesi kabul edildi, ama Apple 1.4.1'i bir kez daha
geri çevirdi. Bu sefer gerekçe **Guideline 3.1.2(c)** ve hedef mağaza metni
değil, **uygulamanın kendisi**:

> The following information needs to be included within the app: a functional
> link to the Terms of Use (EULA).

Bağlantı kodda duruyor: `PlansScreen.tsx` içindeki `legalRow`, satın alma
düğmesinin altında "Gizlilik politikası · Kullanım koşulları · Abonelikler"
bağlantılarını çiziyor ve ortadaki `APPLE_EULA_URL`'i açıyor. Yani incelemeci
ya satın alma ekranına hiç girmedi ya da o satırı görmeden ekrandan çıktı.
Apple'ın mesajı bu ihtimali kendisi kabul ediyor:

> …or if they already do, reply to this message with a screen recording to
> confirm.

**Çözüm yeni derleme değil, kanıt.** Yapılanlar:

1. App Store Connect → 1.4.1 → App Review Information → **Notes** yeniden
   yazıldı (3.996 / 4.000). Eklenen "PURCHASE SCREEN, GUIDELINE 3.1.2" başlığı
   satın alma ekranına nasıl gidileceğini ve kuralın istediği altı maddenin
   ekranda tam olarak nerede durduğunu tek tek sayıyor. Yer açmak için 1.1.1
   reddinin artık geçersiz kalan geçmiş anlatımı ve birkaç uzun cümle kısaldı.
2. Resolution Center'a gönderilecek İngilizce yanıt ve ekran kaydında nelerin
   görünmesi gerektiği masaüstüne yazıldı:
   `AppStore-Red-Cevabi/plasebo-1.4.1-EULA-cevabi.md`.

Kalan iki adım kullanıcıda: cihazda ekran kaydını çekmek ve yanıtı kayıtla
birlikte göndermek. Sonra sürüm sayfasındaki **Update Review** ile aynı derleme
(23) tekrar incelemeye gider.

**Ders:** Zorunlu abonelik bağlantıları satın alma düğmesinin *altında* ve
listenin ortasında duruyor. Bir sonraki derlemede bunları düğmenin hemen
yanına, kaydırma gerektirmeyen bir yere almak aynı reddin üçüncü kez gelmesini
engeller.

### Yanıt gönderildi (09.09.2026)

Ekran kaydı çekilemedi: TestFlight kurulumu hâlâ *"İstenilen uygulama
kullanılamıyor veya yok"* ile düşüyor ve 102954309054 numaralı destek talebinden
sonuç gelmedi. Yani satın alma ekranı bir kez bile cihazda açılmadı.

Bu yüzden Resolution Center'a kayıt yerine yazılı yanıt gönderildi. Yanıt üç şey
söylüyor: bağlantıların satın alma ekranında tam olarak nerede olduğu (madde
madde), TestFlight'ın neden kurulamadığı ve destek talebinin numarası, ve
bağlantı dokunulduğunda açılmadıysa bunun bize bildirilmesi ricası. Yanıta bir
de kanıt eklendi: **Gelişim Takip 1.2.0 aynı gün aynı takımdan mağazaya çıktı**,
yani üretim dağıtımı çalışıyor ama TestFlight çalışmıyor — bu, sorunun bizim
imzamızda değil Apple'ın beta kaydında olduğunu gösteriyor.

### Satın alma ekranında iki kusur düzeltildi

İnceleme yanıtını beklerken kod okundu ve reddin muhtemel gerçek sebebi
bulundu. Apple "**functional** link" diyor; iki ayrı sebeple bağlantı
"yok" sayılmış olabilir:

**1. Bağlantı sessizce ölüyordu.**

```ts
void Linking.openURL(url).catch(() => {});
```

Adres açılamazsa hiçbir şey olmuyordu — ne hata, ne geri bildirim. İncelemeci
dokunup hiçbir şey olmadığını görürse "bağlantı çalışmıyor" yazar. Artık
açılamayan adres bir uyarı penceresinde okunabilir biçimde gösteriliyor.

**2. Zorunlu bilgiler okunamayacak kadar sönüktü.** Yenilenme ve iptal
paragrafı `fontSize: 10` ve temanın **en sönük** rengiyle (`theme.faint`),
yasal bağlantılar `fontSize: 11` ve `theme.sub` ile çiziliyordu. Kural bu
bilgilerin açıkça sunulmasını istiyor. Şimdi paragraf 12 punto ve `theme.sub`,
bağlantılar 13 punto, orta kalınlıkta ve `theme.text`.

İkisi de derleme gerektiriyor ama **TestFlight gerektirmiyor**: Codemagic
bulutta derleyip doğrudan App Store Connect'e yüklüyor. Yanıttan olumlu sonuç
gelmezse bu derleme gönderilir.

### Mağaza bağlantıları tek alan adında toplandı (09.09.2026)

`site/OKU-BENI.md` içinde bekleyen iş yapıldı. Gizlilik politikası ve veri
silme sayfaları GitHub Pages'ten Firebase'e taşındı; artık üçü de aynı alan
adında ve hepsi HTTP 200:

| Sayfa | Yeni adres |
| --- | --- |
| Tanıtım / destek | `https://plasebo-zihin-protokolu.web.app/` |
| Gizlilik politikası | `https://plasebo-zihin-protokolu.web.app/privacy.html` |
| Veri silme | `https://plasebo-zihin-protokolu.web.app/data-deletion.html` |

Eski GitHub Pages adresleri hâlâ 200 dönüyor (yalnız kök dizin 404), yani
kırılan bir şey yok — ama kök bize ait olmadığı için o site AdMob'un
`app-ads.txt` doğrulamasına hiç uygun değildi ve zaten tasfiye edilecekti.

App Store Connect'te güncellenenler:

- **Destek URL'si**: gizlilik politikasını gösteriyordu, artık tanıtım/destek
  sayfasını gösteriyor. Destek arayan kullanıcının bir hukuk metnine düşmesi
  hem yanlış hem de App Review'ın takıldığı bir ayrıntı.
- **Gizlilik Politikası URL'si** ve **Kullanıcı Gizlilik Tercihleri URL'si**:
  ikisi de aynı gizlilik sayfasını gösteriyordu. Birincisi Firebase'deki
  gizlilik sayfasına, ikincisi **veri silme** sayfasına çevrildi — alanın
  amacı kullanıcının tercihini uygulayabileceği yeri göstermek, salt politika
  metnini değil.
- **İnceleme notlarındaki** gizlilik adresi de aynı adrese çevrildi
  (3.995 / 4.000 karakter).

Gizlilik alanları "bir sonraki sürümle yayınlanır" diye işaretli; 1.4.1
yeniden incelemeye gittiğinde birlikte gidecek.

---

## Üçüncü hamle: yeni derleme (10 Eylül 2026)

9 Eylül'de gönderilen yazılı yanıta bir gün sonra hâlâ cevap gelmedi ve sürüm
*Rejected* durumunda duruyor. TestFlight de çalışmadığı için ekran kaydı hâlâ
çekilemiyor. Beklemek yerine kanıt yolu bırakıldı: **kusur varsayılıp yeni bir
derleme gönderiliyor.**

Codemagic bulutta derleyip doğrudan App Store Connect'e yüklediği için bu adım
TestFlight'a hiç ihtiyaç duymuyor. Sürüm numarası **1.4.1 kalıyor**; derleme
numarasını Codemagic TestFlight'taki son numaradan türetiyor, yani derleme
**24** olacak (`codemagic.yaml` → "Derleme numarasını TestFlight'tan al").

Derlemeye giren üç değişiklik, üçü de aynı reddi hedefliyor:

1. **`openLink` artık sessizce ölmüyor.** Açılamayan adres bir uyarı
   penceresinde okunabilir biçimde gösteriliyor. Eskiden hata yutuluyordu;
   incelemeci dokunup hiçbir şey olmadığını görürse "bağlantı çalışmıyor" der.
2. **Zorunlu bilgiler okunaklı.** Yenilenme/iptal paragrafı 10 punto ve temanın
   en sönük renginden 12 punto ve `theme.sub`'a; yasal bağlantılar 11 puntodan
   13 punto, orta kalınlık ve `theme.text`'e çıktı.
3. **Sıra değişti — asıl düzeltme bu.** Öne çıkan üç özellik kartı plan
   kartlarının üstünde duruyordu ve satın alma düğmesiyle altındaki zorunlu
   bilgiyi ekranın dışına itiyordu. O blok aşağı, "PLUS İLE AÇILANLAR"
   bölümünün önüne alındı. Ayrıca yasal bağlantı satırı zorunlu abonelik
   metninin **üstüne** çıkarıldı: artık satın alma düğmesinin hemen altında,
   kaydırma gerektirmeden görünüyor. İki reddin de muhtemel gerçek sebebi buydu
   — bağlantılar vardı, ama incelemecinin ulaşmadığı yerdeydi.

Derleme yüklendikten sonra App Store Connect'te 1.4.1'in derlemesi 23'ten 24'e
alınıp sürüm yeniden incelemeye gönderilecek. Resolution Center'daki yanıt
zaten duruyor; oradan cevap gelirse yeni derleme onu da karşılıyor.

### Gönderildi (10 Eylül 2026, akşam)

Derleme **24** Codemagic'te 10 dakikada üretildi (build #11, commit `bc5eaff`) ve
App Store Connect'e yüklendi. Sürüm sayfasındaki derleme 23'ten 24'e alındı,
kaydedildi ve gönderim yenilendi. Şu an **1.4.1 (24)** ve üç abonelik öğesi
*Waiting for Review* durumunda.

Aynı gün, biz göndermeden birkaç dakika önce Apple 9 Eylül'deki yazılı yanıta
cevap verdi: "Please resubmit the app for review in App Store Connect once any
necessary adjustments have been made." Yani red gerekçesini tartışmak yerine
düzeltip yeniden göndermek zaten beklenen yoldu.

### TestFlight'ın çalışmama sebebi bulundu

Codemagic'in son iki derlemesi "finished with **post-processing failed**" ile
bitiyordu. Loglardaki gerçek hata şu:

> Complete test information is required to submit application … for external
> testing. App is missing required Beta App Information: Feedback Email.
> App is missing required Beta App Review Information: First Name, Last Name,
> Phone Number, Email.

Yani IPA sorunsuz derlenip yükleniyor, Apple işlemeyi bitiriyor, ama build
TestFlight'a **dağıtılamıyordu**: uygulamanın Test Bilgisi sayfası bütünüyle
boştu. İmzayla, sertifikayla ya da hesapla ilgisi yoktu — nitekim loglardaki
takım kimliği `ML3UZXMU3D`, yani doğru hesap.

App Store Connect → TestFlight → Test Information dolduruldu ve kaydedildi:

| Alan | Değer |
| --- | --- |
| Beta App Description | Kısa tanıtım + "Sign in with Apple, ayrı parola yok" |
| Feedback Email | `akokdogan59@gmail.com` |
| Marketing URL | `https://plasebo-zihin-protokolu.web.app/` |
| Privacy Policy URL | `https://plasebo-zihin-protokolu.web.app/privacy.html` |
| Beta App Review kişisi | Rahile KOKDOGAN · +90 536 367 74 53 · `akokdogan59@gmail.com` |

Ad, App Store Connect'teki App Review iletişim bilgisiyle birebir aynı yazımda
(`Rahile KOKDOGAN`) girildi; hesap ve banka kayıtlarındaki yazımla tutarlı
kalması gerekiyor.

Bundan sonraki derlemelerin post-processing adımı geçmeli. Build 24 TestFlight'ta
"Ready to Submit" ve İç Test grubunda görünüyor; cihazda kurulum artık
denenebilir. Kurulum tutarsa ekran kaydı da çekilebilir — ama bu gönderim için
artık gerekmiyor.
