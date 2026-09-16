'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useSession } from '@/lib/session';
import { ApiError, type AuthUser } from '@/lib/api';

/**
 * Both sign-in forms, differing only in which endpoint they call.
 *
 * ── The `next` parameter ────────────────────────────────────────────────────
 * RequireRole puts the path someone was aiming for into the query string, so a
 * bookmarked /sites lands back on /sites rather than dumping them on the
 * dashboard to navigate again.
 *
 * It is validated before use. An open redirect is the classic way this exact
 * parameter gets abused — a link to our own login page that bounces to someone
 * else's, wearing our domain in the address bar during the hop. Only same-site
 * absolute paths are honoured.
 */
export function SignInForm({
  authenticate,
  fallbackPath,
  submitLabel,
}: {
  authenticate: (input: { email: string; password: string }) => Promise<AuthUser>;
  fallbackPath: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const data = new FormData(event.currentTarget);
    try {
      const user = await authenticate({
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
      });
      setUser(user);
      router.replace(safeNext(params.get('next')) ?? fallbackPath);
    } catch (e) {
      // Deliberately the same message for a wrong password and an unknown
      // account. Distinguishing them turns the form into a way to find out
      // which email addresses have accounts here.
      setError(
        e instanceof ApiError && e.status === 401
          ? 'That email and password do not match.'
          : e instanceof ApiError
            ? e.message
            : 'Could not reach the server. Check your connection and try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="username"
        required
        autoFocus
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? 'Signing in…' : submitLabel}
      </Button>
    </form>
  );
}

/**
 * A redirect target we are willing to follow.
 *
 * Must start with exactly one `/`. `//evil.example.com` is a protocol-relative
 * URL that browsers treat as absolute, and it is the reason the second
 * character is checked rather than just the first.
 */
export function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (value.includes('\\')) return null;
  return value;
}
