'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Segmented } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { GUIDES, type Audience } from '@/components/guide/guide-content';
import { auth, type AuthUser } from '@/lib/api';

/**
 * Screen 9 — How to Use.
 *
 * ── A page, not a modal ─────────────────────────────────────────────────────
 * Onboarding modals are read once, at the moment someone has least context for
 * them, and then are unreachable. This is the thing a VA opens in week three
 * when a form asks for something odd, so it is a route with a URL, in the nav
 * on every authenticated screen, in both roles.
 *
 * ── Both sides are visible to everyone ──────────────────────────────────────
 * It defaults to the reader's own role but lets either read the other, and that
 * is a feature rather than laziness about auth: a Client who can read exactly
 * what their assistant is told — including "you will not be handed a profile"
 * and "you will not be given ID numbers" — can verify the product's promises
 * instead of taking them on faith. Hiding it would make the guarantees less
 * credible, not more secure.
 */
export default function HowToUsePage() {
  const [audience, setAudience] = useState<Audience>('client');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Best-effort. A signed-out reader gets the Client view, which is the right
    // default for someone who has arrived here from outside.
    void auth.restore().then((restored) => {
      setUser(restored);
      if (restored?.role === 'VA') setAudience('va');
    });
  }, []);

  const guide = GUIDES[audience];

  return (
    <PageTransition>
      {/* A landmark, not a div: this route has no AppShell around it, so
          without one there is no <main> on the page and nothing for a screen
          reader’s "skip to content" to land on. */}
      <main className="mx-auto w-full max-w-app px-4 pb-24 pt-10 md:px-8">
        <header className="mb-10">
          <p className="label-section">How to use this</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
            {guide.title}
          </h1>
          <p className="mt-3 max-w-prose text-base leading-normal text-ink-muted">
            {guide.intro}
          </p>
        </header>

        <div className="mb-10">
          <Segmented<Audience>
            label="Who this is for"
            layoutId="guide-audience"
            value={audience}
            onChange={setAudience}
            options={[
              { value: 'client', label: 'If you are hiring' },
              { value: 'va', label: 'If you are applying' },
            ]}
          />
          {user?.role === 'VA' && audience === 'client' && (
            <p className="mt-3 text-sm text-ink-muted">
              This is what the account holder sees. You are welcome to read it.
            </p>
          )}
          {user?.role === 'CLIENT' && audience === 'va' && (
            <p className="mt-3 text-sm text-ink-muted">
              This is exactly what your assistant is told — nothing is kept back
              from you here.
            </p>
          )}
        </div>

        {/* Keyed on the audience so switching remounts and re-runs the entry
            animation, rather than swapping text in place, which reads as a
            glitch. The CSS animation carries it — a JS `initial={{opacity: 0}}`
            here would server-render this section blank, which is exactly the
            bug that took PageTransition off Framer. */}
        <div
          key={audience}
          className="animate-page-enter flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line"
        >
          {guide.sections.map((section, i) => (
            <section key={section.heading} className="bg-surface px-6 py-8 md:px-10">
              <div className="flex flex-col gap-2 md:flex-row md:gap-10">
                <p
                  aria-hidden="true"
                  className="shrink-0 font-mono text-sm text-ink-muted md:w-12 md:pt-1"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>

                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-ink">
                    {section.heading}
                  </h2>
                  {/* The one-line answer first. Most visits are someone
                      checking one thing, not reading the page. */}
                  <p className="mt-1 max-w-prose text-base font-medium text-ink">
                    {section.summary}
                  </p>

                  <div className="mt-4 flex max-w-prose flex-col gap-3">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-base leading-normal text-ink-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 text-base">
          {/* Where "back" goes depends on who is reading, not on which tab they
              happen to be looking at — a VA reading the Client section still
              belongs in the chat. */}
          <Link
            href={user?.role === 'VA' ? '/chat' : '/dashboard'}
            className="text-accent-text underline"
          >
            {user?.role === 'VA' ? 'Back to the chat' : 'Back to the dashboard'}
          </Link>
        </footer>
      </main>
    </PageTransition>
  );
}
