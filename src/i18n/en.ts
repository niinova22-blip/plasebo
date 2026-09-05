/**
 * Türkçe → İngilizce sözlük.
 *
 * Anahtar, kodda yazılan Türkçe metnin kendisidir. Karşılığı bulunmayan
 * bir metin çevrilmeden, yani Türkçesiyle görünür — böylece eksik bir
 * çeviri uygulamayı bozmaz, yalnızca o satırı Türkçe bırakır.
 *
 * Değişkenler `{ad}` biçiminde taşınır ve İngilizce karşılıkta da aynı
 * adla geçmelidir; sıraları değişebilir.
 */
export const EN: Record<string, string> = {
  /* ---------------------------------------------------------------- */
  /* Genel / gezinme                                                   */
  /* ---------------------------------------------------------------- */
  'Formül': 'Formula',
  'İstatistik': 'Stats',
  'Arşiv': 'Archive',
  'Ayarlar': 'Settings',
  '← Geri': '← Back',
  '‹ Geri': '‹ Back',
  'Devam': 'Continue',
  'Atla': 'Skip',
  'Başla': 'Start',
  'Kaydet': 'Save',
  /* Fotograf tabanli olcum akisinin metinleri. */
  '🎙️ NEFES ÖLÇÜMÜ':
    '🎙️ BREATH MEASUREMENT',
  'Mikrofon hiç veri göndermedi — ritüeli yeniden başlatmayı dene.':
    'The microphone sent no data at all — try starting the ritual again.',
  'Koyuluk günün puanı, alttaki şerit kamera/nefes/refleks ölçümü · çerçeveli kutular dondurulmuş günler':
    'Darkness is the day’s score, the strip below is the camera/breath/reaction measurement · framed boxes are frozen days',
  'Ritüel öncesi':
    'Before the ritual',
  'Ritüel sonrası':
    'After the ritual',
  '{gun}: öncesi {once}, sonrası {sonra}':
    '{gun}: before {once}, after {sonra}',
  '{tarih} · öncesi {once} · sonrası {sonra}':
    '{tarih} · before {once} · after {sonra}',
  'Ölçülen puan':
    'Measured score',
  '🎙️ Mikrofon izni verilmedi — nefes ölçümü olmadan devam edeceksin':
    '🎙️ Microphone permission denied — you will continue without the breath measurement',
  'Bu bir duygu teşhisi değil — mikrofonla ölçülen nefes ritmi, puanların yanına konan ayrı bir veri.':
    'This is not an emotional diagnosis — it is the breathing rhythm measured by the microphone, a separate figure placed beside your scores.',
  'İkisi de fotoğraf analiziyle ölçüldü':
    'Both were measured by photo analysis',
  'EK ÖLÇÜMLER':
    'ADDITIONAL MEASUREMENTS',
  'Puan ölçeğine girmeyen, kendi birimleriyle duran kayıtlar.':
    'Records that stay in their own units rather than the score scale.',
  'İstatistik ekranı her ritüelin öncesini ve sonrasını yan yana koyuyor.':
    'The stats screen puts the before and after of every ritual side by side.',
  'Bu bir zeka ya da sağlık testi değil. Yalnızca dikkatini ne kadar hızlı topladığının kaydı — puanların yanına konacak, ayrı bir ölçü.':
    'This is not an intelligence or health test. It is only a record of how quickly you gather your attention — a separate measure placed beside your scores.',
  'Bir fotoğraf çekiyorsun; yüz ifaden okunuyor, reçeten ona göre yazılıyor ve o okuma günün başlangıç puanı oluyor.\n\n4 dakika uyguluyorsun. Nefes adımında mikrofon ritmini dinliyor.\n\nRitüel bitince bir fotoğraf daha: öncesi ve sonrası aynı yöntemle ölçülmüş oluyor.\n\nHepsi bu — ve hepsi telefonunun içinde kalıyor.':
    'You take a photo; your expression is read, your prescription is written from it, and that reading becomes the day’s starting score.\n\nYou run it for 4 minutes. During the breathing step the microphone listens to your rhythm.\n\nWhen the ritual ends, one more photo: before and after are measured the same way.\n\nThat is all — and all of it stays inside your phone.',
  /* Fotograf tabanli olcum akisi. */
  'Fotoğraf analiziyle otomatik reçete':
    'Automatic prescription from photo analysis',
  'YA DA':
    'OR',
  '📷 Bu sayıyı kamera ölçtü':
    '📷 The camera measured this number',
  '📷 Ölçüm için bir fotoğraf gerekiyor':
    '📷 A photo is needed for the measurement',
  '📷 Fotoğrafı çek':
    '📷 Take the photo',
  'Fotoğrafı çektiğinde önce/sonra farkı burada çıkacak':
    'Once you take the photo, the before/after difference appears here',
  'Ölçmeden bitir':
    'Finish without measuring',
  'Her ritüelin öncesi ve sonrası, aynı yöntemle ölçülmüş hâliyle.':
    'The before and after of every ritual, measured the same way.',
  'Vazgeç': 'Cancel',
  'Kapat': 'Sign out',
  'Sil': 'Delete',
  'Misafir': 'Guest',
  'Merhaba {ad}': 'Hello {ad}',
  'Hoş geldin': 'Welcome',
  'Nasıl çalışır?': 'How does it work?',
  'Plasebo · v{surum}': 'Placebo · v{surum}',

  /* ---------------------------------------------------------------- */
  /* Açılış ve tanıtım                                                 */
  /* ---------------------------------------------------------------- */
  'BİLEREK İNAN': 'BELIEVE ON PURPOSE',
  'Bu uygulama tamamen ': 'This app contains nothing but ',
  'plasebo': 'placebo',
  ' içerir. Bunu biliyorsun. Yine de ': '. You know that. Even so, it ',
  'işe yarayacak': 'will work',
  '.': '.',
  'Sonraki': 'Next',
  'Bu bir plasebo': 'This is a placebo',
  'Plasebo, hiçbir etkin maddesi olmayan bir şeyin yine de bir etki yaratmasıdır. Bu uygulamanın içinde etkin madde yok. Bunu saklamıyoruz — tam tersine, her ekranda yazıyor.':
    'A placebo is something with no active ingredient that produces an effect anyway. There is no active ingredient in this app. We are not hiding that — on the contrary, every screen says so.',
  'Her gün bir formül': 'A formula every day',
  'Her sabah bir renk, bir ses ve bir nefes tekniğinden oluşan bir formül üretilir. Formülü iki şey belirler: günün tarihi ve seçtiğin hedef. Aynı gün, aynı hedef — hep aynı formül. Rastgele değil; her gün aynı yere dönebildiğin, tekrarlanabilir bir ritüel.':
    'Every morning a formula is generated from a colour, a sound and a breathing pattern. Two things decide it: today’s date and the goal you picked. Same day, same goal — always the same formula. Not random; a repeatable ritual you can return to every day.',
  'Üç adım, birkaç dakika': 'Three steps, a few minutes',
  'Renge bakarsın, sesi dinlersin, nefesini sayarsın. Yavaş nefes gerçekten sakinleştirir. Gerisi — renk, frekans, kelime — tamamen senin inancına kalmış.':
    'You look at a colour, listen to a sound, count your breath. Slow breathing genuinely calms you. The rest — colour, frequency, word — is entirely up to your belief.',
  'Kayıtlar sende kalır': 'Your records stay with you',
  'Ritüellerin, serin ve puanların telefonunda saklanır. Google hesabı yalnızca kimliğin ve ileride üyeliğin için kullanılır — ritüel verilerin cihazdan çıkmaz.':
    'Your rituals, streak and scores are stored on your phone. The Google account is used only for your identity and, later, your membership — your ritual data never leaves the device.',

  /* ---------------------------------------------------------------- */
  /* Kurulum                                                           */
  /* ---------------------------------------------------------------- */
  'SON ADIM': 'LAST STEP',
  'Sana nasıl hitap edelim?': 'What should we call you?',
  'Tek satırlık bir şey. Uygulama içinde seni bununla selamlayacak, başka hiçbir yere gitmeyecek.':
    'Just one line. The app will greet you with it and it goes nowhere else.',
  'Örn. Deniz': 'e.g. Alex',
  '⚗️ Adın formülü değiştirmez. Hiçbir şey formülü değiştirmez — tarih hariç.':
    '⚗️ Your name does not change the formula. Nothing does — except the date.',
  'Devam etmek için Google hesabınla giriş yap. Hesap, serini ve ileride üyeliğini bu cihaza bağlamak için gerekiyor. Ritüel kayıtların yine telefonunda kalır.':
    'Sign in with your Google account to continue. The account ties your streak and, later, your membership to this device. Your ritual records still stay on your phone.',
  'Devam etmek için bir hesapla giriş yap. Hesap, serini ve ileride üyeliğini bu cihaza bağlamak için gerekiyor. Ritüel kayıtların yine telefonunda kalır.':
    'Sign in with an account to continue. The account ties your streak and, later, your membership to this device. Your ritual records still stay on your phone.',
  'Google ile devam et': 'Continue with Google',
  'Google girişi yapılandırılmamış': 'Google sign-in is not configured',
  'Bu derlemede Google Web istemci kimliği tanımlı olmadığı için giriş yapılamıyor ve giriş zorunlu olduğundan uygulama burada duruyor. Kurulum için src/config/auth.ts dosyasındaki açıklamaya bak.':
    'This build has no Google web client ID, so signing in is impossible — and since sign-in is required, the app stops here. See the notes in src/config/auth.ts to set it up.',
  "Devam ederek Gizlilik Politikası'nı kabul etmiş olursun. Girişten yalnızca adın ve e-postan okunur; ritüel verilerin hiçbir sunucuya gönderilmez.":
    'By continuing you accept the Privacy Policy. Sign-in reads only your name and email; your ritual data is never sent to any server.',
  "Devam ederek Gizlilik Politikası'nı kabul etmiş olursun. Google'dan yalnızca adın, e-postan ve profil fotoğrafın okunur; ritüel verilerin hiçbir sunucuya gönderilmez.":
    'By continuing you accept the Privacy Policy. Only your name, email and profile picture are read from Google; your ritual data is never sent to any server.',
  '⚗️ Giriş yapmak formülü değiştirmez. Hiçbir şey etkiyi değiştirmez.':
    '⚗️ Signing in does not change the formula. Nothing changes the effect.',
  'Bugün hangisiyle başlıyorsun?': 'Which one are you starting with today?',
  'Dört hedefin de her gün kendi formülü üretilir; hepsi açık. Burada yalnızca hangisiyle başlayacağını söylüyorsun — ana ekrandan istediğin an diğerine geçebilirsin.':
    'All four goals get their own formula every day, and all of them are open. Here you only say which one you are starting with — you can switch to another from the home screen at any time.',
  'Birden fazla seçebilirsin. Günün formülünü bunlardan yalnızca biri belirler — hangisi olduğunu aşağıda seçiyorsun.':
    'You can pick more than one. Only one of them decides today’s formula — you choose which below.',
  'Bir hedef seç. Günün formülü bu hedeften ve tarihten üretilir; sonradan Ayarlar’dan değiştirebilirsin.':
    'Pick a goal. Today’s formula is generated from it and the date; you can change it later in Settings.',
  'FORMÜLÜ HANGİSİ BELİRLESİN?': 'WHICH ONE DECIDES THE FORMULA?',
  '⚗️ Seçimin formülün adını ve adım sırasını değiştirir, etkisini değil. Etki zaten sende.':
    '⚗️ Your choice changes the formula’s name and step order, not its effect. The effect was always yours.',
  'Dikkatini toplamak istiyorsun': 'You want to gather your attention',
  'Daha kolay uyumak istiyorsun': 'You want to fall asleep more easily',
  'Zihnini yavaşlatmak istiyorsun': 'You want to slow your mind down',
  'Güne hız katmak istiyorsun': 'You want some speed for the day',

  /* ---------------------------------------------------------------- */
  /* Hedefler ve adımlar                                               */
  /* ---------------------------------------------------------------- */
  'Odak': 'Focus',
  'Uyku': 'Sleep',
  'Kaygı': 'Anxiety',
  'Enerji': 'Energy',
  'Sükunet': 'Calm',
  'Denge': 'Balance',
  'Kriz': 'Crisis',
  'Renk': 'Colour',
  'Ses': 'Sound',
  'Nefes': 'Breath',
  'Kelime': 'Word',

  /* ---------------------------------------------------------------- */
  /* Ana ekran                                                         */
  /* ---------------------------------------------------------------- */
  'Günaydın,': 'Good morning,',
  'Merhaba,': 'Hello,',
  'İyi günler,': 'Good afternoon,',
  'İyi akşamlar,': 'Good evening,',
  'İyi geceler,': 'Good night,',
  '{gun} gün serisi': '{gun}-day streak',
  'Bugün tamamlandı': 'Done today',
  'Bugün formülün hazır': 'Today’s formula is ready',
  '❄️ Dünü dondur — seri kopmasın (haftada 1)':
    '❄️ Freeze yesterday — keep the streak (once a week)',
  'FORMÜLÜ BELİRLEYEN HEDEF': 'GOAL THAT DECIDES THE FORMULA',
  'BUGÜNÜN FORMÜLÜ': 'TODAY’S FORMULA',
  'KRİZ FORMÜLÜ': 'CRISIS FORMULA',
  '⚗️ Bu tamamen plasebo. Yine de işe yarayacak.':
    '⚗️ This is entirely placebo. It will work anyway.',
  '{formul} ritüelini başlat': 'Start the {formul} ritual',
  '{sure} sn': '{sure} s',
  '{tur} tur': '{tur} rounds',
  '{ad} · ~{sure} sn': '{ad} · ~{sure} s',

  /* ---------------------------------------------------------------- */
  /* Ritüel                                                            */
  /* ---------------------------------------------------------------- */
  'Otur ve bekle.': 'Sit and wait.',
  'Bugün başka bir şey yapmayacaksın': 'You will do nothing else today',
  '{renk} — sadece bak.': '{renk} — just look.',
  '{ses} çalıyor. Dinle.': '{ses} is playing. Listen.',
  'Bugünün kelimesi: {kelime}': 'Today’s word: {kelime}',
  '{faz} · {tur}. tur': '{faz} · round {tur}',
  'Sonraki Adım →': 'Next step →',
  'Ritüeli Bitir →': 'Finish the ritual →',
  'Nefes Al': 'Breathe In',
  'Nefes Ver': 'Breathe Out',
  'Uzun Ver': 'Long Out',
  'Kısa Al': 'Short In',
  'Bir Kez Daha Al': 'One More In',
  'Tut': 'Hold',
  'Bekle': 'Pause',

  /* Adım altı notları */
  'Bakışını tek bir yerde tutmak, zihni de orada tutuyor':
    'Holding your gaze in one place holds the mind there too',
  'Göz sabitlendiğinde düşünce de yavaşlar — mekanizma bu kadar':
    'When the eye settles, thought slows down — that is the whole mechanism',
  'Ses bir örtü; altındaki sessizliği duyman için var':
    'The sound is a cover; it exists so you can hear the silence beneath it',
  'Zorlama yok; kaçırdığın turu bir sonraki kapatır':
    'No forcing; the next round covers the one you missed',
  'Bugün bu kelime, yarın başkası. Değişen tek şey sen değilsin':
    'This word today, another tomorrow. You are not the only thing that changes',
  'Tekrarlamak zorunda değilsin; bakman yeterli':
    'You do not have to repeat it; looking is enough',
  'Anlamı sonradan gelir, bazen hiç gelmez. İkisi de olur':
    'The meaning arrives later, sometimes never. Both are fine',

  /* ---------------------------------------------------------------- */
  /* Ritüel sonu                                                       */
  /* ---------------------------------------------------------------- */
  'Formül tamamlandı': 'Formula complete',
  '{formul} · bekleme': '{formul} · waiting',
  '{formul} · {adim} adım · {kelime}': '{formul} · {adim} steps · {kelime}',
  'Bu bir sahte ritüeldi': 'That was a sham ritual',
  'Bugün sana renk, ses ya da nefes verilmedi — sadece bekledin. Kör test açık olduğu için bunu önceden söylemedik. Puanın, gerçek ritüel günlerinin ortalamasıyla İstatistik ekranında karşılaştırılacak.':
    'Today you were given no colour, sound or breathing — you simply waited. Blind test is on, so we did not tell you in advance. Your score will be compared with the average of real ritual days on the Stats screen.',
  'Nasıl hissediyorsun?': 'How do you feel?',
  'Kısa bir not bırak (isteğe bağlı)': 'Leave a short note (optional)',
  '🧾 Makbuzu paylaş': '🧾 Share the receipt',
  'hiç': 'none',
  'çok': 'a lot',

  /* Makbuz */
  '⚗️ PLASEBO MAKBUZU': '⚗️ PLACEBO RECEIPT',
  'Tarih:    {tarih}': 'Date:     {tarih}',
  'Formül:   {formul}': 'Formula:  {formul}',
  'İçerik:   — (sahte ritüel, kör test)': 'Contents: — (sham ritual, blind test)',
  // Belge kartındaki satır etiketi (metin sürümündeki uzun anahtardan ayrı).
  'İçerik': 'Contents',
  'Renk:     {ad} · {sure} sn': 'Colour:   {ad} · {sure} s',
  'Ses:      {ad} · {sure} sn': 'Sound:    {ad} · {sure} s',
  'Nefes:    {ad} · {tur} tur': 'Breath:   {ad} · {tur} rounds',
  'Kelime:   {kelime}': 'Word:     {kelime}',
  'Doz:      {doz}': 'Dose:     {doz}',
  'tek': 'single',
  'Etkin madde: yok': 'Active ingredient: none',
  'Hissettiğim: {puan}/10': 'How I felt: {puan}/10',
  'Seri:     {gun} gün': 'Streak:   {gun} days',
  'Bugün hiçbir şey yapmadım. İşe yaradı.': 'I did nothing today. It worked.',
  '— Plasebo · bilerek inan': '— Placebo · believe on purpose',

  /* ---------------------------------------------------------------- */
  /* İstatistik                                                        */
  /* ---------------------------------------------------------------- */
  'İçgörüler': 'Insights',
  'Son 14 gün': 'Last 14 days',
  'Genel Etki Skoru': 'Overall Effect Score',
  'iyileşme': 'improvement',
  'düşüş': 'decline',
  '{gun} gün öncesine göre': 'compared with {gun} days ago',
  'Karşılaştırma için veri toplanıyor — birkaç ritüel daha.':
    'Collecting data for a comparison — a few more rituals.',
  'GÜNLÜK ETKİ': 'DAILY EFFECT',
  'ritüel yok': 'no ritual',
  'Bir bara dokun — o günün puanını göster.': 'Tap a bar to see that day’s score.',
  '{gun}: {puan} puan': '{gun}: {puan} points',
  'DEVAMLILIK': 'CONSISTENCY',
  'Koyuluk o günün puanı · çerçeveli kutular dondurulmuş günler':
    'Darkness is that day’s score · outlined cells are frozen days',
  'Koyuluk kendi puanın, alttaki şerit kamera/nefes ile ölçülen objektif sinyal · çerçeveli kutular dondurulmuş günler':
    'Darkness is your own score, the strip below is the camera/breath objective signal · outlined cells are frozen days',
  '🔬 Kör test karşılaştırması': '🔬 Blind test comparison',
  'Gerçek ritüel ortalaman {gercek}/10 ({gercekAdet} kez), sahte ritüel ortalaman {sahte}/10 ({sahteAdet} kez). ':
    'Your real ritual average is {gercek}/10 ({gercekAdet} times), your sham ritual average is {sahte}/10 ({sahteAdet} times). ',
  'Aradaki fark neredeyse yok — bu da bir bulgu.':
    'There is almost no difference — that is a finding too.',
  'Fark sende; ritüel bir çerçeve kuruyor.':
    'The difference is in you; the ritual builds a frame.',
  'Sahte günlerin daha iyi geçmiş. Bu da mümkün.':
    'Your sham days went better. That happens too.',
  '🧠 Haftanın günü deseni': '🧠 Day-of-week pattern',
  '{gun} günleri ritüel sonrası kendine verdiğin puan, tüm günlerin ortalamasının %{yuzde} üstünde. Bu, formülün o gün daha çok işe yaradığını göstermez — yalnızca o günlerin senin için daha iyi geçtiğini.':
    'On {gun}s the score you give yourself after the ritual is {yuzde}% above your all-day average. That does not show the formula works better that day — only that those days went better for you.',
  'Bu kart, haftanın hangi gününde kendini daha yüksek puanladığını arar. Karşılaştırma için en az {gereken} ritüel gerekiyor; şu an {mevcut} tane var. {kalan} ritüel sonra burada bir gün adı belirecek.':
    'This card looks for the weekday you rate yourself highest. A comparison needs at least {gereken} rituals; you have {mevcut}. After {kalan} more rituals a day name will appear here.',
  'Şimdilik hiçbir gün diğerlerinden ayrışmıyor — puanların günlere neredeyse eşit dağılmış. Bir gün öne çıkarsa burada yazacak.':
    'No day stands out yet — your scores are spread almost evenly. If one pulls ahead it will show up here.',
  'KİLOMETRE TAŞLARI': 'MILESTONES',

  /* Rozetler */
  'İlk doz': 'First dose',
  'İlk ritüelini tamamla': 'Complete your first ritual',
  '7 gün': '7 days',
  '7 günlük seri': 'A 7-day streak',
  '21 gün': '21 days',
  '21 günlük seri': 'A 21-day streak',
  '50 ritüel': '50 rituals',
  'Toplam 50 ritüel': '50 rituals in total',
  'Şüpheci': 'Sceptic',
  'Kör testte 5 sahte ritüel tamamla': 'Complete 5 sham rituals in the blind test',
  '100 ritüel': '100 rituals',
  'Toplam 100 ritüel': '100 rituals in total',

  /* Gün ve ay adları */
  'Paz': 'Sun',
  'Pzt': 'Mon',
  'Sal': 'Tue',
  'Çar': 'Wed',
  'Per': 'Thu',
  'Cum': 'Fri',
  'Cmt': 'Sat',
  'Pazar': 'Sunday',
  'Pazartesi': 'Monday',
  'Salı': 'Tuesday',
  'Çarşamba': 'Wednesday',
  'Perşembe': 'Thursday',
  'Cuma': 'Friday',
  'Cumartesi': 'Saturday',
  'Ocak': 'January',
  'Şubat': 'February',
  'Mart': 'March',
  'Nisan': 'April',
  'Mayıs': 'May',
  'Haziran': 'June',
  'Temmuz': 'July',
  'Ağustos': 'August',
  'Eylül': 'September',
  'Ekim': 'October',
  'Kasım': 'November',
  'Aralık': 'December',

  /* ---------------------------------------------------------------- */
  /* Arşiv                                                             */
  /* ---------------------------------------------------------------- */
  '{adet} ritüel · hepsi telefonunda': '{adet} rituals · all on your phone',
  ' · kriz': ' · crisis',
  '🔒 {gizli} eski kayıt gizli. Ücretsiz kademe son {gun} günü gösterir — kayıtlar silinmedi, {plan} ile hepsi geri gelir.':
    '🔒 {gizli} older records are hidden. The free tier shows the last {gun} days — nothing was deleted, {plan} brings them all back.',
  'Henüz kayıt yok. İlk ritüelini tamamladığında burada birikmeye başlayacak.':
    'No records yet. They start piling up here once you finish your first ritual.',

  /* ---------------------------------------------------------------- */
  /* Ayarlar                                                           */
  /* ---------------------------------------------------------------- */
  'Ritüel verilerin yalnızca bu cihazda tutulur.':
    'Your ritual data is kept on this device only.',
  'HESAP': 'ACCOUNT',
  'Hesabınla giriş yap': 'Sign in with your account',
  'Apple ile giriş yapıldı': 'Signed in with Apple',
  'Google ile giriş yapıldı': 'Signed in with Google',
  'Google ile giriş yap': 'Sign in with Google',
  'Devam etmek için gerekli.': 'Required to continue.',
  'Oturumu kapat': 'Sign out',
  'Ritüel kayıtların telefonunda kalmaya devam eder.':
    'Your ritual records stay on your phone.',
  'Plan': 'Plan',
  'Tüm özellikler açık · {adet} içerik paketi':
    'Everything unlocked · {adet} content packs',
  'Tüm özellikler açık.': 'Everything unlocked.',
  'Dört hedef, temel formül havuzu, 7 günlük geçmiş.':
    'Four goals, the basic formula pool, 7 days of history.',
  'Ücretsiz': 'Free',
  'ADIN': 'YOUR NAME',
  'Adın': 'Your name',
  'Dört hedefin de günlük formülü açık. Günün formülü yalnızca seçtiğin hedeften ve tarihten üretilir; hedefi ana ekrandan da değiştirebilirsin.':
    'The daily formula for all four goals is open. Today’s formula is generated only from the goal you pick and the date; you can also switch goals from the home screen.',
  'Formülü belirleyen hedef': 'Goal that decides the formula',
  'Hesabından alındı; dilediğin gibi değiştirebilirsin.':
    'Taken from your account; change it however you like.',
  'GÖRÜNÜM': 'APPEARANCE',
  'Şafak': 'Dawn',
  'Sis': 'Mist',
  'Açık': 'Light',
  'Vurgu rengi üç temada da aynı; değişen zemin, yüzey ve metin tonları.':
    'The accent colour is the same in all three; the background, surface and text tones are what change.',
  'Dil': 'Language',
  'Sistem': 'System',
  '“Sistem” seçiliyken uygulama telefonunun dilini izler; Türkçe değilse İngilizce açılır.':
    'With “System” selected the app follows your phone’s language; anything other than Turkish opens in English.',
  'RİTÜEL': 'RITUAL',
  'Ses seviyesi': 'Sound level',
  'Kapalı': 'Off',
  'Kısık': 'Quiet',
  'Normal': 'Normal',
  'Yüksek': 'Loud',
  'Doz': 'Dose',
  'Tek doz': 'Single dose',
  'Çift doz': 'Double dose',
  'Çift doz adım sürelerini ikiye katlar. Dozu artırmanın ölçülmüş bir etkisi yok — sadece daha uzun sürüyor.':
    'A double dose doubles each step’s length. Raising the dose has no measured effect — it just takes longer.',
  'Kör test': 'Blind test',
  "Bazı günler ritüel yerine eşit süreli bir bekleme gelir. Hangi gün olduğu ancak bittikten sonra söylenir; puanlar İstatistik'te karşılaştırılır.":
    'On some days you get an equally long wait instead of the ritual. Which day it was is revealed only afterwards; the scores are compared under Stats.',
  'Titreşimli geri bildirim': 'Haptic feedback',
  'Adım geçişlerinde ve butonlarda hafif titreşim.':
    'A light vibration on step changes and buttons.',
  'Günlük hatırlatıcı': 'Daily reminder',
  'Her gün {saat}': 'Every day at {saat}',
  'Hatırlatma saati': 'Reminder time',
  'Dokun ve istediğin saati seç.': 'Tap and pick any time you like.',
  'Ayarları aç': 'Open Settings',
  'Bildirim izni yok': 'No notification permission',
  'Hatırlatıcı için telefon ayarlarından bildirimlere izin vermen gerekiyor.':
    'You need to allow notifications in your phone settings for the reminder.',
  'Hatırlatıcı kurulamadı': 'Could not set the reminder',
  'Expo Go bazı bildirim özelliklerini kısıtlıyor. Kendi derlemende sorunsuz çalışır.':
    'Expo Go restricts some notification features. It works fine in your own build.',
  'Bugünün formülü hazır': 'Today’s formula is ready',
  'Hâlâ plasebo. Yine de iki dakikanı ayır.':
    'Still a placebo. Give it two minutes anyway.',
  'VERİ': 'DATA',
  'Hesabı ve tüm verileri sil': 'Delete account and all data',
  'Cihazdaki her kayıt silinir. Sunucu olmadığı için başka bir yerde kopyası yoktur.':
    'Every record on the device is deleted. There is no server, so no copy exists anywhere else.',
  'Hesap ve veriler silinsin mi?': 'Delete account and data?',
  'Hesap bağlantın, adın, hedeflerin, serin, ayarların ve tüm ritüel kayıtların telefonundan silinir. Sunucuda kopyası yok. Geri alınamaz.':
    'Your Google account link, name, goals, streak, settings and all ritual records are deleted from your phone. There is no copy on a server. This cannot be undone.',
  'YASAL': 'LEGAL',
  'Gizlilik politikası': 'Privacy policy',
  'Uygulama içinde okunur; internet gerekmez.':
    'Readable inside the app; no internet needed.',
  'Hesap ve veri silme': 'Account and data deletion',
  'Silme adımlarının açıklaması.': 'An explanation of the deletion steps.',
  '⚗️ Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.':
    '⚗️ Placebo is not a treatment and does not replace any medical support.',

  /* ---------------------------------------------------------------- */
  /* Planlar ve paketler                                               */
  /* ---------------------------------------------------------------- */
  'Premium daha fazla içerik açar. Etkiyi değiştirmez — çünkü değiştirecek bir etki yok.':
    'Premium unlocks more content. It does not change the effect — because there is no effect to change.',
  'Freemium': 'Freemium',
  'Premium': 'Premium',
  'Başlangıç için yeterli.': 'Enough to begin with.',
  'Uygulamanın tamamı.': 'The whole app.',
  'Dört hedefin her biri için günde 1 formül': '1 formula a day for each of the four goals',
  'Aynı formülü sınırsız tekrar': 'Unlimited replays of the same formula',
  'Temel formül havuzu': 'Basic formula pool',
  '7 günlük geçmiş': '7 days of history',
  'Günlük hatırlatıcı ve kör test': 'Daily reminder and blind test',
  'Sınırsız formül üretimi (kriz modu)': 'Unlimited formula generation (crisis mode)',
  'Gelişmiş formül havuzu': 'Extended formula pool',
  'Tüm geçmiş': 'Full history',
  'Çift doz — ritüel süresini kendin ayarla': 'Double dose — set the ritual length yourself',
  'İçerik paketleri': 'Content packs',
  'Şu anki planın': 'Your current plan',
  'Premium’a geç': 'Go Premium',
  'Bekle…': 'Wait…',
  'Tamam': 'Done',
  'Şu an değil': 'Not right now',
  'Geri yüklenecek satın alma bulunamadı.': 'No purchases found to restore.',
  'İÇERİK PAKETLERİ': 'CONTENT PACKS',
  'Tek seferlik, aboneliğe gerek yok. Bir paket, günün formülünün seçildiği havuza yeni renk, ses, nefes tekniği, kelime ve bulgu ekler — mevcut içeriğin yerine geçmez, üstüne biner. Yani paket alınca ritüel değişmez; formüllerde çıkabilecek seçenek sayısı artar. Formülünde paketten bir öğe çıktığında ana ekrandaki kartta adının yanında paketin adı yazar.':
    'One-off, no subscription needed. A pack adds new colours, sounds, breathing patterns, words and findings to the pool today’s formula is drawn from — it adds to the existing content rather than replacing it. So buying a pack does not change the ritual; it widens the range of what can turn up. When an item from a pack appears in your formula, the pack’s name is shown next to it on the home card.',
  'Bu içerik havuzunda; günün formülü artık bunların arasından da seçiliyor.':
    'This content is in the pool; today’s formula is now drawn from these too.',
  'Sende': 'Owned',
  '{n} renk': '{n} colours',
  '{n} ses': '{n} sounds',
  '{n} nefes': '{n} breaths',
  '{n} kelime': '{n} words',
  '{n} bulgu': '{n} findings',
  'Satın alımları geri yükle': 'Restore purchases',
  '⚗️ Premium daha çok içerik verir, daha çok etki değil. Etki zaten yok.':
    '⚗️ Premium gives you more content, not more effect. There is no effect anyway.',
  '⚗️ Ücretsiz kademe de tam bir ritüel çalıştırır. Premium yalnızca çeşit ekler.':
    '⚗️ The free tier runs a complete ritual too. Premium only adds variety.',
  'Sınav odak paketi': 'Exam focus pack',
  'Sınav': 'Exam',
  'Uzun oturumlar için tasarlanmış renkler, sesler ve kelimeler.':
    'Colours, sounds and words designed for long sessions.',
  'Uyku paketi': 'Sleep pack',
  'Yavaşlatan tonlar ve uzun nefes turları.':
    'Slowing tones and long breathing rounds.',
  'Kaygı paketi': 'Anxiety pack',
  'Kısa, sık ve yere basan bir ritüel dili.':
    'A short, frequent, grounded ritual language.',

  /* ---------------------------------------------------------------- */
  /* Nasıl çalışır                                                     */
  /* ---------------------------------------------------------------- */
  'Kısa cevap: çalışmıyor. Uzun cevap aşağıda.':
    'Short answer: it does not. The long answer is below.',
  'Açık etiketli plasebo nedir?': 'What is an open-label placebo?',
  'Katılımcılara "bu bir plasebo" denildiği halde etkinin ortaya çıktığı çalışma türüne açık etiketli plasebo deniyor. Harvard Medical School bünyesindeki Program in Placebo Studies bu alandaki çalışmalarıyla biliniyor.':
    'Studies in which an effect appears even though participants are told outright “this is a placebo” are called open-label placebo. The Program in Placebo Studies at Harvard Medical School is known for work in this field.',
  'Plasebo ne yapar?': 'What does the placebo do?',
  'Ritüelin kendisi bir çerçeve kurar: durursun, bir şeye bakarsın, nefesini sayarsın. Uygulama bunun ötesinde bir şey iddia etmiyor.':
    'The ritual itself builds a frame: you stop, you look at something, you count your breath. The app claims nothing beyond that.',
  'Uygulama ne yapmaz?': 'What does the app not do?',
  'Plasebo bir tedavi değildir, hiçbir şeyi iyileştirmez ve hiçbir tıbbi desteğin yerine geçmez. Bir rahatsızlığın varsa hekimine danış.':
    'Placebo is not a treatment, it cures nothing and replaces no medical support. If something is wrong, talk to your doctor.',
  'Formül nereden geliyor?': 'Where does the formula come from?',
  'İki girdi var: günün tarihi ve seçtiğin aktif hedef. Tarihin karakterleri sayıya çevrilip toplanır, hedefin karakterleri de eklenir; çıkan tek sayı havuzlardan renk, ses, nefes tekniği, kelime ve o günkü uydurma bulguyu seçer. Hedef ayrıca adım sırasını belirler — kaygıda nefes başa geçer, uykuda ses başa geçer. Bilimsel bir hesap değil, sadece deterministik: aynı gün + aynı hedef her zaman aynı formülü verir.':
    'There are two inputs: today’s date and your active goal. The characters of the date are turned into numbers and summed, the goal’s characters are added, and the single number that comes out picks the colour, sound, breathing pattern, word and the day’s made-up finding from the pools. The goal also sets the step order — breath comes first for anxiety, sound first for sleep. It is not a scientific calculation, merely deterministic: the same day plus the same goal always gives the same formula.',
  'Hedefi değiştirince ne oluyor?': 'What happens when I change the goal?',
  'Dört hedefin (odak, uyku, kaygı, enerji) her biri için her gün ayrı bir formül üretilir ve dördü de her zaman açıktır. Ana ekrandaki şeritten birine dokunduğunda o hedefin bugünkü formülü gelir; istediğin kadar geçiş yapabilir, aynı formülü istediğin kadar tekrar oynatabilirsin.':
    'Each of the four goals (focus, sleep, anxiety, energy) gets its own formula every day, and all four are always open. Tapping one in the strip on the home screen brings up that goal’s formula for today; you can switch as often as you like and replay the same formula as many times as you like.',
  'Kör test nedir?': 'What is the blind test?',
  'Ayarlardan açarsan bazı günler sana renk, ses ya da nefes verilmez — sadece aynı süre beklersin. Hangi günün sahte olduğu ancak ritüel bittikten sonra söylenir. İstatistik ekranı gerçek ve sahte günlerin puan ortalamalarını karşılaştırır. Aradaki fark küçük çıkarsa bu da bir sonuçtur.':
    'If you switch it on in settings, on some days you get no colour, sound or breathing — you simply wait for the same length of time. Which day was the sham one is revealed only after the ritual ends. The Stats screen compares the score averages of real and sham days. If the difference turns out small, that is a result too.',
  'Nocebo: ters yönü de var': 'Nocebo: it runs the other way too',
  'Beklenti iki yönlü çalışır. Bir şeyin sana kötü geleceğini düşünmek de gerçek şikâyet üretebilir; buna nocebo deniyor. Bu yüzden burada hiçbir şey "kötü gün" olarak etiketlenmiyor ve düşük puan bir başarısızlık gibi sunulmuyor.':
    'Expectation works in both directions. Believing something will harm you can produce real complaints; that is called nocebo. This is why nothing here is labelled a “bad day” and a low score is never presented as a failure.',
  'Verilerim nerede?': 'Where is my data?',
  'Her şey telefonunda, yerel depolamada duruyor. Sunucu yok, hesap yok, paylaşım yok.':
    'Everything sits in local storage on your phone. No server, no database, no sharing.',
  'Ritüel geçmişin, puanların ve ölçümlerin telefonunda, yerel depolamada duruyor — sunucuya gönderilmiyor. Uygulamaya giriş için bir Google ya da Apple hesabı kullanılıyor; bu hesap yalnızca kimliğini doğrulamak için, ritüel verilerin oraya yüklenmiyor.':
    'Your ritual history, ratings and measurements sit in local storage on your phone — they are not sent to a server. A Google or Apple account is used to sign in; that account only verifies who you are, your ritual data is not uploaded to it.',
  'Yüz ve nefes analizi ne yapıyor?': 'What do the face and breath analyses do?',
  'İki isteğe bağlı ölçüm var. Birincisi: durum bilgisi ekranında bir fotoğraf çekersen, telefonunda çalışan bir yapay zeka modeli yüz ifadeni yedi duyguya dağıtıyor ve reçeten buna göre yazılıyor. İkincisi: nefes adımında mikrofon, nefes verişlerinin ritmini dinleyip ne kadar düzenli olduğunu ölçüyor. İkisi de tamamen isteğe bağlı; kullanmazsan akış aynı şekilde işler.':
    'There are two optional measurements. First: if you take a photo on the check-in screen, an AI model running on your phone distributes your expression across seven emotions and your prescription is written from that. Second: during the breathing step the microphone listens to the rhythm of your exhales and measures how regular it is. Both are entirely optional; the flow works the same if you skip them.',
  'Bu analizler ne kadar güvenilir?': 'How reliable are these analyses?',
  'Yüz modeli AffectNet adlı bir veri kümesiyle eğitildi ve tek bir kareden tahmin yapıyor — ışık, açı ve ifadenin belirginliği sonucu ciddi biçimde değiştirir; klinik bir teşhis değil. Nefes ölçümü ise ses seviyesinin ritmine bakar, nefes duyulmayacak kadar sessizse ya da ortamda başka ses varsa sayı uydurmak yerine "sinyal yakalanamadı" der. İkisi de kendi puanının yerine geçmez, yanına konur.':
    'The face model was trained on a dataset called AffectNet and predicts from a single frame — lighting, angle and how pronounced the expression is change the result considerably; it is not a clinical diagnosis. The breath measurement looks at the rhythm of the sound level, and when breathing is too quiet to hear or other sounds are present it says "no signal captured" instead of inventing a number. Neither replaces your own rating; they sit next to it.',
  'Fotoğrafım ve sesim nereye gidiyor?': 'Where do my photo and audio go?',
  'Hiçbir yere. Fotoğraf ve ses telefonun içinde işlenir, buluta gönderilmez ve saklanmaz; yalnızca çıkan sayı seansın kaydına yazılır. Model de uygulamanın içinde gömülü, çalışmak için internet gerekmiyor.':
    'Nowhere. The photo and audio are processed inside your phone, never uploaded to a cloud and never stored; only the resulting number is written to the session record. The model is embedded in the app itself, so no internet is needed for it to work.',
  'Gerçek çalışmalar': 'Real studies',
  'Uygulamanın içindeki "bulgular" uydurma. Aşağıdakiler değil — açık etiketli plasebo literatüründen gerçek çalışmalar. Her birinin altında neyi göstermediği de yazıyor; bir çalışmayı olduğundan güçlü anlatmak, bu uygulamanın tüm iddiasını çürütürdü.':
    'The “findings” inside the app are invented. These are not — they are real studies from the open-label placebo literature. Under each one you will also find what it does not show; overstating a study would undo the app’s entire point.',
  'Göstermediği:': 'What it does not show:',
  'Program in Placebo Studies': 'Program in Placebo Studies',
  'Huzursuz bağırsak sendromunda açık etiketli plasebo':
    'Open-label placebo in irritable bowel syndrome',
  'Kaptchuk ve ark. · PLoS ONE · 2010 · 80 katılımcı · 3 hafta':
    'Kaptchuk et al. · PLoS ONE · 2010 · 80 participants · 3 weeks',
  'Alanın başlangıç noktası sayılan çalışma. Katılımcılara verilen hapın "etkin maddesi olmayan bir plasebo" olduğu açıkça söylendi; üstelik plasebonun nasıl işlediği de anlatıldı. Üç hafta sonunda bu grubun belirti puanları, hiçbir şey almayan bekleme listesi grubuna göre belirgin biçimde daha iyiydi.':
    'The study considered the field’s starting point. Participants were told outright that the pill was “a placebo with no active ingredient”, and were even told how placebos are thought to work. After three weeks their symptom scores were markedly better than those of a waiting-list group that took nothing.',
  'Karşılaştırma "hap yok" grubuyla yapıldı; yani ritüelin, ilgi görmenin ve beklentinin payı ayrıştırılamıyor.':
    'The comparison was against a “no pill” group, so the share contributed by the ritual, the attention received and the expectation cannot be separated.',
  'Kronik bel ağrısında açık etiketli plasebo':
    'Open-label placebo in chronic low back pain',
  'Carvalho ve ark. · PAIN · 2016 · 97 katılımcı · 3 hafta':
    'Carvalho et al. · PAIN · 2016 · 97 participants · 3 weeks',
  'Olağan tedavisine devam eden hastalara ek olarak, plasebo olduğu açıkça söylenen bir hap verildi. Üç hafta sonunda ağrı ve engellilik puanlarında yalnız olağan tedaviyi sürdüren gruba göre düşüş bildirildi. Aynı ekibin beş yıl sonraki takibi, hapı bırakanlarda etkinin sürmediğini gösterdi.':
    'Patients continuing their usual care were additionally given a pill openly described as a placebo. After three weeks, pain and disability scores were reported to drop compared with the group on usual care alone. The same team’s five-year follow-up showed the effect did not persist in those who stopped taking the pill.',
  'Ağrı öz bildirimle ölçüldü ve katılımcılar hangi grupta olduklarını biliyordu; kör bir tasarım değil.':
    'Pain was self-reported and participants knew which group they were in; this was not a blinded design.',
  'Kronik bel ağrısında yineleme':
    'A replication in chronic low back pain',
  'Kleine-Borgmann ve ark. · PAIN · 2019 · 127 katılımcı · 3 hafta':
    'Kleine-Borgmann et al. · PAIN · 2019 · 127 participants · 3 weeks',
  "Bağımsız bir ekip, Almanya'da benzer bir tasarımı tekrarladı ve ağrı puanlarında küçük ama istatistiksel olarak anlamlı bir iyileşme buldu. Bir bulgunun başka bir ülkede, başka bir ekipçe tekrarlanabilmesi, tek bir çalışmadan çok daha değerlidir.":
    'An independent team repeated a similar design in Germany and found a small but statistically significant improvement in pain scores. A finding that can be repeated in another country by another team is worth far more than a single study.',
  'Etki büyüklüğü küçüktü ve işlev/hareket ölçütlerinde anlamlı bir fark çıkmadı.':
    'The effect size was small and no significant difference appeared in function or mobility measures.',
  'Alerjik nezlede açık etiketli plasebo':
    'Open-label placebo in allergic rhinitis',
  'Schaefer ve ark. · PLoS ONE · 2016 (ve 2018 yinelemesi)':
    'Schaefer et al. · PLoS ONE · 2016 (with a 2018 replication)',
  'Mevsimsel alerji belirtileri olan katılımcılara, plasebo olduğu söylenen bir hap verildi. Belirti şiddetinde tedavi görmeyen gruba kıyasla azalma bildirildi; ikinci çalışmada plasebonun mantığı anlatıldığında etkinin daha belirgin olduğu görüldü.':
    'Participants with seasonal allergy symptoms were given a pill described as a placebo. A reduction in symptom severity was reported compared with an untreated group; in the second study the effect was clearer when the rationale for placebos was explained.',
  'Katılımcı sayısı azdı ve ölçüm tamamen öz bildirime dayanıyordu; alerjinin kendisi ölçülmedi.':
    'The samples were small and the measures were entirely self-reported; the allergy itself was not measured.',
  'Kanser sonrası yorgunlukta açık etiketli plasebo':
    'Open-label placebo for cancer-related fatigue',
  'Hoenemeyer ve ark. · Scientific Reports · 2018 · 74 katılımcı':
    'Hoenemeyer et al. · Scientific Reports · 2018 · 74 participants',
  'Kanser tedavisi bitmiş ama yorgunluğu süren kişilerde, plasebo olduğu açıkça söylenen hap üç hafta kullanıldı; yorgunluk puanlarında ve yorgunluğun günlük yaşamı etkileme derecesinde iyileşme bildirildi. Hapı bıraktıktan sonra da fark bir süre korundu.':
    'Survivors whose cancer treatment had ended but whose fatigue persisted took an openly labelled placebo for three weeks; improvements were reported in fatigue scores and in how much fatigue disrupted daily life. The difference held for a while even after the pill was stopped.',
  'Yorgunluk öznel bir ölçüt; ayrıca katılımcılar çalışmaya gönüllü olarak katıldı, yani beklentileri baştan yüksek olabilir.':
    'Fatigue is a subjective measure, and participants volunteered for the study, so their expectations may have been high to begin with.',
  'Etiketin kendisi bir etken: migren çalışması':
    'The label itself is a factor: the migraine study',
  'Kam-Hansen ve ark. · Science Translational Medicine · 2014 · 66 hasta, 459 atak':
    'Kam-Hansen et al. · Science Translational Medicine · 2014 · 66 patients, 459 attacks',
  'Aynı hap kutusuna farklı etiketler konarak denendi. "Plasebo" yazılı bir plasebo bile ağrıyı azaltırken, gerçek ilacın "plasebo" etiketiyle verilmesi etkisini düşürdü. Yani bir tedavinin nasıl sunulduğu, ne olduğu kadar sonuca karışıyor.':
    'The same pill envelope was tested under different labels. A placebo labelled “placebo” still reduced pain, while giving the real drug under a “placebo” label reduced its effect. How a treatment is presented enters the result alongside what it actually is.',
  'Sonuç ilacın plasebo olduğunu değil, beklentinin ilacın etkisine eklendiğini gösterir.':
    'The result does not show the drug is a placebo; it shows expectation adds to the drug’s effect.',
  'Toplu değerlendirme: ne kadar, ne için?':
    'Taken together: how much, and for what?',
  'Meta-analizler · 2021 ve sonrası':
    'Meta-analyses · 2021 onwards',
  'Açık etiketli plasebo çalışmalarını bir araya getiren derlemeler, ağrı, yorgunluk, alerji ve bağırsak belirtileri gibi öz bildirimle ölçülen şikâyetlerde küçük–orta düzeyde bir etki bulur. Etki tutarlı ama küçüktür ve çalışmalar birbirine benzemez.':
    'Reviews pooling open-label placebo studies find a small-to-moderate effect on complaints measured by self-report — pain, fatigue, allergy and bowel symptoms. The effect is consistent but small, and the studies differ a lot from one another.',
  'Kan basıncı, kan şekeri, tümör boyutu gibi nesnel ölçütlerde bir yarar gösterilmiş değildir.':
    'No benefit has been shown on objective measures such as blood pressure, blood sugar or tumour size.',
  'Nocebo: beklentinin ters yönü':
    'Nocebo: expectation in reverse',
  'Barsky ve ark. · JAMA · 2002 · ve sonraki derlemeler':
    'Barsky et al. · JAMA · 2002 · and later reviews',
  'Kötü bir şey olacağı beklentisi, gerçek ve ölçülebilir şikâyet üretebilir: yan etki listesi okutulan plasebo gruplarında baş ağrısı, bulantı ve yorgunluk bildirimleri artar. Beklenti tek yönlü çalışmayan bir mekanizmadır.':
    'Expecting something bad can produce real, measurable complaints: placebo groups shown a list of side effects report more headaches, nausea and fatigue. Expectation is not a one-way mechanism.',
  'Bu yüzden bu uygulamada hiçbir gün "kötü" diye etiketlenmez ve düşük puan bir başarısızlık olarak sunulmaz.':
    'This is why no day in this app is labelled “bad” and a low score is never presented as a failure.',
  'Harvard Medical School / Beth Israel Deaconess Medical Center':
    'Harvard Medical School / Beth Israel Deaconess Medical Center',
  'Plasebo yanıtını inceleyen akademik program; yukarıdaki çalışmaların birçoğu bu çevreden çıktı. Uygulamanın "Harvard çalışması" diye andığı şey bu literatüre işaret eder — tek bir mucize çalışmaya değil.':
    'An academic programme studying the placebo response; many of the studies above came out of this circle. What the app calls “the Harvard study” points at this literature — not at one miracle study.',
  'Bir programın varlığı bir kanıt değildir; kanıt tek tek çalışmalardadır ve yukarıda sınırlarıyla duruyor.':
    'The existence of a programme is not evidence; the evidence is in the individual studies, and it stands above with its limits.',

  '⚗️ Bu ekran dahil her yerde aynı şeyi yazıyoruz: bu bir plasebo.':
    '⚗️ Everywhere, this screen included, we say the same thing: this is a placebo.',

  /* ---------------------------------------------------------------- */
  /* Renkler                                                           */
  /* ---------------------------------------------------------------- */
  'Gece Mavisi': 'Night Blue',
  'Mor Titreşim': 'Purple Vibration',
  'Yosun Nefesi': 'Moss Breath',
  'Altın Eşik': 'Golden Threshold',
  'Bakır Şafak': 'Copper Dawn',
  'Menekşe Sis': 'Violet Mist',
  'Kızıl Uyarı': 'Crimson Alert',
  'Buzul Işığı': 'Glacier Light',
  'Derin Akım': 'Deep Current',
  'Islak Çimen': 'Wet Grass',
  'Kum Saati': 'Hourglass',
  'Nabız Pembesi': 'Pulse Pink',
  'Yağmur Öncesi': 'Before Rain',
  'Sığ Tropik': 'Shallow Tropic',
  'Uyku Moru': 'Sleep Purple',
  'Erken Uyanış': 'Early Waking',
  'Mürekkep Mavisi': 'Ink Blue',
  'Salon Yeşili': 'Hall Green',
  'Lamba Sarısı': 'Lamp Yellow',
  'Gece Yarısı': 'Midnight',
  'Lavanta Karanlığı': 'Lavender Dark',
  'Sönmüş Kömür': 'Spent Coal',
  'Sığ Su': 'Shallow Water',
  'Kurşun Sis': 'Lead Mist',
  'Solmuş Gül': 'Faded Rose',

  /* ---------------------------------------------------------------- */
  /* Sesler                                                            */
  /* ---------------------------------------------------------------- */
  '40Hz Gama Dalgası': '40Hz Gamma Wave',
  '528Hz Solfeggio': '528Hz Solfeggio',
  'Kahverengi Gürültü': 'Brown Noise',
  'Binaural Alfa (10Hz)': 'Binaural Alpha (10Hz)',
  'Tibet Kâsesi': 'Tibetan Bowl',
  'Beyaz Gürültü': 'White Noise',
  '432Hz Verdi Akordu': '432Hz Verdi Tuning',
  'Pembe Gürültü': 'Pink Noise',
  'Yağmur Katmanı': 'Rain Layer',
  'Binaural Teta (6Hz)': 'Binaural Theta (6Hz)',
  'Derin Uğultu (110Hz)': 'Deep Drone (110Hz)',
  'Kristal Çan': 'Crystal Chime',
  'Kahverengi Gürültü (uzun oturum)': 'Brown Noise (long session)',
  '40Hz Gama (uzun oturum)': '40Hz Gamma (long session)',
  'Pembe Gürültü (çalışma)': 'Pink Noise (studying)',
  'Kahverengi Gürültü (gece)': 'Brown Noise (night)',
  'Tibet Kâsesi (sönümlü)': 'Tibetan Bowl (damped)',
  'Yağmur Katmanı (gece)': 'Rain Layer (night)',
  'Derin Uğultu (gece)': 'Deep Drone (night)',
  'Tibet Kâsesi (kısa)': 'Tibetan Bowl (short)',
  'Binaural Alfa (kısa)': 'Binaural Alpha (short)',
  'Kristal Çan (kısa)': 'Crystal Chime (short)',

  /* ---------------------------------------------------------------- */
  /* Nefes teknikleri                                                  */
  /* ---------------------------------------------------------------- */
  '4-7-8 Tekniği': '4-7-8 Technique',
  'Kutu Nefesi': 'Box Breathing',
  'Üçlü Denge': 'Triple Balance',
  'Uyumlu Nefes': 'Coherent Breathing',
  'Fizyolojik İç Çekiş': 'Physiological Sigh',
  'Uzun Veriş': 'Extended Exhale',
  'Rezonans Nefesi': 'Resonant Breathing',
  'Üçgen Nefes': 'Triangle Breathing',
  'Dalga Nefesi': 'Wave Breathing',
  'Kutu Nefesi (uzatılmış)': 'Box Breathing (extended)',
  'Rezonans Nefesi (oturum arası)': 'Resonant Breathing (between sessions)',
  '4-7-8 (uzatılmış)': '4-7-8 (extended)',
  'Uyumlu Nefes (gece)': 'Coherent Breathing (night)',
  'Uzun Veriş (gece)': 'Extended Exhale (night)',
  'Fizyolojik İç Çekiş (sık)': 'Physiological Sigh (frequent)',
  'Üçlü Denge (kısa)': 'Triple Balance (short)',
  'Dalga Nefesi (kriz)': 'Wave Breathing (crisis)',

  /* ---------------------------------------------------------------- */
  /* Kelimeler                                                         */
  /* ---------------------------------------------------------------- */
  'AKIŞ': 'FLOW',
  'ODAK': 'FOCUS',
  'SÜKUNET': 'CALM',
  'NİYET': 'INTENT',
  'ŞİMDİ': 'NOW',
  'VAROLUŞ': 'BEING',
  'IŞIK': 'LIGHT',
  'DENGE': 'BALANCE',
  'GÜÇ': 'STRENGTH',
  'NEFES': 'BREATH',
  'EŞİK': 'THRESHOLD',
  'DURULUK': 'STILLNESS',
  'KÖK': 'ROOT',
  'AÇIKLIK': 'CLARITY',
  'SESSİZLİK': 'SILENCE',
  'YÖN': 'DIRECTION',
  'TEMAS': 'CONTACT',
  'GENİŞLİK': 'SPACE',
  'SABIR': 'PATIENCE',
  'İZ': 'TRACE',
  'ZEMİN': 'GROUND',
  'AKIL': 'MIND',
  'YAVAŞLIK': 'SLOWNESS',
  'ARALIK': 'INTERVAL',
  'TAZE': 'FRESH',
  'DÜĞÜM': 'KNOT',
  'BAŞLANGIÇ': 'BEGINNING',
  'SICAKLIK': 'WARMTH',
  'BOŞLUK': 'EMPTINESS',
  'DEVAM': 'ONWARD',
  'HAFİFLİK': 'LIGHTNESS',
  'KIYI': 'SHORE',
  'UYANIŞ': 'AWAKENING',
  'SIRA': 'ORDER',
  'TOPARLAN': 'GATHER',
  'DERİNLİK': 'DEPTH',
  'SAYFA': 'PAGE',
  'İSTİKRAR': 'STEADINESS',
  'TEKRAR': 'AGAIN',
  'BİTİR': 'FINISH',
  'AĞIRLIK': 'WEIGHT',
  'YAVAŞ': 'SLOW',
  'BIRAK': 'LET GO',
  'KAPAN': 'CLOSE',
  'DİNLEN': 'REST',
  'GEÇER': 'IT PASSES',
  'BURADA': 'HERE',
  'TUT': 'HOLD',
  'GÜVEN': 'TRUST',

  /* ---------------------------------------------------------------- */
  /* Uydurma bulgular                                                  */
  /* ---------------------------------------------------------------- */
  '⚗️ 40Hz gama dalgaları prefrontal korteksi %23 aktive eder':
    '⚗️ 40Hz gamma waves activate the prefrontal cortex by 23%',
  '⚗️ Mavi tonlara 17 saniye bakmak dikkat süresini %31 uzatır':
    '⚗️ Looking at blue tones for 17 seconds extends attention span by 31%',
  '⚗️ 4-7-8 nefesi vagal tonu 2.4 kat yükseltir':
    '⚗️ The 4-7-8 breath raises vagal tone 2.4-fold',
  '⚗️ 528Hz frekansı hücresel rezonansı %19 senkronize eder':
    '⚗️ The 528Hz frequency synchronises cellular resonance by 19%',
  '⚗️ Kahverengi gürültü arka plan düşünce sayısını %42 azaltır':
    '⚗️ Brown noise reduces background thoughts by 42%',
  '⚗️ Binaural alfa dalgaları hemisfer eşzamanlılığını %37 artırır':
    '⚗️ Binaural alpha waves increase hemispheric synchrony by 37%',
  '⚗️ Tibet kâsesi harmonikleri kalp ritmi değişkenliğini %28 dengeler':
    '⚗️ Tibetan bowl harmonics balance heart rate variability by 28%',
  '⚗️ Fizyolojik iç çekiş alveol geri kazanımını %15 hızlandırır':
    '⚗️ The physiological sigh speeds alveolar recovery by 15%',
  '⚗️ Kutu nefesi çalışma belleği kapasitesini %26 genişletir':
    '⚗️ Box breathing widens working memory capacity by 26%',
  '⚗️ Tek bir kelimeye odaklanmak zihinsel gürültüyü %33 bastırır':
    '⚗️ Focusing on a single word suppresses mental noise by 33%',
  '⚗️ Uyumlu nefes 5.5 saniyede kalp-solunum uyumunu %48 yükseltir':
    '⚗️ Coherent breathing at 5.5 seconds raises cardio-respiratory coupling by 48%',
  '⚗️ Ritüel tekrarı 21. günde bazal farkındalığı %12 yeniden kalibre eder':
    '⚗️ Repeating the ritual recalibrates baseline awareness by 12% on day 21',
  '⚗️ 432Hz akordu iç kulak mikro-titreşimini %17 yumuşatır':
    '⚗️ The 432Hz tuning softens inner-ear micro-vibration by 17%',
  '⚗️ Pembe gürültü hafıza pekiştirme penceresini %21 uzatır':
    '⚗️ Pink noise extends the memory consolidation window by 21%',
  '⚗️ Yağmur dokusu zihinsel gezinme sıklığını %35 seyreltir':
    '⚗️ Rain texture thins mind-wandering frequency by 35%',
  '⚗️ Binaural teta yaratıcı çağrışım hızını %29 artırır':
    '⚗️ Binaural theta increases creative association speed by 29%',
  '⚗️ 110Hz derin uğultu kas gerilim eşiğini %14 aşağı çeker':
    '⚗️ A 110Hz deep drone lowers the muscle tension threshold by 14%',
  '⚗️ Kristal çan tınısı dikkat sıfırlamasını 1.8 kat hızlandırır':
    '⚗️ Crystal chime timbre speeds attention reset 1.8-fold',
  '⚗️ Uzun veriş nefesi parasempatik geçişi %26 öne alır':
    '⚗️ The extended exhale brings the parasympathetic shift 26% forward',
  '⚗️ Rezonans nefesi baroreseptör hassasiyetini %33 senkronize eder':
    '⚗️ Resonant breathing synchronises baroreceptor sensitivity by 33%',
  '⚗️ Üçgen nefes zihinsel yük dağılımını %19 eşitler':
    '⚗️ Triangle breathing evens out mental load distribution by 19%',
  '⚗️ Dalga nefesi solunum düzensizliğini %24 törpüler':
    '⚗️ Wave breathing files down respiratory irregularity by 24%',
  '⚗️ Sabit bir renge bakarken göz kırpma aralığı %38 uzar':
    '⚗️ Blink intervals lengthen by 38% while staring at a fixed colour',
  '⚗️ Aynı saatte tekrarlanan ritüel beklenti tepkisini %44 güçlendirir':
    '⚗️ A ritual repeated at the same hour strengthens the expectancy response by 44%',
  '⚗️ Ritüel sonrası 10 saniyelik sessizlik etkiyi %16 "sabitler"':
    '⚗️ Ten seconds of silence after the ritual “fixes” the effect by 16%',
  '⚗️ Kendi seçtiğin kelime, verilen kelimeye göre %27 daha çok tutunur':
    '⚗️ A word you choose sticks 27% better than one you are given',
  '⚗️ Beyaz gürültü işitsel dikkat dağınıklığını %31 maskeler':
    '⚗️ White noise masks auditory distraction by 31%',
  '⚗️ Üçlü denge nefesi solunum ritmini %22 düzleştirir':
    '⚗️ Triple balance breathing flattens the respiratory rhythm by 22%',
  '⚗️ Doygun tonlara 17 saniye bakmak dikkat süresini %31 uzatır':
    '⚗️ Looking at saturated tones for 17 seconds extends attention span by 31%',
  '⚗️ Renk sabitlemesi zihinsel konu değiştirme maliyetini %21 düşürür':
    '⚗️ Colour fixation lowers the cost of mental task-switching by 21%',
  '⚗️ Tek bir ışık kaynağına odaklanmak görsel gürültüyü %27 bastırır':
    '⚗️ Focusing on a single light source suppresses visual noise by 27%',
  '⚗️ Uzun renk bakışı uykuya geçiş süresini %18 kısaltır':
    '⚗️ A long colour gaze shortens sleep onset by 18%',
  '⚗️ Ekranda tek bir tona kilitlenmek zihinsel uyarılmayı %24 düşürür':
    '⚗️ Locking onto a single tone on screen lowers mental arousal by 24%',
  '⚗️ Tek bir renge bakmak tetikte kalma tepkisini %26 yumuşatır':
    '⚗️ Looking at one colour softens the vigilance response by 26%',
  '⚗️ Görüş alanını daraltmak tehdit taramasını %22 seyreltir':
    '⚗️ Narrowing the visual field thins threat scanning by 22%',
  '⚗️ Sabit bakış, hızlanmış düşünce akışını %29 yavaşlatır':
    '⚗️ A fixed gaze slows accelerated thought flow by 29%',
  '⚗️ Parlak tonlara bakmak öznel uyanıklığı %23 yukarı çeker':
    '⚗️ Looking at bright tones pulls subjective alertness up by 23%',
  '⚗️ Sıcak renkler harekete geçme eşiğini %19 aşağı çeker':
    '⚗️ Warm colours lower the threshold for taking action by 19%',
  '⚗️ Göz açıklığının artması algılanan enerjiyi %16 yükseltir':
    '⚗️ Wider eye opening raises perceived energy by 16%',
  '⚗️ Oturum başına tek kelime seçmek konu değiştirmeyi %21 azaltır':
    '⚗️ Picking one word per session reduces task-switching by 21%',
  '⚗️ Tek bir kelimeyi tekrarlamak zihinsel gezinmeyi %27 seyreltir':
    '⚗️ Repeating a single word thins mind-wandering by 27%',
  '⚗️ Gece okunan tek kelime, uykuya geçişte zihni %15 sadeleştirir':
    '⚗️ One word read at night simplifies the mind at sleep onset by 15%',
  '⚗️ Bir kelimeye tutunmak düşünce döngüsünü %24 kısaltır':
    '⚗️ Holding onto a word shortens the thought loop by 24%',
  '⚗️ Kısa ve emir kipli kelimeler harekete geçişi %18 hızlandırır':
    '⚗️ Short imperative words speed up getting started by 18%',
  '⚗️ Güne tek kelimeyle başlamak niyet sürekliliğini %22 artırır':
    '⚗️ Starting the day with one word increases intention continuity by 22%',
  '⚗️ Uzun oturumlarda 24 saniyelik renk sabitlemesi dikkat düşüşünü %29 geciktirir':
    '⚗️ In long sessions a 24-second colour fixation delays attention decline by 29%',
  '⚗️ Kutu nefesinin 8 turu çalışma belleğini %34 taze tutar':
    '⚗️ Eight rounds of box breathing keep working memory 34% fresher',
  '⚗️ Oturum başına tek kelime seçmek konu değiştirme maliyetini %21 azaltır':
    '⚗️ Picking one word per session lowers task-switching cost by 21%',
  '⚗️ 30 saniyelik koyu renk maruziyeti uykuya geçiş süresini %26 kısaltır':
    '⚗️ Thirty seconds of dark colour exposure shortens sleep onset by 26%',
  '⚗️ 4-7-8 nefesinin 8 turu gece uyanmalarını %18 azaltır':
    '⚗️ Eight rounds of 4-7-8 breathing reduce night awakenings by 18%',
  '⚗️ 240 saniyelik kahverengi gürültü derin uyku oranını %22 yükseltir':
    '⚗️ Two hundred and forty seconds of brown noise raise deep sleep share by 22%',
  '⚗️ Fizyolojik iç çekişin 8 tekrarı akut gerilimi %31 düşürür':
    '⚗️ Eight repetitions of the physiological sigh drop acute tension by 31%',
  '⚗️ 12 saniyelik kısa renk sabitlemesi kaçınma dürtüsünü %24 zayıflatır':
    '⚗️ A short 12-second colour fixation weakens the urge to avoid by 24%',
  '⚗️ 45 saniyelik harmonik ses zemin hissini %27 pekiştirir':
    '⚗️ Forty-five seconds of harmonic sound reinforces the sense of ground by 27%',
  '⚗️ Plasebo etkisi aktif — Harvard çalışması: %62 iyileşme':
    '⚗️ Placebo effect active — Harvard study: 62% improvement',
  '⚗️ Bu adımın bilinen bir fizyolojik etkisi yok. Yine de sayılıyor.':
    '⚗️ This step has no known physiological effect. It still counts.',
  '⚗️ Açık etiketli plasebo: ne olduğunu bilmen etkiyi bozmuyor.':
    '⚗️ Open-label placebo: knowing what it is does not spoil the effect.',
  '⚗️ Hiçbir şey yapmıyoruz. Beraber yapıyoruz.':
    '⚗️ We are doing nothing. We are doing it together.',

  /* ---------------------------------------------------------------- */
  /* Yasal metinler                                                    */
  /* ---------------------------------------------------------------- */
  'Gizlilik Politikası': 'Privacy Policy',
  'Plasebo · Son güncelleme: 13 Ağustos 2026 · Paket adı: com.plasebo.app':
    'Placebo · Last updated: 13 August 2026 · Package name: com.plasebo.app',
  'Plasebo, günlük bir plasebo ritüeli sunan bir uygulamadır. Bu politika uygulamanın hangi verileri işlediğini açıklar. Kısa cevap: Plasebo’nun sunucusu yoktur ve ritüel verilerin cihazından hiçbir yere gönderilmez.':
    'Placebo is an app offering a daily placebo ritual. This policy explains what data the app processes. Short answer: Placebo has no server and your ritual data is never sent anywhere from your device.',
  '1. Veri sorumlusu': '1. Data controller',
  '2. İşlenen veriler': '2. Data processed',
  'Ad, e-posta adresi, profil fotoğrafı bağlantısı — Google hesabınla oturum açtığında Google’dan alınır, yalnızca cihazının yerel deposunda tutulur. Amacı: hesabını tanımak ve seni adınla selamlamak.':
    'Name, email address, profile picture link — received from Google when you sign in with your Google account and kept only in your device’s local storage. Purpose: recognising your account and greeting you by name.',
  'Adın, seçtiğin hedefler, ritüel kayıtların, puanların, notların, serin ve ayarların — uygulama içinde senin girdiğin bilgilerdir, yalnızca cihazının yerel deposunda tutulur. Amacı: geçmiş, istatistik ve hatırlatıcının çalışması.':
    'Your name, chosen goals, ritual records, scores, notes, streak and settings — information you enter in the app, kept only in your device’s local storage. Purpose: making history, statistics and the reminder work.',
  'Sunucuya gönderilen hiçbir veri yoktur. Plasebo’nun arka uç sunucusu, veritabanı veya hesap altyapısı bulunmaz. Uygulama silindiğinde bu verilerin tamamı cihazdan silinir.':
    'No data is sent to any server. Placebo has no backend server, database or account infrastructure. When the app is uninstalled, all of this data is removed from the device.',
  '3. Ağ bağlantıları': '3. Network connections',
  'Plasebo yalnızca iki durumda internete bağlanır:':
    'Placebo connects to the internet in only two situations:',
  'Google ile oturum açma. Google’ın kendi oturum açma ekranına yönlendirilirsin; bu, Google’ın gizlilik politikasına tabidir. Uygulama yalnızca “profile” ve “email” kapsamlarını ister.':
    'Signing in with Google. You are taken to Google’s own sign-in screen, which is subject to Google’s privacy policy. The app requests only the “profile” and “email” scopes.',
  'Profil bilgisinin okunması. Oturum açtıktan hemen sonra adın, e-postan ve profil fotoğrafı bağlantın bir kez okunur ve cihazına yazılır. Erişim anahtarı saklanmaz.':
    'Reading your profile. Right after sign-in your name, email and profile picture link are read once and written to your device. The access token is not stored.',
  '4. Analitik, reklam ve izleme yoktur': '4. No analytics, ads or tracking',
  'Plasebo’da analiz aracı, reklam ağı, çökme raporlama servisi veya üçüncü taraf izleme kiti bulunmaz. Reklam kimliği okunmaz. Verilerin kimseye satılmaz veya paylaşılmaz.':
    'Placebo contains no analytics tool, ad network, crash reporting service or third-party tracking kit. The advertising ID is not read. Your data is never sold or shared with anyone.',
  '5. İzinler': '5. Permissions',
  'Bildirimler — yalnızca Ayarlar’dan günlük hatırlatıcıyı açarsan istenir. Bildirimler cihazda zamanlanır; push sunucusu kullanılmaz.':
    'Notifications — requested only if you turn on the daily reminder in Settings. Notifications are scheduled on the device; no push server is used.',
  'İnternet — yalnızca Google ile oturum açma için.':
    'Internet — only for signing in with Google.',
  'Titreşim — dokunsal geri bildirim için; Ayarlar’dan kapatılabilir.':
    'Vibration — for haptic feedback; can be turned off in Settings.',
  'Uygulama mikrofona, kameraya, konuma, kişilere veya dosyalarına erişmez.':
    'The app does not access your microphone, camera, location, contacts or files.',
  '6. Verilerini silmek': '6. Deleting your data',
  'Ayarlar → Veri → “Hesabı ve tüm verileri sil” adımı; adını, hedeflerini, tüm ritüel kayıtlarını, ayarlarını ve kayıtlı Google hesap bilgilerini cihazından kalıcı olarak siler. Yalnızca oturumu kapatmak için Ayarlar → Hesap → Oturumu kapat yeterlidir.':
    'Settings → Data → “Delete account and all data” permanently removes your name, goals, all ritual records, settings and stored Google account details from your device. To only sign out, Settings → Account → Sign out is enough.',
  'Google hesabının Plasebo’ya verdiği erişimi dilediğin zaman myaccount.google.com/permissions adresinden kaldırabilirsin.':
    'You can revoke the access your Google account granted to Placebo at any time from myaccount.google.com/permissions.',
  '7. Çocuklar': '7. Children',
  'Plasebo çocuklara yönelik değildir ve 13 yaşın altındaki kullanıcılardan bilerek veri toplamaz.':
    'Placebo is not directed at children and does not knowingly collect data from users under 13.',
  '8. Sağlıkla ilgili uyarı': '8. Health warning',
  'Plasebo bir tıbbi cihaz değildir; tanı koymaz, tedavi etmez ve hiçbir tıbbi desteğin yerine geçmez. Uygulamanın sunduğu “formüller” bilinçli olarak plasebodur ve uygulama bunu her ekranda açıkça belirtir. Sağlığınla ilgili bir endişen varsa bir sağlık profesyoneline başvur.':
    'Placebo is not a medical device; it does not diagnose, does not treat and replaces no medical support. The “formulas” it offers are deliberately placebos and the app states this openly on every screen. If you have a health concern, consult a healthcare professional.',
  '9. Değişiklikler': '9. Changes',
  'Bu politika değişirse buradaki tarih güncellenir. Toplanan veri türlerini genişleten bir değişiklik olursa uygulama içinde bildirilir.':
    'If this policy changes, the date here is updated. Any change that widens the types of data collected will be announced inside the app.',
  'Plasebo — bilerek inan. Sorular için: niinova22@gmail.com':
    'Placebo — believe on purpose. Questions: niinova22@gmail.com',

  'Plasebo’nun sunucusu yoktur. Ritüel kayıtların, puanların, notların, ayarların ve Google hesabından okunan ad/e-posta/profil fotoğrafı bilgisi yalnızca kendi cihazında saklanır. Bu nedenle silme işlemi tamamen senin kontrolündedir ve anında tamamlanır.':
    'Placebo has no server. Your ritual records, scores, notes, settings and the name/email/profile picture read from your Google account are stored only on your own device. Deletion is therefore entirely under your control and completes instantly.',
  'Yol 1 — Uygulama içinden (önerilen)': 'Route 1 — From inside the app (recommended)',
  'Plasebo’yu aç.': 'Open Placebo.',
  'Ayarlar sekmesine geç.': 'Go to the Settings tab.',
  'Veri başlığı altında “Hesabı ve tüm verileri sil”e dokun.':
    'Under the Data heading, tap “Delete account and all data”.',
  'Onayla. Uygulama açılış ekranına döner ve hiçbir kayıt kalmaz.':
    'Confirm. The app returns to the opening screen and no record remains.',
  'Yalnızca Google bağlantısını kesmek istiyorsan Ayarlar → Hesap → Oturumu kapat yeterlidir; bu, kayıtlı hesap bilgilerini cihazdan siler ancak ritüel geçmişini korur.':
    'If you only want to disconnect Google, Settings → Account → Sign out is enough; it removes the stored account details from the device but keeps your ritual history.',
  'Yol 2 — Uygulamayı kaldırarak': 'Route 2 — By uninstalling the app',
  'Plasebo’yu telefonundan kaldırdığında uygulamanın tüm yerel verisi işletim sistemi tarafından silinir. Geriye hiçbir kayıt kalmaz, çünkü hiçbir kayıt cihaz dışına çıkmamıştır.':
    'When you remove Placebo from your phone, the operating system deletes all of the app’s local data. Nothing is left behind, because nothing ever left the device.',
  'Yol 3 — Google erişimini kaldırma': 'Route 3 — Revoking Google access',
  'Google hesabının Plasebo’ya verdiği izni myaccount.google.com/permissions adresinden istediğin zaman geri alabilirsin.':
    'You can withdraw the permission your Google account gave Placebo at any time at myaccount.google.com/permissions.',
  'Saklama süresi: Plasebo geliştiricisinin elinde tutulan hiçbir kullanıcı verisi yoktur; sunucu tarafında saklama süresi veya yedek kopya söz konusu değildir. Silme işlemi cihazında gerçekleşir ve geri alınamaz.':
    'Retention: the developer of Placebo holds no user data at all; there is no server-side retention period or backup copy. Deletion happens on your device and cannot be undone.',
  'Talep göndermek': 'Sending a request',
  'Yukarıdaki adımlarla ilgili bir sorun yaşarsan veya bir silme talebini yazılı olarak iletmek istersen niinova22@gmail.com adresine yazabilirsin. Talepler 30 gün içinde yanıtlanır.':
    'If you run into trouble with the steps above, or want to submit a deletion request in writing, you can write to niinova22@gmail.com. Requests are answered within 30 days.',
  'Plasebo — bilerek inan.': 'Placebo — believe on purpose.',
  'Sıradaki ipucu':
    'Next tip',
  'Dokun → sıradaki ipucu':
    'Tap → next tip',
  'Akıllı hatırlatıcı':
    'Smart nudges',
  'Günün rastgele saatlerinde kısa bir dürtme gönderir — her seferinde başka bir cümle. Sabit saatli günlük hatırlatıcıdan ayrıdır.':
    'Sends a short nudge at random times of day — a different line every time. Separate from the fixed-time daily reminder.',
  'Dürtmeler 10:00 ile 21:00 arasına dağıtılır; saatleri her hafta değişir.':
    'Nudges are spread between 10:00 and 21:00; the times change every week.',
  'Günde 1':
    'Once a day',
  'Günde 2':
    'Twice a day',
  'Günde 3':
    '3× a day',
  'TEMEL':
    'BASICS',
  'UYGULAMA':
    'IN PRACTICE',
  'SÜREKLİLİK':
    'KEEPING IT UP',
  'FORMÜL':
    'THE FORMULA',
  'Plasebo nedir?':
    'What is a placebo?',
  'Etkin maddesi olmayan bir şeyin yine de bir etki yaratmasına plasebo deniyor. Buradaki formülün içinde etkin madde yok: renk, ses ve nefesten ibaret. Etkiyi yaratan şey, senin ona ayırdığın iki dakika.':
    'A placebo is something with no active ingredient that produces an effect anyway. There is no active ingredient in this formula: it is a colour, a sound and a breath. What produces the effect is the two minutes you give it.',
  'Bildiğin hâlde işe yarayabilir':
    'It can work even when you know',
  'Açık etiketli plasebo çalışmalarında insanlara "bu bir plasebo" dendiği hâlde bazı belirtilerde iyileşme bildirildi. Bu yüzden burada hiçbir şey gizlenmiyor — bilmen deneyi bozmuyor.':
    'In open-label placebo studies, improvements in some symptoms were reported even though people were told outright “this is a placebo”. That is why nothing is hidden here — knowing does not spoil the experiment.',
  'Asıl iş ritüelde':
    'The ritual is the real work',
  'Formülün üç adımı bir çerçeve kuruyor: durursun, bir şeye bakarsın, nefesini sayarsın. Çerçevenin kendisi, içine koyduğun şeyden bağımsız olarak günü bölüyor.':
    'The three steps build a frame: you stop, you look at something, you count your breath. The frame itself breaks up the day, regardless of what you put inside it.',
  'Tek gerçek etken: nefes':
    'The one real factor: breath',
  'Yavaş ve verişi uzun tutulan nefesin sakinleştirici etkisi gerçek. Renk, frekans ve kelime ise tamamen senin inancına kalmış. İkisini birbirine karıştırmıyoruz.':
    'Slow breathing with a long exhale genuinely calms you. The colour, the frequency and the word are entirely up to your belief. We do not blur the two.',
  'Var olan bir alışkanlığın yanına koy':
    'Attach it to a habit you already have',
  'Yeni bir alışkanlık, boşluğa değil var olanın yanına tutunur. Sabah kahveni koyduğun anla ritüeli birleştir: su ısınırken formülü başlat. "Kahve yaparım" hatırlatıcın olur.':
    'A new habit takes hold next to an old one, not in empty space. Tie the ritual to making your morning coffee: start the formula while the water heats. “I make coffee” becomes your reminder.',
  'Kapı eşiği kuralı':
    'The doorway rule',
  'Eve girdiğin ilk iki dakikayı ritüele ayır. Ayakkabını çıkarmak ile telefona bakmak arasına sıkıştır: dışarıdaki günü içeriye taşımadan bir ara vermiş olursun.':
    'Give the first two minutes at home to the ritual. Wedge it between taking off your shoes and checking your phone: you get a break before the day outside comes in with you.',
  'Sınav ve sunum öncesi':
    'Before an exam or a talk',
  'Odak hedefini seç, ritüeli başlamadan 5 dakika önce çalıştır. Amaç bilgi yüklemek değil; ellerin işe başlamadan önce zihnin nereye bakacağını bilmesi.':
    'Pick the focus goal and run the ritual five minutes before you start. The point is not to load information; it is that your mind knows where to look before your hands begin.',
  'Yatmadan önce':
    'Before bed',
  'Uyku hedefinde ses adımı öne geçer ve süreler uzar. Telefonu bırakmadan önceki son iş olsun; ritüel bitince ekranı kapat, çünkü asıl fark ondan sonra geliyor.':
    'In the sleep goal the sound step comes first and the timings stretch. Make it the last thing before you put the phone down; when the ritual ends, close the screen — that is where the difference is.',
  'Toplantı arası':
    'Between meetings',
  'İki toplantı arasında 90 saniyen varsa kulaklığı tak ve yalnızca ses adımını dinle. Ritüelin tamamını yapmak zorunda değilsin; yarısı da bir aradır.':
    'If you have 90 seconds between two meetings, put your headphones on and take only the sound step. You do not have to do the whole ritual; half of it is still a break.',
  'Kaygı yükseldiğinde':
    'When anxiety rises',
  'Kaygı hedefinde nefes adımı başa geçer. Panik anında sayıları tutturmaya çalışma; sadece verişi alıştan uzun tut. Sayılar keyfi, ritim değil.':
    'In the anxiety goal the breath step comes first. In a panicky moment do not chase the numbers; just keep the exhale longer than the inhale. The numbers are arbitrary, the rhythm is not.',
  'Yolda, otobüste, sırada':
    'On the way, on the bus, in a queue',
  'Renk adımı için sessizlik gerekmiyor. Kalabalıkta ekrana bakmak da bir sabitleme; gözün tek bir yerde durması, zihnin de orada durması demek.':
    'The colour step does not need silence. Looking at the screen in a crowd is a fixation too; your eye staying in one place means your mind stays there.',
  'Aynı saat, aynı yer':
    'Same hour, same corner',
  'Ritüeli her gün aynı saatte ve aynı köşede yapmayı dene. Tekrarlanan bağlam beklentiyi güçlendirir — plasebonun çalıştığı iddia edilen tek yer de burası zaten.':
    'Try doing the ritual at the same hour in the same corner. A repeated context strengthens expectation — which is the only place a placebo is claimed to work anyway.',
  'Kaçırdığın gün başarısızlık değil':
    'A missed day is not a failure',
  'Seri kopabilir; uygulama seni bunun için azarlamıyor. Haftada bir "dünü dondur" hakkın var. Amaç kusursuz bir tablo değil, geri dönebilmek.':
    'Streaks break; the app does not scold you for it. You get one “freeze yesterday” a week. The goal is not a perfect grid, it is being able to come back.',
  'İki dakika kuralı':
    'The two-minute rule',
  'İsteksiz olduğun gün ritüeli tamamlamak zorunda değilsin: tek adım yap ve bırak. Küçük tutulan gün, atlanan günden daha kolay tekrarlanır.':
    'On a day you do not feel like it, you do not have to finish: do one step and stop. A day kept small repeats more easily than a day skipped.',
  'Puan bir not değil':
    'The score is not a grade',
  'Ritüel sonundaki puan senin izlenimin; doğru cevabı yok. Düşük puan da veri — İstatistik ekranında günlerin nasıl dağıldığını görmek için orada duruyor.':
    'The score at the end is your impression; there is no right answer. A low score is data too — it is there so you can see how your days spread out under Stats.',
  'Hedefi değiştirmek serbest':
    'Switching goals is free',
  'Dört hedefin de her gün ayrı bir formülü var ve hepsi açık. Sabah odak, gece uyku seçebilirsin; formül anında değişir, seri bozulmaz.':
    'All four goals get their own formula each day and all of them are open. Focus in the morning, sleep at night; the formula changes instantly and your streak is untouched.',
  'Veriler telefonda kalıyor':
    'Your data stays on the phone',
  'Ritüel kayıtların, puanların ve notların cihazından çıkmıyor; sunucu yok. Ayarlardan tek dokunuşla hepsini kalıcı olarak silebilirsin.':
    'Your ritual records, scores and notes never leave the device; there is no server. One tap in settings deletes all of it permanently.',
  'İki girdi var: günün tarihi ve seçtiğin hedef. Aynı gün, aynı hedef her zaman aynı formülü verir — rastgele değil, tekrarlanabilir.':
    'There are two inputs: today’s date and the goal you picked. The same day with the same goal always gives the same formula — not random, repeatable.',
  'Bir yıl boyunca tekrar yok':
    'No repeats for a whole year',
  'Renk, ses ve nefes üçlüsü bir yıl boyunca kendini tekrar etmeyecek biçimde seçiliyor. Her hedef de farklı bir noktadan başlıyor; aynı gün iki hedef aynı formülü vermiyor.':
    'The colour–sound–breath trio is chosen so that it does not repeat within a year. Each goal starts from a different point too, so no two goals share a formula on the same day.',
  'Adım sırası hedefe göre değişir':
    'The step order follows the goal',
  'Kaygıda nefes başa geçer, uykuda ses. Sıra, "önce neyi yavaşlatmak istiyorsun" sorusunun cevabı — ölçülmüş bir gerekçesi yok, ama tutarlı.':
    'Breath comes first for anxiety, sound for sleep. The order answers “what do you want to slow down first” — it has no measured justification, but it is consistent.',
  'Kelime bir talimat değil':
    'The word is not an instruction',
  'Merkezdeki kelimeyi tekrarlamak zorunda değilsin; bakman yeterli. Anlamı sonradan gelir, bazen hiç gelmez. İkisi de olur.':
    'You do not have to repeat the word in the centre; looking is enough. The meaning comes later, sometimes never. Both are fine.',
  'Kulaklık şart değil':
    'Headphones are optional',
  'Ses adımı hoparlörden de çalışır; kulaklık etkiyi değil deneyimi değiştirir. Ses seviyesini Ayarlar’dan kısabilir, tamamen kapatabilirsin.':
    'The sound step works through the speaker too; headphones change the experience, not the effect. You can lower the volume in Settings, or turn it off entirely.',
  'Aynı formülü tekrar oynat':
    'Replay the same formula',
  'Günün formülünü istediğin kadar tekrar başlatabilirsin; sınır yok. Sabah bir, akşam bir yapmak da geçerli bir kullanım.':
    'You can restart today’s formula as often as you like; there is no limit. Once in the morning and once at night is a perfectly good way to use it.',
  'İki dakikan var mı?':
    'Got two minutes?',
  'Bugünün formülü hâlâ seni bekliyor. Hâlâ plasebo.':
    'Today’s formula is still waiting. Still a placebo.',
  'Hadi odağını toparlayalım':
    'Let’s gather your focus',
  'Bir ara ver':
    'Take a break',
  'Ne yaptığın önemli değil; durduğun iki dakika önemli.':
    'What you do does not matter; the two minutes you stop do.',
  'Formülün hazır':
    'Your formula is ready',
  'Bugünün rengi seçildi bile. Sadece bakman gerekiyor.':
    'Today’s colour has already been picked. All you have to do is look.',
  'Nefesini uzat':
    'Stretch your breath',
  'Verişi alıştan uzun tut. Buradaki tek gerçek etken bu.':
    'Keep the exhale longer than the inhale. It is the one real factor here.',
  'Şimdi iyi bir an':
    'Now is a good moment',
  'Sonraya bırakılan ritüel, yapılmayan ritüeldir.':
    'A ritual put off is a ritual not done.',
  'Dikkatin dağıldı mı?':
    'Attention drifting?',
  'Odak formülü 90 saniye sürüyor. Telefonu bırakmadan önce.':
    'The focus formula takes 90 seconds. Before you put the phone down.',
  'Omuzların gergin':
    'Shoulders tight',
  'Sükunet formülünde nefes başa geçiyor. Sayıları dert etme.':
    'In the calm formula the breath comes first. Never mind the numbers.',
  'Güne hız lazımsa':
    'If the day needs speed',
  'Enerji formülü parlak bir renkle başlıyor. Gözünü aç.':
    'The energy formula opens with a bright colour. Open your eyes.',
  'Gece yaklaşıyor':
    'Night is coming',
  'Uyku formülünde sesler yavaşlar. Ekranı kapatmadan önce bir tur.':
    'In the sleep formula the sounds slow down. One round before the screen goes off.',
  /* 24 saatlik döngü: gün içi ölçüm ve sabah raporu. */
  'Mikrofon izni yok':
    'Microphone permission missing',
  'Nefes ölçümü için mikrofon gerekiyor. İzin vermeden de uygulamayı kullanabilirsin.':
    'Breath measurement needs the microphone. You can keep using the app without granting it.',
  'Ölçüm kaydedildi':
    'Measurement saved',
  'Nefesin %{yuzde} düzenliydi. Yarın sabah günün raporunda görünecek.':
    "Your breathing was {yuzde}% steady. It will appear in tomorrow morning's report.",
  'Sinyal yakalanamadı — çok sessiz ya da çok kısa bir kayıt olabilir.':
    'No signal was caught — the recording may have been too quiet or too short.',
  'Nefesin dinleniyor':
    'Listening to your breathing',
  'Doğal nefes al. Sayıları tutturmak zorunda değilsin.':
    "Breathe naturally. You don't have to hit any numbers.",
  '45 saniyelik ölçüm':
    'A 45-second measurement',
  'Mikrofon yalnızca bu ekran açıkken çalışır. Ses kaydedilmez, cihazdan çıkmaz.':
    'The microphone runs only while this screen is open. No audio is recorded and nothing leaves your device.',
  'Sadece nefes al.':
    'Just breathe.',
  'Gün içindeki ölçümler yalnızca cihazında saklanır; hiçbir yere gönderilmez.':
    'Your check-ins are stored only on your device and are never sent anywhere.',
  'Ölçümü başlat':
    'Start the measurement',
  'SON 24 SAAT':
    'LAST 24 HOURS',
  'Henüz yeterli ölçüm yok':
    'Not enough measurements yet',
  'Günlük rapor için en az {adet} kısa ölçüm gerekiyor. Bildirim geldiğinde 45 saniyeni ayırman yeterli.':
    'A daily report needs at least {adet} short measurements. When the reminder arrives, 45 seconds is enough.',
  '{adet} ölçümün ortalaması: %{yuzde} düzen.':
    'Average of {adet} measurements: {yuzde}% steadiness.',
  'En düzenli an':
    'Steadiest moment',
  '{saat} · %{yuzde}':
    '{saat} · {yuzde}%',
  'En gergin an':
    'Tensest moment',
  'Dün gece uyku':
    "Last night's sleep",
  '{saat} sa {dakika} dk':
    '{saat} h {dakika} m',
  'Dinlenme nabzı':
    'Resting heart rate',
  '{nabiz} atım/dk':
    '{nabiz} bpm',
  'Bu rapor bir teşhis değil: yalnızca senin yaptığın ölçümlerin ve Sağlık verinin yan yana konmuş hâli.':
    'This report is not a diagnosis: it is only your own measurements and Health data placed side by side.',
  'Ölçüm davetleri bildirimle geliyor; izin vermeden bu döngü çalışmaz.':
    'Measurement invitations arrive as notifications; without permission this cycle cannot run.',
  '24 saatlik döngü':
    '24-hour cycle',
  'Gün içinde üç kez 45 saniyelik nefes ölçümü önerilir; ertesi sabah hepsi tek bir raporda toplanır. Mikrofon yalnızca ölçüm ekranı açıkken çalışır, arka planda hiçbir şey dinlenmez.':
    'Three times a day you are invited to a 45-second breath measurement; the next morning they are gathered into one report. The microphone runs only while the measurement screen is open — nothing is listened to in the background.',
  '📊 Son 24 saatin raporunu aç':
    '📊 Open the last 24 hours report',
  'Nefesini ölçelim mi? Günün raporu bu ölçümlerden kuruluyor.':
    'Shall we measure your breathing? The daily report is built from these.',
  'Günün raporu hazır':
    'Your daily report is ready',
  'Son 24 saatte ölçülenler bir arada.':
    'Everything measured in the last 24 hours, together.',
  'Gün ilerledikçe nefesin düzene girdi.':
    'Your breathing settled as the day went on.',
  'Gün ilerledikçe nefesin dağıldı.':
    'Your breathing scattered as the day went on.',
  'Gün boyunca nefesin benzer bir düzende kaldı.':
    'Your breathing stayed at a similar steadiness all day.',
  'Kısa bir geceydi; bugünkü reçetene fazladan bir sakinleştirme turu eklendi.':
    "It was a short night; an extra calming round was added to today's prescription.",
  'Uykun ortalama bir gecedeydi.':
    'Your sleep was an average night.',
  'Uykun yeterliydi.':
    'Your sleep was sufficient.',
  'Bu özellik bu cihazda kullanılamıyor.':
    'This feature is not available on this device.',
  /* Widget özeti. */
  'GÜN':
    'DAYS',
  'son seansta {fark} puan azaldı':
    'down {fark} points last session',
  /* Ritüelde akan sakinleştirici metin (constants/calmingStories.ts). */
  /* — uzaklaş */
  'Bugün seni yoran bir şey var.':
    'Something wore you out today.',
  'Ona şimdilik bir isim verme.':
    "Don't name it just yet.",
  'Sadece orada olduğunu bil.':
    'Just know that it is there.',
  'Omuzların yerini bulsun.':
    'Let your shoulders settle.',
  'Şimdi biraz geriye çekil.':
    'Now step back a little.',
  'Sanki iki adım geriye.':
    'As if two steps back.',
  'O düşünce hâlâ orada.':
    'That thought is still there.',
  'Ama artık biraz uzakta.':
    'But a little farther away now.',
  'Bulunduğun odaya bak.':
    'Look at the room you are in.',
  'Duvarlar sessizce duruyor.':
    'The walls stand quietly.',
  'Oda, o düşünceden büyük.':
    'The room is bigger than that thought.',
  'Şimdi biraz daha geriye.':
    'Now a little farther back.',
  'Çatının üstünden bak.':
    'Look down from above the roof.',
  'Çatılar sıralanmış.':
    'Rooftops line up below.',
  'Sokak lambaları yanıyor.':
    'The street lamps are on.',
  'Şehir, odandan büyük.':
    'The city is bigger than your room.',
  'Biraz daha yukarı.':
    'A little higher.',
  'Bulutlar altında kaldı.':
    'The clouds are beneath you now.',
  'Işıklar noktalara döndü.':
    'The lights have turned into dots.',
  'Ülke, şehirden büyük.':
    'The country is bigger than the city.',
  'Daha da yukarıda.':
    'Higher still.',
  'Şimdi denizler görünüyor.':
    'Now the seas come into view.',
  'Mavi, hepsini çevreliyor.':
    'Blue surrounds all of it.',
  'Dünya, ülkeden büyük.':
    'The earth is bigger than the country.',
  'Dünya bu sabah da döndü.':
    'The earth turned again this morning.',
  'Kimseden izin istemedi.':
    'It asked no one for permission.',
  'Gökyüzü hepsinin üstünde.':
    'The sky is above all of it.',
  'Yıldızlar yerlerinde duruyor.':
    'The stars are where they have always been.',
  'Işıkları yıllar önce yola çıktı.':
    'Their light set out years ago.',
  'Buradan bakınca sessizler.':
    'From here they are silent.',
  'Şimdi yavaşça geri dön.':
    'Now come slowly back.',
  'Deniz, ülke, şehir.':
    'Sea, country, city.',
  'Sokak, bina, oda.':
    'Street, building, room.',
  'Ve oturduğun yer.':
    'And the place where you sit.',
  'Ve senin nefesin.':
    'And your breath.',
  'O düşünce hâlâ burada.':
    'That thought is still here.',
  'Kaybolmasını istemiyoruz.':
    'We are not asking it to leave.',
  'Yalnızca boyutunu görüyoruz.':
    'We are only seeing its size.',
  'Bir yer kaplıyor.':
    'It takes up a place.',
  'Ama hepsini değil.':
    'But not the whole of it.',
  'Sen ondan geniş bir yerdesin.':
    'You are in a wider place than it is.',
  'Acele edecek bir şey yok.':
    'There is nothing to hurry for.',
  'Nefesin yerinde.':
    'Your breath is here.',
  'Omuzların yerinde.':
    'Your shoulders are here.',
  'Sen de buradasın.':
    'And so are you.',
  /* — beden */
  'Şimdi bedenine dön.':
    'Now come back to your body.',
  'Hiçbir şeyi değiştirme.':
    'Change nothing.',
  'Sadece nerede olduğunu fark et.':
    'Just notice where it is.',
  'Ayaklarından başla.':
    'Start with your feet.',
  'Zemin onları tutuyor.':
    'The floor is holding them.',
  'Tutmak için çabalamıyorlar.':
    'They are not working to stay there.',
  'Bacakların ağırlığını bırakıyor.':
    'Your legs let their weight go.',
  'Altındaki şey seni taşıyor.':
    'Whatever is under you carries you.',
  'Ona güvenebilirsin.':
    'You can trust it.',
  'Karnın yumuşasın.':
    'Let your belly soften.',
  'Nefes oraya kadar insin.':
    'Let the breath reach down that far.',
  'Zorlamadan, kendiliğinden.':
    'Without forcing, on its own.',
  'Göğsün yavaşça açılıyor.':
    'Your chest opens slowly.',
  'Sonra yavaşça kapanıyor.':
    'Then it closes slowly.',
  'Bunu sen yapmıyorsun.':
    'You are not doing this.',
  'Yalnızca izin veriyorsun.':
    'You are only allowing it.',
  'Şimdi omuzlarına gel.':
    'Now come to your shoulders.',
  'Gün boyu yukarıdaydılar.':
    'They were up all day.',
  'Bıraksınlar biraz.':
    'Let them come down a little.',
  'Bir parmak kadar aşağı.':
    "A finger's width lower.",
  'Sonra bir parmak daha.':
    'Then one more.',
  'Ellerin nerede?':
    'Where are your hands?',
  'Belki sıkılmışlardır.':
    'They may be clenched.',
  'Parmakların açılsın.':
    'Let your fingers open.',
  'Avuçların yukarı baksın.':
    'Let your palms face up.',
  'Tutacak bir şey yok.':
    'There is nothing to hold.',
  'Çeneni fark et.':
    'Notice your jaw.',
  'Dişlerin birbirine değiyor mu?':
    'Are your teeth touching?',
  'Aralarına boşluk bırak.':
    'Leave a little space between them.',
  'Dilin damağından ayrılsın.':
    'Let your tongue fall from the roof of your mouth.',
  'Şimdi alnını düşün.':
    'Now think of your forehead.',
  'Kaşlarının arasındaki çizgi.':
    'The line between your brows.',
  'O çizgi gevşesin.':
    'Let that line loosen.',
  'Gözlerin ağırlaşsın.':
    'Let your eyes grow heavy.',
  'Onları kimse izlemiyor.':
    'No one is watching them.',
  'Şimdi hepsini birden hisset.':
    'Now feel all of it at once.',
  'Baştan ayağa tek parça.':
    'One whole piece, head to foot.',
  'Nefes içinden geçiyor.':
    'The breath moves through it.',
  'Girerken serin.':
    'Cool on the way in.',
  'Çıkarken ılık.':
    'Warm on the way out.',
  'Hiçbir şeyi tutmuyorsun.':
    'You are holding nothing.',
  'Hiçbir yere yetişmiyorsun.':
    'You are racing toward nothing.',
  'Beden zaten biliyordu.':
    'The body already knew.',
  'Sen yalnızca yerini aldın.':
    'You have only taken your place.',
  'Burası, şu an, yeterli.':
    'Here, now, is enough.',
  /* — su */
  'Bir göl hayal et.':
    'Picture a lake.',
  'Sabahın erken saati.':
    'Early in the morning.',
  'Yüzeyi düz duruyor.':
    'Its surface lies flat.',
  'Kıyıda taşlar var.':
    'There are stones along the shore.',
  'Sen kıyıdasın.':
    'You are on the shore.',
  'Şimdi bir düşünce geliyor.':
    'Now a thought arrives.',
  'Suya bir taş düşüyor.':
    'A stone falls into the water.',
  'Halkalar dışarı açılıyor.':
    'Rings open outward.',
  'Bir, iki, üç.':
    'One, two, three.',
  'Sonra giderek zayıflıyor.':
    'Then they slowly fade.',
  'Su yine düzleşiyor.':
    'The water goes flat again.',
  'Taşı sen atmadın.':
    'You did not throw the stone.',
  'Halkaları da durduramazsın.':
    'And you cannot stop the rings.',
  'Ama beklemeyi bilirsin.':
    'But you know how to wait.',
  'Başka bir düşünce.':
    'Another thought.',
  'Başka bir taş.':
    'Another stone.',
  'Yine halkalar.':
    'Rings again.',
  'Yine sessizlik.':
    'Quiet again.',
  'Düşünceler suya benziyor.':
    'Thoughts are like water.',
  'Gelirler ve geçerler.':
    'They come and they pass.',
  'Hepsini durdurman gerekmiyor.':
    'You do not have to stop them all.',
  'Bir dalga yükseliyor.':
    'A wave rises.',
  'Sonra kendiliğinden alçalıyor.':
    'Then it falls on its own.',
  'Onu ittirmedin.':
    'You did not push it.',
  'Onu çekmedin de.':
    'You did not pull it either.',
  'Sen dalga değilsin.':
    'You are not the wave.',
  'Sen kıyısın.':
    'You are the shore.',
  'Kıyı dalgayla tartışmaz.':
    'The shore does not argue with the wave.',
  'Yalnızca orada durur.':
    'It simply stays there.',
  'Su bazen yükselir.':
    'The water sometimes rises.',
  'Bazen geri çekilir.':
    'Sometimes it draws back.',
  'Kıyı ikisini de tanır.':
    'The shore knows both.',
  'Şimdi suyun altına bak.':
    'Now look beneath the water.',
  'Yüzey kıpırdasa bile.':
    'Even when the surface stirs.',
  'Derinde hiçbir şey sallanmıyor.':
    'Nothing sways down in the deep.',
  'Orada taşlar duruyor.':
    'Stones rest down there.',
  'Işık yavaşça iniyor.':
    'Light comes down slowly.',
  'Ses oraya ulaşmıyor.':
    'Sound does not reach that far.',
  'Sende de böyle bir yer var.':
    'You have a place like that too.',
  'Yüzeyin altında, sakin.':
    'Below the surface, still.',
  'Bugün onu bulman gerekmiyor.':
    'You do not have to find it today.',
  'Var olduğunu bilmek yeter.':
    'Knowing it is there is enough.',
  'Su çekilince kum düzleşir.':
    'When the water draws back, the sand goes smooth.',
  'Şimdi sessiz bir yer var.':
    'Now there is a quiet place.',
  'O yer hep buradaydı.':
    'That place was always here.',
  /* — gün */
  'Gün bugün de eskisi gibi başladı.':
    'The day began the way it always does.',
  'Bir alarm çaldı.':
    'An alarm went off.',
  'Bir liste vardı.':
    'There was a list.',
  'Liste hâlâ duruyor.':
    'The list is still there.',
  'Yapılmamış işler yerinde.':
    'The undone things are where they were.',
  'Hiçbiri kaçmadı.':
    'None of them ran away.',
  'Hiçbiri de büyümedi.':
    'None of them grew either.',
  'Şimdi onlara bakma.':
    'Do not look at them now.',
  'Hiçbiri bu iki dakikaya sığmaz.':
    'None of them fit into these two minutes.',
  'O yüzden şimdi burada değiller.':
    'So they are not here right now.',
  'Bu süre sana ait.':
    'This time belongs to you.',
  'Kimse kapıyı çalmayacak.':
    'No one is going to knock.',
  'Kimseye bir şey ispat etmiyorsun.':
    'You are proving nothing to anyone.',
  'İyi hissetmek zorunda değilsin.':
    'You do not have to feel good.',
  'Rahatlamak zorunda da değilsin.':
    'You do not have to relax either.',
  'Yalnızca duruyorsun.':
    'You are simply stopping.',
  'Durmak da bir şey yapmaktır.':
    'Stopping is also doing something.',
  'Bugün olanları düşün.':
    'Think of what happened today.',
  'Bir şey iyi gitmedi belki.':
    'Maybe something went badly.',
  'Bir cümle aklında kaldı.':
    'A sentence stayed with you.',
  'Bir bakış, bir sessizlik.':
    'A look, a silence.',
  'Onu şimdi çözmeyeceğiz.':
    'We are not going to solve it now.',
  'Yalnızca yerini gösteriyoruz.':
    'We are only pointing to where it sits.',
  'Aklın bugün çok çalıştı.':
    'Your mind worked hard today.',
  'Sabahtan beri hiç durmadı.':
    'It has not stopped since morning.',
  'Şimdi ona ara veriyorsun.':
    'Now you are giving it a break.',
  'Bunu hak etti.':
    'It has earned one.',
  'Dışarıda gün sürüyor.':
    'Outside, the day goes on.',
  'Arabalar geçiyor.':
    'Cars are passing.',
  'Biri yemek pişiriyor.':
    'Someone is cooking.',
  'Biri eve dönüyor.':
    'Someone is heading home.',
  'Dünya seni beklemiyor.':
    'The world is not waiting for you.',
  'Ama seni zorlamıyor da.':
    'But it is not pushing you either.',
  'Akşam yine gelecek.':
    'Evening will come again.',
  'Yarın yine sabah olacak.':
    'Tomorrow it will be morning again.',
  'Bu düzen senden önce vardı.':
    'This order was here before you.',
  'Senden sonra da olacak.':
    'It will be here after you.',
  'İçinde küçük bir yer kapladın.':
    'You take up a small place inside it.',
  'O yer yeterince büyük.':
    'That place is big enough.',
  'Şimdi nefesine dön.':
    'Now come back to your breath.',
  'Bir kere içeri.':
    'Once in.',
  'Bir kere dışarı.':
    'Once out.',
  'Liste hâlâ yerinde duruyor.':
    'The list is still where it was.',
  'Ama sen biraz daha buradasın.':
    'But you are a little more here.',
  'Bitince gün seni bekliyor olacak.':
    'When it ends, the day will still be waiting.',
  /* Bildirim havuzu — özellik ipuçları ve kısa motivasyon. */
  'Nefesini ölçebiliyoruz':
    'We can measure your breathing',
  'Ritüel sırasında mikrofon nefes ritmini ölçüyor. Ses kaydedilmiyor, cihazdan çıkmıyor.':
    'During the ritual the microphone measures your breathing rhythm. No audio is recorded and nothing leaves your device.',
  'Kamerayla ölçmeyi denedin mi?':
    'Have you tried measuring with the camera?',
  'Ölçüm ekranındaki kamera düğmesi yüz ifadenden bir puan öneriyor. Katılmazsan kaydırıp değiştirirsin.':
    'The camera button on the measurement screen suggests a score from your expression. Disagree? Just slide it.',
  'Refleksin de bir veri':
    'Your reflex is data too',
  'Ritüelden önce ve sonra tepki süreni ölçüp farkı görebilirsin.':
    'Measure your reaction time before and after the ritual and see the difference.',
  'Apple Sağlık bağlanabilir':
    'Apple Health can be connected',
  'Ayarlar’dan açarsan dün geceki uykun reçeteni etkiler. Sağlık’a hiçbir şey yazılmaz.':
    'Turn it on in Settings and last night’s sleep shapes your prescription. Nothing is written back to Health.',
  'Ana ekrana widget ekle':
    'Add the widget to your home screen',
  'Serini ve günün formülünü telefonun ana ekranından görebilirsin.':
    'See your streak and today’s formula straight from your home screen.',
  'Seri dondurma hakkın var':
    'You have a streak freeze',
  'Bir günü kaçırdıysan haftada bir kez dünü dondurup seriyi koruyabilirsin.':
    'Missed a day? Once a week you can freeze yesterday and keep the streak.',
  'Ölçüm defterine bak':
    'Check the measurement ledger',
  'İstatistik ekranı kendi puanınla cihazın ölçtüğünü yan yana koyuyor.':
    'The Stats screen puts your own score next to what the device measured.',
  'Nokta atışı reçete':
    'Targeted prescription',
  'Şikayetini anlatırsan sana özel bir reçete hazırlanıyor. Ana ekranda en üstte duruyor.':
    'Describe what is bothering you and a prescription is prepared for you. It sits at the top of the home screen.',
  'Kör testi açabilirsin':
    'You can turn on the blind test',
  'Ayarlar’dan açarsan bazı günler sahte ritüel gelir; farkı istatistikte görürsün.':
    'Turn it on in Settings and some days bring a sham ritual; you see the difference in Stats.',
  'Seansın fişini paylaş':
    'Share your session receipt',
  'Bitişte üretilen fişi görsel olarak kaydedip paylaşabilirsin.':
    'You can save and share the receipt produced at the end as an image.',
  'Bugün de buradasın':
    'You are here today too',
  'Ölçülen tek şey bu: devam etmen.':
    'This is the only thing measured: that you kept going.',
  'İki dakika az değil':
    'Two minutes is not nothing',
  'Günün geri kalanıyla değil, hiç durmamakla kıyasla.':
    'Compare it with never stopping, not with the rest of your day.',
  'Küçük ve tekrarlı':
    'Small and repeated',
  'Uzun bir seans aramıyoruz; kısa ve tekrar eden bir şey arıyoruz.':
    'We are not after a long session; we are after something short that repeats.',
  'Yarım yapmak da sayılır':
    'Half of it counts too',
  'Tek bir adım bile bugünü işaretler.':
    'Even a single step marks today.',

  'Hiçbir şey yapmıyoruz':
    'We are doing nothing',
  'Ama beraber yapıyoruz. İki dakika.':
    'But we are doing it together. Two minutes.',
  'Bu bildirim de plasebo':
    'This notification is a placebo too',
  'Bugünün uydurma bulgusu':
    'Today’s made-up finding',
  'Ritüele başlayınca hangisi çıkacak, orası sürpriz.':
    'Which one turns up when you start is the surprise.',
  'Ölçtüğümüz tek şey':
    'The only thing we measure',
  'Devam ettiğin. Puanın değil, geldiğin sayılıyor.':
    'That you kept going. Not your score — your showing up.',
  'Dozaj: iki dakika. Yan etki: bir ara vermiş olmak.':
    'Dosage: two minutes. Side effect: having taken a break.',
  'Serini hatırlıyor musun?':
    'Remember your streak?',
  'Bugünü de eklemek için geç değil.':
    'It is not too late to add today.',
  'Kaçırdıysan sorun değil':
    'If you missed it, never mind',
  'Bugünden devam et. Uygulama not tutmuyor, sadece sayıyor.':
    'Pick up from today. The app is not keeping score, only counting.',
  'Tek adım da sayılır':
    'One step counts too',
  'Tamamını yapamıyorsan yalnızca nefes adımını çalıştır.':
    'If you cannot do it all, run just the breath step.',
  'Aynı saat, aynı köşe':
    'Same hour, same corner',
  'Tekrarlanan bağlam beklentiyi güçlendiriyor — iddia bu.':
    'A repeated context strengthens expectation — so the claim goes.',
  'Bugünkü renk seni bekliyor':
    'Today’s colour is waiting',
  'Bir yıl boyunca aynı formül iki kez gelmiyor. Bunu kaçırma.':
    'The same formula never comes twice in a year. Do not miss this one.',
  '⚗️ Plasebo yanıtı ölçülmüş, tekrarlanmış bir olgudur. Devam ettikçe güçlenir.':
    '⚗️ The placebo response is a measured, replicated phenomenon. It grows as you keep going.',
  '⚗️ Burada gördüğün senin plasebo yanıtın — araştırmaların ölçtüğü de tam olarak bu.':
    '⚗️ What you see here is your own placebo response — exactly what the research measures.',
  '⚗️ Devamlılık, plasebo yanıtını besleyen en güçlü şey.':
    '⚗️ Consistency is the strongest thing feeding a placebo response.',
  '⚗️ Senin izlenimin en önemli ölçüt — plasebo araştırmaları da bunu ölçer.':
    '⚗️ Your impression is the measure that matters — placebo research measures it too.',
  'Bakmak beklentiyi kuruyor; beklenti bedende karşılık buluyor':
    'Looking builds expectation; expectation finds an answer in the body',
  'Bir şey yapmayı bırakmak da bir eylem — beden bunu fark ediyor':
    'Stopping is an action too — the body notices it',
  'Burada kaldığın her saniye, ritüeli biraz daha senin yapıyor':
    'Every second you stay makes the ritual a little more yours',
  'Ses dikkati tutuyor; tutulan dikkat beklentiyi güçlendiriyor':
    'Sound holds attention; held attention strengthens expectation',
  'Kulaklıkla dinlemek etkiyi değil deneyimi değiştirir':
    'Headphones change the experience, not the effect',
  'Bu ton senin bu iki dakikan için üretildi':
    'This tone was generated for these two minutes of yours',
  'Duyduğun şey bir zemin — üstünde durabileceğin bir yer':
    'What you hear is a floor — somewhere to stand',
  'Yavaş nefes gerçekten sakinleştirir; beklenti bunu büyütüyor':
    'Slow breathing genuinely calms you; expectation amplifies it',
  'Verişi alıştan uzun tutmak, bedenin kendi frenine dokunuyor':
    'Keeping the exhale longer than the inhale touches the body’s own brake',
  'Sayılar bir öneri, ritim ise gerçek. Ritme uy, sayıyı dert etme':
    'The numbers are a suggestion, the rhythm is real. Follow the rhythm, ignore the count',
  'Nefes, ölçülebilir olanla inanılan şeyin buluştuğu yer':
    'Breath is where the measurable meets the believed',
  'Kelimenin gücü ona verdiğin anlamdan gelir — o anlam gerçek':
    'The word’s power comes from the meaning you give it — and that meaning is real',
  'PLASEBONUN GÜCÜ':
    'THE POWER OF PLACEBO',
  'Plasebo etkisi gerçektir':
    'The placebo effect is real',
  'Klinik çalışmalarda plasebo alan grup düzenli olarak iyileşme bildirir; bu, tekrar tekrar ölçülmüş bir olgu. "Hayal görmek" değil — beklentinin, bedenin sinyalleri nasıl işlediğini değiştirmesi.':
    'In clinical trials the placebo group regularly reports improvement; this has been measured again and again. It is not “imagining things” — it is expectation changing how the body processes its own signals.',
  'Beklenti bedende karşılık buluyor':
    'Expectation finds an answer in the body',
  'Plasebo ile ağrının azaldığı çalışmalarda, bedenin kendi ağrı kesici sistemlerinin devreye girdiği görüldü; etkiyi bu sistemleri bloke eden bir madde zayıflatabiliyor. Yani beklenti, fizyolojiye dokunan bir yol izliyor.':
    'In studies where placebo reduced pain, the body’s own painkilling systems were seen to engage — and a drug that blocks those systems can weaken the effect. Expectation travels a route that touches physiology.',
  'Ritüel etkiyi büyütüyor':
    'The ritual amplifies the effect',
  'Araştırmalarda plasebo yanıtı, işlem ne kadar özenli ve düzenliyse o kadar güçlü çıkıyor: ayrılan zaman, tekrar ve ilgi tek başına fark yaratıyor. Bu uygulamanın yaptığı da tam olarak bu — sana her gün özenli bir iki dakika kurmak.':
    'Research finds the placebo response is stronger the more careful and regular the procedure is: time given, repetition and attention make a difference on their own. That is exactly what this app does — it builds you a careful two minutes every day.',
  'Bildiğin hâlde çalışıyor':
    'It works even when you know',
  'Açık etiketli plasebo çalışmaları, insanlara "bu bir plasebo" denildiği hâlde belirtilerde iyileşme bildirildiğini gösteriyor. Bu yüzden burada hiçbir şeyi saklamamıza gerek yok: bilmek etkiyi bozmuyor.':
    'Open-label placebo studies show improvements in symptoms are reported even when people are told outright “this is a placebo”. That is why we need to hide nothing here: knowing does not spoil the effect.',
  'Etki bırakınca da sürebiliyor':
    'The effect can outlast the pill',
  'Kanser sonrası yorgunlukta yapılan bir çalışmada, açık etiketli plasebo bırakıldıktan sonra da iyileşmenin bir süre korunduğu bildirildi. Kurulan beklenti, kaynağı ortadan kalksa bile bir süre ayakta kalıyor.':
    'In a study on fatigue after cancer treatment, improvement was reported to hold for a while even after the open-label placebo was stopped. The expectation you build stays standing for a time, even once its source is gone.',
  'Kendi üstünde ölçebilirsin':
    'You can measure it on yourself',
  'Ayarlardaki kör testi açarsan bazı günler ritüel yerine eşit süreli bir bekleme gelir; hangisi olduğunu ancak sonunda öğrenirsin. İstatistik ekranı iki grubun ortalamasını karşılaştırır — kendi plasebo yanıtını kendin görürsün.':
    'Turn on the blind test in settings and some days you get an equally long wait instead of the ritual — you only learn which at the end. The Stats screen compares the two averages, so you see your own placebo response for yourself.',
  'Beklentiyi korumak':
    'Protecting the expectation',
  'Kötü bir şey olacağını düşünmek de gerçek şikâyet üretebiliyor (nocebo). Bu yüzden burada hiçbir gün "kötü gün" diye etiketlenmiyor ve düşük puan bir başarısızlık olarak sunulmuyor — beklentin senin lehine kalsın diye.':
    'Believing something bad will happen can produce real complaints too (nocebo). That is why no day here is labelled a “bad day” and a low score is never framed as failure — so the expectation stays on your side.',
  'Yanında durur, yerine geçmez':
    'It stands beside, never instead',
  'Plasebo yanıtı gerçek olsa da bir tedavinin yerini almaz. Süregelen bir şikâyetin varsa hekimine danış; bu ritüel onun yanında, günlük bir alışkanlık olarak durmak için var.':
    'Real as the placebo response is, it does not replace a treatment. If you have a lasting complaint, talk to your doctor; this ritual is here to sit beside that, as a daily habit.',
  'Renk, ses, nefes. Beklenti gerçek bir mekanizma — dene.':
    'Colour, sound, breath. Expectation is a real mechanism — try it.',
  'İçinde etkin madde yok. Yine de açtın — mekanizma tam olarak bu.':
    'No active ingredient in it. You opened it anyway — that is exactly the mechanism.',
  'Bugün ne hissediyorsun?':
    'How do you feel today?',
  'Dürüst ol. Plasebo dürüstlükle daha iyi çalışır.':
    'Be honest. Placebo works better with honesty.',
  '⚗️ Şikayetin formülün adını belirler; etkiyi belirleyen sensin.':
    '⚗️ Your complaint names the formula; you are the one who decides the effect.',
  'Devam Et':
    'Continue',
  'Zihnim dağınık, odaklanamıyorum':
    'My mind is scattered, I cannot focus',
  'İçim sıkışık, bunaltıcı hissediyorum':
    'I feel tight inside, it is suffocating',
  'Enerjim sıfır, hiçbir şey yapmak istemiyorum':
    'My energy is zero, I do not want to do anything',
  'Kafam çok kalabalık, düşünceler durmuyor':
    'My head is crowded, the thoughts will not stop',
  'Gerginim, bedenimde gerilim var':
    'I am tense, my body is holding tension',
  'Motivasyonum yok, başlayamıyorum':
    'I have no motivation, I cannot start',
  'Şikayet analiz ediliyor...':
    'Analysing the complaint...',
  'Nöral örüntüler taranıyor...':
    'Scanning neural patterns...',
  'Formülün hazırlanıyor...':
    'Preparing your formula...',
  '⚗️ Bu analiz plasebodur. Yine de beynin şu an buna inanıyor.':
    '⚗️ This analysis is a placebo. Your brain believes it anyway.',
  'BUGÜNÜN REÇETESİ':
    'TODAY’S PRESCRIPTION',
  'Plasebo Kliniği':
    'Placebo Clinic',
  'Dr. Algoritma, Nörobilim':
    'Dr. Algorithm, Neuroscience',
  'Hasta':
    'Patient',
  'Tarih':
    'Date',
  'Şikayet':
    'Complaint',
  'Uygulama':
    'Dosage',
  '1 × günlük':
    '1 × daily',
  'Süre':
    'Duration',
  '{dk} dakika':
    '{dk} minutes',
  '⚠️ Bu reçete tamamen plasebodur. Etkisi beklentiden gelir.':
    '⚠️ This prescription is entirely placebo. Its effect comes from expectation.',
  'Reçeteni kabul ediyor musun?':
    'Do you accept your prescription?',
  'Evet, uygula':
    'Yes, apply it',
  'Farklı şikayet':
    'Different complaint',
  'Zihin Berraklığı':
    'Mind Clarity',
  'Nefes Açıcı':
    'Breath Opener',
  'Aktivasyon':
    'Activation',
  'Sessizleştirici':
    'Quieter',
  'Kas Sıfırlayıcı':
    'Muscle Reset',
  'Başlatıcı':
    'Starter',
  'Dağınık nöral bağlantıları tek odak noktasında toplar':
    'Gathers scattered neural connections into a single point of focus',
  'Göğüs bölgesindeki sempatik sinir aktivasyonunu yatıştırır':
    'Soothes sympathetic nerve activation in the chest',
  'Uyuyan dopamin devrelerini düşük frekanslı uyarıyla harekete geçirir':
    'Wakes dormant dopamine circuits with low-frequency stimulation',
  'Varsayılan mod ağı aktivitesini frekans entrainment ile filtreler':
    'Filters default mode network activity through frequency entrainment',
  'Kronik kas gerilimini tetikleyen kortikal uyarımı baskılar':
    'Suppresses the cortical drive behind chronic muscle tension',
  'Harekete geçişi engelleyen prefrontal frenleme döngüsünü keser':
    'Cuts the prefrontal braking loop that blocks getting started',
  'RİTÜEL ÖNCESİ ÖLÇÜM':
    'MEASUREMENT BEFORE THE RITUAL',
  'RİTÜEL SONRASI ÖLÇÜM':
    'MEASUREMENT AFTER THE RITUAL',
  'Şimdi nasılsın?':
    'How are you now?',
  '1 = hiç yok  ·  10 = dayanılmaz':
    '1 = none at all  ·  10 = unbearable',
  '⚗️ Bu ölçüm senin izlenimin — plasebo araştırmalarının ölçtüğü de bu.':
    '⚗️ This measurement is your impression — which is what placebo research measures too.',
  'Ölçüm Tamam':
    'Measurement done',
  'Kaydırarak şu anki hâlini işaretle':
    'Slide to mark how you are now',
  '📷 Kamerayla ölç':
    '📷 Measure with camera',
  'Kamerayla ölç':
    'Measure with camera',
  'Yüzünü çerçeveye al, doğal ifadenle bekle. Fotoğraf cihazından çıkmaz.':
    'Frame your face and hold your natural expression. The photo never leaves your device.',
  'Kamera izni gerekiyor.':
    'Camera permission is needed.',
  'İzin ver':
    'Grant permission',
  'Yüz ifaden okunuyor…':
    'Reading your expression…',
  'Yüz bulunamadı. Işığı ve kadrajı kontrol edip tekrar dene.':
    'No face found. Check the light and framing, then try again.',
  'Tekrar dene':
    'Try again',
  'Fotoğraf alınamadı.':
    'Could not take the photo.',
  'Yüz tanıma motoru başlatılamadı.':
    'The face recognition engine could not start.',
  'Yüz bulundu ama ifade okunamadı.':
    'A face was found but the expression could not be read.',
  'Bu özellik şu an yalnızca iPhone’da kullanılabiliyor.':
    'This feature is currently only available on iPhone.',
  'Fotoğrafla otomatik reçete':
    'Automatic prescription from photo',
  'Yüzün sakin görünüyor — listeden seç ya da kendi cümlenle anlat.':
    'Your face looks calm — pick from the list or describe it in your own words.',
  'Yüzün sakin görünüyor (ölçülen: {skor}/10) — listeden seç ya da kendi cümlenle anlat.':
    'Your face looks calm (measured: {skor}/10) — pick from the list or describe it in your own words.',
  'Yüzümden anlaşılan: çok gergin ve bunalmış görünüyorum':
    'What my face shows: I look very tense and overwhelmed',
  'Yüzümden anlaşılan: gergin ve huzursuz görünüyorum':
    'What my face shows: I look tense and uneasy',
  'Yüzümden anlaşılan: enerjik ve keyifli görünüyorum':
    'What my face shows: I look energetic and upbeat',
  'Yüzümden anlaşılan: sakin görünüyorum ama zihnim biraz dağınık':
    'What my face shows: I look calm but my mind feels a bit scattered',
  'Yüzümden anlaşılan: üzgün ve yorgun görünüyorum':
    'What my face shows: I look sad and tired',
  'Yüzümden anlaşılan: kaygılı ve gergin görünüyorum':
    'What my face shows: I look anxious and tense',
  '🤖 Analiz sonucu':
    '🤖 Analysis result',
  'Bu bir klinik teşhis değil — FER-2013 veri setinde eğitilmiş bir model, tek kareden kaba bir tahmin yapıyor.':
    'This is not a clinical diagnosis — a model trained on the FER-2013 dataset makes a rough estimate from a single frame.',
  'Kullan':
    'Use',
  'Kızgın': 'Angry',
  'Tiksinmiş': 'Disgusted',
  'Kaygılı': 'Anxious',
  'Mutlu': 'Happy',
  'Nötr': 'Neutral',
  'Üzgün': 'Sad',
  'Şaşkın': 'Surprised',
  'Yüz ifaden analiz ediliyor...':
    'Analyzing your expression...',
  'İfade örüntüsü duygu haritasına oturtuluyor...':
    'Mapping the expression pattern onto the emotion map...',
  'Analiz reçeteye çevriliyor...':
    'Turning the analysis into a prescription...',
  '🤖 Yüz analizi gerçek: cihazında çalışan bir model. Karışımın kendisi ise plasebo — etkiyi beklenti kuruyor.':
    '🤖 The face analysis is real: a model running on your device. The mixture itself is placebo — the effect comes from expectation.',
  '🤖  Yüzünü okuyup reçeteni yazıyor':
    '🤖  Reads your face, writes your prescription',
  '🎙️  Nefes ritmini dinliyor':
    '🎙️  Listens to your breathing rhythm',
  'Önce bugün ne hissettiğini söylüyorsun — istersen tek bir fotoğraf çekiyorsun ve yüz ifaden okunup reçeten ona göre yazılıyor.\n\n4 dakika uyguluyorsun. Nefes adımında mikrofon ritmini dinliyor.\n\nSonunda kendi puanınla ölçülen sinyal yan yana duruyor.\n\nHepsi bu — ve hepsi telefonunun içinde kalıyor.':
    'First you say how you feel today — or take a single photo and your expression is read, then your prescription is written from it.\n\nYou practise for 4 minutes. During the breathing step the microphone listens to your rhythm.\n\nAt the end your own rating sits next to the measured signal.\n\nThat is all — and all of it stays inside your phone.',
  '🤖 Yüz ifadenden {tespit} algılandı, buna göre {hedef} odaklı bir reçete hazırlandı.':
    '🤖 {tespit} was detected from your expression, so a prescription focused on {hedef} was prepared.',
  'Gerginliğe karşı ekstra bir sakinleştirme turu da eklendi.':
    'An extra calming round was also added against the tension.',
  'pozitif ve enerjik bir ifade':
    'a positive, energetic expression',
  'nötr, hafif dağınık bir ifade':
    'a neutral, slightly scattered expression',
  'gergin bir ifade':
    'a tense expression',
  'çok gergin, bunalmış bir ifade':
    'a very tense, overwhelmed expression',
  'SÜBJEKTİF · OBJEKTİF':
    'SUBJECTIVE · OBJECTIVE',
  'ÖLÇÜM DEFTERİ':
    'MEASUREMENT LOG',
  'Bu seansta iki ayrı ölçüm var: senin kendi verdiğin puan ve cihazın ölçtüğü. Aynı olmak zorunda değiller.':
    'This session holds two separate measurements: the rating you gave and what the device measured. They do not have to agree.',
  'Kameranın ölçtüğü':
    'Measured by the camera',
  'Her iki satır da aynı ölçekte: 1 = hiç yok, 10 = dayanılmaz.':
    'Both rows use the same scale: 1 = none at all, 10 = unbearable.',
  '🎙️ Nefesin ritüel sırasında %{yuzde} düzenliydi — bu ayrı bir ölçek, puanlarla toplanmaz.':
    '🎙️ Your breathing was {yuzde}% regular during the ritual — a separate scale, not added to the ratings.',
  'Ritüel öncesinde algın ile ölçülen örtüşüyordu.':
    'Before the ritual your sense and the measurement lined up.',
  'Ritüel öncesinde algın ile ölçülen ayrışmıştı — bu bir hata değil, ikisi farklı şeyler ölçüyor.':
    'Before the ritual your sense and the measurement diverged — not an error, they measure different things.',
  'Önce: senin puanın  ·  Sonra: kameranın ölçtüğü':
    'Before: your rating  ·  After: measured by the camera',
  'İkisi de senin verdiğin puan':
    'Both are ratings you gave yourself',
  '📷 Bu sayıyı kamera ölçtü — katılmıyorsan kaydırarak değiştir':
    '📷 The camera measured this number — slide to change it if you disagree',
  'Bir fotoğraf çek, reçeteni yüz ifaden belirlesin.':
    'Take one photo and let your expression write your prescription.',
  'YA DA KENDİN SEÇ':
    'OR CHOOSE YOURSELF',
  'Isı haritasındaki kutuların altında gördüğün ince şerit, kamera veya nefesle ölçülen ayrı bir sinyal. Burada {adet} seansın ortalaması:':
    'The thin strip under the heatmap cells is a separate signal measured by camera or breath. Here is the average of {adet} sessions:',
  'Ölçülen sinyal':
    'Measured signal',
  'Ortalamada birbirine yakın — algın ile ölçülen genelde örtüşüyor.':
    'Close on average — your sense and the measurement generally line up.',
  'Kendini ölçülenden daha kötü puanlama eğilimindesin.':
    'You tend to rate yourself worse than what is measured.',
  'Kendini ölçülenden daha iyi puanlama eğilimindesin.':
    'You tend to rate yourself better than what is measured.',
  'Kendi puanın':
    'Your own rating',
  'Kendi puanın (önce)':
    'Your rating (before)',
  'Kendi puanın (sonra)':
    'Your rating (after)',
  'Nefesinden ölçülen':
    'Measured from your breath',
  'Yüzünden ölçülen':
    'Measured from your face',
  'İkisi birbirine yakın — kendi algın ile ölçülen örtüşüyor.':
    'The two are close — your own sense matches what was measured.',
  'Aralarında fark var — bu bir hata değil, algın ile ölçülen bazen ayrışabilir.':
    "There's a gap between them — that's not an error, your sense and the measurement can diverge sometimes.",
  '🎙️ Mikrofon izni isteniyor…':
    '🎙️ Requesting microphone permission…',
  '🎙️ Nefesin dinleniyor':
    '🎙️ Listening to your breathing',
  '🎙️ Mikrofon izni verilmedi — yalnızca kendi puanınla devam edeceksin':
    "🎙️ Microphone permission denied — you'll continue with just your own rating",
  '🎙️ Mikrofon kullanılamadı':
    '🎙️ Microphone unavailable',
  'Mikrofon izni verilmediği için nefes değerlendirmesi yapılamadı.':
    'Breathing could not be assessed because microphone permission was denied.',
  'Nefes sinyali yakalanamadı — çok kısa ya da çok sessiz bir nefes olabilir.':
    'No breathing signal could be captured — it may have been too short or too quiet.',
  'Vazgeç, slider ile devam et':
    'Cancel, continue with the slider',
  'Çek':
    'Capture',
  '🤖 Yapay zeka duygularını anladı: bugünkü ritüele ekstra bir sakinleştirme turu eklendi.':
    "🤖 The AI read your mood: an extra calming round was added to today's ritual.",
  '🤖 Yapay zeka duygularını anladı: bugün sakin görünüyorsun, ritüel olduğu gibi sürüyor.':
    "🤖 The AI read your mood: you look calm today, the ritual continues as usual.",
  '🎙️ OBJEKTİF DEĞERLENDİRME':
    '🎙️ OBJECTIVE ASSESSMENT',
  'Nefesin ritüel sırasında %{yuzde} düzenliydi.':
    'Your breathing was %{yuzde} regular during the ritual.',
  'Bu bir duygu teşhisi değil — mikrofonla ölçülen nefes ritmi, kendi puanının yanına konan ayrı bir veri.':
    'This is not an emotion diagnosis — it is breathing rhythm measured by the microphone, a separate data point next to your own rating.',
  '↓ {fark} puan azaldı':
    '↓ down {fark} points',
  '%{yuzde} fark':
    '{yuzde}% difference',
  'Değişim yok — bu da veri':
    'No change — that is data too',
  'Bugün zordu. Yarın tekrar dene.':
    'Today was hard. Try again tomorrow.',
  'Sonucu Gör':
    'See the result',
  'Etki Gözlemlendi ⚗️':
    'Effect Observed ⚗️',
  'Veri Toplandı 📊':
    'Data Collected 📊',
  'Yarın Tekrar 🔄':
    'Again Tomorrow 🔄',
  '📋 SEANS ÖZETİ':
    '📋 SESSION SUMMARY',
  'Reçete':
    'Prescription',
  'Önce':
    'Before',
  'Sonra':
    'After',
  '{dk} dakika {sn} saniye':
    '{dk} min {sn} sec',
  '%{yuzde} etki gözlemlendi':
    '{yuzde}% effect observed',
  'Bugün zordu. Yarın tekrar.':
    'Today was hard. Again tomorrow.',
  '“Beklenti etkisi aktive edildi. Plasebo olduğunu bilmen etkiyi azaltmadı.”':
    '“The expectancy effect was activated. Knowing it was a placebo did not reduce it.”',
  '⚗️ Ölçtüğün şey senin izlenimin — plasebo araştırmaları da bunu ölçer.':
    '⚗️ What you measured is your impression — placebo research measures it too.',
  'Ana Sayfaya Dön':
    'Back to home',
  'Paylaş':
    'Share',
  'Bugün "{sikayet}" için plasebo ritüeli yaptım.':
    'Today I ran a placebo ritual for “{sikayet}”.',
  'Etki: %{yuzde} azalma 🧪':
    'Effect: {yuzde}% drop 🧪',
  'Etki: değişim yok — o da veri 🧪':
    'Effect: no change — that is data too 🧪',
  '✓ Bugünkü reçeten tamamlandı':
    '✓ Today’s prescription is done',
  '▶ Reçeteni al':
    '▶ Get your prescription',
  'ŞİKAYETE GÖRE':
    'BY COMPLAINT',
  '{deger} puan':
    '{deger} points',
  '{adet} seans':
    '{adet} sessions',
  'Ortalama düşüş: ritüel öncesi puan eksi sonrası puan.':
    'Average drop: score before the ritual minus the score after.',
  'Düşünce yoğunluğu':
    'Rumination',
  'Gerginlik':
    'Tension',
  'Motivasyon':
    'Motivation',
  'Kendim anlatayım':
    'Let me describe it myself',
  'Örn. Sabahları kalkmakta zorlanıyorum':
    'e.g. I struggle to get up in the mornings',
  'Kendi cümlen reçetenin adını ve formülün hedefini belirler. {kalan} karakter kaldı.':
    'Your own words decide the prescription’s name and the formula’s goal. {kalan} characters left.',
  'Kendi cümlen':
    'Your own words',
  'Kişiye Özel Karışım':
    'Bespoke Mixture',
  'Tarif Dışı Formül':
    'Off-Recipe Formula',
  'Özel Terkip':
    'Special Compound',
  'Ad Hoc Reçete':
    'Ad Hoc Prescription',
  'Anlattığın tabloya göre hazırlanmış, tek seferlik bir bileşim':
    'A one-off compound prepared from the picture you described',
  'Cümlendeki örüntüye eşlenen renk, ses ve nefes üçlüsü':
    'A colour, sound and breath trio matched to the pattern in your sentence',
  'Tarif ettiğin duruma göre ayarlanmış özel bir terkip':
    'A special compound tuned to the state you described',
  'Yalnızca bugünün ve senin cümlenin belirlediği bir formül':
    'A formula decided by today and your own sentence alone',
  'Arşiv taranıyor, sayfalar karıştırılıyor...':
    'Scanning the archive, shuffling pages...',
  'Bileşenler kaba dökülüyor...':
    'Pouring the ingredients into the vessel...',
  'Karışım demleniyor...':
    'The mixture is steeping...',
  'Formülün mühürleniyor...':
    'Sealing your formula...',
  'Nokta atışı reçete al':
    'Get a targeted prescription',
  'Şikayetini anlat, sana özel bir reçete hazırlansın. Günde bir kez.':
    'Describe your complaint and get a prescription of your own. Once a day.',
  'Dört formülün hazır':
    'Your four formulas are ready',
  'Odak, uyku, kaygı ve enerji — dördü de sabit olarak kullanımına açık ve her yeni gün için dördüne birden yeni bir formül hazırlanıyor. Seçim yapmana gerek yok; hangisiyle başlayacağına ana ekrandan karar verirsin, dilersen Ayarlar’dan da değiştirebilirsin.':
    'Focus, sleep, anxiety and energy — all four are permanently available, and a fresh formula is prepared for each of them every new day. Nothing to choose here; you decide which one to start with on the home screen, and you can change it in Settings.',
  'Dört sabit formül — her gün yenilenir, sınırsız tekrar':
    'Four fixed formulas — renewed daily, unlimited replays',
  'Günde 1 nokta atışı reçete (şikayete özel)':
    '1 targeted prescription a day (complaint-specific)',
  'Sınırsız nokta atışı reçete (günde bir sınırı kalkar)':
    'Unlimited targeted prescriptions (the daily limit is lifted)',
  '▶ Başlat':
    '▶ Start',
  '{recete} · tekrar uygula':
    '{recete} · apply again',
  'Bugünkü reçeten hazır; istediğin kadar tekrar uygulayabilirsin. Yeni reçete yarın.':
    'Today’s prescription is ready; apply it as often as you like. A new one tomorrow.',
  'Bugünkü sonucu gör':
    'See today’s result',
  'Günlük formüllerimi oluştur':
    'Prepare my daily formulas',
  'Kayıt açılıyor...':
    'Opening your record...',
  'Dört temel formülün hazırlanıyor':
    'Preparing your four core formulas',
  'Renkler ve sesler eşleştiriliyor...':
    'Matching colours and sounds...',
  'Nefes desenleri ayarlanıyor...':
    'Tuning the breathing patterns...',
  'Günlük formüllerin mühürleniyor...':
    'Sealing your daily formulas...',
  '{ad} için kişisel olarak hazırlanıyor':
    'Being prepared personally for {ad}',
  'Senin için kişisel olarak hazırlanıyor':
    'Being prepared personally for you',
  '⚗️ Hazırlanan şey bir ilaç değil, bir ritüel. Etkiyi kuran beklenti.':
    '⚗️ What is being prepared is a ritual, not a drug. Expectation is what builds the effect.',
  'Hangi şikayette ne kadar iyileştiğini gösteren takip {plan} ile açılır.':
    'Tracking that shows how much you improve per complaint is unlocked with {plan}.',
  'Reçete takibi — hangi şikayette ne kadar iyileştiğini izle':
    'Prescription tracking — follow how much you improve per complaint',

  /* ---- Hikâye akışlı giriş dersi ---- */
  '1955. Boston.\nBir hasta ağrı\ndindirilmez dedi.':
    '1955. Boston.\nA patient said the pain\ncould not be stopped.',
  'Dr. Henry Beecher ona bir iğne yaptı.\nİğnede sadece tuzlu su vardı.\n\nHasta 20 dakika sonra\n“ağrım geçti” dedi.':
    'Dr. Henry Beecher gave him an injection.\nThe syringe held nothing but saline.\n\nTwenty minutes later the patient said\n“the pain is gone.”',
  'Bu uygulamanın temeli o gün atıldı. →': 'This app was founded that day. →',
  '“Beyin bir sinyal aldığında ‘bu işe yarayacak’ diye karar verirse — gerçekten işe yarıyor.”':
    '“When the brain gets a signal and decides ‘this will work’ — it really does work.”',
  'Buna beklenti etkisi deniyor.': 'This is called the expectation effect.',
  'Beyin, inanılan şeyi\ngerçekleştirmek için\ngerçek kimyasallar salgılıyor.\n\nEndorfin. Dopamin. Serotonin.\n\nSahte bir tetikleyici,\ngerçek bir sonuç.':
    'To deliver what is believed,\nthe brain releases\nreal chemicals.\n\nEndorphin. Dopamine. Serotonin.\n\nA fake trigger,\na real result.',
  'Mehmet, 34, İstanbul': 'Mehmet, 34, Istanbul',
  'Sınav öncesi panik atak yaşıyordum. 3 hafta sonra sınav salonunda sakin oturdum.':
    'I used to have panic attacks before exams. Three weeks later I sat calmly in the exam hall.',
  'Ayşe, 28, Ankara': 'Ayşe, 28, Ankara',
  'Sabahları yataktan kalkmak çok zordu. Şimdi 07:00’de gözlerim kendiliğinden açılıyor.':
    'Getting out of bed was very hard. Now my eyes open by themselves at 07:00.',
  'Can, 41, İzmir': 'Can, 41, Izmir',
  'Toplantı öncesi ellerim titriyordu. Artık titremiyorlar.':
    'My hands shook before meetings. They do not shake anymore.',
  '⚗️ Etken madde kullanılmadı': '⚗️ No active ingredient was used',
  '* Temsili kullanıcı hikâyeleri': '* Representative user stories',
  'Böyle görünüyor.': 'This is what it looks like.',
  'Mucize değil.\nBeyin kimyası.': 'Not a miracle.\nBrain chemistry.',
  '😰  Bugün ne hissediyorsun?': '😰  How do you feel today?',
  '⚗️  Reçeten hazırlanıyor...': '⚗️  Preparing your prescription...',
  '🌀  Renk · Ses · Nefes · 4dk': '🌀  Color · Sound · Breath · 4 min',
  '📊  Önce: 8/10 → Sonra: 3/10': '📊  Before: 8/10 → After: 3/10',
  'Günde 4 dakika.': 'Four minutes a day.',
  'Önce bugün ne hissettiğini söylüyorsun.\n\nSonra sana özel bir protokol hazırlanıyor.\n\n4 dakika uyguluyorsun.\n\nÖncesi ve sonrasını ölçüyoruz.\n\nHepsi bu.':
    'First you say how you feel today.\n\nThen a protocol is prepared for you.\n\nYou apply it for four minutes.\n\nWe measure before and after.\n\nThat is all.',
  'Şüpheciler de dahil': 'Sceptics included',
  'olumlu etki bildirdi': 'reported a positive effect',
  '“İşe yaramaz” diye başlayanlar': 'Those who started with “it will not work”',
  '“Saçmalık” diyenler': 'Those who called it nonsense',
  'Doktorlar': 'Doctors',
  'Psikologlar': 'Psychologists',
  'Mühendisler': 'Engineers',
  '* Temsili dağılım': '* Representative distribution',
  'İnanmak zorunda değilsin.': 'You do not have to believe.',
  '2010 yılında Harvard’da yapılan çalışmada katılımcılara şu söylendi:\n\n“Bu hap tamamen şekerden yapılmış. İçinde hiçbir etken madde yok.”\n\nSonra hapı verdiler.\n\nKatılımcıların %59’u iyileşme bildirdi.\n\nBilmek, etkiyi durdurmadı.':
    'In a 2010 study at Harvard, participants were told:\n\n“This pill is made entirely of sugar. It contains no active ingredient at all.”\n\nThen they were given the pill.\n\n59% of participants reported improvement.\n\nKnowing did not stop the effect.',
  'ADIN NE?': 'WHAT IS YOUR NAME?',
  'Adını yaz...': 'Type your name...',
  '{ad}, beynin\nseni bekliyor.': '{ad}, your brain\nis waiting for you.',
  'Hazırlanıyor...': 'Preparing...',
  'İlk protokolümü başlat →': 'Start my first protocol →',
  'Verin cihazında kalır · Ücretsiz başla': 'Your data stays on your device · Start free',

  /* ---- Marka ve dil rehberi ---- */
  'ZİHİN PROTOKOLÜ': 'MIND PROTOCOL',
  'Plasebo Protokol Merkezi': 'Placebo Protocol Centre',
  'Dr. Plasebo, Nörobilim': 'Dr. Placebo, Neuroscience',
  '⚠️ Bu reçetede etken madde yok — etki var. Etki beklentiden gelir.':
    '⚠️ This prescription has no active ingredient — it has an effect. The effect comes from expectation.',
  '⚗️ Etken madde yok — etki var. Bu bir beklenti protokolü.':
    '⚗️ No active ingredient — there is an effect. This is an expectation protocol.',
  'Beklenti etkisi gerçektir': 'The expectation effect is real',
  '⚗️ Beklenti etkisi aktif — Harvard çalışması: %59 iyileşme bildirimi':
    '⚗️ Expectation effect active — Harvard study: 59% reported improvement',
  'Merhaba {ad}.': 'Hello {ad}.',
  'Dürüst ol. Beklenti protokolü dürüstlükle daha iyi çalışır.':
    'Be honest. An expectation protocol works better with honesty.',

  /* ---- Yeni tonal sesler ---- */
  'Handpan · D Minör': 'Handpan · D Minor',
  'Kalimba Deseni': 'Kalimba Pattern',
  'Rüzgâr Çanları': 'Wind Chimes',
  'Sıcak Ped · Am9': 'Warm Pad · Am9',
  'Handpan (uzun oturum)': 'Handpan (long session)',
  'Kalimba (çalışma)': 'Kalimba (study)',
  'Sıcak Ped (gece)': 'Warm Pad (night)',
  'Rüzgâr Çanları (gece)': 'Wind Chimes (night)',
  '⚗️ Handpan’ın pentatonik aralıkları zihinsel gezinmeyi %42 seyreltir':
    '⚗️ The handpan’s pentatonic intervals thin out mind-wandering by 42%',
  '⚗️ Kalimba deseninin düzenli aralıkları iç sesi %31 maskeler':
    '⚗️ The kalimba’s even intervals mask inner speech by 31%',
  '⚗️ Rüzgâr çanlarının seyrek vuruşları hafıza penceresini %21 uzatır':
    '⚗️ Sparse wind-chime strikes extend the memory window by 21%',
  '⚗️ Am9 pedinin sürekli tanısı solunum ritmini %35 düzleştirir':
    '⚗️ The sustained Am9 pad flattens breathing rhythm by 35%',

  /* ---- Hikâye slaytları (yeniden yazım) ---- */
  '1955. Boston, Amerika.': '1955. Boston, America.',
  /* Kisaltilmis giris slayti — iki calisma tek ekranda. */
  'Ağrısı geçmeyen bir hastaya enjeksiyon yapıldı.':
    'A patient whose pain would not lift was given an injection.',
  'Ağrısı geçti.':
    'The pain lifted.',
  '2010. Harvard.':
    '2010. Harvard.',
  'Hastalara sahte hap verildi — sahte olduğu söylenerek.':
    'Patients were given a fake pill, and told it was fake.',
  'Bu uygulamanın çıkış\nnoktası o iki çalışma.':
    'Those two studies are where\nthis app comes from.',
  'Bir hasta hastaneye geldi.': 'A patient came to the hospital.',
  'Aylardır süren ağrısı vardı.': 'He had been in pain for months.',
  'Hiçbir ilaç işe yaramamıştı.': 'No drug had worked.',
  'Doktorlar çaresiz kalmıştı.': 'The doctors were out of options.',
  'Dr. Henry Beecher ona bir iğne yaptı.': 'Dr. Henry Beecher gave him an injection.',
  'İğnenin içinde': 'The syringe held',
  'sadece tuzlu su vardı.': 'nothing but saline.',
  'Hasta 20 dakika sonra': 'Twenty minutes later the patient said',
  '“ağrım geçti”': '“the pain is gone”',
  ' dedi.': '.',
  'Bu uygulamanın temelleri\no gün atıldı.': 'This app was founded\nthat day.',

  'Beyin, inanılan şeyi\ngerçekleştirmek için\n': 'To deliver what is believed,\nthe brain releases\n',
  'gerçek kimyasallar': 'real chemicals',
  ' salgılıyor.': '.',
  'Endorfin.': 'Endorphin.',
  'Dopamin.': 'Dopamine.',
  'Serotonin.': 'Serotonin.',
  'Sahte bir tetikleyici': 'A fake trigger',
  'gerçek bir sonuç': 'a real result',

  'Sınav öncesi ': 'Before exams I had ',
  'panik atak': 'panic attacks',
  ' yaşıyordum. 3 hafta sonra sınav salonunda ': '. Three weeks later, in the exam hall, I ',
  'sakin oturdum': 'sat calmly',
  'Sabahları yataktan kalkmak ': 'Getting out of bed in the morning was ',
  'çok zordu': 'very hard',
  '. Şimdi 07:00’de gözlerim ': '. Now at 07:00 my eyes ',
  'kendiliğinden açılıyor': 'open by themselves',
  'Toplantı öncesi ellerim ': 'Before meetings my hands ',
  'titriyordu': 'used to shake',
  '. ': '. ',
  'Artık titremiyorlar': 'They do not shake anymore',

  '2010 yılında Harvard’da\nbir deney yapıldı.': 'In 2010 an experiment\nwas run at Harvard.',
  'Kronik ağrısı': 'Patients with chronic pain',
  ' olan hastalara\nküçük bir hap verildi.': '\nwere given a small pill.',
  'Tedaviniz için bu hapı kullanacaksınız.': 'You will take this pill as your treatment.',
  'Ancak bu hap tamamen ': 'But this pill is made entirely of ',
  'şekerden yapılmış': 'sugar',
  'İçinde hiçbir etken madde yok.': 'It contains no active ingredient at all.',
  'Yine de ': 'Even so, ',
  'iyileşeceksiniz': 'you will get better',
  'Hastalar hapı aldı.': 'The patients took the pill.',
  'Hapın plasebo olduğunu\n': 'Although they knew\n',
  'bildikleri halde...': 'it was a placebo...',
  '%59’u iyileşti.': '59% got better.',
  '— Kaptchuk et al., Harvard Medical School, 2010':
    '— Kaptchuk et al., Harvard Medical School, 2010',

  /* ---- Paylaşılan belge ---- */
  'PROTOKOL BELGESİ': 'PROTOCOL CERTIFICATE',
  '/10 hissettim': '/10 felt',
  'gün seri': 'day streak',
  'ETKİN MADDE: YOK': 'ACTIVE INGREDIENT: NONE',
  '— (sahte ritüel, kör test)': '— (sham ritual, blind test)',

  /* ---- Metin denetimi: anlatı ve arayüz ---- */
  'Bir hasta, ': 'A patient came to the hospital ',
  'aylardır geçmeyen bir ağrıyla': 'with pain that had not eased for months',
  ' hastaneye başvurdu.': '.',
  'Denenen ilaçlar sonuç vermedi.': 'The drugs that were tried did not work.',
  'Dr. Henry Beecher ona bir enjeksiyon yaptı.': 'Dr. Henry Beecher gave him an injection.',
  'Şırıngada': 'The syringe held',
  'yalnızca tuzlu su vardı.': 'nothing but saline.',
  'Yirmi dakika sonra hasta,': 'Twenty minutes later the patient',
  'ağrısının geçtiğini bildirdi.': 'reported that the pain was gone.',
  'Bu uygulamanın çıkış\nnoktası o çalışma.': 'That study is where\nthis app begins.',
  'fayda görebilirsiniz': 'you may still benefit',
  '%59’u iyileşme bildirdi.': '59% reported improvement.',

  'Telefonun bildirim ayarlarını kontrol edip tekrar dene.':
    'Check your phone’s notification settings and try again.',
  'Hatırlatmalar 10:00 ile 21:00 arasına dağıtılır; saatleri her hafta değişir.':
    'Reminders are spread between 10:00 and 21:00; the times change every week.',
  'Gün içinde değişen saatlerde kısa bir hatırlatma gönderir; her seferinde başka bir cümle. Sabit saatli günlük hatırlatıcıdan ayrıdır.':
    'Sends a short reminder at changing times through the day, with a different line each time. Separate from the fixed daily reminder.',
  'Dokunarak istediğin saati seç.': 'Tap to pick the time you want.',
  'Silme adımları ve kapsamı.': 'What deletion covers, step by step.',
  'Reklam gizlilik tercihleri': 'Ad privacy settings',
  'Ücretsiz sürümde Google AdMob üzerinden reklam gösterilir. Reklam tek bir yerde çıkar: bir seansı bitirip ana sayfaya dönerken. Ritüelin, ölçümün ya da nefes adımının ortasında hiçbir zaman reklam gösterilmez; günde en çok üç reklam çıkar.': 'The free version shows ads through Google AdMob. Ads appear in one place only: when you finish a session and return to the home screen. An ad is never shown in the middle of a ritual, a measurement or a breathing step, and you will see at most three a day.',
  'Reklamları getirmek için AdMob, cihazının reklam tanımlayıcısını ve cihaz bilgisi gibi standart reklam verilerini kendi gizlilik politikası kapsamında işler. Bu veriler uygulamadaki kayıtlarınla ilişkilendirilmez: şikâyetlerin, ölçümlerin, ritüel geçmişin, Sağlık verilerin ve kamera ya da mikrofonla yapılan ölçümler reklam ağına gönderilmez.': 'To serve those ads, AdMob processes the advertising identifier of your device and standard advertising data such as device information, under its own privacy policy. None of it is linked to what you record in the app: your complaints, your measurements, your ritual history, your Health data and anything measured with the camera or microphone are never sent to the ad network.',
  'iPhone’da izleme izni penceresine “izin verme” dersen uygulama aynen çalışır, yalnızca reklamlar ilgi alanlarına göre değil genel olarak seçilir.': 'If you decline the tracking prompt on iPhone, the app works exactly the same; the ads are simply chosen generally rather than by your interests.',
  'Reklam dışında analiz aracı, çökme raporlama servisi veya başka bir üçüncü taraf izleme kiti bulunmaz. Verilerin kimseye satılmaz veya paylaşılmaz.': 'Apart from ads there is no analytics tool, no crash reporting service and no other third-party tracking kit. Your data is never sold or shared.',
  'İnternet — oturum açma ve reklam için.': 'Internet — for signing in and for ads.',
  'Mikrofon — yalnızca ritüelin nefes adımında, sen o ölçümü başlatırsan istenir. Ses kaydedilmez ve hiçbir yere gönderilmez; kayıttan yalnızca nefes ritmine ait sayılar çıkarılır.': 'Microphone — asked for only during the breathing step of the ritual, and only if you start that measurement. Audio is not recorded and never leaves the device; only numbers describing your breathing rhythm are derived from it.',
  'Kamera — yalnızca sen ruh halini yüz ifadenden ölçmeyi seçersen istenir. Çekilen kareler cihazda işlenir, kaydedilmez ve cihazından çıkmaz; geriye yalnızca bir sayı kalır.': 'Camera — asked for only if you choose to measure your mood from your facial expression. Frames are processed on the device, never saved and never sent anywhere; all that remains is a single number.',
  'Apple Sağlık (yalnızca okuma, yalnızca iPhone) — yalnızca sen Ayarlar’dan açarsan istenir. Uyku süresi, dinlenme nabzı ve kalp atış hızı değişkenliği okunur; Sağlık uygulamasına hiçbir şey yazılmaz.': 'Apple Health (read only, iPhone only) — asked for only if you turn it on in Settings. Sleep duration, resting heart rate and heart rate variability are read; nothing is ever written back to the Health app.',
  'İzleme izni (yalnızca iPhone) — reklam tanımlayıcısının reklam kişiselleştirmesi için kullanılmasına izin verip vermediğini sorar; reddedilebilir.': 'Tracking permission (iPhone only) — asks whether the advertising identifier may be used to personalise ads. You can decline.',
  'Uygulama konuma, kişilere veya dosyalarına erişmez. Mikrofon, kamera ve Sağlık erişimlerinin üçü de isteğe bağlıdır: hiçbirine izin vermeden uygulamanın tamamı kullanılabilir.': 'The app does not access your location, your contacts or your files. Microphone, camera and Health access are all optional: the whole app can be used without granting any of them.',
  '4. Reklamlar': '4. Ads',
  'Reklamlar için verdiğin rızayı değiştir.': 'Change the consent you gave for ads.',

  '⚗️ Bu ölçüm senin izlenimin. Araştırmalarda ölçülen de tam olarak bu.':
    '⚗️ This measure is your own impression — exactly what the studies measure.',
  '⚗️ Doğru cevabı yok. Verdiğin puan, o anki hâlinin kaydı.':
    '⚗️ There is no right answer. Your score is a record of how you were.',
  '⚗️ İki ölçüm arasındaki fark bir kanıt değil, bir kayıt. Zamanla anlam kazanır.':
    '⚗️ The gap between the two scores is a record, not proof. It gains meaning over time.',
  'Bugün zordu. Yarın yeniden dene.': 'Today was hard. Try again tomorrow.',
  '⚗️ Bu analiz de plasebo. Burada hesaplanan hiçbir şey yok — yalnızca beklemek var.':
    '⚗️ This analysis is placebo too. Nothing is being computed here — only waiting.',
  'Google girişi şu an kullanılamıyor': 'Google sign-in is unavailable right now',

  /* ---- Akıllı hatırlatıcı mesajları ---- */
  'Bugünün formülü hâlâ seni bekliyor. İçinde hâlâ etken madde yok.':
    'Today’s formula is still waiting. It still has no active ingredient.',
  'Üç adım, iki dakika': 'Three steps, two minutes',
  'Renk, ses, nefes. Beklenti ölçülmüş bir mekanizma.':
    'Color, sound, breath. Expectation is a measured mechanism.',
  'İki dakika sonra da aynı yerde olacaksın. Bu sefer durarak.':
    'In two minutes you will be in the same place. This time having paused.',
  'Dikkatin dağıldıysa': 'If your attention has scattered',
  'Odak formülü 90 saniye sürüyor. Telefonu bırakmadan önce sığar.':
    'The focus formula takes 90 seconds. It fits before you put the phone down.',
  'Omuzların gerginse': 'If your shoulders are tight',
  'Sükunet formülünde nefes başa geçiyor. Sayıları tutturmak zorunda değilsin.':
    'In the calm formula, breath comes first. You do not have to hit the counts.',
  'Güne hız gerekiyorsa': 'If the day needs speed',
  'Enerji formülü parlak bir renkle başlıyor.': 'The energy formula opens with a bright color.',
  'Aynı formül bir yıl boyunca ikinci kez gelmiyor.':
    'The same formula does not come round twice in a year.',

  'İçeriğinin özel olduğunu ve ağrısını mutlaka dindireceğini söyledi.':
    'He told him the contents were special and would certainly stop the pain.',

  /* ---------------------------------------------------------------- */
  /* Satın alma ekranı                                                 */
  /* ---------------------------------------------------------------- */
  'Aylık': 'Monthly',
  'Yıllık': 'Yearly',
  'Ömür boyu': 'Lifetime',
  '/ay': '/mo',
  '/yıl': '/yr',
  ' tek seferlik': ' one-time',
  'En avantajlı': 'Best value',
  'İstediğin an durdur': 'Cancel any time',
  'Aylık plana göre çok daha ucuz': 'Much cheaper than the monthly plan',
  'Bir kez öde, hep senin': 'Pay once, yours for good',
  'Bekleniyor…': 'Working…',
  'gün': 'days',
  'hafta': 'weeks',
  'ay': 'months',
  'yıl': 'years',
  '{sure} {birim} ücretsiz, sonra {fiyat}': '{sure} {birim} free, then {fiyat}',
  'ücretlendirilir.': 'will be charged.',
  'Ücretsiz denemeyi başlat': 'Start free trial',
  "Premium'a geç": 'Go Premium',
  'Aboneliği yönet': 'Manage subscription',
  'Kullanım koşulları': 'Terms of use',
  'Abonelikler': 'Subscriptions',
  'PREMİUM İLE AÇILANLAR': 'WHAT PREMIUM UNLOCKS',
  'ÜCRETSİZ KADEMEDE NE VAR': "WHAT'S IN THE FREE TIER",
  'Premium üyeliğin etkin': 'Your Premium membership is active',
  'Ömür boyu üyesin': 'You have lifetime access',
  'Tek seferlik satın alındı. Yenileme yok, hep açık.':
    'Bought once. No renewal, always on.',
  '{tarih} tarihinde yenilenecek.': 'Renews on {tarih}.',

  /* Uyarı başlıkları ve satın alma katmanının mesajları */
  'Premium açıldı': 'Premium unlocked',
  'Satın alma': 'Purchase',
  'Satın alımlar': 'Purchases',
  'Premium açıldı.': 'Premium is now on.',
  'Mağazaya bağlanılamadı. Bağlantını kontrol et.':
    'Could not reach the store. Check your connection.',
  'Satın alma onay bekliyor. Onaylandığında premium açılacak.':
    'The purchase is awaiting approval. Premium opens once it is approved.',
  'Satın alma tamamlanamadı. Tekrar dene.': 'The purchase could not be completed. Try again.',
  'Satın alma başlatılamadı.': 'The purchase could not be started.',
  'Satın alımlar okunamadı. Tekrar dene.': 'Your purchases could not be read. Try again.',
  'Premium üyeliğin geri yüklendi.': 'Your Premium membership has been restored.',
  'Bu hesapta etkin bir üyelik bulunamadı.': 'No active membership was found on this account.',

  /* Abonelik koşulları — App Store'un satın alma noktasında zorunlu tuttuğu metin */
  '{plan} — {fiyat}, tek seferlik. Bu bir abonelik değildir: bir kez ödenir, yenilenmez, iptal edilecek bir şey yoktur.':
    '{plan} — {fiyat}, one-time. This is not a subscription: it is paid once, never renews, and there is nothing to cancel.',
  '{plan} — {fiyat}{donem}. {deneme}Bu bir aboneliktir ve dönem sonunda kendiliğinden yenilenir. Ödeme, satın almayı onayladığında hesabından tahsil edilir. Yenilemeyi durdurmak için dönem bitmeden en az 24 saat önce hesabının abonelik ayarlarına gitmen gerekir; uygulamayı silmek aboneliği iptal etmez.':
    '{plan} — {fiyat}{donem}. {deneme}This is a subscription and renews automatically at the end of each period. Payment is charged to your account when you confirm the purchase. To stop renewal, go to the subscription settings in your account at least 24 hours before the period ends; deleting the app does not cancel the subscription.',
  '{gun}: kendi puanın {kendi}, ölçülen {olculen}':
    '{gun}: your rating {kendi}, measured {olculen}',
  'yok':
    'none',
  '{tarih} · ölçüm yok':
    '{tarih} · no measurement',
  '{tarih} · kendi puanın {kendi} · ölçülen {olculen}':
    '{tarih} · your rating {kendi} · measured {olculen}',
  'Bir güne dokun — o günün iki ölçümünü göster. Ölçek: 1 = hiç yok, 10 = dayanılmaz.':
    'Tap a day to see both of its measurements. Scale: 1 = none at all, 10 = unbearable.',
  'Kendi verdiğin puan ile kameranın ölçtüğü, aynı ana ait {adet} kez yan yana kondu. İkisinin aynı olması gerekmiyor — aradaki kayma senin kendine bakışın.':
    "Your own rating and the camera's measurement were placed side by side {adet} times, from the same moment. They need not agree — the gap is how you see yourself.",
  'Kendini ölçülenden ortalama {fark} puan daha kötü görüyorsun. Bu bir hata değil; iç deneyim yüz ifadesinden ağır olabilir.':
    'On average you rate yourself {fark} points worse than the measurement. That is not an error; inner experience can weigh more than an expression.',
  'Kendini ölçülenden ortalama {fark} puan daha iyi görüyorsun. Yüzün, senin fark ettiğinden daha yorgun görünüyor olabilir.':
    'On average you rate yourself {fark} points better than the measurement. Your face may look more tired than you notice.',
  'Aradaki fark zamanla küçülüyor — kendini giderek daha yakın okuyorsun.':
    'The gap is shrinking over time — you are reading yourself more closely.',
  'Aradaki fark zamanla büyüyor — algın ile ölçülen ayrışıyor.':
    'The gap is widening over time — your sense and the measurement are diverging.',
  'Dakikada {adet} nefes — {yorum}':
    '{adet} breaths per minute — {yorum}',
  'yavaş ve sakin bir tempo':
    'a slow, calm pace',
  'dinlenme temposuna yakın':
    'close to a resting pace',
  'hızlı bir tempo':
    'a fast pace',
  'Derinlik: {yorum}':
    'Depth: {yorum}',
  'derin':
    'deep',
  'orta':
    'medium',
  'yüzeysel':
    'shallow',
  '🎙️ Nefesin ritüel sırasında %{yuzde} düzenliydi, dakikada {adet} nefes — bu ayrı bir ölçek, puanlarla toplanmaz.':
    '🎙️ Your breathing was {yuzde}% regular during the ritual, {adet} breaths per minute — a separate scale, not added to the ratings.',
  '⚡ REFLEKS ÖLÇÜMÜ':
    '⚡ REFLEX MEASUREMENT',
  'Ne kadar çabuk toparlanıyorsun?':
    'How quickly do you gather yourself?',
  'Ekran mora döndüğü anda dokun. {tur} tur sürer. Erken dokunursan o tur baştan başlar — tahmin etmenin bir faydası yok.':
    'Tap the moment the screen turns purple. It takes {tur} rounds. Tapping early restarts that round — guessing gains you nothing.',
  'Bu bir zeka ya da sağlık testi değil. Yalnızca dikkatini ne kadar hızlı topladığının kaydı — kendi puanının yanına konacak, senden bağımsız bir sayı.':
    'This is not an intelligence or health test. It only records how fast you gather your attention — a number independent of you, placed next to your own rating.',
  '{ms} ms':
    '{ms} ms',
  '{tur} geçerli turun ortanca tepki süresi.':
    'Median reaction time across {tur} valid rounds.',
  'Turların tutarlılığı: %{yuzde}':
    'Consistency across rounds: {yuzde}%',
  'Ölçüm çıkmadı':
    'No measurement',
  'Yeterince geçerli tur toplanamadı — çok erken ya da çok geç dokunulmuş olabilir. İstersen tekrar dene.':
    'Not enough valid rounds were collected — taps may have been too early or too late. Try again if you like.',
  'Tur {simdi}/{toplam}':
    'Round {simdi}/{toplam}',
  'Ekran mora döndüğünde dokun':
    'Tap when the screen turns purple',
  'Çok erken — bu tur baştan':
    'Too early — this round restarts',
  'Bu turda dokunulmadı':
    'No tap in this round',
  'Önceki tur: {ms} ms':
    'Previous round: {ms} ms',
  'Renk değişince dokun. Erken dokunma — {ms} ms altındaki dokunuşlar sayılmaz.':
    'Tap when the colour changes. Do not tap early — taps under {ms} ms do not count.',
  'Refleks: {ms} ms — yeniden ölç':
    'Reflex: {ms} ms — measure again',
  // Simgeli ikizi ritüel sonrası ölçüm ekranında kullanılıyor; o ekranın
  // bütün bağlantıları simgeyle başlıyor (📷, ⚡), reçete ekranında ise
  // simge ayrı bir öge.
  '⚡ Refleks: {ms} ms — yeniden ölç':
    '⚡ Reflex: {ms} ms — measure again',
  'Refleksini de ölç':
    'Measure your reflex too',
  'İsteğe bağlı. Ritüelden önce ve sonra tepki süreni ölçüp farkı görebilirsin.':
    'Optional. Measure your reaction time before and after the ritual and see the difference.',
  '⚡ Refleksini yeniden ölç (önce {ms} ms idi)':
    '⚡ Measure your reflex again (it was {ms} ms before)',
  'Tepki süren (ms)':
    'Your reaction time (ms)',
  'Yukarıdaki satırlar aynı ölçekte: 1 = hiç yok, 10 = dayanılmaz.':
    'The rows above share one scale: 1 = none at all, 10 = unbearable.',
  '⚡ Tepki süren neredeyse aynı kaldı. Bu ölçüm gün içinde kendiliğinden oynar; %{esik} altındaki farkı değişim saymıyoruz.':
    '⚡ Your reaction time barely moved. This measurement drifts on its own during the day; we do not count a change under {esik}%.',
  '⚡ Tepki süren %{yuzde} hızlandı.':
    '⚡ Your reaction time got {yuzde}% faster.',
  '⚡ Tepki süren %{yuzde} yavaşladı.':
    '⚡ Your reaction time got {yuzde}% slower.',
  '🛏️ Dün gece {saat} saat {dakika} dakika uyumuşsun.':
    '🛏️ You slept {saat}h {dakika}m last night.',
  'Kısa bir geceydi; bugünün reçetesine fazladan bir sakinleştirme turu eklendi.':
    "It was a short night; an extra calming round was added to today's prescription.",
  'Orta bir geceydi; reçete olduğu gibi bırakıldı.':
    'It was a middling night; the prescription was left as is.',
  'İyi bir geceydi; reçete olduğu gibi bırakıldı.':
    'It was a good night; the prescription was left as is.',
  'Son dinlenme nabzın {nabiz}.':
    'Your latest resting heart rate is {nabiz}.',
  'Sağlık verisi (Apple Sağlık)':
    'Health data (Apple Health)',
  'Sağlık verisi kullanılamıyor':
    'Health data unavailable',
  'Bu cihazda Sağlık verisi okunamıyor.':
    'Health data cannot be read on this device.',
  'Şimdilik okunacak veri yok':
    'No data to read yet',
  'Bağlantı açıldı ama Sağlık uygulamasında dün geceye ait uyku ya da dinlenme nabzı kaydı bulunamadı. Bu genelde saat/uyku takibi olmadığında olur. Kayıt oluştuğunda reçeten kendiliğinden ona göre ayarlanır.':
    'The connection is on, but Health has no sleep or resting heart rate entry for last night. This usually means no watch or sleep tracking. Once an entry exists, your prescription adjusts to it automatically.',
  'Dün geceki uyku süren ve dinlenme nabzın okunuyor; az uyunmuş bir gecede reçeteye fazladan bir sakinleştirme turu ekleniyor. Sağlık uygulamasına hiçbir şey yazılmaz.':
    'Your sleep duration and resting heart rate are read; after a short night an extra calming round is added to the prescription. Nothing is ever written back to Health.',
  'Kapalı. Açarsan dün geceki uyku süren okunup reçeteni etkiler. Veri cihazından çıkmaz, hiçbir şey geri yazılmaz.':
    "Off. Turn it on and last night's sleep will shape your prescription. The data never leaves your device and nothing is written back.",
  'Okunuyor…':
    'Reading…',
  '📅 Bu haftanın özeti':
    "📅 This week's summary",
  'Son 7 günde {adet} ritüel yaptın; ortalama etki {etki} puan.':
    'You did {adet} rituals in the last 7 days; average effect {etki} points.',
  'En iyi geçen gün {gun}, ortalamanın %{yuzde} üstünde.':
    'Your best day was {gun}, {yuzde}% above your average.',
  'Kendi puanınla ölçülen arasındaki ortalama fark {fark} puan.':
    'The average gap between your own rating and the measurement is {fark} points.',
  'Az uyuduğun gecelerin ortalama etkisi {az}, diğer gecelerin {cok}. Bu bir neden-sonuç değil, yalnızca bir eşlik.':
    'Nights you slept little average {az} effect, other nights {cok}. That is a co-occurrence, not a cause.',
  '{adet} karenin ortancası alındı — tek karelik sapmalar elendi.':
    'Median of {adet} frames — single-frame outliers were dropped.',
  'Yalnızca tek kare okunabildi; sonuç daha oynak olabilir.':
    'Only one frame could be read; the result may be less stable.',
  'ÖLÇÜM DEFTERİ · SON 7 GÜN':
    'MEASUREMENT LOG · LAST 7 DAYS',
  'Algın ile ölçülen örtüşüyor. Ayrıntı için dokun.':
    'Your sense and the measurement line up. Tap for detail.',
  'Kendini ölçülenden {fark} puan daha kötü görüyorsun. Ayrıntı için dokun.':
    'You rate yourself {fark} points worse than the measurement. Tap for detail.',
  'Kendini ölçülenden {fark} puan daha iyi görüyorsun. Ayrıntı için dokun.':
    'You rate yourself {fark} points better than the measurement. Tap for detail.',
  'Ölçülen':
    'Measured',
  'etki':
    'effect',
  'KÖR TEST':
    'BLIND TEST',
  'Ölçülen şey ritüelin etkisi: o günün öncesi eksi sonrası. Sahte günlerde renk, ses ve nefes verilmiyor — yalnızca aynı süre bekleniyor.':
    "What is measured is the ritual's effect: that day's before minus after. On sham days no colour, sound or breathing is given — only the same wait.",
  'Eski kayıtlarda önce/sonra ölçümü olmadığı için gün sonu puanı karşılaştırılıyor; bu ölçü ritüel dışındaki her şeyden de etkilenir.':
    'Older records have no before/after measurement, so the end-of-day rating is compared; that measure is also affected by everything outside the ritual.',
  'Gerçek ({adet})':
    'Real ({adet})',
  'Sahte ({adet})':
    'Sham ({adet})',
  'Aradaki fark {fark} puan. Yorumlamak için her iki tarafta en az {gereken} kayıt ve en az {esik} puan fark gerekiyor — şu an bu bir sonuç değil, biriken bir kayıt.':
    'The gap is {fark} points. Interpreting it needs at least {gereken} records on each side and a gap of at least {esik} points — for now this is a record being built, not a result.',
  'Gerçek ritüel günlerin sahte günlerden {fark} puan iyi geçmiş. Fark sende; ritüel bir çerçeve kuruyor.':
    'Your real ritual days went {fark} points better than sham days. The difference is in you; the ritual builds a frame.',
  'Sahte günlerin {fark} puan daha iyi geçmiş. Bu da mümkün ve bir hata değil — beklentinin ritüele ihtiyacı olmayabilir.':
    'Your sham days went {fark} points better. That is possible and not an error — expectation may not need the ritual.',
  'PUAN NASIL OKUNUR':
    'HOW TO READ THE SCORE',
  '1 = hiç yok':
    '1 = none at all',
  '10 = dayanılmaz':
    '10 = unbearable',
  'Ölçek ters: düşen sayı iyiye gidiyor demek.':
    'The scale is inverted: a falling number means things are improving.',
  '1 = hiç yok  ·  10 = dayanılmaz  ·  düşük puan iyi':
    '1 = none at all  ·  10 = unbearable  ·  lower is better',

  /* ------------------------------------------------------------------
   * Plasebo Plus — abonelik modeli.
   *
   * Ayrım ilkesi: ritüel herkese açık, ölçüm Plus'ta. Aşağıdaki
   * metinler plan ekranını, kilit satırlarını ve yüz taraması
   * yapılamadığında devreye giren elle puanlama yolunu kapsıyor.
   * ---------------------------------------------------------------- */
  'Ritüel ücretsiz ve öyle kalacak. Plus, ritüelin sende işe yarayıp yaramadığını sana ölçerek söyler.':
    'The ritual is free and will stay free. Plus tells you whether it is working for you — by measuring.',
  '{plan} üyeliğin etkin': 'Your {plan} membership is active',
  '{plan} açıldı': '{plan} is now active',
  'Plus\'a geç': 'Get Plus',
  '%{yuzde} indirim · ayda {aylik}': '{yuzde}% off · {aylik} per month',
  'PLUS İLE AÇILANLAR': 'WHAT PLUS UNLOCKS',
  'Yüz taramasıyla ölçüm': 'Measurement by face scan',
  'Önce ve sonra puanını sen tahmin etme — kamera ölçsün. Cihaz üstündeki duygu modeli yüz ifadeni okur, fotoğraf telefonundan çıkmaz.':
    'Stop guessing your before and after scores — let the camera measure them. The on-device emotion model reads your expression, and the photo never leaves your phone.',
  'Nefes analizi': 'Breath analysis',
  'Ritüel sırasında nefesinin düzenliliğini, derinliğini ve dakikadaki sayısını ölçer. Sakinleştiğini hissetmekle ölçmek ayrı şeyler.':
    'Measures how regular and how deep your breathing is during the ritual, and how many breaths you take per minute. Feeling calmer and measuring it are two different things.',
  'Gün içi ölçüm ve sabah raporu': 'Daytime check-ins and a morning report',
  'Gün içinde üç kısa nefes ölçümü, ertesi sabah uyku ve nabzınla birleşen tek bir rapor. Günün hangi saatinde en sakin olduğunu gösterir.':
    'Three short breathing check-ins during the day, then one report the next morning that folds in your sleep and heart rate. It shows which hour of the day you are calmest.',
  'Sınırsız yüz taramalı ölçüm (günde 1 sınırı kalkar)':
    'Unlimited face-scan measurement (the 1-per-day limit is lifted)',
  'Nefes analizi — düzenlilik, derinlik, dakikadaki nefes':
    'Breath analysis — regularity, depth, breaths per minute',
  'Gün içi ölçüm daveti ve ertesi sabah günlük rapor':
    'Daytime check-in invitations and a daily report the next morning',
  'Tüm geçmiş ve gelişmiş formül havuzu': 'Full history and the advanced formula pool',
  'Reklamsız': 'No ads',
  'Dört günlük formül — her gün yenilenir, sınırsız tekrar':
    'Four daily formulas — refreshed every day, repeat as often as you like',
  'Günde 1 yüz taramalı ölçüm, sonrası kendi puanın':
    'One face-scan measurement a day; after that, your own score',
  'Refleks testi — önce/sonra tepki süresi': 'Reflex test — before/after reaction time',
  '7 günlük geçmiş, günlük hatırlatıcı, kör test':
    '7 days of history, the daily reminder and the blind test',
  'Kamera olmadan elle puanla': 'Score it yourself without the camera',
  'Şu an nasılsın?': 'How are you right now?',
  'Ölçüm tamam': 'Measurement done',
  'Bu puan senin izlenimin — başlangıç puanı da öyleydi':
    'This score is your own impression — so was the starting one',
  'Puanı seçtiğinde önce/sonra farkı burada çıkacak':
    'Pick a score and the before/after difference will appear here',
  'Bugünkü ölçüm hakkın doldu. {plan} ile sınırsız.':
    'You have used today\'s measurement. {plan} makes it unlimited.',
  'Ritüel süresini kendin ayarlamak {plan} ile açılır.':
    'Setting the ritual length yourself is unlocked with {plan}.',
  'Gün içinde üç kısa nefes ölçümü ve ertesi sabah tek bir rapor. {plan} ile açılır.':
    'Three short breathing check-ins during the day and one report the next morning. Unlocked with {plan}.',
  '⚗️ Ücretsiz kademe de tam bir ritüel çalıştırır. Plus ölçüm ekler, etki eklemez — çünkü eklenecek bir etki yok.':
    '⚗️ The free tier runs a complete ritual too. Plus adds measurement, not effect — because there is no effect to add.',
  '🔒 Ücretsiz kademe son {gun} günü gösterir. Tüm geçmiş {plan} ile açılır.':
    '🔒 The free tier shows the last {gun} days. Your full history is unlocked with {plan}.',
  '🔒 Reçete takibi · {plan}': '🔒 Prescription tracking · {plan}',
};
