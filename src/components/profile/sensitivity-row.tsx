'use client';

import { useState } from 'react';
import { Badge, Button, CardRow } from '@/components/ui';
import type { ProfileField, Visibility } from '@/lib/api';

/**
 * One row of the fields list.
 *
 * The badge is a button, not decoration — flagging a field is the primary
 * action on this screen and should not need a menu. Both badge states are the
 * same width (see Badge's `min-w`), so toggling crossfades colour without
 * moving the row, which is the Phase 2 acceptance criterion.
 */
export function SensitivityRow({
  field,
  onToggle,
  onReveal,
  busy,
}: {
  field: ProfileField;
  onToggle: (next: Visibility) => void;
  onReveal: () => Promise<string>;
  busy?: boolean;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const sensitive = field.visibility === 'SENSITIVE';

  async function reveal() {
    setRevealing(true);
    try {
      setRevealed(await onReveal());
    } finally {
      setRevealing(false);
    }
  }

  return (
    <CardRow>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-ink">{field.label}</span>

        {sensitive ? (
          revealed !== null ? (
            <span className="truncate font-mono text-sm text-ink-muted">{revealed}</span>
          ) : (
            <span className="text-sm text-ink-muted">
              {field.hasValue ? 'Value stored, hidden' : 'No value yet'}
            </span>
          )
        ) : (
          <span className="truncate text-sm text-ink-muted">
            {field.value || 'No value yet'}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {sensitive && field.hasValue && revealed === null && (
          <Button size="sm" variant="ghost" onClick={reveal} disabled={revealing}>
            {revealing ? 'Revealing…' : 'Reveal'}
          </Button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onToggle(sensitive ? 'GENERAL' : 'SENSITIVE')}
          aria-label={`${field.label} is ${sensitive ? 'sensitive' : 'general'}. Change.`}
          className="rounded-pill disabled:opacity-50"
        >
          <Badge tone={sensitive ? 'sensitive' : 'neutral'}>
            {sensitive ? 'Sensitive' : 'General'}
          </Badge>
        </button>
      </div>
    </CardRow>
  );
}
