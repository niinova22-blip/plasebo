# Abonelik — nasıl açılır (iOS)

Bu dosya, kodda hazır duran premium kademesini gerçek satışa çevirmenin
yolunu anlatır. **Şu an yalnızca Apple tarafı işleniyor**; Play tarafı
sonraya bırakıldı ve son bölümde yalnızca not olarak duruyor.

> **Kod tarafı bitti (26 Ağustos 2026).** Satın alma katmanı gerçek
> StoreKit 2 çağrılarıyla yazıldı, plan ekranı gerçek bir satın alma
> ekranına çevrildi. Geriye yalnızca **App Store Connect'te ürünleri
> oluşturmak** ve `PREMIUM_ENABLED` bayrağını `true` yapmak kaldı.

> **1.4.0 sürümünün tam yayın sırası ayrı bir dosyada:**
> `store/1.4.0-YAYIN.md` — "benim yaptıklarım / senin yapacakların" diye
> ayrılmış hâli. Aşağısı işin Apple tarafındaki ayrıntısı.

> **Sıra önemli:** bu iş, uygulamanın Rahile Kökdoğan'ın hesabına
> taşınması **bittikten sonra** yapılır. Abonelik satabilmek için hesapta
> vergi ve banka bilgisi zorunlu; bunlar hesap sahibinin adına olmak
> zorunda. Ayrıntı: masaüstündeki `AppStore-Hesap-Transferi-Kurulum.md`.

---

## 0. Şu anki durum

> **Free/Plus modeli yazıldı (5 Eylül 2026).** Hangi özelliğin hangi
> kademede olduğu, ücretsiz kademenin ölçüm yolu ve reklamın nereye
> düştüğü ayrı bir belgede: `store/PLUS-MODELI.md`. Buradaki adımlar o
> modelin mağaza tarafını kuruyor.

> **Bu bölüm geçmişi anlatıyor.** Bayrak 1.4.0 ile **`true`** yapıldı;
> aşağıdaki "kapalıyken" davranışı artık geçerli değil. Ne kurulduğunun
> güncel kaydı: `store/ASC-ABONELIK-KURULUMU.md`.

`src/constants/plans.ts` içindeki `PREMIUM_ENABLED` bayrağı **`false`**
olduğu sürece:

- Plan ekranı gezinme ağacına hiç eklenmiyor, hiçbir yerden açılmıyor,
- Ayarlar'daki Plan satırı görünmüyor,
- ücretsiz kademe sınırları uygulanmıyor — herkes tam sürümü kullanıyor,
- mağaza bağlantısı hiç kurulmuyor.

Sebebi, Apple'ın 1.1.1'i Guideline 2.1 (App Completeness) ile
reddetmesiydi: satın alınamayan "yakında" özellikleri tamamlanmamış
uygulama sayılıyor. Ayrıntı: `store/RED-1.1.1-DUZELTME.md`.

**Aşağıdaki adımlar bitip sandbox'ta satın alma denendikten sonra bu tek
satır `true` yapılır**; ekran, Ayarlar satırı ve sınırlar aynı anda geri
gelir.

---

## 1. Kitaplık — `expo-iap` (kuruldu)

Daha önce bu dosyada RevenueCat öneriliyordu. **Vazgeçildi.** Gerekçe:

- RevenueCat satın alma verisini üçüncü bir tarafın sunucusuna taşıyor.
  Plasebo'nun arka ucu yok ve uygulamanın kullanıcıya verdiği söz
  "veriler cihazdan çıkmaz" — bu söz aradaki bir hizmetle çelişirdi.
- StoreKit 2 doğrulamayı kendisi yapıyor (imzalı işlem). Sunucu tarafı
  fiş doğrulaması olmadan da güvenli; RevenueCat'in çözdüğü asıl sorun
  bizde zaten yok.
- Aynı gerekçeyle Gelişim Takip de kendi StoreKit 2 köprüsünü kullanıyor;
  iki uygulamanın aynı mantıkla çalışması bakımı kolaylaştırıyor.

`expo-iap` yalnızca yerel mağaza API'sinin üzerinde ince bir katman:
iOS'ta StoreKit 2'ye, Android'de Play Faturalandırma Kitaplığı'na
bağlanıyor, aradan kimse geçmiyor.

Kurulanlar:

- `package.json` → `expo-iap`
- `app.json` → `plugins` listesine `"expo-iap"`

Yeni bir yerel modül eklendiği için **`expo prebuild` ve yeni bir derleme
şart**; OTA güncellemesi yetmez.

---

## 2. Apple tarafı — App Store Connect

### 2a. Sözleşmeler, Vergi ve Bankacılık

