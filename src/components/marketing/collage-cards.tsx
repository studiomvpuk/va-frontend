import type { CollageCard } from './collage';

/**
 * The collage's contents.
 *
 * Rendered UI rather than screenshot images, and that is a considered trade.
 * Screenshots would be quicker to produce and would go stale the first time a
 * label changes; these are built from the same tokens as the real screens, so
 * they cannot drift from the palette, they are sharp at any density, they carry
 * no image weight on a page with a Lighthouse target, and the text in them is
 * selectable and readable by a screen reader.
 *
 * The spans are deliberately unequal — see the note in collage.tsx. The VA chat
 * is the largest because it is the screen that makes the product make sense.
 */
export const COLLAGE_CARDS: CollageCard[] = [
  {
    id: 'verdict',
    title: 'Is this one worth applying to?',
    caption: 'Fit score',
    span: 'md:col-span-4',
    drift: 28,
    children: (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-ink">Operations Lead</p>
            <p className="truncate text-base text-ink-muted">Sky Capital Partners</p>
          </div>
          <span className="shrink-0 rounded-pill bg-positive-subtle px-4 py-1.5 font-display text-lg font-semibold text-positive">
            7.4
          </span>
        </div>

        <p className="text-base leading-normal text-ink-muted">
          Matches four of your five stated criteria. Below your usual seniority,
          but the scope is wider than the title suggests.
        </p>

        <p className="text-sm text-ink-muted">
          Scored against what <span className="text-ink">you</span> said you
          want — not against whether it looks like a good job.
        </p>
      </div>
    ),
  },
  {
    id: 'sensitivity',
    title: 'What is protected',
    caption: 'Profile',
    span: 'md:col-span-2',
    drift: -34,
    children: (
      <ul className="flex flex-col gap-3">
        <Row label="Full name" tone="general" />
        <Row label="Home address" tone="sensitive" />
        <Row label="Date of birth" tone="sensitive" />
        <Row label="Notice period" tone="general" />
      </ul>
    ),
  },
  {
    id: 'gap',
    title: 'When it does not know',
    caption: 'Queue',
    span: 'md:col-span-3',
    drift: 18,
    children: (
      <div className="flex flex-col gap-3">
        <p className="text-base font-medium text-ink">
          “Do you hold a full UK driving licence?”
        </p>
        <p className="text-sm text-ink-muted">
          Your profile did not cover this. Nothing was guessed — this
          application is paused until you answer.
        </p>
        <span className="inline-flex w-fit items-center rounded-pill bg-accent-subtle px-3 py-1 text-sm text-accent-text">
          Waiting on you
        </span>
      </div>
    ),
  },
  {
    id: 'log',
    title: 'Every disclosure, logged',
    caption: 'Access log',
    span: 'md:col-span-3',
    drift: -22,
    children: (
      <ul className="flex flex-col gap-3 font-mono text-sm text-ink-muted">
        <li>09:14 · address released · Sky Capital</li>
        <li>09:12 · password shown · linkedin.com</li>
        <li>08:57 · agreement signed · J. Emoredo</li>
      </ul>
    ),
  },
];

function Row({ label, tone }: { label: string; tone: 'general' | 'sensitive' }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-base text-ink">{label}</span>
      <span
        className={[
          'shrink-0 rounded-pill px-3 py-1 text-sm',
          tone === 'sensitive'
            ? 'bg-accent-subtle text-accent-text'
            : 'bg-neutral-subtle text-neutral',
        ].join(' ')}
      >
        {tone === 'sensitive' ? 'Sensitive' : 'General'}
      </span>
    </li>
  );
}
