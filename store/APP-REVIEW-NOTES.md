# App Review Information → Notes (Plasebo, iOS)

App Store Connect'teki **App Review Information → Notes** kutusu **4000
karakterle** sınırlıdır. Aşağıdaki metin bu sınıra göre yazıldı — çizgiden
sonrasının tamamı bu sınırın altındadır, olduğu gibi yapıştırılabilir.

Yapıştırmadan önce giriş paragrafındaki `[MODEL]` ve `[VERSION]`
doldurulmalıdır (test edilen iPhone modeli ve iOS sürümü).

**1.4.0 için güncellendi (5 Eylül 2026):** abonelik bölümü eklendi ve
"No in-app purchases" cümlesi kaldırıldı — o cümle, abonelik satan bir
ikiliyle doğrudan çelişiyordu. Sığdırmak için ekran kaydı maddesi ve
widget satırı çıkarıldı; not 3.893 karakter, satır sonları çift sayılsa
bile 3.978.

Metin biçimlendirme içermez (kalın, başlık, madde işareti yok): Notes kutusu
düz metin alanıdır ve markdown işaretleri incelemeciye ham hâliyle görünür.

Aşağıdaki sayaç satır sonlarını tek karakter sayar; App Store Connect bazı
tarayıcılarda çift sayabildiği için ~150 karakterlik pay bırakıldı.

Değiştirirsen karakter sayısını yeniden ölç:
`node -e "console.log(require('fs').readFileSync('store/APP-REVIEW-NOTES.md','utf8').split(/^---$/m)[1].trimStart().length)"`

--- WHAT IS NEW IN VERSION 1.4

Version 1.4 introduces the Plasebo Plus subscription (section 4). Version 1.1.1
was rejected under Guideline 2.1 for a plans screen whose features could not be
bought; that screen returns now only because both subscription products are
live in App Store Connect and can actually be purchased. Nothing is labelled
"coming soon".

Tested on iPhone [MODEL] - iOS [VERSION]. iPhone-only and portrait-only.

1. PURPOSE AND AUDIENCE

Plasebo is a self-care app built on the open-label placebo: a daily ritual the
user performs while being told, on every screen, that it is a placebo.
Audience: adults interested in mindfulness and daily rituals.

The ritual is free and complete on the free tier - four goals, a daily formula,
unlimited repeats, one targeted prescription a day, seven days of history. The
paid tier adds measurement, not the ritual.

2. SETUP AND ACCESS

Sign-in is required and no demo account is possible - please use your own Apple
ID. There is no user database and no credentials to issue; signing in only
reads a display name and stores it on the device.

All data is stored locally. The last row of Settings, "Delete account and all
data", erases everything and returns to sign-in.
Privacy policy: https://niinova22-blip.github.io/plasebo/privacy.html

3. PERMISSIONS AND ON-DEVICE MEASUREMENTS

Camera: before and after the ritual the user may estimate mood from a facial
expression. Three frames are analysed on the device and discarded at once; no
photo is saved, shown or sent.

Microphone: during the breathing step the user may let the app follow breathing
rhythm. No audio is recorded; only derived numbers are kept.

HealthKit, read only, default off: with "Health data" on, the app reads last
night's sleep, resting heart rate and HRV and uses them only to add one calming
round to that day's ritual. Nothing is written to Health and no health data
leaves the device.

Tracking (ATT): shown once, asking whether the advertising identifier may be
used to personalise ads. Declining only makes ads generic.

On-device language model: where available, Apple's system model writes the
short prescription paragraph on the device - no network request. Otherwise the
app uses hand-written text.

4. SUBSCRIPTION

Plasebo Plus is an auto-renewable subscription sold with StoreKit 2, monthly or
yearly, both unlocking the same thing: unlimited face-scan measurements instead
of one a day, breath analysis, daytime check-ins with a next-morning report,
unlimited prescriptions, full history and no ads. Both offer one free week
first.

Purchase screen: Settings tab, then the Plan row. Restore Purchases, the
renewal terms, the EULA link and the privacy link are all on that screen.
Entitlement is read from the signed transactions on the device at every launch:
no server and no receipt sent anywhere.

5. EXTERNAL SERVICES

Sign in with Apple and Google Sign-In, for authentication only.

Google AdMob shows one full-screen ad at a single point: when a session ends and
the user taps "Back to home". Never during a ritual, measurement or breathing
step; capped at three a day. The UMP consent flow and the ATT prompt run before
any ad request. Nothing the user records reaches the ad network. Plus
subscribers see no ads.

There is no backend, database, analytics SDK, external AI service, payment
processor or third-party data provider. The daily reminder uses local
notifications. Behaviour is identical in all regions and both languages.

6. REGULATED INDUSTRY AND THIRD-PARTY MATERIAL

Plasebo is not a medical device and operates in no regulated industry. It offers
no diagnosis or treatment and every screen carries a placebo disclaimer. All
text, design and audio are original. Two components are bundled under Apache-2.0
with their licence texts: TensorFlow Lite and the EmotiEffLib facial-expression
model used for the mood estimate.
