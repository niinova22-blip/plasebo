# Play Store yayın kontrol listesi

Depodaki teknik hazırlık tamam. Kalanlar hesap açma, URL yayınlama ve
Play Console formları — yani ağırlıklı olarak senin yapman gerekenler.
Sırayı bozmadan ilerle; her adım bir sonrakinin girdisini üretiyor.

> **Android tarafı şu an dondurulmuş durumda (19 Ağustos 2026).** Kapalı
> testin 2. günündeyiz; 12 test kullanıcısı / 14 gün şartı işlerken
> Play'e yeni bir sürüm yüklenmemesine karar verildi. Depodaki sürüm artık
> **1.1.2** (`versionCode` 9): Apple ile giriş, bildirim ve saat seçici
> düzeltmeleri ve premium/plan arayüzünün tamamen kapatılması (bkz.
> `store/RED-1.1.1-DUZELTME.md`). Bu, Play tarafında da geçerlidir —
> yüklendiğinde orada da plan ekranı görünmeyecek, sınırlar kalkacaktır.
> Test bitip üretim erişimi alındıktan sonra yüklenecek — yerel
> `bundleRelease` ile, çünkü EAS derlemesi farklı bir imzalama anahtarı
> kullanır ve Play reddeder.
>
> Bilgi olsun diye: kapalı test kanalına yeni sürüm yüklemek 14 günlük
> sayacı sıfırlamaz, şart "12 kişinin kesintisiz kayıtlı kalması"dır.
> Yine de gereksiz risk almamak için bekleniyor.

> Aynı uygulamanın **App Store** yayını ayrı bir dosyada: `store/APPSTORE.md`.
> Orada anlatılan Apple ile giriş desteği Android derlemesini de
> değiştirdiği için, iOS hazırlığından sonra Play'e de yeni bir sürüm
> (`1.1.0`, `versionCode` 7) gitmelidir.

---

## Depoda hazır olanlar

