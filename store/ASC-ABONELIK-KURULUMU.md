# App Store Connect — abonelik ürünlerini oluşturma

Bu dosya, `store/1.4.0-YAYIN.md` içindeki **Adım 2**'nin tam hâli.
Girilecek her alanın karşılığı hazır yazılmış; ekrandaki kutuya
kopyalayıp yapıştırman yeterli. Metinler uygulamadaki plan ekranıyla
birebir tutuyor — Apple bu tutarlılığı denetliyor, ürün açıklaması ile
uygulamanın vaadi ayrıştığında ürün reddediliyor.

**Ön şart:** Ücretli Uygulamalar sözleşmesi + banka + vergi (Adım 1) —
**bitti**. Bu bölüm "Etkin" görünmeden abonelik ürünü oluşturma sayfası
zaten açılmıyor.

Toplam süre: yaklaşık 30–40 dakika. Sekiz bölüm var, sırayla git.

---

## ✅ TAMAMLANDI — 5 Eylül 2026

**Aşağıdaki 1–6. bölümlerin tamamı App Store Connect'te uygulandı.** Bu
dosya artık bir yapılacaklar listesi değil, ne kurulduğunun kaydı. Kalan
tek iş de bitti: inceleme ekran görüntüsü yüklendi ve iki ürün de
gönderildi (aşağıda 7b).

| Ne | Değer |
| --- | --- |
| Abonelik grubu | `Plasebo Premium` — Grup kimliği **22361536** |
| Grup görünen adı (TR + EN) | `Plasebo Plus` |
| Aylık ürün | `com.plasebo.app.premium.monthly` — Apple kimliği **6809005061** |
| Yıllık ürün | `com.plasebo.app.premium.yearly` — Apple kimliği **6809005201** |
| Seviye | İkisi de **seviye 1** (aynı hizmet, farklı dönem) |
| Kullanılabilirlik | 175 ülke, ikisinde de |
| Ücretsiz deneme | İkisinde de: 5 Eyl 2026 → bitiş yok, ilk hafta ücretsiz |
| Durum | İkisi de **Prepare for Submission** |

### Uygulanırken ortaya çıkan üç fark

**1. Aylık fiyat ₺149,00 değil ₺149,99.** Apple'ın Türkiye kademe
listesinde ₺149,00 diye bir kademe yok; standart liste ₺29,99 · ₺49,99 ·
₺79,99 · ₺99,99 · **₺149,99** · ₺199,99 diye gidiyor. En yakın kademe
olarak ₺149,99 seçildi ve koddaki yedek tutar buna göre düzeltildi
(`src/constants/pricing.ts` → `MONTHLY_PRICE_TRY = 149.99`).

Yıllık tutar planlandığı gibi **₺1.159,99** — bu tutar standart listede
yok ama "See Additional Prices" altındaki genişletilmiş listede var.

Sonuç: indirim oranı %35 değil **%36** oldu (1 − 1159,99 ⁄ 1799,88 =
%35,6). Plan ekranındaki rozet bu oranı mağazadan okuduğu iki fiyattan
**kendisi hesapladığı** için kodda değişiklik gerekmedi; yalnızca mantık
testindeki beklenen değer güncellendi.

**2. Grup görünen adında "özel ad" kullanılmadı.** Apple, abonelik
yönetim ekranında uygulama adının nasıl görüneceğini soruyor. `Plasebo`
diye kısaltmak yerine varsayılan bırakıldı: kullanıcı ekranda
`Plasebo · Zihin Protokolü` görüyor. Sebep, uygulamanın mağazadaki adıyla
birebir aynı olması — özel ad her zaman ek bir inceleme yüzeyi ve bu
projede daha önce 2.1 reddi yaşandı.

