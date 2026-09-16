'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  EmptyState,
  FitScoreBadge,
  StatTile,
} from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import { GapQueue } from '@/components/dashboard/gap-queue';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  ApiError,
  applications as applicationsApi,
  assistants as assistantsApi,
  knowledgeGaps as gapsApi,
  settings as settingsApi,
  type Application,
  type ApplicationStats,
  type KnowledgeGap,
  type VaSummary,
} from '@/lib/api';

const NO_STATS: ApplicationStats = {
  applications: 0,
  interviews: 0,
  waitingOnYou: 0,
  averageFit: 0,
};

/**
 * Screen 5 — Dashboard.
 *
 * The order down the page is deliberate and is not the order of the data model:
 * figures, then what is waiting on the Client, then the tracker, then the
 * assistants. Anything blocking a person comes above anything that is merely
 * informative, because this is the page a Client opens to find out whether they
 * need to do something.
 */
export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>(NO_STATS);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [vas, setVas] = useState<VaSummary[]>([]);
  const [threshold, setThreshold] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        // One round of requests, in parallel. Four sequential awaits here is
        // four round trips the Client watches.
        const [apps, figures, gapList, vaList, prefs] = await Promise.all([
          applicationsApi.list({ limit: 200 }),
          // Aggregated in the database rather than counted over `apps`: the
          // tracker is a page, and at 500 applications a client-side count
          // would quietly describe the page instead of the account.
          applicationsApi.stats(),
          gapsApi.list({ unresolvedOnly: true }),
          assistantsApi.list(),
          settingsApi.get(),
        ]);
        setApplications(apps);
        setStats(figures);
        setGaps(gapList);
        setVas(vaList);
        setThreshold(prefs.minFitScore);
      } catch (e) {
        setError(
          e instanceof ApiError ? e.message : 'Could not load your dashboard.',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const answerGap = useCallback(async (id: string, answer: string) => {
    const updated = await gapsApi.answer(id, answer);

    // Drop it from the queue and move its application out of BLOCKED in the
    // same render, so the tracker and the queue never briefly disagree.
    setGaps((current) => current.filter((g) => g.id !== id));
    setApplications((current) =>
      current.map((a) =>
        a.id === updated.applicationId ? { ...a, status: updated.applicationStatus } : a,
      ),
    );
    // The tile is a server-side count, so adjust it here rather than refetching
    // — one answered question is one fewer thing waiting, and a round trip to
    // learn that would make the number lag the row it belongs to.
    setStats((current) => ({
      ...current,
      waitingOnYou:
        updated.applicationStatus === 'BLOCKED'
          ? current.waitingOnYou
          : Math.max(0, current.waitingOnYou - 1),
    }));
  }, []);
  const signed = vas.filter((va) => va.agreement !== null && va.revokedAt === null);
  const pending = vas.filter((va) => va.agreement === null && va.revokedAt === null);

  if (loading) {
    return <p className="py-20 text-center text-ink-muted">Loading your dashboard…</p>;
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load your dashboard"
        description={error}
        className="py-24"
      />
    );
  }

  return (
    <PageTransition>
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-ink-muted">
          What your assistants have done, and anything waiting on you.
        </p>
      </header>

      <section
        aria-label="Summary"
        className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4"
      >
        {/* Hairline grid: the gap-px over a line-coloured background is what
            produces the dividers, so there is no border to double up at the
            wrap point on phones. */}
        <StatTile value={stats.applications} label="Applications" className="bg-surface" />
        <StatTile value={stats.interviews} label="Interviews" className="bg-surface" />
        <StatTile
          value={stats.waitingOnYou}
          label="Waiting on you"
          className="bg-surface"
        />
        <StatTile
          value={stats.averageFit}
          decimals={1}
          label="Average fit"
          className="bg-surface"
        />
      </section>

      <div className="mb-10">
        <GapQueue gaps={gaps} onAnswer={answerGap} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card label="Applications" bodyClassName="p-0">
          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Once an assistant starts applying, everything they do appears here."
            />
          ) : (
            <StaggerList>
              {applications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  threshold={threshold}
                />
              ))}
            </StaggerList>
          )}
        </Card>

        <Card label="Assistants">
          {vas.length === 0 ? (
            <p className="text-base text-ink-muted">
              No assistants yet. Invite one from{' '}
              <Link href="/assistants" className="text-accent-text underline">
                Assistants
              </Link>
              .
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {signed.map((va) => (
                <li key={va.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium text-ink">{va.fullName}</p>
                    <p className="text-sm text-ink-muted">
                      Signed{' '}
                      {new Date(va.agreement!.signedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <StatusPill tone="positive">Signed</StatusPill>
                </li>
              ))}

              {pending.map((va) => (
                <li key={va.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium text-ink">{va.fullName}</p>
                    {/* An unsigned assistant cannot see anything, so this is a
                        status rather than a warning. */}
                    <p className="text-sm text-ink-muted">Has not signed yet</p>
                  </div>
                  <StatusPill tone="warning">Pending</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}

function ApplicationRow({
  application,
  threshold,
}: {
  application: Application;
  threshold: number;
}) {
  // Only these two have a prep document. Linking every row would give most of
  // them a 404 — the route is the same one a VA gets, and it is a 404 for a
  // reason, so it should not be something the Client hits by clicking around.
  const hasPrep = application.status === 'INTERVIEW' || application.status === 'OFFER';

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 last:border-b-0">
      <div className="min-w-0">
        {hasPrep ? (
          <Link
            href={`/applications/${application.id}/prep`}
            className="truncate text-base font-medium text-ink underline decoration-line underline-offset-4 transition-colors duration-fast ease-out hover:decoration-accent"
          >
            {application.roleTitle}
          </Link>
        ) : (
          <p className="truncate text-base font-medium text-ink">
            {application.roleTitle}
          </p>
        )}
        <p className="truncate text-sm text-ink-muted">{application.companyName}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {application.fitScore !== null && (
          <FitScoreBadge score={application.fitScore} threshold={threshold} />
        )}
        <StatusBadge status={application.status} />
      </div>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: 'positive' | 'warning';
  children: string;
}) {
  return (
    <span
      className={
        tone === 'positive'
          ? 'shrink-0 rounded-pill bg-positive-subtle px-3 py-1 text-sm font-medium text-positive'
          : 'shrink-0 rounded-pill bg-warning-subtle px-3 py-1 text-sm font-medium text-warning'
      }
    >
      {children}
    </span>
  );
}
