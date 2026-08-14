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
  Intro: undefined;
  /** Kurulum 1/3 — isim. */
  Name: undefined;
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
  Examination: { complaintId: string; customText?: string };
  /** Reçete kartı — kabul edilirse ölçüme geçilir. */
  Prescription: { complaintId: string; customText?: string };
  /** Ritüel öncesi ölçüm. */
  ScoreBefore: { complaintId: string; customText?: string; formula: Formula };
  /** Ritüel sonrası ölçüm; kaydı da bu ekran yazar. */
  ScoreAfter: {
    complaintId: string;
    customText?: string;
    formula: Formula;
    scoreBefore: number;
    durationSeconds: number;
    steps: StepKind[];
  };
  /** Seans özeti — akışın sonu. */
  SessionSummary: {
    complaintId: string;
    customText?: string;
    formula: Formula;
    scoreBefore: number;
    scoreAfter: number;
    durationSeconds: number;
  };

  /**
   * Ritüel, çalıştırılacak formülü hazır alır. Akıştan gelindiyse şikayet
   * ve ölçüm de taşınır; doğrudan başlatıldığında bunlar boş kalır.
   */
  Ritual: {
    formula: Formula;
    complaintId?: string;
    customText?: string;
    scoreBefore?: number;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
