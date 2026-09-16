import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PanelTone = 'page' | 'muted' | 'sand' | 'indigo' | 'orange' | 'dark';

/**
 * A full-bleed section that owns a colour.
 *
 * ── Why this is a component and not a class ─────────────────────────────────
 * The tone sets `data-panel`, which remaps --color-bg, --color-surface,
 * --color-text and --color-border for everything inside it. So a Card in an
 * indigo section is the same Card — it reads --color-surface and gets a
 * translucent white instead of white, with no variant and no prop threaded
 * through three components.
 *
 * That is what makes a multi-colour site maintainable. The alternative is a
 * `dark` boolean on every component, and the first one somebody forgets is a
 * white card on an indigo field.
 */
export function Section({
  tone = 'page',
  dots = false,
  children,
  className,
  innerClassName,
  ...rest
}: {
  tone?: PanelTone;
  /** The dotted texture. Quiet enough that most people never consciously see it. */
  dots?: boolean;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'className'>) {
  const panel = tone === 'page' ? undefined : tone === 'dark' ? undefined : tone;

  return (
    <section
      {...rest}
      data-panel={panel}
      data-surface={tone === 'dark' ? 'dark' : undefined}
      className={cn(
        'bg-bg text-ink',
        dots && 'panel-dots',
        className,
      )}
    >
      <div className={cn('mx-auto max-w-marketing px-4 md:px-8', innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * The section heading treatment, so every one on the site is the same.
 *
 * `eyebrow` is the small uppercase label; `lead` is the paragraph under the
 * heading. Both optional, because the alternative — each page assembling its
 * own — is how five pages end up with five sizes of heading.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    /*
     * No max-width on this wrapper.
     *
     * It used to carry `max-w-[24ch]`, and `ch` resolves against the element's
     * OWN font size — which here is body size, not the heading's. So a 44px
     * heading was being squeezed into roughly 190px and wrapping to six lines.
     * The measure belongs on the heading, where the unit means what it looks
     * like it means.
     */
    <header className={className}>
      {eyebrow && <p className="label-section">{eyebrow}</p>}
      <h2
        className={cn(
          'max-w-[20ch] font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl',
          eyebrow && 'mt-4',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className="mt-4 max-w-prose text-lg leading-normal text-ink-muted">{lead}</p>
      )}
    </header>
  );
}
