# Deploying DevTrack

DevTrack runs on Vercel Hobby and a separate Supabase Free project. Use the
production alias Vercel assigns, typically a stable `vercel.app` domain. The
GitHub source repository can stay private. The application must be publicly
reachable, with Supabase authentication protecting its dashboard.

## Current production release

- Application [devtrack-three.vercel.app](https://devtrack-three.vercel.app)
  on the `aguve` Hobby scope.
- Approved source revision `baa62752e3d1c2ce7944086942ede9c60232fd25`.
  The first release used the Vercel CLI with an archive of this revision.
- Supabase project `osmzftezwcxatbwpqnty` in Paris (`eu-west-3`), provisioned
  in a new organization with default Free compute and no paid upgrades.
  Production migration history matches all three repository migrations.
- Production signup currently creates a session without verifying mailbox
  ownership. The supervisor approved this for the assessment deployment.
  To add verification, configure an approved free SMTP sender, install the
  checked-in confirmation template, enable **Confirm email** in Supabase,
  and validate delivery and password login with a disposable identity.

## Prerequisites

- The human supervisor has approved provisioning and public deployment of the
  GitHub revision. Its DevTrack CI workflow has passed.
- A Vercel Hobby owner can install the Vercel GitHub integration for the
  personal repository `aguve/devtrack`. Hobby is for personal, non-commercial
  use. Verify the repository ownership and commit author satisfy Hobby Git
  deployment requirements. [Vercel Hobby](https://vercel.com/docs/plans/hobby)
  · [Vercel Git integration](https://vercel.com/docs/git)
- A Supabase owner can create a project in a Free organization with available
  capacity. Keep production separate from the disposable QA stack. Low-activity
  Free projects can pause after a week. The owner can restore a paused project
  from the Supabase dashboard. [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase)
  · [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- To confirm email for public sign-ups, provide an approved custom SMTP sender
  that stays within a free plan. Supabase's built-in SMTP accepts only the
  organization's team addresses. [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

Use provider dashboards, interactive CLI login, or an approved secret-sharing
channel for credentials. Keep access tokens, database passwords, SMTP secrets,
and demo login details out of Git, logs, and reports.

## Supabase production database

1. Create a dedicated project in a Free Supabase organization. Save its database
   password in the owner's password manager. Retain the project reference,
   project URL, and **publishable** key. Keep the Data API enabled for the
   public schema. The app needs only the project URL and publishable key.
2. From the approved repository checkout, use the pinned Supabase CLI to sign in
   and link explicitly. Replace `<project-ref>` with the production reference.
   Inspect the remote dry run and its target before proceeding.

   ```sh
   npx --yes supabase@3.3.0 login
   npx --yes supabase@3.3.0 link --project-ref '<project-ref>'
   npx --yes supabase@3.3.0 db push --remote --dry-run
   ```

3. After the owner confirms the target and authorizes the migration, apply it
   interactively. Review the migration history afterward.

   ```sh
   npx --yes supabase@3.3.0 db push --remote
   npx --yes supabase@3.3.0 migration list --remote
   ```

   The history should show `20261124000100`, `20261124000200`, and
   `20261124000300` applied on the remote. The auth schema, issue ownership
   policies and search function stay in PostgreSQL. Reserve `db reset` for the
   intentionally disposable test stack. [Supabase CLI database commands](https://supabase.com/docs/reference/cli/supabase-config)

## Vercel production project

1. In the eligible Hobby account, connect GitHub and grant access to just the
   DevTrack repository. Import `aguve/devtrack` after the owner authorizes the
   initial production deployment. Use the repository root, Next.js preset,
   `main` as the production branch, Node.js 22.x, `npm ci` for installation,
   and `npm run build` for the build. [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
   · [Build configuration](https://vercel.com/docs/builds/configure-a-build)
   · [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
2. In the Production environment, set the following server variables. Keep
   preview environments separate from the production database. [Vercel environment variables](https://vercel.com/docs/environment-variables)

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | Hosted production Supabase project URL |
   | `SUPABASE_PUBLISHABLE_KEY` | Hosted production publishable key beginning with `sb_publishable_` |

3. Publish the approved revision and record its stable alias under the
   Production deployment. In project **Settings → Deployment Protection**,
   disable Vercel Authentication for production. If only a project-level switch
   appears, disable that switch. Check the production alias from a browser
   without a Vercel session. [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
   · [Current production protection availability](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan)

## Production email and demo account

1. In Supabase Authentication URL configuration, set **Site URL** to the stable
   HTTPS production alias. Enable the Email/password provider and user sign-ups.
   Leave anonymous sign-ins disabled.
2. With confirmation enabled, configure the approved SMTP credentials in
   Supabase, then copy [the DevTrack confirmation template](../supabase/templates/confirmation.html)
   to **Confirm sign up**. Its link goes to `/auth/confirm` on the configured
   Site URL. Verify delivery to an address outside the Supabase project team.
   If no approved free sender is available, obtain explicit owner approval
   before disabling Confirm email. With that setting off, signup immediately
   creates a session without verifying mailbox ownership. [Auth settings](https://supabase.com/docs/guides/auth/general-configuration)
   · [Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
3. In **Authentication → Users** create a dedicated email/password user for
   evaluation. Use an owner-controlled address and a generated password, and
   confirm the account when creating it. Use the standard application user
   role with no elevated claims. Share the credentials privately and separately
   from the production URL. [Supabase admin user creation](https://supabase.com/docs/reference/javascript/auth-admin-createuser)

## Verify the release

- Open the production alias in a clean browser session without Vercel cookies
  or a bypass link. The landing page and sign-in must load and anonymous
  `/dashboard` navigation must end at DevTrack sign-in. Cross-check anonymously
  from a terminal using the stable alias.

  ```sh
  production_url='https://<production-domain>'
  curl --fail --silent --show-error --output /dev/null \
    --write-out '%{http_code}\n' "$production_url/"
  curl --fail --silent --show-error --location --max-redirs 5 --output /dev/null \
    --write-out '%{http_code} %{url_effective}\n' "$production_url/dashboard"
  ```

- Sign in as the demo user in a fresh browser, confirm the board renders, and
  verify the expected permissions. With approval, create a disposable issue,
  check persistence and status movement, then remove it. Sign out and confirm
  dashboard access is blocked again.
- Verify registration with a separate approved disposable test identity
  according to the selected confirmation mode. The automated integration and
  browser suites use isolated local credentials and targets.
- Record the source revision, GitHub Actions run, stable production alias,
  migration versions and manual validation results. Keep demo credentials in
  the private delivery channel.

## Rollback

Use Vercel's **Instant Rollback** to return the public alias to the immediately
previous deployment on Hobby. Verify its environment and database compatibility.
Vercel restores the earlier deployment configuration, so rebuild an approved
revision when it needs current environment variables. Recheck anonymous
reachability and demo sign-in after any rollback. [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)

An application rollback leaves the database schema in place. For a database
defect, first assess existing data and take an authorized backup if needed.
Prepare a versioned corrective migration, validate it in the isolated stack,
and obtain approval before applying it to the hosted target.
