import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_ROUTES, ROUTES } from './routes';

/**
 * Every link goes somewhere, and everywhere can be reached.
 *
 * ── What went wrong without this ────────────────────────────────────────────
 * `/login` was linked from the sign-up page from Phase 1 onward and never
 * existed — nine phases of a 404 on the second-most-likely click in the
 * product. `auth.vaLogin` shipped in Phase 5 with no page calling it, so an
 * invited assistant had no way back in on any later day. The sitemap listed two
 * pages while the public site had five.
 *
 * All three are the same bug: two lists that should agree, with nothing
 * checking. This is the check.
 */
const APP_DIR = join(__dirname, '../app');

/** Route groups — (app), (marketing) — are organisational and not in the URL. */
function routePathOf(file: string): string {
  const relative = file.slice(APP_DIR.length).replace(/\/page\.tsx$/, '');
  const path = relative
    .split('/')
    .filter((segment) => segment && !segment.startsWith('('))
    .join('/');
  return path ? `/${path}` : '/';
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry === 'page.tsx') out.push(full);
  }
  return out;
}

const pageFiles = walk(APP_DIR);
const actualRoutes = pageFiles.map(routePathOf);

/** Routes with a [param] segment cannot be matched against a static list. */
const staticRoutes = actualRoutes.filter((path) => !path.includes('['));

function walkSources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkSources(full, out);
    else if (/\.tsx?$/.test(entry) && !/\.spec\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * Internal links, however they are written.
 *
 * Three forms, and the third is why the first version of this was wrong: the
 * site header, the footer and the app nav all declare their links as data
 * (`{ href: '/pricing', label: 'Pricing' }`) and render them in a loop. A
 * scanner that only understood `href="..."` reported every page in the footer
 * as unreachable, and the honest fix was to teach it the pattern rather than to
 * add four exemptions.
 */
function internalLinks(): { file: string; href: string }[] {
  const found: { file: string; href: string }[] = [];
  const root = join(__dirname, '..');

  const PATTERNS = [
    // href="/x"
    /href=["'](\/[^"']*)["']/g,
    // href={`/applications/${id}/prep`} — the literal prefix is what we check
    /href=\{`(\/[^`$]*)\$\{/g,
    // { href: '/x', label: 'X' } — nav and footer data
    /\bhref:\s*["'](\/[^"']*)["']/g,
    // router.push('/x') / router.replace('/x')
    /router\.(?:push|replace)\(["'](\/[^"']*)["']\)/g,
    // signInPath="/login" on the route guard
    /signInPath=["'](\/[^"']*)["']/g,
    // fallbackPath="/dashboard" on the sign-in form
    /fallbackPath=["'](\/[^"']*)["']/g,
  ];

  for (const file of walkSources(root)) {
    const source = readFileSync(file, 'utf8');
    for (const pattern of PATTERNS) {
      for (const [, href] of source.matchAll(pattern)) {
        found.push({ file: file.slice(root.length + 1), href });
      }
    }
  }
  return found;
}

describe('the route table matches the filesystem', () => {
  it('finds the pages', () => {
    expect(pageFiles.length).toBeGreaterThan(10);
  });

  it('every declared route has a page', () => {
    const missing = ROUTES.map((r) => r.path).filter((path) => !staticRoutes.includes(path));
    // Each of these needs a page.tsx, or removing from lib/routes.ts.
    expect({ declaredButMissing: missing }).toEqual({ declaredButMissing: [] });
  });

  it('every page is declared', () => {
    const declared = new Set(ROUTES.map((r) => r.path));
    const undeclared = staticRoutes.filter((path) => !declared.has(path));
    // A page nobody declared is a page the sitemap and robots.txt cannot see.
    expect({ builtButUndeclared: undeclared }).toEqual({ builtButUndeclared: [] });
  });
});

describe('every internal link resolves', () => {
  const links = internalLinks();

  it('finds links to check', () => {
    expect(links.length).toBeGreaterThan(15);
  });

  it('points at a route that exists', () => {
    const broken = links
      .filter(({ href }) => {
        const path = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
        if (staticRoutes.includes(path)) return false;
        // A dynamic prefix: /applications/ matches /applications/[id]/prep.
        return !actualRoutes.some(
          (route) => route.includes('[') && route.startsWith(path.replace(/\/$/, '')),
        );
      })
      .map(({ file, href }) => `${href}  (linked from ${file})`);

    expect({ brokenLinks: broken }).toEqual({ brokenLinks: [] });
  });
});

describe('every route is reachable', () => {
  const linked = new Set(internalLinks().map(({ href }) => href.split(/[?#]/)[0]));

  /**
   * Routes nothing links to, for a reason.
   *
   * Each entry is a claim that the route is reached some other way, and the
   * reason is written down so the list cannot quietly become a dumping ground
   * for pages that fell out of the navigation.
   */
  const REACHED_ANOTHER_WAY: Record<string, string> = {
    '/agreement': 'reached by accepting an invitation; a VA who has not signed cannot get past it',
  };

  it.each(ROUTES.filter((r) => !r.path.includes('[')))('$path', ({ path }) => {
    if (linked.has(path)) return;
    // Not linked — so it must be in the list above, with a reason.
    expect(REACHED_ANOTHER_WAY[path] ?? '').not.toBe('');
  });
});

describe('the public site', () => {
  it('has every public route in the sitemap list', () => {
    // PUBLIC_ROUTES is what sitemap.ts maps over, so this is the sitemap.
    expect(PUBLIC_ROUTES.map((r) => r.path)).toEqual([
      '/',
      '/pricing',
      '/how-to-use',
      '/for-assistants',
      '/privacy',
      '/terms',
    ]);
  });

  it('keeps credential forms out of the index', () => {
    // A login form outranking the page that explains the product is a worse
    // outcome for everyone, including the search engine.
    for (const path of ['/login', '/signup', '/va/login']) {
      expect(ROUTES.find((r) => r.path === path)?.visibility).toBe('signed-out');
    }
  });

  it('marks nothing behind a login as public', () => {
    const leaked = PUBLIC_ROUTES.filter((r) =>
      ['/dashboard', '/profile', '/sites', '/settings', '/assistants', '/chat'].includes(r.path),
    );
    expect(leaked).toEqual([]);
  });
});
