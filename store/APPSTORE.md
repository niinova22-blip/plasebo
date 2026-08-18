# App Store yayın kontrol listesi

Play Store dosyasının (`store/RELEASE.md`) iOS karşılığı. Depodaki teknik
hazırlık tamam; kalanlar Apple hesabı, App Store Connect formları ve
cihazda deneme — yani ağırlıklı olarak senin yapman gerekenler.

**Mac gerekmiyor.** Derleme, EAS'in bulut sunucularındaki macOS makinelerinde
yapılıyor; sen Windows'tan tek komutla tetikliyorsun. Gereken tek fiziksel
şey, TestFlight ile denemek için bir iPhone.

**Sunucu yine gerekmiyor.** Uygulamanın arka ucu yok; iOS'ta da her şey
cihazda duruyor.

**Tek ücret** Apple Developer Program üyeliği: **yılda 99 USD** (Play'in tek
seferlik 25 USD'sinden farklı olarak her yıl yenilenir). Uygulama ücretsiz
olduğu için Apple'a başka bir ödeme yapılmaz.

---

## Depoda hazır olanlar

| Ne | Nerede |
| --- | --- |
| iOS uygulama yapılandırması (paket kimliği, simge, şifreleme beyanı) | `app.json` → `ios` |
| Google girişinin iOS URL şeması (ortam değişkeninden türetilir) | `app.config.js` |
| **Apple ile giriş** (App Store kuralı 4.8 gereği eklendi) | `src/context/AuthContext.tsx`, `src/screens/SignInScreen.tsx` |
| Apple girişini de anlatan gizlilik metinleri | `src/constants/legal.ts`, `docs/privacy.html` |
| App Store ölçüsünde ekran görüntüleri (1290×2796, 6 adet) | `store/graphics/screenshots/ios/` |
| 1024×1024 saydamlıksız simge | `npm run store:assets` → `store/graphics/icon-1024.png` |
| iOS derleme ve gönderme komutları | `npm run build:ios`, `npm run submit:ios` |
| Mağaza metinleri ve form cevapları | bu dosyanın alt bölümleri |

Bu sürümde yapılan değişiklikler:

- **Apple ile giriş eklendi.** App Store kuralı 4.8, Google gibi üçüncü
  taraf girişi sunan uygulamalarda Apple ile girişin de sunulmasını şart
  koşuyor. Yalnızca iOS 13+ cihazlarda görünür; Android'de hiçbir şey
  değişmez. Apple, adı ve e-postayı **yalnızca ilk yetkilendirmede**
  verir; kullanıcı e-postasını gizlemeyi seçerse uygulamaya
  `...@privaterelay.appleid.com` adresi ulaşır. İkisi de yalnızca cihazda
  saklanır, Google girişinde olduğu gibi.
- **`app.config.js` eklendi.** Google girişi iOS'ta "ters çevrilmiş
  istemci kimliği" biçiminde bir URL şeması ister
  (`com.googleusercontent.apps.…`). Bu değer `app.json`'a elle yazılmasın
  diye `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` içinden türetiliyor. Statik
  yapılandırma yine `app.json`'da; `app.config.js` yalnızca bu tek alanı
  ekliyor. Kimlik tanımlı değilse hiçbir şey değişmez, Android derlemesi
  bugünkü gibi çalışır.
- **`supportsTablet` `true` → `false`.** Açık kalsaydı App Store ayrıca
  iPad ekran görüntüsü ister ve incelemeci uygulamayı iPad'de de test
  ederdi. Uygulama telefon için tasarlandı; iPad'de yine kurulur, uyumluluk
  modunda çalışır. İleride iPad düzeni yapılırsa geri açılabilir.
- **`usesNonExemptEncryption: false`.** Uygulama yalnızca HTTPS kullanıyor;
  bu beyan olmadan her yüklemede "ihracat uyumluluğu" sorusu tekrar sorulur
  ve sürüm o soruya cevap verilene kadar incelemeye girmez.
- **`usesAppleSignIn: true`** — derlemeye Apple girişi yetkisini (entitlement)
  ekler. Bu olmadan Apple girişi cihazda hata verir.
- Sürüm `1.1.0`, Android `versionCode` 7 yapıldı (Apple girişi Android
  derlemesini de değiştirdiği için Play'e de yeni bir sürüm gitmeli).
- Ekran görüntüsü üreticisi artık iki mağaza için de üretiyor:
  `npm run store:shots` → Play için 1080×1920, App Store için 1290×2796.

- Ayarlar ekranındaki hesap metinleri platformdan bağımsız hâle geldi
  ("Google ile giriş yap" yerine iPhone'da "Hesabınla giriş yap"; silme
  uyarısı artık yalnızca Google'dan söz etmiyor).
- Eksik olan iki eşlik bağımlılığı (`expo-asset`, `react-native-worklets`)
  doğrudan kuruldu ve SDK 57 yama sürümleri hizalandı. Bunlar
  `node_modules` içinde dolaylı olarak vardı; ilk iOS derlemesinde
  eksiklik çökme sebebi olabilirdi.

Doğrulandı: `tsc --noEmit` temiz, `npx expo-doctor` 21/21 geçiyor,
`npx expo config` iOS bloğunu doğru çözüyor, Play kartları eskisiyle aynı
ölçüde üretiliyor.

> iOS native projesi (`ios/` klasörü) Windows'ta üretilemez — bu normaldir
> ve bir sorun değildir. EAS derlemesi bu adımı macOS tarafında kendisi
> yapar. Yani eklentilerin iOS tarafındaki ilk gerçek denemesi, ilk bulut
> derlemesidir.

---

## 1. Apple Developer Program üyeliği

Bu adım en uzun süren adım (doğrulama bazen 1–2 gün sürer), o yüzden ilk
bunu başlat.

1. [developer.apple.com/programs](https://developer.apple.com/programs/)
   → **Enroll**.
2. Apple Kimliği ile giriş yap. Hesapta **iki adımlı doğrulama açık
   olmalı** — kapalıysa önce [appleid.apple.com](https://appleid.apple.com)
   → Oturum Açma ve Güvenlik → İki Adımlı Doğrulama'dan aç.
3. Kayıt türü: **Individual / Sole Proprietor** (bireysel). Şirket olarak
   kaydolmak D-U-N-S numarası ister ve haftalar sürebilir; bireysel kayıtta
   böyle bir şey yok.
4. Ad, adres ve telefon bilgilerini **kimliğindeki gibi** gir. Apple bunları
   doğruluyor; uyuşmazsa kayıt takılır.
5. 99 USD'yi öde. Onay e-postası gelene kadar sonraki adımlara geçemezsin.

> Bireysel kayıtta App Store'da yayımcı adı olarak **kendi adın soyadın**
> görünür, "Plasebo" değil. Bunu değiştirmenin tek yolu şirket hesabıdır.

Onay geldikten sonra [App Store Connect](https://appstoreconnect.apple.com)
açılır. İlk girişte **Sözleşmeler (Agreements, Tax, and Banking)** bölümünde
ücretsiz uygulamalar sözleşmesini kabul et. Banka ve vergi bilgisi yalnızca
para kazanmaya başlayınca (abonelik) gerekir; şimdilik gerekmiyor.

## 2. App Store Connect'te uygulama kaydı

1. App Store Connect → **Uygulamalarım → + → Yeni Uygulama**.
2. Formda:
   - Platform: **iOS**
   - Ad: **Plasebo** — App Store'da uygulama adları benzersizdir. "Plasebo"
     alınmışsa **Plasebo · Zihin Protokolü** gibi bir varyant dene; ad 30
     karakteri geçemez.
   - Birincil dil: **Türkçe**
   - Paket kimliği (Bundle ID): **com.plasebo.app** — listede yoksa önce
     ilk derlemeyi çalıştır (4. adım); EAS bu kimliği Apple hesabında
     otomatik oluşturur, sonra buraya dönüp seç.
   - SKU: kendi iç kodun, kullanıcıya görünmez. `plasebo-ios` yaz.
   - Kullanıcı Erişimi: Tam Erişim.

## 3. Google Cloud — iOS istemcisi

Google girişi iOS'ta ayrı bir istemci kimliği ister. Android istemcisi
(paket adı + SHA-1) iOS'ta çalışmaz.

1. [Google Cloud Console](https://console.cloud.google.com/) → Play için
   açtığın **aynı projeyi** seç.
2. **API'ler ve Hizmetler → Kimlik bilgileri → Kimlik bilgisi oluştur →
   OAuth istemci kimliği**.
3. Uygulama türü: **iOS**. "Paket kimliği" alanına **com.plasebo.app** yaz.
   (Apple Team ID ve App Store kimliği alanları boş bırakılabilir.)
4. Oluştur'a bas. Ekranda çıkan **İstemci kimliği**
   (`...apps.googleusercontent.com`) tek ihtiyacın olan değer; kopyala.
5. Proje kökündeki `.env` dosyasına yaz:

   ```
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=buraya-kopyaladığın-değer.apps.googleusercontent.com
   ```

6. Aynı değeri EAS'a da tanımla (derlemeye gömülecek olan bu):

   ```bash
   eas env:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "..." --visibility plaintext --environment production
   ```

   Web istemci kimliği (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`) zaten tanımlı;
   iOS de aynı web kimliğini kullanır, yenisini oluşturma.

> OAuth izin ekranındaki **yayın durumu "Üretim"** olmalı — Play için
> yapıldıysa yeniden yapmana gerek yok, aynı ekran iki platform için de
> geçerli.

## 4. EAS ile iOS derlemesi

```bash
npm run build:ios
```

İlk çalıştırmada EAS sırayla şunları soracak:

1. **Apple hesabınla giriş** — Developer Program'a kaydolduğun Apple
   Kimliği. İki adımlı doğrulama kodu telefonuna gelir.
2. **Dağıtım sertifikası ve profil oluşturulsun mu?** → **Evet**. EAS
   sertifikayı kendi sunucusunda üretir ve saklar; senin bir şey indirip
   yüklemene gerek yok. (Android'deki keystore ile aynı mantık.)
3. Paket kimliği Apple hesabında yoksa oluşturulmasını onayla; **Sign in
   with Apple** yetkisi de bu sırada otomatik etkinleştirilir.

Derleme 15–30 dakika sürer; çıktı bir `.ipa` dosyasıdır ve EAS panosunda
durur. Bu dosya cihaza doğrudan kurulamaz — iOS'ta test yolu TestFlight'tır.

```bash
npm run submit:ios
```

Bu komut son derlemeyi App Store Connect'e yükler. Apple ID'ni ve hangi
uygulamaya yükleneceğini sorar. Yükleme sonrası "İşleniyor" durumu 10–30
dakika sürer.

## 5. TestFlight ile cihazda deneme

Bir iPhone gerekiyor. App Store'dan **TestFlight** uygulamasını kur,
App Store Connect → **TestFlight → Dahili Test** altına kendi Apple
Kimliğini test kullanıcısı olarak ekle, gelen davet bağlantısını iPhone'da
aç.

> Play'deki gibi "12 test kullanıcısı 14 gün" zorunluluğu **yoktur**.
> Dahili testler incelemeye girmez, anında kurulabilir. İstersen tek
> başına test edip doğrudan yayına gönderebilirsin.

Cihazda mutlaka dene:

- **Apple ile giriş** — ad geliyor mu, "e-postamı gizle" seçeneğiyle de
  giriş tamamlanıyor mu.
- **Google ile giriş** — pencere açılıp uygulamaya geri dönüyor mu.
  Dönmüyorsa iOS istemci kimliği derlemeye girmemiş demektir (3. adım).
- Bildirim izni isteniyor ve günlük hatırlatıcı gerçekten geliyor mu.
- **Ritüel sesleri, telefon sessiz moddayken de çalıyor mu** (uygulama bunu
  bilerek açıyor; iOS'ta varsayılan davranış sessizde ses çalmamaktır).
- Koyu/açık tema, "Hareketi Azalt" açıkken animasyonların durması.
- "Hesabı ve tüm verileri sil" akışı.

## 6. App Store Connect formları

Uygulama sayfasında **Dağıtım** sekmesindeki her alan doldurulmalı.

### Mağaza metinleri

**Ad (30 karakter)**

```
Plasebo
```

**Alt başlık (30 karakter)** — App Store'a özgü, Play'de karşılığı yok:

```
Bilerek inan
```

(12 karakter. Alternatif: `Açık etiketli plasebo ritüeli` — 29 karakter.)

**Tanıtım metni (170 karakter)** — inceleme gerektirmeden istediğin zaman
değiştirebildiğin tek alan:

```
Her gün bir renk, bir ses, bir nefes ve bir kelime. Formül bilimsel görünür;
değildir. Uygulama bunu her ekranda yazar. İki dakika sürer, kararı sen
verirsin.
```

**Açıklama (4000 karakter)** — `store/LISTING.md` içindeki "Tam açıklama"
metninin aynısı kullanılabilir; App Store'da da aynı kurallar geçerli
(fayda vaat edilmiyor). Tek fark: son paragrafa Apple girişi eklendi.

```
Plasebo, her gün sana bir "formül" verir: bir renk, bir ses, bir nefes tekniği
ve bir kelime. Formül bilimsel görünür. Değildir. Tamamen plasebodur ve
uygulama bunu senden saklamak yerine her ekranda yazar.

BU UYGULAMA NE YAPMAZ

Plasebo hiçbir şeyi iyileştirmez, tedavi etmez, tanı koymaz. Bir tıbbi cihaz
değildir ve hiçbir tıbbi desteğin yerine geçmez. Sana bir fayda vaat
etmiyoruz — çünkü ölçülmüş bir faydası yok ve bunu söylemek uygulamanın
tasarımının merkezinde.

O HALDE NEDEN?

Açık etiketli plasebo (open-label placebo) gerçek bir araştırma alanıdır:
insanlara verilenin plasebo olduğu açıkça söylendiğinde bile bazı
çalışmalarda etki gözlenmiştir. Plasebo bu fikri bir günlük ritüele
dönüştürür ve sana kendi üstünde deneme imkânı verir. "Nasıl çalışır?"
ekranında bu çalışmaların kaynaklı bir listesi ve nocebo etkisine dair
uyarı yer alır — uygulamanın ürettiği uydurma "bulgular"dan ayrı tutulmuş
şekilde.

GÜNLÜK RİTÜEL

• Günün formülü tarihten ve seçtiğin hedeften üretilir. Aynı gün, aynı
  hedef, hep aynı formül.
• Üç adım: renk, ses, nefes. Sıraları hedefine göre değişir.
• İki dakika sürer. Sonunda ritüeli puanlar, istersen kısa bir not
  bırakırsın.
• Seri, ısı haritası ve kilometre taşları devam etmeni kolaylaştırır.

KENDİ İDDİASINI TEST EDER

Ayarlardaki "Kör test" açıldığında bazı günler ritüel yerine eşit süreli
boş bir bekleme gelir. Hangi günün sahte olduğu ritüel bitene kadar
söylenmez. İstatistik ekranı gerçek ve sahte günlerin puan ortalamalarını
karşılaştırır. Aradaki fark küçük çıkarsa bu da bir bulgudur — ve uygulama
bunu senden gizlemez.

VERİLERİN SENDE KALIR

• Sunucu yok, veritabanı yok, analiz aracı yok, reklam yok.
• Ritüel kayıtların, puanların ve notların telefonundan hiçbir yere
  gönderilmez.
• Apple ya da Google ile giriş yalnızca adını ve e-postanı okur; bunlar da
  yalnızca cihazında saklanır. Apple girişinde e-postanı gizlemeyi
  seçebilirsin.
• Ayarlardan tek dokunuşla her şeyi kalıcı olarak silebilirsin.

ERİŞİLEBİLİRLİK

Cihazında "Hareketi Azalt" açıksa uygulamadaki tüm animasyonlar devre dışı
kalır ve hiçbir içerik kaybolmaz. Koyu tema, ses seviyesi ve titreşim ayrı
ayrı ayarlanabilir.

⚗️ Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.
Sağlığınla ilgili bir endişen varsa bir sağlık profesyoneline başvur.
```

**Anahtar kelimeler (100 karakter, virgülle ayrılır, boşluk bırakma)** —
App Store'a özgü; Play'de karşılığı yok. Uygulama adı ve kategori adı
zaten aranıyor, onları tekrar yazma:

```
plasebo,ritüel,nefes,rutin,alışkanlık,farkındalık,odak,uyku,kaygı,günlük,protokol,deney
```

(99 karakter.)

**Destek URL'i (zorunlu)**

```
https://niinova22-blip.github.io/plasebo/privacy.html
```

**Pazarlama URL'i (isteğe bağlı):** boş bırakılabilir.

**Gizlilik politikası URL'i (zorunlu)**

```
https://niinova22-blip.github.io/plasebo/privacy.html
```

### Kategori

| Alan | Değer | Gerekçe |
| --- | --- | --- |
| Birincil kategori | **Yaşam Tarzı** | Play'deki seçimle aynı. "Sağlık ve Form" seçilirse Apple sağlıkla ilgili ek beyan ve daha sıkı inceleme uygular; Plasebo bilerek hiçbir sağlık işlevi görmüyor. |
| İkincil kategori | **Yardımcı Programlar** ya da boş | İsteğe bağlı. |

### Ekran görüntüleri

`store/graphics/screenshots/ios/` altındaki **6 dosyayı** yükle. Hepsi
1290×2796 — Apple'ın istediği "6.9 inç iPhone" ölçüsü. Bu ölçü
yüklendiğinde daha küçük ekranlar için ayrıca görsel istenmez. iPad
görseli gerekmiyor (`supportsTablet` kapalı).

| Dosya | Başlık |
| --- | --- |
| `01-ana-ekran.png` | Her gün yeni bir formül |
| `02-ritual-renk.png` | İki dakikalık bir tören |
| `03-ritual-nefes.png` | Nefesin ritmi ekranda |
| `04-giris-dersi.png` | Uygulama ne olduğunu söylüyor |
| `05-istatistik.png` | Ölçen sensin |
| `06-nasil-calisir.png` | Uydurma bulgular ayrı, literatür ayrı |

Simge ayrıca yüklenmez; App Store Connect onu derlemenin içinden okur.
`store/graphics/icon-1024.png` yine de elde dursun diye üretiliyor.

### Yaş sınırı (Age Rating)

Ankette dikkat edilecekler:

- Şiddet, cinsellik, küfür, kumar, korku: **yok**.
- **"Tıbbi/tedavi bilgisi"** → uygulama tıbbi tavsiye vermiyor ama plasebo
  araştırmalarından söz ediyor. **"Seyrek/hafif"** işaretle; "yok" demek
  yanlış olur, "sık/yoğun" demek gereksiz.
- **"Uyuşturucu, tütün, alkol kullanımı veya referansı"** → **yok**.
  Uygulamadaki "doz" ve "formül" kelimeleri mecazidir; gerçek ya da kurgusal
  bir madde gösterilmez, tarif edilmez, özendirilmez.
- Kullanıcılar arası etkileşim, kullanıcı üretimi içerik, konum paylaşımı,
  web erişimi: **yok**.
- Kısıtlanmamış web erişimi: **hayır**.

Beklenen sonuç 13+ civarı çıkar. Play'deki 18+ hedef kitlesiyle uyum için
sonucu istersen elle daha yükseğe çekebilirsin; düşürmek mümkün değildir.

### App Privacy (gizlilik etiketleri)

Play'deki "Veri güvenliği" formunun karşılığı. Cevaplar orada olduğu gibi
**muhafazakâr** seçilmiştir: Apple'ın tanımına göre ad ve e-posta cihazdan
dışarı gönderilmediği için "toplanmıyor" da denebilir, ama girişte bu
veriler Apple/Google'dan **alındığı** için beyan etmek incelemede sorun
çıkarmaz, tersi çıkarır.

| Soru | Cevap |
| --- | --- |
| Bu uygulama veri topluyor mu? | **Evet** |
| İletişim Bilgileri → **Ad** | Toplanıyor · Kullanıcı kimliğine bağlı · Amaç: **Uygulama İşlevselliği** · İzleme için kullanılmıyor |
| İletişim Bilgileri → **E-posta Adresi** | Toplanıyor · Kullanıcı kimliğine bağlı · Amaç: **Uygulama İşlevselliği** · İzleme için kullanılmıyor |
| Tanımlayıcılar → Kullanıcı Kimliği | **Beyan etme.** Apple/Google'ın hesap kimliği yalnızca cihazda tutulur; istersen "Uygulama İşlevselliği" amacıyla ekleyebilirsin. |
| Sağlık ve Form, Finans, Konum, Kişiler, Fotoğraf, Mesaj, Arama Geçmişi, Kullanım Verisi, Tanılama | **Hiçbiri** |
| Üçüncü taraf reklam / izleme | **Yok** |
| Veri satışı | **Yok** |

> **Sağlık verisi beyan edilmiyor** — ve edilmemeli. Puanlar ve notlar
> cihazdan hiç çıkmaz; Apple'ın tanımıyla "toplanan" veri değildir.

### İnceleme bilgileri (App Review Information)

**Demo hesap zorunlu** — giriş olmadan uygulama kullanılamıyor. Play için
açtığın inceleme hesabının aynısını kullan; iki adımlı doğrulaması **kapalı**
olmalı, yoksa incelemeci giriş yapamaz.

- Oturum açma gerekli: **Evet**
- Kullanıcı adı / şifre: Play'e verdiğin demo Google hesabı

**Notlar (Notes)** alanına şunu yaz:

```
Uygulama, hesapla giriş yapılmasını ister. iOS'ta iki yol vardır: "Apple ile
Devam Et" (istediğiniz Apple Kimliği ile kullanılabilir) ya da yukarıdaki
Google hesabı.

Sıra şöyledir: açılış ekranında "Başla" → altı ekranlık tanıtım (sağa
kaydırarak ya da "Devam" düğmesiyle geçilir) → son ekranda bir ad yazılır ve
"İlk protokolümü başlat" düğmesine basılır → giriş ekranı → kısa bir hazırlık
animasyonu → şikâyet seçim ekranı. Bu noktadan sonra tüm özellikler
kullanılabilir.

Hesap neden gerekli: uygulamanın kullanıcıya görünen tüm ilerlemesi (seri,
ritüel geçmişi, ölçümler) hesaba bağlıdır ve bir sonraki sürümde hesaba bağlı
üyelik gelecektir. Uygulamanın sunucusu yoktur; tüm veriler cihazda tutulur ve
Ayarlar → Veri bölümünden tek dokunuşla kalıcı olarak silinebilir.

Bu sürümde satın alınabilir bir içerik yoktur: "Premium" ekranı yalnızca
ileride gelecek özellikleri tanıtır, satın alma düğmesi bulunmaz ve hiçbir
özellik ödemeyle açılmaz.

Uygulama bilinçli olarak bir plasebo ritüelidir; hiçbir sağlık veya tedavi
iddiası taşımaz ve bunu her ekranda açıkça yazar.
```

### Diğer alanlar

- **Fiyat:** Ücretsiz. Tüm ülkeler.
- **İhracat uyumluluğu:** `usesNonExemptEncryption: false` derlemeye
  gömüldüğü için soru sorulmaz. Sorulursa cevap: **Hayır** (yalnızca
  standart HTTPS).
- **İçerik hakları:** Üçüncü taraf içeriği yok.
- **Reklam tanımlayıcısı (IDFA):** Kullanılmıyor.
- **Sürüm yayınlama:** "İnceleme onaylandıktan sonra elle yayınla" —
  onayın geldiği anı görmeden mağazada görünmesin.

## 7. İncelemeye gönder

Sürüm sayfasında derlemeyi seç → **İncelemeye Gönder**. Apple incelemesi
genelde 24–48 saat sürer; Play'in aksine test kullanıcısı bekleme
zorunluluğu yoktur.

Bu uygulamanın en olası ret sebepleri ve hazır cevapları:

| Kural | Risk | Durum / cevap |
| --- | --- | --- |
| **4.8 – Sign in with Apple** | Google girişi sunup Apple girişi sunmamak doğrudan rettir. | **Çözüldü** — Apple ile giriş eklendi ve Google düğmesiyle aynı boyutta, ondan önce gösteriliyor. |
| **5.1.1(v) – Zorunlu hesap** | Apple, uygulamanın çekirdek işlevi hesap gerektirmiyorsa girişi zorunlu tutmayı yasaklar. Plasebo verileri cihazda tuttuğu için incelemeci "bu neden gerekli?" diyebilir. | Notlarda gerekçe yazılı. **Reddedilirse** en hızlı çözüm, iOS'ta girişi atlanabilir yapmaktır (hesapsız kullanım, üyelik gelince giriş istenir). Bu değişiklik yaklaşık yarım saatlik iştir; gerekirse söyle. |
| **2.1 – Eksik uygulama** | "Premium · yakında" yazan kilitli özellikler, "tamamlanmamış uygulama" olarak yorumlanabilir. | Notlarda satın alma olmadığı yazılı. Reddedilirse plan ekranı iOS'ta gizlenebilir. |
| **1.4.1 / 2.5.x – Sağlık iddiaları** | Sağlık iddiası taşıyan uygulamalar sıkı incelenir. | Uygulama hiçbir fayda vaat etmiyor ve bunu her ekranda yazıyor; listeleme metni de aynı çizgide. Risk düşük. |
| **2.1 – Demo hesap çalışmıyor** | Google, tanımadığı cihazdan girişte doğrulama isteyebilir. | Demo hesabında iki adımlı doğrulama kapalı olmalı; göndermeden önce başka bir cihazdan giriş yapıldığını kendin dene. |

Ret gelirse App Store Connect'teki **Çözüm Merkezi**'nden incelemeciye
yazabilirsin; çoğu ret, kod değişikliği değil açıklama ile kapanır.

## 8. Sonraki sürümler

`eas.json` içindeki `appVersionSource: "remote"` ve `autoIncrement: true`
iOS'ta da geçerli: `buildNumber` her üretim derlemesinde EAS tarafından
otomatik artırılır. Kullanıcıya görünen sürüm (`app.json` → `version`) elle
güncellenir ve **her yeni derlemede artırılmalıdır** — hem App Store hem
Play aynı alanı okur.

```bash
npm run build:ios && npm run submit:ios
```

## 9. Abonelik — iOS tarafı (ilk sürümde yok)

> Bu bölümün ayrıntılı hâli — banka/vergi adımları, abonelik grubu,
> Apple'ın arayüz şartları ve kod tarafı — `store/ABONELIK.md` içinde.

Play'deki durumun aynısı: kademeler ve plan ekranı hazır, gerçek satın alma
yok. iOS'ta dijital ürün satmanın tek yolu **StoreKit / App Store
Faturalandırması**dır; başka bir ödeme yöntemi uygulamanın kaldırılma
sebebidir. Apple'ın payı ilk yıl %30, aboneliğin ikinci yılından itibaren
%15'tir (Küçük İşletme Programı'na başvurursan %15).

Sıra:

1. App Store Connect → **Para Kazanma → Abonelikler / Uygulama İçi Satın
   Almalar** altında ürünleri aç. Kimlikler `src/constants/plans.ts` ile
   birebir aynı olmalı — Play'de kullanılan kimliklerin aynısı iOS'ta da
   kullanılabilir:

   | Ürün | Tür | Kimlik |
   | --- | --- | --- |
   | Premium | Abonelik | `plasebo_premium_monthly` |
   | Sınav odak paketi | Tek seferlik | `plasebo_pack_exam` |
   | Uyku paketi | Tek seferlik | `plasebo_pack_sleep` |
   | Kaygı paketi | Tek seferlik | `plasebo_pack_anxiety` |

2. **Sözleşmeler, Vergi ve Bankacılık** bölümünü doldur (ücretli ürün için
   zorunlu; ücretsiz uygulamada gerekmiyordu).
3. `src/utils/billing.ts` içindeki üç fonksiyonu gerçek çağrılarla değiştir.
   İki mağazayı tek kodla yönetmek için RevenueCat ya da `react-native-iap`
   kullanılabilir; dosyanın dışında değişiklik gerekmez.
4. **Fiyatı mağazadan oku** — `plans.ts` içindeki tutarlar yer tutucudur.
5. "Satın alımları geri yükle" düğmesi geri gelmeli; Apple bunu **şart
   koşar** (kural 3.1.1).

---

## Yayın öncesi son kontrol

- [ ] Apple Developer Program üyeliği onaylandı
- [ ] App Store Connect'te uygulama kaydı açıldı, paket kimliği `com.plasebo.app`
- [ ] Google Cloud'da iOS OAuth istemcisi oluşturuldu
- [ ] `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` hem `.env` hem EAS ortamında tanımlı
- [ ] `npm run build:ios` başarılı, `npm run submit:ios` yüklendi
- [ ] TestFlight'ta iPhone'da denendi: Apple girişi, Google girişi, bildirim,
      sessiz moddayken ses, hesap silme
- [ ] 6 ekran görüntüsü (`store/graphics/screenshots/ios/`) yüklendi
- [ ] App Privacy formu bu dosyadaki tabloyla birebir aynı
- [ ] Demo hesap bilgileri ve inceleme notları girildi
- [ ] Gizlilik politikası URL'i tarayıcıda açılıyor
- [ ] Sürüm numarası bir önceki yüklemeden büyük
