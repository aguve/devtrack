# DT-09 iteration 1 handoff validation

**PASS for the handoff candidate.** Native Testing `/root/testing` reviewed the
documentation correction made by native Develop `/root/develop` over local
commit `1d4ee28`. The application and workflow remain at the approved release
revision `baa62752e3d1c2ce7944086942ede9c60232fd25`.

| Acceptance criterion | Result |
| --- | --- |
| Reproducible local browser setup | PASS. The README now explicitly requires both application values in the shell running Playwright. The export block assigns the same loopback API URL as the disposable test stack and instructs the reader to use that stack's publishable key. |
| Source, production, and hosted evidence | PASS. The release inventory and live production checks passed in iteration 0. This review confirmed GitHub `main` still points to the exact hosted CI and deployed application revision. No source or workflow change was submitted in this correction. |
| Deployment, decisions, limitations, and actual QA history | PASS. The corrected documentation and reports contain the required handoff material and all local Markdown file targets resolved. |
| Private demo delivery | PASS for readiness. The private file remained mode 600 and readable. Exact credential value checks found no match in the candidate files or Git history. No values were printed. |

## Commands and actual results

- The README export block was evaluated by Bash with synthetic local
  inputs. A child Node process received matching loopback URLs and a
  distinct publishable key. The missing-URL control failed explicitly
  as intended. This verification wrapper exited 0.
- `npm run test:e2e -- --list` ran with the documented shell exports,
  exited 0, and discovered all 20 browser tests. This was a discovery check.
  The six hosted quality gates and live browser execution are recorded in the
  [hosted CI report](DT-08A-iteration-0-hosted.md).
- A read-only verification checked 25 Markdown source files and compared
  demo values against Git history and candidate files. It exited 0.
- `git ls-remote origin refs/heads/main` exited 0 and returned the exact
  release SHA. `git diff --check` and `git diff --cached --check` exited 0.

The iteration 0 README defect is resolved. No additional correction is
required. Final documentation and this QA report remain local pending the
supervisor's commit and push. The approved app source and hosted CI evidence
are already on GitHub.
