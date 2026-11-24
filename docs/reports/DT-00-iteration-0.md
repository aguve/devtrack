# DT-00 iteration 0 validation

**PASS.** Independent Testing reviewer `/root/testing`. Reviewed the Phase 0
working tree on `main` before the first commit.

| Acceptance criterion | Observed result |
| --- | --- |
| Configuration loads in the installed CLI | The persisted read-only strict-config smoke run exited 0 on Codex CLI 0.172.0. Both custom roles reported receiving their role-specific instructions. |
| Both custom roles run independently | The root rollout recorded separate `spawn_agent` calls with `agent_type=develop` and `agent_type=testing`. Separate child rollouts contain their completion messages and confirmed instruction reads. |
| Testing owns initial directives | Hosted Testing `/root/testing` explicitly read the repository and role definitions, created `agents/TESTING.md`, then read the file back. The directives preserve independent approval and define the required application quality gates. |
| Phase 0 scope | Working-tree status listed only workflow configuration and documentation. Explicit checks confirmed the absence of `package.json`, `app/`, and `src/`. |

## Evidence and commands

- Orchestrator ran `codex exec --strict-config --json -s read-only` with a
  Phase 0 smoke prompt and reported exit 0 for the persisted run. The recorded
  root session was `01a20d61-0bc9-7971-8a16-ce7d45b7eab9`.
- Testing ran `codex --version`, which exited 0 and returned `0.172.0`.
  Testing used `rg --files` to locate the session and Python JSON parsing
  to verify role requests, distinct child sessions, and final reports. Each
  evidence command exited 0.
- Develop `/root/develop_smoke`, session
  `01a20d61-335f-7c41-8eaf-e59961baa804`, reported reading `AGENTS.md`,
  `agents/DEVELOP.md`, and `agents/TESTING.md`.
- Testing `/root/testing_smoke`, session
  `01a20d61-238d-7380-9264-28ed2fd443df`, reported reading `AGENTS.md`
  and `agents/TESTING.md`.
- Testing read back the role TOML files and QA directives and ran
  `git status --short --untracked-files=all` and the scaffold absence checks.
  Each check exited 0.

## Attempts and remaining checks

The Orchestrator reported an initial startup failure on the read-only Codex
state directory and a subsequent ephemeral run that failed to spawn because
its rollout was unavailable. The approved persisted retry completed both role
checks. These were setup retries within iteration 0.

No Phase 0 acceptance defects require correction. Application lint, typecheck,
unit tests, integration tests, end-to-end tests, production build, and coverage
were outside this assignment and unexecuted. The working tree has no review
commit reference yet because Git author identity is unset.
