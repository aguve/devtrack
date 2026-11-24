# DT-05B iteration 0 validation

**PASS for DT-05B.** Native Testing `/root/testing` reviewed the query
working tree over `c070c45`, which also contained approved DT-05A changes.
Develop `/root/develop` implemented the query RPC, server adapter, and
dashboard integration. Testing authored and independently ran the checks.

| Acceptance criterion | Result |
| --- | --- |
| F03 owner-scoped reads | PASS. The live adapter used two confirmed ordinary accounts. Each returned only its rows. The RPC uses invoker security and an explicit authenticated owner predicate, while RLS remains enabled. Its execute grant is limited to the authenticated role. |
| F06 literal search across title or description | PASS. A live check tested mixed-case title and description matches, null descriptions, percent, underscore, backslash, quotes, commas, parentheses, asterisk, and an accented case pair. A nonliteral decoy stayed excluded. |
| F06 filter intersection and stable order | PASS. The live check covered both matching and empty combinations. Different timestamps were sorted newest-first and equal timestamps sorted by UUID ascending despite reversed insertion order. |
| F06 dashboard entry point | PASS. Desktop and mobile Chromium submitted the real GET filter form, verified title and description matches, combined status and priority, checked URL and reload persistence, then cleared active filters to restore the complete view. |
| Invalid query boundary | PASS. Unit checks covered repeated and invalid enum parameters, NUL, blank controls, and the 120-code-point boundary. Both browsers verified that invalid URLs return accessible actionable feedback and no issue results. |

## Commands and results

| Command | Exit | Observation |
| --- | --- | --- |
| `npm run lint` | 0 | No lint diagnostics, including after the browser assertion change. |
| `npm run typecheck` | 0 | Route type generation and strict TypeScript passed after fixture correction and again after the browser assertion change. |
| `npm run test` | 0 | 11 unit and component tests passed. Core line coverage 100% (23/23). |
| `npm run test:integration` with approved local access | 0 | Five tests passed, including live adapter query, schema, RLS, Auth, and SSR. |
| `npm run build` with approved invocation | 1 | Default Turbopack failed to bind the CSS worker port (EPERM). |
| `npm run build -- --webpack` | 0 | Next compiled, typechecked, and generated the production routes. This build supplied the browser server. Develop had previously reported a TypeScript `--showConfig` parsing error in webpack mode. Testing verified the standalone compiler produced parseable JSON, and the webpack error did not recur. |
| First `npm run test:e2e` with approved local access | 1 | 12 passed and two query cases failed on the test-owned locator described below. |
| Final `npm run test:e2e` with approved local access | 0 | All 14 browser runs passed across desktop and mobile Chromium. |
| `diff -qr` on candidate and isolated migrations | 0 | All three migration files matched the isolated copy. |
| `git diff --check` and `git diff --cached --check` | 0 | No whitespace diagnostics. |

Targeted scans found no common credential patterns in the submitted files,
Git history, or browser JavaScript. The isolated query test authenticated
with ordinary fixture accounts and cleaned up both accounts.

## Testing corrections and release check

Before review, TypeScript rejected the query test's foreign row seed because
the fixture array was inferred as a union that the client insert overload
could not accept. Testing annotated the array with the app's exact database
insert type at `tests/integration/issue-queries.test.ts:23`. Typecheck and
the focused live query check passed afterwards.

During review, the initial browser suite failed at the former
`tests/e2e/issue-queries.spec.ts:64` when a repeated status parameter
rendered the validation alert. The test expected one global alert, while
the page contained both the intended message and Next's route announcer.
Testing scoped the assertion to the named issues region and verified Clear
filters from an active filtered state. The full rerun passed. This was a
low-severity harness defect. No app correction cycle was required.

The exact default production build remains open for release validation.
No DT-05B application acceptance defects require correction.
