import type { TalkingPointBasis } from '@/lib/api';

/**
 * Where a talking point came from, said out loud.
 *
 * Shown rather than kept internal on purpose. The Client is about to repeat
 * these sentences to an interviewer, and "this came from your experience
 * narrative" is what lets them check it before they do. A point with no visible
 * provenance asks them to trust the model, which is exactly the thing this
 * product does not ask of anyone.
 */
export function BasisLabel({ basis }: { basis: TalkingPointBasis }) {
  if (basis.kind === 'narrative') {
    return <Chip>from your experience</Chip>;
  }

  if (basis.kind === 'profile_field') {
    return <Chip>from your profile · {basis.key.replace(/_/g, ' ')}</Chip>;
  }

  return (
    <a
      href={basis.url}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center rounded-pill bg-neutral-subtle px-3 py-1 text-sm text-neutral underline decoration-line underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
    >
      {hostOf(basis.url)}
    </a>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-neutral-subtle px-3 py-1 text-sm text-neutral">
      {children}
    </span>
  );
}

/** example.com, not the full URL — the chip is a label, not a citation. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
