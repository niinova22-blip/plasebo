# Codemagic ile iOS derlemesi — adım adım kurulum

Bu dosya, Plasebo'nun iOS derlemesini Codemagic'te kurmanın **tıklama
düzeyinde** anlatımıdır. Geliştirici ön bilgisi varsaymıyor: hangi siteye
gidileceği, hangi düğmeye basılacağı, hangi değerin nereden kopyalanacağı
tek tek yazılı.

Kurulum bir kez yapılıyor. Bittiğinde her yeni sürüm, Codemagic'te tek bir
"Start new build" düğmesiyle derlenip TestFlight'a düşüyor.

> **Durum: kurulum tamam (5 Eylül 2026).** Codemagic hesabı
> `akokdogan59@gmail.com` ile açık, App Store Connect API anahtarı bağlı,
> GitHub yetkisi verilmiş, `plasebo` uygulaması eklendi (React Native) ve
> `plasebo-ios` grubuna iki Google giriş kimliği girildi.
>
> Aşağıdaki adımlar bir daha yapılmayacak; ne kurulduğunu hatırlamak ve
> bir gün sıfırdan kurmak gerekirse diye duruyor.

---

## Neden buna geçtik

iOS uygulaması derlemek için bir Mac gerekiyor; geliştirme Windows'ta
yapılıyor. Şimdiye kadar bu işi EAS (Expo'nun bulut derleme servisi)
yapıyordu, ama EAS'in ücretsiz derleme hakkı sınırlı ve her başarısız
deneme o haktan bir tane götürüyor.

Codemagic aynı işi yapıyor ve ücretsiz kademesinde **ayda 500 dakika**
macOS makinesi veriyor. Plasebo'nun bir derlemesi yaklaşık 15–20 dakika,
yani ayda rahatça birkaç deneme hakkın oluyor.

**Sunucu, arka uç servisi ya da ücretli altyapı gerekmiyor.** Codemagic
yalnızca "senin yerine bir Mac'te derleme yapan" bir hizmet; uygulama
çalışırken hiçbir yerde bir sunucuya bağlanmıyor. Kredi kartı da
istenmiyor.

EAS silinmedi. `eas.json` duruyor ve istersen `npm run build:ios` hâlâ
çalışıyor. İki yol da aynı `app.json`u okuduğu için üretilen uygulama
birebir aynı.

---

## Adım 1 — App Store Connect'te bir API anahtarı oluştur

Codemagic'in senin adına iki iş yapması gerekiyor: imzalama sertifikasını
Apple'dan çekmek ve bitmiş uygulamayı TestFlight'a yüklemek. Bunu
yapabilmesi için Apple'dan bir **API anahtarı** alıyoruz — bu, parolanı
vermeden yetki devretmenin Apple tarafındaki yolu. Anahtar istediğin an
iptal edilebiliyor.

1. Tarayıcıda **https://appstoreconnect.apple.com** adresine git ve
   **akokdogan59@gmail.com** hesabıyla giriş yap.
2. Sağ üstteki hesap adına değil, üst menüdeki **"Kullanıcılar ve Erişim"**
   (Users and Access) bağlantısına tıkla.
3. Açılan sayfada üstteki sekmelerden **"Entegrasyonlar"** (Integrations)
   sekmesine geç.
4. Sol taraftaki listeden **"App Store Connect API"**yi seç.
5. **"Takım Anahtarları"** (Team Keys) yazan bölümde mavi **"+"** düğmesine
   bas.
6. Açılan pencerede:
   - **Ad (Name):** `Codemagic`
   - **Erişim (Access):** `App Manager`
   - **Oluştur** (Generate) düğmesine bas.
7. Liste ekranına dönünce, yeni satırın sağındaki **"API Anahtarını
   İndir"** (Download API Key) bağlantısına tıkla. `AuthKey_XXXXXXXXXX.p8`
   adında bir dosya inecek.

   > ⚠️ **Bu dosya yalnızca bir kez indirilebiliyor.** Kaybedersen anahtarı
   > iptal edip yenisini oluşturmak gerekir. Masaüstünde güvenli bir yerde
   > sakla, e-posta ile gönderme.

8. Aynı satırdan ve sayfanın üstünden **üç değeri** kopyalayıp bir yere
   not al — birazdan Codemagic'e yapıştıracaksın:
   - **Issuer ID** — sayfanın üstünde, "Issuer ID" başlığının altındaki
     uzun kod (`57246542-96fe-...` gibi görünür)
   - **Key ID** — anahtar satırındaki 10 karakterlik kod
   - **.p8 dosyasının kendisi** — az önce indirdiğin dosya

---

## Adım 2a — GitHub'da `plasebo` deposuna erişim ver (SEN yapacaksın)

Codemagic'in GitHub yetkisi var ama bu yetki **depo bazında**: şu an
yalnızca `forge` deposunu görüyor. `plasebo` listede olmadığı için
uygulama eklenemiyor. Bunu açmak GitHub hesabında bir izin değişikliği
demek, o yüzden senin yapman gerekiyor.

1. **https://github.com/settings/installations** adresine git.
   (GitHub'da **niinova22-blip** hesabıyla oturum açık olmalı; değilse
   önce çıkış yapıp o hesapla gir.)
2. Listede **Codemagic CI/CD** satırını bul, sağındaki **"Configure"**
   düğmesine bas.
3. **"Repository access"** bölümüne in. Muhtemelen **"Only select
   repositories"** seçili ve altında yalnızca `forge` yazıyor.
4. Aşağıdaki **"Select repositories"** kutusuna tıkla, listeden
   **plasebo**'yu seç.
5. Sayfanın altındaki **"Save"** düğmesine bas.

Artık Codemagic depoyu görüyor.

## Adım 2b — Uygulamayı Codemagic'e ekle

1. **https://codemagic.io/apps** adresine git.
2. Sağ üstteki **"Add application"** düğmesine bas.
3. **"GitHub"** seç → **"Next: Authorize integration"**.
   (Yeni bir izin ekranı çıkmaz, yetki zaten var.)
4. **"Select repository"** kutusuna `plasebo` yaz ve çıkan
   **plasebo (niinova22-blip)** satırını seç.
5. **"Select project type"** altında **React Native** seç.
6. **"Finish: Add application"** de.

Depoda `codemagic.yaml` olduğu için Codemagic hattı kendisi bulur; proje
türü yalnızca varsayılan şablonu etkiler.

---

## Adım 3 — API anahtarını Codemagic'e tanıt

1. Codemagic'te sağ üstteki kullanıcı simgesine tıkla → **"Teams"** ya da
   doğrudan **"Integrations"** sayfasına git.
   (Kısa yol: https://codemagic.io/teams → Personal Account →
   Integrations.)
2. Listede **"App Store Connect"** satırını bul, **"Connect"** ya da
   **"Manage keys"** düğmesine bas.
3. Açılan formu Adım 1'de not aldığın değerlerle doldur:

   | Alan | Ne yazılacak |
   | --- | --- |
   | **API key name** | `Codemagic` |
   | **Issuer ID** | Adım 1'de kopyaladığın Issuer ID |
   | **Key ID** | Adım 1'deki 10 karakterlik Key ID |
   | **API key** | İndirdiğin `.p8` dosyasını buraya yükle ya da içeriğini yapıştır |

   > ⚠️ **Ad, `codemagic.yaml` içindeki `app_store_connect:` değeriyle
   > birebir aynı olmalı.** Bu hesapta anahtar `Codemagic` adıyla kayıtlı
   > ve yaml da onu arıyor. Adı değiştirirsen yaml'ı da değiştir; yoksa
   > derleme "integration not found" diyerek ilk saniyede durur.

4. **Save** de.

---

## Adım 3b — Kod imzalama sertifikası (atlanırsa derleme hiç başlamaz)

Bu adım ilk kurulumda atlandı ve üç derleme denemesi arka arkaya şu
hatayla düştü:

```
No matching profiles found for bundle identifier "com.plasebo.app"
and distribution type "app_store"
```

**Sebep.** Apple tarafında iki dağıtım sertifikası vardı ama ikisinin de
**özel anahtarı Codemagic'te değildi** — biri EAS'in, diğeri bir API
anahtarıyla oluşturulup anahtarı saklanmamış bir sertifikaydı. Codemagic,
imzalayamayacağı bir sertifikaya bağlı sağlama profilini "eşleşme"
saymıyor; o yüzden profiller Apple'da dururken bile "bulunamadı" diyor.

Apple'da elle profil oluşturmak da işe yaramıyor: profil, Codemagic'in
özel anahtarını tuttuğu bir sertifikaya bağlı olmak zorunda.

**Çözüm.** Sertifikayı Codemagic'e ürettir:

1. Codemagic → **Settings** → **Code signing identities** → **iOS
   certificates**.
2. **"Generate certificate"** düğmesine bas.
3. Formu doldur:
   - **Reference name:** `plasebo-distribution`
   - **Certificate type:** `Apple Distribution`
   - **App Store Connect API key:** `Codemagic`
4. **Create certificate** de.

Codemagic sertifikayı Apple'da oluşturur, özel anahtarını kendinde saklar
ve derlemeye `CERTIFICATE_PRIVATE_KEY` olarak verir. Oluşturulduktan sonra
bir kez indirme penceresi çıkar ve bir parola gösterir — yerel bir yedek
istemiyorsan kapatabilirsin, derleme için gerekmiyor.

> ⚠️ **Apple hesap başına en çok üç dağıtım sertifikasına izin veriyor.**
> Bu hesapta artık üçü de dolu: EAS'inki, anahtarı kaybolmuş eski bir
> tanesi ve `plasebo-distribution`. Yeni bir sertifika gerekirse önce
> Apple Developer → Certificates altından kullanılmayan biri iptal
> edilmeli. Anahtarı kaybolmuş olan aday: adı `Rahile KÖKDOGAN`, türü
> `Distribution`, "created by API Key" yazan satır.

**Sağlama profilleri.** `codemagic.yaml` içindeki "Kod imzalama dosyaları"
adımı profilleri `app-store-connect fetch-signing-files --create` ile
kendisi oluşturuyor — ana uygulama ve widget uzantısı için ayrı ayrı,
çünkü Apple her paket kimliği için ayrı profil istiyor. Elle profil
oluşturmaya gerek yok.

---

## Adım 4 — Ortam değişkenlerini gir

Google ile giriş, iOS'ta uygulamaya geri dönerken özel bir adres şeması
kullanıyor ve bu şema derleme anında bir kimlikten türetiliyor. Kimlik
depoya yazılmıyor (gizli değil ama depoda durmasının bir anlamı yok), bu
yüzden Codemagic'e ayrıca girilmesi gerekiyor. Girilmezse derleme yine
olur, ama **iOS'ta Google girişi çalışmaz** — pencere açılır, uygulamaya
dönemez.

Değerler kendi bilgisayarındaki `D:\Plasebo\.env` dosyasında yazılı;
oradan kopyalayabilirsin.

1. Codemagic'te **plasebo** uygulamasına gir.
2. **"Environment variables"** sekmesine geç.
3. Üç değişkeni tek tek ekle. Her biri için:
   - **Variable name:** aşağıdaki tablodaki ad
   - **Variable value:** `.env` dosyasındaki karşılığı
   - **Variable group:** `plasebo-ios` yaz (ilk seferde yeni grup olarak
     oluşur, sonrakilerde listeden seçilir)
   - **"Secure"** kutusunu **işaretle**
   - **Add** düğmesine bas

   | Değişken adı | Zorunlu mu | Ne işe yarar |
   | --- | --- | --- |
   | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Evet | Google girişinin doğrulama kimliği |
   | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Evet | iOS'ta girişten uygulamaya dönüş şeması |
   | `EXPO_PUBLIC_ADS_TEST_DEVICE_ID` | Hayır | TestFlight'ta gerçek reklam yerine test reklamı |

   > ⚠️ Grup adı da birebir **`plasebo-ios`** olmalı; `codemagic.yaml` bu
   > adı arıyor.

`EXPO_PUBLIC_ADS_TEST_DEVICE_ID` isteğe bağlı ama **şiddetle öneriliyor**:
onsuz TestFlight derlemesinde gerçek reklamlar çıkar ve kendi reklamına
tıklamak Google tarafında "geçersiz trafik" sayılıp AdMob hesabının askıya
alınmasına yol açabilir. Kimliği nasıl bulacağın `store/1.4.0-YAYIN.md`
içinde anlatılıyor.

---

## Adım 5 — İlk derlemeyi başlat

1. Codemagic'te **plasebo** uygulamasına gir.
2. Sağ üstteki **"Start new build"** düğmesine bas.
3. Açılan pencerede:
   - **Branch:** `master`
   - **Workflow:** `Plasebo iOS · TestFlight`
4. **"Start new build"** de.

Derleme yaklaşık 15–20 dakika sürer. Adımları canlı olarak izleyebilirsin;
bir adım kırmızı olursa hatanın metni orada yazar.

Derleme bittiğinde uygulama App Store Connect'e yüklenir. TestFlight'ta
görünmesi Apple tarafındaki işleme yüzünden 5–15 dakika daha sürer.

---

## Sık karşılaşılan hatalar

| Hata metni | Anlamı ve çözümü |
| --- | --- |
| Depo listesinde `plasebo` çıkmıyor | GitHub'da Codemagic'e o depo için erişim verilmemiş. Adım 2a. |
| `No matching profiles found for bundle identifier ...` | Codemagic'te saklı bir dağıtım sertifikası yok. Adım 3b. |
| `integration '...' not found` | `codemagic.yaml` içindeki `app_store_connect:` değeri panelde kayıtlı anahtar adıyla tutmuyor. Codemagic → Settings → Integrations → Developer Portal → Manage keys altındaki adı yaml'a yaz. |
| `EKSİK: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Adım 4 yapılmamış ya da grup adı `plasebo-ios` değil. |
| `No matching provisioning profile` | Apple tarafında kimlik ya da yetenek eksik. Genelde widget uzantısının (`com.plasebo.app.PlaseboWidget`) kimliği Apple'da yok demektir; Certificates, Identifiers & Profiles → Identifiers altında var mı bak. |
| `Signing for "PlaseboWidget" requires a development team` | `APPLE_TEAM_ID` değeri yanlış. `codemagic.yaml` içinde `ML3UZXMU3D` yazıyor; App Store Connect'teki ekip kimliğiyle aynı olmalı. |
| `The bundle version must be higher than the previously uploaded version` | Normalde olmaz: derleme numarası her seferinde TestFlight'a sorulup bir artırılıyor. Çıkarsa derlemeyi bir kez daha başlatmak yeter. |

---

## Derleme numarası nereden geliyor

Kullanıcıya görünen sürüm (`1.4.0`) `app.json` içinde ve **elle**
artırılıyor. Onun altındaki teknik derleme numarası ise depoda hiç
tutulmuyor: her derlemede TestFlight'a "senin elindeki en yüksek numara
ne?" diye sorulup bir fazlası kullanılıyor.

Böyle yapılmasının sebebi, numarayı depoda tutmanın üç ayrı doğruluk
kaynağı yaratması (depo, EAS, TestFlight). Biri unutulduğunda Apple
yüklemeyi "bu numara zaten kullanılmış" diye reddediyor ve bir derleme
hakkı boşa gidiyor.
