'use client';

/**
 * The API client.
 *
 * Two deliberate decisions here:
 *
 * 1. The access token lives in a module variable, not localStorage. An XSS that
 *    can read localStorage gets a token it can exfiltrate and reuse for its full
 *    lifetime; a module variable dies with the tab. The trade-off is that a page
 *    refresh loses it — which is what the refresh cookie is for.
 *
 * 2. The refresh token is never touched by this code at all. It is an httpOnly
 *    cookie scoped to the refresh path, so JavaScript cannot read it by design.
 *    `credentials: 'include'` is what lets the browser attach it on refresh.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Internal: prevents a refresh loop when the refresh call itself 401s. */
  _retried?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, _retried, headers, ...rest } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // A 401 on a normal call means the 15-minute access token aged out. Try one
  // silent refresh, then replay. Only once — a second 401 means the session is
  // genuinely over and looping would just hammer the API.
  if (res.status === 401 && !_retried && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) return api<T>(path, { ...options, _retried: true });
  }

  if (!res.ok) throw await toApiError(res);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      setAccessToken(null);
      return false;
    }
    const data = (await res.json()) as { accessToken: string };
    setAccessToken(data.accessToken);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  let fieldErrors: Record<string, string> | undefined;

  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      // Nest's ValidationPipe returns an array of strings like
      // "password must be at least 12 characters". Map them back to fields so
      // the error lands under the input it belongs to.
      fieldErrors = {};
      for (const line of data.message) {
        const field = line.split(' ')[0];
        fieldErrors[field] ??= capitalise(line);
      }
      message = capitalise(data.message[0]);
    } else if (data.message) {
      message = data.message;
    }
  } catch {
    // A non-JSON error body (a gateway timeout page, say) keeps the default.
  }

  return new ApiError(res.status, message, fieldErrors);
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --------------------------------------------------------------- endpoints

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'CLIENT' | 'VA';
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

async function authenticate(path: string, body: unknown): Promise<AuthUser> {
  const result = await api<AuthResponse>(path, { method: 'POST', body });
  setAccessToken(result.accessToken);
  return result.user;
}

