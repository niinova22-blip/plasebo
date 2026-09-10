# Mağaza ekran görüntüleri — gerçek karelerle

7 Eylül 2026'ya kadar App Store kartlarındaki telefon ekranları **çizimdi**:
`scripts/store-shots.py` ekranları uygulamanın kaynağından yeniden çiziyordu.
Gerekçe dosyanın kendi başlığında yazılıydı — Windows'ta iOS simülatörü yok,
Android emülatöründe de uygulama zorunlu Google girişini geçemiyordu.

Bu sürümle birlikte kareler **uygulamanın kendisinden** alınıyor. Aşağıda
yolun tamamı var; bir dahaki sefere baştan keşfetmek gerekmesin.

---

## 1. Ekran görüntüsü kipi

`src/utils/screenshotSeed.ts` — `.env` içinde `EXPO_PUBLIC_SCREENSHOT_MODE=1`
iken uygulama açılışta depoya şunları yazar:

- sahte bir Google hesabı (giriş ekranı atlanır),
- kurulum işareti (tanıtım akışı atlanır),
- üç haftalık seans geçmişi (seri, ısı haritası, istatistik dolu görünür),
- arayüz dili Türkçe (emülatörün dili İngilizce; kare Türkçe olmalı),
- yetki kaydı: `EXPO_PUBLIC_SCREENSHOT_PLUS=1` ise Plus üyeliği açık.

`__DEV__` koşulu yüzünden yayın derlemesinde **her zaman kapalı**; TestFlight,
App Store ve Play derlemeleri bu koddan etkilenmez.

## 2. Emülatörde çalıştırma

```
emulator -avd gelisim -no-snapshot-load          # Pixel 6, android-34
cd android && ./gradlew assembleDebug -PreactNativeArchitectures=x86_64
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
EXPO_PUBLIC_SCREENSHOT_MODE=1 CI=1 npx expo start --dev-client --port 8081
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW \
  -d "plasebo://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

Metro'yu **`EXPO_PUBLIC_SCREENSHOT_MODE=1` ile başlatmak şart**: değişken
yalnızca `.env`'de dururken `metro.config.js` onu göremiyor ve reklam
kitaplığının yerine geçen boş karşılık devreye girmiyor.

Kare almadan önce iki şey: geliştirici menüsünü açıp (**sağ üstteki
"Tools" balonuna dokun**) *Tools button* anahtarını kapat — yoksa balon
karenin köşesinde görünür. `adb shell pm clear com.plasebo.app` yapıldıysa
bu ayar da sıfırlanır, yeniden kapatmak gerekir.

Kare alma: `adb exec-out screencap -p > store/graphics/screenshots/raw/<ad>.png`

## 3. Kartların üretilmesi

```
python scripts/store-shots.py
```

`store/graphics/screenshots/raw/<kart-adı>.png` varsa kartın telefonuna o
kare konur (çıktıda `cihaz` yazar), yoksa eski çizim fonksiyonu devreye
girer (`cizim`). Ham karenin üst şeridi (Android durum çubuğu) kırpılır;
kart kendi dinamik adasını çiziyor ve altında Play Store simgesi görünmesi
kartın uydurma olduğunu ele veriyordu.

Çıktı: `store/graphics/screenshots/ios/` (1290×2796) ve `ios/6.5-inch/`
(1242×2688).

## 4. Neden altı kart bunlar

| Kart | Ekran |
| --- | --- |
| 01 | Ana ekran — günün formülü, seri |
| 02 | Ritüel, renk adımı |
| 03 | Ritüel, nefes adımı |
| 04 | İçgörüler — genel etki skoru, günlük etki, devamlılık |
| 05 | Arşiv — geçmiş ritüeller |
| 06 | Plasebo Plus — satın alma ekranı |

**Muayene (yüz taraması) ve sabah raporu ekranları listede yok.** İkisi de
kamera/mikrofon istiyor; emülatörde ikisi de çalışmıyor, yani o ekranların
gerçek karesi alınamıyor. Çizilmiş hâllerini koymak "gerçek kare" kuralını
bozardı; yerlerine gerçekten çekilebilen iki ekran kondu.

## 5. Yerel derlemede takılan yer (AdMob + Kotlin)

`./gradlew assembleDebug` şu hatayla düşüyor:

```
play-services-ads-25.4.0 ... Module was compiled with an incompatible
version of Kotlin. The binary version of its metadata is 2.3.0,
expected version is 2.1.0.
```

AdMob SDK'sı Kotlin 2.3 ile derlenmiş, projenin yerel araç zinciri
(React Native 0.86 sürüm kataloğu) Kotlin 2.1.20'de. Denenip **işe
yaramayanlar**: `-Pandroid.kotlinVersion=2.3.0` (katalog değişse de
kitaplığın kendi eklentisi eski sürümü çekiyor), ads SDK'sını 24.5.0 ya da
25.0.0'a düşürmek (`react-native-google-mobile-ads` 25.4 API'lerini
kullanıyor, derlenmiyor).

Çalışan yol: `package.json` içine **geçici olarak**

```json
"expo": { "autolinking": { "exclude": ["react-native-google-mobile-ads"] } }
```

eklemek, derlemek, sonra bu bloğu **geri almak**. Yerel modül olmayınca
kitaplık import edildiği anda uygulama düşüyor; onun karşılığı
`src/utils/adsStubForScreenshots.ts` ve `metro.config.js` içindeki
yönlendirme (yalnızca ekran görüntüsü kipinde devrede). Reklam zaten
yalnızca iOS'ta açık, yani emülatörde hiçbir şey kaybedilmiyor.

## 6. Yol boyunca çıkan gerçek hata

Satın alma ekranında aylık planın **fiyatı boş görünüyordu**. Sebep:
mağaza ürünü döndürüyor ama gösterilecek metni boş bırakıyor ve
`priceFor` boş metni geçerli sayıp yazıyordu. `src/screens/PlansScreen.tsx`
artık boş metni de "fiyat yok" sayıp koddaki yedek fiyata düşüyor. Bu
emülatöre özel bir sorun değil: mağazaya ulaşılamayan her durumda
kullanıcı fiyatsız bir plan satırı görüyordu.
