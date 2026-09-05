# Play Console mağaza listelemesi

Bu dosya, Google Play Console'daki "Ana mağaza girişi" formuna birebir
kopyalanacak metinleri tutar. Karakter sınırları başlıklarda yazılıdır.

App Store'un metinleri (alt başlık, anahtar kelimeler, tanıtım metni gibi
Play'de karşılığı olmayan alanlar dâhil) `store/APPSTORE.md` içindedir.

Uygulamanın tamamı şeffaflık üzerine kurulu olduğu için listeleme metni de
plasebo olduğunu **gizlemek yerine öne çıkarır**. Bu aynı zamanda Play'in
"Yanıltıcı iddialar" ve "Sağlık" politikalarına karşı en güçlü savunmadır:
uygulama hiçbir yerde bir fayda vaat etmiyor.

---

## Uygulama adı (30 karakter)

```
Plasebo
```

## Kısa açıklama (80 karakter)

```
Bilerek inan. Her gün bilimsel görünümlü, tamamen plasebo bir ritüel.
```

(68 karakter)

## Tam açıklama (4000 karakter)

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
• Google ile giriş yalnızca adını, e-postanı ve profil fotoğrafını okur;
  bunlar da yalnızca cihazında saklanır.
• Ayarlardan tek dokunuşla her şeyi kalıcı olarak silebilirsin.

ERİŞİLEBİLİRLİK

Cihazında "Hareketi Azalt" açıksa uygulamadaki tüm animasyonlar devre dışı
kalır ve hiçbir içerik kaybolmaz. Üç tema (Şafak, Sis, Açık), ses seviyesi ve
titreşim ayrı ayrı ayarlanabilir.

⚗️ Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.
Sağlığınla ilgili bir endişen varsa bir sağlık profesyoneline başvur.
```

---

## Uygulama içi satın alma

**Yok.** 1.1.2'den itibaren arayüzde premium, içerik paketi ya da "yakında"
diye bir şey de görünmüyor: plan ekranı `PREMIUM_ENABLED` bayrağıyla tamamen
kapatıldı ve ücretsiz kademe sınırları kaldırıldı, çünkü Apple satın
alınamayan kilitli özellikleri "tamamlanmamış uygulama" sayıp 1.1.1'i
reddetti (bkz. `store/RED-1.1.1-DUZELTME.md`). Play Console'daki "Uygulama
içi satın alma" ve "Reklam" beyanlarının ikisi de **hayır** olmalıdır.
Faturalandırma ileride bağlanacak (bkz. `store/ABONELIK.md`).

## Diller

Uygulama Türkçe ve İngilizce çalışır; cihaz dili Türkçe değilse İngilizce
açılır. Mağaza listelemesi şu an yalnızca Türkçe. İngilizce bir listeleme
eklemek (Play Console → Ana mağaza girişi → dil ekle) görünürlüğü artırır;
metinlerin İngilizce karşılıkları uygulamanın içinde `src/i18n/en.ts`
dosyasında zaten var.

## Kategori ve etiketler

| Alan | Değer | Gerekçe |
| --- | --- | --- |
| Uygulama/Oyun | Uygulama | — |
| Kategori | **Yaşam Tarzı** | Sağlık ve Fitness seçilirse Play "Sağlık uygulamaları beyanı" ister; Plasebo bilerek hiçbir sağlık işlevi görmediği için o beyanı dürüstçe dolduramaz. Yaşam Tarzı hem doğru hem sorunsuz. |
| Etiketler | Günlük rutin, Farkındalık, Nefes | — |
| E-posta | niinova22@gmail.com | Zorunlu, herkese açık görünür |
| Gizlilik politikası | `https://<kullanıcı>.github.io/plasebo/privacy.html` | Zorunlu — bkz. `docs/` |

## İçerik derecelendirmesi (IARC anketi)

Beklenen sonuç: **3+ / Herkes**. Ankette dikkat edilecek sorular:

- Şiddet, cinsellik, küfür, kumar: **hayır**.
- **Uyuşturucu/ilaç referansı: hayır.** Uygulamadaki "doz" ve "formül"
  kelimeleri mecazidir; gerçek veya kurgusal bir madde kullanımı
  gösterilmez, tarif edilmez veya özendirilmez.
- Kullanıcılar arası etkileşim, konum paylaşımı, satın alma: **hayır**.

## Hedef kitle ve içerik

- Hedef yaş aralığı: **18 ve üzeri**. (Uygulamanın içeriği çocuklara
  yönelik değildir; alt yaş seçmek "Çocuklara Yönelik Aileler" programının
  ek gerekliliklerini tetikler.)
- "Uygulamanız çocukların ilgisini çeker mi?" → **Hayır**.
- Reklam içeriyor mu → **Hayır**.

---

## Veri güvenliği (Data safety) formu cevapları

Play'in tanımına göre "toplama", verinin cihazdan dışarı aktarılmasıdır.
Plasebo ritüel verilerini dışarı aktarmaz; ancak Google ile giriş sırasında
ad/e-posta Google'dan alınır. Buradaki cevaplar **muhafazakâr** seçilmiştir:
beyan etmemek yerine beyan etmek, incelemede sorun çıkarmaz; tersi çıkarır.

