import type { ReactNode } from 'react';
import { SessionProvider } from '@/lib/session';
import { RequireRole } from '@/components/auth/require-role';
import { AppShell } from '@/components/shell/app-shell';

/**
 * The Client workspace.
 *
 * The provider sits here rather than at the root so the marketing pages stay
 * server-rendered and static — they have no session to read, and wrapping them
 * in a client context would cost them their Lighthouse score for nothing.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <RequireRole role="CLIENT" signInPath="/login">
        <AppShell>{children}</AppShell>
      </RequireRole>
    </SessionProvider>
  );
}
