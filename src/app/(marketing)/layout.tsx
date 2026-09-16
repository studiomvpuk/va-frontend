import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

/**
 * The public site.
 *
 * Light, like the reference. An earlier version wrapped this whole tree in
 * data-surface="dark" and made every public page near-black — which was never
 * what base44.com does (its body is #F9F8F6) and made the site read as one
 * unbroken slab.
 *
 * Colour now arrives per section, via data-panel. See design-tokens.css.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
