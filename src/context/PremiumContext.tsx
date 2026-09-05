import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FORCE_FREE_TIER } from '../constants/devTier';
import {
  FREE_LIMITS,
  PREMIUM_ENABLED,
  type PackId,
  type PlanId,
  type PurchaseOptionId,
} from '../constants/plans';
import {
  closeBilling,
  fetchPlanProducts,
  initBilling,
  purchaseOption,
  restorePurchases,
  syncEntitlement,
} from '../utils/billing';
import type { EntitlementSnapshot, PurchaseResult, StoreProductInfo } from '../utils/billing';

const ENTITLEMENT_KEY = '@plasebo/entitlement';

interface Entitlement {
  plan: PlanId;
  packs: PackId[];
  /** Hangi seçenekten geldiği — ekranda "aylık" ile "yıllık"ı ayırmak için. */
  option?: PurchaseOptionId;
  /** Aboneliğin bitiş anı (ms). Mağaza vermediyse tanımsız. */
  expiresAt?: number;
}

const DEFAULT_ENTITLEMENT: Entitlement = { plan: 'free', packs: [] };

export interface Limits {
  /** Geçmişin kaç günü görünür? */
  historyDays: number;
  /** Günde birden fazla nokta atışı reçete yazdırılabilir mi? */
  unlimitedPrescriptions: boolean;
  /** Şikayete göre iyileşme takibi açık mı? */
  prescriptionTracking: boolean;
  customDose: boolean;
  /**
   * Günde kaç yüz taraması yapılabilir. Plus'ta `Infinity`, ücretsiz
   * kademede 1 — sayacın kendisi `src/utils/faceScanQuota.ts` içinde.
   */
  faceScansPerDay: number;
  /** Ritüel sırasında nefes analizi açık mı? */
  breathAnalysis: boolean;
  /** Gün içi ölçüm daveti ve ertesi sabah günlük rapor açık mı? */
  dailyReport: boolean;
  /** Seans sonu geçiş reklamı gizleniyor mu? */
  adFree: boolean;
}

const PREMIUM_LIMITS: Limits = {
  historyDays: Number.POSITIVE_INFINITY,
  unlimitedPrescriptions: true,
  prescriptionTracking: true,
  customDose: true,
  faceScansPerDay: Number.POSITIVE_INFINITY,
  breathAnalysis: true,
  dailyReport: true,
  adFree: true,
};

