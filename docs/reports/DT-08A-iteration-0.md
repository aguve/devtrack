# DT-08A iteration 0 CI validation

**BLOCKED.** Native Testing `/root/testing` reviewed the uncommitted CI
candidate over `f907290`, implemented by native Develop `/root/develop`.
Workflow static checks and the independent local replay succeeded. No Git
remote was configured. Hosted runner execution and artifact delivery require
the supervisor to publish the reviewed workflow to GitHub and provide the
resulting run.

| Acceptance criterion | Result |
| --- | --- |
| Workflow defines the six mandatory gates | PASS locally. `actionlint` accepted the candidate. The replay ran every exact gate under CI mode. |
| Dedicated database setup and migration replay | PASS locally. Testing stopped the handoff stack and ran the workflow's startup, reset, status export, and PATH block. All three migrations applied and matched the repository byte for byte. |
| Credible failure evidence and artifact scope | PASS for generation and scope. The summary records outcomes, includes Playwright failure counts, and is configured to upload with coverage. A synthetic failure control preserved the failure status and count. Generated artifacts contained no test credential values. |
| GitHub-hosted runner and artifact | BLOCKED. There is no GitHub workflow run or downloaded artifact to inspect. Local replay used Ubuntu 26.04 and did not establish Ubuntu 24.04 provisioning or action-service execution. |

## Commands and results

| Command or check | Exit | Observation |
| --- | --- | --- |
| `actionlint .github/workflows/ci.yml` (1.7.12), exporter `node --check`, extracted Bash syntax check | 0 | No workflow or script syntax diagnostics. |
| `npm ci` using the local npm cache | 0 | 469 packages installed. The existing ESLint 9 support warning remains. |
| `npm run lint` and `npm run typecheck` | 0 | ESLint, route type generation, and strict TypeScript passed. |
| `npm run test` | 0 | 15 tests passed. Core line coverage 100% (27/27). |
| `npm run build` with approved worker access | 0 | The exact Turbopack production build succeeded. |
| Extracted workflow start/reset/status/export Bash block | 0 | Native Supabase CLI 3.3.0 started and reset the disposable project. Status and exporter logs were redirected to mode-600 files. The generated environment and bundled psql path were used by the local test steps. |
| `npm run test:integration` with the exported local environment | 0 | All five integration tests passed. |
| `npx playwright install --with-deps chromium --dry-run` | 1 | The local Ubuntu host lacked eight listed font or Xvfb packages. The system package install was not run on this host. The documented hosted command remains in the workflow. |
| `npx playwright install chromium` | 0 after approval | Initial sandbox attempt exited 1 because the existing browser cache was read-only. The scoped approved retry succeeded. |
| `npm run test:e2e` with the exported environment and `CI=true` | 0 | All 20 desktop and mobile Chromium runs passed against the exact build. |
| Extracted workflow summary block and artifact credential scan | 0 | Seven success rows, zero failed browser cases. No generated values for the DB URL, anonymous key, service key, or publishable key appeared in the selected files. |
| Exporter and summary negative controls | 0 | Five synthetic malformed or non-local inputs were rejected without any environment write. The synthetic one-failure browser result appeared in the summary. |
| Extracted workflow stop block, migration comparison, whitespace and isolated port checks | 0 | Local services stopped, workflow logs were removed, and job ports closed. |

The pinned checkout, Node setup, and artifact SHAs resolved to their stated
release commits. The workflow uses read-only repository permissions,
disables persisted checkout credentials, and exports only values validated as
belonging to the disposable loopback stack. Artifact paths exclude raw test
traces, logs, and status files. GitHub runner-side masking and upload were
reviewed against the documented interfaces and remain unexecuted on GitHub.

- [GitHub Actions workflow commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands)
- [GitHub Ubuntu 24.04 runner image](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
- [Playwright CI installation](https://playwright.dev/docs/ci)

No source defect requires a correction cycle based on these checks. To
close the blocker, the supervisor must publish the reviewed revision,
then Testing must inspect the hosted gate conclusions and
`quality-evidence` artifact for that revision.
