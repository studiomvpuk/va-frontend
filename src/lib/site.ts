/**
 * The canonical origin, for metadata that must be absolute.
 *
 * Canonical URLs, OG tags and the sitemap all need a real origin — a relative
 * one silently produces `null` entries in the rendered metadata, which is the
 * kind of bug that ships because nothing errors. It comes from the environment
 * so preview deployments describe themselves rather than pointing at
 * production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
