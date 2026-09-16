import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * WCAG AA, enforced on the palette itself.
 *
 * ── Why this exists rather than a Lighthouse run ────────────────────────────
 * Lighthouse audits the pixels on a page it happens to load. It caught four
 * failures on the marketing page and was blind to five more, because the
 * elements carrying them — a borderline fit badge, a positive chip in the dark
 * register — were not on that page. Worse, it was blind to the biggest one for
 * eight phases: --color-text-muted was 3.29:1 on the workspace background, on
 * every subtitle and every piece of helper text in the product, and nothing
 * measured it because nothing had ever run an audit against the light register.
 *
 * So the contract is asserted against the token file directly. A pairing is
 * legal or it is not, whether or not a page currently renders it, and adding a
 * colour without a passing pairing fails CI rather than waiting for an audit.
 *
 * ── The 4.5 bar, with no large-text exemption ───────────────────────────────
 * AA allows 3:1 for large text. That exemption is not taken here: a token does
 * not know what size it will be used at, and "this one is fine because the
 * button is big" stops being true the first time someone reuses it on a caption.
 */
const TOKENS = readFileSync(join(__dirname, 'design-tokens.css'), 'utf8');

const AA = 4.5;

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Flattens an `rgba()` foreground onto an opaque background.
 *
 * ── Why this had to be added ────────────────────────────────────────────────
 * The colour panels express their ink as white or near-black at an alpha, so
 * one set of tokens works on indigo, orange and sand. Everything above compares
 * hex to hex, so it silently skipped every one of them — and two were failing:
 * white at 0.76 on the indigo is 4.20:1, and near-black at 0.74 on the orange
 * is 4.31:1. Both shipped, and Lighthouse found the second one on the rendered
 * page rather than this suite finding it on the token.
 *
 * A test that cannot see half the palette is worse than no test, because it
 * reads as coverage.
 */
