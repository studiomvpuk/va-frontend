'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

export type BadgeTone = 'neutral' | 'sensitive' | 'positive' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-subtle text-neutral',
  sensitive: 'bg-accent-subtle text-accent-text',
  positive: 'bg-positive-subtle text-positive',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
};

/**
 * Toggling General <-> Sensitive crossfades colour with no layout shift.
 *
 * `min-w` keeps both states the same width so the row does not jump — the CLS
 * contribution has to be zero, not merely small (PRD Phase 2 acceptance).
 */
export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      layout="position"
      transition={{ duration: duration('fast'), ease: ease('out') }}
      className={cn(
        'inline-flex min-w-[84px] items-center justify-center rounded-pill px-3 py-1.5',
        'text-sm font-medium transition-colors duration-fast ease-out',
        TONES[tone],
        className,
      )}
    >
      {children}
    </motion.span>
  );
}
