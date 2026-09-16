'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, EmptyState, FitScoreBadge, Segmented } from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  ApiError,
  applications as applicationsApi,
  settings as settingsApi,
  type AppStatus,
  type Application,
} from '@/lib/api';

/**
 * The full applications list.
 *
 * ── Why this route needed to exist ──────────────────────────────────────────
 * The dashboard shows a tracker and links each interview row to
 * /applications/:id/prep — a path with no parent. Deep-linking to a child of a
 * route that does not exist is the kind of thing that works until somebody
 * edits the URL bar, and then produces a 404 on a path the product clearly
 * implies is real.
 *
 * It also earns its place: the dashboard's tracker is capped, and this is where
 * somebody goes to find an application from three weeks ago.
 */
type Filter = 'all' | 'live' | 'interview' | 'closed';

const FILTERS: { value: Filter; label: string; statuses: AppStatus[] | null }[] = [
  { value: 'all', label: 'All', statuses: null },
  {
    value: 'live',
    label: 'Live',
    // Everything still capable of becoming something.
    statuses: ['SCORED', 'IN_PROGRESS', 'BLOCKED', 'APPLIED'],
  },
  { value: 'interview', label: 'Interviews', statuses: ['INTERVIEW', 'OFFER'] },
  { value: 'closed', label: 'Closed', statuses: ['SKIPPED', 'REJECTED'] },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [threshold, setThreshold] = useState(6);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [rows, prefs] = await Promise.all([
        applicationsApi.list({ limit: 200 }),
        settingsApi.get(),
      ]);
      setApplications(rows);
      setThreshold(prefs.minFitScore);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load your applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const statuses = FILTERS.find((f) => f.value === filter)?.statuses;
    return statuses ? applications.filter((a) => statuses.includes(a.status)) : applications;
  }, [applications, filter]);

  if (loading) {
    return <p className="py-20 text-center text-ink-muted">Loading your applications…</p>;
  }

  if (error) {
    return <EmptyState title="Could not load your applications" description={error} className="py-24" />;
  }

  return (
    <PageTransition>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Applications
        </h1>
        <p className="mt-2 text-base text-ink-muted">
          Everything your assistants have assessed, applied to, or skipped.
        </p>
      </header>

      <div className="mb-8">
        <Segmented<Filter>
          label="Filter applications"
          layoutId="applications-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ value: f.value, label: f.label }))}
        />
      </div>

      <Card bodyClassName="p-0">
        {visible.length === 0 ? (
          <EmptyState
            title={
              applications.length === 0
                ? 'No applications yet'
                : `Nothing ${STATUS_FILTER_NOUN[filter]}`
            }
            description={
              applications.length === 0
                ? 'Once an assistant starts applying, everything they do appears here.'
                : 'Try another filter.'
            }
          />
        ) : (
          <StaggerList>
            {visible.map((application) => (
              <Row key={application.id} application={application} threshold={threshold} />
            ))}
          </StaggerList>
        )}
      </Card>

      <p className="mt-4 text-sm text-ink-muted">
        Showing {visible.length} of {applications.length}.
      </p>
    </PageTransition>
  );
}

const STATUS_FILTER_NOUN: Record<Filter, string> = {
  all: 'here',
  live: 'live',
  interview: 'at interview',
  closed: 'closed',
};

function Row({
  application,
  threshold,
}: {
  application: Application;
  threshold: number;
}) {
  // Only these two have a prep document; linking the rest would 404.
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
          <p className="truncate text-base font-medium text-ink">{application.roleTitle}</p>
        )}
        <p className="truncate text-sm text-ink-muted">
          {application.companyName}
          <span aria-hidden="true"> · </span>
          <span>{formatDate(application.createdAt)}</span>
        </p>
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