**3. Yıllık üründe "1 Year Upfront" seçildi.** Apple artık yıllık
aboneliklerde ikinci bir seçenek sunuyor: "Monthly with a 12-Month
Commitment" (aylık tahsilat, 12 ay taahhüt). Bu **bilerek boş bırakıldı**
— uygulamanın kodu tek seferlik yıllık ödeme bekliyor ve o seçenek yalnız
iOS 26.4+ cihazlarda çalışıyor. Yıllık plan, yılda bir kez ₺1.159,99
tahsil ediliyor.

---

## Karakter sınırları — önce bunu bil

Apple bu alanlarda sert sınırlar koyuyor ve sınırı aşan metni kutuya hiç
yazdırmıyor. Aşağıdaki bütün metinler sınırların içinde kalacak şekilde
yazıldı; kendin değiştirirsen sayıya dikkat et.

| Alan | Sınır |
| --- | --- |
| Abonelik grubu görünen adı | 30 karakter |
| Ürün görünen adı (Display Name) | 30 karakter |
| Ürün açıklaması (Description) | 45 karakter |
| Referans adı (yalnız panelde) | 64 karakter |

---

## 1. Abonelik grubunu oluştur

1. **https://appstoreconnect.apple.com** → **akokdogan59@gmail.com** ile
   giriş yap.
2. **Uygulamalarım** → **Plasebo**.
3. Sol menüde **"Para Kazanma"** (Monetization) başlığının altındaki
   **"Abonelikler"** (Subscriptions) satırına tıkla.
4. **"Abonelik Grubu Oluştur"** (Create Subscription Group) düğmesine bas.
5. Tek bir alan çıkar:

   | Alan | Ne yazacaksın |
   | --- | --- |
   | **Referans Adı** | `Plasebo Premium` |

   Bu ad yalnız panelde görünür, kullanıcı hiç görmez. Kimliklerle
   uyumlu kalsın diye `Premium` bırakıldı.

6. **Oluştur** de.

> **Grup neden gerekiyor?** Grup, "aynı anda yalnızca birine abone
> olunabilir" demenin Apple'daki yolu. Aylık ile yıllık aynı gruba
> girdiği için kullanıcı ikisi arasında geçiş yapabiliyor ve iki kez
> ödeme yapması imkânsız hâle geliyor.

---

## 2. Grubun görünen adını (yerelleştirmesini) gir

Grup oluşunca içindesin. **"Yerelleştirmeler"** (Localizations) bölümünü
bul ve iki dil ekle. Bu ad, kullanıcının telefonundaki **Ayarlar → Apple
Kimliği → Abonelikler** ekranında görünüyor.

**Türkçe:**

| Alan | Değer |
| --- | --- |
| Abonelik Grubu Görünen Adı | `Plasebo Plus` |
| Uygulama Adı (varsa) | `Plasebo` |

**İngilizce (ABD):**

| Alan | Değer |
| --- | --- |
| Abonelik Grubu Görünen Adı | `Plasebo Plus` |
| Uygulama Adı (varsa) | `Plasebo` |

> Ürün kimlikleri `premium` diyor ama kullanıcıya görünen her yerde
> **Plasebo Plus** yazıyor — uygulamanın içinde de öyle. Kimlikler Apple'da
> bir kez oluşturulduktan sonra asla değiştirilemediği için ad uğruna
> kimlik değiştirilmedi; kullanıcı kimliği zaten hiçbir yerde görmüyor.

---

## 3. Aylık aboneliği oluştur

Grubun içindeyken **"+"** ya da **"Abonelik Oluştur"** düğmesine bas.

| Alan | Değer |
| --- | --- |
| **Referans Adı** | `Plasebo Plus Aylık` |
| **Ürün Kimliği** | `com.plasebo.app.premium.monthly` |

> ⚠️ Ürün kimliğini **birebir** böyle yaz — nokta, küçük harf, hepsi.
> Bir harf farkı ürünü uygulamada "bulunamadı" yapar; satın alma hiç
> başlamaz ve hiçbir hata da vermez, düğme sessizce çalışmaz. Kimlik bir
> kez oluşturulduktan sonra Apple'da **asla** değiştirilemiyor.

