'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input, Toggle } from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import {
  ApiError,
  providerKeys as keysApi,
  settings as settingsApi,
  type ProviderKeyStatus,
  type Settings,
} from '@/lib/api';

/**
 * Screen 4 — Model & API Settings.
 *
 * Two switches that change materially different things: what happens when the
 * AI is unsure, and who pays for the call. Both get a sentence explaining the
 * consequence, because neither is guessable from its label.
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [keys, setKeys] = useState<ProviderKeyStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [s, k] = await Promise.all([settingsApi.get(), keysApi.status()]);
    setSettings(s);
    setKeys(k);
  }, []);

  useEffect(() => {
    void load()
      .catch((e: unknown) =>
        setError(e instanceof ApiError ? e.message : 'Could not load your settings.'),
      )
      .finally(() => setLoading(false));
  }, [load]);

  async function patch(changes: Partial<Settings>) {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, ...changes });
    setError(null);
    try {
      setSettings(await settingsApi.update(changes));
    } catch (e) {
      setSettings(previous);
      setError(e instanceof ApiError ? e.message : 'Could not save that change.');
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <p className="text-ink-muted">Loading…</p>
      </PageTransition>
    );
  }

  const byokOn = settings?.byokEnabled ?? false;
  const missingKeys = byokOn && keys.some((k) => !k.configured);

  return (
    <PageTransition>
      <div className="mx-auto flex max-w-prose flex-col gap-8">
        <h1 className="text-4xl text-ink">Model &amp; API Settings</h1>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger bg-danger-subtle px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <StaggerList className="flex flex-col gap-6">
          <Card bodyClassName="p-0">
            <div className="border-b border-line px-6 py-5">
              <Toggle
                checked={settings?.gapMode === 'GUESS_AND_PROCEED'}
                onChange={(on) =>
                  void patch({ gapMode: on ? 'GUESS_AND_PROCEED' : 'ASK_FIRST' })
                }
                label="When the AI is uncertain"
                description="Guess and proceed, vs. ask you first."
              />
              <p className="mt-3 text-sm text-ink-muted">
                {settings?.gapMode === 'GUESS_AND_PROCEED'
                  ? 'Applications complete with a best-effort answer and get flagged for you to correct later. Nothing waits on you.'
                  : 'The application pauses and your VA waits until you answer. More accurate, slower.'}{' '}
                Either way, the change applies to the next question your VA hits —
                not to anything already in flight.
              </p>
            </div>

            <div className="px-6 py-5">
              <Toggle
                checked={byokOn}
                onChange={(on) => void patch({ byokEnabled: on })}
                label="Bring your own API key"
                description="Pay Anthropic/OpenAI directly instead of platform billing."
              />
              {missingKeys && (
                <p className="mt-3 rounded-md border border-accent-border bg-accent-subtle px-4 py-3 text-sm text-ink">
                  This is switched on but at least one key is missing, so those
                  requests will fail rather than quietly fall back to platform
                  billing. Add the keys below, or switch it back off.
                </p>
              )}
            </div>
          </Card>

          {keys.map((key) => (
            <ProviderKeyField
              key={key.provider}
              status={key}
              onSaved={() => void load()}
              onError={setError}
            />
          ))}
        </StaggerList>

        <p className="text-sm text-ink-muted">
          Keys are encrypted before storage and no screen in this app will show
          one back to you — not even this one. If you lose a key, replace it.
        </p>
      </div>
    </PageTransition>
  );
}

function ProviderKeyField({
  status,
  onSaved,
  onError,
}: {
  status: ProviderKeyStatus;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const label = status.provider === 'ANTHROPIC' ? 'Anthropic API key' : 'OpenAI API key';
  const placeholder = status.provider === 'ANTHROPIC' ? 'sk-ant-••••••••' : 'sk-••••••••';

  async function save() {
    setSaving(true);
    try {
      await keysApi.set(status.provider, value.trim());
      setValue('');
      onSaved();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not save that key.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await keysApi.remove(status.provider);
      onSaved();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not remove that key.');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label={label}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        hint={
          status.configured
            ? `A key ending ${status.hint} is stored. Saving replaces it.`
            : 'No key stored.'
        }
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void save()} disabled={saving || value.length < 20}>
          {saving ? 'Saving…' : status.configured ? 'Replace' : 'Save'}
        </Button>
        {status.configured && (
          <Button size="sm" variant="ghost" onClick={() => void remove()}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
