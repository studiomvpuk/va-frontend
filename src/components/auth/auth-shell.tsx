import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { PRODUCT } from '@/lib/site';

/**
 * The frame around every credential form: sign up, sign in, assistant sign in.
 *
 * One component because three near-identical screens written separately drift,
 * and these are the screens where drift is most visible — they are what a new
 * person sees first, and two of them sit one click apart.
 *
 * The wordmark links home. An auth screen with no way back to the marketing
 * site is a dead end for anyone who arrived by accident.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  aside,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** The "already have an account" line. */
  footer?: ReactNode;
  /** Optional note under the card — used to send assistants to their own door. */
  aside?: ReactNode;
}) {
  return (
    <PageTransition>
      <main className="mx-auto flex min-h-dvh max-w-prose flex-col justify-center gap-6 px-4 py-16">
        <Link href="/" className="flex items-center gap-3 self-start">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-pill bg-accent" />
          <span className="font-display text-lg font-bold text-ink">
            {PRODUCT.name}
          </span>
        </Link>

        <Card bodyClassName="p-8">
          <h1 className="mb-2 font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mb-6 text-base text-ink-muted">{subtitle}</p>
          {children}
        </Card>

        {footer && <p className="text-center text-base text-ink-muted">{footer}</p>}
        {aside && <p className="text-center text-sm text-ink-muted">{aside}</p>}
      </main>
    </PageTransition>
  );
}
