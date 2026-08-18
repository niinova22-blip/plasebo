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

## Nerede kaldık (19 Ağustos 2026)

| Adım | Durum |
| --- | --- |
| 1. Apple Developer Program üyeliği | **Bitti** — bireysel hesap, takım `Ahmet KÖKDOGAN (GUYY5AAT36)` |
| 2. App Store Connect uygulama kaydı | **Bitti** — `eas submit` kendisi oluşturdu. Apple kimliği **6802842875** |
| 3. Google Cloud iOS istemcisi | **Bitti** — kimlik `.env` ve EAS ortamında tanımlı |
| 4. Derleme ve yükleme | **Bitti** — sürüm **1.1.1**, derleme no **2**, App Store Connect'e yüklendi |
| 5. TestFlight'ta cihazda deneme | **Bitti** — Apple girişi, Google girişi, bildirim, ses, hesap silme çalışıyor |
| 6. Mağaza formları | **Sırada** — aşağıdaki bölüm alan alan anlatıyor |
| 7. İncelemeye gönderme | Formlar bitince |

Yol boyunca çıkan ve düzeltilen iki iOS hatası (1.1.1 sürümünde):

- **Aynı hatırlatıcı iki kez düşüyordu.** iOS'un saat seçicisi çark
  çevrildikçe olay yolluyor; her olayda bildirim yeniden kurulunca
  "önce iptal et, sonra kur" adımları iç içe geçiyor ve aynı saate iki
  kayıt kalıyordu. Saat artık onaylanınca bir kez kuruluyor, ayrıca tüm
  kurma/iptal işlemleri tek sıraya alındı.
- **Saat seçici ekranın ortasında alakasız bir yerde beliriyordu.** iOS
  bileşeni ağaca gömülü çiziyor; artık Vazgeç/Tamam düğmeli bir pencerede
  açılıyor. Android'de sistem penceresi aynen kaldı.
- Bildirim izni reddedilmişse uyarıya **"Ayarları aç"** kısayolu eklendi.

> Depodaki eski TestFlight derlemesinde (1.1.0) bu düzeltmeler yok.
> İncelemeye **1.1.1 / derleme 2** gönderilecek.

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

Aşağıdaki sıra, App Store Connect'in sol menüsünü takip eder. Kopyalanacak
bütün metinler masaüstündeki
`Plasebo-Yayin-Rehberleri\2-Apple-App-Store\Magaza-Metinleri.txt`
dosyasında da duruyor.

### 6.0 Önce sürüm numarasını eşitle

Sol menüde **Dağıtım → iOS Uygulaması** altında bir sürüm görünür.
Uygulama kaydı açılırken oluştuğu için orada büyük ihtimalle **1.0**
yazıyor; yüklediğimiz derleme ise **1.1.1**.

**Sürüm** alanını **1.1.1** yap ve kaydet. Numaralar eşleşmezse derleme,
sürüm sayfasındaki listede hiç görünmez ve "derleme seçilmedi" hatası
alırsın.

### 6.1 Genel → Uygulama Bilgileri

**Yerelleştirilebilir Bilgiler (Türkçe):**

| Alan | Değer |
| --- | --- |
| Ad | `Plasebo` |
| Alt başlık | `Bilerek inan` |
| Gizlilik Politikası URL'i | `https://niinova22-blip.github.io/plasebo/privacy.html` |

**Genel Bilgiler:**

| Alan | Değer |
| --- | --- |
| Paket Kimliği | `com.plasebo.app` — dokunma |
| SKU | `plasebo-ios` |
| Apple Kimliği | `6802842875` (Apple verdi, değiştirilemez) |
| Birincil Kategori | **Yaşam Tarzı** |
| İkincil Kategori | boş bırak |
| İçerik Hakları | "Üçüncü taraf içeriği **içermiyor**" |
| Yaş Sınırı | **Düzenle** → 6.2'deki anket |

Sağ üstten **Kaydet**.

> Kategori olarak "Sağlık ve Form" seçme. Apple o kategoride ek beyan
> ister ve daha sıkı inceler; Plasebo bilerek hiçbir sağlık işlevi
> görmüyor, dolayısıyla o beyanı dürüstçe dolduramayız.

