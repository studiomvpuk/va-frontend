/**
 * What each side is told, kept as data rather than as JSX.
 *
 * Two reasons. The page renders both audiences from one component, so the
 * layout is written once and cannot drift between them. And this is the text a
 * Client reads to find out exactly what their assistant is told about them —
 * which makes it worth being able to diff, and worth being somewhere other than
 * halfway down a component.
 */

export type Audience = 'client' | 'va';

export interface GuideSection {
  heading: string;
  /** The one-line answer, before the detail. */
  summary: string;
  body: string[];
}

export interface Guide {
  title: string;
  intro: string;
  sections: GuideSection[];
}

export const GUIDES: Record<Audience, Guide> = {
  client: {
    title: 'For you',
    intro:
      'You hired someone to do the applying. This is what they can see, what they cannot, and what still needs you.',
    sections: [
      {
        heading: 'Fill in your profile once',
        summary: 'Everything your assistant needs comes from here, not from you.',
        body: [
          'Your profile is the source your assistant works from. The more of it you fill in, the fewer questions come back to you.',
          'Each field is either general or sensitive. General values are used freely. Sensitive ones are encrypted, are never shown in a list, and are released one at a time — only when a specific application asks a question that genuinely needs that exact value, and every release is written to your log.',
          'Government ID numbers are the exception: National Insurance, Social Security, passport and NHS numbers are refused outright, however you mark them. There is no setting that turns this off. If a form needs one, fill it in yourself.',
        ],
      },
      {
        heading: 'Say where they can apply',
        summary: 'A site your assistant cannot reach is a site they cannot apply on.',
        body: [
          'Add the job boards you want used, and the account for each. Passwords are encrypted and are shown to an assistant one at a time, never as a list.',
          'When you bring on a new assistant, rotate the password on each site first. The old one stops working for whoever had it; the new one is what the new assistant gets.',
          'Your target roles are what fit scores are measured against — not a general idea of a good job. If the scores look wrong, that list is usually why.',
        ],
      },
      {
        heading: 'Choose what happens when they hit a gap',
        summary: 'Guess and tell you, or stop and ask you. It is one setting.',
        body: [
          'Sooner or later a form asks something your profile does not answer. You pick what happens then.',
          'Guess and proceed: the application goes out with the best answer your profile supports, and it lands in your queue to confirm or correct whenever suits. Nothing waits on you.',
          'Ask first: that application pauses, your assistant is told it is waiting on you, and you get an urgent notification. Your assistant carries on with other applications in the meantime.',
          'Changing this applies to the next question, not to anything already waiting. An application that paused under Ask first stays paused until you answer it — you asked to be consulted about that one, and switching a general preference later is not the same as answering it.',
        ],
      },
      {
        heading: 'Answer once, never again',
        summary: 'A question you have answered is not asked a second time.',
        body: [
          'When you confirm or correct an answer, it is kept. The next time the same question comes up — in different words, on a different job board — that answer is used without asking you.',
          'Correcting a guess is as good as writing one from scratch. It is the correction that gets kept.',
        ],
      },
      {
        heading: 'What this cannot do',
        summary:
          'An assistant who is shown a password can write it down. No product prevents that.',
        body: [
          'Everything here is built to limit what your assistant sees, record what they saw, and let you take it back. None of it makes misuse impossible — it makes it narrow, visible and reversible.',
          'A password shown on screen can be copied before the timer runs out. A sensitive value released for one application can be remembered. That is true of any arrangement where somebody applies on your behalf, and it would be dishonest to imply otherwise.',
          'What you get instead: they see one thing at a time rather than everything at once, every disclosure is in your log with a timestamp, rotating a password cuts off whoever had the old one, revoking access is immediate, and they have signed an agreement that names what the information may be used for. Those are the controls that make misuse attributable and recoverable.',
          'The practical advice that follows from this: use a separate account on each job board for this work rather than your personal one, and rotate its password when an assistant finishes.',
        ],
      },
      {
        heading: 'Watch what is happening',
        summary: 'The dashboard, and the log underneath it.',
        body: [
          'The dashboard shows what has gone out, what came back, and anything waiting on you.',
          'Underneath it is your access log: every sensitive value released, every password shown, and when. It is yours to read without asking anyone.',
          'When you mark an application as reaching interview, notes are prepared for it — what they are likely to ask, and what to make sure you say. Every line traces back to something in your profile or to a source you can open. If nothing could be verified, you get told that instead of a page of plausible filler.',
        ],
      },
    ],
  },

  va: {
    title: 'For your assistant',
    intro:
      'You are applying on someone else’s behalf. Here is how to get what you need, and what to do when you cannot.',
    sections: [
      {
        heading: 'Sign the agreement first',
        summary: 'Nothing opens until it is signed.',
        body: [
          'Before anything else, you sign a confidentiality agreement. Until you do, there is nothing to see — no profile, no passwords, no applications.',
          'It is not a formality. What you are agreeing to is that the information you are shown is used for these applications and nothing else, and that you do not keep copies.',
        ],
      },
      {
        heading: 'Paste the posting, get a verdict',
        summary: 'Do not judge the fit yourself — the score is the account holder’s own criteria.',
        body: [
          'Paste a job posting into the chat, or upload a screenshot of one. You get a fit score out of ten and a short reason.',
          'The score is measured against what the account holder said they want, not against whether it looks like a good job. A high score on a role you would not have picked is still a yes; a low score on an obvious-looking one is still a no.',
          'If a score is close to the line, open the reasoning. That is the case where it is worth a second look.',
        ],
      },
      {
        heading: 'Ask for what you need, when you need it',
        summary: 'Ask the question the form asks. You get the answer, not the file.',
        body: [
          'You will not be handed a profile to work from. Ask the assistant the question the form is asking, in the form’s own words, and you get an answer written for that question.',
          'Some answers include a personal detail. Those are released one at a time, for that question, and the account holder sees a record of each one. That is normal and expected — it is not something you are getting away with.',
          'You will not be given government ID numbers. They are not stored at all. If a form requires one, say so and the account holder will handle it.',
        ],
      },
      {
        heading: 'Passwords come one at a time',
        summary: 'Shown once, for one site, and the account holder sees that it happened.',
        body: [
          'When you need to sign in to a site, ask for that site. The password is shown to you once, and it is recorded.',
          'There is no list of every password. That is deliberate — the fewer you hold at once, the less there is to lose.',
        ],
      },
      {
        heading: 'When the assistant does not know',
        summary: 'Either you get a flagged best answer, or the application pauses. Neither is your problem to solve.',
        body: [
          'Some questions the profile simply does not answer. What happens next is the account holder’s setting, not your decision.',
          'If it guesses: you get an answer marked as a best effort, and the account holder is told. Use it and carry on.',
          'If it pauses: you are told the application is waiting, and the account holder has been notified. Move to another application and come back to it — it will unblock when they answer.',
          'Either way, do not fill the gap yourself. An answer you invented about someone else’s life is the one thing that cannot be undone once a form is submitted.',
        ],
      },
    ],
  },
};
