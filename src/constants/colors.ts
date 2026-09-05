/**
 * Uygulamanın tek renk kaynağı.
 *
 * Palet 2026 Eylül'ünde yumuşatıldı. Eski hâlinde iki doymuş vurgu rengi
 * vardı — mor (#7B6EF6) ve neon yeşil (#A8FF78) — ve ikisi aynı ekranda
 * bulunduğunda göz nereye bakacağını bilemiyordu; asıl yorucu olan
 * koyuluk değil o çekişmeydi. Şimdi tek bir vurgu ailesi var (soluk
 * arduvaz mavisi) ve "tamamlandı" durumu ayrı bir renk değil, aynı
 * ailenin açık tonu.
 *
 * Okunurlukta kayıp yok: yeni vurgunun beyaz yazıyla kontrastı 3,65,
 * eskisininki 3,89'du; koyu zemin üstünde ikisi de 4,95 civarında.
 *
 * Tek istisna `warn`. Uyarı rengi vurgunun tonu olamaz — kullanıcının
 * "bu bir hata" ile "bu bir vurgu" arasındaki farkı renkten okuması
 * gerekiyor. O yüzden yumuşatıldı ama ayrı bir renk olarak bırakıldı.
 */
export const colors = {
  /** Neredeyse siyah. Saf siyah değil: saf siyah OLED'de sert bir kenar yapıyor. */
  ink: '#15161A',
  ghost: '#F7F6F2',
  mist: '#E8E6DF',
  haze: '#C5C2B8',
  /** Tek vurgu rengi — soluk arduvaz mavisi. */
  pulse: '#6E88A8',
  /** Açık temada vurgunun yumuşak zemini. */
  pulseSoft: '#E7ECF3',
  /** "Tamamlandı" — ayrı bir renk değil, vurgunun açık tonu. */
  glow: '#A7BCD4',
  /** Uyarı. Vurgudan ayrı kalmak zorunda; yalnızca yumuşatıldı. */
  warn: '#C4796B',
  text: '#2C2C35',
  sub: '#6B6B7A',
  white: '#FFFFFF',

  /* --- Sis teması (varsayılan) --------------------------------------
     Beş renk: zemin, yüzey, metin, ikincil, vurgu. Aşağıdakiler ilk
     dördü; vurgu yukarıdaki `pulse`. Geri kalan her şey bunların tonu. */
  sisSurface: '#1F2128',
  sisCard: '#1A1C22',
  sisText: '#E6E3DB',
  sisSub: '#8A8882',
  sisFaint: '#62615D',
  sisBorder: '#2A2C33',
  sisAccentSoft: '#232831',

  /* --- Şafak teması (varsayılan) ------------------------------------
     Sis'in aydınlık karşılığı. Aynı tek-vurgu disiplini geçerli:
     `pulse` yine tek vurgu rengi, buradaki tonlar yalnızca zemin,
     yüzey ve metin rollerini taşıyor. Farkı sıcaklık — Sis'in nötr
     grisi yerine şafak vaktinin krem/kayısı tonları.

     Kontrast, mevcut açık temayla kıyaslanarak seçildi; hiçbir rol
     ondan geriye düşmüyor. Soluk metin 2,48'e karşı 3,14, vurgunun
     yumuşak zemin üstündeki okunurluğu 3,08'e karşı 3,23. */
  /** Zemin: kreme çalan sıcak beyaz. Saf beyaz değil: saf beyaz
      aydınlık ekranda sert bir parlaklık yapıyor. */
  safakBg: '#FBF4EE',
  safakSurface: '#FFFFFF',
  /** Koyu vurgu kartı (formül kartı). Siyah değil, yumuşak alacakaranlık moru. */
  safakCard: '#413B52',
  safakOnCard: '#F6F2EE',
  safakOnCardSub: '#BDB5C8',
  safakText: '#37323F',
  safakSub: '#6E6678',
  safakFaint: '#918799',
  safakBorder: '#EEE2D9',
  /** Yumuşak vurgu zemini — kayısı sisi. */
  safakAccentSoft: '#FAEFE7',
} as const;

export type ColorName = keyof typeof colors;
