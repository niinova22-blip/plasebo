# Plasebo

> Bilerek inan.

Plasebo, her gün bilimsel görünümlü ama tamamen plasebo olan bir ritüel sunan
wellness uygulamasıdır. Şeffaflık uygulamanın kendisidir: her ekranda bunun bir
plasebo olduğu yazar.

Uygulama hiçbir yerde "iyileştirir" ya da "tedavi eder" demez. Referans verilen
açık etiketli plasebo (open-label placebo) çalışmaları gerçektir — Harvard
Medical School bünyesindeki Program in Placebo Studies bu alanda çalışır.

## Çalıştırma

Test için tercih edilen yol cihaza APK kurmak:

```bash
npm install
npx expo prebuild --platform android   # android/ klasörünü üretir (bir kez)
cd android && ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

Release varyantı, proje kökündeki `keys/` klasöründe bir yükleme anahtarı
varsa onunla, yoksa debug anahtarıyla imzalanır (bkz. "İmzalama"). Hızlı
geliştirme için Metro de çalışır:

```bash
npm start          # Expo Go ile QR koddan aç
npm run android    # veya doğrudan cihaz/emülatör
```

Ek komutlar:

```bash
npm run typecheck     # tsc --noEmit
npm run tones         # ses dosyalarını yeniden üret
npm run store:assets  # Play mağaza simgesi + öne çıkan grafik
npm test              # tip denetimi + mantık, eklenti, Swift ve çeviri testleri
npm run build:preview # EAS ile test APK'sı
npm run build:play    # EAS ile Play'e yüklenecek AAB
```

**iOS derlemesi Codemagic'te.** iOS için bir Mac gerekiyor ve geliştirme
Windows'ta yapılıyor. Bu iş EAS yerine Codemagic'e alındı: EAS'in derleme
hakkı sınırlı, Codemagic'in ücretsiz kademesi aylık 500 dakika macOS
makinesi veriyor. Hat `codemagic.yaml` içinde tanımlı; panelde tek bir
"Start new build" düğmesiyle derleyip TestFlight'a yüklüyor. Kurulumu
`store/CODEMAGIC.md` içinde tıklama düzeyinde anlatılıyor. EAS kaldırılmadı,
`npm run build:ios` hâlâ çalışıyor.

## İmzalama

Play'e yüklenecek çıktı, kendi **yükleme (upload) anahtarımızla** imzalanır.
Anahtar ve şifreleri depoya girmez; proje kökündeki `keys/` klasöründe durur:

```
keys/plasebo-upload.jks       imzalama anahtarı
keys/keystore.properties      dosya adı, alias ve şifreler
```

Bu iki dosya `.gitignore` ile dışarıda tutulur ve **yedeklenmelidir**.
`android/` klasörü `expo prebuild` ile yeniden üretildiği için imzalama
ayarı elle değil, `plugins/withUploadKeystore.js` eklentisiyle kurulur:
eklenti her prebuild'de anahtarı `android/app/` içine kopyalar ve
`build.gradle`'daki release yapılandırmasını ona bağlar. `keys/` yoksa
hiçbir şey değişmez ve derleme debug anahtarıyla imzalanır — yani depoyu
klonlayan biri anahtar olmadan da APK derleyebilir.

Play'e yüklenecek paketi üretmek için:

```bash
cd android && ./gradlew bundleRelease   # app/build/outputs/bundle/release/app-release.aab
```

> **Google girişi imzaya bağlıdır.** Kullanılan anahtarın SHA-1 parmak izi
> Google Cloud Console'da `com.plasebo.app` paketi için bir Android OAuth
> istemcisi olarak kayıtlı değilse giriş `DEVELOPER_ERROR (10)` ile düşer.
> Yükleme anahtarının ve (Play'e yüklendikten sonra) Play'in kendi imzalama
> anahtarının parmak izleri ayrı ayrı eklenmelidir.

## Yayınlama

Google Play'e çıkış adımları, form cevapları ve mağaza metinleri
`store/RELEASE.md` ve `store/LISTING.md` dosyalarında. Gizlilik politikası
ile veri silme sayfalarının kaynağı `docs/` altında; bunlar GitHub Pages
üzerinden yayınlanır ve Play Console'a URL olarak girilir.

## Diller

Uygulama Türkçe ve İngilizce çalışır. Kaynak dil Türkçe: metinler kodun
içinde Türkçe yazılır ve `t('...')` ile `src/i18n/en.ts` sözlüğünden
geçirilir. Sözlüğün anahtarı Türkçe metnin kendisidir; karşılığı
bulunmayan bir metin Türkçe görünür, yani eksik çeviri uygulamayı bozmaz.

Dil, Ayarlar → Görünüm → Dil altından seçilir (`Sistem` / `Türkçe` /
`English`) ve `Sistem` seçiliyken cihazın dili izlenir
(`expo-localization`). Yeni bir metin eklerken:

1. Türkçesini `t('...')` içine yaz.
2. Aynı metni anahtar olarak `src/i18n/en.ts` sözlüğüne ekle.

Değişkenler `{ad}` biçiminde taşınır: `t('Merhaba {ad}', { ad: user.name })`.

## Sesler

Ritüel sesleri `scripts/generate-tones.js` ile üretiliyor (`npm run tones`):
44.1 kHz, 16 bit, dikişsiz döngü. Hepsi **stereo**:

- Gürültüler (beyaz, pembe, kahverengi, yağmur) iki kanalda **bağımsız**
  üretiliyor. Tam genişlik verir ve mono'ya indiğinde tarak filtresi
  oluşturmaz — Haas gecikmesi gibi yöntemlerin aksine.
- Tonlar ve dron, iki kanalda **karşıt fazlı çok yavaş bir kıpırtı** alıyor;
  frekanslar aynı kaldığı için mono toplamda hiçbir şey kaybolmuyor.
- Çan ve kâse, iki kanalda **ayrı reverb kuyruğu** ile yazılıyor.

Oynatma tarafında (`src/utils/audio.ts`) açılış ve kapanışta ses rampası
var; ton bıçak gibi kesilirse hoparlörde tık duyuluyor.

## Ana ekran widget'ı

Android ana ekranına eklenebilen küçük bir widget var: günün formülünün
adı, seri ve durum satırı. Widget'ın kendi formül mantığı yok — uygulama
ana ekranını her çizdiğinde özeti `files/widget.json` dosyasına yazıyor
(`src/utils/widget.ts`), Kotlin tarafı da yalnızca onu okuyor
(`plugins/widget/PlaseboWidget.kt`). Böylece motor tek yerde kalıyor.

Dosyalar `plugins/widget/` altında durur ve `plugins/withWidget.js`
eklentisi her prebuild'de bunları `android/` içine kopyalayıp manifeste
alıcıyı yazar.

## Hatırlatıcılar

İki ayrı mekanizma var:

- **Günlük hatırlatıcı** — kullanıcının seçtiği sabit saatte, sistemin
  saat seçicisiyle belirlenir.
- **Akıllı hatırlatıcı** — günün rastgele saatlerine dağıtılan kısa
  dürtmeler (`src/constants/nudges.ts`). Arka planda çalışan bir servis
  olmadığı için bir haftalık kuyruk önden zamanlanır ve uygulama her
  açıldığında yeniden doldurulur (`App.tsx`).

## Ekranlar

| Ekran | Ne yapar |
| --- | --- |
| `SplashScreen` | Dönen konik gradyan halka, parçacık alanı, "BİLEREK İNAN" |
| `IntroScreen` | 4 sayfalık tanıtım: plasebo nedir, günün formülü, üç adım, veri gizliliği |
| `SignInScreen` | Google ile giriş (zorunlu) |
| `OnboardingScreen` | İsim + hedef seçimi (odak / uyku / kaygı / enerji) |
| `HowItWorksScreen` | Açık etiketli plasebo nedir, uygulama ne yapmaz |
| `HomeScreen` | Seri çubuğu, günün formül kartı, "🎲 Farklı formül dene" (kriz modu), mini kartlar |
| `RitualScreen` | Adımlar formülün `stepOrder`'ına göre; her adımda dönen uydurma bulgu |
| `StatsScreen` | Etki skoru, 7 günlük bar chart, içgörü, hedef etiketleri |
| `ArchiveScreen` | Geçmiş ritüeller, güne göre gruplanmış |
| `SettingsScreen` | Hesap, plan, isim, hedefler, tema, ses seviyesi, titreşim, hatırlatıcı, veri silme |
| `PlansScreen` | Freemium / Premium kademeleri ve tek seferlik içerik paketleri |

## Kademeler

`src/constants/plans.ts` kademeleri, `src/context/PremiumContext.tsx`
yetkileri tutar. Ücretsiz kademe 1 hedef, temel formül havuzu ve 7 günlük
geçmiş verir; Premium sınırsız hedef, tam havuz, tüm geçmiş, kriz modu ve
doz ayarını açar. İçerik paketleri havuzu genişletir, yerine geçmez.

**Satış 1.4.0 ile açıldı.** `src/utils/billing.ts` gerçek StoreKit 2 /
Play Faturalandırma çağrılarını yapıyor, `PlansScreen` gerçek bir satın
alma ekranı ve `PREMIUM_ENABLED` bayrağı artık `true`. App Store
Connect'te iki abonelik ürünü tanımlı: aylık ₺149,99 ve yıllık ₺1.159,99,
ikisinde de bir haftalık ücretsiz deneme. Ne kurulduğunun kaydı
`store/ASC-ABONELIK-KURULUMU.md`, sürümün bütün yayın sırası
`store/1.4.0-YAYIN.md` içinde.

## Kurulum akışı

`Splash → Intro (4 sayfa tanıtım) → Name (1/3) → SignIn (2/3) → Goals (3/3) → Main`

**Oturum açma zorunludur** — misafir modu yoktur, çünkü ileride üyelik
hesaba bağlanacak. OAuth istemci kimliği tanımlı değilse akış giriş
ekranında durur ve uygulamaya girilemez; kurulum aşağıda anlatılıyor.

## Oturum açma

`src/context/AuthContext.tsx` tek mod tutar: `google`. Giriş
`expo-auth-session` ile tarayıcı akışı üzerinden yapılır ve **yalnızca
kimlik** getirir (ad, e-posta, profil resmi) — ritüel verileri hiçbir yere
gönderilmez, sunucu yoktur.

İstemci kimlikleri `src/config/auth.ts` üzerinden `EXPO_PUBLIC_GOOGLE_*`
ortam değişkenlerinden okunur; şablon için `.env.example`'a bak. Hiçbiri
tanımlı değilse giriş ekranı bir uyarı gösterir ve giriş zorunlu olduğu
için akış orada durur.

> `Google.useAuthRequest`, istemci kimliği tanımlı değilken render sırasında
> hata fırlatıp uygulamayı düşürüyor. Bu yüzden hook `GoogleAuthBridge`
> bileşenine taşındı ve yalnızca yapılandırma varken mount ediliyor.

## Tema

`src/theme/theme.ts` semantik token'lar tanımlar (`bg`, `surface`, `inkCard`,
`text`, `sub`, `border`, `accentSoft`…). Palet değişmez — `constants/colors.ts`
tek kaynak olarak kalır; temalar yalnızca hangi rengin hangi rolü üstlendiğini
değiştirir. Vurgu renkleri (pulse, glow, warn) üç temada da aynıdır; değişen
zemin, yüzey ve metin tonlarıdır.

Tema `Ayarlar → Görünüm` altından **Şafak / Sis / Açık** olarak seçilir ve
`AsyncStorage`'da saklanır. **Varsayılan Şafak** — krem ve kayısı tonlarında
aydınlık bir tema. Sis koyu tarafı, Açık ise nötr gri-bej kâğıdı temsil eder.

Ritüel ekranları (`RitualScreen`, `ScoreAfterScreen`) temadan bağımsız olarak
`colors.ink` üzerine çizilir; neon çekirdek, ışıma ve parçacıklar koyu zemin
gerektirdiği için tema onları etkilemez.

Kaldırılmış tema kimlikleri açılışta taşınır (`SettingsContext`): `system`
yeni varsayılana (Şafak) düşer, 2026 Eylül'ünde kaldırılan `dark` ise en yakın
karşılığı olan Sis'e taşınır — kullanıcının seçtiği koyuluk elinden alınmasın
diye ikisi farklı yerlere gider.

## Formül motoru

`src/constants/formulaPools.ts` havuzları tutar: 16 renk (isim + süre),
12 ses (etiket + süre), 9 nefes tekniği (etiket + tur), 37 kelime ve
26 uydurma "bulgu". Ayrıca `STEP_NOTES`, adımın altındaki küçük notu
adım türü başına 4-5 varyantla tutar; hangisinin görüneceğini formülün
seed'i belirler, böylece aynı adım her ritüelde aynı cümleyi okumaz.

Ücretsiz kademe her havuzun ilk bölümünü görür (`BASIC_POOL_SIZES`:
5 renk, 4 ses, 3 nefes, 12 kelime, 8 bulgu); premium tamamını açar.
Yeni içerik listelerin **sonuna** eklenir — aksi halde ücretsiz
kademenin gördüğü içerik her sürümde yerinden oynardı.

`src/utils/formulaEngine.ts` saf fonksiyonlardan oluşur — hiçbiri depolamaya
yazmaz:

| Fonksiyon | Ne yapar |
| --- | --- |
| `generateDailyFormula(goal, date?)` | Günün formülü. Seed = tarihin charCode toplamı + `goal.length`. Aynı gün + aynı hedef → hep aynı formül. `date` yalnızca arşivde geçmiş formülü yeniden kurmak için verilir. |
| `generateCrisisFormula(goal?)` | `Date.now()` seed'iyle her çağrıda farklı formül. Günün formülünün yerine geçmez. |
| `getStepOrder(goal)` | Hedefe göre adım sırası: anxiety `breath→color→sound`, focus `color→sound→breath`, sleep `sound→breath→color`, energy `color→breath→sound`. |
| `breathPhases(pattern)` | Desenin fazları ve saniyeleri; `BreathingCircle` animasyonunu bu besler. |

**Formülü ne belirler?** Yalnızca iki şey: **günün tarihi** ve **aktif hedef**
(`user.activeGoal`). Seçtiğin diğer hedefler formülü etkilemez — bu yüzden
aktif hedef ana ekranda ve ayarlarda açıkça seçilebilir. Hedef ayrıca adım
sırasını belirler (`getStepOrder`).

**Seed kusuru düzeltildi:** ilk sürümde hedef katkısı `goal.length` idi;
'focus' ve 'sleep' beşer harf olduğu için aynı gün birebir aynı formülü
veriyordu. Artık hedefin karakter toplamı kullanılıyor.

**Çarpanlar hakkında:** havuz seçimlerinde seed farklı çarpanlarla dağıtılıyor.
Çarpanların havuz uzunluğuyla aralarında asal olması gerekiyor — örneğin
6 elemanlı ses havuzunda `(seed*3)%6` yalnızca 0 ve 3 indekslerini üretebilir,
yani 6 sesin 4'ü hiç çıkmaz. Bu yüzden ses için 5, nefes için 7, kelime için 11,
bulgu için 13 kullanıldı.

## Kör test

`Ayarlar → Ritüel → Kör test` açıldığında bazı günler (tarihten
deterministik olarak, ~3 günde 1) ritüel yerine eşit süreli bir bekleme
gelir. Hangi günün sahte olduğu ritüel bitene kadar söylenmez; sonuç
ekranında açıklanır. İstatistik ekranı gerçek ve sahte günlerin puan
ortalamalarını karşılaştırır — fark küçük çıkarsa bu da bir bulgudur.

Bu, uygulamanın kendi iddiasını kendi üstünde test etmesidir; tasarımın
en dürüst parçası.

## Diğer eklenenler

- **Doz** — `Ayarlar → Doz` adım sürelerini ikiye katlar; arayüz bunun
  ölçülmüş bir etkisi olmadığını söyler.
- **Plasebo makbuzu** — ritüel sonunda paylaşılabilir metin kartı
  (`src/utils/receipt.ts`).
- **Seri dondurma** — haftada bir kez dünü dondurup seriyi koruma.
- **Isı haritası** — son 28 günün devamlılık ızgarası.
- **Kilometre taşları** — ilk doz, 7/21 gün, 50/100 ritüel, "Şüpheci".
- **Ritüel notu** — puanlamanın yanında 140 karakterlik isteğe bağlı not.
- **Gerçek çalışma kütüphanesi + nocebo** — `Nasıl çalışır?` ekranında,
  uydurma bulgulardan ayrı tutulmuş kaynaklı liste.

## Animasyonlar

Tamamı Reanimated ile, `useAnimatedStyle` üzerinden UI thread'de çalışır;
eski `Animated` API hiçbir yerde kullanılmıyor.

| Bileşen | Ne yapar |
| --- | --- |
| `ParticleField` | Splash arka planında 20 parçacık, staggered yukarı süzülme + opacity döngüsü |
| `AnimatedIn` | Mount girişi: translateY spring (damping 15, stiffness 100) + 300ms fade; Home blokları gecikmelerle kullanır |
| `BreathingCircle` | Fazın türüne göre büyür / titrer / küçülür; `coherent_5s` sinüs easing ile hiç sert geçiş yapmaz |
| `PhaseLabel` | "Nefes Al" → "Tut" → "Nefes Ver" arasında fade + kaydırma geçişi |
| `BounceCounter` | Sayaç her değiştiğinde 1.2 → 1.0 bounce |
| `CompletionScreen` | SVG daire → tik çizimi (1.2sn) → 12 parçacıklı patlama, ardından metinler ve puanlama sırayla |
| `ScoreSlider` | Parmak hareketi UI thread'de izlenir; yalnızca seçilen tam sayı değişince JS'e haber verilir |
| `ChartArea` | Barlar spring (damping 12, stiffness 80) ile 80ms arayla büyür; bara dokununca tooltip |
| `TabBar` | Aktif ikon 1.0→1.2→1.0, nokta 4→16→4px, pasif sekmeler kısa sönümlenme |
| `PressableScale` | Tüm butonlarda onPressIn 0.96 (100ms) / onPressOut spring |

**Erişilebilirlik:** her animasyonlu bileşen `useMotion()` üzerinden
`useReducedMotion()` okur. Cihazda "Hareketi Azalt" açıksa animasyonlar
tamamen devre dışı kalır ve bileşenler doğrudan son (görünür) durumlarına
ayarlanır — hiçbir içerik kaybolmaz.

## Veri

Her şey `AsyncStorage` ile cihazda tutulur (`@plasebo/user`, `@plasebo/onboarded`).
Sunucu, hesap veya analytics yok. Ayarlar ekranındaki "Tüm verileri sil" her şeyi
temizler.

## Ses dosyaları

`assets/audio/*.wav` dosyaları `scripts/generate-tones.js` tarafından üretilir —
12 ses havuzunun her biri için döngülenen bir dosya (44.1 kHz; tonlar 8,
gürültü ve çanlar 12 saniye):
40Hz gama (200Hz taşıyıcı üzerinde genlik modülasyonu), 528Hz sinüs, 432Hz
sinüs, kahverengi gürültü, beyaz gürültü, pembe gürültü (Kellett filtresi),
yağmur katmanı (alçak geçiren gürültü + yavaş dalgalanma), 110Hz derin uğultu (55Hz yalnızca alt renk olarak)
(harmonikler + nefes gibi genlik dalgası), Tibet kâsesi ve kristal çan
(uyumsuz harmonikler + sönüm), binaural alfa (sol 200Hz / sağ 210Hz) ve
binaural teta (200/206Hz) — binaural olanlar tek stereo dosya. Ritüelde
`loop` ile formülün istediği süre kadar çalar.

Döngünün dikişsiz olması için üç ayrı yöntem kullanılıyor, çünkü tek bir
yöntem her ses türünde çalışmıyor:

| Ses türü | Yöntem |
| --- | --- |
| Periyodik tonlar (sinüs, dron, binaural) | Frekans × süre tam sayı — dalga tam turda kapanır |
| Gürültüler, yağmur | Sarmalı çapraz geçiş: fazladan üretilen kuyruk, başlangıçla eşit güçte harmanlanır |
| Çan, kâse | Vuruş döngü bitmeden tamamen sönümlenir; dosyanın sonu zaten sessizlik |

İlk sürümde dosyaların başına/sonuna fade konuyordu; bu, döngünün her
turunda sesin kısılıp açılmasına yol açtığı için tekrar noktası net
duyuluyordu. Örnekleme hızı da 22.05 kHz'di ve bandı 11 kHz'de kestiği
için her şey boğuk çıkıyordu. İkisi de düzeltildi. Süzgeç uygulanan
periyodik seslerde (`deep_drone`) ses üç kez süzülüp ortadaki tur
alınıyor — süzgecin oturma anı dosyanın başında kalmasın diye.

`node scripts/generate-tones.js` dosyaları yeniden üretir.

## Tasarımdan sapmalar

- **Victory Native yerine elle çizilen grafik.** Victory Native XL
  `@shopify/react-native-skia` gerektiriyor; Skia Expo Go'da çalışmıyor.
  "Expo Go ile test edilebilir olsun" şartını korumak için `ChartArea`
  Reanimated ile aynı görsel dilde (staggered mount animasyonu dahil) yazıldı.
- **Ritüel 3 adım.** `getStepOrder` üç adım döndürdüğü için ritüel tam olarak
  onları çalıştırır. Formülün `word` alanı adım olarak değil, nefes dairesinin
  merkezinde ve bitiş ekranında görünür.
- **Uydurma bulgular etiketli.** `PSEUDO_SCIENCE_FACTS` bilimsel görünen ölçümler
  içeriyor; uygulamanın tamamı şeffaflık üzerine kurulu olduğu için her bulgunun
  altında "Bu bulgu uydurmadır. Ölçüm yok, kaynak yok." satırı duruyor.
- **Konik gradyan.** React Native'de `conic-gradient` yok; `ConicRing`
  halkayı 72 yaya bölüp her yayın açısına göre renk interpolasyonu yapar.

## Not

Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.
