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

/**
 * The product name, in one place.
 *
 * It used to be a string literal in nine files, which is why the header carried
 * two spellings and the 404 disagreed with the footer. A rename should be one
 * edit, and `site.spec.ts` fails the build if the literal reappears in a
 * component.
 *
 * ── On the name ────────────────────────────────────────────────────────────
 * An understudy goes on in your place, word-perfect, fed lines from the wings
 * by someone the audience never sees. That is the product: the assistant is on
 * stage, the Client's context stays in the wings, and the employer sees one
 * coherent performance. The vocabulary that follows from it — cues, the prompt
 * book, going on — is used only where it is clearer than the plain word, never
 * as decoration. An assistant reading their own dashboard should not have to
 * decode a metaphor to find out what to do next.
 */
export const PRODUCT = {
  name: 'Understudy',
  /** For `<title>` and anywhere the name needs its category attached. */
  legalName: 'Understudy',
  tagline: 'Delegate the applications. Keep the file.',
  description:
    'Hand your job applications to an assistant without handing over your life. ' +
    'They ask; we answer from your profile, one question at a time, and log every disclosure.',
} as const;
