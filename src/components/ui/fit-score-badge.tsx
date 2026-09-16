'use client';

import { cn } from '@/lib/cn';
import { CountUp } from '../motion/count-up';

/**
 * The 0-10 fit score.
 *
 * Colour is derived from the Client's own threshold, not from a fixed number,
 * because "good" is whatever that Client set. Within 0.5 of the threshold the
 * score reads as borderline — the case where the VA may want to open the full
 * reasoning rather than trust the verdict (PRD §5.5).
 */
export type FitTone = 'high' | 'borderline' | 'low';

export function fitTone(score: number, threshold: number): FitTone {
  if (score >= threshold + 0.5) return 'high';
  if (score >= threshold - 0.5) return 'borderline';
  return 'low';
}

const TONES: Record<FitTone, string> = {
  high: 'text-positive',
  borderline: 'text-warning',
  low: 'text-neutral',
};

const PILL: Record<FitTone, string> = {
  high: 'bg-positive-subtle text-positive',
  borderline: 'bg-warning-subtle text-warning',
  low: 'bg-neutral-subtle text-neutral',
};

export function FitScoreBadge({
  score,
  threshold = 6,
  variant = 'pill',
  className,
}: {
  score: number;
  threshold?: number;
  /** `large` is the header treatment in the VA chat; `pill` is the tracker row. */
  variant?: 'pill' | 'large';
  className?: string;
}) {
  const tone = fitTone(score, threshold);

  if (variant === 'large') {
    return (
      <p className={cn('font-display font-bold', TONES[tone], className)}>
        <CountUp value={score} decimals={1} className="text-3xl" />
        <span className="text-lg text-ink-muted">/10</span>
      </p>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex min-w-[56px] items-center justify-center rounded-pill px-3 py-1',
        'text-sm font-semibold transition-colors duration-base ease-out',
        PILL[tone],
        className,
      )}
    >
      <CountUp value={score} decimals={1} />
    </span>
  );
}
