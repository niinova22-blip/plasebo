# Play Console mağaza listelemesi

Bu dosya, Google Play Console'daki "Ana mağaza girişi" formuna birebir
kopyalanacak metinleri tutar. Karakter sınırları başlıklarda yazılıdır.

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
kalır ve hiçbir içerik kaybolmaz. Koyu tema, ses seviyesi ve titreşim ayrı
ayrı ayarlanabilir.

⚗️ Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.
Sağlığınla ilgili bir endişen varsa bir sağlık profesyoneline başvur.
```

---

## Uygulama içi satın alma

v1.0.0'da **yok**. Premium ve içerik paketleri arayüzde "yakında" olarak
görünür, satın alınamaz. Play Console'daki "Uygulama içi satın alma" ve
"Reklam" beyanlarının ikisi de **hayır** olmalıdır. Faturalandırma bir
sonraki sürümde bağlanacak (bkz. `store/RELEASE.md` §7).

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
Uygulama açılışta Google ile giriş ister. Yukarıdaki hesapla giriş
yapılabilir. Giriş sonrası isim ve hedef seçimi tamamlanınca ana ekran
açılır ve tüm özellikler kullanılabilir. Uygulamanın sunucusu yoktur;
tüm veriler cihazda tutulur.
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

**Ekran görüntüleri hazır** — `store/graphics/screenshots/`, 1080×1920,
gerçek cihazdan (Android 11) alındı:

| Dosya | Ne anlatıyor |
| --- | --- |
| `01-ana-ekran.png` | Seri çubuğu, hedef şeridi ve günün formül kartı |
| `02-ritual-renk.png` | Ritüelin renk adımı ve altındaki uydurma bulgu — listelemenin en önemli karesi |
| `03-ritual-nefes.png` | Nefes adımı, faz etiketi ve geri sayım |
| `04-istatistik.png` | Etki skoru, günlük grafik, ısı haritası, kilometre taşları |
| `05-arsiv.png` | Ritüel kayıtları |
| `06-nasil-calisir.png` | Şeffaflık metni ve kaynaklı gerçek çalışmalar |

Yenilerini almak için:

```bash
adb exec-out screencap -p > store/graphics/screenshots/01-ana-ekran.png
```
