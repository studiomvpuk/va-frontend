import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRODUCT } from './site';

/**
 * The product name lives in `site.ts` and nowhere else.
 *
 * Before this test it was a literal in nine files, and they had already drifted:
 * the header showed one spelling on phones and another on desktop, and neither
 * matched the 404. A name is exactly the kind of string that gets copied rather
 * than imported, so the rule needs enforcing rather than remembering.
 *
 * This is also what makes a rename cheap enough to actually do. If the name
 * changes again, one constant changes and this test proves nothing was missed.
 */

const SRC = join(__dirname, '..');

/** Comments discuss the name legitimately; only rendered strings are the problem. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry) && !/\.spec\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

describe('the product name', () => {
  const files = walk(SRC)
    .map((f) => ({ path: relative(SRC, f).replace(/\\/g, '/'), source: readFileSync(f, 'utf8') }))
    .filter((f) => f.path !== 'lib/site.ts');

  it('is not hard-coded anywhere outside site.ts', () => {
    const offenders = files
      .filter((f) => code(f.source).includes(PRODUCT.name))
      .map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it('leaves no trace of the previous name', () => {
    // Renames are usually 95% done. The remaining 5% is a footer nobody scrolls
    // to and an OG image nobody looks at until it is shared.
    const offenders = files
      .filter((f) => /Job Application Assistant|Job Assistant/i.test(f.source))
      .map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it('is one word, because the header layout depends on it', () => {
    // The header used to carry two spellings — a short one for phones, because
    // the long name plus "Sign in" overflowed 390px and clipped the only way
    // back into an account. That workaround is gone. If the name grows, the
    // workaround has to come back, so fail here rather than in a screenshot.
    expect(PRODUCT.name.trim().split(/\s+/)).toHaveLength(1);
    expect(PRODUCT.name.length).toBeLessThanOrEqual(12);
  });
});
