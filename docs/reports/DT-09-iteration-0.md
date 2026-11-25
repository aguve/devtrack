# DT-09 iteration 0 handoff validation

**FAIL.** Native Testing `/root/testing` reviewed the delivery candidate
over release revision `baa62752e3d1c2ce7944086942ede9c60232fd25`.
The public application, source, and hosted quality evidence are available.
The local testing setup in the submitted README needs one correction.

| Acceptance criterion | Result |
| --- | --- |
| Public production URL | PASS. A credential-free HTTPS request returned DevTrack with HTTP 200. A fresh Chromium context confirmed the landing page and the redirect from the dashboard to app sign-in. |
| GitHub source and CI | PASS. The release commit contains all six required agent files, source code, lockfile, three migrations, three test suites, and the workflow. Hosted run `45488042668` completed successfully for the exact release SHA. |
| Private demo access | PASS for delivery readiness. The separate mode-600 credential file is readable and contains the required fields. Exact-value checks found neither field in the candidate files or Git history. DT-08B independently verified live demo access. |
| Deployment, technical decisions, limits, and QA history | PASS. Local documentation contains the required specifications, agent reproduction protocol, task and review history, deployment and rollback, and production limitations. All local Markdown link targets resolved. Final handoff documentation is local and awaiting the supervisor's commit and push. |
| Reproducible local setup and quality checks | FAIL. The README does not tell the reader to export the browser runner's two app configuration values in the invoking shell. |

## Required correction

**Medium severity, documentation.** Affects `README.md:35` and
`README.md:49`, and the local test environment table.

Follow the README by setting app configuration only in `.env.local`,
exporting the listed dedicated test values in the shell, then run
`npm run test:e2e`. Expected behavior is that the documented setup lets
the browser checks start with verified local app configuration. Actual
behavior by inspection is that the Playwright guard at
`tests/e2e/auth-registration.spec.ts:8` reads the invoking process
environment and throws when the two app values are only in the Next.js
env file. Other browser suites use the same process variables.

Document exporting both `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`
in the shell before the browser suite, with the URL matching the
dedicated test API and the key belonging to that disposable stack.
Cover these values in the local test setup and command prerequisites.

## Commands and results

- Read the repository and role directives, README, architecture, deployment,
  workflow, backlog, and validation reports.
- An independent Python inventory, local-link, and secret-value check
  exited 0. It verified the release tree, checked 24 Markdown source files,
  and printed no secret values.
- `gh run view 45488042668 --repo aguve/devtrack` exited 0 and returned
  `completed` and `success` with the exact release SHA.
- A scoped fresh-browser production program exited 0, verifying HTTP 200,
  the public home page, and dashboard redirection with a clean context.
- `git diff --check` and `git diff --cached --check` exited 0.

The browser environment defect was identified from the instructions, the
runner configuration, and the guard code. This delivery review did not
repeat the isolated automated suites already verified in DT-07 and DT-08A.