**Oluştur** dedikten sonra ürünün kendi sayfası açılır. Sırayla şu dört
bölümü doldur:

### 3a. Abonelik Süresi

**1 Ay** (1 Month) seç.

### 3b. Abonelik Fiyatları

1. **"Fiyat Ekle"** (Add Subscription Price) de.
2. Ülke olarak **Türkiye**'yi seç.
3. Listeden **₺149,99** kademesini seç. (₺149,00 diye bir kademe yok —
   bkz. yukarıdaki "Uygulanırken ortaya çıkan üç fark".)

> ⚠️ Apple serbest tutar kabul etmiyor, listeden **kademe** seçtiriyor.
> Listede tam olarak istediğin tutar yoksa **en yakın kademeyi** seç ve **bana
> hangi tutarı seçtiğini söyle** — koddaki yedek tutarı
> (`src/constants/pricing.ts`) ona göre düzelteyim. Uygulamada görünen
> fiyat zaten mağazadan okunuyor, yani kullanıcı her hâlükârda doğru
> tutarı görür; yedek yalnızca uçak kipinde ya da mağaza arızasında
> ekranın boş kalmaması için var.

4. Diğer ülkelerin fiyatını Apple kendisi hesaplıyor; önerdiği tabloyu
   olduğu gibi kabul et.

### 3c. Yerelleştirme (iki dil, ikisi de zorunlu)

**"Yerelleştirme Ekle"** → **Türkçe**:

| Alan | Değer | Karakter |
| --- | --- | --- |
| **Görünen Ad** | `Plasebo Plus Aylık` | 18 / 30 |
| **Açıklama** | `Yüz taraması, nefes analizi ve tam geçmiş` | 41 / 45 |

**"Yerelleştirme Ekle"** → **İngilizce (ABD)**:

| Alan | Değer | Karakter |
| --- | --- | --- |
| **Görünen Ad** | `Plasebo Plus Monthly` | 20 / 30 |
| **Açıklama** | `Face scan, breath analysis, full history` | 40 / 45 |

> Bu iki metin, kullanıcının Apple'ın satın alma onay penceresinde
> gördüğü metinler. İngilizcesi ayrıca **inceleme sırasında Apple'ın
> gördüğü metin** — inceleme İngilizce yapılıyor.

### 3d. Kullanılabilirlik

**Tüm ülkeler ve bölgeler** seçili kalsın. Uygulamanın kendisi zaten tüm
ülkelerde yayında; aboneliği daraltmanın bir sebebi yok.

---

## 4. Yıllık aboneliği oluştur

Aynı grubun içinde ikinci bir abonelik oluştur. **Gruptan çıkma** —
yıllık, aylıkla aynı grupta olmak zorunda.

| Alan | Değer |
| --- | --- |
| **Referans Adı** | `Plasebo Plus Yıllık` |
| **Ürün Kimliği** | `com.plasebo.app.premium.yearly` |

### 4a. Abonelik Süresi

**1 Yıl** (1 Year) seç.

### 4b. Abonelik Fiyatları

Türkiye → **₺1.159,99** kademesi. (Yine listede tam karşılığı yoksa en
yakınını seç ve bana söyle.)

> **Bu tutar neden böyle:** aylığın on iki katı 1.788 ₺; 1.159,99 bunun
> %64,9'u. Seçilen gerçek kademelerle (149,99 × 12 = 1.799,88) oran
> **%36** çıkıyor. Plan ekranındaki "%36 indirim · ayda
> ₺96,67" satırı bu iki fiyattan **hesaplanıyor**, koda yazılı değil —
> kademeyi değiştirirsen rozet kendiliğinden düzelir, yeni sürüm
> göndermeye gerek kalmaz.

### 4c. Yerelleştirme

**Türkçe**:

| Alan | Değer | Karakter |
| --- | --- | --- |
| **Görünen Ad** | `Plasebo Plus Yıllık` | 19 / 30 |
| **Açıklama** | `Yüz taraması, nefes analizi ve tam geçmiş` | 41 / 45 |

