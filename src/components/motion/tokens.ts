/**
 * Motion values, read from the CSS custom properties at runtime.
 *
 * Framer Motion needs numbers and easing arrays, not CSS strings, so this is
 * the bridge. Reading from the DOM rather than duplicating the numbers here is
 * what makes the `prefers-reduced-motion` block in design-tokens.css genuinely
 * disable motion: when that media query collapses every duration to 1ms, these
 * helpers return 0.001 and every animation in the app becomes instant. One
 * source of truth, no second list to keep in sync.
 */

type DurationToken = 'instant' | 'fast' | 'base' | 'slow' | 'count';
type EaseToken = 'out' | 'in-out' | 'spring';

/** Fallbacks for SSR and for Storybook's docs renderer, where there is no computed style. */
const FALLBACK_DURATION: Record<DurationToken, number> = {
  instant: 0.09,
  fast: 0.16,
  base: 0.24,
  slow: 0.38,
  count: 0.6,
};

const FALLBACK_EASE: Record<EaseToken, [number, number, number, number]> = {
  out: [0.22, 1, 0.36, 1],
  'in-out': [0.65, 0, 0.35, 1],
  spring: [0.34, 1.4, 0.64, 1],
};

function readVar(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value.trim() || null;
}

/** Duration in seconds, as Framer Motion expects. */
export function duration(token: DurationToken): number {
  const raw = readVar(`--duration-${token}`);
  if (!raw) return FALLBACK_DURATION[token];
  if (raw.endsWith('ms')) return parseFloat(raw) / 1000;
  if (raw.endsWith('s')) return parseFloat(raw);
  return FALLBACK_DURATION[token];
}

/** Cubic-bezier control points, parsed from the token. */
export function ease(token: EaseToken): [number, number, number, number] | 'linear' {
  const raw = readVar(`--ease-${token}`);
  if (!raw) return FALLBACK_EASE[token];
  if (raw === 'linear') return 'linear';
  const match = raw.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return FALLBACK_EASE[token];
  const points = match[1].split(',').map((n) => parseFloat(n.trim()));
  return points.length === 4
    ? (points as [number, number, number, number])
    : FALLBACK_EASE[token];
}

/** Stagger delay in seconds. */
export function stagger(): number {
  const raw = readVar('--stagger-child');
  if (!raw) return 0.04;
  return raw.endsWith('ms') ? parseFloat(raw) / 1000 : parseFloat(raw);
}

/** The standard entry transition: quick, decisive, slightly overshooting. */
export const entry = () => ({ duration: duration('base'), ease: ease('out') });
