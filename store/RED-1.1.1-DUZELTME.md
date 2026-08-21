# 1.1.1 reddi ve 1.1.2 düzeltmesi (App Store)

Apple, 1.1.1 sürümünü **Guideline 2.1 – Information Needed** ile reddetti.
Mektup iki ayrı şey söylüyor ve ikisi de karşılanmalı.

**1. Bilgi eksikliği.** App Store Connect'teki *App Review Information →
Notes* alanı boştu; incelemeci uygulamanın ne olduğunu, neye dayandığını
ve nasıl açılacağını göremedi. İstenen yedi maddenin cevabı hazır:
`store/APP-REVIEW-NOTES.md`.

**2. Ekteki üç ekran görüntüsü.** Üçü de **Plan ekranını** gösteriyordu:
"Premium is not open yet", "Premium — coming soon", kilitli
"🔒 Coming soon" düğmesi ve üç içerik paketi yine "coming soon". Apple
reddin ekine rastgele görsel koymaz. Guideline 2.1 (App Completeness),
yayımlanan bir uygulamada çalışmayan, "ileride gelecek" diye duran özellik
gösterilmesini yasaklar. Yalnızca yedi maddeye cevap verilseydi bu ekran
bir sonraki turda büyük olasılıkla yeniden takılacaktı.

---

## Benim yaptıklarım (depoda hazır)

| Ne | Nerede |
| --- | --- |
| `PREMIUM_ENABLED` bayrağı eklendi, `false` | `src/constants/plans.ts` |
| Plan ekranı gezinme ağacından çıkarıldı — hiçbir yoldan açılamıyor | `src/navigation/AppNavigator.tsx` |
| Ayarlar'daki "Plan · Freemium" satırı gizlendi | `src/screens/SettingsScreen.tsx` |
| Ücretsiz kademe sınırları kaldırıldı; herkes tam sürümü kullanıyor | `src/context/PremiumContext.tsx` |
| Sürüm 1.1.1 → **1.1.2**, `versionCode` 8 → 9 | `app.json` |
| Apple'a gidecek yedi maddelik metin 1.1.2'ye göre güncellendi | `store/APP-REVIEW-NOTES.md` |

**Sınırların da kaldırılmasının sebebi.** Satın alınamayan bir özelliği
kilitli göstermek kullanıcıyı çıkışsız bırakır ve Apple'ın itiraz ettiği
şeyin ta kendisidir. Bu yüzden bayrak kapalıyken geçmiş sınırı (7 gün),
günlük tek reçete sınırı ve tek doz sınırı uygulanmıyor. Böylece
uygulamada görünen her şey çalışıyor; kilit simgesi, "yakında" rozeti ve
üst kademe tanıtımı hiç kalmadı.

**Hiçbir şey silinmedi.** `PlansScreen`, plan tanımları, içerik paketleri,
`PremiumContext` ve `src/utils/billing.ts` olduğu gibi duruyor. Satın alma
gerçekten bağlandığında tek yapılacak şey `src/constants/plans.ts`
içindeki `PREMIUM_ENABLED` değerini `true` yapmak — ekran, satır ve
sınırlar aynı anda geri gelir.

Doğrulandı: `npx tsc --noEmit` temiz.

---

## Senin yapacakların

Sırayı bozma; 1. adımın çıktısı 4. adımda kullanılıyor.

### 1. Yeni derlemeyi üret ve yükle

Bilgisayarda, proje klasöründe şu iki komut:

