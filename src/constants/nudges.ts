/**
 * Akıllı hatırlatıcı mesajları.
 *
 * Günün rastgele saatlerinde düşen kısa dürtmeler. Sabit "ritüelini yap"
 * cümlesi birkaç günde görünmez oluyor; havuz, her seferinde başka bir
 * yerden tutuyor.
 *
 * Ton kuralı yine aynı: hiçbiri bir iyileşme vaat etmiyor, hiçbiri
 * suçlamıyor ("yine atladın" gibi bir cümle yok). Çoğu bir davet, bazısı
 * uygulamanın kendisiyle dalga geçiyor — uygulamanın dili bu.
 */

export interface Nudge {
  title: string;
  body: string;
}

export const NUDGES: Nudge[] = [
  /* --- Davet ------------------------------------------------------ */
  { title: 'İki dakikan var mı?', body: 'Bugünün formülü hâlâ seni bekliyor. İçinde hâlâ etken madde yok.' },
  { title: 'Üç adım, iki dakika', body: 'Renk, ses, nefes. Beklenti ölçülmüş bir mekanizma.' },
  { title: 'Bir ara ver', body: 'Ne yaptığın önemli değil; durduğun iki dakika önemli.' },
  { title: 'Formülün hazır', body: 'Bugünün rengi seçildi bile. Sadece bakman gerekiyor.' },
  { title: 'Nefesini uzat', body: 'Verişi alıştan uzun tut. Buradaki tek gerçek etken bu.' },
  { title: 'Şimdi iyi bir an', body: 'İki dakika sonra da aynı yerde olacaksın. Bu sefer durarak.' },

  /* --- Hedefe göre ------------------------------------------------ */
  { title: 'Dikkatin dağıldıysa', body: 'Odak formülü 90 saniye sürüyor. Telefonu bırakmadan önce sığar.' },
  { title: 'Omuzların gerginse', body: 'Sükunet formülünde nefes başa geçiyor. Sayıları tutturmak zorunda değilsin.' },
  { title: 'Güne hız gerekiyorsa', body: 'Enerji formülü parlak bir renkle başlıyor.' },
  { title: 'Gece yaklaşıyor', body: 'Uyku formülünde sesler yavaşlar. Ekranı kapatmadan önce bir tur.' },

  /* --- Şeffaf / esprili ------------------------------------------- */
  { title: 'Hiçbir şey yapmıyoruz', body: 'Ama beraber yapıyoruz. İki dakika.' },
  { title: 'Bu bildirim de plasebo', body: 'İçinde etkin madde yok. Yine de açtın — mekanizma tam olarak bu.' },
  { title: 'Bugünün uydurma bulgusu', body: 'Ritüele başlayınca hangisi çıkacak, orası sürpriz.' },
  { title: 'Ölçtüğümüz tek şey', body: 'Devam ettiğin. Puanın değil, geldiğin sayılıyor.' },
  { title: 'Etkin madde: yok', body: 'Dozaj: iki dakika. Yan etki: bir ara vermiş olmak.' },

  /* --- Özellik ipuçları -------------------------------------------
   * Uygulamanın yarısı keşfedilmeden kalıyordu: kamera, mikrofon,
   * refleks ve sağlık verisi ekranların içine gömülü. Bu dürtmeler o
   * özellikleri, tam da kullanılabilecekleri saatte tanıtıyor — hepsi
   * ne yaptığını olduğu gibi söylüyor, hiçbiri bir sonuç vaat etmiyor.
   * ---------------------------------------------------------------- */
  { title: 'Nefesini ölçebiliyoruz', body: 'Ritüel sırasında mikrofon nefes ritmini ölçüyor. Ses kaydedilmiyor, cihazdan çıkmıyor.' },
  { title: 'Kamerayla ölçmeyi denedin mi?', body: 'Ölçüm ekranındaki kamera düğmesi yüz ifadenden bir puan öneriyor. Katılmazsan kaydırıp değiştirirsin.' },
  { title: 'Refleksin de bir veri', body: 'Ritüelden önce ve sonra tepki süreni ölçüp farkı görebilirsin.' },
  { title: 'Apple Sağlık bağlanabilir', body: 'Ayarlar’dan açarsan dün geceki uykun reçeteni etkiler. Sağlık’a hiçbir şey yazılmaz.' },
  { title: 'Ana ekrana widget ekle', body: 'Serini ve günün formülünü telefonun ana ekranından görebilirsin.' },
  { title: 'Seri dondurma hakkın var', body: 'Bir günü kaçırdıysan haftada bir kez dünü dondurup seriyi koruyabilirsin.' },
  { title: 'Ölçüm defterine bak', body: 'İstatistik ekranı her ritüelin öncesini ve sonrasını yan yana koyuyor.' },
  { title: 'Nokta atışı reçete', body: 'Şikayetini anlatırsan sana özel bir reçete hazırlanıyor. Ana ekranda en üstte duruyor.' },
  { title: 'Kör testi açabilirsin', body: 'Ayarlar’dan açarsan bazı günler sahte ritüel gelir; farkı istatistikte görürsün.' },
  { title: 'Seansın fişini paylaş', body: 'Bitişte üretilen fişi görsel olarak kaydedip paylaşabilirsin.' },

  /* --- Kısa motivasyon --------------------------------------------- */
  { title: 'Bugün de buradasın', body: 'Ölçülen tek şey bu: devam etmen.' },
  { title: 'İki dakika az değil', body: 'Günün geri kalanıyla değil, hiç durmamakla kıyasla.' },
  { title: 'Küçük ve tekrarlı', body: 'Uzun bir seans aramıyoruz; kısa ve tekrar eden bir şey arıyoruz.' },
  { title: 'Yarım yapmak da sayılır', body: 'Tek bir adım bile bugünü işaretler.' },

  /* --- Süreklilik -------------------------------------------------- */
  { title: 'Serini hatırlıyor musun?', body: 'Bugünü de eklemek için geç değil.' },
  { title: 'Kaçırdıysan sorun değil', body: 'Bugünden devam et. Uygulama not tutmuyor, sadece sayıyor.' },
  { title: 'Tek adım da sayılır', body: 'Tamamını yapamıyorsan yalnızca nefes adımını çalıştır.' },
  { title: 'Aynı saat, aynı köşe', body: 'Tekrarlanan bağlam beklentiyi güçlendiriyor — iddia bu.' },
  { title: 'Bugünkü renk seni bekliyor', body: 'Aynı formül bir yıl boyunca ikinci kez gelmiyor.' },
];
