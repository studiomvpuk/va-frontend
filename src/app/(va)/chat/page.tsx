'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, ChatBubble, FitScoreBadge } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { HelpLink } from '@/components/shell/help-link';
import { AccountMenu } from '@/components/shell/account-menu';
import { guessTitleAndCompany } from '@/lib/guess-posting';
import {
  ApiError,
  vaChat,
  type Application,
  type PolicyDecision,
} from '@/lib/api';
import { PRODUCT } from '@/lib/site';

/**
 * Screen 7 — the VA chat.
 *
 * The loop that gets used a hundred times a day: paste a posting, get a
 * verdict, ask for an answer, copy it, move on. Everything here is in service
 * of keeping that fast.
 */

interface Entry {
  id: string;
  role: 'va' | 'ai';
  body: string;
  flagged?: boolean;
  copyable?: string;
}

export default function VaChatPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [decision, setDecision] = useState<PolicyDecision | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  const push = useCallback((entry: Omit<Entry, 'id'>) => {
    setEntries((e) => [...e, { ...entry, id: `${Date.now()}-${e.length}` }]);
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  // The composer must never lose focus mid-exchange — a VA typing the next
  // question while an answer streams in should not have to click back.
  useEffect(() => {
    if (!busy) composer.current?.focus();
  }, [busy]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    push({ role: 'va', body: text });
    setInput('');
    setBusy(true);

    try {
      // A long paste is a job description; a short line is a question about the
      // one already on screen. Guessing this right is worth more than a mode
      // switch the VA has to remember to flip.
      if (!application || text.length > 400) {
        await assess(text);
      } else {
        await ask(text);
      }
    } catch (e) {
      push({
        role: 'ai',
        body:
          e instanceof ApiError
            ? e.message
            : 'Could not reach the server. Your message is still above — try again.',
        flagged: true,
      });
    } finally {
      setBusy(false);
    }
  }

  async function assess(jobDescription: string) {
    const { roleTitle, companyName } = guessTitleAndCompany(jobDescription);
    const result = await vaChat.assess({ companyName, roleTitle, jobDescription });

    setApplication(result.application);
    setDecision(result.decision);

    push({ role: 'ai', body: result.decision.summary });

    if (result.decision.verdict === 'SKIP') {
      push({
        role: 'ai',
        body: result.application.fitReasoning ?? 'No reasoning was recorded.',
      });
      return;
    }

    const draft = await vaChat.draft(result.application.id, { kind: 'COVER_LETTER' });
    push({ role: 'ai', body: draft.body, copyable: draft.body });
  }

  async function ask(questionText: string) {
    if (!application) return;

    const outcome = await vaChat.ask({ questionText, applicationId: application.id });

    if (outcome.disclosed) {
      push({
        role: 'ai',
        body: `${outcome.field.label}: ${outcome.value}`,
        copyable: outcome.value,
      });
      push({
        role: 'ai',
        body:
          'That was protected information, released because this question needed ' +
          'it. The account owner can see this in their log.',
        flagged: true,
      });
      return;
    }

    const draft = await vaChat.draft(application.id, {
      kind: 'SCREENING_ANSWER',
      questionText,
    });
    push({ role: 'ai', body: draft.body, copyable: draft.body });
  }

  return (
    <PageTransition>
      <div className="flex min-h-dvh flex-col bg-bg">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto flex h-[72px] max-w-app items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-pill bg-accent" />
              {/* Named for whose surface this is. An assistant signing in
                  should see their own workspace, not the Client's product with
                  a suffix bolted on. */}
              <span className="font-display text-lg font-bold text-ink">
                {PRODUCT.name}
                <span className="ml-2 font-body text-base font-normal text-ink-muted">
                  for assistants
                </span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <HelpLink />
              {/* No bell for an assistant: notifications are the Client's
                  record of what was disclosed, and none of them are addressed
                  to the VA. */}
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-app flex-1 flex-col gap-5 px-4 pb-40 pt-8 md:px-8">
          {application && decision && (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-6 py-5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-semibold text-ink">
                  {application.roleTitle}
                </span>
                <span className="truncate text-sm text-ink-muted">
                  {application.companyName}
                </span>
              </div>
              <FitScoreBadge
                score={decision.score}
                threshold={decision.threshold}
                variant="large"
              />
            </div>
          )}

          {entries.length === 0 && (
            <div className="rounded-lg border border-line bg-surface px-6 py-10 text-center">
              <p className="text-lg font-semibold text-ink">Paste a job description</p>
              <p className="mx-auto mt-2 max-w-prose text-ink-muted">
                You will get a fit score and, if it clears the threshold, a drafted
                answer you can paste straight into the application.
              </p>
            </div>
          )}

          {entries.map((entry) => (
            <ChatBubble
              key={entry.id}
              role={entry.role}
              flagged={entry.flagged}
              footer={entry.copyable ? <CopyButton text={entry.copyable} /> : undefined}
            >
              <span className="whitespace-pre-wrap">{entry.body}</span>
            </ChatBubble>
          ))}

          {busy && (
            <ChatBubble role="ai">
              <span className="text-ink-muted">Working on it…</span>
            </ChatBubble>
          )}

          <div ref={bottom} />
        </main>

        <form
          onSubmit={onSubmit}
          className="fixed inset-x-0 bottom-0 border-t border-line bg-bg px-4 py-4 md:px-8"
        >
          <div className="mx-auto flex max-w-app items-end gap-3">
            <textarea
              ref={composer}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter breaks the line. Pasting a multi-line
                // job description still works because paste is not a keypress.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void onSubmit(e as unknown as FormEvent);
                }
              }}
              rows={2}
              placeholder="Paste a job description, or ask a question…"
              aria-label="Message"
              className="flex-1 resize-none rounded-md border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted"
            />
            <Button type="submit" disabled={busy || !input.trim()}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="text-sm font-medium text-accent-text underline underline-offset-4"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

