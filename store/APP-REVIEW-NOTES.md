# App Review Information → Notes (Plasebo, iOS)

Aşağıdaki metin App Store Connect'te App Review Information → Notes alanına
İngilizce olarak yapıştırılır ve aynısı Resolution Center'a cevap olarak yazılır.
Ekran kaydı ayrıca Resolution Center mesajına eklenir.

---

> **What changed since version 1.1.1.** The screenshots attached to the previous
> rejection showed a plans screen with "coming soon" placeholders for a premium
> tier and for content packs. Those were descriptions of future work, not
> features of the app. They have been removed entirely in version 1.1.2, and the
> limits they referred to have been lifted, so every feature visible in the app
> now works for every user. The full information requested is below.

## 1. Screen recording

A screen recording captured on a physical iPhone running the latest iOS is
attached to this reply. It starts from a cold launch and shows: the sign-in
screen, signing in with Sign in with Apple, the daily ritual flow from start to
finish, the prescription and archive screens, the notification permission
prompt, and the account-and-data deletion flow in Settings.

## 2. Devices and operating systems tested

- iPhone [MODEL] — iOS [VERSION]
- iPhone [MODEL] — iOS [VERSION]
- iPad is not supported; the app is iPhone-only and portrait-only.

## 3. Purpose of the app and target audience

Plasebo is a self-care and mindfulness app built around the concept of the
**open-label placebo**: a ritual that the user knowingly performs while being
told, on every screen, that it is a placebo. Its tagline is "Bilerek inan"
("Believe on purpose").

Target audience: adults interested in mindfulness, journaling and daily rituals.

The problem it addresses: people benefit from a short, structured daily moment of
calm and intention, but most such apps rely on pseudo-scientific promises. Plasebo
inverts this. It delivers the same structure — a timed breathing and focus ritual
with generated ambient sound, a daily "prescription", and a record of how the day
felt — while being explicitly transparent that the effect comes from the ritual
and the user's own expectation, not from any active ingredient.

**The app makes no medical claims.** It never states that it treats, cures,
diagnoses or improves any condition. Screens carry a standing disclaimer that the
content is a placebo. The open-label placebo research it refers to is real and
publicly published (for example the work of the Program in Placebo Studies at
Harvard Medical School); the app cites this as context only and does not claim
any clinical outcome for itself.

Core features:

- **Ritual** — a timed session with generated ambient sound (noise, tones, bell)
  and on-screen guidance.
- **Prescription** — a daily generated "prescription" card describing the day's
  ritual and intention.
- **Archive / history** — the user's own past sessions and notes.
- **Settings** — language, appearance, reminders, and account and data deletion.

Every one of these is free and unrestricted.

## 4. Setup instructions and access to the main features

**Sign in is required, and no demo account is needed or possible — please sign
in with your own Apple ID.** The app has no server and no user database, so
there are no credentials for us to issue. Signing in only reads the user's
display name from the identity provider and stores it locally on the device.

On iOS the sign-in screen offers **Sign in with Apple**. The reviewer can sign in
with any Apple ID, including a private-relay address; there is nothing to
provision on our side. Sign in with Google is offered as a second option.

After signing in, everything is reachable from the bottom navigation. No sample
files or additional credentials are required.

**Data storage and deletion.** All data — the account link, the user's name,
goals, streak, settings and every ritual record — is kept locally on the device
in AsyncStorage. There is no copy on any server. The interface follows the
device language, so on an English device the last row of Settings reads
**"Delete account and all data"** (in Turkish, "Hesabı ve tüm verileri sil").
Tapping it permanently deletes everything on the device and returns the app to
the sign-in screen. This flow is shown in the attached recording. A public
data-deletion page is also available at
https://niinova22-blip.github.io/plasebo/data-deletion.html and the privacy
policy at https://niinova22-blip.github.io/plasebo/privacy.html

## 5. External services, tools and platforms

- **Sign in with Apple** (expo-apple-authentication) — authentication only.
- **Google Sign-In** (@react-native-google-signin/google-signin) —
  authentication only.
- No backend server, no database, no analytics SDK, no advertising SDK, no AI
  service, no payment processor and no third-party data provider are used. The
  app makes no network requests other than the sign-in flow itself, and works
  fully offline afterwards.

Framework: React Native / Expo. Local notifications (expo-notifications) are used
for the optional daily reminder and are scheduled on the device; there is no push
server. Audio is generated by us and bundled with the app (expo-audio).

**In-app purchases: there are none in this version, and nothing in the app
refers to any.** Version 1.1.2 removes the informational plans screen that
version 1.1.1 contained. There is no paid tier, no "coming soon" placeholder, no
locked feature and no purchase button anywhere in the app, and no StoreKit or
other billing code is reachable in this build. Every feature the app shows is
available and fully working for every user, with no limits on history, on the
number of daily prescriptions, or on ritual length. If a paid tier is introduced
later it will be implemented with StoreKit / In-App Purchase and submitted for
review at that time.

## 6. Regional differences

The app functions identically in all regions. There is no geo-gating, no
region-specific content and no regional pricing. The interface is available in
Turkish and English, selectable in Settings → Appearance → Language and following
the device language by default; both languages expose exactly the same features
and the same disclaimers.

## 7. Regulated industries and third-party material

Plasebo does not operate in a regulated industry and is not a medical device. It
provides no diagnosis, no treatment, no health advice and no clinical service; it
does not connect to any health data, and it does not read or write HealthKit. Its
entire premise is stated openly to the user: the ritual is a placebo.

All content is original and created by us: the interface text, the ritual and
prescription texts, the visual design, and the ambient audio, which is
synthesised by our own script (`scripts/generate-tones.js`) rather than licensed.
No protected third-party material is included. References to open-label placebo
research are descriptive citations of publicly published work and are presented
as context, not as a claim about this app.
