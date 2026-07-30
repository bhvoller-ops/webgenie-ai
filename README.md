# WebGenie AI Production Repository v1.0

WebGenie AI is an AI Digital Presence Intelligence Platform. Version 1.0 unifies the complete product pipeline with SaaS administration.

## Product pipeline

Reference capture → deterministic and visual intelligence → website blueprint → AI copywriter → builder prompt packages → multi-agent review → approved delivery package.

## Sprint 10: Production SaaS administration

- Subscription state and plan catalog
- Starter, Pro, and Agency usage limits
- Monthly usage event ledger
- Owner, admin, editor, and viewer permissions
- Team invitations and role management
- One-time-display API keys stored as SHA-256 hashes
- Scoped `/api/v1/projects` endpoint
- API request metering
- Audit history
- Idempotent billing-event ingestion boundary
- Workspace administration dashboard at `/settings`

## Important production boundary

The repository includes a provider-neutral billing webhook and subscription data model. Live checkout, payment collection, taxes, invoices, and customer-portal sessions require connection to the chosen billing provider and its verified webhook-signature implementation before production launch.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Configure Supabase credentials.
3. Apply migrations `001` through `011` in order.
4. Install packages with `npm install`.
5. Install Playwright Chromium with `npx playwright install chromium`.
6. Run `npm run dev` and `npm run worker`.

## API example

```bash
curl -H "Authorization: Bearer wg_live_REPLACE_ME" \
  http://localhost:3000/api/v1/projects
```

## Current version

`1.0.0`
Trigger fresh Vercel deployment
## Production deployment

Deploy the Next.js application to Vercel and deploy `Dockerfile.worker` to a persistent container service. The worker cannot run reliably as a Vercel serverless function because it continuously polls for jobs and launches Chromium. See `docs/DEPLOYMENT_READINESS_REPORT.md`.
