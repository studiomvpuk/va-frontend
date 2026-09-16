import type { MetadataRoute } from 'next';
import { PRIVATE_PREFIXES, PUBLIC_ROUTES } from '@/lib/routes';
import { SITE_URL } from '@/lib/site';

/**
 * Generated from lib/routes.ts rather than hand-maintained.
 *
 * The previous version listed routes by hand and had already fallen behind the
 * product — it disallowed pages that had been renamed and allowed none of the
 * ones added since.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: PUBLIC_ROUTES.map((route) => route.path),
      disallow: PRIVATE_PREFIXES,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
