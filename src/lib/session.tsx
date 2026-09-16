'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { auth, type AuthUser } from './api';

/**
 * Who is signed in, for the whole app.
 *
 * ── The problem this solves ─────────────────────────────────────────────────
 * The access token lives in a module variable rather than localStorage, which
 * is the right call for XSS — but it means a page refresh loses it. Until now
 * nothing put it back, so refreshing any screen left the app authenticated as
 * far as the UI knew and rejected by every API call. The user saw a dashboard
 * full of errors rather than a login page.
 *
 * On mount this exchanges the httpOnly refresh cookie for a fresh access token.
 * That cookie survives the refresh because JavaScript cannot touch it, which is
 * the whole reason it exists.
 */
export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser };

interface SessionValue {
  session: SessionState;
  /** Called by the login and signup pages once the API has returned a user. */
  setUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await auth.restore();
      // The component may have unmounted during the round trip — a fast
      // navigation away from a protected route is the common case.
      if (cancelled) return;
      setSession(user ? { status: 'authenticated', user } : { status: 'anonymous' });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = useCallback((user: AuthUser) => {
    setSession({ status: 'authenticated', user });
  }, []);

  const signOut = useCallback(async () => {
    // Local state clears first. If the network call fails the token is already
    // gone from this tab, which is the part that matters to the person clicking.
    setSession({ status: 'anonymous' });
    await auth.logout();
    router.push('/');
  }, [router]);

  const value = useMemo(() => ({ session, setUser, signOut }), [session, setUser, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    // A component using this outside the provider would silently render as
    // signed out, which looks like a login bug rather than a wiring bug.
    throw new Error('useSession must be used inside a SessionProvider');
  }
  return value;
}
