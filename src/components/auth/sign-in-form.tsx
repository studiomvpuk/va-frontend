'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useSession } from '@/lib/session';
import { ApiError, auth } from '@/lib/api';

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
/**
 * Which sign-in this is. A string, not the function itself.
 *
 * It used to take `authenticate` — the API function — as a prop, and the two
 * pages that render it are Server Components. A function cannot cross the
 * server/client boundary in the App Router, so on the client the prop was not
 * callable and every submit threw before it reached the network. The catch in
 * `onSubmit` then reported "Could not reach the server", which sent everyone
 * looking at CORS and deploys for a bug that was three lines away.
 *
 * A serializable discriminator cannot fail that way: the component picks the
 * function on the client, where the function actually exists.
 */
const ENDPOINTS = {
  client: auth.login,
  va: auth.vaLogin,
} as const;

export function SignInForm({
  variant,
  fallbackPath,
  submitLabel,
}: {
  variant: keyof typeof ENDPOINTS;
  fallbackPath: string;
  submitLabel: string;
}) {
  const authenticate = ENDPOINTS[variant];
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
      if (e instanceof ApiError) {
        // Deliberately the same message for a wrong password and an unknown
        // account. Distinguishing them turns the form into a way to find out
        // which email addresses have accounts here.
        setError(
          e.status === 401 ? 'That email and password do not match.' : e.message,
        );
      } else {
        /*
         * Anything that is not an ApiError never reached the API — a dropped
         * connection, or a bug in this file. Those look identical to the person
         * signing in, so the message stays vague, but the real error goes to the
         * console rather than being swallowed.
         *
         * It was swallowed once, and a TypeError in our own code spent an
         * afternoon impersonating a network outage.
         */
        console.error('[sign-in] request never completed:', e);
        setError('Could not reach the server. Check your connection and try again.');
      }
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
