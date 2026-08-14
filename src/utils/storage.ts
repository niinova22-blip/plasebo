import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Session, UserData } from '../types';
import { complaintById } from '../constants/complaints';

const USER_KEY = '@plasebo/user';
const ONBOARDED_KEY = '@plasebo/onboarded';

export const defaultUser: UserData = {
  name: '',
  goals: ['focus'],
  activeGoal: 'focus',
  streak: 0,
  lastRitualDate: '',
  sessions: [],
  freezeDates: [],
};

/** Yerel gün başlangıcına göre YYYY-MM-DD. */
export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const parse = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  return Math.round((parse(b) - parse(a)) / 86400000);
}

export async function loadUser(): Promise<UserData> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return { ...defaultUser };
    const parsed = JSON.parse(raw) as Partial<UserData>;
    const goals = parsed.goals?.length ? parsed.goals : defaultUser.goals;
    return {
      ...defaultUser,
      ...parsed,
      goals,
      // Aktif hedef her zaman seçili hedefler arasından gelmeli.
      activeGoal:
        parsed.activeGoal && goals.includes(parsed.activeGoal)
          ? parsed.activeGoal
          : goals[0],
      sessions: parsed.sessions ?? [],
      freezeDates: parsed.freezeDates ?? [],
    };
  } catch {
    return { ...defaultUser };
  }
}

export async function saveUser(user: UserData): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Yerel depolama yazılamazsa uygulama bellek içi durumla devam eder.
  }
}

export async function isOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setOnboarded(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    // yoksay
  }
}

export async function resetAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([USER_KEY, ONBOARDED_KEY]);
  } catch {
    // yoksay
  }
}

/** Aradaki günlerin tamamı dondurulmuşsa seri korunur. */
function gapIsFrozen(user: UserData, from: string, to: string): boolean {
  const gap = daysBetween(from, to);
  if (gap <= 1) return true;
  const [y, m, d] = from.split('-').map(Number);
  for (let i = 1; i < gap; i++) {
    const day = new Date(y, m - 1, d);
    day.setDate(day.getDate() + i);
    if (!user.freezeDates.includes(toISODate(day))) return false;
  }
  return true;
}

/**
 * Seriyi bugüne göre günceller: dün yapıldıysa (ya da aradaki günler
 * dondurulmuşsa) +1, bugün yapıldıysa değişmez, boşluk varsa 1'e döner.
 */
export function applyStreak(user: UserData, today = toISODate()): UserData {
  if (user.lastRitualDate === today) return { ...user, lastRitualDate: today };
  if (!user.lastRitualDate) return { ...user, streak: 1, lastRitualDate: today };
  const streak = gapIsFrozen(user, user.lastRitualDate, today) ? user.streak + 1 : 1;
  return { ...user, streak, lastRitualDate: today };
}

/** Uygulama açılışında seri kopmuşsa sıfırlar (yazmadan, sadece görüntü için). */
export function normalizeStreak(user: UserData, today = toISODate()): UserData {
  if (!user.lastRitualDate) return user;
  if (gapIsFrozen(user, user.lastRitualDate, today)) return user;
  return { ...user, streak: 0 };
}

/** Haftada bir seri dondurma hakkı var mı? */
export function canFreeze(user: UserData, today = toISODate()): boolean {
  const last7 = new Set(dailyScores(user.sessions, 7, today).map((d) => d.date));
  return !user.freezeDates.some((d) => last7.has(d));
}

/** Dünü dondurur — seri kopmadan bir gün atlanabilir. */
export function freezeYesterday(user: UserData, today = toISODate()): UserData {
  const [y, m, d] = today.split('-').map(Number);
  const yesterday = new Date(y, m - 1, d);
  yesterday.setDate(yesterday.getDate() - 1);
  const iso = toISODate(yesterday);
  if (user.freezeDates.includes(iso)) return user;
  return { ...user, freezeDates: [...user.freezeDates, iso].slice(-30) };
}

export function addSession(user: UserData, session: Session): UserData {
  const withStreak = applyStreak(user);
  return {
    ...withStreak,
    // Son 120 seans yeterli — depolama şişmesin.
    sessions: [...withStreak.sessions, session].slice(-120),
  };
}

export function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Son N günün (bugün dahil) günlük etki skoru ortalaması. */
export function dailyScores(
  sessions: Session[],
  days: number,
  today = toISODate()
): { date: string; label: string; score: number }[] {
  const dayLabels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const [y, m, d] = today.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const out: { date: string; label: string; score: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(base);
    day.setDate(base.getDate() - i);
    const iso = toISODate(day);
    const ofDay = sessions.filter((s) => s.date === iso);
    const score = ofDay.length
      ? ofDay.reduce((a, s) => a + s.score, 0) / ofDay.length
      : 0;
    out.push({ date: iso, label: dayLabels[day.getDay()], score });
  }
  return out;
}

/** 0-100 arası genel etki skoru — seans skorları + seri devamlılığı. */
export function overallScore(user: UserData): number {
  if (!user.sessions.length) return 0;
  const recent = user.sessions.slice(-14);
  const avg = recent.reduce((a, s) => a + s.score, 0) / recent.length; // 1-10
  const consistency = Math.min(recent.length / 14, 1); // 0-1
  return Math.round(avg * 8 + consistency * 20);
}

