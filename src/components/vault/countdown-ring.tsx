'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '../motion/use-reduced-motion';

/**
 * Traces the auto-hide window for a revealed password.
 *
 * An SVG stroke-dashoffset rather than a CSS animation, because the ring has to
 * stay truthful: it is driven by the real `expiresAt` from the server, so a
 * backgrounded tab or a slow render cannot leave it showing time that has
 * already gone.
 *
 * Under reduced motion the ring stops sweeping and the seconds count down as
 * text — the information survives, the movement does not.
 */
export function CountdownRing({
  expiresAt,
  onExpire,
  size = 36,
  className,
}: {
  expiresAt: Date;
  onExpire: () => void;
  size?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [remaining, setRemaining] = useState(() => msLeft(expiresAt));
  const fired = useRef(false);
  const total = useRef(msLeft(expiresAt));

  useEffect(() => {
    fired.current = false;
    total.current = Math.max(msLeft(expiresAt), 1);

    const tick = () => {
      const left = msLeft(expiresAt);
      setRemaining(left);
      if (left <= 0 && !fired.current) {
        fired.current = true;
        onExpire();
      }
    };

    // 250ms keeps the sweep smooth enough without a frame loop for a value
    // that only needs second-level accuracy.
    const id = setInterval(tick, reduced ? 1000 : 250);
    tick();
    return () => clearInterval(id);
  }, [expiresAt, onExpire, reduced]);

  const seconds = Math.max(0, Math.ceil(remaining / 1000));
  const fraction = Math.max(0, Math.min(1, remaining / total.current));
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn('relative grid place-items-center', className)}
      role="timer"
      aria-live="off"
      aria-label={`Hidden again in ${seconds} seconds`}
    >
      {!reduced && (
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="2"
            className="stroke-line"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
            className="stroke-accent"
          />
        </svg>
      )}
      <span
        className={cn(
          'text-xs font-medium tabular-nums text-ink-muted',
          !reduced && 'absolute',
        )}
      >
        {seconds}
      </span>
    </div>
  );
}

function msLeft(expiresAt: Date): number {
  return expiresAt.getTime() - Date.now();
}
