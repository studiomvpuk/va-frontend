'use client';

import { useEffect, useRef, useState } from 'react';
import { duration as durationToken } from './tokens';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Animates a number from 0 to its value.
 *
 * Used by the dashboard stat tiles and the fit-score badge. Under reduced
 * motion it renders the final value immediately — this is the case where
 * "faster" is not good enough, because a number visibly ticking is movement
 * whatever its duration.
 */
export function CountUp({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const frame = useRef<number>(undefined);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }

    const total = durationToken('count') * 1000;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1);
      // Matches --ease-out's shape closely enough at this size, without
      // pulling a bezier solver in for one number.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [value, reduced]);

  return (
    // The animating text is hidden from assistive tech; the real value is
    // announced once, rather than read out sixty times a second.
    <span className={className}>
      <span aria-hidden="true">{display.toFixed(decimals)}</span>
      <span className="sr-only">{value.toFixed(decimals)}</span>
    </span>
  );
}
