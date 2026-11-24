# DevTrack agent workflow

The main Codex thread is the Orchestrator. Delegate implementation to the native
`develop` role and independent validation to the native `testing` role. Each
agent must read the repository instructions and its role file. Develop also
reads and follows Testing's directives before every assignment.

The Orchestrator owns requirements, architecture, backlog, acceptance criteria,
and integration. The human supervisor owns Git commits. Define small tasks
with testable criteria before assigning them. Keep application implementation with Develop and approval with
Testing. Obtain human authorization for external operations when needed.

Track work in docs/TASKS.md. Use PENDING → IN_PROGRESS → REVIEW → APPROVED.
On FAIL use REVIEW → REJECTED → IN_PROGRESS → REVIEW and route findings back
to Develop. Allow five correction iterations after the initial review, then
report the blocker. Record BLOCKED evidence without approving or advancing.
Only an independent PASS permits approval. Record actual agent IDs, iterations,
reports in docs/reports/, and commit references when available.

Phase 0 covers workflow setup only. Starting Phase 1 requires human approval.
