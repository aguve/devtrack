# DevTrack backlog

Phase 5 is authorized. Phase 6 is outside the current scope.

| ID | Phase | Status | Proposed exit criteria |
| --- | --- | --- | --- |
| DT-00 | Native workflow setup | APPROVED | Config loads in the installed CLI, both custom roles run independently, Testing owns directives, and no application work begins. |
| DT-01 | Requirements and architecture | APPROVED | Functional and quality criteria, architecture, dependency-ordered backlog and Testing-owned strategy recorded. Phase 1 is documentation only. |
| DT-02 | Project and test infrastructure | APPROVED | Pinned app scaffold, all six scripts and test runners verified. |
| DT-03 | Database and RLS | APPROVED | Versioned schema and owner-only CRUD verified using two users in a dedicated test database. |
| DT-04 | Authentication | APPROVED | Registration, login, logout and protected access validated. |
| DT-05 | Issue management | APPROVED | Validated owner-scoped CRUD, search and filters verified. |
| DT-06 | Board | PENDING | Responsive, keyboard-accessible Kanban and loading, empty and error states verified. |
| DT-07 | Regression | PENDING | Mandatory commands pass, core line coverage reaches 80%, and independent security review passes. |
| DT-08 | CI and deployment | PENDING | CI passes and production is reachable without a Vercel session. |
| DT-09 | Delivery | PENDING | Documentation, reports, repository and public URL delivered. Demo access delivered privately. |

## Implementation tasks and acceptance

Tasks without a recorded status are PENDING. Each independently reviewed task needs its own
assignment, evidence, and verdict. A task starts after its listed dependencies
have passed and its phase is authorized.

| Task | Depends on | Acceptance evidence |
| --- | --- | --- |
| DT-02A Scaffold | DT-01 | Strict App Router and Tailwind scaffold, exact versions and lockfile. Clean npm install from lockfile, lint, typecheck and build pass. N03. |
| DT-02B Test harness | DT-02A | All six scripts exist. Vitest, RTL and Playwright execute representative checks. Coverage includes every core module. Dedicated Supabase target and test isolation are documented. N05–N06. |
| DT-03A Schema | DT-02B | Fresh isolated reset applies versioned migration. Integration checks cover owner reference, issue constraints, defaults and timestamps. N01. |
| DT-03B RLS | DT-03A | Dedicated integration suite proves own CRUD and cross-account denial with two users plus anonymous access. N02. |
| DT-04A Registration and sign-in | DT-03B | Integration and browser checks demonstrate registration, confirmation where required, successful login and invalid input feedback. F01–F02. |
| DT-04B Session protection | DT-04A | Dashboard and mutation entry points require verified sessions. Logout and protected navigation are confirmed in browser tests. F02. |
| DT-05A Issue commands | DT-04B | Validated create/edit/delete persist on reload, invalid input is rejected, and failures surface as errors. F03–F04. |
| DT-05B Issue queries | DT-05A | Integration checks cover owner-scoped reads, literal search of both fields, filter combinations and deterministic order. F03/F06. |
| DT-06A Board actions | DT-05B | Browser checks confirm status grouping, movement, issue actions and filters. F03/F05/F06. |
| DT-06B States and accessibility | DT-06A | Browser and component checks cover loading, empty, no matches, errors and keyboard/mobile interaction. F07/N04. |
| DT-07 Regression | DT-06B | Testing executes all mandatory commands and confirms coverage, authentication, CRUD, RLS, accessibility and security gates. N05. |
| DT-08A CI | DT-07 | GitHub Actions runs the mandatory commands against isolated test infrastructure and retains failure evidence. N06. |
| DT-08B Production | DT-08A | Human-authorized free deployment, production migrations applied, unauthenticated Vercel access verified and dedicated demo account validated. F08/N06. |
| DT-09 Delivery | DT-08B | Handoff includes public URL, GitHub repo, private demo credentials, setup and deployment documentation, decisions and limitations, and actual QA history. N07. |

## DT-00 history

PENDING → IN_PROGRESS → REVIEW → APPROVED. Testing issued PASS on iteration 0.
No correction iterations were required. See [the independent report](reports/DT-00-iteration-0.md).
The human supervisor owns Git commits.

## DT-01 history

PENDING → IN_PROGRESS → REVIEW → APPROVED. The Orchestrator prepared the
requirements, architecture, and backlog. Native Testing `/root/testing` authored
the test strategy and issued PASS on iteration 0 for the planning deliverables.
No correction iterations were required. [Independent report](reports/DT-01-iteration-0.md)

## DT-02 history

- DT-02A iteration 0 moved to IN_PROGRESS and was delegated to native Develop `/root/develop` from baseline `08371e2`.
- DT-02A iteration 0 moved to REVIEW after Develop submitted the scaffold. Develop reported successful clean installation, lint, typecheck, and production build. The build required approval for Turbopack to bind a local port.
- DT-02A iteration 0 moved to APPROVED after native Testing `/root/testing` returned PASS. Independent clean installation, lint, typecheck, build and Tailwind checks passed. [Validation report](reports/DT-02A-iteration-0.md)
- DT-02B iteration 0 moved to IN_PROGRESS and was delegated to native Develop `/root/develop`.
- DT-02B iteration 0 moved to REVIEW after Develop submitted the package wiring and Testing submitted the test-owned configuration and suites. During local validation, Develop found an SSR assertion that excluded a valid head element. Testing corrected the assertion before independent review. Develop reported all six commands passing after a clean lockfile install.
- DT-02B iteration 0 moved to APPROVED after native Testing `/root/testing` returned PASS. Independent clean install and all six commands passed. A temporary negative control confirmed that an unimported core file is measured and can fail the 80% gate. [Validation report](reports/DT-02B-iteration-0.md)
- Phase 2 is APPROVED. Both tasks received PASS on their first independent review. Phase 3 remains PENDING.

