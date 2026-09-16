import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Content must be visible without JavaScript.
 *
 * `initial={{ opacity: 0 }}` on a Framer component is server-rendered as a
 * literal `style="opacity:0"`. Used at route level it shipped every page in the
 * product blank until hydration — and permanently blank if the bundle never
 * arrived. Lighthouse reported NO_FCP: no content painted at all.
 *
 * It is an easy thing to reintroduce, because it looks identical in a browser
 * with a warm cache and fast JS. So it is a test.
 */
const SRC = join(__dirname, '../..');

function read(path: string): string {
  return readFileSync(join(SRC, path), 'utf8');
}

/**
 * Comments out, then match.
 *
 * Written after this suite failed on the doc comments that explain the very bug
 * it guards — they quote `initial={{ opacity: 0 }}` as prose. A test that
 * cannot tell code from writing about code is a test that forbids explaining
 * yourself, which is the wrong trade.
 */
function code(path: string): string {
  return read(path)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('page entry does not depend on JavaScript', () => {
  it('PageTransition is a plain element with a CSS animation', () => {
    const source = code('components/motion/page-transition.tsx');

    expect(source).toContain('animate-page-enter');
    expect(source).not.toContain('motion/react');
    expect(source).not.toMatch(/initial=\{\{[^}]*opacity/);
  });

  it('is not a client component, so it costs nothing in the bundle', () => {
    expect(read('components/motion/page-transition.tsx')).not.toContain("'use client'");
  });

  it('the keyframes set no fill-mode, so the resting state is visible', () => {
    // With `both` or `backwards`, an element whose animation never runs sits at
    // the 0% keyframe — which is opacity 0, i.e. exactly the bug again.
    const css = read('styles/globals.css');
    const rule = css.slice(css.indexOf('.animate-page-enter'), css.indexOf('.animate-page-enter') + 160);

    expect(rule).toContain('animation: page-enter');
    expect(rule).not.toMatch(/\b(both|backwards|forwards)\b/);
  });

  it('no route-level component hides itself behind a JS opacity animation', () => {
    // The guide's audience switcher had the same problem for the same reason.
    for (const path of [
      'app/(guide)/how-to-use/page.tsx',
      'app/(marketing)/page.tsx',
      'components/motion/page-transition.tsx',
    ]) {
      expect(code(path), path).not.toMatch(/initial=\{\{[^}]*opacity:\s*0/);
    }
  });
});
