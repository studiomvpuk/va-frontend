/**
 * Token values that must exist as JavaScript strings.
 *
 * A handful of places cannot read a CSS custom property: the `theme-color` meta
 * tag, Storybook's background list, and anything consumed before stylesheets
 * parse. Those values live here — one file, exempt from the no-raw-hex lint
 * rule, next to the stylesheet they mirror — rather than scattered as literals
 * across components.
 *
 * Keep in sync with design-tokens.css. There are deliberately very few of these.
 */
export const TOKEN_HEX = {
  /** --color-bg — the warm off-white page, app and marketing alike. */
  workspace: '#F9F8F6',
  /** --color-bg-dark — the dark PANEL. Not a page background any more. */
  marketing: '#14141A',
} as const;

/**
 * The dark register's ink and accent, for the OG image only.
 *
 * Satori renders that image at build time with no stylesheet, so a
 * `var(--color-accent)` there resolves to nothing and the text comes out
 * invisible. These are the same values as design-tokens.css and exist here
 * rather than as literals in the image component, so the no-raw-hex rule still
 * has exactly one file to be exempt from.
 */
export const OG_HEX = {
  /** --color-accent */
  accent: '#FF6A00',
  /** --color-indigo */
  indigo: '#3950E6',
  /** --color-text-on-dark */
  textOnDark: '#F5F5F3',
  /** --color-text-muted, dark register */
  textMuted: '#A3A09C',
  /** --color-text */
  ink: '#0F0F0F',
} as const;
