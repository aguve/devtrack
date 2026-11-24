# DevTrack

DevTrack is a developer issue tracker built with Next.js, TypeScript, and
Tailwind CSS. The current scaffold serves a home page and provides the test
runners for the planned Supabase-backed application.

## Local setup

Use Node.js 22.22.1 or a compatible newer patch on the Node.js 22 line, and npm.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

The integration command runs a scaffold smoke suite. The browser command
exercises the same scaffold in Chromium. Run the build before the browser
suite so Playwright can start the production server on loopback.

## Supabase test isolation

The scaffold smoke suites require no Supabase credentials. When migration and
database tests are added, run them against a dedicated local Supabase stack
or an isolated CI stack with its own URL, database, authentication users,
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

### Running the schema checks locally

Start a Docker-compatible engine and use the pinned Supabase CLI from the
repository root. The local project ID is `devtrack-local`, and the API and
database ports are 54321 and 54322.

```sh
npx --yes supabase@3.3.0 start
npx --yes supabase@3.3.0 db reset --local
DEVTRACK_DB_TEST=1 npm run test:integration
```

The reset recreates the dedicated local database and applies the versioned
migrations. Run it only against the disposable DevTrack test stack. The test
runner can use the DevTrack Docker database container directly. For a local
stack accessed through a host `psql` client, provide the dedicated loopback
connection string via the untracked `DEVTRACK_TEST_DB_URL` environment
variable as well as `DEVTRACK_DB_TEST=1`.
