# DevTrack architecture

## Application boundaries

Use Next.js App Router, TypeScript strict mode, and Tailwind CSS. Public
registration and sign-in routes lead to a protected dashboard. Server
Components read dashboard data and server actions handle mutations. Interactive
components handle form feedback, filters, and issue actions. URL query parameters
carry search and filters so dashboard views survive reloads.

Keep schemas, issue rules, and filter normalization in framework-independent
modules. The data adapter owns Supabase calls. Validate forms, query values, IDs,
and environment settings with Zod. Result states distinguish input errors,
missing sessions, and operation failures without exposing database internals.
Refresh dashboard data after successful writes. Authenticated responses must
avoid shared caching.

## Authentication and persistence

Use the Supabase SSR client with cookie-backed sessions. Verify identity from
Supabase before protected rendering and on each mutation. The request client
uses the publishable key and authenticated user's session. Derive ownership
from that identity and enforce it again in PostgreSQL.

Use a versioned issues migration with a generated UUID, required owner reference
to auth.users, required title, optional description, constrained status and
priority, and created and updated timestamps. Use a database trigger to
maintain updated_at and an owner-leading index for dashboard ordering. Cascade
issue deletion if the owning auth account is removed. Apply authenticated
owner policies separately for SELECT, INSERT, UPDATE, and DELETE, with UPDATE
checking both old and new ownership.

Proposed limits are 120 characters for a trimmed title and 4,000 for an optional
description. Use todo and medium as defaults. Default ordering is most recently
updated first, with ID as the tie-breaker. Use parameterized literal substring
search and exact enum filters. Keep status changes available through a labeled
control.

## Environments

Use a dedicated local or isolated Supabase test environment for migration,
auth, integration, and browser checks. The production deployment uses a
separate Supabase project and a public Vercel production URL. Environment
configuration includes only placeholders in Git. Exact compatible framework
and test dependency versions are selected and verified during project setup.

## Release decisions and limits

- Supabase Auth sessions use HTTP-only cookies. The dashboard proxy refreshes
  tokens, and protected page rendering and issue mutations verify identity on
  the server. PostgreSQL policies independently enforce issue ownership.
- Search uses a parameterized, security-invoker PostgreSQL function. It matches
  literal case-insensitive substrings in both fields and applies exact status
  and priority filters before ordering by update time and UUID.
- Kanban movement uses a labeled status selector and a submit button. The
  board stacks its columns on narrow screens and preserves URL-backed filters.
- Production uses Vercel Hobby and Supabase Free. A low-activity database can
  pause. The owner can restore it from Supabase before evaluation. The first
  Vercel release used the CLI and the approved Git revision.
- The supervisor approved production signup without mailbox verification.
  Local confirmation is exercised through Mailpit. The [deployment guide](DEPLOYMENT.md)
  describes how to enable production confirmation with approved free SMTP.
