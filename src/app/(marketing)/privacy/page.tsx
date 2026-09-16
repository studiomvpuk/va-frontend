import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What this service stores, who can see it, what it never stores at all, and how to get it back or delete it.',
  alternates: { canonical: '/privacy' },
};

/**
 * ── A note to whoever reads this file next ──────────────────────────────────
 * Every factual claim below is true of the system as built, and was written by
 * reading the code rather than from a template:
 *
 *   - government IDs: `api/src/profile/validation/government-id.ts`
 *   - encryption and rotation: `api/src/core/crypto/`
 *   - who can decrypt what: `test/architecture/sensitive-reads.spec.ts`
 *   - the access log: `api/src/audit-log/`
 *   - EXIF stripping: `api/src/core/images/image-sanitiser.ts`
 *   - log redaction: `api/src/core/observability/redact.ts`
 *
 * What it is NOT is legal advice, and it is not a substitute for a solicitor.
 * The gaps a lawyer needs to close are named in the banner rather than hidden:
 * a legal entity, an ICO registration number, a named DPO or contact, the
 * international-transfer basis for the AI providers, and the retention periods.
 * Publishing it with those unresolved would be worse than publishing nothing.
 */
const SECTIONS: LegalSection[] = [
  {
    heading: 'What this service is',
    paragraphs: [
      'You hire an assistant to submit job applications for you. This service sits between you and them: your information stays here, and your assistant asks questions rather than being handed a file.',
      'That shape is the whole product, and it is also the main thing this policy describes — because what your assistant can see is a narrower question than what we store.',
    ],
  },
  {
    heading: 'What we store',
    paragraphs: [
      'Your account: your name, email address and a hash of your password. We never store the password itself and cannot recover it.',
      'Your profile: whatever you choose to put in it. Each field is marked General or Sensitive by you. Sensitive fields are encrypted with a per-record key and are never returned in a list — only released one at a time, for one question, with each release logged.',
      'Your applications: the postings your assistant assessed, the drafts produced, the answers given, and the outcome. Your Q&A bank — answers you have confirmed — so the same question is not asked twice.',
      'Your sites: which job boards your assistant may use, and the credentials for them, encrypted the same way.',
      'Your access log: every release of a sensitive value, every password shown, with time and assistant.',
    ],
  },
  {
    heading: 'What we never store, whatever you do',
    paragraphs: [
      'Government identity numbers. National Insurance, Social Security, passport and NHS numbers are refused at the point of entry — not hidden, not encrypted, refused. There is no setting that changes this and no way to mark such a field Sensitive and proceed.',
      'This is deliberate and it is inconvenient. If a form needs one of those numbers, you fill it in yourself. The alternative is holding the single most valuable thing an attacker could take, on behalf of people who did not ask us to hold it.',
    ],
  },
  {
    heading: 'Who can see what',
    paragraphs: [
      'Your assistant sees answers to questions they asked, one at a time, and one site credential at a time. There is no screen anywhere in the product that shows them your profile, and no route that returns more than one credential.',
      'Each assistant signs a confidentiality agreement before anything opens to them. Revoking an assistant takes effect immediately.',
      'Being honest about the limit: an assistant who is shown a password can write it down, and no product control prevents that. What this service provides is that they see one thing at a time, that every disclosure is recorded, that rotating a password cuts off whoever held the old one, and that revocation is instant.',
      'Our staff do not read your profile in the ordinary course of operating the service. The values are encrypted at rest, and each kind has exactly one piece of code able to decrypt it. Application logs are passed through a filter that removes credentials, keys and sensitive values before anything is written.',
    ],
  },
  {
    heading: 'AI providers',
    paragraphs: [
      'Drafting, scoring and transcription are done by Anthropic and OpenAI. What is sent is the material needed for that specific task: the job posting, the relevant part of your profile, and the question being answered.',
      'A sensitive value is sent only when a specific question genuinely requires it — and that decision is made by our code, not by the model. The model is shown field labels and proposes a match; the code validates that proposal before anything is read.',
      'Screenshots your assistant uploads have their metadata stripped before they leave us. A phone screenshot can carry GPS coordinates and a device serial, and none of that has anything to do with a job posting.',
      'You may supply your own provider keys instead, in which case your material goes to your own accounts under your own agreements with those providers. Keys you supply are write-only: nobody can read them back, including you.',
    ],
  },
  {
    heading: 'Where it is stored',
    paragraphs: [
      'The database and application run in the United Kingdom or the European Economic Area. AI providers process outside that area.',
      'A lawyer needs to state the transfer mechanism for that processing before this page is published. It is left blank rather than filled with a plausible-sounding clause.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'You can read everything we hold about you from inside the product — your profile, your applications and your access log are all screens, not a request you have to make.',
      'You can correct anything, at any time. You can delete your account, which deletes your profile, your credentials, your applications and your Q&A bank.',
      'Under UK GDPR you also have rights of access, rectification, erasure, restriction, portability and objection, and the right to complain to the Information Commissioner’s Office.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'Your data stays while your account is open. After you close it, application records are removed and the access log is retained for a limited period so that a question raised afterwards can still be answered.',
      'The exact periods need to be set by whoever takes legal responsibility for this service. They are not guessed at here.',
    ],
  },
  {
    heading: 'Changes, and getting in touch',
    paragraphs: [
      'Material changes will be notified in the product rather than by silently editing this page.',
      'The contact address for privacy questions goes here once the operating entity is registered.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="16 September 2026"
      intro="What this service stores, who can see it, what it refuses to store at any price, and how to get it back."
      notice={
        <>
          <strong>Draft — not yet reviewed by a solicitor.</strong> Everything
          here accurately describes how the system behaves today. What it is
          missing is legal rather than technical: the operating entity, an ICO
          registration, a named contact, the transfer basis for the AI providers
          and the retention periods. Those are marked in the text rather than
          filled in with something plausible.
        </>
      }
      sections={SECTIONS}
    />
  );
}
