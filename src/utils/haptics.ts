import * as Haptics from 'expo-haptics';

let enabled = true;

/** Ayarlardan gelen tercihi modüle bildirir. */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function safe(run: () => Promise<unknown>): void {
  if (!enabled) return;
  // Titreşim desteklenmeyen cihazlarda sessizce geçilir.
  run().catch(() => {});
}

/**
 * Zamanlanmış bir titreşim dizisi çalar.
 *
 * iOS'ta "uzun titreşim" diye bir şey yok; süre hissi ancak arka arkaya
 * gelen kısa vuruşlarla kuruluyor. Her vuruş ayrıca `enabled` kontrol
 * ediyor: dizi çalarken ayar kapatılırsa kalan vuruşlar düşüyor.
 */
function sequence(steps: { style: Haptics.ImpactFeedbackStyle; at: number }[]): void {
  if (!enabled) return;
  for (const step of steps) {
    if (step.at === 0) {
      Haptics.impactAsync(step.style).catch(() => {});
      continue;
    }
    setTimeout(() => {
      if (!enabled) return;
      Haptics.impactAsync(step.style).catch(() => {});
    }, step.at);
  }
}

export const haptics = {
  /** Buton dokunuşu. */
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Adım geçişi. */
  step: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Ritüel tamamlandı. */
  success: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Geçersiz bir hamle — refleks testinde erken dokunuş gibi. */
  warning: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /**
   * Nefes fazı değişimi — her faz için ayrı bir desen.
   *
   * Buradaki asıl amaç ekrana bakma zorunluluğunu kaldırmak. Yönerge
   * yalnızca ekranın altındaki yazıdaydı; onu okumak için bakış dairenin
   * merkezinden ayrılıyor ve odak kaçıyordu. Profesyonel nefes
   * uygulamaları (Breathwrk, Paced Breathing, Awesome Breathing) aynı
   * bilgiyi titreşimle veriyor ve "gözleriniz kapalı çalışabilirsiniz"
   * iddiasını buna dayandırıyor.
   *
   * Desenler bilerek birbirine benzemiyor; bir turda öğreniliyor:
   *
   *   al   → tek net vuruş (başla)
   *   tut  → iki kısa tık (askıda kal)
   *   ver  → sönümlenen dört yumuşak vuruş (bırak, uzuyor)
   *   bekle→ hiçbir şey; sessizlik de bir işaret
   *
   * Verişin araları giderek açılıyor: eşit aralıklı olsaydı "tut"un
   * uzunca hâli gibi duyulurdu, oysa anlatması gereken şey bırakmanın
   * yayılması.
   */
  breathInhale: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  breathHold: () =>
    sequence([
      { style: Haptics.ImpactFeedbackStyle.Light, at: 0 },
      { style: Haptics.ImpactFeedbackStyle.Light, at: 110 },
    ]),
  breathExhale: () =>
    sequence([
      { style: Haptics.ImpactFeedbackStyle.Soft, at: 0 },
      { style: Haptics.ImpactFeedbackStyle.Soft, at: 130 },
      { style: Haptics.ImpactFeedbackStyle.Soft, at: 300 },
      { style: Haptics.ImpactFeedbackStyle.Soft, at: 520 },
    ]),
};
