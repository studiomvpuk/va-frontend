import Link from 'next/link';

/**
 * The 404.
 *
 * ── Why it is worth writing one ─────────────────────────────────────────────
 * Next's default is unstyled, says "404 | This page could not be found", and
 * belongs to the framework rather than to this product. It is also a page real
 * people reach here for a specific reason: the prep-document route deliberately
 * returns 404 rather than 403 to an assistant, so that a VA cannot learn which
 * of their Client's applications reached interview. That concealment only works
 * if the 404 they land on is ordinary.
 *
 * So this says nothing about why. No "you may not have permission", no "this
 * resource exists but is not yours" — either would give away exactly what the
 * 404 is there to hide.
 *
 * It renders in the light register because the routes most likely to 404 are
 * inside the workspace.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-prose flex-col justify-center gap-8 px-4 py-16">
      <Link href="/" className="flex items-center gap-3 self-start">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-pill bg-accent" />
        <span className="font-display text-lg font-bold text-ink">
          Job Application Assistant
        </span>
      </Link>

      <div>
        <p className="font-mono text-sm text-ink-muted">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-ink">
          There is nothing at this address.
        </h1>
        <p className="mt-4 max-w-prose text-base leading-normal text-ink-muted">
          The link may be out of date, or the address may have a typo in it.
        </p>
      </div>

      <nav aria-label="Where to go instead" className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-ink-on-accent transition-colors duration-fast ease-out hover:bg-accent-hover active:bg-accent-active"
        >
          Your dashboard
        </Link>
        <Link
          href="/"
          className="rounded-md border border-line px-6 py-3 text-base text-ink transition-colors duration-fast ease-out hover:border-line-strong"
        >
          Home
        </Link>
        <Link
          href="/how-to-use"
          className="rounded-md px-6 py-3 text-base text-ink-muted transition-colors duration-fast ease-out hover:text-ink"
        >
          How to use this
        </Link>
      </nav>
    </main>
  );
}