/** Son 7 gün ile önceki 7 günün karşılaştırması (% değişim). */
export function improvementPercent(user: UserData): number {
  const recent = user.sessions.slice(-7);
  const previous = user.sessions.slice(-14, -7);
  if (!recent.length || !previous.length) return 0;
  const avg = (arr: Session[]) => arr.reduce((a, s) => a + s.score, 0) / arr.length;
  const before = avg(previous);
  if (!before) return 0;
  return Math.round(((avg(recent) - before) / before) * 100);
}

/** Bu hafta (son 7 gün) ritüel yapılan benzersiz gün sayısı. */
export function daysThisWeek(sessions: Session[], today = toISODate()): number {
  const last7 = dailyScores(sessions, 7, today).map((d) => d.date);
  const done = new Set(sessions.filter((s) => last7.includes(s.date)).map((s) => s.date));
  return done.size;
}

/** Son N günün ısı haritası verisi (bugün en sonda). */
export function heatmapDays(
  user: UserData,
  days: number,
  today = toISODate()
): { date: string; score: number; frozen: boolean }[] {
  return dailyScores(user.sessions, days, today).map((d) => ({
    date: d.date,
    score: d.score,
    frozen: user.freezeDates.includes(d.date),
  }));
}

export interface Badge {
  id: string;
  label: string;
  hint: string;
  earned: boolean;
}

/** Kilometre taşları. Hiçbiri bir başarıyı ölçmez — sadece devamlılığı. */
export function badgesFor(user: UserData): Badge[] {
  const total = user.sessions.length;
  const best = user.streak;
  const shamCount = user.sessions.filter((s) => s.sham).length;

  return [
    {
      id: 'first',
      label: 'İlk doz',
      hint: 'İlk ritüelini tamamla',
      earned: total >= 1,
    },
    {
      id: 'week',
      label: '7 gün',
      hint: '7 günlük seri',
      earned: best >= 7,
    },
    {
      id: 'three-weeks',
      label: '21 gün',
      hint: '21 günlük seri',
      earned: best >= 21,
    },
    {
      id: 'fifty',
      label: '50 ritüel',
      hint: 'Toplam 50 ritüel',
      earned: total >= 50,
    },
    {
      id: 'skeptic',
      label: 'Şüpheci',
      hint: 'Kör testte 5 sahte ritüel tamamla',
      earned: shamCount >= 5,
    },
    {
      id: 'hundred',
      label: '100 ritüel',
      hint: 'Toplam 100 ritüel',
      earned: total >= 100,
    },
  ];
}

/**
 * Kör test karşılaştırması: gerçek ritüellerin ortalaması ile sahte
 * ritüellerin ortalaması. Fark küçükse bu da bir bulgudur.
 */
export function blindTestResult(
  sessions: Session[]
): { real: number; sham: number; realCount: number; shamCount: number } | null {
  const real = sessions.filter((s) => !s.sham);
  const sham = sessions.filter((s) => s.sham);
  if (!real.length || !sham.length) return null;
  const avg = (arr: Session[]) => arr.reduce((a, s) => a + s.score, 0) / arr.length;
  return {
    real: Math.round(avg(real) * 10) / 10,
    sham: Math.round(avg(sham) * 10) / 10,
    realCount: real.length,
    shamCount: sham.length,
  };
}

/**
 * Şikayet kategorisine göre ortalama etki.
 *
 * Etki = ritüel öncesi puan − sonrası puan (yüksek puan = kötü his).
 * Yalnızca yeni akıştan geçmiş, iki ölçümü de olan seanslar sayılır;
 * eski kayıtlar bu alanları taşımadığı için sessizce atlanır.
 */
export function improvementByCategory(
  sessions: Session[]
): { category: string; average: number; count: number }[] {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const s of sessions) {
    if (s.scoreBefore === undefined || s.scoreAfter === undefined) continue;
    const category = complaintById(s.complaintId)?.category;
    if (!category) continue;
    const bucket = buckets.get(category) ?? { total: 0, count: 0 };
    bucket.total += s.scoreBefore - s.scoreAfter;
    bucket.count += 1;
    buckets.set(category, bucket);
  }

  return Array.from(buckets.entries())
    .map(([category, b]) => ({
      category,
      average: Math.round((b.total / b.count) * 10) / 10,
      count: b.count,
    }))
    .sort((a, b) => b.average - a.average);
}

/** En etkili günü bulur — içgörü kartı için. */
export function bestWeekday(
  sessions: Session[]
): { day: string; percent: number } | null {
  if (sessions.length < 3) return null;
  const names = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const buckets: { total: number; count: number }[] = names.map(() => ({ total: 0, count: 0 }));

  for (const s of sessions) {
    const [y, m, d] = s.date.split('-').map(Number);
    const idx = new Date(y, m - 1, d).getDay();
    buckets[idx].total += s.score;
    buckets[idx].count += 1;
  }

  const averages = buckets.map((b) => (b.count ? b.total / b.count : 0));
  const overall =
    sessions.reduce((a, s) => a + s.score, 0) / sessions.length;
  let bestIdx = -1;
  let bestAvg = 0;
  averages.forEach((avg, i) => {
    if (buckets[i].count > 0 && avg > bestAvg) {
      bestAvg = avg;
      bestIdx = i;
    }
  });
  if (bestIdx < 0 || !overall) return null;

  const percent = Math.round(((bestAvg - overall) / overall) * 100);
  if (percent <= 0) return null;
  return { day: names[bestIdx], percent };
}
