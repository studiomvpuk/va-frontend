'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks the OS reduced-motion setting, and keeps tracking it — a user who
 * changes the setting while the app is open gets the new behaviour without a
 * reload.
 *
 * Most components will not need this: the token indirection in tokens.ts
 * already collapses every duration to ~0 under reduced motion. Reach for this
 * only when an animation needs to be structurally different rather than merely
 * faster — a count-up that should jump straight to its final value, or a
 * parallax that should not bind a scroll listener at all.
 */
export function useReducedMotion(): boolean {
  // Assume reduced motion until proven otherwise. Getting this backwards on the
  // first frame means a user who asked for no motion sees one anyway.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
