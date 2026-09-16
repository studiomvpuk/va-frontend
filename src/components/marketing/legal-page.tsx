import type { ReactNode } from 'react';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

/**
 * The frame for privacy and terms.
 *
 * Narrow measure, generous leading, numbered sections. These are documents
 * people scan for one clause rather than read, so the headings do the work and
 * the numbers make them quotable — "section 4" is a thing you can say to
 * somebody on the phone.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
  notice,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  /** The "this needs a lawyer" banner. */
  notice?: ReactNode;
}) {
  return (
    <main className="panel-dots mx-auto max-w-marketing px-4 pb-32 pt-16 md:px-8 md:pt-24">
      <header className="max-w-prose">
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-sm text-ink-muted">Last updated {updated}</p>
        <p className="mt-8 text-xl leading-normal text-ink-muted">{intro}</p>
      </header>

      {notice && (
        <div className="mt-10 max-w-prose rounded-lg border border-accent bg-accent-subtle px-6 py-5">
          <p className="text-base leading-normal text-accent-text">{notice}</p>
        </div>
      )}

      <div className="mt-14 flex max-w-prose flex-col gap-12">
        {sections.map((section, i) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl font-semibold">
              <span aria-hidden="true" className="mr-3 font-mono text-base text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.heading}
            </h2>

            <div className="mt-4 flex flex-col gap-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-normal text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            {section.list && (
              <ul className="mt-4 flex flex-col gap-3">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-normal">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-accent"
                    />
                    <span className="text-ink-muted">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
