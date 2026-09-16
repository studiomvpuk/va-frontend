'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CollageCard {
  id: string;
  title: string;
  caption: string;
  /** Tailwind grid span. Non-uniform on purpose — see the note below. */
  span: string;
  /** How far this card drifts against the scroll, in pixels. */
  drift: number;
  children?: ReactNode;
}

/**
 * The asymmetric screenshot collage.
 *
 * ── Non-uniform sizes are the point ─────────────────────────────────────────
 * A tidy 3×2 grid of equal cards says "feature list". Deliberately unequal
 * cards give the eye an order to read them in, which lets the largest card
 * carry the screen that matters — the VA chat — and the smaller ones sit as
 * supporting detail rather than competing for equal attention.
 *
 * ── Parallax, and when it is switched off ───────────────────────────────────
 * Each card drifts a different distance against the scroll, which is what makes
 * the group read as depth rather than as one moving block. It is disabled
 * entirely below 768px — on a phone the viewport is short enough that any
 * vertical drift fights the scroll the reader is actually doing — and under
 * `prefers-reduced-motion`, where parallax is among the worst offenders for
 * anyone susceptible to motion sickness.
 */
export function Collage({ cards }: { cards: CollageCard[] }) {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start'],
  });

  const active = wide && !reduced;

  return (
    <div
      ref={container}
      className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-6"
    >
      {cards.map((card) => (
        <CollageTile
          key={card.id}
          card={card}
          progress={scrollYProgress}
          active={active}
        />
      ))}
    </div>
  );
}

function CollageTile({
  card,
  progress,
  active,
}: {
  card: CollageCard;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  active: boolean;
}) {
  // The hook runs unconditionally — hooks cannot be conditional — and `active`
  // decides whether its output is used. Cheaper and far less fragile than
  // rendering two different component trees.
  const y = useTransform(progress, [0, 1], [card.drift, -card.drift]);

  return (
    <motion.figure
      style={active ? { y } : undefined}
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-surface',
        card.span,
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <figcaption className="text-sm font-medium text-ink">{card.title}</figcaption>
        <span className="text-xs uppercase tracking-label text-ink-muted">
          {card.caption}
        </span>
      </div>
      <div className="p-5">{card.children}</div>
    </motion.figure>
  );
}
