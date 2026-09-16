import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroHeadline } from '@/components/marketing/hero-headline';
import { Collage } from '@/components/marketing/collage';
import { HeroExchange } from '@/components/marketing/hero-exchange';
import { COLLAGE_CARDS } from '@/components/marketing/collage-cards';
import { Section, SectionHeading } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Hand over the applying, not your life',
  description:
    'Delegate job applications to an assistant who never sees your profile. The AI answers their questions one at a time, and you see every disclosure.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Hand over the applying, not your life',
    description: 'Delegate job applications to an assistant who never sees your profile.',
    siteName: 'Job Application Assistant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hand over the applying, not your life',
    description: 'Delegate job applications to an assistant who never sees your profile.',
  },
};

/**
 * The landing page.
 *
 * ── The rhythm ──────────────────────────────────────────────────────────────
 * page → sand → indigo → page → dark → orange → page. Six changes of ground in
 * one scroll, which is the thing the reference site does and the thing this
 * page was missing: it was one unbroken near-black field from header to footer.
 *
 * Each section owns its colour through `data-panel`, so the components inside
 * are unmodified — see components/marketing/section.tsx.
 *
 * A server component with no data fetching, so it renders statically and ships
 * as HTML. The two pieces that need the client — the headline stagger and the
 * collage parallax — are islands inside it.
 */
