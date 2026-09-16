import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { TOKEN_HEX } from '@/styles/tokens';
import { PRODUCT, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // The marketing page sets its own; everything else gets the suffix. A
    // template beats repeating the product name in nine files.
    default: PRODUCT.name,
    template: `%s · ${PRODUCT.name}`,
  },
  description: PRODUCT.description,
  // The app is behind a login; only the two public routes opt back in, via
  // robots.ts. This is the belt to that braces.
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // Two, matched to the two registers: the browser chrome follows whichever
  // surface the visitor is actually looking at rather than flashing off-white
  // over the near-black marketing page.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: TOKEN_HEX.workspace },
    { media: '(prefers-color-scheme: dark)', color: TOKEN_HEX.marketing },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">{children}</body>
    </html>
  );
}
