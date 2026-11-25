# DevTrack

DevTrack is a responsive issue tracker with a Kanban board, search, and
filters. It uses Next.js, TypeScript, Tailwind CSS, and Supabase for
authentication and persistent, user-isolated issues.

## Release

- [Public production application](https://devtrack-three.vercel.app)
- [GitHub repository](https://github.com/aguve/devtrack)
- Production source revision `baa62752e3d1c2ce7944086942ede9c60232fd25`

Evaluator demo access is shared separately through a private channel.

## Project documentation

- [Project specification](docs/PROJECT.md) and [acceptance criteria](docs/REQUIREMENTS.md)
- [Architecture, technical decisions, and limitations](docs/ARCHITECTURE.md)
- [Deployment and rollback guide](docs/DEPLOYMENT.md)
- [Native agent workflow](docs/AGENT_WORKFLOW.md) and [test strategy](docs/TEST_STRATEGY.md)
- [Backlog and iteration history](docs/TASKS.md)
- [Independent regression](docs/reports/DT-07-iteration-0.md),
  [hosted CI](docs/reports/DT-08A-iteration-0-hosted.md), and
  [production validation](docs/reports/DT-08B-iteration-0.md)

## Local setup

Use Node.js 22.22.1 or a compatible newer patch on the Node.js 22 line, and npm.

```sh
npm ci
cp .env.example .env.local
```

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `.env.local` using
the dedicated local Supabase stack described below. Run `npm run dev` and
open [http://localhost:3000](http://localhost:3000).

The local Supabase CLI loads the confirmation template and delivers signup
email to Mailpit. Hosted email verification settings are documented in the
[deployment guide](docs/DEPLOYMENT.md).

## Quality checks

Install the Chromium build pinned by Playwright once per machine. Use
`npx playwright install --with-deps chromium` on a supported Linux host that
also needs the system libraries.

Before running the integration and browser suites, configure the disposable
stack and export the variables in [the local test setup](#running-schema-and-rls-checks-locally)
from the same shell that will run these commands.

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

Export these variables from the dedicated local stack in the shell that runs
`npm run test:integration` and `npm run test:e2e`.

| Variable | Local test value |
| --- | --- |
| `DEVTRACK_DB_TEST` | `1` |
| `DEVTRACK_TEST_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `DEVTRACK_TEST_SUPABASE_ANON_KEY` | Local stack's anonymous JWT key |
| `DEVTRACK_TEST_SUPABASE_SERVICE_ROLE_KEY` | Local stack's service role JWT key, used in the test process for fixture setup and cleanup |
| `DEVTRACK_TEST_MAILPIT_URL` | Local Mailpit HTTP URL from the stack status |
| `SUPABASE_URL` | Same loopback URL as `DEVTRACK_TEST_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | The same disposable stack's publishable key |

After exporting the `DEVTRACK_TEST_*` values and `DEVTRACK_DB_TEST`, use these
exports for the browser suite. Replace the key placeholder with the local
stack's publishable key.

```sh
export SUPABASE_URL="${DEVTRACK_TEST_SUPABASE_URL:?Export the dedicated test API URL first}"
export SUPABASE_PUBLISHABLE_KEY='sb_publishable_REPLACE_WITH_LOCAL_KEY'
```

Playwright reads both app variables from its process environment and passes
them to the Next.js server it starts. The `.env.local` setup above serves
interactive Next.js development.

The reset recreates the dedicated local database and applies the versioned
migrations. Run it only against the disposable DevTrack test stack. The test
runner can use the DevTrack Docker database container directly. For a local
stack accessed through a host `psql` client, provide the dedicated loopback
connection string via the untracked `DEVTRACK_TEST_DB_URL` environment
variable as well as `DEVTRACK_DB_TEST=1`.
