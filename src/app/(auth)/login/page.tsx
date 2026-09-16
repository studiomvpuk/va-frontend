import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInForm } from '@/components/auth/sign-in-form';
import { auth } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Sign in',
  // Signed-out utility pages are not what anyone should find in a search
  // result, and indexing them dilutes the two pages that should rank.
  robots: { index: false, follow: true },
};

/**
 * The page that was linked from sign-up since Phase 1 and never existed.
 *
 * Suspense because SignInForm reads the `next` query parameter, and Next
 * requires a boundary around `useSearchParams` so the rest of the page can
 * still be prerendered.
 */
export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Your profile, your assistants, and anything waiting on you."
      footer={
        <>
          No account yet?{' '}
          <Link href="/signup" className="text-accent-text underline underline-offset-4">
            Create one
          </Link>
        </>
      }
      aside={
        <>
          Working as an assistant?{' '}
          <Link href="/va/login" className="underline underline-offset-4">
            Sign in here instead
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <SignInForm
          authenticate={auth.login}
          fallbackPath="/dashboard"
          submitLabel="Sign in"
        />
      </Suspense>
    </AuthShell>
  );
}
