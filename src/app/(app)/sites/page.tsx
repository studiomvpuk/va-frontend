'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardRow,
  EmptyState,
  Input,
  Modal,
  Textarea,
} from '@/components/ui';
import { PageTransition, StaggerList } from '@/components/motion';
import {
  ApiError,
  sites as sitesApi,
  targetRoles as rolesApi,
  type Site,
  type TargetRole,
} from '@/lib/api';

/**
 * Screen 3 — Sites, Roles & Credentials.
 *
 * "Where your VA is allowed to apply, and with what account."
 *
 * The primary action on a connected site is Rotate password, not Edit. That is
 * deliberate: §7.4 makes rotation the thing that releases a credential to a
 * newly onboarded assistant, so it should be the obvious button rather than
 * something behind a menu.
 */
export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [roles, setRoles] = useState<TargetRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordFor, setPasswordFor] = useState<Site | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [s, r] = await Promise.all([sitesApi.list(), rolesApi.list()]);
        setSites(s);
        setRoles(r);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Could not load your sites.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveRoles = useDebounced(
    useCallback(async (text: string) => {
      const parsed = text
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title) => ({ title }));
      setRoles(await rolesApi.replace(parsed));
    }, []),
    setError,
  );

  async function addSite(input: { name: string; url: string; username: string }) {
    try {
      const created = await sitesApi.create(input);
      setSites((s) => [...s, created]);
      setAdding(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not add that site.');
    }
  }

  async function savePassword(site: Site, password: string) {
    const rotate = site.hasPassword;
    const updated = await sitesApi.setPassword(site.id, password, rotate);
    setSites((s) => s.map((x) => (x.id === site.id ? updated : x)));
    setPasswordFor(null);
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl text-ink">Sites, Roles &amp; Credentials</h1>
            <p className="text-ink-muted">
              Where your VA is allowed to apply, and with what account
            </p>
          </div>
          <Button onClick={() => setAdding(true)}>+ Add site</Button>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger bg-danger-subtle px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-ink-muted">Loading…</p>
        ) : sites.length === 0 ? (
          <Card bodyClassName="p-0">
            <EmptyState
              title="No sites yet"
              description="Add the job boards and career pages your VA may apply through. Anything not on this list is refused."
              action={<Button size="sm" onClick={() => setAdding(true)}>+ Add site</Button>}
            />
          </Card>
        ) : (
          <StaggerList className="flex flex-col gap-4">
            {sites.map((site) => (
              <Card key={site.id} bodyClassName="p-0">
                <CardRow className="border-b-0">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-lg font-semibold text-ink">
                      {site.name}
                    </span>
                    <span className="truncate text-sm text-ink-muted">
                      {site.hasPassword ? (
                        site.username
                      ) : (
                        <span className="text-accent-text">Not connected</span>
                      )}
                    </span>
                  </div>

                  <Button
                    size="md"
                    variant={site.hasPassword ? 'secondary' : 'primary'}
                    onClick={() => setPasswordFor(site)}
                  >
                    {site.hasPassword ? 'Rotate password' : 'Add credentials'}
                  </Button>
                </CardRow>
              </Card>
            ))}
          </StaggerList>
        )}

        <Card label="Target roles">
          <Textarea
            defaultValue={roles.map((r) => r.title).join('\n')}
            onChange={(e) => saveRoles(e.target.value)}
            placeholder="e.g. Junior Frontend Developer, Software Engineer (Entry-level)"
            rows={4}
            aria-label="Target roles"
          />
          <p className="mt-3 text-sm text-ink-muted">
            One per line. These are what every job posting is scored against — the
            same role can be a 7.5 for one person and a 4.0 for another.
          </p>
        </Card>

        <p className="max-w-prose text-sm text-ink-muted">
          Your VA sees the password for one site at a time, only when they are
          working on it, and only after you have rotated it or confirmed sharing.
          Every view is logged. You can rotate or revoke at any moment.
        </p>

        <AddSiteModal
          open={adding}
          onClose={() => setAdding(false)}
          onAdd={addSite}
        />
        <PasswordModal
          site={passwordFor}
          onClose={() => setPasswordFor(null)}
          onSave={savePassword}
        />
      </div>
    </PageTransition>
  );
}

function AddSiteModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (input: { name: string; url: string; username: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Add a site">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onAdd({ name: name.trim(), url: url.trim(), username: username.trim() });
        }}
      >
        <Input
          label="Site name"
          placeholder="Indeed UK"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="URL"
          placeholder="https://uk.indeed.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Input
          label="Account username"
          placeholder="you@email.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          hint="Not a secret — your VA needs to know which account to sign in as."
          required
        />
        <div className="flex gap-3">
          <Button type="submit">Add site</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PasswordModal({
  site,
  onClose,
  onSave,
}: {
  site: Site | null;
  onClose: () => void;
  onSave: (site: Site, password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rotating = site?.hasPassword ?? false;

  useEffect(() => {
    setPassword('');
    setError(null);
  }, [site]);

  if (!site) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={rotating ? `Rotate ${site.name} password` : `Connect ${site.name}`}
    >
      <p className="mb-6 text-ink-muted">
        {rotating
          ? 'Change the password on the site first, then paste the new one here. Any assistant currently looking at the old one is told it has changed.'
          : 'Where practical, use an account created for this purpose rather than one you use elsewhere — then nothing beyond this one site is ever exposed.'}
      </p>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaving(true);
          setError(null);
          void onSave(site, password)
            .catch((err: unknown) =>
              setError(
                err instanceof ApiError ? err.message : 'Could not save that password.',
              ),
            )
            .finally(() => setSaving(false));
        }}
      >
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Stored encrypted. No screen in this app will ever show it back to you."
          autoComplete="new-password"
          required
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !password}>
            {saving ? 'Saving…' : rotating ? 'Save new password' : 'Connect'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function useDebounced<T>(
  save: (value: T) => Promise<void>,
  onError: (message: string) => void,
  delay = 800,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback(
    (value: T) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void save(value).catch((e: unknown) =>
          onError(e instanceof ApiError ? e.message : 'Could not save that change.'),
        );
      }, delay);
    },
    [save, onError, delay],
  );
}
