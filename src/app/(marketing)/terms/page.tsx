import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'What you are agreeing to, what your assistant is agreeing to, and what this service does not promise.',
  alternates: { canonical: '/terms' },
};

/**
 * Same standard as the privacy page: every claim is true of the system as
 * built, and the parts only a solicitor can supply are named rather than
 * invented. See the note in privacy/page.tsx.
 */
const SECTIONS: LegalSection[] = [
  {
    heading: 'Who these terms are between',
    paragraphs: [
      'These terms are between you — the account holder — and the operator of this service. The operating entity and its registered address go here before this page is published.',
      'Your assistants are not party to these terms. They agree separately, to a confidentiality agreement they sign before anything opens to them, and a copy of what they signed is visible from your account.',
    ],
  },
  {
    heading: 'What you are responsible for',
    paragraphs: [
      'The applications are submitted in your name and they are yours. This service drafts and your assistant submits; the content is your representation about yourself.',
      'That means two things in practice.',
    ],
    list: [
      'Check your profile is accurate. Everything drafted is derived from it, and a wrong date in your profile becomes a wrong date on forty applications.',
      'Answer the questions that reach your queue. When the profile does not cover something, the system either flags a best-effort answer for you to correct, or pauses and waits — which you chose in your settings.',
      'Choose your assistants. This service scopes what they see and records what they saw; it does not vouch for them.',
    ],
  },
  {
    heading: 'Site credentials and third-party terms',
    paragraphs: [
      'You tell this service which job boards your assistant may use, and supply the account for each. Many job boards prohibit account sharing in their own terms. Whether your arrangement is permitted is between you and them, and you should read their terms before adding an account here.',
      'Our strong recommendation, and the one the product is built around: use a separate account for this work rather than your personal one, and rotate its password when an assistant finishes. The product makes rotation the obvious action for exactly this reason.',
    ],
  },
  {
    heading: 'What this service does not promise',
    paragraphs: [
      'It does not promise you a job, an interview, or a response. It reduces the labour of applying; it does not change who gets hired.',
      'It does not promise that a draft is correct. Drafts are produced by AI models from the profile you supplied. They are checked against your own material before being shown, and anything that could not be traced back to something you provided is discarded rather than softened — but they are still drafts, and they go out in your name.',
      'It does not promise that an assistant will not misuse what they are shown. A password shown on screen can be copied. What the service provides is scoping, logging, rotation, revocation and a signed agreement — controls that make misuse narrow, visible and recoverable, not impossible.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: ['This service may not be used to:'],
    list: [
      'Apply on behalf of anyone other than the account holder. One account is one job seeker.',
      'Submit applications containing information you know to be false.',
      'Access job boards in a way their own terms forbid.',
      'Attempt to extract another account’s data, or to reach parts of the API your role is not permitted to use.',
    ],
  },
  {
    heading: 'Payment',
    paragraphs: [
      'Plans are billed monthly in advance and can be cancelled at any time, taking effect at the end of the period you have paid for. There is no refund for a partial month, and no penalty for leaving.',
      'If payment fails, your assistants lose access. Your data stays exactly as it is and remains yours to export or delete — nothing is held hostage against an invoice.',
      'If you supply your own AI provider keys, those providers bill you directly and this service has no part in that relationship.',
    ],
  },
  {
    heading: 'Suspension and termination',
    paragraphs: [
      'You can close your account at any time from your settings, and closing it deletes your profile, credentials, applications and Q&A bank.',
      'We may suspend an account for a breach of the acceptable use section above, or where continuing to operate it would be unlawful. Where the reason permits it, you will be told what it is and given the chance to fix it.',
    ],
  },
  {
    heading: 'Liability',
    paragraphs: [
      'The limitation of liability, the governing-law clause and the dispute-resolution mechanism have to be drafted by a solicitor for the jurisdiction the operating entity is in. They are deliberately absent rather than adapted from another company’s terms — a limitation clause copied from a template is frequently unenforceable and gives false comfort to everyone relying on it.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: [
      'Changes that affect what you are agreeing to will be notified in the product, with the previous version available, before they take effect.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="16 September 2026"
      intro="What you are agreeing to, what your assistant agrees to separately, and the things this service does not promise."
      notice={
        <>
          <strong>Draft — not yet reviewed by a solicitor.</strong> The
          descriptive parts are accurate. The parts that make a contract
          enforceable — the operating entity, liability, governing law and
          dispute resolution — are missing on purpose, because a limitation
          clause borrowed from a template is often unenforceable and gives false
          comfort to both sides.
        </>
      }
      sections={SECTIONS}
    />
  );
}
