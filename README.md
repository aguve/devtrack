# DevTrack

DevTrack is a developer issue tracker built with Next.js, TypeScript, and
Tailwind CSS. DevTrack uses Supabase Auth for registration and sign-in.

## Local setup

Use Node.js 22.22.1 or a compatible newer patch on the Node.js 22 line, and npm.

```sh
npm ci
cp .env.example .env.local
```

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `.env.local` using
the dedicated local Supabase stack described below. Run `npm run dev` and
open [http://localhost:3000](http://localhost:3000).

Set the hosted Supabase Auth Site URL to the production application origin and copy
`supabase/templates/confirmation.html` into the hosted Confirm signup
template when configuring deployment. Locally, the CLI loads the template
and delivers signup email to its Mailpit inbox.

## Quality checks

Install the Chromium build pinned by Playwright once per machine. Use
`npx playwright install --with-deps chromium` on a supported Linux host that
also needs the system libraries.

```sh
npx playwright install chromium
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npm run test:e2e
```

The unit command runs Vitest and React Testing Library with V8 coverage.
Put framework-independent business rules under `src/core/`, the designated
coverage scope. Coverage is reported in `coverage/`; the 80% line threshold
applies as business logic is introduced.

The integration command includes database checks. Run the build before the
browser suite so Playwright can start the production server on loopback.
If a managed sandbox blocks Turbopack's local worker port, run
`npm run build -- --webpack` to build for browser checks in that sandbox.
For browser confirmation checks, start the dedicated test stack with
`auth.site_url` set to `http://127.0.0.1:3100` and supply its Mailpit URL as
`DEVTRACK_TEST_MAILPIT_URL`. Return the local development site URL to
`http://localhost:3000` when you resume interactive development.

The [GitHub Actions workflow](.github/workflows/ci.yml) runs these gates on
pull requests and pushes to `main`. It starts and resets a disposable local
Supabase stack on the runner and uses Mailpit for confirmation email. The
job summary and short-lived coverage artifact contain the gate outcomes.

## Supabase test isolation

Run migration, database, and authentication tests against a dedicated local
Supabase stack or an isolated CI stack with its own URL, database, authentication users,
and credentials. Confirm the target is dedicated before applying migrations,
resetting data, or creating fixtures. Keep production and demo accounts out
of test runs.

Supply test credentials through local untracked environment files or CI
secrets for the isolated stack. Use disposable users with independent sessions,
and clean up the records created by the suite. Keep privileged fixture
credentials server-side and out of logs and browser artifacts.

See [the test strategy](docs/TEST_STRATEGY.md) for required database checks
and [the agent workflow](docs/AGENT_WORKFLOW.md) for the independent review
process.

### Running schema and RLS checks locally

Start a Docker-compatible engine and use the pinned Supabase CLI from the
repository root. The local project ID is `devtrack-local`, and the API and
database ports are 54321 and 54322.

```sh
npx --yes supabase@3.3.0 start
npx --yes supabase@3.3.0 db reset --local
```

Supply these variables from the dedicated local stack in a private shell
environment, then run `npm run test:integration`.

| Variable | Local test value |
| --- | --- |
| `DEVTRACK_DB_TEST` | `1` |
| `DEVTRACK_TEST_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `DEVTRACK_TEST_SUPABASE_ANON_KEY` | Local stack's anonymous JWT key |
| `DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY` | Local stack's service role JWT key, used in the test process for fixture setup and cleanup |

The reset recreates the dedicated local database and applies the versioned
migrations. Run it only against the disposable DevTrack test stack. The test
runner can use the DevTrack Docker database container directly. For a local
stack accessed through a host `psql` client, provide the dedicated loopback
connection string via the untracked `DEVTRACK_TEST_DB_URL` environment
variable as well as `DEVTRACK_DB_TEST=1`.