```
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Birincisi Apple'ın sunucularında derlemeyi yapar (15–30 dakika sürer,
ekranda bir ilerleme bağlantısı verir). İkincisi çıkan dosyayı App Store
Connect'e yükler. Yükleme bittikten sonra Apple'ın derlemeyi işlemesi
10–15 dakika daha sürer; App Store Connect'te derleme "Processing"
yazısından çıkana kadar bekle.

### 2. Ekran kaydını çek

Apple'ın asıl istediği şey bu ve **gerçek bir iPhone'da** çekilmeli
(simülatör kabul edilmiyor).

1. iPhone'da **Ayarlar → Denetim Merkezi**'ne gir, listede **Ekran
   Kaydı**'nı bul ve yanındaki yeşil artıya bas.
2. Uygulamayı tamamen kapat (ekranın altından yukarı kaydırıp Plasebo
   kartını yukarı at). Kayıt uygulamanın **soğuk açılışıyla** başlamalı.
3. Ekranın sağ üstünden aşağı kaydırıp Denetim Merkezi'ni aç, içi dolu
   yuvarlak **kayıt düğmesine** bas, üç saniye bekle.
4. Şu sırayı, acele etmeden yap — her ekranda birkaç saniye dur:
   - Plasebo'yu aç (giriş ekranı görünsün).
   - **Apple ile giriş yap** — Apple'ın onay penceresi de görünsün.
   - Ana ekranda günün formülünü göster, **ritüeli baştan sona çalıştır**
     ve sonundaki puanlamayı doldur.
   - Bir **şikayet seç, reçeteyi** yazdır ve o akışı da tamamla.
   - **İstatistik** ve **Arşiv** sekmelerini gez.
   - **Bildirim izni** penceresi çıktıysa onu da göster; çıkmadıysa
     Ayarlar → Günlük hatırlatıcı'yı açıp tetikle.
   - **Ayarlar**'a gir, aşağı in ve **"Hesabı ve tüm verileri sil"**
     akışını sonuna kadar çalıştır; uygulamanın giriş ekranına dönmesini
     göster.
5. Denetim Merkezi'nden kaydı durdur. Video Fotoğraflar'a düşer.

Kayıt 3–5 dakika olacaktır; bu normal. Videoyu bilgisayara aktar
(AirDrop ya da kablo). Dosya çok büyükse Google Drive'a yükleyip
paylaşım bağlantısını "bağlantısı olan herkes görebilir" yap — Apple
bağlantı kabul ediyor.

### 3. Test ettiğin cihazları not et

`store/APP-REVIEW-NOTES.md` içindeki 2. maddede `[MODEL]` ve
`[VERSION]` yazan yerler duruyor. Kaydı çektiğin iPhone'un modelini ve
iOS sürümünü oraya yaz. İkisini de telefonda **Ayarlar → Genel →
Hakkında** ekranında bulursun: "Model Adı" ve "Yazılım Sürümü". Bana
söylersen ben de yazarım.

### 4. App Store Connect'te formu doldur

1. https://appstoreconnect.apple.com adresine gir, **Uygulamalarım →
   Plasebo**'yu aç.
2. Sol taraftaki sürüm listesinden **1.1.2**'yi seç (yoksa üstteki
   mavi **+ Sürüm** düğmesiyle oluştur ve "1.1.2" yaz).
3. Sayfada aşağı in, **Build / Derleme** bölümünde 1. adımda yüklediğin
   derlemeyi seç.
4. Daha da aşağıda **App Review Information** bölümü var. Oradaki
   **Notes** kutusuna `store/APP-REVIEW-NOTES.md` dosyasının tamamını
   yapıştır (dosyanın en üstündeki Türkçe açıklama satırlarını değil,
   `---` çizgisinden sonrasını).
5. Aynı bölümdeki **Sign-In Required** ("Giriş gerekli") kutusunu
   **işaretle** — uygulama gerçekten giriş istiyor, "hayır" demek
   incelemecinin giriş ekranına takılıp yeniden reddetmesine yol açar.
   Kutu işaretlenince kullanıcı adı ve şifre alanları açılır; oralara
   şunu yaz:

   | Alan | Ne yazacaksın |
   | --- | --- |
   | User name | `Sign in with Apple` |
   | Password | `No credentials needed` |

   Hemen altındaki Notes metninde bunun sebebi zaten yazılı: uygulamanın
   sunucusu ve kullanıcı veritabanı yok, incelemeci kendi Apple
   kimliğiyle giriyor, verilecek bir demo hesabı yok.
6. Sağ üstten **Kaydet**.

### 5. Resolution Center'a cevap yaz

1. Aynı sayfada, reddin geldiği yer olan **App Review → Resolution
   Center**'ı aç (reddi bildiren mesajın altında bir cevap kutusu var).
2. Aynı metni oraya da yapıştır ve **ekran kaydını dosya olarak ekle**
   (ya da Drive bağlantısını yaz).
3. Metnin başına şu iki cümleyi ekle — bu, neyi değiştirdiğini açıkça
   söyler ve incelemecinin işini kolaylaştırır:

   > The screenshots attached to the rejection show a plans screen with
   > "coming soon" placeholders. Those described future work rather than
   > features of the app, and they have been removed entirely in version
   > 1.1.2; the limits they referred to have been lifted, so every
   > feature visible in the app now works for every user.

4. Gönder.

### 6. İncelemeye ver

Sürüm sayfasına dön ve sağ üstteki **İncelemeye Gönder** düğmesine bas.
Cevap süresi genelde 24–48 saat.

---

## Android tarafı

Bu değişiklik Android derlemesini de etkiler (`versionCode` 9). Ancak
Play tarafı kapalı test bitene kadar dondurulmuş durumda; bkz.
`store/RELEASE.md`. Oraya yeni sürüm yüklemek için henüz bir sebep yok.
