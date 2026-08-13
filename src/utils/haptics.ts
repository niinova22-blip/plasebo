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

export const haptics = {
  /** Buton dokunuşu. */
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Adım geçişi. */
  step: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Ritüel tamamlandı. */
  success: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Nefes fazı değişimi. */
  breath: () => safe(() => Haptics.selectionAsync()),
};
