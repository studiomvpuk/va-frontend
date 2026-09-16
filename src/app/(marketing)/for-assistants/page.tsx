import Link from 'next/link';
import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'For assistants',
  description:
    'What the work involves, what you will and will not be shown, and what to do when the assistant does not know.',
  alternates: { canonical: '/for-assistants' },
};

/**
 * The assistant's page.
 *
 * ── Why this is public and separate ─────────────────────────────────────────
 * The same material exists on How to Use, behind a tab, which is the right
 * place for it once somebody is working. It is the wrong place for somebody
 * deciding whether to take the job: they arrive from a link their client sent,
 * before they have an account, and a tab on a page written for the other party
 * is not a welcome.
 *
 * The tone is deliberately different from the landing page. That one sells
 * control to a job seeker; this one has to be straight with the person being
 * controlled — including that their reveals are logged, which they should hear
 * from us rather than discover.
 */
const STEPS = [
  {
    heading: 'You sign an agreement first',
    body:
      'Before anything opens, you sign a confidentiality agreement. Until you do there is nothing to see — no profile, no passwords, no applications. It is a real document with a version and a hash, not a checkbox.',
  },
  {
    heading: 'You paste a posting, you get a verdict',
    body:
      'A fit score out of ten, measured against what the account holder said they want — not against whether it looks like a good job. A high score on a role you would not have picked is still a yes.',
  },
  {
    heading: 'You ask; you do not browse',
    body:
      'There is no screen that shows you somebody’s profile. You ask the question the form is asking, in the form’s own words, and you get an answer written for that question.',
  },
  {
    heading: 'Passwords come one at a time',
    body:
      'One site, shown once, on a sixty-second timer. There is no list. The fewer you hold at once, the less there is to lose.',
  },
  {
    heading: 'When it does not know, that is not yours to solve',
    body:
      'Either you get a best-effort answer marked as one, or the application pauses and the account holder is told. Never invent an answer about someone else’s life — once a form is submitted that cannot be undone.',
  },
];

export default function ForAssistantsPage() {
  return (
    <main>
      <Section dots innerClassName="pb-16 pt-16 md:pt-24">
        <p className="label-section">For assistants</p>
        <h1 className="mt-6 max-w-[19ch] font-display text-4xl font-semibold leading-tight tracking-tight">
          You will not be handed{' '}
          <span className="text-accent-strong">someone’s life</span>.
        </h1>
        <p className="mt-8 max-w-prose text-xl leading-normal text-ink-muted">
          You are applying on someone else’s behalf, which means holding their
          personal details. This product is built so you hold as few of them as
          possible, for as short a time as possible — which protects you as much
          as it protects them.
        </p>
      </Section>

      <Section tone="sand" aria-label="How the work goes" innerClassName="py-20 md:py-28">
        <SectionHeading eyebrow="The loop" title="Five things, in order." />
        <div className="mt-12">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line">
          {STEPS.map((step, i) => (
            <div key={step.heading} className="bg-surface px-7 py-8 md:px-10">
              <div className="flex flex-col gap-2 md:flex-row md:gap-10">
                <p
                  aria-hidden="true"
                  className="shrink-0 font-mono text-sm text-ink-muted md:w-12 md:pt-1"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold">{step.heading}</h2>
                  <p className="mt-3 max-w-prose text-base leading-normal text-ink-muted">
                    {step.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </Section>

      <Section tone="indigo" dots innerClassName="py-24 md:py-32">
        <div>
          <h2 className="max-w-[24ch] font-display text-4xl font-semibold leading-tight tracking-tight">
            Being straight with you about the logging.
          </h2>
          <div className="mt-6 flex max-w-prose flex-col gap-4 text-base leading-normal text-ink-muted">
            <p>
              Every sensitive value released to you, and every password shown to
              you, is written to the account holder’s log with the time. They can
              read it whenever they like, and they do not need your permission.
            </p>
            <p>
              You should know that from us rather than find out later. It is not
              there because assistants are suspected of anything — it is there so
              that if a question is ever raised, there is a record that answers
              it. That record protects you first.
            </p>
          </div>
        </div>
      </Section>

      <Section innerClassName="py-20 md:py-28">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-[24ch] font-display text-3xl font-semibold leading-tight tracking-tight">
            Been invited? Your invitation email is the way in.
          </h2>
          <Link
            href="/va/login"
            className="shrink-0 rounded-md bg-ink px-7 py-3.5 text-lg font-semibold text-ink-inverse transition-opacity duration-fast ease-out hover:opacity-90"
          >
            Assistant sign in
          </Link>
        </div>
        <p className="mt-6 max-w-prose text-base text-ink-muted">
          Already working? The{' '}
          <Link href="/how-to-use" className="underline underline-offset-4 hover:text-ink">
            How to use
          </Link>{' '}
          page has the detail — including what to do when a form asks for
          something the profile does not answer.
        </p>
      </Section>
    </main>
  );
}
