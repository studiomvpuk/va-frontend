'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A tab switcher, borrowing the nav pill's travelling highlight.
 *
 * Buttons rather than links, and that is not a detail: NavPills renders
 * anchors, which is right for navigation and wrong here. A tab that changes
 * what is rendered on the page you are already on is not a destination, and an
 * `<a href="#client">` that never navigates tells a screen reader something
 * untrue. Roving `tabindex` and arrow keys come free with the tablist role.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  label,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Must be unique per page — two controls sharing one would swap highlights. */
  layoutId: string;
  label: string;
  className?: string;
}) {
  const move = (direction: 1 | -1) => {
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + direction + options.length) % options.length];
    onChange(next.value);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('inline-flex items-center gap-1', className)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          move(1);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            // Only the selected tab is in the tab order; the others are reached
            // with the arrow keys, which is what a tablist is expected to do.
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-pill px-5 py-2.5 text-lg transition-colors duration-fast ease-out',
              active ? 'text-ink-inverse' : 'text-ink-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-pill bg-bg-dark"
                transition={{ duration: duration('slow'), ease: ease('out') }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
