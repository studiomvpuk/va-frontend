import type { ReactNode } from 'react';
import { SessionProvider } from '@/lib/session';

/**
 * The credential screens need the session context — they are what puts a user
 * into it — but not the route guard, which would send them straight back here.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
