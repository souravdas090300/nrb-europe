# NRB Europe

Multilingual news platform for Non-Resident Bangladeshis in Europe, built with Next.js App Router, Sanity Studio, Prisma/PostgreSQL, Stripe, Resend, and NextAuth.

## What This Repo Contains

- Public news site with locale-prefixed routes for English, Bengali, Spanish, German, and French
- Embedded Sanity Studio at `/admin/studio` for editorial content
- Prisma-backed authentication, subscriptions, comments, newsletter subscribers, and admin data
- Stripe subscription checkout, portal, and webhook handling
- PWA assets, RSS feed, sitemap generation, and Google News sitemap
- Jest unit tests and Playwright E2E coverage

## Stack

| Area | Implementation |
|---|---|
| Framework | Next.js 16, React 19, App Router |
| Styling | Tailwind CSS 3 |
| CMS | Sanity v5, next-sanity |
| Database | Prisma 5, PostgreSQL |
| Auth | NextAuth v4 with Google OAuth and credentials |
| Billing | Stripe Checkout, Billing Portal, Webhooks |
| Email | Resend |
| Caching | Redis + route revalidation |
| Monitoring | Sentry, Vercel Analytics |
| Testing | Jest, React Testing Library, Playwright |

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+
- PostgreSQL
- A Sanity project
- Stripe, Resend, and Google OAuth credentials if you want to exercise those flows locally

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Create local environment files

This repo does not currently ship a committed `.env.example`. Create `.env.dev` manually and add the variables your flows need.

Minimum local variables for the app to boot reliably:

```env
DATABASE_URL="postgresql://user:password@host:5432/nrb_europe"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/nrb_europe"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2026-01-29"
SANITY_API_TOKEN="your-sanity-token"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Additional variables are required for specific features:

- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Email: `RESEND_API_KEY`, `EMAIL_FROM`
- Redis: `REDIS_URL`
- Monitoring: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- Analytics: `GOOGLE_ANALYTICS_ID`

### 3. Generate Prisma client and migrate

```bash
npx prisma generate
npm run db:migrate
```

### 4. Optional setup tasks

```bash
npm run seed
npm run deploy-schema
```

- `npm run seed` creates an admin user via `scripts/create-admin.ts`
- `npm run deploy-schema` deploys the local Sanity schema definitions to the configured Sanity project

### 5. Start the app

```bash
npm run dev
```

The `dev` script loads `.env.dev` automatically through `dotenv-cli`.

## Useful Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server with `.env.dev` |
| `npm run build` | Production build |
| `npm run build:dev` | Build using `.env.dev` |
| `npm run build:prod` | Build using `.env.prod` |
| `npm start` | Start the production server |
| `npm run start:prod` | Start with `.env.prod` |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run Jest with coverage |
| `npm run test:e2e` | Run Playwright tests |
| `npm run db:migrate` | Run Prisma dev migrations |
| `npm run db:migrate:prod` | Apply existing migrations in production |
| `npm run db:push` | Push Prisma schema without creating a migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run deploy-schema` | Deploy Sanity schema |
| `npm run seo-audit` | Run the SEO audit script |

## Architecture Summary

NRB Europe separates editorial content from application data:

- Sanity owns articles, authors, live updates, sponsors, SEO fields, and Studio workflows
- Prisma/PostgreSQL owns users, auth records, subscriptions, payments, comments, newsletter subscribers, and admin-managed categories
- Next.js App Router serves both the public site and admin UI
- Middleware adds request filtering, request IDs, and locale redirects
- Stripe, Resend, Redis, and Sentry are integrated at the route and service layer

One important implementation detail: category data used by the public app is database-backed. Admin category changes are revalidated immediately and can be synced into Sanity when needed.

Admin and user account surfaces are intentionally separated:

- `/profile` is the standard end-user account page.
- `/admin/*` is the restricted administrator workspace.
- `/admin/profile` is the administrator-only profile/settings page.
- Admin guards redirect non-admin users to the sign-in flow instead of the end-user profile page.

### Category & Subcategory System

Categories support up to two levels of hierarchy (parent → subcategory):

- **Admin management** — create, edit, delete, enable/disable categories and subcategories via `/admin/categories`. Subcategories appear indented under their parent in the table.
- **Sanity sync** — every create/update/delete automatically syncs to Sanity so editors can tag articles with both parent categories and subcategories. A one-shot **Sync to Sanity** button backfills all existing categories.
- **Navigation** — top-level categories appear in the sticky header nav bar. Those that have subcategories show a hover dropdown on desktop; the hamburger menu indents subcategories below their parent.
- **Category pages** — `/[lang]/category/[slug]` works for all categories, including admin-created ones. Subcategory pages show a parent breadcrumb; parent category pages show subcategory chips for quick navigation.
- **Metadata & static params** — `generateStaticParams` merges Sanity slugs, constant category slugs, and DB-created category slugs so all category pages are pre-built at deploy time.
- **Public API** — `GET /api/categories` returns a tree structure (root categories with `children` arrays) so any component can render the full hierarchy without additional requests.

## Key Routes

### Public pages

- `/{lang}` home page
- `/{lang}/news` and `/{lang}/news/[slug]`
- `/{lang}/category/[slug]`
- `/{lang}/search`
- `/categories`
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify`, `/profile`, `/subscribe`

### Admin pages

- `/admin`
- `/admin/profile`
- `/admin/categories`
- `/admin/dashboard`
- `/admin/newsletter`
- `/admin/settings`
- `/admin/subscriptions`
- `/admin/users`
- `/admin/studio`

### API groups

- `/api/auth/*`
- `/api/admin/*`
- `/api/categories`
- `/api/comments`
- `/api/newsletter/*`
- `/api/search`
- `/api/stripe/*`
- `/api/webhooks/*`

## Project Layout

```text
src/
  app/                  Next.js routes, layouts, metadata routes, API handlers
  components/           Reusable UI and feature components
  lib/                  Auth, email, Prisma, Redis, Stripe, security, i18n helpers
  sanity/               Studio config, schema types, GROQ queries, admin plugins
  styles/               Global styles
  types/                Shared TypeScript types
prisma/                 Database schema and migrations
scripts/                Utility scripts for admin setup, build, and audits
docs/                   Additional project documentation
tests/e2e/              Playwright coverage
```

## Sanity Schema Types

The local Studio schema currently includes:

- `post`
- `author`
- `category`
- `liveUpdate`
- `seo`
- `sponsor`
- `user`
- `blockContent`

Studio configuration lives in `sanity.config.ts` and `src/sanity/schemaTypes/index.ts`.

## Testing

- Jest configuration: `jest.config.js`
- Playwright configuration: `playwright.config.ts`
- Current coverage artifacts are committed under `coverage/` and browser reports under `playwright-report/`

## Deployment Notes

- Vercel builds run through `scripts/vercel-build.js`, which validates Postgres URLs and runs `prisma migrate deploy` for production deployments
- Netlify uses `netlify.toml` to generate Prisma client, run migrations, and build the app
- Production secrets should live in the hosting platform, not in committed env files

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`

## Known Mismatch Worth Fixing

The current client subscription page expects a checkout `url`, while `src/app/api/stripe/create-checkout/route.ts` returns a `sessionId`. That is an application bug, not a documentation issue.