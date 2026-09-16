'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import type { AuthUser } from '@/lib/api';

/**
 * The client-side route gate.
 *
 * ── What this is and is not ─────────────────────────────────────────────────
 * It is a UX affordance. It is NOT a security control, and PRD §7.1 is explicit
 * about that: "A client-side check is a UX affordance and never a control."
 * Every route re-checks ownership server-side, the API's guards are default-deny,
 * and a determined visitor can render any of these screens by editing their own
 * JavaScript — and will get 401s for their trouble.
 *
 * What it is for: a signed-out person who lands on /dashboard should see a login
 * page, not a screen full of failed requests. Before this existed, that is
 * exactly what they saw.
 *
 * ── Why it redirects rather than rendering a message ────────────────────────
 * The overwhelmingly likely reason to be here without a session is a bookmark
 * or an expired one. Both want the login form, and `next` brings them back to
 * where they were aiming.
 */
export function RequireRole({
  role,
  signInPath,
  children,
}: {
  role: AuthUser['role'];
  signInPath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    if (session.status === 'loading') return;

    if (session.status === 'anonymous') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`${signInPath}?next=${next}`);
      return;
    }

    if (session.user.role !== role) {
      // Signed in, wrong side of the product. A VA who follows a Client link
      // gets their own workspace rather than an error — and vice versa.
      router.replace(session.user.role === 'VA' ? '/chat' : '/dashboard');
    }
  }, [session, role, signInPath, router]);

  // The loading state is deliberately quiet. A spinner that flashes for 200ms
  // on every navigation is worse than a beat of nothing.
  if (session.status !== 'authenticated' || session.user.role !== role) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
