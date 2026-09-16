# Dependency overrides

`package.json` pins one transitive dependency above what its parent asks for.

| Package | Pinned | Why |
|---|---|---|
| `postcss` | `$postcss` | Next 15.5 vendors `postcss@8.4.31` under `node_modules/next/node_modules`, which carries two high-severity advisories: arbitrary file read via a crafted source-map comment, and path traversal in previous-source-map auto-loading. npm's suggested fix is `next@16`, a major upgrade. The advisories are all fixed within postcss's own 8.5.x line, so the override resolves them without moving frameworks. Everything else in the tree already resolved to 8.5.28; this only lifts Next's private copy. **Remove when Next's own dependency reaches 8.5.28 or later.**

`$postcss` rather than a literal range: postcss is also a direct devDependency here (Tailwind needs it), and npm refuses an override that contradicts a direct dependency. The `$` form means "whatever this project already asks for", so the two cannot drift apart — bumping the devDependency is the only place the version is written down. |

## Checking

```bash
npm audit --audit-level=high                       # must report zero
npm ls postcss                                      # every path on one version
npm run build                                       # postcss compiles the CSS; a
                                                    # bad pin fails here, loudly
```

All three run in CI.
