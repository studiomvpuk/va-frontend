import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Assistant sign in',
  robots: { index: false, follow: true },
};

/**
 * The assistant's door.
 *
 * `auth.vaLogin` has existed in the API client since Phase 5 with nothing
 * calling it — an assistant could be invited, could accept, and then had no
 * way back in on any subsequent day. This is that way back in.
 *
 * A separate page rather than a role toggle on the Client form: the two go to
 * different endpoints, and a shared form with a dropdown would mean typing the
 * wrong option gives you "those do not match" for correct credentials.
 */
export default function VaLoginPage() {
  return (
    <AuthShell
      title="Assistant sign in"
      subtitle="Sign in to the workspace for the account you are applying on behalf of."
      footer={
        <>
          Invited but not set up yet? Use the link in your invitation email — it
          is what creates your account.
        </>
      }
      aside={
        <>
          Not an assistant?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Sign in here
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <SignInForm
          variant="va"
          fallbackPath="/chat"
          submitLabel="Sign in"
        />
      </Suspense>
    </AuthShell>
  );
}