export const auth = {
  register: (input: { fullName: string; email: string; password: string }) =>
    authenticate('/auth/register', input),

  login: (input: { email: string; password: string }) =>
    authenticate('/auth/login', input),

  vaLogin: (input: { email: string; password: string }) =>
    authenticate('/auth/va/login', input),

  /** Called on app load to recover a session from the refresh cookie. */
  restore: async (): Promise<AuthUser | null> => {
    try {
      return await authenticate('/auth/refresh', undefined);
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api<void>('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },
};

// ------------------------------------------------------------- profile

export type Visibility = 'GENERAL' | 'SENSITIVE';

export interface ProfileField {
  id: string;
  key: string;
  label: string;
  visibility: Visibility;
  /** Always null for a SENSITIVE field — use `revealField`, which is audited. */
  value: string | null;
  hasValue: boolean;
  updatedAt: string;
}

export interface Profile {
  narrative: string;
  fields: ProfileField[];
}

export const profile = {
  get: () => api<Profile>('/profile'),

  setNarrative: (body: string) =>
    api<{ body: string }>('/profile/narrative', { method: 'PATCH', body: { body } }),

  createField: (input: {
    key: string;
    label: string;
    value: string;
    visibility: Visibility;
  }) => api<ProfileField>('/profile/fields', { method: 'POST', body: input }),

  updateField: (
    id: string,
    changes: { label?: string; value?: string; visibility?: Visibility },
  ) => api<ProfileField>(`/profile/fields/${id}`, { method: 'PATCH', body: changes }),

  /** Logged server-side as a disclosure, even though it is the owner reading. */
  revealField: (id: string) =>
    api<{ value: string }>(`/profile/fields/${id}/reveal`, { method: 'POST' }),

  deleteField: (id: string) =>
    api<void>(`/profile/fields/${id}`, { method: 'DELETE' }),
};

// ------------------------------------------------------------ settings

export interface Settings {
  minFitScore: number;
  gapMode: 'GUESS_AND_PROCEED' | 'ASK_FIRST';
  byokEnabled: boolean;
  whatsappEnabled: boolean;
}

export const settings = {
  get: () => api<Settings>('/settings'),
  update: (
    changes: Partial<Pick<Settings, 'minFitScore' | 'gapMode' | 'byokEnabled'>>,
  ) => api<Settings>('/settings', { method: 'PATCH', body: changes }),
};

// ---------------------------------------------------------------- vault

export interface Site {
  id: string;
  name: string;
  url: string;
  username: string;
  status: 'NOT_CONNECTED' | 'CONNECTED';
  hasPassword: boolean;
  rotatedAt: string | null;
  createdAt: string;
}

export interface RevealedCredential {
  revealId: string;
  siteName: string;
  username: string;
  password: string;
  expiresAt: string;
}

export type GateVerdict =
  | { allowed: true; reason: 'rotated_after_onboarding' | 'acknowledged' }
  | { allowed: false; reason: 'needs_rotation_or_acknowledgement' };

export const sites = {
  list: () => api<Site[]>('/sites'),

  create: (input: { name: string; url: string; username: string }) =>
    api<Site>('/sites', { method: 'POST', body: input }),

  update: (id: string, changes: Partial<Pick<Site, 'name' | 'url' | 'username'>>) =>
    api<Site>(`/sites/${id}`, { method: 'PATCH', body: changes }),

  remove: (id: string) => api<void>(`/sites/${id}`, { method: 'DELETE' }),

  /** Set or rotate. Never readable back — there is no GET counterpart. */
  setPassword: (id: string, password: string, rotate: boolean) =>
    api<Site>(`/sites/${id}/credential`, {
      method: 'PUT',
      body: { password, rotate },
    }),

  removePassword: (id: string) =>
    api<void>(`/sites/${id}/credential`, { method: 'DELETE' }),

  sharingStatus: (id: string, vaId: string) =>
    api<GateVerdict>(`/sites/${id}/sharing-status?vaId=${encodeURIComponent(vaId)}`),

  acknowledgeSharing: (id: string, vaId: string) =>
    api<void>(`/sites/${id}/acknowledge-sharing`, { method: 'POST', body: { vaId } }),
};

/** VA-facing. Three calls, and none of them lists credentials. */
export const vaVault = {
  sites: () =>
    api<Pick<Site, 'id' | 'name' | 'url' | 'username' | 'hasPassword'>[]>('/va/sites'),

  reveal: (siteId: string) =>
    api<RevealedCredential>(`/va/sites/${siteId}/reveal`, { method: 'POST' }),

  revealStatus: (revealId: string) =>
    api<{ superseded: boolean }>(`/va/sites/reveals/${revealId}/status`),
};

// ------------------------------------------------------------- targeting

export interface TargetRole {
  id: string;
  title: string;
  criteria: string | null;
}

export const targetRoles = {
  list: () => api<TargetRole[]>('/target-roles'),
  replace: (roles: { title: string; criteria?: string }[]) =>
    api<TargetRole[]>('/target-roles', { method: 'PUT', body: { roles } }),
};

// --------------------------------------------------------------- keyring

export interface ProviderKeyStatus {
  provider: 'ANTHROPIC' | 'OPENAI';
  configured: boolean;
  /** Last four characters. The key itself never comes back. */
  hint: string | null;
  updatedAt: string | null;
}

export const providerKeys = {
  status: () => api<ProviderKeyStatus[]>('/settings/keys'),
  set: (provider: 'ANTHROPIC' | 'OPENAI', key: string) =>
    api<void>(`/settings/keys/${provider}`, { method: 'PUT', body: { key } }),
  remove: (provider: 'ANTHROPIC' | 'OPENAI') =>
    api<void>(`/settings/keys/${provider}`, { method: 'DELETE' }),
};

// ------------------------------------------------------------- audit log

export interface AuditEvent {
  id: string;
  action: string;
  actorType: string;
  actorId: string;
  subjectType: string;
  subjectId: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

export const auditLog = {
  list: (params: { action?: string; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.action) q.set('action', params.action);
    if (params.limit) q.set('limit', String(params.limit));
    const suffix = q.toString() ? `?${q}` : '';
    return api<AuditEvent[]>(`/audit${suffix}`);
  },
};

// ------------------------------------------------------------- CV import

export interface CvSuggestions {
  narrative: string;
  fields: {
    key: string;
    label: string;
    value: string;
    suggestedVisibility: Visibility;
  }[];
  promptVersion: string;
  /** Proposed and then refused, with the reason. */
  dropped: { label: string; reason: string }[];
}

export const cvImport = {
  suggest: (text: string) =>
    api<CvSuggestions>('/profile/import-cv', { method: 'POST', body: { text } }),
};

// ---------------------------------------------------- assistants (VAs)

export interface VaSummary {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  revokedAt: string | null;
  invitePending: boolean;
  agreement: {
    signedAt: string;
    signedName: string;
    documentVersion: string;
    documentHash: string;
  } | null;
}

export interface Invitation {
  va: VaSummary;
  /** Shown once. Only its hash is stored, so it cannot be recovered. */
  inviteToken: string;
  expiresAt: string;
}

export interface SignatureVerification {
  verified: boolean;
  version: string | null;
  isCurrentVersion: boolean;
}

export const assistants = {
  list: () => api<VaSummary[]>('/vas'),

  invite: (input: { fullName: string; email: string }) =>
    api<Invitation>('/vas/invite', { method: 'POST', body: input }),

  resendInvite: (id: string) =>
    api<Invitation>(`/vas/${id}/resend-invite`, { method: 'POST' }),

  verifySignature: (id: string) =>
    api<SignatureVerification>(`/vas/${id}/agreement`),

  revoke: (id: string) => api<void>(`/vas/${id}`, { method: 'DELETE' }),

  restore: (id: string) => api<void>(`/vas/${id}/restore`, { method: 'POST' }),
};

// ------------------------------------------------------- VA onboarding

export interface AgreementText {
  version: string;
  title: string;
  body: string;
  effectiveFrom: string;
}

export const vaOnboarding = {
  acceptInvite: (input: { token: string; password: string }) =>
    api<{ id: string; email: string; fullName: string }>('/va/accept-invite', {
      method: 'POST',
      body: input,
    }),

  agreement: () => api<AgreementText>('/va/agreement'),

  sign: (input: { signedName: string; acknowledged: boolean }) =>
    api<{ signedAt: string; version: string }>('/va/agreement/sign', {
      method: 'POST',
      body: input,
    }),
};

// ------------------------------------------------------------ the VA loop

export type AppStatus =
  | 'SCORED' | 'SKIPPED' | 'IN_PROGRESS' | 'BLOCKED'
  | 'APPLIED' | 'INTERVIEW' | 'REJECTED' | 'OFFER';

export interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  fitScore: number | null;
  fitReasoning: string | null;
  seniorityVerdict: 'UNDER_LEVELLED' | 'MATCHED' | 'OVER_LEVELLED' | null;
  status: AppStatus;
  createdAt: string;
  appliedAt: string | null;
}

export interface PolicyDecision {
  verdict: 'APPLY' | 'SKIP' | 'BORDERLINE';
  threshold: number;
  score: number;
  summary: string;
  reasoningWorthReading: boolean;
}

export interface Draft {
  id: string;
  kind: 'CV' | 'COVER_LETTER' | 'SCREENING_ANSWER';
  questionText: string | null;
  body: string;
  orchestrationPath: string;
  promptVersion: string;
  createdAt: string;
}

export type DisclosureOutcome =
  | { disclosed: true; field: { key: string; label: string }; value: string; reason: string }
  | { disclosed: false; reason: string };

export const vaChat = {
  assess: (input: {
    companyName: string;
    roleTitle: string;
    jobDescription: string;
    siteId?: string;
  }) =>
    api<{ application: Application; decision: PolicyDecision }>('/va/chat/assess', {
      method: 'POST',
      body: input,
    }),

  draft: (
    applicationId: string,
    input: { kind: Draft['kind']; questionText?: string },
  ) =>
    api<Draft>(`/va/chat/applications/${applicationId}/draft`, {
      method: 'POST',
      body: input,
    }),

  drafts: (applicationId: string) =>
    api<Draft[]>(`/va/chat/applications/${applicationId}/drafts`),

  ask: (input: { questionText: string; applicationId?: string }) =>
    api<DisclosureOutcome>('/va/chat/ask', { method: 'POST', body: input }),

  extract: (input: { image: string; mediaType: string }) =>
    api<{ text: string }>('/va/chat/extract', { method: 'POST', body: input }),
};

export interface ApplicationStats {
  applications: number;
  interviews: number;
  waitingOnYou: number;
  averageFit: number;
}

export const applications = {
  /**
   * Aggregated server-side. The tracker below is paginated, so deriving these
   * from a page of it would describe the page rather than the account.
   */
  stats: () => api<ApplicationStats>('/applications/stats'),

  list: (params: { status?: AppStatus; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.limit) q.set('limit', String(params.limit));
    const suffix = q.toString() ? `?${q}` : '';
    return api<Application[]>(`/applications${suffix}`);
  },
  find: (id: string) => api<Application>(`/applications/${id}`),
  updateStatus: (id: string, status: AppStatus) =>
    api<Application>(`/applications/${id}/status`, { method: 'PATCH', body: { status } }),
};

// ---------------------------------------------- notifications & knowledge gaps

export interface Notification {
  id: string;
  kind: 'KNOWLEDGE_GAP' | 'CREDENTIAL_REVEAL' | 'AGREEMENT_SIGNED' | 'RATE_LIMIT' | 'SYSTEM';
  title: string;
  body: string;
  linkPath: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notifications = {
  list: (params: { unreadOnly?: boolean; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.unreadOnly) q.set('unreadOnly', 'true');
    if (params.limit) q.set('limit', String(params.limit));
    const suffix = q.toString() ? `?${q}` : '';
    return api<Notification[]>(`/notifications${suffix}`);
  },
  unreadCount: () => api<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) =>
    api<Notification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => api<{ unread: number }>('/notifications/read-all', { method: 'POST' }),
};

export interface KnowledgeGap {
  id: string;
  applicationId: string;
  questionText: string;
  /** Null when the Client's mode is ASK_FIRST — nothing was guessed. */
  bestEffortAnswer: string | null;
  clientAnswer: string | null;
  resolvedAt: string | null;
  createdAt: string;
  companyName: string;
  roleTitle: string;
  applicationStatus: AppStatus;
}

export const knowledgeGaps = {
  list: (params: { unresolvedOnly?: boolean; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.unresolvedOnly === false) q.set('unresolvedOnly', 'false');
    if (params.limit) q.set('limit', String(params.limit));
    const suffix = q.toString() ? `?${q}` : '';
    return api<KnowledgeGap[]>(`/knowledge-gaps${suffix}`);
  },

  /** Confirm the guess as-is, or replace it. Both are "the Client answered". */
  answer: (id: string, answer: string) =>
    api<KnowledgeGap>(`/knowledge-gaps/${id}/answer`, { method: 'POST', body: { answer } }),
};

// ---------------------------------------------------------- interview prep

export type PrepStatus = 'PENDING' | 'READY' | 'FAILED';

export type TalkingPointBasis =
  | { kind: 'profile_field'; key: string }
  | { kind: 'narrative' }
  | { kind: 'source'; url: string };

export interface TalkingPoint {
  point: string;
  /** Every point has one — unattributable points never reach the document. */
  basis: TalkingPointBasis;
}

export interface PrepDocument {
  id: string;
  applicationId: string;
  status: PrepStatus;
  failureReason: string | null;
  /** Null when nothing could be found about the company. Not an error. */
  companyBackground: string | null;
  likelyQuestions: { question: string; why: string }[];
  talkingPoints: TalkingPoint[];
  sources: string[];
  generatedAt: string | null;
  createdAt: string;
  companyName: string;
  roleTitle: string;
}

export const prep = {
  /**
   * 404 until the application reaches INTERVIEW — and also 404, deliberately,
   * for a VA token, so the existence of the document is not disclosed.
   */
  find: (applicationId: string) =>
    api<PrepDocument>(`/applications/${applicationId}/prep`),
};
