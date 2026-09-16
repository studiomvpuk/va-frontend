# Understudy — web

The Next.js front end. Two surfaces behind one deployment:

- **Client app** (`/dashboard`, `/profile`, `/sites`, `/applications`, `/assistants`, `/settings`) — the job seeker, who owns the data
- **Assistant app** (`/chat`, `/agreement`) — the hired VA, who sees answers rather than the profile behind them
- **Public pages** (`/`, `/pricing`, `/for-assistants`, `/privacy`, `/terms`)

The API is a separate repository and a separate deployment. This app never
holds the Client's context; it asks for it a question at a time.

## Running it

```bash
cp .env.example .env.local
npm install
npm run dev          # :3000
npm run storybook    # :6006 — the component inventory
```

`public/fonts/` needs `GeneralSans-Variable.woff2` from
<https://www.fontshare.com/fonts/general-sans>. It is not committed because the
licence is the publisher's to grant. Without it the headline weight falls back
to the system sans, which is legible but flatter.

The API must be running for anything behind a login to work; set
`NEXT_PUBLIC_API_URL` in `.env.local` to point at it.

## Checks

```bash
npm test          # vitest
npm run lint
npm run build
```

`src/lib/routes.ts` is the single route table. Its test asserts that every link
in the app resolves to a real route and that every route is reachable from
somewhere — so a page added without a way in, or a link to a page that no longer
exists, fails CI rather than shipping.

`src/styles/contrast.spec.ts` checks every foreground/background pair in the
design tokens against WCAG AA, including colours composited over a panel. A
palette change that drops a pair below 4.5:1 fails the build.

## Deploying

Vercel, from `main`. Set `NEXT_PUBLIC_API_URL` to the deployed API origin, and
make sure that origin is in the API's `WEB_ORIGIN` allowlist — CORS is an exact
match, never `*`.
