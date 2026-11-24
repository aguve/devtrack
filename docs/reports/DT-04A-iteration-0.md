# DT-04A iteration 0 validation

**PASS for DT-04A.** Native Testing `/root/testing` reviewed the Auth working
tree over `1aa6f86`, including the human supervisor's staged Phase 3 changes.
Develop `/root/develop` implemented the registration and sign-in flows.
Testing authored and independently ran the tests.

| Acceptance criterion | Result |
| --- | --- |
| F01 registration and confirmation | PASS. Isolated Supabase required email confirmation before password sign-in. Chromium desktop and mobile registered through the form, received the real Mailpit message, opened the local callback, and reached the protected dashboard. Before confirmation neither had a session cookie or dashboard access. |
| F01 invalid registration and confirmation | PASS. A short password produced actionable feedback without a session. The Auth API also rejected a short password. Invalid confirmation returned to sign-in with an invalid or expired link message. Unit tests exercised malformed email, the password length and UTF-8 byte limits, and confirmation token boundaries. |
| F02 correct and invalid sign-in | PASS for DT-04A scope. An independent browser context saw the generic incorrect-credentials error without a session, then signed in with the valid password and reached the dashboard. The direct integration verified the server returned the confirmed identity. |
| Auth configuration and session handling | PASS. Confirmed production-mode session cookies were HttpOnly, Secure, and SameSite Lax. Pending PKCE verifier cookies were HttpOnly. The callback uses validated inputs, fixed redirect targets, no-store caching, and no-referrer policy. The server-only client accepts a validated URL and publishable key. |

## Commands and results

| Command | Exit | Observation |
| --- | --- | --- |
| `npm run lint` | 0 | Clean before and after the test-harness adjustment. |
| `npm run typecheck` | 0 | Route type generation and strict TypeScript passed before and after the test-harness adjustment. |
| `npm run test` | 0 | Five unit and component tests passed. Current core line coverage was 100% (6/6). |
| `npm run test:integration` with approved local access | 0 | Four tests passed, covering live registration and sign-in, two-user RLS, schema, and home SSR. |
| `npm run build` | 1 | Default Turbopack could not bind a CSS worker port (EPERM), including with the approved invocation. |
| `npm run build -- --webpack` | 0 | The production build completed and generated the auth routes. This build supplied the browser server. |
| First `npm run test:e2e` with approved local access | 1 | Four passed and two failed on the same test-owned assertion described below. |
| `npm run test:e2e` after the assertion correction | 0 | Six passed across Chromium desktop and mobile. |
| `npm run test:e2e` with the added verifier check | 0 | Six passed again. Both pending verifier and authenticated cookie checks ran. |
| `git diff --check` and `git diff --cached --check` | 0 | No whitespace diagnostics. |

Targeted read-only scans also exited 0. They found no common credential
patterns in the candidate files and Git history and no service-role references
or credential patterns in emitted browser JavaScript.

## Harness correction and remaining release check

The first browser run rejected any cookie whose name contained `auth-token`.
At the time, this assertion was at
`tests/e2e/auth-registration.spec.ts:27`. Submitting a valid registration with
confirmation enabled reproduced the finding in both projects. Expected behavior
was no authenticated session. Actual behavior was an unauthenticated PKCE
verifier cookie with the same name prefix. Testing corrected the assertion
to recognize only session cookie names and added a direct pre-confirmation
dashboard check and cookie attribute assertions. This was a test-harness
defect of low severity. No application correction was required.

The pre-review focused Auth integration first encountered sandbox loopback
EPERM and then passed with approval. Tests used a disposable local Auth
and Mailpit environment and cleaned up their Auth fixtures. Logout and the
remaining protection cases belong to DT-04B. The exact default production build
remains open for release validation. No application acceptance defects
require correction for DT-04A.
