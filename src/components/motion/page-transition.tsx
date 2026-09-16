import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Route-level entry: fade in and rise 8px.
 *
 * Deliberately not a slide-across. At this scale a horizontal transition reads
 * as cheap, and it fights the shared-element nav pill, which is the movement
 * the eye should actually be following.
 *
 * ── Why this is CSS and not Framer Motion ───────────────────────────────────
 * It used to be a `motion.div` with `initial={{ opacity: 0 }}`, which React
 * server-renders as a literal `style="opacity:0"`. Every page in the product
 * therefore arrived blank and stayed blank until the JavaScript bundle
 * hydrated — and stayed blank permanently if it never did. Lighthouse reported
 * NO_FCP on /how-to-use: the page had painted no content at all.
 *
 * A CSS animation cannot have that failure. The element's own state is the
 * finished one, the keyframes play the entry, and if the animation never runs
 * — no JS, an old browser, an extension — the content is simply there. It also
 * takes Framer off the critical path of every route, which is a smaller win in
 * the same direction.
 *
 * Not a client component either, so it adds nothing to the bundle.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('animate-page-enter', className)}>{children}</div>;
}
