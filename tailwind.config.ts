import type { Config } from 'tailwindcss';

/**
 * Every value here REFERENCES a custom property from src/styles/design-tokens.css.
 * None of them restate a literal. Changing the palette means editing the token
 * file and nothing else — and the no-raw-hex ESLint rule stops anyone routing
 * around that.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          muted: 'var(--color-bg-muted)',
          sand: 'var(--color-bg-sand)',
        },
        'bg-dark': 'var(--color-bg-dark)',
        /* The second large field. See the palette note in design-tokens.css. */
        indigo: {
          DEFAULT: 'var(--color-indigo)',
          hover: 'var(--color-indigo-hover)',
          subtle: 'var(--color-indigo-subtle)',
          text: 'var(--color-indigo-text)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          sunken: 'var(--color-surface-sunken)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          active: 'var(--color-accent-active)',
          subtle: 'var(--color-accent-subtle)',
          text: 'var(--color-accent-text)',
          /* Orange dark enough to be legible AS TEXT on the page. */
          strong: 'var(--color-accent-strong)',
          border: 'var(--color-accent-border)',
        },
        scrim: 'var(--color-scrim)',
        ink: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
          'on-dark': 'var(--color-text-on-dark)',
          /* Not white — see the note on --color-on-accent. */
          'on-accent': 'var(--color-on-accent)',
          'on-indigo': 'var(--color-on-indigo)',
          /* Flips between registers — see --color-on-danger. */
          'on-danger': 'var(--color-on-danger)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        positive: {
          DEFAULT: 'var(--color-positive)',
          subtle: 'var(--color-positive-subtle)',
        },
        neutral: {
          DEFAULT: 'var(--color-neutral)',
          subtle: 'var(--color-neutral-subtle)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          subtle: 'var(--color-warning-subtle)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          subtle: 'var(--color-danger-subtle)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        hero: 'var(--text-hero)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        bar: 'var(--shadow-bar)',
      },
      maxWidth: {
        app: 'var(--container-app)',
        marketing: 'var(--container-marketing)',
        prose: 'var(--container-prose)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      letterSpacing: {
        tight: 'var(--tracking-tight)',
        label: 'var(--tracking-label)',
      },
    },
  },
  plugins: [],
};

export default config;