export default function MarketingPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Section dots innerClassName="pb-20 pt-12 md:pb-28 md:pt-16">
        {/*
          Two columns, because the previous single-column hero left half the
          viewport empty and made you read three sentences before anything
          showed you what the product does.
          `lg:` rather than `md:`, so a tablet gets the full-width headline
          instead of two cramped columns.
        */}
        {/*
          `grid-cols-1` on the base is load-bearing, not decoration.

          Without it the implicit grid track is sized `auto`, which means it
          grows to the widest item's max-content contribution — and the items
          here carry `max-w-[46ch]`, which at phone width is 411px. The track
          went to 411px inside a 390px viewport, every sibling inherited it, and
          the whole hero overflowed horizontally with the copy clipped off the
          right edge. Tailwind's `grid-cols-1` is `repeat(1, minmax(0, 1fr))`,
          so the track tracks the container and `max-w` goes back to being a cap
          rather than a floor.
        */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div className="min-w-0">
            <p className="label-section">For people who are done applying</p>

            <HeroHeadline
              text="Hand over the applying. Not your life."
              accentFrom={3}
              className="mt-4 max-w-[13ch] font-display text-hero font-semibold leading-tight tracking-tight"
            />

            <p className="mt-6 max-w-[44ch] text-xl leading-normal text-ink-muted">
              They apply on your behalf and never see your profile. They ask a
              question; they get an answer to that question. You see every
              disclosure, as it happens.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/signup"
                className="rounded-md bg-ink px-7 py-3.5 text-lg font-semibold text-ink-inverse transition-opacity duration-fast ease-out hover:opacity-90"
              >
                Set up your profile
              </Link>
              <Link
                href="/how-to-use"
                className="text-lg text-ink-muted underline decoration-line underline-offset-4 transition-colors duration-fast ease-out hover:text-ink"
              >
                See how it works
              </Link>
              {/* Next to the button, not buried in the pricing page — it is
                  the thing that decides whether somebody clicks it. */}
              <span className="text-base text-ink-muted">
                Fourteen days free, no card.
              </span>
            </div>

            {/*
              One concrete, checkable claim, above the fold. Every other line
              up here is a promise; this one is a refusal, and it is the
              strongest thing this product has to say.
            */}
            {/* One checkable claim above the fold. Everything else up here is
                a promise; this one is a refusal, and it is the strongest thing
                this product has to say. Kept to two lines so it does not push
                the card below the fold. */}
            <p className="mt-8 flex items-start gap-3 text-base leading-normal text-ink-muted">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-indigo"
              />
              <span className="max-w-[46ch]">
                ID numbers are refused at the point of entry — not hidden, not
                encrypted.{' '}
                <span className="text-ink">No setting changes that.</span>
              </span>
            </p>
          </div>

          <div className="lg:justify-self-end">
            <HeroExchange />
          </div>
        </div>
      </Section>

      {/* ── The product, on warm sand ────────────────────────────────── */}
      <Section tone="sand" aria-label="The product" innerClassName="py-20 md:py-28">
        <SectionHeading
          eyebrow="What it looks like"
          title="Four screens, and what each one refuses to do."
        />
        <div className="mt-12">
          <Collage cards={COLLAGE_CARDS} />
        </div>
      </Section>

      {/* ── The promise, full-bleed indigo ───────────────────────────── */}
      <Section tone="indigo" dots innerClassName="py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="label-section">The part that matters</p>
            <h2 className="mt-6 max-w-[16ch] font-display text-4xl font-semibold leading-tight tracking-tight">
              The assistant is not the one being trusted.
            </h2>
          </div>

          <div className="flex flex-col gap-10 md:pt-4">
            {PROMISES.map((promise) => (
              <div key={promise.title}>
                <h3 className="font-display text-xl font-semibold">{promise.title}</h3>
                <p className="mt-3 max-w-prose text-lg leading-normal text-ink-muted">
                  {promise.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How it goes, back on the page ────────────────────────────── */}
      <Section innerClassName="py-20 md:py-28">
        <SectionHeading
          eyebrow="How it goes"
          title="Set it up once. Then answer the occasional question."
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-surface px-7 py-9">
              <p aria-hidden="true" className="font-mono text-sm text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-base leading-normal text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── The one dark panel, for the thing worth stopping at ──────── */}
      <Section tone="dark" dots innerClassName="py-24 md:py-32">
        <div>
          <p className="label-section">Never stored</p>
          <h2 className="mt-6 max-w-[18ch] font-display text-4xl font-semibold leading-tight tracking-tight">
            The most useful feature we refused to build.
          </h2>
        </div>
        <div className="mt-8 grid max-w-4xl gap-8 md:grid-cols-2">
          <p className="text-xl leading-normal text-ink-muted">
            Storing your ID numbers would save you a few minutes per application.
            It would also mean holding the single most valuable thing an attacker
            could take from you, on behalf of someone who never asked us to hold
            it.
          </p>
          <p className="text-xl leading-normal text-ink-muted">
            So we do not. When a form asks, you fill that field in yourself —
            deliberately inconvenient, and the one inconvenience nobody has ever
            written in asking us to remove.
          </p>
        </div>
      </Section>

      {/* ── The close, full-bleed orange ─────────────────────────────── */}
      <Section tone="orange" innerClassName="py-24 md:py-32">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-[22ch] font-display text-4xl font-semibold leading-tight tracking-tight">
            Twenty applications a week. None of them yours to write.
          </h2>

          <div className="flex shrink-0 flex-col items-start gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-ink px-7 py-3.5 text-lg font-semibold text-ink-inverse transition-opacity duration-fast ease-out hover:opacity-90"
            >
              Set up your profile
            </Link>
            <span className="text-base text-ink-muted">
              Fourteen days free, no card.
            </span>
          </div>
        </div>
      </Section>
    </main>
  );
}

const PROMISES = [
  {
    title: 'They ask, they do not browse',
    body:
      'There is no screen anywhere that shows your assistant your profile. They ask the question the form is asking, and get an answer to that question.',
  },
  {
    title: 'One password at a time',
    body:
      'Credentials are released singly, on a sixty-second timer, and recorded. There is no list to copy, and rotating a password is what hands access to a new assistant.',
  },
  {
    title: 'Every disclosure, in your log',
    body:
      'Each sensitive value released and each password shown, with the time and the assistant. It is a screen in your account, not a request you have to make.',
  },
];

const STEPS = [
  {
    title: 'Fill in your profile',
    body:
      'Once. Mark what is sensitive. The more you put in, the fewer questions come back to you later.',
  },
  {
    title: 'Say where they may apply',
    body:
      'Your job boards and the account for each. Rotate the password when you bring someone new on — the product makes that the obvious action.',
  },
  {
    title: 'Choose what happens at a gap',
    body:
      'When a form asks something your profile does not cover: guess and tell you, or pause and wait for you. One setting, changed whenever.',
  },
];