**İngilizce (ABD)**:

| Alan | Değer | Karakter |
| --- | --- | --- |
| **Görünen Ad** | `Plasebo Plus Yearly` | 19 / 30 |
| **Açıklama** | `Face scan, breath analysis, full history` | 40 / 45 |

### 4d. Kullanılabilirlik

Tüm ülkeler.

---

## 5. Abonelik seviyelerini eşitle

Grup sayfasında ürünlerin yanında bir **"Seviye"** (Level / Rank) sütunu
var. İki ürünü de **aynı seviyeye** koy.

Sebebi: seviye, Apple'a "hangisi yükseltme, hangisi düşürme" diye
söylüyor. Aylık ile yıllık **birebir aynı şeyi** açıyor — tek fark ödeme
dönemi. Farklı seviyelere konursa yıllıktan aylığa geçen kullanıcı
"düşürme" yapmış sayılır ve değişiklik dönem sonuna ertelenir; aynı
seviyede ise geçiş bir "yan geçiş" olur ve Apple bunu doğru yönetir.

---

## 6. Ücretsiz denemeyi ekle (her iki ürüne ayrı ayrı)

Uygulamanın kendi içinden verdiği bir "hediye deneme" **yok** ve olmayacak
— kasıtlı. Uygulamanın kendi verdiği deneme Apple'a hiç uğramadığı için
süre sonunda hiçbir şey olmuyor, ödemeye dönüşmüyordu. Deneme Apple'ın
**tanıtım teklifi** mekanizmasıyla veriliyor: kullanıcı Apple'ın satın alma
ekranından geçiyor, süre dolunca ücretli döneme kendiliğinden geçiyor.

Her iki üründe de: ürün sayfası → **"Tanıtım Teklifleri"**
(Introductory Offers) → **"Tanıtım Teklifi Oluştur"**.

| Alan | Değer |
| --- | --- |
| Ülkeler | **Tüm ülkeler ve bölgeler** |
| Başlangıç tarihi | Bugün |
| Bitiş tarihi | **Yok / süresiz** (No End Date) |
| Teklif türü | **Ücretsiz** (Free) |
| Süre | **1 Hafta** |

**Kodda hiçbir değişiklik gerekmiyor.** Uygulama teklifi mağazadan
kendisi okuyor: teklif tanımlıysa plan kartında "7 gün ücretsiz, sonra
₺149,99" yazıyor ve düğme "Ücretsiz denemeyi başlat" oluyor. Teklifi
kaldırırsan metin de kendiliğinden normale döner.

---

## 7. Vergi kategorisi ve inceleme bilgisi

### 7a. Vergi kategorisi

Her iki üründe **"Vergi Kategorisi"** (Tax Category) alanı var ve
varsayılan değeri **"Match to parent app"** (uygulamanın kategorisiyle
aynı). Doğru olan bu, dokunulmadı. Standart
uygulama kategorisini seç — Plasebo bir yazılım hizmeti; e-kitap,
dergi, ses/görüntü yayını ya da bulut hizmeti değil. Apple bir soru
listesi gösterirse hepsine **hayır** demek doğru cevap.

### 7b. İnceleme ekran görüntüsü (zorunlu) — ✅ üretildi ve yüklendi

Her iki ürün için **plan ekranının görüntüsü** isteniyor. Bu alan
doldurulmadan ürünler gönderime eklenmiyor; App Store Connect
*"Unable to Add for Review — You must add a Review Information
screenshot"* diyor.

Görüntü telefondan alınamadı: TestFlight derlemesi hazır olmasına rağmen
cihaza inmedi (bkz. `store/1.4.0-YAYIN.md`, Adım 8). Onu beklemek yerine
görüntü depodan üretiliyor:

```bash
python scripts/iap-review-shot.py
```

Çıktı masaüstünde `plasebo-iap` klasörüne yazılıyor:

