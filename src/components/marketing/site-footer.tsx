import Link from 'next/link';

/**
 * The footer, and the only place every public route is listed.
 *
 * It doubles as the navigation on phones, where the header's links are hidden —
 * which is why it carries the full set rather than the usual three.
 */
const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { href: '/', label: 'Overview' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/how-to-use', label: 'How it works' },
    ],
  },
  {
    heading: 'People',
    links: [
      { href: '/for-assistants', label: 'For assistants' },
      { href: '/signup', label: 'Create an account' },
      { href: '/login', label: 'Sign in' },
      { href: '/va/login', label: 'Assistant sign in' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer data-panel="muted" className="border-t border-line bg-bg text-ink">
      <div className="mx-auto max-w-marketing px-4 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="label-section">{column.heading}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base text-ink-muted transition-colors duration-fast ease-out hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-sm text-ink-muted">
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-accent" />
            Job Application Assistant
          </span>
          <span>Manchester, UK</span>
        </div>
      </div>
    </footer>
  );
}
