# Architecture

This document describes the runtime boundaries and data ownership in NRB Europe.

## High-Level View

```text
Browser
  -> Next.js 16 App Router
    -> Middleware (security filters, request ID, locale redirect)
    -> Server components and route handlers
      -> Sanity Content Lake
      -> Prisma + PostgreSQL
      -> Stripe
      -> Resend
      -> Redis
      -> Sentry
```

## Runtime Surfaces

### Public site

- Locale-prefixed article and category pages under `src/app/[lang]`
- Non-localized auth and account pages under `src/app`
- Metadata routes for sitemap, news sitemap, robots, and RSS

### Admin experience

- App admin pages under `src/app/admin`
- Embedded Sanity Studio under `src/app/admin/studio/[[...tool]]`
- Admin APIs under `src/app/api/admin`

### API layer

Route handlers in `src/app/api` provide auth, newsletter, comments, categories, Stripe billing, search, live updates, cron hooks, and webhook integrations.

## Data Ownership

### Sanity owns editorial content

- Posts
- Authors
- SEO objects
- Live updates and breaking-news content
- Sponsors
- Studio workflow and desk structure

Relevant code:

- `src/sanity/schemaTypes`
- `src/sanity/queries`
- `sanity.config.ts`

### Prisma/PostgreSQL owns application state

- Users, accounts, sessions, verification tokens
- Subscriptions and payments
- Comments
- Newsletter subscribers
- Admin-managed categories

Relevant code:

- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/app/api/admin/*`

### Categories are intentionally DB-backed in the app

Categories are managed from the app admin area and exposed publicly from `GET /api/categories`. Admin mutations revalidate category-related pages immediately. There is also an admin sync route to mirror database categories into Sanity when editorial tooling needs them.

That means the public site should not assume Sanity is the only source of truth for category navigation.

## Request Flow

### Page request

1. Request hits Next.js middleware.
2. Known attack paths and blocked user agents are rejected early.
3. Missing locale prefixes are redirected to the best matching locale.
4. The route renders with server components.
5. Content comes from Sanity and app state comes from Prisma or other services.

### API request

1. Request reaches an App Router route handler.
2. Security wrappers may enforce auth, role checks, rate limits, and sanitization.
3. Business logic calls Prisma, Sanity, Stripe, Redis, or Resend.
4. The handler returns JSON or HTML depending on the endpoint.

## Caching and Revalidation

- Article and page rendering relies on Next.js caching and revalidation behavior where configured
- Search and comments use Redis-backed caching helpers
- Public categories are served with `Cache-Control: no-store` to avoid stale navigation data
- Category admin changes trigger explicit revalidation of category-related views
- Sanity webhooks support content refresh flows for editorial updates

## Authentication Model

- NextAuth v4 with JWT sessions
- Google OAuth and email/password credentials
- Role values stored in Prisma user records: `admin`, `editor`, `subscriber`
- Admin UI and admin APIs enforce role checks on top of authentication

## Billing Model

- Subscription plans are defined in `src/lib/stripe.ts`
- Checkout begins at `POST /api/stripe/create-checkout`
- Self-service billing portal is exposed via `POST /api/stripe/portal`
- Stripe webhooks persist subscription and payment changes into Prisma

## Repo Structure by Responsibility

```text
src/app            Routes, layouts, metadata routes, and APIs
src/components     Feature and shared UI components
src/lib            Service-layer helpers and integration code
src/sanity         Studio, schema, queries, and Sanity-specific admin tooling
prisma             Relational schema and migrations
scripts            Build and setup helpers
tests/e2e          End-to-end coverage
```

## Operational Notes

- Vercel production builds are expected to run Prisma migrations during build via `scripts/vercel-build.js`
- The middleware is part security layer and part i18n router; documentation should treat both as first-class behavior
- The subscription flow currently has a client/server response mismatch around checkout redirection, which should be fixed in application code separately from this documentation pass