| Dosya | Ne zaman kullanılır |
| --- | --- |
| `plan-ekrani-en.png` | **Apple'a yüklenecek olan.** İnceleme İngilizce yapılıyor. |
| `plan-ekrani-tr.png` | Türkçe karşılığı; arşiv ve kendi kontrolün için. |

Görüntü bir tasarım maketi değil: ölçüler `src/screens/PlansScreen.tsx`
içindeki `StyleSheet`'ten, renkler `src/theme/theme.ts` içindeki Şafak
temasından (varsayılan tema), metinler `src/i18n/en.ts` içindeki gerçek
İngilizce karşılıklardan, fiyatlar App Store Connect'te seçilen gerçek
kademelerden geliyor. Ekran bir kaydırma listesi olduğu için görüntü tek
bir telefon ekranından uzun — kaydırmanın tamamını gösteriyor, yani
inceleyen kişi zorunlu abonelik metnini ve bağlantıları da görüyor.

`scripts/plus-mockups.py` bu iş için **kullanılamaz**: sayfalarında
açıklama başlıkları var, paleti Eylül 2026'da yumuşatılmadan önceki
mor/neon ikilisi, ekranı koyu temada çiziyor ve asıl önemlisi zorunlu
abonelik metni ile gizlilik/kullanım koşulları bağlantılarını hiç
çizmiyor.

**ÖLÇÜ ŞARTI:** App Store Connect serbest boy kabul etmiyor. İlk deneme
*"The dimensions of one or more screenshots are wrong."* ile düştü;
görüntünün bir iOS cihaz ekran görüntüsü ölçüsünde olması gerekiyor.
Betik bu yüzden çıktıyı **1290×2796**'ya sığdırıyor — mağaza
listesindeki 6.9 inçlik kartlarla aynı ölçü. Plan ekranı bir kaydırma
listesi olduğu ve içeriği tek telefon ekranına sığmadığı için kadraj
kırpılmıyor, kaydırmanın tamamı ölçeklenip ortalanıyor; kenarlarda
kalan boşluk ekranın kendi zemin rengiyle doluyor. Kırpılsaydı zorunlu
abonelik metni ile hukuki bağlantılar kadrajın dışında kalırdı — oysa
inceleyenin görmesi gereken tam olarak onlar.

**Yükleme — iki ürün için ayrı ayrı, aynı dosya (6 Eylül 2026'da
yapıldı, aşağıdaki sıra kayıt olarak duruyor):**

1. https://appstoreconnect.apple.com adresine gir.
2. Üstteki **Uygulamalarım** → **Plasebo**.
3. Sol menüden **Abonelikler** (Subscriptions) → **Plasebo Premium**
   grubunun altındaki **Plasebo Plus (Aylık)** ürününe tıkla.
4. Sayfayı aşağı kaydır, **"App Store Promotion"** bölümünün altındaki
   **"Review Information"** başlığını bul.
5. Oradaki **Screenshot** kutusunun içine `plan-ekrani-en.png` dosyasını
   sürükle (ya da kutuya tıklayıp masaüstünden seç). Yükleme birkaç
   saniye sürüyor, bitince küçük bir önizleme çıkıyor.
6. Sağ üstteki **Kaydet** (Save) düğmesine bas.
7. Aynı ürünün sayfasında sağ üstte **"Add for Review"** düğmesi
   aktifleşir. Bas ve açılan pencerede mevcut **Draft Submission**'ı seç.
8. Sol menüden **Plasebo Plus (Yıllık)** ürününe geç ve 4–7 arasını
   aynen tekrarla. Aynı dosya kullanılıyor; iki ürün için ayrı görüntü
   gerekmiyor.

İkisi de gönderime eklendi; sürüm sayfasından uygulama sürümü de
eklenip **Submit for Review** ile 4 öğe birlikte gönderildi.

### 7c. İnceleme notu — ✅ yazıldı

