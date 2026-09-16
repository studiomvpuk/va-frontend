import Link from 'next/link';

/**
 * The How to Use link, in the header of every authenticated screen.
 *
 * One component rather than a line of JSX repeated per shell, because the PRD
 * acceptance is "reachable from every authenticated screen in both roles" — a
 * repeated line is a line somebody forgets on the next screen, and there is a
 * test that counts these.
 */
export function HelpLink({ className }: { className?: string }) {
  return (
    <Link
      href="/how-to-use"
      className={className}
      aria-label="How to use this"
      title="How to use this"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-lg text-ink-muted transition-colors duration-fast ease-out hover:border-line-strong hover:text-ink"
      >
        ?
      </span>
    </Link>
  );
}
