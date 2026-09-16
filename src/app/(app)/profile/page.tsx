'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Slider,
  Textarea,
} from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import { SensitivityRow } from '@/components/profile/sensitivity-row';
import {
  ApiError,
  profile as profileApi,
  settings as settingsApi,
  type ProfileField,
  type Visibility,
} from '@/lib/api';

/**
 * Screen 2 — Profile & Sensitivity.
 *
 * "What the AI knows about you, and what stays protected."
 */
export default function ProfilePage() {
  const [fields, setFields] = useState<ProfileField[]>([]);
  const [narrative, setNarrative] = useState('');
  const [minFitScore, setMinFitScore] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyField, setBusyField] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [p, s] = await Promise.all([profileApi.get(), settingsApi.get()]);
        setFields(p.fields);
        setNarrative(p.narrative);
        setMinFitScore(s.minFitScore);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Could not load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveNarrative = useDebouncedSave(
    useCallback(async (body: string) => {
      await profileApi.setNarrative(body);
    }, []),
    setError,
  );

  const saveScore = useDebouncedSave(
    useCallback(async (value: number) => {
      await settingsApi.update({ minFitScore: value });
    }, []),
    setError,
  );

  async function toggleVisibility(field: ProfileField, next: Visibility) {
    setBusyField(field.id);
    setError(null);
    // Optimistic: the badge crossfades immediately. A failure reverts it.
    const previous = fields;
    setFields((fs) =>
      fs.map((f) =>
        f.id === field.id ? { ...f, visibility: next, value: next === 'SENSITIVE' ? null : f.value } : f,
      ),
    );
    try {
      const updated = await profileApi.updateField(field.id, { visibility: next });
      setFields((fs) => fs.map((f) => (f.id === field.id ? updated : f)));
    } catch (e) {
      setFields(previous);
      setError(e instanceof ApiError ? e.message : 'Could not update that field.');
    } finally {
      setBusyField(null);
    }
  }

  async function addField(input: { label: string; value: string }) {
    setError(null);
    const key = input.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    try {
      const created = await profileApi.createField({
        key: key || `field_${Date.now()}`,
        label: input.label,
        value: input.value,
        visibility: 'GENERAL',
      });
      setFields((fs) => [...fs, created]);
      setAdding(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not add that field.');
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl text-ink">Profile &amp; Sensitivity</h1>
          <p className="text-ink-muted">
            What the AI knows about you, and what stays protected
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger bg-danger-subtle px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <StaggerList className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card label="Experience">
            <Textarea
              value={narrative}
              onChange={(e) => {
                setNarrative(e.target.value);
                saveNarrative(e.target.value);
              }}
              placeholder="Describe your work experience and what you're looking for..."
              rows={8}
              aria-label="Experience"
            />
            <p className="mt-3 text-sm text-ink-muted">
              Write naturally. The AI reads this to answer screening questions in
              your voice.
            </p>
          </Card>

          <Card label="Minimum fit score">
            <p className="mb-5 font-display text-3xl font-bold text-positive">
              {minFitScore.toFixed(1)}
              <span className="text-lg text-ink-muted">/10</span>
            </p>
            <Slider
              value={minFitScore}
              onChange={(v) => {
                setMinFitScore(v);
                saveScore(v);
              }}
              label="Minimum fit score"
            />
            <p className="mt-4 text-sm text-ink-muted">
              Roles scoring below this are skipped automatically, so your VA does
              not have to ask about each one.
            </p>
          </Card>
        </StaggerList>

        <Card
          label="Fields &amp; sensitivity"
          bodyClassName="p-0"
          action={
            <Button size="sm" variant="secondary" onClick={() => setAdding((a) => !a)}>
              {adding ? 'Cancel' : '+ Add field'}
            </Button>
          }
        >
          {adding && <AddFieldForm onAdd={addField} />}

          {loading ? (
            <p className="px-6 py-8 text-ink-muted">Loading…</p>
          ) : fields.length === 0 ? (
            <EmptyState
              title="No fields yet"
              description="Add the details an application form asks for — current role, notice period, target salary. Flag anything you would rather your VA never see."
            />
          ) : (
            fields.map((field) => (
              <SensitivityRow
                key={field.id}
                field={field}
                busy={busyField === field.id}
                onToggle={(next) => void toggleVisibility(field, next)}
                onReveal={async () => (await profileApi.revealField(field.id)).value}
              />
            ))
          )}
        </Card>

        <p className="max-w-prose text-sm text-ink-muted">
          Sensitive fields are encrypted and never sent to your VA in a drafted
          answer unless a specific question genuinely needs them. Every time one
          is used, it is logged. Government ID numbers are not stored at all,
          even marked sensitive.
        </p>
      </div>
    </PageTransition>
  );
}

function AddFieldForm({
  onAdd,
}: {
  onAdd: (input: { label: string; value: string }) => Promise<void>;
}) {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  return (
    <form
      className="flex flex-col gap-4 border-b border-line px-6 py-5 md:flex-row md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (label.trim()) void onAdd({ label: label.trim(), value });
      }}
    >
      <Input
        label="Field name"
        placeholder="e.g. Notice period"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="md:w-64"
      />
      <Input
        label="Value"
        placeholder="e.g. One month"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="md" disabled={!label.trim()}>
        Add
      </Button>
    </form>
  );
}

/**
 * Saves 600ms after typing stops.
 *
 * A save-per-keystroke would mean a request per character and a rejected
 * government ID popping up mid-word; a manual save button means people lose
 * work. The in-flight ref stops a slow response overwriting a newer one.
 */
function useDebouncedSave<T>(
  save: (value: T) => Promise<void>,
  onError: (message: string) => void,
  delay = 600,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (value: T) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void save(value).catch((e: unknown) => {
          onError(e instanceof ApiError ? e.message : 'Could not save that change.');
        });
      }, delay);
    },
    [save, onError, delay],
  );
}
