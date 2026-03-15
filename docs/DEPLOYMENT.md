# Deployment Guide

This guide reflects the deployment behavior currently implemented in the repository.

## Prerequisites

- Node.js 20+
- A PostgreSQL database reachable from your hosting platform
- A Sanity project and API token
- NextAuth secret and OAuth credentials if Google sign-in is enabled
- Stripe keys if subscription billing is enabled
- Resend credentials if email flows are enabled

## Environment Strategy

The repo uses environment-specific files locally:

- `.env.dev` for local development scripts
- `.env.prod` for local production-style runs

In hosted environments, set variables in the platform dashboard instead of relying on checked-in files.

There is no committed `.env.example` at the moment, so you need to define variables manually.

Core variables to set:

```env
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2026-01-29"
SANITY_API_TOKEN="your-sanity-token"
```

Feature-specific variables:

- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Resend: `RESEND_API_KEY`, `EMAIL_FROM`
- Redis: `REDIS_URL`
- Sentry: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- Analytics: `GOOGLE_ANALYTICS_ID`

## Database Preparation

### Local verification

```bash
npx prisma generate
npm run db:migrate
```

### Production migration path

```bash
npm run db:migrate:prod
```

For Vercel production deploys, migrations are also executed by the custom build script. That behavior is intentional and should not be removed unless deployment strategy changes.

## Sanity Setup

The local CLI config falls back to:

- project ID: `j28hbvrr`
- dataset: `production`

You should still set these explicitly in your environment for clarity.

Deploy the Studio schema with:

```bash
npm run deploy-schema
```

The embedded Studio is served from `/admin/studio`.

Recommended webhook endpoints:

- `POST /api/webhooks/sanity`
- `POST /api/webhooks/breaking-news`

## Vercel

### Build behavior

Vercel uses `vercel.json` and `scripts/vercel-build.js`:

- installs dependencies with `npm install --legacy-peer-deps`
- validates that database URLs are real Postgres URLs
- normalizes common Vercel Postgres aliases into `DATABASE_URL` and `DIRECT_DATABASE_URL`
- runs `npx prisma generate`
- runs `npx prisma migrate deploy` for production deploys
- runs `npm run build`

This build step protects production auth and Prisma-backed routes from schema mismatch failures.

### Required Vercel variables

At minimum:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL` or another supported Postgres alias
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- Sanity variables required by your content queries

### Deploy

```bash
vercel --prod
```

Or deploy through the Git integration.

## Netlify

Netlify uses `netlify.toml` with this build command:

```toml
command = "npx prisma generate && npx prisma migrate deploy && npm run build"
```

That means production Netlify deploys expect valid database credentials at build time.

Set all required environment variables in the Netlify dashboard before the first deployment.

## Stripe

Configure these routes externally:

- Checkout starts at `POST /api/stripe/create-checkout`
- Billing portal starts at `POST /api/stripe/portal`
- Webhook endpoint is `POST /api/stripe/webhook`

Local webhook forwarding example:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Google OAuth

Authorized origins typically include:

- `http://localhost:3000`
- `https://your-domain.com`

Authorized redirect URIs must include:

- `http://localhost:3000/api/auth/callback/google`
- `https://your-domain.com/api/auth/callback/google`

`NEXTAUTH_URL` must match the deployed primary domain exactly.

## Resend

If email flows are enabled, verify the sending domain in Resend and set a valid `EMAIL_FROM` address. Without domain verification, delivery is restricted.

## Post-Deploy Checklist

- Homepage loads successfully
- Locale routes work for `en`, `bn`, `es`, `de`, and `fr`
- Admin user can access `/admin` and `/admin/studio`
- Auth flows work with the configured providers
- Prisma-backed categories load through `/api/categories`
- Stripe webhook delivery succeeds if billing is enabled
- Newsletter subscribe and unsubscribe flows work if email is enabled
- RSS, sitemap, and news sitemap routes respond correctly
- Security headers are present in production

## Operational Caveat

The current checkout flow has an implementation mismatch between the client and `POST /api/stripe/create-checkout`. Deployment will not fix that. If subscriptions are part of the release scope, fix that route and client contract before go-live.