import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeFor, type ThemeColors, type ThemeMode, type ThemeName } from '../theme/theme';
import {
  resolveLang,
  translatorFor,
  type Lang,
  type LanguagePref,
  type TranslateFn,
} from '../i18n';

const SETTINGS_KEY = '@plasebo/settings';

export interface Settings {
  themeMode: ThemeMode;
  /** Dokunsal geri bildirim. */
  haptics: boolean;
  /** Ritüel sesinin seviyesi (0-1). */
  soundVolume: number;
  /** Günlük hatırlatıcı bildirimi. */
  reminderEnabled: boolean;
  reminderHour: number; // 0-23
  reminderMinute: number; // 0-59
  /**
   * Kör test: bazı günler ritüel yerine eşit süreli "sahte" bir bekleme
   * gelir. Hangi günün sahte olduğu ritüel bitene kadar söylenmez.
   */
  blindTest: boolean;
  /** Doz çarpanı — adım sürelerini uzatır (1 veya 2). */
  dose: number;
  /** Arayüz dili. `system` cihazın dilini izler. */
  language: LanguagePref;
  /** Günün rastgele saatlerinde düşen kısa dürtmeler. */
  smartNudges: boolean;
  /** Dürtme sayısı (gün başına). */
  nudgesPerDay: number;
}

export const defaultSettings: Settings = {
  themeMode: 'dark',
  haptics: true,
  soundVolume: 0.6,
  reminderEnabled: false,
  reminderHour: 9,
  reminderMinute: 0,
  blindTest: false,
  dose: 1,
  language: 'system',
  smartNudges: false,
  nudgesPerDay: 2,
};

interface SettingsContextValue {
  settings: Settings;
  ready: boolean;
  /** Aktif tema adı (system çözümlenmiş hâliyle). */
  themeName: ThemeName;
  theme: ThemeColors;
  /** Çözümlenmiş arayüz dili. */
  lang: Lang;
  /** Metin çevirici — `t('Ayarlar')`. */
  t: TranslateFn;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const stored = JSON.parse(raw) as Partial<Settings>;
            // Eski sürümlerde `themeMode: 'system'` kaydedilmiş olabilir;
            // o seçenek kaldırıldığı için koyuya taşınıyor.
            if ((stored.themeMode as string) === 'system') stored.themeMode = 'dark';
            setSettings({ ...defaultSettings, ...stored });
          } catch {
            // bozuk kayıt — varsayılanlarla devam
          }
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultSettings);
    void AsyncStorage.removeItem(SETTINGS_KEY).catch(() => {});
  }, []);

  const themeName: ThemeName = settings.themeMode;
  const lang = resolveLang(settings.language);

  const value = useMemo(
    () => ({
      settings,
      ready,
      themeName,
      theme: themeFor(themeName),
      lang,
      t: translatorFor(lang),
      update,
      reset,
    }),
    [settings, ready, themeName, lang, update, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings, SettingsProvider içinde kullanılmalı.');
  return ctx;
}

/** Kısayol: yalnızca renklere ihtiyaç duyan bileşenler için. */
export function useTheme(): ThemeColors {
  return useSettings().theme;
}

/** Kısayol: yalnızca metin çevirmesi gereken bileşenler için. */
export function useT(): TranslateFn {
  return useSettings().t;
}

/** Kısayol: dile göre biçimlendirme yapan yerler için (tarih, sayı). */
export function useLang(): Lang {
  return useSettings().lang;
}
