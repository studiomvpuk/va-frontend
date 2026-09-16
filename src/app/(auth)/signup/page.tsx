'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { ProgressDots } from '@/components/auth/progress-dots';
import { AuthShell } from '@/components/auth/auth-shell';
import { ApiError, auth } from '@/lib/api';
import { useSession } from '@/lib/session';

/**
 * Screen 1 — Create your account.
 *
 * Step 1 of 3: account, then profile, then sites. The dots are the promise that
 * this is short.
 */
export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    const data = new FormData(event.currentTarget);
    try {
      const user = await auth.register({
        fullName: String(data.get('fullName') ?? ''),
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
      });
      // Into the session, not just into a redirect. Without this the next
      // screen mounts, finds no user in context and bounces to /login — which
      // is what would have happened the moment the route guard existed.
      setUser(user);
      router.push('/profile');
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        // Field-level messages are shown under their inputs; only show a
        // form-level message when there is nothing more specific to say.
        if (!error.fieldErrors) setFormError(error.message);
      } else {
        setFormError('Could not reach the server. Check your connection and try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Three short steps: your account, your profile, then where your assistant may apply."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-accent-text underline underline-offset-4">
            Sign in
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
      <div className="mb-6">
        <ProgressDots total={3} current={1} />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Input
          name="fullName"
          label="Full name"
          placeholder="e.g. Tolulope Olonibua"
          autoComplete="name"
          required
          error={fieldErrors.fullName}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@email.com"
          autoComplete="email"
          required
          error={fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          required
          hint="At least 12 characters. Length beats punctuation."
          error={fieldErrors.password}
        />

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating account…' : 'Continue'}
        </Button>
      </form>
    </AuthShell>
  );
}
