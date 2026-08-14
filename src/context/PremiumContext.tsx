import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_LIMITS, type PackId, type PlanId } from '../constants/plans';
import { purchasePack, purchasePlan, restorePurchases } from '../utils/billing';
import type { PurchaseResult } from '../utils/billing';

const ENTITLEMENT_KEY = '@plasebo/entitlement';

interface Entitlement {
  plan: PlanId;
  packs: PackId[];
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
}

const PREMIUM_LIMITS: Limits = {
  historyDays: Number.POSITIVE_INFINITY,
  unlimitedPrescriptions: true,
  prescriptionTracking: true,
  customDose: true,
};

interface PremiumContextValue {
  plan: PlanId;
  packs: PackId[];
  isPremium: boolean;
  ready: boolean;
  limits: Limits;
  hasPack: (pack: PackId) => boolean;
  buyPlan: (plan: PlanId) => Promise<PurchaseResult>;
  buyPack: (pack: PackId) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  /** Hesap silinirken yetkiler de temizlenir. */
  reset: () => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [entitlement, setEntitlement] = useState<Entitlement>(DEFAULT_ENTITLEMENT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(ENTITLEMENT_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<Entitlement>;
            setEntitlement({
              plan: parsed.plan === 'premium' ? 'premium' : 'free',
              packs: Array.isArray(parsed.packs) ? parsed.packs : [],
            });
          } catch {
            // bozuk kayıt — ücretsiz kademeyle devam
          }
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: Entitlement) => {
    setEntitlement(next);
    void AsyncStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const buyPlan = useCallback(
    async (plan: PlanId) => {
      const result = await purchasePlan(plan);
      if (result.ok) persist({ ...entitlement, plan });
      return result;
    },
    [entitlement, persist]
  );

  const buyPack = useCallback(
    async (pack: PackId) => {
      if (entitlement.packs.includes(pack)) {
        return { ok: true, message: 'Bu paket zaten sende.' };
      }
      const result = await purchasePack(pack);
      if (result.ok) persist({ ...entitlement, packs: [...entitlement.packs, pack] });
      return result;
    },
    [entitlement, persist]
  );

  const restore = useCallback(async () => restorePurchases(), []);

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
      ready,
      limits: isPremium ? PREMIUM_LIMITS : { ...FREE_LIMITS },
      hasPack: (pack: PackId) => entitlement.packs.includes(pack),
      buyPlan,
      buyPack,
      restore,
      reset,
    }),
    [entitlement, isPremium, ready, buyPlan, buyPack, restore, reset]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium, PremiumProvider içinde kullanılmalı.');
  return ctx;
}
