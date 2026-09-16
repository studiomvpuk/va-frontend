'use client';

import { motion } from 'motion/react';
import { duration, ease, stagger } from '@/components/motion/tokens';

/**
 * The headline, arriving a word at a time.
 *
 * ── Why words and not characters ────────────────────────────────────────────
 * Character-staggered headlines are the fashionable version and they are worse
 * here: at hero size a per-character stagger takes most of a second to resolve
 * into something readable, and the first thing a visitor does on this page is
 * read the headline. Words land as units, so the sentence is legible from the
 * first frame and only the tail is still moving.
 *
 * ── It is one <h1> to a screen reader ───────────────────────────────────────
 * The words are spans inside a single heading with the full text in
 * `aria-label`, so assistive tech gets the sentence rather than eight fragments.
 * The visible spans are hidden from it.
 */
export function HeroHeadline({
  text,
  accentFrom,
  className,
}: {
  text: string;
  /** Word index from which the accent colour starts. */
  accentFrom?: number;
  className?: string;
}) {
  const words = text.split(' ');
  const step = stagger();

  return (
    <h1 aria-label={text} className={className}>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className={
                accentFrom !== undefined && i >= accentFrom
                  // text-accent-strong, not text-accent: raw #FF6A00 on the
                  // page is 2.71:1 and unreadable at any size. Orange is a
                  // field colour here; this is its text-safe sibling.
                  ? 'inline-block text-accent-strong'
                  : 'inline-block'
              }
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{
                // Rises from behind its own clipping box rather than fading.
                // At this size a fade reads as a page that has not finished
                // loading; a rise reads as deliberate.
                delay: i * step * 2,
                duration: duration('slow'),
                ease: ease('out'),
              }}
            >
              {word}
              {i < words.length - 1 && ' '}
            </motion.span>
          </span>
        ))}
      </span>
    </h1>
  );
}
