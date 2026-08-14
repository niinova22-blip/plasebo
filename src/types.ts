import type { BreathId, SoundId } from './constants/formulaPools';

export type Goal = 'focus' | 'sleep' | 'anxiety' | 'energy';
export type StepKind = 'color' | 'sound' | 'breath' | 'word';

export type { BreathId, SoundId };

export interface UserData {
  name: string;
  goals: Goal[];
  /** Günün formülünü belirleyen hedef. goals içinde olmalı. */
  activeGoal?: Goal;
  streak: number;
  lastRitualDate: string; // ISO date (YYYY-MM-DD)
  sessions: Session[];
  /** Seri dondurmanın kullanıldığı günler (YYYY-MM-DD). */
  freezeDates: string[];
}

export interface Session {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  formulaId: number;
  goal: string;
  score: number; // 1-10
  steps: StepKind[];
  /** Formülün o anki görüntüsü — arşiv geçmişi bozulmasın diye saklanıyor. */
  formulaName?: string;
  colorHex?: string;
  /** Kriz modunda üretilmiş formüller günün formülü değildir. */
  crisis?: boolean;
  /** Ritüel sonrası kullanıcının bıraktığı kısa not. */
  note?: string;
  /** Kör testte "sahte" ritüel mi çalıştırıldı? */
  sham?: boolean;
  /** Doz çarpanı (1 = tek doz, 2 = çift doz). */
  dose?: number;

  /* --- Şikayet → reçete akışı --------------------------------------
   * Alanlar isteğe bağlı: akıştan geçmeden başlatılan ritüeller (eski
   * kayıtlar, tekrar oynatmalar) bu bilgileri taşımaz.
   */
  /** Seçilen şikayetin kimliği (`src/constants/complaints.ts`). */
  complaintId?: string;
  /** Reçetenin adı — şikayetten gelir. */
  prescriptionName?: string;
  /** Ritüel ÖNCESİ şikayet şiddeti (1-10; yüksek = kötü). */
  scoreBefore?: number;
  /** Ritüel SONRASI şikayet şiddeti (1-10; yüksek = kötü). */
  scoreAfter?: number;
  /** Ritüelin gerçekte ne kadar sürdüğü (saniye). */
  durationSeconds?: number;
}

export interface FormulaColor {
  hex: string;
  name: string;
  duration: number; // saniye
}

export interface FormulaSound {
  type: SoundId;
  label: string;
  duration: number; // saniye
}

export interface FormulaBreath {
  pattern: BreathId;
  label: string;
  rounds: number;
}

export interface Formula {
  id: number;
  name: string; // "Odak #47"
  goal: string;
  color: FormulaColor;
  sound: FormulaSound;
  breath: FormulaBreath;
  word: string;
  stepOrder: StepKind[];
  pseudoScienceFact: string;
  generatedAt: string; // ISO date
  /** Kriz modu formülü mü? Günün formülünün yerine geçmez. */
  crisis?: boolean;
  /**
   * Kör testte seçilen "sahte" formül. Adımlar çalıştırılmaz, yerine
   * eşit süreli bir bekleme gelir. Kullanıcıya ritüel bitene kadar
   * söylenmez — sonuç ekranında açıklanır.
   */
  sham?: boolean;
  /** Doz çarpanı; adım sürelerini uzatır. */
  dose?: number;
}
