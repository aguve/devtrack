# DT-03A iteration 0 validation

**PASS.** Testing reviewer `/root/testing` verified the working tree submitted
by Develop `/root/develop`, initially over `08371e2`. The reviewed migration,
README, and suites matched commit `1aa6f86` by the end of review. Testing
authored the schema harness and independently ran the replay and checks.

| Acceptance criterion | Result |
| --- | --- |
| Fresh dedicated reset applies versioned migration | PASS. Supabase CLI 3.3.0 local reset exited zero and logged application of `20261124000100_create_issues.sql`. The isolated project migration was byte-for-byte identical to the repository migration. |
| UUID primary key and owner reference | PASS. SQL checks generated UUID identity, duplicate rejection, missing and unknown owner rejection, and cascade when the fixture Auth account is deleted. |
| Constraints and defaults | PASS. SQL checks default status and priority, optional description, required and non-whitespace title, maximum field lengths, valid boundary lengths, and invalid enum rejection. |
| Timestamp and query behavior | PASS. SQL verifies timestamp column types and defaults, preservation of creation time, advancement of update time on edits, and a valid non-partial owner-leading index. |
| Evidence isolation | PASS. The mandatory integration script requires test opt-in and rejects non-loopback URLs before connecting. The live check used an isolated local database, and the fixture transaction rolled back. No production data was accessed. |

## Commands and actual results

- `cmp` on the two migration files exited 0. `diff -u` on the two config
  files exited 1 because the temporary copy adds `[experimental]` with
  `stack = true` to enable the native runtime. No other config differences
  were reported.
- Ran pinned Supabase CLI 3.3.0 `db reset --local` from the temporary project
  with its isolated CLI home and prior approval. Exit 0. Filtered reset logs
  confirmed migration application and successful completion.
- `npm run lint` and `npm run typecheck` each exited 0.
- Ran `npm run test:integration` with the temporary test environment loaded.
  The sandbox attempt exited 1 with `spawnSync psql EPERM`. The approved
  retry exited 0 and passed both the live schema test and the SSR smoke test.
- `git diff --check` and `git diff --cached --check` each exited 0.

During harness preparation, missing opt-in and a dummy remote URL each
produced the expected nonzero integration result without connecting. The
Docker daemon was unavailable in this environment, so Develop started the
disposable Supabase stack using the official CLI's native runtime and
Testing exercised its loopback psql path. Docker execution was unverified.

No schema acceptance defects require correction. RLS behavior with ordinary
users belongs to DT-03B. Auth application flows, unit and browser regression,
production build, and release coverage were outside this database schema
assignment and unexecuted here.
