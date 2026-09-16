import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES } from '@/lib/routes';
import { SITE_URL } from '@/lib/site';

/**
 * The public pages, and only those. A sitemap listing routes that redirect to
 * a login wastes a crawl budget and tells a search engine the site is smaller
 * and worse than it is.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: route.path === '/' ? SITE_URL : `${SITE_URL}${route.path}`,
    changeFrequency: 'monthly' as const,
    priority: route.priority ?? 0.5,
  }));
}
