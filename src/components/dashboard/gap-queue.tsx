'use client';

import { useState } from 'react';
import { Button, Card, EmptyState, Textarea } from '@/components/ui';
import { StaggerList } from '@/components/motion';
import type { KnowledgeGap } from '@/lib/api';

/**
 * The questions waiting on the Client.
 *
 * Two shapes, and the difference is the whole point of the two modes:
 *
 *   - A gap with a `bestEffortAnswer` already went out. The Client is
 *     confirming or correcting, and the primary action is "That's right" —
 *     one click, because most guesses will be fine and making them retype it
 *     is how a queue stops getting cleared.
 *   - A gap without one has an application paused behind it. There is nothing
 *     to confirm, so the only path is to write the answer.
 */
export function GapQueue({
  gaps,
  onAnswer,
}: {
  gaps: KnowledgeGap[];
  onAnswer: (id: string, answer: string) => Promise<void>;
}) {
  return (
    <Card label="Questions waiting on you" bodyClassName="p-0">
      {gaps.length === 0 ? (
        <EmptyState
          title="Nothing is waiting"
          description="When your assistant hits a question your profile does not answer, it lands here."
          className="px-6 py-12"
        />
      ) : (
        <StaggerList>
          {gaps.map((gap) => (
            <GapRow key={gap.id} gap={gap} onAnswer={onAnswer} />
          ))}
        </StaggerList>
      )}
    </Card>
  );
}

function GapRow({
  gap,
  onAnswer,
}: {
  gap: KnowledgeGap;
  onAnswer: (id: string, answer: string) => Promise<void>;
}) {
  const guessed = gap.bestEffortAnswer;
  const [editing, setEditing] = useState(guessed === null);
  const [draft, setDraft] = useState(guessed ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (answer: string) => {
    setSaving(true);
    setError(null);
    try {
      await onAnswer(gap.id, answer);
    } catch {
      setError('Could not save that. Try again.');
      setSaving(false);
    }
  };

  return (
    <article
      id={`gap-${gap.id}`}
      className="border-b border-line px-6 py-5 last:border-b-0"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-lg font-semibold text-ink">
          {gap.questionText}
        </p>
        <p className="text-sm text-ink-muted">
          {gap.roleTitle} · {gap.companyName}
        </p>
      </header>

      {guessed !== null && !editing && (
        <p className="mt-3 rounded-md bg-surface-sunken px-4 py-3 text-base text-ink">
          {guessed}
        </p>
      )}

      {guessed === null && !editing && (
        <p className="mt-3 text-base text-ink-muted">
          This application is paused until you answer.
        </p>
      )}

      {editing && (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="mt-3"
          aria-label={`Your answer to: ${gap.questionText}`}
          placeholder="Your answer"
        />
      )}

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {guessed !== null && !editing ? (
          <>
            <Button
              onClick={() => void submit(guessed)}
              disabled={saving}
            >
              That&rsquo;s right
            </Button>
            <Button variant="ghost" onClick={() => setEditing(true)} disabled={saving}>
              Correct it
            </Button>
          </>
        ) : (
          <Button
            onClick={() => void submit(draft.trim())}
            disabled={saving || draft.trim().length === 0}
          >
            {/* The wording says what actually happens next, which differs. */}
            {guessed === null ? 'Answer and resume' : 'Save correction'}
          </Button>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        Answered once — your assistant will not ask this again.
      </p>
    </article>
  );
}
