# DevTrack backlog

Phase 0 is the only authorized phase. The remaining entries are a proposed
sequence. Phase 1 will turn them into independently testable tasks.

| ID | Phase | Status | Proposed exit criteria |
| --- | --- | --- | --- |
| DT-00 | Native workflow setup | APPROVED | Config loads in the installed CLI, both custom roles run independently, Testing owns directives, and no application work begins. |
| DT-01 | Requirements and architecture | PENDING | Requirements, decisions and testable acceptance criteria recorded. |
| DT-02 | Project and test infrastructure | PENDING | Pinned app scaffold, all six scripts and test runners verified. |
| DT-03 | Database and RLS | PENDING | Versioned schema and owner-only CRUD verified using two users in a dedicated test database. |
| DT-04 | Authentication | PENDING | Registration, login, logout and protected access validated. |
| DT-05 | Issue management | PENDING | Validated owner-scoped CRUD, search and filters verified. |
| DT-06 | Board | PENDING | Responsive, keyboard-accessible Kanban and loading, empty and error states verified. |
| DT-07 | Regression | PENDING | Mandatory commands pass, core line coverage reaches 80%, and independent security review passes. |
| DT-08 | CI and deployment | PENDING | CI passes and production is reachable without a Vercel session. |
| DT-09 | Delivery | PENDING | Documentation, reports, repository and public URL delivered. Demo access delivered privately. |

## Proposed architecture

Use Next.js App Router with server-rendered authenticated pages and server
actions for mutations. Verify identity at the server boundary and validate
external values with Zod. Keep issue rules and query construction independent of
UI components and the Supabase adapter. Use Supabase Auth with cookie-backed
sessions and a user-scoped PostgreSQL client. Version the schema and owner RLS
policies in SQL migrations. Build a responsive Tailwind board with keyboard
operable issue actions.

Use Vitest and React Testing Library for core and component checks, dedicated
Supabase infrastructure for auth, CRUD and RLS integration tests, and Playwright
for critical browser journeys. Gate GitHub Actions on validation and the build.
Use free Vercel and Supabase plans and request human intervention where required
for credentials, provisioning and publishing.

## DT-00 history

PENDING → IN_PROGRESS → REVIEW → APPROVED. Testing issued PASS on iteration 0.
No correction iterations were required. See [the independent report](reports/DT-00-iteration-0.md).
The initial commit is pending a configured Git author identity.
