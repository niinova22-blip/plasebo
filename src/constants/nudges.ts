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

  /* --- Süreklilik -------------------------------------------------- */
  { title: 'Serini hatırlıyor musun?', body: 'Bugünü de eklemek için geç değil.' },
  { title: 'Kaçırdıysan sorun değil', body: 'Bugünden devam et. Uygulama not tutmuyor, sadece sayıyor.' },
  { title: 'Tek adım da sayılır', body: 'Tamamını yapamıyorsan yalnızca nefes adımını çalıştır.' },
  { title: 'Aynı saat, aynı köşe', body: 'Tekrarlanan bağlam beklentiyi güçlendiriyor — iddia bu.' },
  { title: 'Bugünkü renk seni bekliyor', body: 'Aynı formül bir yıl boyunca ikinci kez gelmiyor.' },
];
