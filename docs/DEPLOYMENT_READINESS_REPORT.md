# WebGenie AI Deployment Readiness Report

## Status

**Conditionally ready after cloud configuration.** The application source, database migrations, web app, and worker are present. Production deployment still requires a GitHub repository, Supabase project, web host, and long-running worker host.

## Blockers found and corrected

1. Removed `@mozilla/readability`, which was unavailable in the test package registry and was not essential to the product. Replaced it with local readable-text extraction.
2. Corrected Playwright network interception. The previous implementation attempted to call `abort()` on a Playwright `Request`; interception now uses `browserContext.route()` and `Route.abort()`.
3. Added the missing `dotenv` dependency used by the worker.
4. Added the missing `autoprefixer` dependency referenced by PostCSS configuration.
5. Replaced the obsolete `next lint` script with `eslint .`.
6. Added GitHub Actions CI, a Vercel configuration, and a dedicated Playwright worker container.

## Cloud architecture

- **Web application:** Vercel
- **Database, authentication, and screenshot storage:** Supabase
- **Analysis worker:** Railway, Render, Fly.io, or another persistent container host
- **Source and CI:** GitHub

The worker must not be deployed as a Vercel serverless function because it performs continuous polling and launches Chromium.

## Required environment variables

### Web application

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BILLING_WEBHOOK_SECRET`
- Optional visual-provider variables

### Worker

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VISUAL_AI_PROVIDER`
- Optional visual-provider credentials

## Supabase steps

1. Create a production Supabase project.
2. Apply migrations `001_foundation.sql` through `011_saas_administration.sql` in order.
3. Confirm the `website-captures` Storage bucket exists and is private.
4. Add the Vercel production and preview callback URLs to Supabase Auth.
5. Test a new-user workspace bootstrap.

## Acceptance test

1. Register and authenticate.
2. Create a project.
3. Add one public website reference.
4. Queue an analysis.
5. Confirm the worker claims and completes the job.
6. Open the full intelligence report.
7. Confirm a website blueprint was generated.
8. Generate a content package.
9. Generate a builder prompt package.
10. Run specialist orchestration.
11. Approve the review.
12. Generate and download a delivery ZIP.

## Remaining risks

- The worker polling implementation does not atomically claim jobs. Run only one worker replica for the MVP, or add a PostgreSQL claim function before horizontal scaling.
- Live billing is not connected.
- Team invitations are stored but no transactional email provider is connected.
- Full build verification must run in GitHub Actions or a normal public npm environment because the current execution environment's private package mirror lacks Supabase packages.
