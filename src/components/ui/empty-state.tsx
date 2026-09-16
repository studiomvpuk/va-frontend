import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Every list gets one of these. A blank card is a bug, not a neutral state —
 * the user cannot tell whether nothing has happened yet or something failed.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}
    >
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description && (
        <p className="max-w-prose text-base text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
