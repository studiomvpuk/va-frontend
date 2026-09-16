'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, EmptyState } from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import { BasisLabel, hostOf } from '@/components/prep/basis-label';
import { ApiError, prep as prepApi, type PrepDocument } from '@/lib/api';

/** How often to look while the research runs, and when to give up looking. */
const POLL_MS = 4_000;
const POLL_TIMEOUT_MS = 5 * 60_000;

/**
 * Screen 8 — Interview prep.
 *
 * Three states, and the third is the one that usually gets skipped: PENDING
 * while the research runs, READY when it is written, and FAILED when nothing
 * could be verified. Without FAILED the page has no way to stop spinning, and
 * a Client sitting in front of a permanent spinner has been told nothing at
 * all — which is worse than being told it did not work.
 */
export default function PrepPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const [document, setDocument] = useState<PrepDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  const load = useCallback(async () => {
    try {
      setDocument(await prepApi.find(applicationId));
      setError(null);
    } catch (e) {
      // 404 here means either "not at interview stage" or "not yours". The API
      // does not distinguish them and neither does this.
      setError(
        e instanceof ApiError && e.status === 404
          ? 'There are no interview notes for this application.'
          : 'Could not load your notes.',
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (document?.status !== 'PENDING') return;

    // Polling rather than a socket: one connection per Client for a document
    // that arrives once is a lot of machinery for a thing that happens twice a
    // week. The timeout matters more — a job that dies without writing FAILED
    // would otherwise poll for as long as the tab is open.
    const timer = setInterval(() => {
      if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
        clearInterval(timer);
        setError('This is taking longer than expected. Try again shortly.');
        return;
      }
      void load();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [document?.status, load]);

  if (loading) {
    return <p className="py-20 text-center text-ink-muted">Loading your notes…</p>;
  }

  if (error || !document) {
    return (
      <EmptyState
        title="No interview notes"
        description={error ?? 'Nothing here yet.'}
        className="py-24"
        action={
          <Link href="/dashboard" className="text-accent-text underline">
            Back to dashboard
          </Link>
        }
      />
    );
  }

  return (
    <PageTransition>
      <header className="mb-10">
        <p className="label-section">Interview prep</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
          {document.roleTitle}
        </h1>
        <p className="mt-2 text-base text-ink-muted">{document.companyName}</p>
      </header>

      {document.status === 'PENDING' && <Researching />}

      {document.status === 'FAILED' && (
        <Card label="Nothing to show">
          <p className="text-base text-ink">
            {document.failureReason ??
              'The research did not produce anything that could be verified.'}
          </p>
          <p className="mt-3 text-base text-ink-muted">
            Nothing was written rather than guessed. Adding more to your{' '}
            <Link href="/profile" className="text-accent-text underline">
              profile
            </Link>{' '}
            gives the next attempt more to work from.
          </p>
        </Card>
      )}

      {document.status === 'READY' && <Ready document={document} />}
    </PageTransition>
  );
}

function Researching() {
  return (
    <Card label="Researching">
      <p className="text-base text-ink">
        Reading up on the company and working out what they are likely to ask.
      </p>
      <p className="mt-3 text-base text-ink-muted">
        This takes a minute or two. You can leave this page — you will get a
        notification when it is ready.
      </p>
      <div
        aria-hidden="true"
        className="mt-6 h-1 w-full overflow-hidden rounded-pill bg-surface-sunken"
      >
        {/* A moving bar, not a percentage. There is no honest percentage to
            show, and an invented one is a small lie told every four seconds. */}
        <div className="animate-prep-progress h-full w-1/3 rounded-pill bg-accent" />
      </div>
    </Card>
  );
}

function Ready({ document }: { document: PrepDocument }) {
  return (
    <div className="flex flex-col gap-6">
      <Card label="The company">
        {document.companyBackground ? (
          <>
            <p className="max-w-prose text-base leading-normal text-ink">
              {document.companyBackground}
            </p>
            {document.sources.length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                <span>Sources:</span>
                {document.sources.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-line underline-offset-2 hover:text-ink"
                  >
                    {hostOf(url)}
                  </a>
                ))}
              </p>
            )}
          </>
        ) : (
          <p className="max-w-prose text-base text-ink-muted">
            {/* Said plainly. The alternative — a paragraph of plausible
                background — is the one outcome this whole path exists to
                prevent, and the Client would have no way to tell. */}
            Nothing reliable could be found about {document.companyName}, so
            there is no background here rather than a guess. The questions and
            talking points below come from the posting and your own profile.
          </p>
        )}
      </Card>

      <Card label="Likely questions" bodyClassName="p-0">
        <StaggerList>
          {document.likelyQuestions.map((item) => (
            <div
              key={item.question}
              className="border-b border-line px-6 py-5 last:border-b-0"
            >
              <p className="font-display text-lg font-semibold text-ink">
                {item.question}
              </p>
              {item.why && (
                <p className="mt-1 max-w-prose text-base text-ink-muted">{item.why}</p>
              )}
            </div>
          ))}
        </StaggerList>
      </Card>

      <Card label="Make sure you say" bodyClassName="p-0">
        <StaggerList>
          {document.talkingPoints.map((item) => (
            <div
              key={item.point}
              className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-6 py-5 last:border-b-0"
            >
              <p className="max-w-prose text-base text-ink">{item.point}</p>
              <BasisLabel basis={item.basis} />
            </div>
          ))}
        </StaggerList>
      </Card>

      {document.generatedAt && (
        <p className="text-sm text-ink-muted">
          Written{' '}
          {new Date(document.generatedAt).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
          .
        </p>
      )}
    </div>
  );
}
