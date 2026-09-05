import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HealthSnapshot } from './health';

/**
 * 24 saatlik döngü: gün içi kısa ölçümler ve ertesi sabahki rapor.
 *
 * İstenen şey "arka planda sürekli dinleyen bir yapay zekâ"ydı; iOS buna
 * izin vermiyor (widget canlı kod çalıştırmaz, kesintisiz mikrofon hem
 * bataryayı bitirir hem de mağaza incelemesinde reddedilir). Aynı sonuç
 * burada üç ucuz parçadan kuruluyor:
 *
 *   1. Gün içinde birkaç kez, 45 saniyelik gönüllü nefes ölçümü.
 *   2. Uyku ve nabız zaten Sağlık'ta biriken pasif veri.
 *   3. Ertesi sabah ikisini birleştiren tek bir rapor.
 *
 * Bu dosya yalnızca **veri ve yorum** tarafı: React'ten, bildirimden ve
 * yerel modüllerden bağımsız, dolayısıyla sınanabilir.
 */

const KEY = '@plasebo/checkins';
/** Rapor son 24 saate bakıyor; iki günden eskisini saklamanın anlamı yok. */
const KEEP_HOURS = 48;
const MAX_ENTRIES = 60;

export interface Checkin {
  /** Ölçümün yapıldığı an (epoch ms). */
  at: number;
  /** Nefes düzenliliği 0-1; ölçülemediyse yok. */
  regularity?: number;
  /** Dakikadaki nefes sayısı. */
  breathsPerMinute?: number;
  /** Nefes derinliği 0-1. */
  depth?: number;
}

export async function readCheckins(): Promise<Checkin[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Checkin[]) : [];
  } catch {
    return [];
  }
}

export async function addCheckin(entry: Checkin): Promise<void> {
  try {
    const all = [...(await readCheckins()), entry];
    await AsyncStorage.setItem(KEY, JSON.stringify(pruneCheckins(all, entry.at)));
  } catch {
    // yoksay — ölçüm bir kolaylık, akışın koşulu değil.
  }
}

/** Eski ve fazla kayıtları atar. Saf: sınanabilsin diye ayrı duruyor. */
export function pruneCheckins(entries: Checkin[], now: number): Checkin[] {
  const floor = now - KEEP_HOURS * 3600_000;
  return entries
    .filter((e) => e.at > floor)
    .sort((a, b) => a.at - b.at)
    .slice(-MAX_ENTRIES);
}

/** Son 24 saatteki ölçümler, eskiden yeniye. */
export function checkinsInLast24h(entries: Checkin[], now: number): Checkin[] {
  const floor = now - 24 * 3600_000;
  return entries.filter((e) => e.at > floor && e.at <= now).sort((a, b) => a.at - b.at);
}

/** Rapor için asgari ölçüm sayısı — tek ölçümden "gün" çıkarılamaz. */
export const REPORT_MIN_CHECKINS = 2;

export interface DailyReport {
  /** Rapora giren ölçüm sayısı. */
  count: number;
  /** Ortalama düzenlilik (0-1). */
  averageRegularity: number;
  /** En düzenli ölçümün saati (0-23) ve değeri. */
  calmestHour: number;
  calmestRegularity: number;
  /** En düzensiz ölçümün saati ve değeri. */
  tensestHour: number;
  tensestRegularity: number;
  /** Sabahtan akşama yön: pozitifse gün boyunca düzen arttı. */
  trend: number;
  /** Sağlık verisi açıksa dün geceki uyku (dakika). */
  sleepMinutes?: number;
  restingHeartRate?: number;
}

/**
 * Son 24 saatin raporu.
 *
 * Düzenlilik ölçülemeyen ölçümler hiç sayılmıyor: "ölçtük ama sonuç
 * çıkmadı" bir veri değil. Yeterli ölçüm yoksa `null` dönüyor ve ekran
 * rapor yerine "henüz yeterli ölçüm yok" diyor — uygulamanın geri
 * kalanındaki kural burada da geçerli, az veriden çok cümle kurulmuyor.
 */
export function dailyReport(
  entries: Checkin[],
  now: number,
  health?: HealthSnapshot | null
): DailyReport | null {
  const usable = checkinsInLast24h(entries, now).filter((e) => e.regularity != null);
  if (usable.length < REPORT_MIN_CHECKINS) return null;

  const values = usable.map((e) => e.regularity as number);
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  let calmest = usable[0];
  let tensest = usable[0];
  for (const entry of usable) {
    if ((entry.regularity as number) > (calmest.regularity as number)) calmest = entry;
    if ((entry.regularity as number) < (tensest.regularity as number)) tensest = entry;
  }

  return {
    count: usable.length,
    averageRegularity: Math.round(average * 100) / 100,
    calmestHour: new Date(calmest.at).getHours(),
    calmestRegularity: calmest.regularity as number,
    tensestHour: new Date(tensest.at).getHours(),
    tensestRegularity: tensest.regularity as number,
    // Yön, ilk ve son ölçümün farkı: gün içinde toplanma mı dağılma mı.
    trend: Math.round((values[values.length - 1] - values[0]) * 100) / 100,
    sleepMinutes: health?.sleepMinutes ?? undefined,
    restingHeartRate: health?.restingHeartRate ?? undefined,
  };
}

/** Raporun tek cümlelik özeti — çeviri anahtarı olarak dönüyor. */
export function reportHeadline(report: DailyReport): string {
  if (report.trend >= 0.08) return 'Gün ilerledikçe nefesin düzene girdi.';
  if (report.trend <= -0.08) return 'Gün ilerledikçe nefesin dağıldı.';
  return 'Gün boyunca nefesin benzer bir düzende kaldı.';
}
