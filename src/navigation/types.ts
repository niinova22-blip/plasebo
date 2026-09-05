import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Formula, StepKind } from '../types';
import type { LegalDocId } from '../constants/legal';

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Archive: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  /** Kurulum 1/3 — isim. */
  /** Kurulum 2/3 — zorunlu Google girişi. */
  SignIn: undefined;
  /** Kurulum 3/3 — dört formülün tanıtımı. */
  Onboarding: undefined;
  /** Kurulumun sonundaki "formüllerin hazırlanıyor" töreni. */
  Preparation: undefined;
  HowItWorks: undefined;
  /** Gizlilik politikası / veri silme metni — uygulama içinde okunur. */
  Legal: { doc: LegalDocId };
  /** Abonelik kademeleri ve içerik paketleri. */
  Plans: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  /* --- Şikayet → muayene → reçete → ölçüm akışı ------------------- */
  /** Akışın başı: bugün ne şikayet var? */
  Complaint: undefined;
  /**
   * Sahte muayene; kendiliğinden reçeteye geçer.
   *
   * `customText`, kullanıcı şikayetini kendi cümlesiyle yazdığında
   * doluyor ve akışın sonuna kadar taşınıyor — şikayet nesnesi her
   * ekranda bu metinden yeniden kuruluyor (bkz. `resolveComplaint`).
   */
  Examination: {
    complaintId: string;
    customText?: string;
    /** Durum bilgisi ekranında kamera kullanıldıysa çıkan kaba ruh hali skoru. */
    faceMoodScore?: number;
  };
  /** Reçete kartı — kabul edilirse ölçüme geçilir. */
  Prescription: { complaintId: string; customText?: string; faceMoodScore?: number };
  /**
   * Ritüel öncesi **elle** ölçüm.
   *
   * Ölçümün asıl yolu yüz taraması; bu ekran onun yerine geçen yol.
   * Üç durumda açılıyor: ücretsiz kademede günlük tarama hakkı bittiğinde,
   * kamera izni verilmediğinde ve yüz okunamadığında. Olmadığı sürüm
   * kısa bir süre yayındaydı ve orada izni reddeden kullanıcı ritüele hiç
   * giremiyordu — akışın çıkışsız kalmaması bu ekrana bağlı.
   */
  ScoreBefore: { complaintId: string; customText?: string; formula: Formula };
  /** Ritüel sonrası ölçüm; kaydı da bu ekran yazar. */
  ScoreAfter: {
    /** Ritüel öncesi refleks ölçümünün ortanca tepki süresi (ms). */
    reactionBeforeMs?: number;
    complaintId: string;
    customText?: string;
    formula: Formula;
    scoreBefore: number;
    durationSeconds: number;
    steps: StepKind[];
    /** Ritüel öncesi kameradan çıkan kaba ruh hali skoru (kullanıldıysa). */
    faceMoodScore?: number;
    /** Nefes adımında mikrofondan çıkan düzenlilik skoru (0-1, ölçülebildiyse). */
    breathRegularity?: number;
    /** Aynı kayıttan çıkan dakikadaki nefes sayısı. */
    breathsPerMinute?: number;
    /** Aynı kayıttan çıkan kaba derinlik ölçüsü (0-1). */
    breathDepth?: number;
    /** Ölçüm çıkmadıysa nedeni — kullanıcıya açık bir mesaj göstermek için. */
    breathMicOutcome?: 'denied' | 'no-mic-data' | 'no-signal';
  };
  /** Seans özeti — akışın sonu. */
  SessionSummary: {
    /** Ritüel öncesi/sonrası refleks ölçümleri (ms) — yapıldıysa. */
    reactionBeforeMs?: number;
    reactionAfterMs?: number;
    complaintId: string;
    customText?: string;
    formula: Formula;
    scoreBefore: number;
    scoreAfter: number;
    durationSeconds: number;
    /** Ritüel öncesi kameradan çıkan kaba ruh hali skoru (kullanıldıysa). */
    faceMoodScore?: number;
    /** Ritüel sonrası kameradan çıkan kaba ruh hali skoru (kullanıldıysa). */
    faceMoodAfter?: number;
    /** `scoreAfter` kameradan mı geldi? Özet ekranı sayıyı öyle etiketliyor. */
    scoreAfterFromCamera?: boolean;
    /** Nefes adımında mikrofondan çıkan düzenlilik skoru (0-1, ölçülebildiyse). */
    breathRegularity?: number;
    /** Aynı kayıttan çıkan dakikadaki nefes sayısı. */
    breathsPerMinute?: number;
    /** Aynı kayıttan çıkan kaba derinlik ölçüsü (0-1). */
    breathDepth?: number;
  };

  /**
   * Ritüel, çalıştırılacak formülü hazır alır. Akıştan gelindiyse şikayet
   * ve ölçüm de taşınır; doğrudan başlatıldığında bunlar boş kalır.
   */
  Ritual: {
    formula: Formula;
    /** Ritüel öncesi refleks ölçümü (ms) — ölçüm ekranından taşınır. */
    reactionBeforeMs?: number;
    complaintId?: string;
    customText?: string;
    scoreBefore?: number;
    /** Ölçüm ekranında kamera kullanıldıysa çıkan kaba ruh hali skoru. */
    faceMoodScore?: number;
  };
  /** Gün içi 45 saniyelik nefes ölçümü — bildirimden ya da ana ekrandan. */
  Checkin: undefined;
  /** Son 24 saatin raporu. */
  DailyReport: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
