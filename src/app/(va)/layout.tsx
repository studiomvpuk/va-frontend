import type { ReactNode } from 'react';
import { SessionProvider } from '@/lib/session';
import { RequireRole } from '@/components/auth/require-role';

/**
 * The assistant's side.
 *
 * No AppShell: the Client's nav is a list of screens an assistant has no access
 * to, and rendering it greyed out would advertise a workspace they cannot open.
 * The VA screens carry their own header.
 */
export default function VaLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <RequireRole role="VA" signInPath="/va/login">
        {children}
      </RequireRole>
    </SessionProvider>
  );
}
