import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Session, UserData } from '../types';
import {
  addSession,
  defaultUser,
  loadUser,
  normalizeStreak,
  saveUser,
  resetAll,
} from '../utils/storage';

interface UserContextValue {
  user: UserData;
  ready: boolean;
  update: (patch: Partial<UserData>) => void;
  recordSession: (session: Session) => void;
  reset: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadUser().then((loaded) => {
      if (!alive) return;
      setUser(normalizeStreak(loaded));
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: UserData) => {
    setUser(next);
    void saveUser(next);
  }, []);

  const update = useCallback(
    (patch: Partial<UserData>) => {
      setUser((prev) => {
        const next = { ...prev, ...patch };
        void saveUser(next);
        return next;
      });
    },
    []
  );

  const recordSession = useCallback((session: Session) => {
    setUser((prev) => {
      const next = addSession(prev, session);
      void saveUser(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    void resetAll();
    persist({ ...defaultUser });
  }, [persist]);

  const value = useMemo(
    () => ({ user, ready, update, recordSession, reset }),
    [user, ready, update, recordSession, reset]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser, UserProvider içinde kullanılmalı.');
  return ctx;
}
