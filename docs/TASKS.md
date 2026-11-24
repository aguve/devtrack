# DevTrack backlog

Phase 1 is authorized. The remaining entries define the proposed
sequence. Phase 2 requires human approval.

| ID | Phase | Status | Proposed exit criteria |
| --- | --- | --- | --- |
| DT-00 | Native workflow setup | APPROVED | Config loads in the installed CLI, both custom roles run independently, Testing owns directives, and no application work begins. |
| DT-01 | Requirements and architecture | APPROVED | Functional and quality criteria, architecture, dependency-ordered backlog and Testing-owned strategy recorded. Phase 1 is documentation only. |
| DT-02 | Project and test infrastructure | PENDING | Pinned app scaffold, all six scripts and test runners verified. |
| DT-03 | Database and RLS | PENDING | Versioned schema and owner-only CRUD verified using two users in a dedicated test database. |
| DT-04 | Authentication | PENDING | Registration, login, logout and protected access validated. |
| DT-05 | Issue management | PENDING | Validated owner-scoped CRUD, search and filters verified. |
| DT-06 | Board | PENDING | Responsive, keyboard-accessible Kanban and loading, empty and error states verified. |
| DT-07 | Regression | PENDING | Mandatory commands pass, core line coverage reaches 80%, and independent security review passes. |
| DT-08 | CI and deployment | PENDING | CI passes and production is reachable without a Vercel session. |
| DT-09 | Delivery | PENDING | Documentation, reports, repository and public URL delivered. Demo access delivered privately. |

## Implementation tasks and acceptance

All tasks below are PENDING. Each independently reviewed task needs its own
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