| Soru | Cevap |
| --- | --- |
| Uygulamanız kullanıcı verisi topluyor veya paylaşıyor mu? | **Evet** |
| Toplanan tür → Kişisel bilgiler → **Ad** | Toplanıyor, paylaşılmıyor |
| Toplanan tür → Kişisel bilgiler → **E-posta adresi** | Toplanıyor, paylaşılmıyor |
| Toplama amacı (her ikisi için) | **Uygulama işlevi** ve **Hesap yönetimi** |
| Bu veri zorunlu mu? | **Evet, zorunlu** (giriş olmadan uygulama kullanılamıyor) |
| Aktarım sırasında şifreleniyor mu? | **Evet** (yalnızca HTTPS) |
| Kullanıcılar verilerinin silinmesini isteyebiliyor mu? | **Evet** — silme URL'i: `https://<kullanıcı>.github.io/plasebo/data-deletion.html` |
| Konum, kişiler, fotoğraf, dosya, mesaj, sağlık, mali bilgi, cihaz kimliği | **Hiçbiri toplanmıyor** |
| Üçüncü taraflarla paylaşım | **Yok** |
| Bağımsız güvenlik incelemesinden geçti mi? | Hayır |

> **Sağlık verisi beyan edilmiyor** — ve edilmemeli. Puanlar ve notlar
> cihazdan hiç çıkmadığı için Play'in tanımıyla "toplanan" veri değildir.

---

## Uygulama erişimi (App access) — DİKKAT

Google ile giriş zorunlu olduğu için Play, "Uygulamamın tamamı veya bir
kısmı kısıtlı" seçeneğini işaretlemeni ve **incelemeciye çalışan bir
demo hesap vermeni** ister. Bu, bu uygulamanın en olası ret sebebidir.

Yapılması gereken: yalnızca inceleme için ayrı bir Google hesabı aç,
kullanıcı adı ve şifresini forma gir, "Talimatlar" alanına şunu yaz:

```
Uygulama, Google hesabıyla giriş yapılmasını ister. Yukarıdaki hesapla
giriş yapılabilir.

Sıra şöyledir: açılış ekranında "Başla" → altı ekranlık tanıtım (sağa
kaydırarak ya da "Devam" düğmesiyle geçilir; ilk dört ekranda "Atla"
bağlantısı da vardır) → son ekranda bir ad yazılır ve "İlk protokolümü
başlat" düğmesine basılır → Google giriş ekranı → kısa bir hazırlık
animasyonu → şikâyet seçim ekranı. Bu noktadan sonra tüm özellikler
kullanılabilir.

Uygulamanın sunucusu yoktur; tüm veriler cihazda tutulur.

Bu sürümde satın alınabilir bir içerik yoktur ve arayüzde buna dair bir iz
de yoktur: ödeme ekranı, kilitli özellik ya da "yakında" rozeti bulunmaz.
Uygulamadaki her özellik her kullanıcıya açıktır; geçmiş, günlük reçete
sayısı ve ritüel süresi sınırsızdır. Yukarıdaki hesap, uygulamadaki tüm
içeriğe diğer tüm kullanıcılarla birebir aynı erişime sahiptir.
```

Bilinmesi gereken: Google, tanımadığı bir cihazdan yapılan girişte
güvenlik doğrulaması isteyebilir. Demo hesabında iki adımlı doğrulamayı
**kapalı** tut ve derlemeyi göndermeden önce hesabın başka bir cihazda
sorunsuz giriş yaptığını kendin dene.

---

## Görsel varlıklar

`npm run store:assets` şunları üretir:

| Dosya | Boyut | Play alanı |
| --- | --- | --- |
| `store/graphics/icon-512.png` | 512×512 | Uygulama simgesi |
| `store/graphics/feature-graphic.png` | 1024×500 | Öne çıkan grafik |

**Ekran görüntüleri hazır** — `store/graphics/screenshots/play/`, 1080×1920.
(App Store ölçüsündeki kopyaları `…/screenshots/ios/` altındadır; iki
mağazanın görselleri yüklerken karışmasın diye ayrı klasörlerde durur.)

Bunlar ham cihaz kareleri değil, **tanıtım kartları**: üstte bir cümle,
altında telefon çerçevesi içinde uygulama ekranı. Listelemede görüntüler
küçük görünüyor; ham bir uygulama ekranı orada ne olduğunu anlatmıyor.
Yazı tipleri uygulamanın kendi fontları, böylece mağaza görseli ile
uygulama aynı tipografiyi kullanıyor.

| Dosya | Başlık | Ekran |
| --- | --- | --- |
| `01-ana-ekran.png` | Her gün yeni bir formül | Ana ekran |
| `02-ritual-renk.png` | İki dakikalık bir tören | Ritüel · renk adımı |
| `03-ritual-nefes.png` | Nefesin ritmi ekranda | Ritüel · nefes adımı |
| `04-giris-dersi.png` | Uygulama ne olduğunu söylüyor | Giriş dersi · 1. ekran |
| `05-istatistik.png` | Ölçen sensin | İstatistik |
| `06-nasil-calisir.png` | Uydurma bulgular ayrı, literatür ayrı | Nasıl çalışır? |

Ham kareler `store/graphics/screenshots/raw/` altında duruyor. Kartları
yeniden üretmek için:

```bash
npm run store:shots
```

Başlık ve alt metinler `scripts/store-screenshots.py` içindeki `CARDS`
listesinde; metin kuralı burada da aynı: hiçbir kart bir fayda vaat etmiyor.

> Arşiv ekranı sete alınmadı: birkaç günlük geçmiş olmadan neredeyse boş
> görünüyor. Uygulamayı bir süre kullandıktan sonra kendi telefonundan
> alınıp eklenebilir.

Ham kareyi cihazdan almak için:


```bash
adb exec-out screencap -p > store/graphics/screenshots/raw/01-ana-ekran.png
```
