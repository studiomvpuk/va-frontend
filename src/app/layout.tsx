import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { TOKEN_HEX } from '@/styles/tokens';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // The marketing page sets its own; everything else gets the suffix. A
    // template beats repeating the product name in nine files.
    default: 'Job Application Assistant',
    template: '%s · Job Application Assistant',
  },
  description:
    'Delegate job applications to an assistant without handing over your whole life.',
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
