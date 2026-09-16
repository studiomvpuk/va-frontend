import Link from 'next/link';

/**
 * One header across every public page.
 *
 * Previously the landing page carried its own, and nothing else had one — so
 * any other public page would have been a wall of text with no way back and no
 * way in. A shared component is also the only way five pages stay identical
 * through a design change.
 *
 * "Sign in" points at /login, which is where signing in happens. It pointed at
 * /signup, which is a different thing and a rude thing to do to a returning
 * customer.
 */
const LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-to-use', label: 'How it works' },
  { href: '/for-assistants', label: 'For assistants' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-marketing items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-pill bg-accent" />
          {/*
            Two spellings, because the full name plus "Sign in" overflows a
            390px viewport and clips the only way back into an account. The
            short one is not an abbreviation of convenience — below this width
            the wordmark is competing with the thing people came to tap.
          */}
          <span className="truncate font-display text-base font-semibold sm:hidden">
            Job Assistant
          </span>
          <span className="hidden truncate font-display text-lg font-semibold sm:inline">
            Job Application Assistant
          </span>
        </Link>

        {/* Hidden on phones rather than collapsed into a burger: three links
            and two actions do not need a drawer, and the footer carries the
            same set for anyone who scrolls. */}
        <nav aria-label="Site" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-pill px-4 py-2 text-base text-ink-muted transition-colors duration-fast ease-out hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-base text-ink-muted transition-colors duration-fast ease-out hover:text-ink sm:px-4"
          >
            Sign in
          </Link>
          {/*
            Near-black, not orange — which is what the reference does, and the
            reason is worth keeping: if the CTA is the only orange thing on the
            page, orange stops meaning "act here" and starts meaning "button".
            The colour belongs to the sections; the button belongs to the ink.
          */}
          <Link
            href="/signup"
            className="hidden rounded-md bg-ink px-5 py-2.5 text-base font-semibold text-ink-inverse transition-opacity duration-fast ease-out hover:opacity-90 sm:inline-block"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
