import Link from 'next/link';
import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'One price per month. Bring your own AI keys and pay the providers directly, or use ours and pay nothing extra.',
  alternates: { canonical: '/pricing' },
};

/**
 * Pricing.
 *
 * ── Why the numbers are shaped this way ─────────────────────────────────────
 * The cost model (`api/src/costs`, `npm run cost-model`) puts the AI spend for
 * an active Client at about $2.35/month, and under $19 in the worst case that
 * could be constructed. The original estimate this product was going to be
 * priced against was $30–60 — roughly fifteen times too high.
 *
 * That leaves real room, and the honest thing to do with it is not to quietly
 * pocket the difference behind a vague "usage-based" tier. Two plans: a flat
 * one where the AI cost is included because it is small, and a bring-your-own-
 * key one that is cheaper because it genuinely costs us less to run.
 *
 * These figures are a starting point, not a committed price — the pilot has not
 * run. They are here so the page is real rather than a placeholder.
 */
const PLANS = [
  {
    name: 'Standard',
    price: '£19',
    cadence: '/month',
    summary: 'Everything, on our AI keys. No usage to think about.',
    features: [
      'Unlimited applications',
      'Up to 3 assistants',
      'Interview prep documents',
      'Email and WhatsApp notifications',
      'Full access log',
    ],
    cta: 'Get started',
    href: '/signup',
    emphasis: true,
  },
  {
    name: 'Own keys',
    price: '£9',
    cadence: '/month',
    summary:
      'You supply Anthropic and OpenAI keys and pay those bills directly — usually a couple of pounds.',
    features: [
      'Everything in Standard',
      'Your keys, write-only — nobody can read them back, including you',
      'Per-provider spend visible in your dashboard',
      'Switch back at any time',
    ],
    cta: 'Get started',
    href: '/signup',
    emphasis: false,
  },
];

const QUESTIONS = [
  {
    q: 'What does the AI actually cost to run?',
    a: 'For an active month — around 120 postings assessed, 40 applications submitted — it works out at roughly $2 to $3 of provider spend. That is why Standard includes it rather than metering it: the meter would cost more to explain than the thing it measures.',
  },
  {
    q: 'What happens if I stop paying?',
    a: 'Your assistants lose access immediately. Your profile, your applications and your access log stay exactly as they are, and are yours to export or delete. Nothing is held hostage.',
  },
  {
    q: 'Do you charge per assistant?',
    a: 'No. Three are included, and a fourth is a conversation rather than a surcharge — the cost of an assistant to us is the applications they make, which is already covered.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The first fourteen days, with no card. If you have not sent an application in two weeks, this product is not for you and we would rather you found that out for free.',
  },
];

export default function PricingPage() {
  return (
    <main>
      <Section dots innerClassName="pb-16 pt-16 md:pt-24">
        <p className="label-section">Pricing</p>
        <h1 className="mt-6 max-w-[20ch] font-display text-4xl font-semibold leading-tight tracking-tight">
          One price. No{' '}
          <span className="text-accent-strong">per-application</span> maths.
        </h1>
        <p className="mt-8 max-w-prose text-xl leading-normal text-ink-muted">
          You are paying for somebody else to do the applying without having to
          hand over your life to do it. That should not come with a usage meter.
        </p>
      </Section>

      <Section tone="sand" aria-label="Plans" innerClassName="py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              data-panel={plan.emphasis ? 'orange' : undefined}
              className={[
                'flex flex-col rounded-xl border p-8 md:p-10',
                // The recommended plan IS the orange field rather than a card
                // with an orange edge — colour arrives as a whole surface here,
                // which is the rule the rest of the site follows.
                plan.emphasis ? 'border-transparent bg-bg text-ink' : 'border-line bg-bg',
              ].join(' ')}
            >
              <h2 className="font-display text-xl font-semibold">{plan.name}</h2>

              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-base text-ink-muted">{plan.cadence}</span>
              </p>

              <p className="mt-4 max-w-prose text-base leading-normal text-ink-muted">
                {plan.summary}
              </p>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-base">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-ink" />
                    <span className="text-ink">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={[
                  'mt-10 rounded-md px-6 py-3.5 text-center text-lg font-semibold transition-opacity duration-fast ease-out',
                  plan.emphasis
                    ? 'bg-ink text-ink-inverse hover:opacity-90'
                    : 'border border-line text-ink hover:border-line-strong',
                ].join(' ')}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-muted">
          Prices in GBP, excluding VAT. Fourteen days free, no card.
        </p>
      </Section>

      <Section innerClassName="py-20 md:py-28">
        <SectionHeading eyebrow="Questions" title="The ones people actually ask." />

        <dl className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {QUESTIONS.map((item) => (
            <div key={item.q} className="bg-surface px-7 py-8">
              <dt className="font-display text-lg font-semibold">{item.q}</dt>
              <dd className="mt-3 max-w-prose text-base leading-normal text-ink-muted">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </main>
  );
}
