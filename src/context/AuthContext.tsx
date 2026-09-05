import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
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

export type AuthMode = 'google' | 'apple';

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
  /** Apple ile giriş bu cihazda kullanılabilir mi? (yalnızca iOS 13+) */
  appleAvailable: boolean;
  signingIn: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sağlayıcı ad vermediğinde yazılan yer tutucular.
 *
 * Dışa açık, çünkü "bu gerçek bir ad mı yoksa doldurma mı" sorusunu
 * yalnızca burası bilebilir; profil adını hesaptan tohumlayan taraf da
 * aynı listeye bakıyor.
 */
export const PLACEHOLDER_NAMES: readonly string[] = [
  'Apple kullanıcısı',
  'Google kullanıcısı',
];

/** Verilen ad gerçek bir ad mı, yoksa doldurma mı? */
export function isPlaceholderName(name?: string): boolean {
  const clean = name?.trim();
  return !clean || PLACEHOLDER_NAMES.includes(clean);
}

/**
 * E-posta adresinden okunabilir bir ad üretir.
 *
 * Sağlayıcı ad vermediğinde kullanılıyor: `ayse.yilmaz@ornek.com` →
 * "Ayşe Yılmaz" değil ama "Ayse Yilmaz" — noktalar ve alt çizgiler
 * boşluğa çevrilip her kelime büyük harfle başlatılıyor. Gerçek adın
 * yerini tutmaz, ama "Apple kullanıcısı"ndan kişiseldir.
 *
 * Apple'ın gizleme adresleri (`...@privaterelay.appleid.com`) atlanıyor:
 * onların kullanıcı adı kısmı rastgele bir dizi ve isim yerine geçmez.
 */
function nameFromEmail(email?: string): string | null {
  if (!email) return null;
  const at = email.indexOf('@');
  if (at <= 0) return null;
  if (email.slice(at + 1).toLowerCase().includes('privaterelay.appleid.com')) return null;
  const words = email
    .slice(0, at)
    .split(/[._+-]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1));
  const name = words.join(' ').trim();
  return name.length >= 2 ? name : null;
}

/** Cihazda saklı hesabı okur; ad kurtarmak için kullanılıyor. */
async function readStoredAccount(): Promise<Account | null> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

/** Google'ın döndürdüğü profili uygulamanın hesap kaydına çevirir. */
function toAccount(user: User): Account {
  return {
    mode: 'google',
    id: user.user.id,
    name: user.user.name ?? nameFromEmail(user.user.email) ?? 'Google kullanıcısı',
    email: user.user.email,
    photo: user.user.photo ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
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

  // Apple ile giriş yalnızca iOS 13 ve üzerinde vardır; simülatörde ve
  // eski sürümlerde düğme hiç gösterilmemelidir.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let alive = true;
    void AppleAuthentication.isAvailableAsync()
      .then((ok) => {
        if (alive) setAppleAvailable(ok);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

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

  /**
   * Apple ile giriş.
   *
   * App Store kuralı 4.8, üçüncü taraf girişi (burada Google) sunan
   * uygulamalarda Apple ile girişin de sunulmasını şart koşar; bu yüzden
   * iOS'ta iki düğme birden görünür.
   *
   * Ad ve e-posta Apple tarafından **yalnızca ilk yetkilendirmede**
   * verilir. Kullanıcı sonra çıkıp yeniden girerse bu alanlar boş gelir —
   * ilk seferde gelen ad cihazda saklandığı için hesap kaydı yine de
   * dolu kalır. Kullanıcı e-postasını gizlemeyi seçerse Apple bir
   * yönlendirme adresi (`...@privaterelay.appleid.com`) döndürür.
   */
  const signInWithApple = useCallback(async () => {
    setError(null);
    setSigningIn(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const given = credential.fullName?.givenName?.trim();
      const family = credential.fullName?.familyName?.trim();
      const fullName = [given, family].filter(Boolean).join(' ');

      // Ad ve e-posta yalnızca ilk yetkilendirmede geliyor. İkinci
      // girişte ikisi de boş dönüyor ve kayıt "Apple kullanıcısı" diye
      // güncelleniyordu: yani ilk seferde alınan gerçek ad, kullanıcı her
      // yeniden giriş yaptığında siliniyordu. Bu yüzden boş gelen alanlar
      // artık üzerine yazmıyor, cihazdaki kayıttan tamamlanıyor.
      const stored = await readStoredAccount();
      const sameUser = stored?.id === credential.user ? stored : null;
      const email = credential.email ?? sameUser?.email;
      const previous = sameUser?.name?.trim();

      persist({
        mode: 'apple',
        id: credential.user,
        // Sıra: Apple'ın verdiği ad → daha önce saklanmış ad →
        // e-postadan türetilen ad → son çare sabit metin.
        name:
          fullName ||
          (isPlaceholderName(previous) ? '' : (previous as string)) ||
          nameFromEmail(email) ||
          'Apple kullanıcısı',
        email,
      });
    } catch (e) {
      // Kullanıcı vazgeçtiğinde kod ERR_REQUEST_CANCELED olur; bu hata
      // sayılmaz.
      const code = (e as { code?: string })?.code;
      if (code !== 'ERR_REQUEST_CANCELED') {
        setError('Apple oturumu açılamadı.');
      }
    } finally {
      setSigningIn(false);
    }
  }, [persist]);

  const signOut = useCallback(() => {
    persist(null);
    // Apple tarafında çıkış diye bir çağrı yoktur; yerel kaydın silinmesi
    // yeterlidir.
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
      appleAvailable,
      signingIn,
      error,
      signInWithGoogle,
      signInWithApple,
      signOut,
    }),
    [
      account,
      ready,
      appleAvailable,
      signingIn,
      error,
      signInWithGoogle,
      signInWithApple,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı.');
  return ctx;
}