### 6.2 Yaş sınırı anketi

| Soru | Cevap |
| --- | --- |
| Şiddet (çizgi film / gerçekçi) | Yok |
| Cinsel içerik, çıplaklık, müstehcen tema | Yok |
| Küfür veya kaba mizah | Yok |
| Korku / ürkütücü tema | Yok |
| Kumar (gerçek veya simüle) | Yok |
| **Tıbbi / tedavi bilgisi** | **Seyrek/hafif** |
| **Uyuşturucu, tütün, alkol kullanımı veya referansı** | **Yok** |
| Kullanıcılar arası etkileşim, kullanıcı üretimi içerik | Yok |
| Konum paylaşımı | Yok |
| Kısıtlanmamış web erişimi | Hayır |
| Uygulama içi satın alma ve para birimi | Hayır |

"Tıbbi/tedavi bilgisi" sorusuna neden "yok" demiyoruz: uygulama tıbbi
tavsiye vermiyor ama plasebo araştırmalarından söz ediyor ve "Nasıl
çalışır?" ekranında kaynak veriyor. Beyan etmemek, incelemede
"eksik beyan" olarak dönebilir. "Sık/yoğun" demek de gereksiz.

Sonuç 13+ civarı çıkar. Elle yükseltebilirsin, düşüremezsin.

### 6.3 Fiyat ve Erişilebilirlik

| Alan | Değer |
| --- | --- |
| Fiyat | **Ücretsiz** |
| Erişilebilirlik | Tüm ülke ve bölgeler |
| Ön sipariş | Hayır |
| Uygulama İçi Satın Alma | Bu sürümde yok |

### 6.4 Uygulama Gizliliği (App Privacy)

Sol menüde ayrı bir başlıktır ve **sürümden bağımsızdır**; doldurulmadan
sürüm incelemeye gönderilemez.

1. **Gizlilik Politikası URL'i**: 6.1'deki adresin aynısı.
2. "Bu uygulama kullanıcı verisi topluyor mu?" → **Evet**
3. Toplanan veri türleri olarak yalnızca şu ikisini işaretle:

| Veri türü | Amaç | Kimliğe bağlı mı? | İzleme için mi? |
| --- | --- | --- | --- |
| İletişim Bilgileri → **Ad** | Uygulama İşlevselliği | **Evet** | **Hayır** |
| İletişim Bilgileri → **E-posta Adresi** | Uygulama İşlevselliği | **Evet** | **Hayır** |

4. Diğer bütün kategoriler (Sağlık ve Form, Finans, Konum, Kişiler,
   Fotoğraf, Mesaj, Arama Geçmişi, Tanımlayıcılar, Kullanım Verisi,
   Tanılama) **işaretlenmeden** bırakılır.
5. Sağ üstten **Yayınla** de.

> **Sağlık verisi beyan edilmiyor** — ve edilmemeli. Puanlar ve notlar
> cihazdan hiç çıkmaz; Apple'ın tanımıyla "toplanan" veri değildir.
> Ad ve e-posta ise girişte Apple/Google'dan alındığı için beyan
> ediliyor; muhafazakâr taraf bu.

### 6.5 Sürüm sayfası (iOS Uygulaması 1.1.1)

**a) Ekran görüntüleri.** Üç ölçüde hazır:

| Klasör | Ölçü | Sekme |
| --- | --- | --- |
| `store/graphics/screenshots/ios/` | 1290×2796 | **iPhone 6.9"** — asıl set |
| `.../ios/6.7-inch/` | 1284×2778 | 6.7" sekmesi açılırsa |
| `.../ios/6.5-inch/` | 1242×2688 | 6.5" sekmesi açılırsa |

Masaüstündeki kopyaları `2-Apple-App-Store\Ekran-Goruntuleri` altında aynı
ayrımla duruyor. 6.9 inçlik set yüklendiğinde küçük ekranlar için ayrıca
görsel istenmez; iPad sekmesi görünmez (iPad desteği kapalı).

