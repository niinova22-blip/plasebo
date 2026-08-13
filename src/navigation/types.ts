import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Formula } from '../types';
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
  /** Kurulum 3/3 — hedefler. */
  Onboarding: undefined;
  HowItWorks: undefined;
  /** Gizlilik politikası / veri silme metni — uygulama içinde okunur. */
  Legal: { doc: LegalDocId };
  /** Abonelik kademeleri ve içerik paketleri. */
  Plans: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  /** Ritüel, çalıştırılacak formülü hazır alır (günün formülü ya da kriz formülü). */
  Ritual: { formula: Formula };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
