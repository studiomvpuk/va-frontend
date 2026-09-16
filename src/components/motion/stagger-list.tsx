'use client';

import { motion } from 'motion/react';
import { Children, type ReactNode } from 'react';
import { duration, ease, stagger } from './tokens';

/**
 * Staggered entry for card lists and table rows.
 *
 * Capped at MAX_STAGGERED children on purpose. A 30-row applications tracker
 * staggered at 40ms would take 1.2 seconds to finish drawing, which stops
 * reading as polish and starts reading as a slow app. Beyond the cap everything
 * animates together on the last slot's delay.
 */
const MAX_STAGGERED = 8;

export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const items = Children.toArray(children);
  const step = stagger();

  return (
    <motion.div className={className} initial="hidden" animate="visible">
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: Math.min(i, MAX_STAGGERED) * step,
                duration: duration('base'),
                ease: ease('out'),
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
