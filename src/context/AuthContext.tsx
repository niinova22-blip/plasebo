import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  type User,
} from '@react-native-google-signin/google-signin';
import { googleClientIds, isGoogleConfigured } from '../config/auth';

const ACCOUNT_KEY = '@plasebo/account';

// Yapılandırma bir kez, modül yüklenirken kurulur. `configure` senkron
// çalışır ve yalnızca native tarafa parametre yazar — giriş açmaz.
if (isGoogleConfigured) {
  GoogleSignin.configure({
    webClientId: googleClientIds.web,
    iosClientId: googleClientIds.ios || undefined,
    scopes: ['profile', 'email'],
    offlineAccess: false,
  });
}

export type AuthMode = 'google';

export interface Account {
  mode: AuthMode;
  id: string;
  name: string;
  email?: string;
  photo?: string;
}

interface AuthContextValue {
  account: Account | null;
  ready: boolean;
  /** Google yapılandırılmış mı? Değilse arayüz butonu gizler. */
  googleAvailable: boolean;
  /** Oturum açma isteği gönderilebilir durumda mı? */
  googleReady: boolean;
  signingIn: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Google'ın döndürdüğü profili uygulamanın hesap kaydına çevirir. */
function toAccount(user: User): Account {
  return {
    mode: 'google',
    id: user.user.id,
    name: user.user.name ?? 'Google kullanıcısı',
    email: user.user.email,
    photo: user.user.photo ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: Account | null) => {
    setAccount(next);
    if (next) {
      void AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(next)).catch(() => {});
    } else {
      void AsyncStorage.removeItem(ACCOUNT_KEY).catch(() => {});
    }
  }, []);

  // Açılışta oturumu geri yükle. Önce cihazdaki kayıt okunur (çevrimdışı
  // açılışta da hesap görünsün diye), sonra Google'a sessizce sorulur.
  useEffect(() => {
    let alive = true;

    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
        if (raw && alive) {
          try {
            setAccount(JSON.parse(raw) as Account);
          } catch {
            // bozuk kayıt — oturum açılmamış sayılır
          }
        }
      } catch {
        // depolama okunamadı — oturum açılmamış sayılır
      }

      if (isGoogleConfigured) {
        try {
          const silent = await GoogleSignin.signInSilently();
          if (alive && silent.type === 'success') persist(toAccount(silent.data));
        } catch {
          // sessiz giriş başarısızsa kullanıcı butona basar
        }
      }

      if (alive) setReady(true);
    };

    void restore();
    return () => {
      alive = false;
    };
  }, [persist]);

  const signInWithGoogle = useCallback(async () => {
    if (!isGoogleConfigured) {
      setError('Google oturum açma bu derlemede yapılandırılmamış.');
      return;
    }
    setError(null);
    setSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        persist(toAccount(response.data));
      }
      // 'cancelled' — kullanıcı vazgeçti, hata göstermiyoruz.
    } catch (e) {
      if (isErrorWithCode(e)) {
        switch (e.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break;
          case statusCodes.IN_PROGRESS:
            setError('Giriş zaten sürüyor.');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError('Bu cihazda Google Play Hizmetleri yok ya da güncel değil.');
            break;
          default:
            // DEVELOPER_ERROR burada düşer: paket adı ya da SHA-1 parmak izi
            // Google Cloud Console'daki Android istemcisiyle eşleşmiyor.
            setError(`Google oturumu açılamadı (${e.code}).`);
        }
      } else {
        setError('Google oturumu açılamadı.');
      }
    } finally {
      setSigningIn(false);
    }
  }, [persist]);

  const signOut = useCallback(() => {
    persist(null);
    if (isGoogleConfigured) void GoogleSignin.signOut().catch(() => {});
  }, [persist]);

  const value = useMemo(
    () => ({
      account,
      ready,
      googleAvailable: isGoogleConfigured,
      // Native giriş için ayrıca bir istek hazırlığı beklenmiyor; kimlik
      // tanımlıysa buton ilk karede basılabilir.
      googleReady: isGoogleConfigured,
      signingIn,
      error,
      signInWithGoogle,
      signOut,
    }),
    [account, ready, signingIn, error, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı.');
  return ctx;
}