> Yükleyici dosyaları reddediyorsa dosyalarda sorun yok (1290×2796, RGB,
> alfa kanalı yok, 1 MB altı). Sırasıyla şunlara bak: açık olan sekmenin
> ölçüsü, dosyaları tek tek eklemek, arayüzü İngilizceye almak, gizli
> pencerede denemek.

**b) Metinler.** `Magaza-Metinleri.txt` dosyasından kopyala:

| Alan | Nereden |
| --- | --- |
| Tanıtım metni (170) | dosyanın 3. başlığı |
| Açıklama (4000) | dosyanın 5. başlığı |
| Anahtar kelimeler (100) | dosyanın 4. başlığı |
| Destek URL'i | `https://niinova22-blip.github.io/plasebo/privacy.html` |
| Pazarlama URL'i | boş |

"Bu Sürümdeki Yenilikler" alanı ilk sürümde çıkmaz; yalnızca
güncellemelerde istenir.

**c) Derleme.** Sayfadaki **Derleme** bölümünde **+** işaretine bas ve
**1.1.1 (2)** derlemesini seç. Listede yoksa Apple hâlâ işliyordur —
yükleme sonrası 5–30 dakika sürebilir, biraz sonra tekrar bak.

**d) Uygulama İnceleme Bilgileri.**

| Alan | Değer |
| --- | --- |
| Oturum açma gerekli | **İşaretli** |
| Kullanıcı adı / şifre | Play'e verdiğin demo Google hesabı |
| İletişim bilgileri | Adın, soyadın, telefonun, e-postan |
| Notlar | `Magaza-Metinleri.txt` içindeki "İnceleme notları" bölümü |
| Ek dosya | gerekmiyor |

Demo hesabında **iki adımlı doğrulama kapalı** olmalı ve göndermeden önce
o hesapla başka bir cihazdan giriş yapılabildiğini kendin dene. Bu
uygulamanın en olası ret sebebi burasıdır.

**e) Sürüm Yayınlama.** "**İncelemeden sonra elle yayınla**" seçeneğini
işaretle; onay geldiğini görmeden uygulama mağazada görünmesin.

**f)** Sağ üstten **Kaydet**.

### 6.6 İhracat uyumluluğu

Derlemeye `ITSAppUsesNonExemptEncryption = false` gömülü olduğu için bu
soru normalde hiç çıkmaz. Çıkarsa: uygulama yalnızca standart HTTPS
kullanıyor → **"Hayır"**.

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

Bitenler:

- [x] Apple Developer Program üyeliği onaylandı
- [x] App Store Connect'te uygulama kaydı açıldı (`com.plasebo.app`, Apple kimliği 6802842875)
- [x] Google Cloud'da iOS OAuth istemcisi oluşturuldu
- [x] `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` hem `.env` hem EAS ortamında tanımlı
- [x] `npm run build:ios` başarılı, `npm run submit:ios` yükledi (1.1.1 / derleme 2)
- [x] TestFlight'ta iPhone'da denendi: Apple girişi, Google girişi, bildirim,
      sessiz moddayken ses, hesap silme
- [x] Gizlilik politikası sayfası yayında ve Apple girişini de anlatıyor

Kalanlar:

- [ ] Sürüm numarası App Store Connect'te **1.1.1** yapıldı (6.0)
- [ ] Uygulama Bilgileri: ad, alt başlık, kategori, gizlilik URL'i, içerik hakları
- [ ] Yaş sınırı anketi dolduruldu
- [ ] Fiyat: ücretsiz, tüm ülkeler
- [ ] App Privacy formu dolduruldu ve **Yayınla** dendi
- [ ] 6 ekran görüntüsü yüklendi (iPhone 6.9")
- [ ] Tanıtım metni, açıklama, anahtar kelimeler, destek URL'i girildi
- [ ] Derleme **1.1.1 (2)** sürüme eklendi
- [ ] Demo hesap bilgileri ve inceleme notları girildi
- [ ] "İncelemeden sonra elle yayınla" seçildi
- [ ] İncelemeye gönderildi
