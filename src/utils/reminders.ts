import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NUDGES } from '../constants/nudges';
import type { TranslateFn } from '../i18n';

const CHANNEL_ID = 'plasebo-daily';
const NUDGE_CHANNEL_ID = 'plasebo-nudge';

/** Akıllı dürtmelerin zamanlanacağı gün sayısı ve saat aralığı. */
const NUDGE_DAYS = 7;
const NUDGE_START_HOUR = 10;
const NUDGE_END_HOUR = 21;

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

/**
 * Dürtmeler ayrı bir kanalda: kullanıcı günlük hatırlatıcıyı açık
 * tutup yalnızca bunları susturmak isteyebilir. Android'de kanal başına
 * susturma sistem ayarlarından yapılabiliyor.
 */
async function ensureNudgeChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NUDGE_CHANNEL_ID, {
    name: 'Akıllı hatırlatıcı',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

/** İzin daha önce verilmiş mi? Kullanıcıya soru sormaz. */
export async function hasPermission(): Promise<boolean> {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
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

/**
 * Zamanlama işleri sıraya girer.
 *
 * "Önce iptal et, sonra kur" adımı iki kez iç içe çalışırsa ikinci
 * çağrının iptali, birincinin henüz kurduğu bildirimi göremeyebiliyor ve
 * aynı saate iki hatırlatıcı kalıyordu (iOS'ta saat seçicisi çark
 * çevrildikçe olay yolladığı için gerçekten oluyor). Bütün kurma/iptal
 * çağrıları tek bir zincirden geçirilerek bu ihtimal ortadan kalkıyor.
 */
let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(job: () => Promise<T>): Promise<T> {
  const next = queue.then(job, job);
  queue = next.catch(() => {});
  return next;
}

/** Günlük hatırlatıcıyı dürtmelerden ayırmak için içeriğe konan işaret. */
const DAILY_MARK = { plaseboDaily: true } as const;

/** Verilen işareti taşıyan zamanlanmış bildirimleri iptal eder. */
async function cancelMarked(
  flag: 'plaseboDaily' | 'plaseboNudge' | 'plaseboCheckin' | 'plaseboReport'
): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      const data = item.content.data as Record<string, unknown> | null;
      if (data?.[flag]) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  } catch {
    // yoksay
  }
}

/** Var olan hatırlatıcıyı iptal eder ve yenisini kurar. */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  /** Bildirim metni de arayüzle aynı dilde kurulur. */
  t: TranslateFn = (text) => text
): Promise<boolean> {
  return serialize(async () => {
    try {
      await cancelMarked('plaseboDaily');
      await ensureChannel();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('Bugünün formülü hazır'),
          body: t('Hâlâ plasebo. Yine de iki dakikanı ayır.'),
          data: { ...DAILY_MARK },
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
  });
}

/**
 * Yalnızca günlük hatırlatıcıyı iptal eder.
 *
 * Eskiden burada `cancelAllScheduledNotificationsAsync()` çağrılıyordu ve
 * bu, akıllı hatırlatıcının bir haftalık kuyruğunu da siliyordu: kullanıcı
 * hatırlatma saatini değiştirdiğinde ya da günlük hatırlatıcıyı
 * kapattığında dürtmeler sessizce yok oluyor, uygulama yeniden açılana
 * kadar geri gelmiyordu. Artık iptal, işarete bakarak seçici yapılıyor.
 */
export async function cancelReminder(): Promise<void> {
  await serialize(() => cancelMarked('plaseboDaily'));
}

/**
 * İşaretsiz kalmış eski bildirimleri temizler.
 *
 * Önceki sürümlerde günlük hatırlatıcıya `data` konmuyordu; o sürümden
 * güncelleyen bir cihazda kuyrukta işaretsiz bir bildirim kalmış olabilir
 * ve seçici iptal ona dokunamaz — kullanıcı hatırlatıcıyı kapatsa bile
 * bildirim düşmeye devam ederdi. Uygulama açılışında bir kez çağrılır.
 */
export async function cancelUnmarked(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      const data = item.content.data as Record<string, unknown> | null;
      if (!data?.plaseboDaily && !data?.plaseboNudge) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  } catch {
    // yoksay
  }
}

/* ------------------------------------------------------------------ */
/* Akıllı hatırlatıcı                                                  */
/* ------------------------------------------------------------------ */

/** Dürtme bildirimlerini ötekilerden ayırmak için içeriğe konan işaret. */
const NUDGE_MARK = { plaseboNudge: true } as const;

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Zamanlanmış dürtmeleri iptal eder; günlük hatırlatıcıya dokunmaz. */
export async function cancelNudges(): Promise<void> {
  await serialize(() => cancelMarked('plaseboNudge'));
}

