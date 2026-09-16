'use client';

import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

/**
 * Settings toggle. The knob springs; the track does not.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn('flex items-center justify-between gap-6', className)}>
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-lg font-semibold text-ink">
          {label}
        </label>
        {description && <p className="text-sm text-ink-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-pill transition-colors duration-fast ease-out',
          checked ? 'bg-accent' : 'bg-neutral-subtle',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <motion.span
          layout
          transition={{ duration: duration('fast'), ease: ease('spring') }}
          className={cn(
            'absolute top-1 h-6 w-6 rounded-pill bg-surface shadow-sm',
            checked ? 'left-7' : 'left-1',
          )}
        />
      </button>
    </div>
  );
}
