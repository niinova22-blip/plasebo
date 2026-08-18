# Abonelik ve içerik paketleri — nasıl açılır

Bu dosya, uygulamadaki "yakında" yazan premium kademesini gerçek satışa
çevirmenin yolunu anlatır. İki mağaza da anlatılıyor çünkü iş tek kod
yolundan geçiyor; ayrılan yerler ayrıca işaretli.

> **Bu iş v1.0 yayınından sonra yapılır.** Sebebi teknik: ürün kimlikleri
> mağaza panelinde tanımlanmadan faturalandırma kitaplığı bağlanamaz,
> ürün tanımlamak içinse uygulamanın panelde kayıtlı olması gerekir.
> Yani sıra zorunlu olarak "önce yayın, sonra abonelik"tir.

---

## Önce bilinmesi gerekenler

| Konu | Apple | Google |
| --- | --- | --- |
| Tek yasal ödeme yolu | App Store Faturalandırması (StoreKit) | Play Faturalandırma Kitaplığı |
| Komisyon | %30; **Küçük İşletme Programı**'na başvurursan %15 (yıllık geliri 1 milyon USD altındakiler). Aboneliğin 2. yılından itibaren zaten %15. | %30; **%15** (yıllık ilk 1 milyon USD) ve aboneliklerde ilk günden %15 |
| Para almak için | Sözleşmeler, Vergi ve Bankacılık bölümü doldurulmalı (banka hesabı + vergi formu) | Play Console'da satıcı hesabı ve ödeme profili |
| Ürün incelemesi | İlk abonelik, bir sürümle birlikte incelemeye girer | Ürün ayrı incelenmez |
| Test | Sandbox test hesapları | Lisans test hesapları |

Uygulamanın dışında bir ödeme yolu (havale, Stripe, web sitesi) sunmak
her iki mağazada da uygulamanın kaldırılma sebebidir. Bunun tek istisnası
bazı ülkelerdeki yeni düzenlemelerdir; Türkiye o kapsamda değil.

---

## 1. Kitaplık seçimi — öneri: RevenueCat

İki seçenek var:

**a) RevenueCat** *(önerilen)* — iki mağazayı tek arayüzle yönetir, satın
alma fişlerini kendi sunucusunda doğrular, "kullanıcı premium mi?"
sorusunu tek bir yerden cevaplar (entitlement), geri yükleme ve abonelik
iptali gibi durumları kendisi takip eder. **Aylık 2.500 USD gelire kadar
ücretsizdir** ve senin bir sunucu kurmanı gerektirmez.

**b) `expo-iap` / `react-native-iap`** — üçüncü taraf yok, ama fiş
doğrulama, abonelik durumu takibi ve iki mağazanın farklarını kendimiz
yönetiriz. Sunucusuz doğrulama zayıf kalır.

Plasebo'nun arka ucu olmadığı için **RevenueCat** açık ara daha az riskli.
Aşağıdaki adımlar onu varsayıyor.

## 2. Apple tarafı — App Store Connect

### 2a. Sözleşmeler, Vergi ve Bankacılık — senin yapacağın

App Store Connect → **Sözleşmeler, Vergi ve Bankacılık** → **Ücretli
Uygulamalar** sözleşmesini etkinleştir. Gerekenler:

- **Banka hesabı** (IBAN, hesap sahibi adı seninkiyle aynı olmalı)
- **Vergi formu**: ABD dışı bireyler için **W-8BEN**. Panelde adım adım
  soruyor; TC kimlik numaran vergi kimliği olarak kullanılabilir.
- Türkiye'deki KDV'yi Apple kendisi hesaplayıp ödüyor; senin ayrıca
  fatura kesmen gerekmiyor. Gelir vergisi beyanı sana ait.

**Bu bölüm "Etkin" görünmeden abonelik ürünü oluşturulamaz.**

Aynı sayfada **App Store Küçük İşletme Programı**'na başvur: komisyon
%30 yerine %15 olur. Başvuru birkaç dakika, onay birkaç gün.

### 2b. Abonelik grubu ve ürünler

App Store Connect → uygulama → **Para Kazanma → Abonelikler**:

1. **Abonelik grubu oluştur** (ör. `Plasebo Premium`). Grup, aynı anda
   yalnızca birine abone olunabilecek ürünleri bir arada tutar; ileride
   yıllık plan eklersen aynı gruba girer ve kullanıcı aralarında geçiş
   yapabilir.
2. Grubun içinde abonelik oluştur:

   | Alan | Değer |
   | --- | --- |
   | Referans adı (yalnızca panelde görünür) | Plasebo Premium Aylık |
   | **Ürün kimliği** | `plasebo_premium_monthly` |
   | Süre | 1 ay |
   | Fiyat | Türkiye için seçtiğin fiyat; diğer ülkeleri Apple otomatik dönüştürür |

3. **Yerelleştirme** (zorunlu): Türkçe ve İngilizce için görünen ad ve
   açıklama. Bu metinler kullanıcının abonelik onay ekranında görünür.
4. **İnceleme ekran görüntüsü** (zorunlu): uygulamadaki plan ekranının
   ekran görüntüsü.

Ardından **Uygulama İçi Satın Almalar** bölümünde üç içerik paketini
**Tükenmeyen (Non-Consumable)** olarak aç:

