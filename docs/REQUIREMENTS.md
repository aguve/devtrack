# Requirements and acceptance criteria

Each row defines an observable acceptance criterion. Task assignments use these
identifiers to connect implementation and Testing evidence.

## Functional requirements

| ID | Requirement and acceptance |
| --- | --- |
| F01 | A visitor can register with email and password, complete email confirmation when required, and sign in. Invalid inputs receive actionable feedback and do not create a session. |
| F02 | A valid user can sign in, access the dashboard, and sign out. Anonymous or expired sessions cannot access dashboard data or mutate issues. Invalid sign-in provides a generic failure message. |
| F03 | An authenticated user can create, read, edit, and delete their issues. Successful changes persist across reloads. Cancelling deletion preserves the issue. Failed writes provide feedback without showing a successful change. |
| F04 | Each issue has a required title, optional description, priority low/medium/high, and status todo/in_progress/done. Blank titles, over-limit values, malformed IDs, and unsupported enum values are rejected at the server boundary. |
| F05 | The board shows issues in three status columns. A user can change status by keyboard and pointer. After saving, an issue appears only in its new column. |
| F06 | Case-insensitive literal substring search matches title or description. Status and priority filters combine with search by intersection. Clearing filters restores the unfiltered board. |
| F07 | The board communicates loading, first-use empty, no matching results, and recoverable errors. A list or write failure uses specific feedback appropriate to that action. |
| F08 | An ordinary demo user can sign in and exercise the core workflow on the production URL. Credentials are shared separately and absent from Git. |

## Non-functional requirements

| ID | Requirement and acceptance |
| --- | --- |
| N01 | Versioned migrations create UUID primary and owner foreign keys, constrained values, timestamps, and owner query indexes. Issuing edits advances updated_at and preserves created_at. |
| N02 | PostgreSQL RLS is enabled. Two ordinary authenticated users each succeed at own CRUD and cannot view, insert for, transfer to, edit, or delete rows belonging to the other user. Anonymous sessions receive no access. Negative tests verify persisted state. |
| N03 | Strict TypeScript, exact dependency versions, a committed lockfile, and Zod validation at external input boundaries. Access credentials are environment-bound and service-role credentials are absent from the browser and Git. |
| N04 | On narrow and wide screens, the board and forms remain operable without page-level horizontal overflow. Keyboard users can reach all actions, see focus, and receive usable labels and feedback. |
| N05 | Independent review records successful lint, typecheck, unit, integration, E2E, and production build commands at the release revision. Core business logic reaches at least 80% line coverage. No unresolved high or critical security defects or committed secrets. |
| N06 | CI runs mandatory gates with dedicated test data. Public production uses free plans, responds from a session without Vercel authentication, and has documented deployment and rollback steps. |
| N07 | The backlog and independent reports record task state, iteration, agent identifiers, observed results, and revision references when available. An independent PASS is required for approval. |
