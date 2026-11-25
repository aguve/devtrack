# DT-08A iteration 0 hosted follow-up

**PASS.** Native Testing `/root/testing` verified the GitHub-hosted run
for `baa62752e3d1c2ce7944086942ede9c60232fd25` after the supervisor published
the candidate. This closes the hosted-evidence blocker in the
[initial validation report](DT-08A-iteration-0.md). No application or workflow
correction was required.

| Acceptance criterion | Hosted evidence |
| --- | --- |
| Workflow ran for the reviewed revision | PASS. Push to `main` launched run `45488042668`. The run and Quality gates job `138778577666` completed successfully. |
| All six mandatory gates ran | PASS. GitHub reported success for lint, typecheck, unit and coverage, the default production build, integration, and browser steps. The browser annotation reported 20 passes in 41.1 seconds. |
| Dedicated infrastructure ran and stopped | PASS. Hosted setup, isolated Supabase and Mailpit startup, Chromium with system dependencies, and isolated stack cleanup all completed successfully. |
| Evidence was retained | PASS. The hosted `quality-evidence` artifact downloaded and contained only the generated summary and coverage report. The summary showed seven success rows and zero browser failures. Core line coverage was 100% (27/27) with all four core modules represented. |
| Evidence excludes credential material | PASS for targeted inspection. None of the 18 files matched common Supabase key, JWT, or private-key signatures. There were no links, raw logs, traces, or environment files. |

## Commands and actual results

- `gh run list --repo aguve/devtrack --branch main` exited 0 and returned
  the run tied to the exact reviewed SHA.
- `gh run watch 45488042668 --repo aguve/devtrack --exit-status` exited 0
  with the Quality gates job successful.
- `gh run view 45488042668 --repo aguve/devtrack` exited 0 and returned
  success for each hosted step and the exact SHA.
- `gh run download 45488042668 --repo aguve/devtrack --name quality-evidence`
  exited 0. Testing inspected the downloaded artifact as files in a private
  temporary directory and did not execute the coverage HTML.
- Two preliminary inspection assertions exited 1 due to assumptions about
  the number of generated files and the HTML quote style. The revised
  read-only checks exited 0 after verifying actual contents and structure.
  These local inspection fixes did not change the hosted workflow or run.

[Hosted run and artifact](https://github.com/aguve/devtrack/actions/runs/45488042668)
