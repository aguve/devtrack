# Testing quality directives

## Ownership and review

Before each assignment, explicitly read `AGENTS.md` and this file. At bootstrap,
read this file immediately after creating it. Use the Orchestrator's task ID,
iteration, acceptance criteria, and submitted revision or working-tree scope.
Review the changed paths and trace the affected user flows before testing.

Testing owns this strategy, test cases, fixtures, testing configuration, and
validation reports. Send application defects to the Orchestrator for Develop to
correct. Keep acceptance criteria intact and preserve the strength of existing
tests. Obtain human approval before changing these directives after bootstrap.

## Validation strategy

- Map each acceptance criterion to a specific check and record the observed
  result. Review type safety, maintainability, error handling, and Zod validation
  of external input, including malformed and boundary cases.
- Use Vitest for core business logic and React Testing Library for component
  behavior. Enforce at least 80% line coverage of core business logic with
  coverage configured to include untested core files. Exercise negative cases
  and meaningful behavior alongside the numerical threshold.
- Run integration tests against a dedicated non-production Supabase environment.
  Verify registration and session behavior, persistence, CRUD, foreign keys,
  constraints, defaults, timestamps, and row-level security. Use two independent
  authenticated accounts and an anonymous session. Exercise both owners' CRUD
  and verify denial of cross-account reads, forged ownership inserts, ownership
  changes, updates, and deletes. Confirm the target row remains unchanged where
  denial is represented by zero affected rows. Exercise RLS with ordinary user
  sessions and isolate fixture creation and cleanup to the test environment.
- Use Playwright for critical journeys including sign-up, login, logout,
  protected navigation, issue CRUD, Kanban status changes, search, and combined
  filters. Check loading, empty, and error states. Verify keyboard operation,
  visible focus, accessible labels and feedback, and layout on narrow and wide
  viewports. Repeat the relevant checks after corrections to detect regressions.
- Review authentication and authorization at server and database boundaries.
  Inspect the submitted diff and relevant Git history for exposed credentials.
  Verify the browser bundle and public configuration contain no service role key
  or other privileged secret. Keep secrets out of reports and command logs.

## Commands and verdict

Once present, run the commands relevant to each task. All six are required for
full regression and release approval.

```sh
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build
```

Record actual exit status and summaries for each command. During setup phases,
record out-of-scope checks as unexecuted and explain why. Report **BLOCKED**
when missing dependencies, credentials, or infrastructure prevent a mandatory
check. Report **FAIL** for unmet criteria or observed defects that violate the
gate. Report **PASS** only when all checks required for the assignment have run
successfully and all acceptance criteria are met. Release approval also requires
the coverage threshold, no known unresolved critical or high-severity security
defects, and no committed secrets. Retest corrections independently and include
relevant regression checks.

## Report format

Record the report under `docs/reports/` and send it to the Orchestrator.

- Task ID, iteration, Testing agent ID when available, and reviewed commit or
  working-tree scope.
- Verdict of PASS, FAIL, or BLOCKED and the result for each acceptance criterion.
- Commands and actual results, test suites and cases executed, failures,
  coverage when applicable, and checks left unexecuted with reasons.
- Each defect's severity, file and line, reproduction steps, expected and
  actual behavior, and required correction.
- For a blocker, record the missing prerequisite and the validation it prevents.