## DT-03 history

- DT-03A iteration 0 moved to IN_PROGRESS and was delegated to native Develop `/root/develop`. The Git baseline was `08371e2`, with approved Phase 2 work still in the working tree.
- DT-03A iteration 0 moved to REVIEW. Docker Desktop's socket was missing and the default daemon denied access. Develop started the official Supabase CLI native runtime in an isolated temporary project and reported a successful fresh local reset with the schema migration applied. Testing supplied guarded, rollback-only schema checks.
- DT-03A iteration 0 moved to APPROVED after native Testing `/root/testing` independently reset the native Supabase stack and returned PASS. The exact migration matched revision `1aa6f86`. Lint, typecheck, and both integration checks passed. [Validation report](reports/DT-03A-iteration-0.md)
- DT-03B iteration 0 moved to IN_PROGRESS and was delegated to native Develop `/root/develop`.
- DT-03B iteration 0 moved to REVIEW after Develop submitted the owner-policy migration and documented local setup. Develop reported both migrations applied and the expected grants and four policies present. Testing's pre-review live integration run passed all three tests with approved loopback access.
- DT-03B iteration 0 moved to APPROVED after native Testing `/root/testing` returned PASS on the database and RLS criteria. A fresh native reset and all three integration cases passed, including real two-user and anonymous API checks. Lint, typecheck, and the unit test also passed. The supplemental default Turbopack build was blocked by local worker bind permissions. The Webpack diagnostic build and both browser smoke checks passed. The default build remains required at the release gate. [Validation report](reports/DT-03B-iteration-0.md)
- Phase 3 is APPROVED. Both tasks received PASS on their first independent review. Phase 4 remains PENDING.
- Develop stopped the disposable native Supabase stack with exit 0 and verified removal of its generated credential files and logs. A startup diagnostic had briefly displayed disposable local keys in tool output. The stack was isolated and no production or Git credentials were involved.

## DT-04 history

- DT-04A iteration 0 moved to IN_PROGRESS. Native Develop `/root/develop` owns registration and sign-in implementation. Native Testing `/root/testing` owns test coverage and independent review. Baseline `1aa6f86` with Phase 3 changes staged by the human supervisor.
- DT-04A iteration 0 moved to REVIEW. Develop reported a successful Webpack production build and Chromium smoke with real Supabase Auth and Mailpit. Default Turbopack hit a local worker-port restriction. Testing supplied live integration, browser, and credential checks. Pre-review live integration and all five unit tests passed.
- DT-04A iteration 0 moved to APPROVED after Testing returned PASS. Lint and typecheck passed, along with five unit, four integration, and six browser checks. Testing corrected a test-owned assertion that misidentified a PKCE verifier as a session cookie and reran the browser suite. No application rejection. Default Turbopack build remained blocked by local worker-port permissions. [Validation report](reports/DT-04A-iteration-0.md)
- DT-04B iteration 0 moved to IN_PROGRESS and was delegated to native Develop `/root/develop`.
- DT-04B iteration 0 moved to REVIEW. Develop submitted the live session guard, refresh proxy, and logout action. Testing supplied independent session browser cases. Develop reported lint, typecheck, Webpack production build, and two focused browser checks passing.
- DT-04B iteration 0 moved to APPROVED after Testing returned PASS. Five unit checks, four live integration checks, and eight Chromium checks passed. Lint and typecheck passed. The Webpack production build passed and supported the browser suite. The default Turbopack command still failed on the local worker-port restriction. [Validation report](reports/DT-04B-iteration-0.md)
- Phase 4 is APPROVED. Both tasks passed on their first independent review. Phase 5 remains PENDING.
- Develop stopped the isolated Phase 4 Supabase stack with exit 0 and verified removal of its generated private environment and diagnostic files. The human supervisor's staged changes were preserved.

## DT-05 history

- DT-05A iteration 0 moved to IN_PROGRESS from baseline `c070c45`. Native Develop `/root/develop` owns issue-command implementation. Native Testing `/root/testing` owns the checks and independent review.
- DT-05A iteration 0 moved to REVIEW. Develop reported lint, typecheck, nine unit checks, four live integration checks, four focused Chromium checks, and a Webpack production build passing.
- DT-05A iteration 0 moved to APPROVED after Testing returned PASS. Independently ran nine unit, four live integration, and twelve Chromium checks. Core line coverage was 100% (18/18). Webpack production build passed and supplied E2E. Default Turbopack build remained blocked by local worker-port permissions. [Validation report](reports/DT-05A-iteration-0.md)
- DT-05B iteration 0 moved to IN_PROGRESS and was delegated to native Develop `/root/develop`.
- DT-05B iteration 0 moved to REVIEW. Develop reported lint, typecheck, 11 unit tests, five integration tests, and core query implementation complete. Testing corrected a database fixture typing error before independent review.
- DT-05B iteration 0 moved to APPROVED after Testing returned PASS. Independent checks passed for lint/typecheck, 11 unit, five live integration, and 14 browser runs. Core line coverage was 100% (23/23). The first browser review had two test locator issues, which Testing corrected and reran. No application fixes were needed. Webpack build passed. [Validation report](reports/DT-05B-iteration-0.md)
- Phase 5 is APPROVED. Both tasks received Testing PASS. Phase 6 remains PENDING.
