import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * White, hairline border, no shadow at rest.
 *
 * "Confidence over decoration" — separation comes from the line and the
 * whitespace, not from a drop shadow.
 */
export function Card({
  label,
  action,
  children,
  className,
  bodyClassName,
}: {
  /** The small uppercase strip: EXPERIENCE, FIELDS & SENSITIVITY, ... */
  label?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-line bg-surface overflow-hidden',
        className,
      )}
    >
      {(label || action) && (
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          {label && (
            <h2 className="text-xs font-medium uppercase tracking-label text-ink-muted">
              {label}
            </h2>
          )}
          {action}
        </header>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </section>
  );
}

/** A row inside a card list, with the hairline divider handled for you. */
export function CardRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-line px-6 py-5 last:border-b-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
