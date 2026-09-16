'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui';
import Link from 'next/link';
import { PageTransition } from '@/components/motion';
import { ApiError, vaOnboarding, type AgreementText } from '@/lib/api';

/**
 * Screen 6 — the confidentiality agreement.
 *
 * Two things this screen does that a generic consent dialog does not:
 *
 *   - The full text is scrollable and always present, not behind a link. What
 *     is signed is hashed, and hashing text nobody was shown would be theatre.
 *   - The signature is a typed name rather than a tick alone. Typing your own
 *     name is a small act of deliberation, and it is what gets stored.
 */
export default function AgreementPage() {
  const router = useRouter();
  const [agreement, setAgreement] = useState<AgreementText | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void vaOnboarding
      .agreement()
      .then(setAgreement)
      .catch((e: unknown) =>
        setError(
          e instanceof ApiError ? e.message : 'Could not load the agreement.',
        ),
      );
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await vaOnboarding.sign({ signedName, acknowledged });
      router.push('/chat');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not record your signature.');
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <main className="mx-auto flex min-h-dvh max-w-prose flex-col justify-center gap-6 px-4 py-16">
        <Card bodyClassName="p-8">
          <h1 className="mb-2 text-2xl text-ink">
            {agreement?.title ?? 'Confidentiality Agreement'}
          </h1>
          <p className="mb-6 text-ink-muted">
            Review and accept before accessing the workspace.
          </p>

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-md border border-danger bg-danger-subtle px-4 py-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <div
            className="mb-6 max-h-[340px] overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-surface-sunken px-5 py-4 text-sm leading-relaxed text-ink"
            tabIndex={0}
            aria-label="Agreement text"
          >
            {agreement?.body ?? 'Loading the agreement…'}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className="flex cursor-pointer items-start gap-3 text-ink">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[color:var(--color-accent)]"
              />
              <span>I have read and agree to the terms above</span>
            </label>

            <Input
              label="Type your full name to sign"
              placeholder="e.g. Joy Emoredo"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              autoComplete="name"
              hint="Your name, the time, your IP address and the exact text above are recorded."
              required
            />

            <Button
              type="submit"
              fullWidth
              disabled={!agreement || !acknowledged || signedName.trim().length < 2 || submitting}
            >
              {submitting ? 'Recording…' : 'Sign & continue'}
            </Button>
          </form>
        </Card>

        {agreement && (
          <p className="text-center text-sm text-ink-muted">
            Version {agreement.version}, effective {agreement.effectiveFrom}
          </p>
        )}

        {/* The one screen where the guide is most worth reading — you are
            about to sign this, and the guide is what explains what the job
            actually involves. It is a text link because this screen has no
            header to put an icon in. */}
        <p className="text-center text-sm">
          <Link href="/how-to-use" className="text-ink-muted underline">
            What does this involve?
          </Link>
        </p>
      </main>
    </PageTransition>
  );
}