interface PremiumContextValue {
  plan: PlanId;
  packs: PackId[];
  isPremium: boolean;
  /** Satın alınan seçenek — plan ekranında hangisinin etkin olduğunu yazmak için. */
  option?: PurchaseOptionId;
  expiresAt?: number;
  ready: boolean;
  limits: Limits;
  /** Mağazadan okunan fiyatlar. Boşsa ekran yedek tutarları gösterir. */
  prices: StoreProductInfo[];
  /** Satın alma penceresi açık mı? Düğmeleri kilitlemek için. */
  busy: boolean;
  hasPack: (pack: PackId) => boolean;
  buy: (option: PurchaseOptionId) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  /** Plan ekranı açılırken fiyatları ve yetkiyi tazeler. */
  refresh: () => Promise<void>;
  /** Hesap silinirken yerel kopya da temizlenir. */
  reset: () => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [entitlement, setEntitlement] = useState<Entitlement>(DEFAULT_ENTITLEMENT);
  const [prices, setPrices] = useState<StoreProductInfo[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  /**
   * Mağazadan okunan yetkiyi yerel kopyaya yazar.
   *
   * Yerel kopya bir doğruluk kaynağı değil, yalnızca **önbellek**: mağazaya
   * ulaşılamadığında (uçak kipi, ilk saniyeler) kullanıcı üyeliğini kaybetmiş
   * gibi görünmesin diye. Mağaza cevap verdiği anda söz onun.
   */
  const applySnapshot = useCallback(
    (snapshot: EntitlementSnapshot | null) => {
      if (!snapshot) return; // okunamadı — elimizdekine dokunma
      setEntitlement((current) => {
        const next: Entitlement = {
          ...current,
          plan: snapshot.premium ? 'premium' : 'free',
          option: snapshot.option,
          expiresAt: snapshot.expiresAt,
        };
        void AsyncStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  // Açılış: önce yerel kopyayı oku (ekran anında doğru görünsün), sonra
  // mağazayla eşitle. Sıralama önemli — tersi olsaydı uygulama ilk
  // saniyelerde ücretsiz kademe gibi davranırdı.
  useEffect(() => {
    alive.current = true;
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ENTITLEMENT_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<Entitlement>;
          setEntitlement({
            plan: parsed.plan === 'premium' ? 'premium' : 'free',
            packs: Array.isArray(parsed.packs) ? parsed.packs : [],
            option: parsed.option,
            expiresAt: parsed.expiresAt,
          });
        }
      } catch {
        // bozuk kayıt — ücretsiz kademeyle devam
      }
      if (!cancelled) setReady(true);

      if (!PREMIUM_ENABLED) return;
      await initBilling();
      if (cancelled) return;
      applySnapshot(await syncEntitlement());
    })();

    return () => {
      cancelled = true;
      alive.current = false;
      void closeBilling();
    };
  }, [applySnapshot]);

  const refresh = useCallback(async () => {
    if (!PREMIUM_ENABLED) return;
    const [list] = await Promise.all([
      fetchPlanProducts(),
      syncEntitlement().then(applySnapshot),
    ]);
    if (alive.current && list.length) setPrices(list);
  }, [applySnapshot]);

  const buy = useCallback(
    async (option: PurchaseOptionId): Promise<PurchaseResult> => {
      setBusy(true);
      try {
        const result = await purchaseOption(option);
        // Yetkiyi satın almanın döndürdüğüne değil, mağazaya sorarak
        // belirliyoruz: böylece bitiş tarihi Apple'ın verdiğiyle birebir
        // aynı oluyor.
        if (result.ok) applySnapshot(await syncEntitlement());
        return result;
      } finally {
        if (alive.current) setBusy(false);
      }
    },
    [applySnapshot]
  );

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setBusy(true);
    try {
      const { result, entitlement: snapshot } = await restorePurchases();
      applySnapshot(snapshot);
      return result;
    } finally {
      if (alive.current) setBusy(false);
    }
  }, [applySnapshot]);

  const reset = useCallback(() => {
    setEntitlement(DEFAULT_ENTITLEMENT);
    void AsyncStorage.removeItem(ENTITLEMENT_KEY).catch(() => {});
  }, []);

  const isPremium = entitlement.plan === 'premium';

  const value = useMemo<PremiumContextValue>(
    () => ({
      plan: entitlement.plan,
      packs: entitlement.packs,
      isPremium,
      option: entitlement.option,
      expiresAt: entitlement.expiresAt,
      ready,
      /*
       * Plus kapalıyken kimseye sınır uygulanmaz: satın alınamayan bir
       * özelliği kilitli göstermek hem kullanıcıyı çıkışsız bırakır hem de
       * Apple'ın 2.1 (App Completeness) kuralına takılır.
       *
       * Tek istisna geliştirme derlemesindeki `FORCE_FREE_TIER`: ücretsiz
       * kademenin yolları başka türlü cihazda hiç denenemiyor, çünkü
       * bayrak kapalıyken herkes tam sürümde. Yayın derlemesinde bu sabit
       * her zaman `false` (bkz. `constants/devTier.ts`).
       */
      limits: FORCE_FREE_TIER
        ? { ...FREE_LIMITS }
        : !PREMIUM_ENABLED || isPremium
          ? PREMIUM_LIMITS
          : { ...FREE_LIMITS },
      prices,
      busy,
      hasPack: (pack: PackId) => entitlement.packs.includes(pack),
      buy,
      restore,
      refresh,
      reset,
    }),
    [entitlement, isPremium, ready, prices, busy, buy, restore, refresh, reset]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium, PremiumProvider içinde kullanılmalı.');
  return ctx;
}