/**
 * Önümüzdeki günler için rastgele saatlere dürtme yerleştirir.
 *
 * Arka planda çalışan bir servis yok; bildirimler önden, tek tek tarih
 * tetikleyicileriyle kuruluyor. Bu yüzden bir haftalık kuyruk hazırlanıyor
 * ve uygulama her açıldığında kuyruk yeniden dolduruluyor (bkz. `App.tsx`).
 *
 * Saatler `10:00–21:00` arasında rastgele; aynı günün dürtmeleri birbirine
 * yapışmasın diye gün, istenen sayı kadar dilime bölünüyor ve her dilimden
 * bir saat seçiliyor. Mesaj havuzu da karıştırılarak dolaşılıyor, böylece
 * aynı cümle üst üste iki kez düşmüyor.
 */
export async function scheduleNudges(
  perDay: number,
  t: TranslateFn = (text) => text
): Promise<boolean> {
  return serialize(async () => {
    try {
      await cancelMarked('plaseboNudge');
      await ensureNudgeChannel();

      const count = Math.max(1, Math.min(perDay, 4));
      const slotHours = (NUDGE_END_HOUR - NUDGE_START_HOUR) / count;
      // Havuzu karıştırıp sırayla dolaş: tekrar, havuz bitmeden gelmesin.
      const pool = [...NUDGES].sort(() => Math.random() - 0.5);
      let cursor = 0;

      for (let day = 0; day < NUDGE_DAYS; day++) {
        for (let slot = 0; slot < count; slot++) {
          const when = new Date();
          when.setDate(when.getDate() + day);
          const startHour = NUDGE_START_HOUR + slotHours * slot;
          when.setHours(
            Math.floor(startHour),
            randomInt(0, Math.max(1, Math.floor(slotHours * 60)) - 1),
            0,
            0
          );
          // Geçmiş bir saate bildirim kurulamaz.
          if (when.getTime() <= Date.now() + 60_000) continue;

          const nudge = pool[cursor % pool.length];
          cursor++;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: t(nudge.title),
              body: t(nudge.body),
              data: { ...NUDGE_MARK },
              ...(Platform.OS === 'android' ? { channelId: NUDGE_CHANNEL_ID } : null),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: when,
            },
          });
        }
      }
      return true;
    } catch {
      return false;
    }
  });
}

/* ==================================================================
 * 24 saatlik döngü
 * ------------------------------------------------------------------
 * Gün içinde üç kısa ölçüm daveti, ertesi sabah da tek bir rapor
 * bildirimi. Arka planda çalışan hiçbir şey yok: bildirimler önden
 * kuruluyor, ölçüm yalnızca kullanıcı dokunduğunda ve ekran açıkken
 * yapılıyor (bkz. `utils/dailyCycle.ts`).
 * ================================================================== */

/** Ölçüm davetlerinin saatleri — sabah, öğleden sonra, akşam. */
export const CHECKIN_HOURS = [10, 15, 21];
/** Raporun düştüğü saat: gece biriken veri sabah okunuyor. */
export const REPORT_HOUR = 8;
const CHECKIN_MARK = { plaseboCheckin: true } as const;
const REPORT_MARK = { plaseboReport: true } as const;

/** Döngü bildirimlerini kaldırır; diğer bildirimlere dokunmaz. */
export async function cancelDailyCycle(): Promise<void> {
  await serialize(async () => {
    await cancelMarked('plaseboCheckin');
    await cancelMarked('plaseboReport');
  });
}

/**
 * Ölçüm davetlerini ve sabah raporunu kurar.
 *
 * Günlük tetikleyici kullanılıyor: her gün aynı saatlerde tekrarlıyor,
 * dolayısıyla dürtmelerdeki gibi bir haftalık kuyruk doldurmak
 * gerekmiyor.
 */
export async function scheduleDailyCycle(
  t: TranslateFn = (text) => text
): Promise<boolean> {
  return serialize(async () => {
    try {
      await cancelMarked('plaseboCheckin');
      await cancelMarked('plaseboReport');
      await ensureNudgeChannel();

      for (const hour of CHECKIN_HOURS) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('45 saniyelik ölçüm'),
            body: t('Nefesini ölçelim mi? Günün raporu bu ölçümlerden kuruluyor.'),
            data: { ...CHECKIN_MARK },
            ...(Platform.OS === 'android' ? { channelId: NUDGE_CHANNEL_ID } : null),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute: 0,
          },
        });
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('Günün raporu hazır'),
          body: t('Son 24 saatte ölçülenler bir arada.'),
          data: { ...REPORT_MARK },
          ...(Platform.OS === 'android' ? { channelId: NUDGE_CHANNEL_ID } : null),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: REPORT_HOUR,
          minute: 30,
        },
      });
      return true;
    } catch {
      return false;
    }
  });
}

/** Saat/dakikayı "09:00" biçiminde döndürür. */
export function formatTime(hour: number, minute: number): string {
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}
