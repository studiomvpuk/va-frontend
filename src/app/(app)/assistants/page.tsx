'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardRow,
  EmptyState,
  Input,
  Modal,
} from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import {
  ApiError,
  assistants as api,
  type Invitation,
  type VaSummary,
} from '@/lib/api';

/**
 * Assistants — invite, status, revoke.
 *
 * The invitation link is shown once and then gone, because only its hash is
 * stored. The screen says so plainly rather than letting someone close the
 * dialog and go looking for it later.
 */
export default function AssistantsPage() {
  const [vas, setVas] = useState<VaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [revoking, setRevoking] = useState<VaSummary | null>(null);

  const reload = () =>
    api
      .list()
      .then(setVas)
      .catch((e: unknown) =>
        setError(e instanceof ApiError ? e.message : 'Could not load your assistants.'),
      );

  useEffect(() => {
    void reload().finally(() => setLoading(false));
  }, []);

  async function invite(input: { fullName: string; email: string }) {
    try {
      setInvitation(await api.invite(input));
      setInviting(false);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send that invitation.');
    }
  }

  async function revoke(va: VaSummary) {
    try {
      await api.revoke(va.id);
      setRevoking(null);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not revoke that access.');
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl text-ink">Assistants</h1>
            <p className="text-ink-muted">
              Who can apply on your behalf, and what they have agreed to
            </p>
          </div>
          <Button onClick={() => setInviting(true)}>+ Invite assistant</Button>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger bg-danger-subtle px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <Card label="VA agreements" bodyClassName="p-0">
          {loading ? (
            <p className="px-6 py-8 text-ink-muted">Loading…</p>
          ) : vas.length === 0 ? (
            <EmptyState
              title="No assistants yet"
              description="Invite someone to apply on your behalf. They sign a confidentiality agreement before they can see anything."
              action={<Button size="sm" onClick={() => setInviting(true)}>+ Invite assistant</Button>}
            />
          ) : (
            <StaggerList>
              {vas.map((va) => (
                <CardRow key={va.id}>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-ink">{va.fullName}</span>
                    <span className="truncate text-sm text-ink-muted">{va.email}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge va={va} />
                    {va.revokedAt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void api.restore(va.id).then(reload)}
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setRevoking(va)}>
                        Revoke
                      </Button>
                    )}
                  </div>
                </CardRow>
              ))}
            </StaggerList>
          )}
        </Card>

        <p className="max-w-prose text-sm text-ink-muted">
          Revoking ends an assistant&rsquo;s sessions immediately, not when their
          current login expires. What they agreed to keep confidential stays
          confidential afterwards.
        </p>

        <InviteModal open={inviting} onClose={() => setInviting(false)} onInvite={invite} />
        <InvitationModal invitation={invitation} onClose={() => setInvitation(null)} />
        <RevokeModal va={revoking} onClose={() => setRevoking(null)} onConfirm={revoke} />
      </div>
    </PageTransition>
  );
}

function StatusBadge({ va }: { va: VaSummary }) {
  if (va.revokedAt) return <Badge tone="danger">Revoked</Badge>;
  if (va.agreement) return <Badge tone="positive">Signed</Badge>;
  if (va.invitePending) return <Badge tone="warning">Invited</Badge>;
  return <Badge tone="neutral">Pending</Badge>;
}

function InviteModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (input: { fullName: string; email: string }) => Promise<void>;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Invite an assistant">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onInvite({ fullName: fullName.trim(), email: email.trim() });
        }}
      >
        <Input
          label="Full name"
          placeholder="e.g. Joy Emoredo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="them@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="They will need to sign the confidentiality agreement before seeing anything."
          required
        />
        <div className="flex gap-3">
          <Button type="submit">Create invitation</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function InvitationModal({
  invitation,
  onClose,
}: {
  invitation: Invitation | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!invitation) return null;

  const link = `${window.location.origin}/accept-invite?token=${invitation.inviteToken}`;

  return (
    <Modal open onClose={onClose} title={`Invitation for ${invitation.va.fullName}`}>
      <p className="mb-5 text-ink-muted">
        Send them this link. It works once and expires{' '}
        {new Date(invitation.expiresAt).toLocaleDateString()}.
      </p>

      <p className="mb-5 break-all rounded-md bg-surface-sunken px-4 py-3 font-mono text-sm text-ink">
        {link}
      </p>

      <p className="mb-6 rounded-md border border-accent-border bg-accent-subtle px-4 py-3 text-sm text-ink">
        Copy it now. Only a hash of this token is stored, so this screen is the
        one place it exists — if you lose it, issue a new invitation instead.
      </p>

      <div className="flex gap-3">
        <Button
          onClick={() => {
            void navigator.clipboard.writeText(link).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

function RevokeModal({
  va,
  onClose,
  onConfirm,
}: {
  va: VaSummary | null;
  onClose: () => void;
  onConfirm: (va: VaSummary) => Promise<void>;
}) {
  if (!va) return null;

  return (
    <Modal open onClose={onClose} title={`Revoke ${va.fullName}?`}>
      <p className="mb-6 text-ink-muted">
        Their sessions end immediately and they lose access to everything,
        including any password currently on their screen. You can restore them
        later. Anything they agreed to keep confidential still applies.
      </p>
      <div className="flex gap-3">
        <Button variant="danger" onClick={() => void onConfirm(va)}>
          Revoke access
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
