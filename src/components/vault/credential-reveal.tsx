'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { CountdownRing } from './countdown-ring';
import { ApiError, vaVault, type RevealedCredential } from '@/lib/api';

/**
 * The VA's view of one password.
 *
 * Three things are happening at once here, and all three matter:
 *
 *   - the value is on screen for 60 seconds and then goes, so it is not left
 *     sitting on a shared or unattended screen;
 *   - a copy button, because the realistic alternative is the VA retyping a
 *     generated password and getting it wrong;
 *   - a single mid-countdown check for whether the Client rotated it while it
 *     was visible, so a stale password surfaces as a clear message rather than
 *     an unexplained login failure on the job site.
 */
export function CredentialReveal({ siteId }: { siteId: string }) {
  const [credential, setCredential] = useState<RevealedCredential | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const hide = useCallback(() => {
    setCredential(null);
    setStale(false);
    setCopied(false);
  }, []);

  // One check, halfway through the window. Polling harder would cost more than
  // it buys — the Client rotating mid-reveal is rare, and the check exists to
  // explain a failure, not to prevent one.
  useEffect(() => {
    if (!credential) return;
    const half = Math.max((new Date(credential.expiresAt).getTime() - Date.now()) / 2, 1000);
    const id = setTimeout(() => {
      void vaVault
        .revealStatus(credential.revealId)
        .then((s) => setStale(s.superseded))
        .catch(() => undefined);
    }, half);
    return () => clearTimeout(id);
  }, [credential]);

  async function reveal() {
    setBusy(true);
    setError(null);
    try {
      setCredential(await vaVault.reveal(siteId));
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Could not reach the server. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(credential.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Your browser blocked the clipboard. Select the text and copy it.');
    }
  }

  if (error && !credential) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
        <Button size="sm" variant="secondary" onClick={() => void reveal()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!credential) {
    return (
      <Button size="sm" onClick={() => void reveal()} disabled={busy}>
        {busy ? 'Revealing…' : 'Reveal password'}
      </Button>
    );
  }

  if (stale) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-accent-border bg-accent-subtle px-4 py-3">
        <p className="text-sm text-ink">
          The account owner changed this password just now, so the one you were
          shown will not work. Request it again.
        </p>
        <Button size="sm" onClick={() => void reveal()}>
          Reveal the new one
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface-sunken px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-ink-muted">
            {credential.username}
          </span>
          <code className="truncate font-mono text-base text-ink">
            {credential.password}
          </code>
        </div>
        <CountdownRing
          expiresAt={new Date(credential.expiresAt)}
          onExpire={hide}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => void copy()}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button size="sm" variant="ghost" onClick={hide}>
          Hide now
        </Button>
        <span className="ml-auto text-xs text-ink-muted">This view was logged</span>
      </div>
    </div>
  );
}
