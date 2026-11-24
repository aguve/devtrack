# DT-07 iteration 0 release regression

**PASS for DT-07.** Native Testing `/root/testing` independently verified
application revision `8ce7a25`. The only pre-report working-tree change
was the task log. Develop `/root/develop` prepared a disposable native
Supabase and Mailpit stack and reported a fresh reset. Testing verified
all three isolated migration files matched the repository byte for byte.

| N05 release criterion | Result |
| --- | --- |
| All six exact mandatory commands | PASS. The exact default Turbopack build completed and its output supplied Playwright. |
| Core line coverage at least 80% | PASS. 100% (27/27) across the four core modules using the configured untested-file inclusion. |
| Live Auth, CRUD, and RLS | PASS. Real confirmed registration, protected access, logout, refresh and revocation, issue changes across reloads, and bilateral owner isolation passed. Anonymous data access was denied. |
| UI regression and accessibility | PASS. Desktop and mobile Chromium exercised Kanban moves, search and combined filters, loading and error recovery, named controls, visible and restored keyboard focus, and 320px and 1280px layouts. |
| Security findings and secrets | PASS within the reviewed scope. No unresolved critical or high-severity issue was found. The production-only and full dependency audit returned zero advisories. The targeted secret checks found no common credential signatures in the candidate, Git history, or browser chunks. |

## Commands and actual results

| Command | Exit | Observation |
| --- | --- | --- |
| `npm run lint` | 0 | No lint diagnostics. |
| `npm run typecheck` | 0 | Next route type generation and strict TypeScript succeeded. |
| `npm run test` | 0 | 15 tests passed in six files. Core coverage was 100% (27/27 lines). |
| `npm run test:integration` with approved loopback access | 0 | Five tests passed in five files, including live Auth, schema, issue queries, and RLS. |
| `npm run build` with approved worker access | 0 | Next.js 16.4.6 Turbopack compiled, typechecked, and produced the production routes. No webpack override was used. |
| `npm run test:e2e` with approved loopback access | 0 | All 20 desktop and mobile Chromium runs passed against the exact build. |
| `npm audit --omit=dev --audit-level=high` with approved network access | 0 | Zero vulnerabilities reported. The initial sandbox request exited 1 on registry DNS resolution, then the approved retry succeeded. |
| `npm audit --audit-level=high` with approved network access | 0 | Zero vulnerabilities reported for the full dependency tree. |
| `git diff --check`, `git diff --cached --check`, and migration `diff -qr` | 0 | No whitespace diagnostics. Isolated migration files match the repository. |

## Defensive review findings

- Dashboard rendering and issue mutations verify a live Supabase identity.
  The proxy refreshes session cookies, and protected responses avoid shared
  caching. Browser checks verified production cookie attributes and
  denied use of revoked refresh credentials.
- The confirmation route validates the token and type, uses fixed
  redirects, and sends no-store and no-referrer headers. The server
  validates Auth, issue, and filter inputs through Zod.
- Insert ownership comes from the session. The database enforces RLS
  independently, and updates and deletes include owner predicates. The
  read RPC is security-invoker, uses a fixed search path and authenticated
  grant, scopes rows by owner, and uses literal substring search.
- The server-only Supabase client uses a publishable key. The repository's
  only tracked dotenv file is the placeholder example. Targeted scans
  included common key, JWT, and private-key forms and service-role references
  in browser JavaScript. No credentials were printed.

No mandatory check failed in the approved release run. The revoked-token
test emitted its expected Supabase diagnostic and successfully redirected to
login. Deployment, hosted CI, and production verification belong to DT-08.