| Ne | Nerede |
| --- | --- |
| Mağaza sürümü uygulama yapılandırması | `app.json` |
| EAS derleme profilleri (AAB + APK) | `eas.json` |
| Gizlilik politikası ve veri silme sayfaları (Play için URL) | `docs/privacy.html`, `docs/data-deletion.html` |
| Aynı metinlerin uygulama içi sürümü | `src/constants/legal.ts`, `src/screens/LegalScreen.tsx` |
| Uygulama içi yasal bağlantılar ve hesap silme | `src/screens/SettingsScreen.tsx`, `src/screens/SignInScreen.tsx` |
| Uygulama simgesi / açılış işareti üretici | `npm run icons` (`scripts/generate-icons.js`) |
| Türkçe/İngilizce dil desteği | `src/i18n/` |
| Yayın imzalama (prebuild'e dayanıklı) | `plugins/withUploadKeystore.js` + `keys/` |
| Mağaza ekran görüntüleri (6 adet) | `store/graphics/screenshots/play/` |
| Mağaza metinleri, form cevapları, ekran görüntüsü planı | `store/LISTING.md` |
| 512×512 simge ve 1024×500 öne çıkan grafik | `npm run store:assets` |
| OAuth kimlikleri için şablon | `.env.example` |

Yapılandırmada düzeltilenler:

- `versionCode` eklendi (yoktu; Play sürüm takibi için zorunlu).
- **`POST_NOTIFICATIONS` eklendi.** Yoktu — günlük hatırlatıcı Android 13
  ve üzerinde hiç çalışmıyordu.
- **`RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, depolama ve ön plan servisi
  izinleri kaldırıldı.** `expo-audio` bunları varsayılan olarak ekliyordu;
  uygulama ses kaydetmiyor ve arka planda çalmıyor. Mikrofon izni Play'de
  ayrıca gerekçe ister ve kullanıcıya izin ekranında görünür.
- `userInterfaceStyle` `light` → `automatic`. Eskisi, Ayarlar'daki
  "Sistem" tema seçeneğini işlevsiz bırakıyordu.
- Eski `splash` anahtarı `expo-splash-screen` eklentisine taşındı.
- R8 küçültme ve kaynak temizleme açıldı (`expo-build-properties`).
- Ayarlar'daki sabit `v1.0` metni artık `app.json` sürümünden okunuyor.

Doğrulandı: `tsc --noEmit` temiz, `assembleRelease` başarılı, birleştirilmiş
manifestte yalnızca `INTERNET`, `MODIFY_AUDIO_SETTINGS`,
`POST_NOTIFICATIONS`, `VIBRATE` (+ bildirim kütüphanesinin standart
rozet/önyükleme izinleri) kaldı. `targetSdkVersion 36`, `minSdkVersion 24`.

> **Cihazda denenmesi gereken tek şey:** R8 yeni açıldı. Küçültme nadiren
> yansıma kullanan kütüphaneleri bozar. `npm run build:preview` ile üretilen
> APK'yı kur ve tüm ekranları bir tur gez. Bir sorun çıkarsa `app.json`
> içindeki `enableMinifyInReleaseBuilds` ve
> `enableShrinkResourcesInReleaseBuilds` değerlerini `false` yap.

---

## 1. Yasal sayfaları yayınla

Play, gizlilik politikası için **herkese açık bir URL** ister; dosya
yeterli değil. Depoda henüz git remote yok.

```bash
gh repo create plasebo --private --source=. --remote=origin
git add -A && git commit -m "Play Store yayın hazırlığı"
git push -u origin master
```

Sonra GitHub'da **Settings → Pages → Source: `master` dalı / `docs`
klasörü**. Birkaç dakika içinde şu adresler açılmalı:

- `https://<kullanıcı>.github.io/plasebo/privacy.html`
- `https://<kullanıcı>.github.io/plasebo/data-deletion.html`

> Depo **private** ise GitHub Pages yayınlanmaz (ücretsiz planda). Yalnızca
> bu iki sayfa için ayrı bir public depo da açabilirsin.

Bu adresler artık yalnızca **Play Console formları** için gerekli:
uygulamanın kendisi metinleri içeriden okuyor (`src/constants/legal.ts`),
yani sayfa yayına girmeden de yasal ekranlar çalışır. `src/constants/links.ts`
içindeki adresler bu yüzden uygulamada kullanılmıyor; forma girilecek
adreslerin kaydı olarak duruyor.

## 2. Google Cloud — OAuth istemcileri

Google girişi zorunlu olduğu için bu adım atlanamaz; kimlikler tanımlı
değilken uygulama giriş ekranında duruyor.

1. [Google Cloud Console](https://console.cloud.google.com/) → yeni proje.
2. **API'ler ve Hizmetler → OAuth izin ekranı**:
   - Kullanıcı türü: **Harici**
   - Uygulama adı: Plasebo, destek e-postası: niinova22@gmail.com
   - Kapsamlar: yalnızca `profile` ve `email` — bunlar hassas kapsam
     değildir, dolayısıyla Google doğrulama incelemesi gerekmez.
   - Gizlilik politikası bağlantısı: 1. adımdaki URL
   - **Yayın durumu: Üretim.** "Test" durumunda kalırsa uygulamayı
     yalnızca elle eklediğin 100 hesap kullanabilir.
3. **Kimlik bilgileri → OAuth istemci kimliği**:
   - **Web istemcisi** oluştur → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - **Android istemcisi** oluştur:
     - Paket adı: `com.plasebo.app`
     - SHA-1: 3. adımdaki EAS keystore parmak izi
     → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## 3. İmzalama anahtarı ve derleme

**Yükleme anahtarı üretildi.** `keys/plasebo-upload.jks` (RSA 4096, 10.000
gün) ve şifreleri `keys/keystore.properties` içinde; ikisi de git'e girmez.
Yedeği masaüstündeki `Plasebo-Yayin/` klasöründe.

```
Yükleme anahtarı SHA-1:
35:7C:A7:F3:A8:3C:60:F3:0B:4D:D8:CE:DE:6F:ED:FC:39:AB:78:A2
```

Bu parmak izi Google Cloud Console'da `com.plasebo.app` için bir **Android
OAuth istemcisi** olarak eklenmeden, bu anahtarla imzalanmış derlemede
Google girişi `DEVELOPER_ERROR (10)` verir — BlueStacks'te doğrulandı.
Play'e yüklendikten sonra **Play'in kendi imzalama anahtarının** SHA-1'i de
(Play Console → Test ve yayınlama → Uygulama bütünlüğü) aynı şekilde
eklenmelidir; ikisi bir arada durabilir.

Paketleme:

```bash
cd android && ./gradlew bundleRelease   # Play'e yüklenecek .aab
cd android && ./gradlew assembleRelease # cihazda denemek için .apk
```

> ### Yerel derlemede `.env` tuzağı — her sürümde kontrol et
>
> Expo, yerel Gradle derlemesinde de proje kökündeki `.env` dosyasını
> yükler (`env: load .env` satırı derleme çıktısında görünür). Yani
> geliştirme için `.env` içinde açık bırakılan herhangi bir
> `EXPO_PUBLIC_*` bayrağı, Play'e gidecek AAB'ye de gömülür.
>
> Daha sinsi ikinci yarısı: `.env`'i değiştirmek Gradle için bir girdi
> değişikliği **değildir**. JS kaynakları aynı kaldığı için
> `createBundleReleaseJsAndAssets` görevi "güncel" sayılır ve bir önceki
> derlemeden kalan paket olduğu gibi yeniden kullanılır — bayrağı
> kapatmak tek başına hiçbir şeyi değiştirmez. Paketi zorla yeniden
> ürettirmek gerekir:
>
> ```bash
> rm -rf android/app/build/generated/assets/react/release
> cd android && ./gradlew bundleRelease
> ```
>
> Not: satın almayı sahteleyen `EXPO_PUBLIC_ALLOW_TEST_PURCHASES` bayrağı
> **kaldırıldı** (26.08.2026). Satın alma artık gerçek; denemesi mağazanın
> kendi test hesaplarıyla yapılıyor (bkz. `store/ABONELIK.md` §2f).
> Tuzağın kendisi başka bayraklar için geçerli olmayı sürdürüyor.

> İmza değiştiği için yeni APK, eski APK'nın üzerine kurulamaz; cihazdaki
> eski sürümün önce kaldırılması gerekir.

## 3b. Alternatif: EAS ile derleme

> **Dikkat — proje artık EAS'e bağlı** (`@ninovatech/plasebo`, iOS derlemesi
> için gerekiyordu). Android tarafında `npm run build:play` çalıştırılırsa
> EAS **kendi ürettiği yeni bir keystore** ile imzalar; Play'e daha önce
> `keys/plasebo-upload.jks` ile imzalanmış bir sürüm yüklendiyse bu AAB
> reddedilir ("yanlış imzalama anahtarı"). Android'de ya yerel
> `bundleRelease` kullanmaya devam et ya da mevcut anahtarı önce
> `eas credentials` ile EAS'a yükle.

```bash
npm install -g eas-cli
eas login
eas init            # projeyi hesabına bağlar, app.json'a projectId yazar
eas credentials     # Android → production → "Generate new keystore"
```

`eas credentials` çıktısında **SHA-1 Fingerprint** görünür; onu 2. adımdaki
Android OAuth istemcisine gir. Bu anahtar EAS sunucularında saklanır ve
Play'e yüklenen her AAB'yi imzalar.

> Yerel `assembleRelease` çıktısı debug keystore ile imzalanır — cihazda
> test için uygundur, Play'e **yüklenemez**.

Ortam değişkenlerini EAS'a tanımla (bunlar derlemeye gömülür):

```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "..." --visibility plaintext --environment production
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID     --value "..." --visibility plaintext --environment production
```

Aynı değerleri yerel test için `.env` dosyasına da yaz (`.env.example`'ı
kopyala; `.env` git'e girmez).

## 4. Derle ve cihazda dene

```bash
npm run build:preview   # APK — cihaza kurup gez
npm run build:play      # AAB — Play'e yüklenecek olan
```

Cihazda mutlaka dene: Google girişi, günlük hatırlatıcı izni ve bildirimin
gerçekten gelmesi, ritüel sesleri, tema seçimi (Şafak/Sis/Açık), "Hesabı ve
tüm verileri sil".

## 5. Play Console

1. [Play Console](https://play.google.com/console/) hesabı aç — tek
   seferlik 25 USD.
2. Uygulama oluştur: Plasebo, Türkçe, Uygulama, Ücretsiz.
3. **Ana mağaza girişi** → `store/LISTING.md` içindeki metinleri ve
   `store/graphics/` içindeki görselleri gir. Ekran görüntülerini
   cihazdan al (en az 2, önerilen 6 — liste `LISTING.md`'de).
4. **Uygulama içeriği** bölümündeki formların tamamı:
   - Gizlilik politikası URL'i
   - **Uygulama erişimi** → kısıtlı, demo hesap bilgileri
     (`LISTING.md`'deki uyarıyı oku — en olası ret sebebi budur)
   - Reklamlar: yok
   - İçerik derecelendirmesi anketi
   - Hedef kitle: 18+
   - **Veri güvenliği** → cevaplar `LISTING.md`'de tablo hâlinde
   - Devlet uygulaması: hayır · Finans: hayır · Sağlık: hayır
5. AAB'yi **İç test** kanalına yükle, kendi cihazınla kur ve baştan sona dene.

## 6. Kapalı test zorunluluğu

13 Kasım 2023'ten sonra açılmış **bireysel** geliştirici hesapları için
Google, üretime çıkmadan önce **en az 12 test kullanıcısının 14 gün
boyunca kesintisiz kayıtlı kalmasını** şart koşuyor. Kurumsal hesaplar ve
daha eski bireysel hesaplar muaf.

Bilinmesi gerekenler:

- "Kayıtlı" demek, davetin kabul edilip uygulamanın o Google hesabıyla
  **kurulmuş** olması. Yalnızca davet edilmiş olmak sayılmaz.
- 14 günlük sayaç, sürüm onaylandıktan **ve** 12 kişi tamamlandıktan
  sonra başlar.
- Süre dolunca Play Console'da "Üretim erişimi başvurusu" açılır; başvuru
  ayrıca elle incelenir.

Yani takvimini buna göre kur: teknik hazırlık bitmiş olsa da yayına
çıkış en az iki hafta sürecek. Kapalı testi bir an önce başlatmak,
bekleme süresini paralelde harcamanın tek yolu.

## 7. Abonelik — gerçek faturalandırmayı bağlama (ilk sürümde yok)

> İki mağazayı birlikte anlatan ayrıntılı sürüm: `store/ABONELIK.md`.

> **v1.0.0'da premium satılmıyor.** Plan ekranı bir tanıtım ekranıdır:
> satın alma düğmesi yoktur, fiyat yerine "yakında" yazar ve kilitli
> özellikler (kriz modu, çift doz, tüm geçmiş, içerik paketleri) kilitli
> kalır. Play Console'daki "Uygulama içi satın alma" beyanı bu sürüm için
> **hayır** olmalıdır. Aşağıdakiler, faturalandırma bir sonraki sürümde
> bağlanırken yapılacak işlerdir.
>
> "Satın alımları geri yükle" düğmesi de bu yüzden arayüzden kaldırıldı;
> faturalandırmayla birlikte geri gelmelidir (Play şartı).


Uygulamada kademeler, kilitler ve plan ekranı hazır; **gerçek satın alma
yok**. Bu bilinçli: Google Play'de dijital ürün satmanın tek yolu Play
Faturalandırma Kitaplığı'dır (başka bir ödeme yolu uygulamanın
kaldırılma sebebidir) ve kitaplık ancak Play Console'da ürünler
tanımlandıktan sonra bağlanabilir — ürün tanımlamak içinse uygulamanın
en az bir kez yüklenmiş olması gerekir. Yani sıra zorunlu olarak budur.

Şu an `src/utils/billing.ts` sürüm derlemesinde hiçbir yetki vermez ve
arayüz "yakında" der; sahte satın alma yoktur. Kilitlerin cihazda
denenebilmesi için yalnızca geliştirme derlemesinde yetki verilir.

Uygulama Play'e yüklendikten sonra:

1. **Play Console → Para kazanma → Ürünler** altında şunları aç
   (kimlikler `src/constants/plans.ts` ile birebir aynı olmalı):

   | Ürün | Tür | Kimlik |
   | --- | --- | --- |
   | Premium | Abonelik | `plasebo_premium_monthly` |
   | Sınav odak paketi | Tek seferlik | `plasebo_pack_exam` |
   | Uyku paketi | Tek seferlik | `plasebo_pack_sleep` |
   | Kaygı paketi | Tek seferlik | `plasebo_pack_anxiety` |

2. Faturalandırma kitaplığını kur (`react-native-iap` ya da RevenueCat)
   ve `src/utils/billing.ts` içindeki üç fonksiyonu gerçek çağrılarla
   değiştir. Dosyanın dışında hiçbir yerde değişiklik gerekmez —
   yetkiler `PremiumContext` üzerinden tek noktadan akıyor.
3. **Fiyatı Play'den oku.** `plans.ts` içindeki `₺49` ve `₺29` yalnızca
   yer tutucudur; kullanıcıya gösterilen tutar bölgeye ve vergiye göre
   değişir ve ürün sorgusundan gelmelidir.
4. `restorePurchases` gerçekten çalışmalı — Play, kullanıcının
   satın alımlarını yeni cihazda geri yükleyebilmesini şart koşar.
5. Play Console'da **Uygulama içi satın alma** beyanını ve mağaza
   listelemesindeki fiyat bilgisini güncelle.

## 8. Sonraki sürümler

`eas.json` içinde `appVersionSource: "remote"` ve `autoIncrement: true`
ayarlı: `versionCode` her üretim derlemesinde EAS tarafından otomatik
artırılır, elle dokunmana gerek yok.

Kullanıcıya görünen sürüm için `app.json` içindeki `version` alanını
elle güncelle (`1.0.0` → `1.1.0`). Ayarlar ekranındaki sürüm metni bu
alandan okunuyor.

---

## Yayın öncesi son kontrol

- [ ] Gizlilik ve veri silme URL'leri tarayıcıda açılıyor
- [ ] `src/constants/links.ts` içindeki adresler bu URL'lerle aynı
- [ ] OAuth izin ekranı **Üretim** durumunda
- [ ] Android OAuth istemcisinde EAS release keystore'unun SHA-1'i kayıtlı
- [ ] Preview APK cihazda baştan sona denendi (R8 sonrası)
- [ ] Bildirim izni isteniyor ve hatırlatıcı gerçekten geliyor
- [ ] Demo hesapla başka bir cihazdan giriş yapılabiliyor
- [ ] Veri güvenliği formu `LISTING.md` ile birebir aynı
- [ ] `store/graphics/screenshots/play/` içinde en az 2 ekran görüntüsü var
