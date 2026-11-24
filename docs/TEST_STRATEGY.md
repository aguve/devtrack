# DevTrack test strategy

Testing maps each task's acceptance criteria to evidence and reviews the
submitted revision independently. See [Testing directives](../agents/TESTING.md)
for verdicts, report format, and correction handling.

## Commands and evidence

| Command | Required evidence |
| --- | --- |
| `npm run lint` | ESLint exits zero on repository code. |
| `npm run typecheck` | Strict TypeScript exits zero, including application and test code. |
| `npm run test` | Vitest and React Testing Library pass. The coverage report includes all designated core logic files, including untested files. Core line coverage is at least 80%. |
| `npm run test:integration` | The dedicated Supabase stack successfully applies migrations and passes auth, CRUD, integrity, and ownership checks. |
| `npm run test:e2e` | Playwright passes the required browser journeys against DevTrack and dedicated test services. |
| `npm run build` | The production Next.js build exits zero. |

During development, run checks relevant to the task and affected regressions.
Full regression and release require all six. Record exit codes, executed and
failed test counts, exact core coverage scope and percentage, and any skipped
checks with reasons. A missing browser, database, dependency, or credential
that prevents a mandatory check yields BLOCKED. An observed acceptance defect
or a failed quality check yields FAIL.

## Unit and component checks

- Cover issue validation, accepted status and priority values, rejected external
  values and boundary cases, optional descriptions, and search, filtering, and
  grouping behavior wherever implemented as core logic.
- Check component behavior by accessible role and name. Verify form feedback,
  status and priority selection, keyboard controls, and loading, empty, and error
  presentations. Include assertions for behavior and error paths alongside line
  coverage.

## Supabase integration and RLS

Use an isolated local or CI Supabase stack for database tests. Before a suite
creates fixtures, confirm the target belongs to the test environment. Use
disposable email identities and fresh sessions and clean up only the records
created by the suite. For signup confirmations, use the test environment's
mailbox or an explicitly documented test-only configuration. Keep production
data, deployment settings, and demo credentials out of automated test runs.

Test migration application from a clean test database. Verify valid owner CRUD
and persistence, required title and constrained values, foreign-key integrity,
and timestamp behavior. Verify signup, login, logout, and the resulting session
behavior.

| Session | Checks |
| --- | --- |
| Authenticated A and B, independently | Each account creates and reads its own issue, updates it, and deletes it. Verify persisted values through a fresh read. |
| A accessing B and B accessing A | The other user's issue stays absent from lists and direct reads. Attempts to update or delete it leave the row intact. |
| A and B supplying another owner | Reject inserts claiming the other account and updates transferring an owned issue. Verify ownership and data through the affected owner's session. |
| Anonymous | No issue disclosure or mutation across create, read, update, and delete. |

Perform ownership checks against the database API with ordinary authenticated
sessions. Verify state through the owner's session when violations result in
zero affected rows. Keep privileged fixture credentials server-side and out
of test logs, browser artifacts, and reports.

## Browser journeys

- Register and sign in, arrive at the protected dashboard, sign out, and confirm
  anonymous navigation to the dashboard returns to sign-in. Confirm invalid
  sign-in and invalid issue input show actionable feedback.
- Start with an empty board. Create an issue, edit its details, move it between
  statuses, reload to check persistence, and delete it. Verify Kanban placement,
  title and description search, combined status and priority filters, and
  the no-results state.
- Exercise loading and recoverable errors under controlled test conditions.
  Check keyboard access, visible focus, labels, and status feedback. Run at
  narrow and wide viewport sizes and verify the board and controls remain usable.

## CI and release

Run the gate scripts in GitHub Actions from a clean checkout using the lockfile
and a dedicated test stack. Make failures visible in the job result and retain
test summaries, coverage, and relevant Playwright diagnostics where safe.
Inspect the reviewed Git history, tracked configuration, and public build
configuration for secrets. Review authorization and dependency findings and
record any unresolved defects by severity.

Record the reviewed commit, CI run reference, gate results, coverage, browser
and database environments, and independent verdict. For deployment, verify the
production URL in a fresh browser context without Vercel authentication, check
that the dedicated demo account can reach the dashboard, and record the public
URL without including demo credentials.
