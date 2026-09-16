'use client';

import { motion } from 'motion/react';
import { duration, ease, stagger } from '@/components/motion/tokens';

/**
 * The product, in the hero.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * The hero used to be a headline, a paragraph, and half a viewport of empty
 * space. You had to read three sentences and scroll before anything showed you
 * what the thing actually does — which is the difference between a page that
 * explains a product and a page that demonstrates one.
 *
 * The reference site puts its actual prompt box in the hero for the same
 * reason. The equivalent here is this exchange: an assistant asks, an answer
 * comes back for that question only, and the one that touched something
 * personal is marked and logged. That is the entire product in four lines, and
 * it is graspable before anybody reads a word of the copy beside it.
 *
 * ── Why it is not a screenshot ──────────────────────────────────────────────
 * Built from the same tokens as the real chat, so it cannot drift from the
 * palette, it is sharp at any density, it costs no image weight on a page with
 * a Lighthouse target, and a screen reader can read it. It is labelled as an
 * illustration so nobody is misled into thinking it is live.
 */
const LINES: {
  from: 'assistant' | 'ai';
  body: string;
  flagged?: boolean;
}[] = [
  { from: 'assistant', body: 'The form asks for a current notice period.' },
  { from: 'ai', body: 'One month.' },
  { from: 'assistant', body: 'And it wants a home address.' },
  {
    from: 'ai',
    body: '14 Wilmslow Road, Manchester M14 5TQ — released for this application only.',
    flagged: true,
  },
];

export function HeroExchange() {
  const step = stagger();

  return (
    <figure
      className="relative w-full max-w-[460px] rounded-xl border border-line bg-surface shadow-md"
      // The whole thing is one illustration. Without this a screen reader reads
      // a stray conversation with no explanation of whose it is.
      aria-label="An example exchange: the assistant asks two questions and gets an answer to each. The second answer contains a personal detail, so it is marked as released and logged."
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <span className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-indigo" />
          <span className="text-sm font-medium text-ink">Your assistant’s chat</span>
        </span>
        <span className="text-xs uppercase tracking-label text-ink-muted">Live</span>
      </header>

      <div aria-hidden="true" className="flex flex-col gap-3 p-5">
        {LINES.map((line, i) => (
          <motion.p
            key={line.body}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              // After the headline has finished arriving, so the two do not
              // compete for the same half-second.
              delay: 0.5 + i * step * 4,
              duration: duration('base'),
              ease: ease('out'),
            }}
            className={[
              'max-w-[86%] rounded-lg px-4 py-2.5 text-base leading-normal',
              line.from === 'assistant'
                ? 'self-end bg-surface-sunken text-ink'
                : line.flagged
                  ? 'self-start bg-accent-subtle text-accent-text'
                  : 'self-start border border-line text-ink',
            ].join(' ')}
          >
            {line.body}
          </motion.p>
        ))}
      </div>

      {/*
        The log line is the other half of the promise, and putting it in the
        same frame is the point: the disclosure above and the record of it are
        not two features, they are one thing.
      */}
      <motion.footer
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + LINES.length * step * 4, duration: duration('base') }}
        className="flex items-center gap-3 border-t border-line bg-surface-sunken px-5 py-3.5"
      >
        <span className="text-xs uppercase tracking-label text-ink-muted">Your log</span>
        <span className="truncate font-mono text-sm text-ink-muted">
          09:14 · address released · Sky Capital
        </span>
      </motion.footer>
    </figure>
  );
}