| Ürün | Tür | Kimlik |
| --- | --- | --- |
| Sınav odak paketi | Tükenmeyen | `plasebo_pack_exam` |
| Uyku paketi | Tükenmeyen | `plasebo_pack_sleep` |
| Kaygı paketi | Tükenmeyen | `plasebo_pack_anxiety` |

Kimlikler `src/constants/plans.ts` içindekilerle **birebir aynı** olmalı;
aynı kimlikler Play tarafında da kullanılır.

### 2c. Uygulama İçi Satın Alma anahtarı

RevenueCat'in Apple ile konuşabilmesi için:

- App Store Connect → **Kullanıcılar ve Erişim → Entegrasyonlar →
  Uygulama İçi Satın Alma** → yeni anahtar oluştur, `.p8` dosyasını indir
  (bir kez indirilir, sakla) ve RevenueCat paneline yükle.
- Ayrıca **App Store Connect API** anahtarı istenirse aynı yerden.

### 2d. Apple'ın arayüz şartları (kural 3.1.2)

Abonelik ekranı reddedilmemek için şunları **göstermek zorunda**:

- Aboneliğin adı ve **süresi** ("aylık"), **fiyatı** — fiyat mağazadan
  okunmalı, koda yazılmamalı
- Neyin açıldığının listesi
- **Kullanım Koşulları (EULA)** ve **Gizlilik Politikası** bağlantıları
  — ikisi de plan ekranında görünür olmalı
- **"Satın alımları geri yükle"** düğmesi (şu an arayüzden kaldırılmıştı;
  faturalandırmayla birlikte geri gelecek)
- Ücretsiz deneme varsa: deneme süresi, bitince ne kadar ödeneceği ve
  iptal edilmezse otomatik yenileneceği

App Store Connect → **Uygulama Bilgileri → Lisans Sözleşmesi** alanında
Apple'ın standart EULA'sı bırakılabilir; o zaman plan ekranındaki
"Kullanım Koşulları" bağlantısı Apple'ın standart EULA adresine gider.

### 2e. Test

**Kullanıcılar ve Erişim → Sandbox → Test Kullanıcıları** altında bir
sandbox Apple Kimliği oluştur. TestFlight derlemesinde bu hesapla satın
alma yaparsın; gerçek para çekilmez, abonelik süreleri hızlandırılmıştır
(1 aylık abonelik sandbox'ta 5 dakikada yenilenir).

## 3. Google tarafı — Play Console

Kısaca, çünkü ayrıntısı `store/RELEASE.md` §7'de:

1. Play Console → **Para kazanma → Ürünler** → abonelik
   (`plasebo_premium_monthly`) ve üç tek seferlik ürün.
2. Ödeme profili ve satıcı hesabı tanımlı olmalı.
3. Aynı RevenueCat projesine Play tarafını da bağla (Google Cloud servis
   hesabı anahtarı ile).

## 4. Kod tarafı — bende

Uygulama zaten bu iş için hazırlandı; değişecek tek dosya
`src/utils/billing.ts`:

```
isBillingAvailable()  → mağaza bağlantısı kuruldu mu
purchasePlan(plan)    → abonelik satın alma akışı
purchasePack(pack)    → tek seferlik ürün satın alma
restorePurchases()    → mağazadaki aktif satın alımları geri yükle
```

Bu dört fonksiyonun içi RevenueCat çağrılarıyla doldurulur; yetkiler
`PremiumContext` üzerinden tek noktadan aktığı için başka hiçbir ekran
değişmez. Ek olarak:

- Plan ekranındaki `₺49` / `₺29` yer tutucuları kaldırılır, fiyat mağaza
  yanıtından okunur.
- "Satın alımları geri yükle" düğmesi geri gelir.
- Plan ekranına Kullanım Koşulları ve Gizlilik Politikası bağlantıları
  eklenir.
- `EXPO_PUBLIC_ALLOW_TEST_PURCHASES` test yolu kaldırılır ya da yalnızca
  geliştirme derlemesinde bırakılır.

Tahmini iş: yarım ila bir gün, artı sandbox denemeleri.

## 5. Sıra özeti

1. v1.0 iki mağazada da yayında olsun.
2. Apple: Sözleşmeler/Vergi/Bankacılık + Küçük İşletme Programı.
   Google: ödeme profili.
3. İki panelde de ürünleri aynı kimliklerle aç.
4. RevenueCat hesabı aç, iki mağazayı bağla, entitlement adı `premium`.
5. Ben `billing.ts`'i bağlarım, plan ekranını mağaza fiyatına çeviririm.
6. Sandbox / lisans test hesabıyla denenir.
7. Yeni sürüm gönderilir; Apple'da abonelik ürünü ilk kez bu sürümle
   birlikte incelemeye girer.

---

## Sık sorulan iki soru

**Fiyatı sonradan değiştirebilir miyim?** Evet. Aboneliklerde mevcut
abonelerin fiyatı korunabilir ya da onay istenerek yükseltilebilir; Apple
bunu panelden yönetiyor.

**Aboneliği kullanıcı nereden iptal eder?** Uygulamadan değil, cihaz
ayarlarından (iPhone: Ayarlar → Apple Kimliği → Abonelikler). Apple, plan
ekranında bu bilgiyi vermeni bekler; iptal düğmesi koymak zorunda
değilsin ama nereden iptal edileceğini yazmak inceleme sorununu önler.
