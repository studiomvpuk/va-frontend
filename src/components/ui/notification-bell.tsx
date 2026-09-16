'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

/**
 * The Notification Centre entry point.
 *
 * Mirrors what was sent by email (PRD §5.10). The count badge scales in when it
 * changes — one of the few places a small bit of movement is genuinely useful,
 * because the number arriving is the whole message.
 */
export function NotificationBell({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick?: () => void;
  className?: string;
}) {
  const label =
    count === 0
      ? 'Notifications, none unread'
      : `Notifications, ${count} unread`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative grid h-12 w-12 place-items-center rounded-md border border-line bg-surface',
        'transition-colors duration-fast ease-out hover:border-line-strong',
        className,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2a5 5 0 0 0-5 5v3.2L3.6 13a.6.6 0 0 0 .5.9h11.8a.6.6 0 0 0 .5-.9L15 10.2V7a5 5 0 0 0-5-5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8 16.2a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: duration('fast'), ease: ease('spring') }}
            aria-hidden="true"
            className={cn(
              'absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center',
              'rounded-pill bg-accent px-1 text-xs font-semibold text-ink-on-accent',
            )}
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