export function composite(rgba: string, background: string): string {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return rgba;

  const [r, g, b, a = '1'] = match[1].split(',').map((p) => p.trim());
  const alpha = Number(a);
  const bg = background.replace('#', '');
  const channel = (fg: number, i: number) => {
    const back = parseInt(bg.slice(i * 2, i * 2 + 2), 16);
    return Math.round(alpha * fg + (1 - alpha) * back);
  };

  const flat = [Number(r), Number(g), Number(b)].map(channel);
  return `#${flat.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Reads a token as the given register resolves it.
 *
 * The dark block redefines a subset, so a token it does not mention keeps its
 * light value — which is exactly how the missing overrides got missed. Resolving
 * the same way the cascade does is what makes this test able to see them.
 */
function resolve(register: 'light' | 'dark'): Record<string, string> {
  const rootBlock = TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf("[data-surface='dark']"));
  const darkStart = TOKENS.indexOf("[data-surface='dark']");
  const darkBlock = TOKENS.slice(darkStart, TOKENS.indexOf('}', TOKENS.indexOf('{', darkStart)));

  const values: Record<string, string> = {};
  const read = (block: string) => {
    for (const [, name, value] of block.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)) {
      values[name] = value.trim();
    }
  };

  read(rootBlock);
  if (register === 'dark') read(darkBlock);

  // Flatten one level of var() indirection, which the dark block uses.
  for (const [name, value] of Object.entries(values)) {
    const reference = value.match(/var\((--color-[\w-]+)\)/);
    if (reference) values[name] = values[reference[1]] ?? value;
  }
  return values;
}

/** Every foreground/background pairing the components actually put together. */
const PAIRS: [fg: string, bg: string, where: string][] = [
  ['--color-text', '--color-bg', 'body copy on the page'],
  ['--color-text', '--color-surface', 'body copy in a card'],
  ['--color-text', '--color-surface-sunken', 'body copy in a well'],
  ['--color-text', '--color-bg-muted', 'body copy on the alternating section'],
  ['--color-text', '--color-bg-sand', 'body copy on sand'],
  ['--color-text-muted', '--color-bg', 'subtitles and helper text'],
  ['--color-text-muted', '--color-surface', 'helper text in a card'],
  ['--color-text-muted', '--color-surface-sunken', 'helper text in a well'],
  ['--color-text-muted', '--color-bg-muted', 'helper text on the alternating section'],
  // Sand is the darkest neutral, and it is what sets --color-text-muted.
  ['--color-text-muted', '--color-bg-sand', 'helper text on sand'],
  ['--color-on-indigo', '--color-indigo', 'the indigo panel'],
  ['--color-indigo-text', '--color-bg', 'indigo as text on the page'],
  ['--color-indigo-text', '--color-indigo-subtle', 'an indigo badge'],
  // Orange is a FIELD colour. --color-accent-strong is its text-safe sibling,
  // and this pair is what stops anyone using the raw one for a word.
  ['--color-accent-strong', '--color-bg', 'orange as text on the page'],
  ['--color-on-accent', '--color-accent', 'the primary button label'],
  ['--color-on-accent', '--color-accent-hover', 'the primary button, hovered'],
  ['--color-on-accent', '--color-accent-active', 'the primary button, pressed'],
  ['--color-accent-text', '--color-accent-subtle', 'sensitive badges, flagged messages'],
  ['--color-positive', '--color-positive-subtle', 'Signed, good fit'],
  ['--color-neutral', '--color-neutral-subtle', 'Applied, Skipped, General'],
  ['--color-warning', '--color-warning-subtle', 'borderline fit, Waiting on you'],
  ['--color-danger', '--color-danger-subtle', 'rotate, revoke, delete'],
  ['--color-on-danger', '--color-danger', 'the danger button, hovered'],
];

describe.each(['light', 'dark'] as const)('%s register meets WCAG AA', (register) => {
  const tokens = resolve(register);

  it.each(PAIRS)('%s on %s — %s', (fg, bg) => {
    const foreground = tokens[fg];
    const background = tokens[bg];

    expect(foreground, `${fg} is not defined`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(background, `${bg} is not defined`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(AA);
  });
});

describe('the dark register', () => {
  it('remaps a foreground for every subtle background it remaps', () => {
    // The failure this catches: overriding --color-positive-subtle to a
    // near-black without overriding --color-positive leaves ink chosen for a
    // pale surface sitting on a dark one. It scored 2.55:1 and looked fine in
    // a screenshot.
    const light = resolve('light');
    const dark = resolve('dark');

    for (const family of ['accent', 'positive', 'neutral', 'warning', 'danger', 'indigo']) {
      const subtle = `--color-${family}-subtle`;
      const remapped = light[subtle] !== dark[subtle];
      if (!remapped) continue;

      const foreground =
        family === 'accent' || family === 'indigo'
          ? `--color-${family}-text`
          : `--color-${family}`;
      expect(
        light[foreground],
        `${subtle} is remapped for dark but ${foreground} is not`,
      ).not.toBe(dark[foreground]);
    }
  });

  it('puts every subtle background on the dark side of the range', () => {
    const dark = resolve('dark');
    for (const family of ['accent', 'positive', 'neutral', 'warning', 'danger', 'indigo']) {
      // A pale peach chip on a near-black page is legible and still wrong.
      expect(luminance(dark[`--color-${family}-subtle`])).toBeLessThan(0.1);
    }
  });
});

describe('the accent', () => {
  it('is the colour it was measured to be', () => {
    // Taken off base44.com rather than approximated. If a future edit "fixes"
    // a contrast failure by darkening the accent instead of changing the ink
    // on top of it, this is the tripwire.
    expect(resolve('light')['--color-accent']).toBe('#FF6A00');
    expect(resolve('light')['--color-indigo']).toBe('#3950E6');
  });

  it('carries ink, not white — and indigo carries white, not ink', () => {
    // Not a preference. White on the orange is 2.87:1; near-black is 6.68. On
    // the indigo it is the other way round. The reference site does the same
    // thing, which is a useful confirmation that it is a property of the
    // colours rather than a matter of taste.
    expect(contrast('#FFFFFF', '#FF6A00')).toBeLessThan(AA);
    expect(contrast('#14141A', '#FF6A00')).toBeGreaterThanOrEqual(AA);

    expect(contrast('#14141A', '#3950E6')).toBeLessThan(AA);
    expect(contrast('#FFFFFF', '#3950E6')).toBeGreaterThanOrEqual(AA);
  });

  it('never uses the raw orange as text', () => {
    // 2.71:1 on the page. --color-accent-strong exists for this.
    const light = resolve('light');
    expect(contrast(light['--color-accent'], light['--color-bg'])).toBeLessThan(AA);
    expect(light['--color-accent-strong']).not.toBe(light['--color-accent']);
  });
});

describe('the page is light', () => {
  it('has a near-white background', () => {
    // The marketing site was near-black for a while, which the reference never
    // was — base44.com's body is #F9F8F6. Dark survives as a panel register.
    expect(luminance(resolve('light')['--color-bg'])).toBeGreaterThan(0.85);
  });

  it('keeps dark available as a panel', () => {
    expect(luminance(resolve('dark')['--color-bg'])).toBeLessThan(0.05);
  });
});

/**
 * The colour panels.
 *
 * A section that owns a colour remaps --color-text and --color-text-muted, and
 * both are expressed as an alpha so one value works across the panels. That is
 * what the compositing above exists for.
 */
describe('colour panels meet WCAG AA', () => {
  const tokens = resolve('light');

  const PANELS: { name: string; background: string; ink: string; muted: string }[] = [
    {
      name: 'indigo',
      background: tokens['--color-indigo'],
      ink: '#FFFFFF',
      muted: 'rgba(255, 255, 255, 0.85)',
    },
    {
      name: 'orange',
      background: tokens['--color-accent'],
      ink: tokens['--color-on-accent'],
      muted: 'rgba(20, 20, 26, 0.82)',
    },
    {
      name: 'sand',
      background: tokens['--color-bg-sand'],
      ink: tokens['--color-text'],
      muted: tokens['--color-text-muted'],
    },
  ];

  it.each(PANELS)('$name — body copy', ({ background, ink }) => {
    expect(contrast(composite(ink, background), background)).toBeGreaterThanOrEqual(AA);
  });

  it.each(PANELS)('$name — muted copy', ({ background, muted }) => {
    // The one that was failing. Muted text is most of the words on a panel.
    expect(contrast(composite(muted, background), background)).toBeGreaterThanOrEqual(AA);
  });

  it('keeps the panel values in step with the stylesheet', () => {
    // The alphas above are duplicated from design-tokens.css, which is exactly
    // the kind of copy that drifts. This asserts the stylesheet still says what
    // this file assumes it says.
    const css = TOKENS.slice(TOKENS.indexOf("[data-panel='indigo']"));
    expect(css).toContain('rgba(255, 255, 255, 0.85)');
    expect(css).toContain('rgba(20, 20, 26, 0.82)');
  });
});
