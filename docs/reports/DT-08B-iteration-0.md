# DT-08B iteration 0 production validation

**PASS.** Native Testing `/root/testing` verified public production and the
dedicated demo account after native Develop `/root/develop` provisioned
the approved release. The deployed application revision reported by
Develop is `baa62752e3d1c2ce7944086942ede9c60232fd25`, previously verified
by the [hosted CI run](https://github.com/aguve/devtrack/actions/runs/45488042668).

| Acceptance criterion | Production evidence |
| --- | --- |
| Authorized free-plan production | PASS. The Orchestrator and Develop reported an approved Vercel Hobby deployment in the personal scope and a dedicated Supabase Free project. Testing independently inspected the Vercel production target matching the stable alias. |
| Production migrations applied | PASS. Develop's remote migration push and migration list exited 0. Testing checked the generated list and verified matching local and remote IDs `20261124000100`, `20261124000200`, and `20261124000300`. |
| Public Vercel production access | PASS. The stable alias returned HTTP 200 with no cookies or authentication headers. An anonymous dashboard request redirected to DevTrack sign-in. A fresh headless Chromium context without Vercel cookies verified both behaviors. |
| Dedicated ordinary demo account | PASS. Using the private credentials, Chromium signed in, rendered all three production board columns, and signed out. The demo session had the ordinary `authenticated` role. A subsequent dashboard attempt redirected to sign-in. |
| Deployment and rollback guidance | PASS. The deployment guide covers production migration replay, configuration, alias and access verification, private demo delivery, and application and database rollback handling. |

## Commands and actual results

- Initial read-only environment and linkage checks exited 0. No local
  Vercel project, linked Supabase project, or production credentials were
  present at that time. Develop reported `vercel whoami` and
  `supabase projects list` each exited 1 and required authentication. The
  supervisor subsequently authorized and enabled provisioning.
- `npx --yes vercel@66.6.0 inspect https://devtrack-three.vercel.app`
  exited 0. It identified production deployment
  `devtrack-jxx8m2ibo-aguve.vercel.app` with Ready status and the public alias.
- A read-only parser confirmed the three paired migration versions in the
  CLI JSON log and exited 0. Preliminary parsing attempts assumed a table
  format and returned assertion errors. The final check verified the
  actual JSON fields.
- The standalone Node and Chromium production smoke check exited 0
  twice. The second run added verification of the ordinary role claim
  without printing the claim payload, password, or tokens. Both used
  a mode-600 credential file and disabled diagnostic credential output.
- `git ls-files '.env*' '.vercel/*'` showed only `.env.example`.
  `git diff --check` exited 0.

The release uses immediate sign-up sessions with email confirmation disabled,
as configured by Develop under supervisor authorization. Live production
registration was outside the authorized read-only demo smoke scope. Issue
create, edit, move, delete, and RLS were validated against isolated data in
hosted CI. The smoke check performed no production issue writes.

[Public production alias](https://devtrack-three.vercel.app)
