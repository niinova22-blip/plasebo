import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { TranslateFn } from '../i18n';

const CHANNEL_ID = 'plasebo-daily';

/**
 * Günlük hatırlatıcı.
 *
 * Not: Expo Go'da uzak (push) bildirimler desteklenmiyor; buradaki
 * yerel zamanlanmış bildirim çalışır ama garantili test için
 * development build önerilir.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Günlük formül',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

/** Var olan hatırlatıcıyı iptal eder ve yenisini kurar. */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  /** Bildirim metni de arayüzle aynı dilde kurulur. */
  t: TranslateFn = (text) => text
): Promise<boolean> {
  try {
    await cancelReminder();
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('Bugünün formülü hazır'),
        body: t('Hâlâ plasebo. Yine de iki dakikanı ayır.'),
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // yoksay
  }
}

/** Saat/dakikayı "09:00" biçiminde döndürür. */
export function formatTime(hour: number, minute: number): string {
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}
