'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

export type BubbleRole = 'va' | 'ai';

/**
 * A message in the VA chat.
 *
 * The `flagged` variant marks a knowledge gap that was answered best-effort.
 * Its border fades in ONCE and settles — a looping pulse becomes noise within a
 * minute of real use, and the VA is told to keep going rather than stop, so it
 * must not read as an alarm.
 *
 * The border is a separate absolutely-positioned overlay whose opacity animates,
 * rather than an animated border-color. Animating colour would mean naming an
 * rgba value in the component, and colour values live in design-tokens.css.
 */
export function ChatBubble({
  role,
  flagged,
  children,
  footer,
  className,
}: {
  role: BubbleRole;
  flagged?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const isVa = role === 'va';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration('base'), ease: ease('out') }}
      className={cn('flex w-full gap-3', isVa ? 'justify-end' : 'justify-start')}
    >
      {!isVa && (
        <span
          aria-hidden="true"
          className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-accent text-sm font-semibold text-ink-on-accent"
        >
          AI
        </span>
      )}

      <div
        className={cn(
          'relative max-w-[min(680px,80%)] rounded-lg border px-5 py-4 text-base',
          isVa
            ? 'border-line bg-surface-sunken text-ink'
            : flagged
              ? 'border-transparent bg-accent-subtle text-ink'
              : 'border-line bg-surface text-ink',
          className,
        )}
      >
        {flagged && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration('slow'), ease: ease('out') }}
            className="pointer-events-none absolute inset-0 rounded-lg border border-accent-border"
          />
        )}
        {children}
        {footer && <div className="mt-3">{footer}</div>}
      </div>

      {isVa && (
        <span
          aria-hidden="true"
          className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-bg-dark text-sm font-semibold text-ink-inverse"
        >
          VA
        </span>
      )}
    </motion.div>
  );
}
