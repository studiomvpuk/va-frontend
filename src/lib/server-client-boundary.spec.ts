import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The server/client boundary, enforced.
 *
 * ── What this exists to stop ────────────────────────────────────────────────
 * `login/page.tsx` was a Server Component that did:
 *
 *     <SignInForm authenticate={auth.login} … />
 *
 * A function cannot be serialized across the server/client boundary in the App
 * Router, so `authenticate` arrived on the client as something that was not
 * callable. Every sign-in threw a TypeError before reaching the network, and
 * the form's catch reported "Could not reach the server" — so it looked like a
 * CORS problem, then a deploy problem, then a port problem, for an afternoon.
 *
 * The rule below is narrow and mechanical: a Server Component has no business
 * importing the browser API client at all. `lib/api.ts` is `'use client'`, it
 * holds the access token in a module variable, and every function on it is
 * meant to run in a browser. If a page needs one, that page is a Client
 * Component — or it passes a string and lets the client component choose.
 *
 * Type-only imports are fine: types vanish at compile time and cannot be called.
 */

const APP = join(__dirname, '..', 'app');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry) && !/\.spec\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const isClientComponent = (source: string) =>
  /^\s*(['"])use client\1/.test(source.split('\n').slice(0, 3).join('\n'));

describe('the server/client boundary', () => {
  const files = walk(APP).map((f) => ({
    path: relative(join(__dirname, '..'), f).replace(/\\/g, '/'),
    source: readFileSync(f, 'utf8'),
  }));

  it('finds the app directory (guards against a vacuous pass)', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('no Server Component imports the browser API client for its values', () => {
    const offenders = files
      .filter((f) => !isClientComponent(f.source))
      .filter((f) => {
        const imports = f.source.match(/^import[^;]+from '@\/lib\/api';/gm) ?? [];
        // `import type { X }` and `import { type X }` are erased at compile
        // time — they cannot be passed anywhere, so they are safe.
        return imports.some(
          (line) => !/^import type/.test(line) && /\{\s*(?!type\s)[A-Za-z]/.test(line),
        );
      })
      .map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it('no Server Component passes a bare function reference as a JSX prop', () => {
    // `prop={something.method}` with no call and no arrow — the exact shape that
    // silently fails to cross the boundary.
    const offenders: string[] = [];
    for (const f of files) {
      if (isClientComponent(f.source)) continue;
      for (const m of f.source.matchAll(/(\w+)=\{([A-Za-z_$][\w$]*\.[\w$]+)\}/g)) {
        // Allow things that are obviously data, not behaviour.
        if (/^(className|style|key|id|href|src)$/.test(m[1])) continue;
        offenders.push(`${f.path}: ${m[1]}={${m[2]}}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
