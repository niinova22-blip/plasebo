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
  'KURULUM · 1/3': 'SETUP · 1/3',
  'KURULUM · 2/3': 'SETUP · 2/3',
  'KURULUM · 3/3': 'SETUP · 3/3',
  'Sana nasıl hitap edelim?': 'What should we call you?',
  'Tek satırlık bir şey. Uygulama içinde seni bununla selamlayacak, başka hiçbir yere gitmeyecek.':
    'Just one line. The app will greet you with it and it goes nowhere else.',
  'Örn. Deniz': 'e.g. Alex',
  '⚗️ Adın formülü değiştirmez. Hiçbir şey formülü değiştirmez — tarih hariç.':
    '⚗️ Your name does not change the formula. Nothing does — except the date.',
  'Devam etmek için Google hesabınla giriş yap. Hesap, serini ve ileride üyeliğini bu cihaza bağlamak için gerekiyor. Ritüel kayıtların yine telefonunda kalır.':
    'Sign in with your Google account to continue. The account ties your streak and, later, your membership to this device. Your ritual records still stay on your phone.',
  'Google ile devam et': 'Continue with Google',
  'Google girişi yapılandırılmamış': 'Google sign-in is not configured',
  'Bu derlemede Google Web istemci kimliği tanımlı olmadığı için giriş yapılamıyor ve giriş zorunlu olduğundan uygulama burada duruyor. Kurulum için src/config/auth.ts dosyasındaki açıklamaya bak.':
    'This build has no Google web client ID, so signing in is impossible — and since sign-in is required, the app stops here. See the notes in src/config/auth.ts to set it up.',
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
  'Formülümü oluştur': 'Create my formula',
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
  '▶ Ritüeli Başlat': '▶ Start the ritual',
  '▶ Tekrar Başlat': '▶ Start again',
  '{formul} ritüelini başlat': 'Start the {formul} ritual',
  '{sure} sn': '{sure} s',
  '{tur} tur': '{tur} rounds',
  '{ad} · ~{sure} sn': '{ad} · ~{sure} s',
  '🎲 Farklı formül dene': '🎲 Try a different formula',
  '🔒 Kriz modu · yakında': '🔒 Crisis mode · coming soon',
  '🔒 Yakında': '🔒 Coming soon',
  'yakında': 'coming soon',
  'Premium henüz açık değil': 'Premium is not open yet',
  'Aşağıdakiler ilerideki bir güncellemede açılacak. Şimdilik satın alınacak bir şey yok; ücretsiz kademe bugün tam çalışıyor — dört hedefin günlük formülü ve sınırsız tekrar dahil.':
    'The features below will be unlocked in a future update. There is nothing to buy for now; the free tier is fully working today — including a daily formula for all four goals and unlimited replays.',
  'Bu bugünkü formülün değil. Yarın normal formülüne döneceksin.':
    'This is not today’s formula. Tomorrow you go back to your usual one.',
  'Günün formülüne dön': 'Back to today’s formula',

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
  '🔒 Ücretsiz kademe son {gun} günü gösterir. Tüm geçmiş yakında açılacak.':
    '🔒 The free tier shows the last {gun} days. Full history is coming soon.',
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
  '🔒 {gizli} eski kayıt gizli. Ücretsiz kademe son {gun} günü gösterir — kayıtlar silinmedi, ileride hepsi geri gelecek.':
    '🔒 {gizli} older records are hidden. The free tier shows the last {gun} days — nothing was deleted, they will all come back later.',
  'Henüz kayıt yok. İlk ritüelini tamamladığında burada birikmeye başlayacak.':
    'No records yet. They start piling up here once you finish your first ritual.',

  /* ---------------------------------------------------------------- */
  /* Ayarlar                                                           */
  /* ---------------------------------------------------------------- */
  'Ritüel verilerin yalnızca bu cihazda tutulur.':
    'Your ritual data is kept on this device only.',
  'HESAP': 'ACCOUNT',
  'Google ile giriş yap': 'Sign in with Google',
  'Devam etmek için gerekli.': 'Required to continue.',
  'Oturumu kapat': 'Sign out',
  'Ritüel kayıtların telefonunda kalmaya devam eder.':
    'Your ritual records stay on your phone.',
  'Plan': 'Plan',
  'Tüm özellikler açık · {adet} içerik paketi':
    'Everything unlocked · {adet} content packs',
  'Tüm özellikler açık.': 'Everything unlocked.',
  'Dört hedef, temel formül havuzu, 7 günlük geçmiş. Premium yakında.':
    'Four goals, the basic formula pool, 7 days of history. Premium coming soon.',
  'ADIN': 'YOUR NAME',
  'Adın': 'Your name',
  'Dört hedefin de günlük formülü açık. Günün formülü yalnızca seçtiğin hedeften ve tarihten üretilir; hedefi ana ekrandan da değiştirebilirsin.':
    'The daily formula for all four goals is open. Today’s formula is generated only from the goal you pick and the date; you can also switch goals from the home screen.',
  'Formülü belirleyen hedef': 'Goal that decides the formula',
  'GÖRÜNÜM': 'APPEARANCE',
  'Açık': 'Light',
  'Koyu': 'Dark',
  'Renk paleti aynı kalır; yalnızca zemin ve metin rolleri yer değiştirir.':
    'The palette stays the same; only the background and text roles swap.',
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
  'Ritüel süresini kendin ayarlamak yakında açılacak.':
    'Setting the ritual length yourself is coming soon.',
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
  'Google hesap bağlantın, adın, hedeflerin, serin, ayarların ve tüm ritüel kayıtların telefonundan silinir. Sunucuda kopyası yok. Geri alınamaz.':
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
  'Satın alma henüz açılmadı. Abonelikler Google Play üzerinden yakında etkinleşecek.':
    'Purchases are not open yet. Subscriptions will go live through Google Play soon.',
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
  'Şu an nasılsın?':
    'How are you right now?',
  'Şimdi nasılsın?':
    'And now?',
  '1 = hiç yok  ·  10 = dayanılmaz':
    '1 = none at all  ·  10 = unbearable',
  'Zihnindeki dağınıklığı şu an puanla':
    'Rate the scatter in your mind right now',
  'İçindeki sıkışıklığı şu an puanla':
    'Rate the tightness inside you right now',
  'Enerji eksikliğini şu an puanla':
    'Rate your lack of energy right now',
  'Kafandaki kalabalığı şu an puanla':
    'Rate the crowd in your head right now',
  'Bedenindeki gerilimi şu an puanla':
    'Rate the tension in your body right now',
  'Hareketsizlik hissini şu an puanla':
    'Rate the stuckness right now',
  '⚗️ Bu ölçüm senin izlenimin — plasebo araştırmalarının ölçtüğü de bu.':
    '⚗️ This measurement is your impression — which is what placebo research measures too.',
  'Ölçüm Tamam':
    'Measurement done',
  'Kaydırarak şu anki hâlini işaretle':
    'Slide to mark how you are now',
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
};
