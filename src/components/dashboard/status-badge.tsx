import { Badge, type BadgeTone } from '@/components/ui';
import type { AppStatus } from '@/lib/api';

/**
 * Status colour is information, not decoration.
 *
 * Only two things are coloured with intent: BLOCKED, because somebody is
 * waiting on the Client, and OFFER, because it is the outcome the product
 * exists for. Everything else is neutral — a tracker where twelve rows all
 * shout has the same information content as one where none do.
 */
const TONES: Record<AppStatus, BadgeTone> = {
  SCORED: 'neutral',
  SKIPPED: 'neutral',
  IN_PROGRESS: 'neutral',
  BLOCKED: 'warning',
  APPLIED: 'neutral',
  INTERVIEW: 'positive',
  REJECTED: 'neutral',
  OFFER: 'positive',
};

const LABELS: Record<AppStatus, string> = {
  SCORED: 'Scored',
  SKIPPED: 'Skipped',
  IN_PROGRESS: 'In progress',
  BLOCKED: 'Waiting on you',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  REJECTED: 'Rejected',
  OFFER: 'Offer',
};

export function StatusBadge({ status }: { status: AppStatus }) {
  return <Badge tone={TONES[status]}>{LABELS[status]}</Badge>;
}

export { LABELS as STATUS_LABELS };
