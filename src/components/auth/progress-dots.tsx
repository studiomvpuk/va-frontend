'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

/**
 * Onboarding progress.
 *
 * The active step is a widened pill rather than a filled circle, so progress is
 * legible without relying on colour alone. The `<ol>` and the visually-hidden
 * label are what make it legible to a screen reader too — a row of decorative
 * divs communicates nothing.
 */
export function ProgressDots({
  total,
  current,
  className,
}: {
  total: number;
  /** 1-indexed. */
  current: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <ol className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const active = i + 1 === current;
          return (
            <motion.li
              key={i}
              layout
              transition={{ duration: duration('base'), ease: ease('out') }}
              className={cn(
                'h-1.5 rounded-pill transition-colors duration-base ease-out',
                active ? 'w-7 bg-accent' : 'w-1.5 bg-line-strong',
              )}
            />
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        Step {current} of {total}
      </p>
    </div>
  );
}