App Store Connect → **Business** (bazı hesaplarda "Sözleşmeler, Vergi ve
Bankacılık") → **Ücretli Uygulamalar** sözleşmesini etkinleştir.
Gerekenler:

- **Banka hesabı** (IBAN; hesap sahibi adı, Developer hesabındaki yasal
  adla birebir aynı olmalı — Türkçe karakterler dahil)
- **Vergi formu**: ABD dışı bireyler için **W-8BEN**
- Türkiye'deki KDV'yi Apple kendisi hesaplayıp ödüyor; ayrıca fatura
  kesmek gerekmiyor. Gelir vergisi beyanı hesap sahibine ait.

**Bu bölüm "Etkin" görünmeden abonelik ürünü oluşturulamaz.**

Aynı sayfada **App Store Küçük İşletme Programı**'na başvur: komisyon
%30 yerine %15 olur. Başvuru birkaç dakika, onay birkaç gün.

### 2b. Abonelik grubu ve ürünler

App Store Connect → uygulama → **Para Kazanma → Abonelikler**:

1. **Abonelik grubu oluştur**: `Plasebo Premium`.
   Grup, aynı anda yalnızca birine abone olunabilecek ürünleri bir arada
   tutar; aylık ve yıllık aynı gruba girer ve kullanıcı ikisi arasında
   geçiş yapabilir.

2. Grubun içinde **iki** abonelik oluştur. Başka ürün yok:

   | Alan | Aylık | Yıllık |
   | --- | --- | --- |
   | Referans adı (yalnız panelde) | Plasebo Plus Aylık | Plasebo Plus Yıllık |
   | **Ürün kimliği** | `com.plasebo.app.premium.monthly` | `com.plasebo.app.premium.yearly` |
   | Süre | 1 ay | 1 yıl |
   | Türkiye fiyatı | **₺149,99** | **₺1.159,99** |

   Ürün kimlikleri `premium` diyor, kullanıcıya görünen ad ise
   **Plasebo Plus**. Kimlikler kasıtlı olarak değiştirilmedi: Apple'da bir
   ürün kimliği oluşturulduktan sonra **asla** değiştirilemiyor ve ad
   uğruna kimlik değiştirmek, kodda da mağazada da her şeyi yeniden
   kurmak demekti. Kullanıcı zaten kimliği hiçbir yerde görmüyor.

   Yıllık fiyat aylığın on iki katına göre **%36 indirimli** (149,99 × 12
   = 1.799,88; 1.159,99 bunun %64,4'ü). Plan ekranındaki "%36 indirim · ayda
   ₺96,67" satırı bu iki tutardan **hesaplanıyor**, sabit yazılmıyor —
   fiyat kademesini burada değiştirirsen rozet kendiliğinden düzelir.

> ⚠️ Girdiğin tutarların Apple'ın Türkiye **fiyat kademelerinde** birebir
> karşılığı olmalı. Apple serbest tutar kabul etmiyor, listeden kademe
> seçtiriyor. Listede tam olarak istediğin tutar yoksa **en yakın
> kademeyi** seç ve bana söyle: yedek tutarları koddaki
> `src/constants/pricing.ts` içinde ona göre düzelteyim. Ekranda görünen
> fiyat zaten mağazadan okunuyor, yani kullanıcı her hâlükârda doğru
> tutarı görür; düzeltilmesi gereken tek şey mağazaya ulaşılamadığında
> gösterilen yedek.

3. **Ömür boyu ürünü oluşturma.** Önceki planda vardı, kaldırıldı: tek
   seferlik bir ödeme yinelenen gelirin yerini tutmuyor ve App Store
   Connect'te ayrı bir ürün türü, ayrı inceleme demek. Kodda da artık
   karşılığı yok.

> ⚠️ **Ürün kimlikleri sonradan değiştirilemez** ve
> `src/constants/plans.ts` içindekilerle **birebir** aynı olmalı. Bir harf
> farkı ürünü "bulunamadı" yapar; satın alma hiç başlamaz, hata da
> vermez.

4. **Yerelleştirme** (her ürün için zorunlu): Türkçe ve İngilizce görünen
   ad ve açıklama. Bu metinler kullanıcının Apple'ın onay ekranında
   gördüğü metinlerdir.

5. **İnceleme ekran görüntüsü** (her ürün için zorunlu): uygulamadaki
   plan ekranının ekran görüntüsü.

### 2c. Ücretsiz deneme (tanıtım teklifi)

Uygulamanın kendi içinden verdiği "hediye deneme" yok — kasıtlı. Deneme,
Apple'ın **tanıtım teklifi** (introductory offer) olarak tanımlanıyor:
kullanıcı Apple'ın satın alma ekranından geçiyor, süre dolunca ücretli
döneme kendiliğinden geçiyor. Uygulamanın hediye ettiği deneme Apple'a
hiç uğramadığı için süre sonunda hiçbir şey olmuyor ve ödemeye
dönüşmüyordu.

Her abonelik ürününde → **Tanıtım Teklifleri** → yeni teklif:

| Alan | Değer |
| --- | --- |
| Tür | Ücretsiz (Free) |
| Süre | 1 hafta |
| Ülkeler | Hepsi |

Uygulama bunu kendisi okuyor: teklif tanımlıysa plan kartında
"7 gün ücretsiz, sonra ₺149,99" yazıyor ve düğme "Ücretsiz denemeyi başlat"
oluyor. **Kodda hiçbir değişiklik gerekmiyor**; teklifi kaldırırsan metin
de kendiliğinden normale döner.

### 2d. İçerik paketleri — şimdilik satışa açılmıyor

`plasebo_pack_exam` / `_sleep` / `_anxiety` ürünleri **oluşturulmayacak**.
Kod tarafında `PACKS_FOR_SALE = false`. Gerekçe: paketlerin içeriği zaten
premium havuzunun içinde, ve her biri ayrı ürün + ayrı metadata + ayrı
inceleme demek. Tanımları duruyor; ileride açılmak istenirse bayrak
`true` yapılıp ürünler oluşturulur.

### 2e. Apple'ın arayüz şartları (kural 3.1.2) — kodda karşılandı

Abonelik ekranının göstermek **zorunda** olduğu her madde ve nerede
karşılandığı:

| Şart | Durum |
| --- | --- |
| Aboneliğin adı, **süresi** ve **fiyatı** | ✅ Plan kartlarında; fiyat mağazadan okunuyor, koda yazılı değil |
| Neyin açıldığının listesi | ✅ "PREMİUM İLE AÇILANLAR" bölümü |
| **Kendiliğinden yenilendiği** ve nasıl durdurulacağı | ✅ Seçili plana göre üretilen koşullar metni |
| **Kullanım Koşulları (EULA)** bağlantısı | ✅ Apple'ın standart EULA adresine gidiyor |
| **Gizlilik Politikası** bağlantısı | ✅ Uygulama içindeki Yasal ekranını açıyor |
| **"Satın alımları geri yükle"** düğmesi | ✅ Plan ekranında |
| Ücretsiz deneme varsa süresi ve sonrasında ödenecek tutar | ✅ Teklif tanımlıysa kendiliğinden yazılıyor |

App Store Connect → **Uygulama Bilgileri → Lisans Sözleşmesi** alanında
Apple'ın standart EULA'sı bırakılmalı; plan ekranındaki "Kullanım
koşulları" bağlantısı tam da o adrese gidiyor. Kendi EULA'nı yazarsan
`src/utils/billing.ts` içindeki `APPLE_EULA_URL` da güncellenmeli.

### 2f. Test

**Kullanıcılar ve Erişim → Sandbox → Test Kullanıcıları** altında bir
sandbox Apple Kimliği oluştur. TestFlight derlemesinde bu hesapla satın
alma yaparsın; gerçek para çekilmez, abonelik süreleri hızlandırılmıştır
(1 aylık abonelik sandbox'ta 5 dakikada yenilenir).

Denenmesi gerekenler:

**Satın alma:**

- [ ] İki planın da fiyatı mağazadan doğru okunuyor (yedek tutar değil,
      gerçek fiyat görünmeli)
- [ ] Yıllık kartta **"%36 indirim · ayda ₺96,67"** yazıyor ve yüzde
      ekranda yazan iki fiyatla tutuyor
- [ ] Ücretsiz deneme metni plan kartında çıkıyor
- [ ] Aylık satın alma → Plus açılıyor, sınırlar kalkıyor
- [ ] Yıllık satın alma → aynı
- [ ] Satın alma penceresini kapatmak → **hiçbir uyarı çıkmıyor**
- [ ] Uygulamayı sil, yeniden kur, **"Satın alımları geri yükle"** →
      üyelik geri geliyor
- [ ] Aboneliği sandbox'ta iptal et → süre dolunca Plus kendiliğinden
      kapanıyor
- [ ] Uçak kipinde plan ekranı → yedek fiyatlarla açılıyor, çökmüyor

**Ücretsiz kademe — asıl riskli kısım burası.** Bayrak açılana kadar
kimse ücretsiz kademeyi kullanmadı, yani bu yolların tamamı yeni:

- [ ] Günün **ilk** ölçümü kamerayla yapılabiliyor
- [ ] **İkinci** seansta "Evet, uygula" doğrudan elle puanlamaya
      götürüyor (kamera açılmıyor)
- [ ] Şikayet ekranındaki fotoğraf kartı, hak bitince plan ekranına
      götürüyor ve altındaki yazı bunu söylüyor
- [ ] Kamera iznini **reddet** → "Kamera olmadan elle puanla" görünüyor
      ve ritüele girilebiliyor *(bu yol olmadan uygulama çıkışsız kalıyor)*
- [ ] Elle puanlanan seansta **ritüel sonrası da** kaydırıcı çıkıyor,
      kamera değil
- [ ] Kamerayla ölçülen seansın **sonrası** kamerayla ölçülüyor ve
      günlük haktan **düşmüyor**
- [ ] Nefes adımında **mikrofon izni hiç istenmiyor**
- [ ] Ayarlar'da "24 saatlik döngü" anahtar değil, plan ekranına giden
      bir satır
- [ ] Seans sonunda geçiş reklamı çıkıyor
- [ ] Plus alındıktan sonra **reklam hiç çıkmıyor**

### 2g. Gizlilik beyanı

App Store Connect → **App Privacy** bölümünü abonelik verisini
içerecek şekilde güncelle (Satın Alma Geçmişi).

---

## 3. Kod tarafı — bitti

| Dosya | Ne yapıldı |
| --- | --- |
| `src/utils/billing.ts` | Gerçek StoreKit 2 katmanı: bağlantı, ürün/fiyat okuma, satın alma, yetki eşitleme, geri yükleme, abonelik yönetimi |
| `src/constants/plans.ts` | İki abonelik seçeneği, platforma göre ürün kimlikleri, kademe sınırları (`FREE_LIMITS`), özellik listeleri |
| `src/constants/pricing.ts` | Yedek tutarlar, indirim yüzdesi ve mağaza fiyatı çözücü — bağımlılıksız, sınanıyor |
| `src/utils/faceScanQuota.ts` | Ücretsiz kademedeki günlük yüz taraması sayacı |
| `src/screens/ScoreBeforeScreen.tsx` | Yüz taraması yapılamadığında devreye giren elle ölçüm |
| `src/context/PremiumContext.tsx` | Yetkinin tek kaynağı mağaza; yerel kayıt yalnızca önbellek |
| `src/screens/PlansScreen.tsx` | Gerçek satın alma ekranı — 3.1.2'nin istediği her madde |
| `src/i18n/en.ts` | Yeni metinlerin İngilizcesi |
| `app.json` | `expo-iap` eklentisi |
| `eas.json` | Ölü `EXPO_PUBLIC_ALLOW_TEST_PURCHASES` bayrağı kaldırıldı |

Yetkinin **tek doğruluk kaynağı mağaza**: uygulama kendi tuttuğu bir
tarihe bakmıyor, her açılışta cihazdaki imzalı işlemleri okuyor. Abonelik
iptal edildiğinde ya da iade alındığında hak listeden düşüyor ve premium
kendiliğinden kapanıyor.

---

## 4. Sıra özeti

1. Transfer bitsin (masaüstündeki transfer belgesi, Aşama 5).
2. Yeni hesapta **Ücretli Uygulamalar** sözleşmesi + banka + vergi.
3. Küçük İşletme Programı'na başvur.
4. Abonelik grubu + iki abonelik + bir tükenmeyen ürün oluştur.
5. Her ürüne yerelleştirme ve inceleme ekran görüntüsü ekle.
6. İki aboneliğe 1 haftalık ücretsiz tanıtım teklifi ekle.
7. `PREMIUM_ENABLED = true` yap. ✅ **Yapıldı (5 Eylül 2026).**
8. `npx expo prebuild --clean` + TestFlight derlemesi.
9. Sandbox hesabıyla §2f listesindeki her maddeyi dene.
10. Sürümü gönder — abonelik ürünleri ilk kez bu sürümle birlikte
    incelemeye girer.

---

## 5. Play tarafı — sonra

Android tarafı bilerek ertelendi. Kod hazır: ürün kimlikleri
`src/constants/plans.ts` içinde platforma göre ayrı tutuluyor
(`plasebo_premium_monthly` vb.) ve `expo-iap` aynı çağrılarla Play
Faturalandırma'ya bağlanıyor. Play Console tarafında yapılacaklar
`store/RELEASE.md` §7'de.

---

## Sık sorulan iki soru

**Fiyatı sonradan değiştirebilir miyim?** Evet. Aboneliklerde mevcut
abonelerin fiyatı korunabilir ya da onay istenerek yükseltilebilir; Apple
bunu panelden yönetiyor. Uygulamada fiyat koda yazılı olmadığı için yeni
sürüm göndermeye de gerek yok.

**Aboneliği kullanıcı nereden iptal eder?** Uygulamadan değil, cihaz
ayarlarındaki Apple Kimliği → Abonelikler ekranından. Plan ekranındaki
"Aboneliği yönet" düğmesi doğrudan oraya götürüyor. Uygulama içinden
iptal etmek Apple'da gerçek bir iptal sayılmıyor.
