'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { AuthShell } from '@/components/auth/auth-shell';
import { ApiError, vaOnboarding } from '@/lib/api';

/**
 * The page an assistant lands on from their invitation link.
 *
 * ── Why it did not exist ────────────────────────────────────────────────────
 * `assistants/page.tsx` has always built the link as
 * `${origin}/accept-invite?token=…`, and the API has always served
 * `POST /v1/va/accept-invite` — but the page in between was never written, so
 * every invitation anyone sent led to a 404. The route table missed it because
 * the link is assembled from a template literal at runtime rather than written
 * as an `href`, which is the one shape `routes.spec.ts` could not see.
 *
 * ── What it does and deliberately does not do ───────────────────────────────
 * It sets a password and nothing else. It does not sign the assistant in: the
 * token is single-use and proves only that they read their email, which is not
 * the same as proving they know the password they just chose. They sign in
 * afterwards, and the agreement gate takes them from there.
 *
 * The email is not shown. The token identifies the invitation, but echoing the
 * address back would turn a leaked link into a way to learn who was invited.
 */
function AcceptInviteForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');

    // Checked here rather than server-side because the second field exists only
    // to catch a typo — the API has no use for it and should not be told it.
    if (password !== confirm) {
      setFieldErrors({ confirmPassword: 'Both passwords must match.' });
      return;
    }

    setSubmitting(true);
    try {
      await vaOnboarding.acceptInvite({ token: token ?? '', password });
      setDone(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        if (!error.fieldErrors) setFormError(error.message);
      } else {
        // Not an ApiError means the request never completed. Log the real one
        // so a bug in this file cannot spend an afternoon impersonating a
        // network outage, which is exactly what happened on the sign-in form.
        console.error('[accept-invite] request never completed:', error);
        setFormError('Could not reach the server. Check your connection and try again.');
      }
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <p className="text-base text-ink-muted">
        This link is missing its invitation code. Ask whoever invited you to send
        it again — the whole link matters, including everything after the{' '}
        <code className="font-mono text-sm">?</code>.
      </p>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-base text-ink">
          Your password is set. Sign in to read the confidentiality agreement —
          you will not see any of the client&rsquo;s details until it is signed.
        </p>
        <Button onClick={() => router.push('/va/login')} fullWidth>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Input
        name="password"
        type="password"
        label="Choose a password"
        hint="At least 12 characters. Length beats punctuation."
        autoComplete="new-password"
        required
        error={fieldErrors.password ?? fieldErrors.Password}
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Type it again"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? 'Setting your password…' : 'Set password'}
      </Button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <AuthShell
      title="Accept your invitation"
      subtitle="Choose a password. Next you will read and sign the confidentiality agreement."
      footer={
        <>
          Already set this up?{' '}
          <Link href="/va/login" className="text-accent-text underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      {/* useSearchParams needs a boundary, or the whole page opts out of
          prerendering and the shell flashes in late. */}
      <Suspense fallback={null}>
        <AcceptInviteForm />
      </Suspense>
    </AuthShell>
  );
}
