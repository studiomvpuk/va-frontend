'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { duration, ease } from '../motion/tokens';

export interface NavItem {
  key: string;
  label: string;
  href: string;
}

/**
 * The app's signature move.
 *
 * The active pill is a single shared element (`layoutId`) that physically
 * travels between nav items rather than fading out here and in there. It is the
 * one piece of motion in the product that people will notice, so it gets the
 * slow duration and nothing competes with it during the transition.
 */
export function NavPills({
  items,
  activeKey,
  onSelect,
  className,
  layoutId = 'nav-pill',
}: {
  items: NavItem[];
  activeKey: string;
  onSelect?: (item: NavItem) => void;
  className?: string;
  layoutId?: string;
}) {
  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Primary">
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <a
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            onClick={onSelect ? () => onSelect(item) : undefined}
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
            <span className="relative z-10">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
