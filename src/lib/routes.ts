/**
 * Every route in the product, in one place.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 * The routing had drifted: /login was linked from sign-up and did not exist,
 * the VA login page was never built so `auth.vaLogin` was unreachable, and the
 * sitemap listed two pages while the public site had five. Each of those is the
 * same failure — two lists that should agree and nothing checking that they do.
 *
 * So the lists are one list. robots.ts and sitemap.ts are generated from it, and
 * a test asserts that every route here has a page file and every internal link
 * points at a route here.
 */

export interface RouteDefinition {
  path: string;
  /** Public pages are indexed and appear in the sitemap. */
  visibility: 'public' | 'signed-out' | 'client' | 'va';
  /** Sitemap priority. Public pages only. */
  priority?: number;
}

export const ROUTES: RouteDefinition[] = [
  // The public site.
  { path: '/', visibility: 'public', priority: 1 },
  { path: '/pricing', visibility: 'public', priority: 0.9 },
  { path: '/how-to-use', visibility: 'public', priority: 0.8 },
  { path: '/for-assistants', visibility: 'public', priority: 0.7 },
  { path: '/privacy', visibility: 'public', priority: 0.3 },
  { path: '/terms', visibility: 'public', priority: 0.3 },

  // Reachable signed out, but nothing anyone should find in a search result —
  // a credential form ranking above the page that explains the product is a
  // worse outcome for everybody.
  { path: '/signup', visibility: 'signed-out' },
  { path: '/login', visibility: 'signed-out' },
  { path: '/va/login', visibility: 'signed-out' },
  /*
   * Reached only from an invitation link, never linked from the site. Listed
   * anyway: this route was missing entirely for a while, and every invitation
   * anyone sent led to a 404, because the link is assembled at runtime from
   * `${origin}/accept-invite?token=…` rather than written as an href — so
   * nothing here or in the tests could see it.
   */
  { path: '/accept-invite', visibility: 'signed-out' },

  // The Client workspace.
  { path: '/dashboard', visibility: 'client' },
  { path: '/applications', visibility: 'client' },
  { path: '/profile', visibility: 'client' },
  { path: '/sites', visibility: 'client' },
  { path: '/assistants', visibility: 'client' },
  { path: '/settings', visibility: 'client' },

  // The assistant's side.
  { path: '/agreement', visibility: 'va' },
  { path: '/chat', visibility: 'va' },
];

export const PUBLIC_ROUTES = ROUTES.filter((r) => r.visibility === 'public');

/** Everything behind a login, for robots.ts to disallow. */
export const PRIVATE_PREFIXES = [
  ...ROUTES.filter((r) => r.visibility !== 'public').map((r) => r.path),
  // Not a route of its own — a dynamic child. Listed because it must not be
  // crawled, and because it is deliberately a 404 to the wrong role.
  '/applications/',
];
