/**
 * Uygulama içi yasal metinler.
 *
 * Aynı içerik `docs/` altındaki HTML sayfalarında da duruyor — Google Play
 * konsolu dışarıdan erişilebilen bir adres istediği için o kopya
 * korunuyor. Uygulama içinde ise metin buradan okunuyor: yasal sayfaya
 * dokunan kullanıcı tarayıcıya (ve yayımlanmamış bir adrese) düşmek
 * yerine metni doğrudan uygulamada görüyor.
 *
 * İki kopyadan biri değişirse diğeri de güncellenmelidir.
 */

export type LegalDocId = 'privacy' | 'dataDeletion';

export interface LegalSection {
  heading: string;
  /** Düz paragraflar. */
  body?: string[];
  /** Madde imli liste. */
  bullets?: string[];
  /** Çerçeve içinde vurgulanan not. */
  callout?: string;
}

export interface LegalDoc {
  title: string;
  meta: string;
  lede: string;
  sections: LegalSection[];
  footer: string;
}

export const CONTACT_EMAIL = 'niinova22@gmail.com';

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: 'Gizlilik Politikası',
    meta: 'Plasebo · Son güncelleme: 13 Ağustos 2026 · Paket adı: com.plasebo.app',
    lede: 'Plasebo, günlük bir plasebo ritüeli sunan bir uygulamadır. Bu politika uygulamanın hangi verileri işlediğini açıklar. Kısa cevap: Plasebo’nun sunucusu yoktur ve ritüel verilerin cihazından hiçbir yere gönderilmez.',
    sections: [
      {
        heading: '1. Veri sorumlusu',
        body: [
          `Plasebo bağımsız bir geliştirici tarafından yayımlanmaktadır. İletişim: ${CONTACT_EMAIL}`,
        ],
      },
      {
        heading: '2. İşlenen veriler',
        bullets: [
          'Ad, e-posta adresi, profil fotoğrafı bağlantısı — Google hesabınla oturum açtığında Google’dan, iPhone’da Apple ile giriş yaptığında Apple’dan alınır; yalnızca cihazının yerel deposunda tutulur. Amacı: hesabını tanımak ve seni adınla selamlamak. Apple girişinde e-postanı gizlemeyi seçersen uygulamaya yalnızca Apple’ın ürettiği yönlendirme adresi ulaşır.',
          'Adın, seçtiğin hedefler, ritüel kayıtların, puanların, notların, serin ve ayarların — uygulama içinde senin girdiğin bilgilerdir, yalnızca cihazının yerel deposunda tutulur. Amacı: geçmiş, istatistik ve hatırlatıcının çalışması.',
        ],
        callout:
          'Sunucuya gönderilen hiçbir veri yoktur. Plasebo’nun arka uç sunucusu, veritabanı veya hesap altyapısı bulunmaz. Uygulama silindiğinde bu verilerin tamamı cihazdan silinir.',
      },
      {
        heading: '3. Ağ bağlantıları',
        body: ['Plasebo yalnızca iki durumda internete bağlanır:'],
        bullets: [
          'Google ile oturum açma. Google’ın kendi oturum açma ekranına yönlendirilirsin; bu, Google’ın gizlilik politikasına tabidir. Uygulama yalnızca “profile” ve “email” kapsamlarını ister.',
          'Apple ile oturum açma (yalnızca iPhone). Apple’ın sistem penceresi açılır; bu, Apple’ın gizlilik politikasına tabidir. Uygulama yalnızca ad ve e-posta ister; ad ve e-posta Apple tarafından yalnızca ilk girişte verilir.',
          'Profil bilgisinin okunması. Oturum açtıktan hemen sonra adın, e-postan ve profil fotoğrafı bağlantın bir kez okunur ve cihazına yazılır. Erişim anahtarı saklanmaz.',
        ],
      },
      {
        heading: '4. Analitik, reklam ve izleme yoktur',
        body: [
          'Plasebo’da analiz aracı, reklam ağı, çökme raporlama servisi veya üçüncü taraf izleme kiti bulunmaz. Reklam kimliği okunmaz. Verilerin kimseye satılmaz veya paylaşılmaz.',
        ],
      },
      {
        heading: '5. İzinler',
        bullets: [
          'Bildirimler — yalnızca Ayarlar’dan günlük hatırlatıcıyı açarsan istenir. Bildirimler cihazda zamanlanır; push sunucusu kullanılmaz.',
          'İnternet — yalnızca Google ya da Apple ile oturum açma için.',
          'Titreşim — dokunsal geri bildirim için; Ayarlar’dan kapatılabilir.',
        ],
        body: [
          'Uygulama mikrofona, kameraya, konuma, kişilere veya dosyalarına erişmez.',
        ],
      },
      {
        heading: '6. Verilerini silmek',
        body: [
          'Ayarlar → Veri → “Hesabı ve tüm verileri sil” adımı; adını, hedeflerini, tüm ritüel kayıtlarını, ayarlarını ve kayıtlı Google ya da Apple hesap bilgilerini cihazından kalıcı olarak siler. Yalnızca oturumu kapatmak için Ayarlar → Hesap → Oturumu kapat yeterlidir.',
          'Google hesabının Plasebo’ya verdiği erişimi dilediğin zaman myaccount.google.com/permissions adresinden kaldırabilirsin. Apple ile giriş kullandıysan aynı işlem iPhone’da Ayarlar → (adın) → Oturum Açma ve Güvenlik → Apple ile Oturum Aç altından yapılır.',
        ],
      },
      {
        heading: '7. Çocuklar',
        body: [
          'Plasebo çocuklara yönelik değildir ve 13 yaşın altındaki kullanıcılardan bilerek veri toplamaz.',
        ],
      },
      {
        heading: '8. Sağlıkla ilgili uyarı',
        body: [
          'Plasebo bir tıbbi cihaz değildir; tanı koymaz, tedavi etmez ve hiçbir tıbbi desteğin yerine geçmez. Uygulamanın sunduğu “formüller” bilinçli olarak plasebodur ve uygulama bunu her ekranda açıkça belirtir. Sağlığınla ilgili bir endişen varsa bir sağlık profesyoneline başvur.',
        ],
      },
      {
        heading: '9. Değişiklikler',
        body: [
          'Bu politika değişirse buradaki tarih güncellenir. Toplanan veri türlerini genişleten bir değişiklik olursa uygulama içinde bildirilir.',
        ],
      },
    ],
    footer: `Plasebo — bilerek inan. Sorular için: ${CONTACT_EMAIL}`,
  },

  dataDeletion: {
    title: 'Hesap ve veri silme',
    meta: 'Plasebo · Son güncelleme: 13 Ağustos 2026 · Paket adı: com.plasebo.app',
    lede: 'Plasebo’nun sunucusu yoktur. Ritüel kayıtların, puanların, notların, ayarların ve giriş yaptığın Google ya da Apple hesabından okunan ad/e-posta/profil fotoğrafı bilgisi yalnızca kendi cihazında saklanır. Bu nedenle silme işlemi tamamen senin kontrolündedir ve anında tamamlanır.',
    sections: [
      {
        heading: 'Yol 1 — Uygulama içinden (önerilen)',
        bullets: [
          'Plasebo’yu aç.',
          'Ayarlar sekmesine geç.',
          'Veri başlığı altında “Hesabı ve tüm verileri sil”e dokun.',
          'Onayla. Uygulama açılış ekranına döner ve hiçbir kayıt kalmaz.',
        ],
        body: [
          'Yalnızca Google bağlantısını kesmek istiyorsan Ayarlar → Hesap → Oturumu kapat yeterlidir; bu, kayıtlı hesap bilgilerini cihazdan siler ancak ritüel geçmişini korur.',
        ],
      },
      {
        heading: 'Yol 2 — Uygulamayı kaldırarak',
        body: [
          'Plasebo’yu telefonundan kaldırdığında uygulamanın tüm yerel verisi işletim sistemi tarafından silinir. Geriye hiçbir kayıt kalmaz, çünkü hiçbir kayıt cihaz dışına çıkmamıştır.',
        ],
      },
      {
        heading: 'Yol 3 — Google erişimini kaldırma',
        body: [
          'Google hesabının Plasebo’ya verdiği izni myaccount.google.com/permissions adresinden istediğin zaman geri alabilirsin.',
        ],
        callout:
          'Saklama süresi: Plasebo geliştiricisinin elinde tutulan hiçbir kullanıcı verisi yoktur; sunucu tarafında saklama süresi veya yedek kopya söz konusu değildir. Silme işlemi cihazında gerçekleşir ve geri alınamaz.',
      },
      {
        heading: 'Talep göndermek',
        body: [
          `Yukarıdaki adımlarla ilgili bir sorun yaşarsan veya bir silme talebini yazılı olarak iletmek istersen ${CONTACT_EMAIL} adresine yazabilirsin. Talepler 30 gün içinde yanıtlanır.`,
        ],
      },
    ],
    footer: 'Plasebo — bilerek inan.',
  },
};