Her iki ürünün **Review Notes** kutusuna aynı metin yazıldı. Metin
**İngilizce**, çünkü inceleyen kişi İngilizce okuyor:

```
Plasebo Plus unlocks the app's measurement layer: face-scan mood
measurement, breath analysis during the ritual, daytime check-ins with a
next-morning report, unlimited targeted prescriptions, full history and
an ad-free experience.

The daily ritual itself is fully available on the free tier - nothing
about it is locked.

How to reach the purchase screen: Settings tab -> Plan row.

The monthly and the yearly product unlock exactly the same entitlement;
only the billing period differs.
```

## 8. Gizlilik beyanı — bilerek DEĞİŞTİRİLMEDİ

Bu dosyanın ilk hâlinde "toplanan veri türlerine **Satın Alma Geçmişi**
ekle" yazıyordu. Uygulama sırasında bundan **vazgeçildi** ve beyan olduğu
gibi bırakıldı (Device ID, Name, Advertising Data, Email Address).

Gerekçe: Apple'ın "toplama" tanımı, verinin **cihazdan çıkıp geliştiriciye
ya da bir üçüncü tarafa ulaşması**. Plasebo'nun arka ucu yok; satın alma
StoreKit üzerinden doğrudan Apple ile kullanıcı arasında geçiyor ve
geliştiriciye kullanıcıya bağlı bir satın alma geçmişi hiç ulaşmıyor —
yalnızca Apple'ın toplu satış raporları geliyor. Böyle bir veriyi
"topluyorum" diye beyan etmek hem yanlış olurdu hem de uygulamanın
kullanıcıya verdiği "veriler cihazdan çıkmaz" sözüyle çelişen bir gizlilik
etiketi üretirdi.

Reklam tarafı zaten doğru beyan edilmiş durumda: AdMob gerçek bir üçüncü
taraf ve Device ID / Advertising Data / Usage Data izleme amacıyla
bildirilmiş.

> **Bu bir yorum, kesin bir kural değil.** Beyanı yine de eklemek
> istersen App Store Connect → App Privacy → Data Types → Edit yolundan
> "Purchases → Purchase History" eklenebilir; değişiklik anında yayına
> giriyor, yeni sürüm gerektirmiyor.

## Sırada ne var

App Store Connect tarafında yapılacak başka bir şey kalmadı. Sıra:

1. ~~`PREMIUM_ENABLED = true`~~ ✅ yapıldı.
2. ~~Codemagic'te `plasebo-ios` ortam değişkeni grubu~~ ✅ yapıldı.
3. ~~Derleme → TestFlight~~ ✅ derleme 22 (1.4.0) yüklendi.
4. ~~İnceleme görüntüsünü üret~~ ✅ `python scripts/iap-review-shot.py`.
   Masaüstündeki `plasebo-iap/plan-ekrani-en.png` dosyasını iki ürünün
   Review Information alanına yükle — **sıradaki iş** (yukarıda 7b).
5. Sandbox hesabıyla satın alma ve ücretsiz kademe testleri
   (`store/1.4.0-YAYIN.md` Adım 7).

## Yapmaman gerekenler

| Ne | Neden |
| --- | --- |
| Üçüncü bir ürün (ömür boyu, içerik paketi) oluşturmak | Kodda karşılığı yok. `PACKS_FOR_SALE = false`; ömür boyu ürünü bilerek kaldırıldı. |
| Ürün kimliğini değiştirmek ya da düzeltmek | Apple'da kimlik asla değiştirilemiyor; yanlış kimlik yeni ürün açmayı gerektirir. |
| Ürünleri tek başına incelemeye göndermek | Abonelikler **uygulama sürümüyle birlikte** incelemeye girmeli ("Submit with app version"). |
| Kendi EULA'nı yazmak | Plan ekranındaki "Kullanım koşulları" bağlantısı Apple'ın standart EULA adresine gidiyor. Kendi metnini yazarsan `src/utils/billing.ts` içindeki `APPLE_EULA_URL` de değişmeli. |
