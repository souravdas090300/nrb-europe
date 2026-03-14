# Deployment Guide

Step-by-step deployment guide for NRB Europe.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Sanity CMS Setup](#sanity-cms-setup)
- [Email Setup (Resend)](#email-setup-resend)
- [Google OAuth Setup](#google-oauth-setup)
- [Stripe Setup](#stripe-setup)
- [Deploy to Vercel](#deploy-to-vercel)
- [Deploy to Netlify](#deploy-to-netlify)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 20+
- npm 9+
- Git
- A PostgreSQL database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- [Sanity.io](https://sanity.io) account
- [Stripe](https://stripe.com) account
- [Resend](https://resend.com) account
- [Google Cloud Console](https://console.cloud.google.com) project
- (Optional) [Sentry](https://sentry.io) account for error monitoring

---

## Environment Setup

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.dev.example .env.dev
   ```

2. Fill in all values (see README for full variable list)

3. The `dev` script uses `dotenv-cli` to load `.env.dev`:
   ```bash
   npm run dev    # Loads .env.dev automatically
   ```

### Production

1. Create `.env.prod` with production values
2. **Never commit `.env.dev` or `.env.prod`** — they're in `.gitignore`
3. Set environment variables in your deployment platform (Vercel/Netlify dashboard)

---

## Database Setup

### 1. Create PostgreSQL Database

Use any PostgreSQL provider. Example with Neon:
- Create a project at [neon.tech](https://neon.tech)
- Copy the connection string

### 2. Configure Connection

In `.env.dev`:
```env
DATABASE_URL="postgresql://user:password@host:5432/nrb_europe?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/nrb_europe?sslmode=require"
```

> `DIRECT_DATABASE_URL` is needed for Prisma migrations (bypasses connection pooling).

### 3. Run Migrations

```bash
# Development (creates migration files)
npm run db:migrate

# Production (applies existing migrations)
npm run db:migrate:prod
```

### 4. Seed Admin User

```bash
npm run seed
```

This runs `scripts/create-admin.ts` to create the initial admin user.

### 5. Verify with Prisma Studio

```bash
npm run db:studio
```

Opens a GUI at `http://localhost:5555` to browse your database.

---

## Sanity CMS Setup

### 1. Create Sanity Project

If you don't have a project yet:
```bash
npx sanity init
```

Or use the existing project ID: `j28hbvrr`

### 2. Configure Environment

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="j28hbvrr"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-api-token"
```

Get your API token from: [sanity.io/manage](https://sanity.io/manage) → Project → API → Tokens

### 3. Deploy Schema

```bash
npm run deploy-schema
```

This deploys the schema types (post, author, category, seo, blockContent) to Sanity Cloud.

### 4. Access Studio

The Sanity Studio is embedded at `/admin/studio` (requires admin role).

### 5. Configure Webhooks (Optional)

In Sanity Dashboard → API → Webhooks, add:
- **Breaking News:** POST to `https://yourdomain.com/api/webhooks/breaking-news`
- **Revalidation:** POST to `https://yourdomain.com/api/webhooks/sanity`

---

## Email Setup (Resend)

### 1. Create Resend Account

Sign up at [resend.com](https://resend.com).

### 2. Get API Key

Dashboard → API Keys → Create API Key

```env
RESEND_API_KEY="re_..."
```

### 3. Verify Domain (Required for Production)

**This is mandatory to send emails to any address other than your Resend account email.**

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain" → enter `nrbeurope.com`
3. Add the DNS records Resend provides:
   - **MX record** — for email receiving
   - **TXT record (SPF)** — authorizes Resend to send
   - **CNAME records (DKIM)** — email authentication
4. Click "Verify" — propagation takes minutes to hours
5. Set the sender address:
   ```env
   EMAIL_FROM="NRB Europe <newsletter@nrbeurope.com>"
   ```

### 4. Testing Without Domain Verification

On the free tier without a verified domain, Resend only delivers to your account email. Use `onboarding@resend.dev` as the sender for testing.

---

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "NRB Europe"

### 2. Configure Redirect URIs

**Authorized JavaScript Origins:**
```
http://localhost:3000
https://nrbeurope.com
```

**Authorized Redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://nrbeurope.com/api/auth/callback/google
```

> The redirect URI must **exactly match** — including protocol, domain, port, and path.

### 3. Set Environment Variables

```env
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

### 4. Configure Consent Screen

1. Go to OAuth consent screen
2. Set app name, logo, authorized domains
3. Add scopes: `email`, `profile`, `openid`
4. For testing: Add test users (or publish the app)

### Common Error: `redirect_uri_mismatch`

This means the callback URL doesn't match Google Console settings. Verify:
- `NEXTAUTH_URL` is set correctly (no trailing slash)
- The redirect URI in Google Console matches exactly: `{NEXTAUTH_URL}/api/auth/callback/google`
- If deployed, both localhost and production URLs are added

---

## Stripe Setup

### 1. Get API Keys

From [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys):

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 2. Create Products & Prices

In Stripe Dashboard → Products:
1. Create "Monthly Plan" product → create a recurring price
2. Create "Yearly Plan" product → create a recurring price
3. Copy the Price IDs:

```env
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."
```

### 3. Configure Webhook

In Stripe Dashboard → Developers → Webhooks:
1. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
2. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
3. Copy the signing secret:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Local Webhook Testing

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Deploy to Vercel

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) → Import Project
2. Connect your Git repository
3. Framework preset: Next.js (auto-detected)

### 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all variables from your `.env.prod`.

**Critical variables:**
- `DATABASE_URL` / `DIRECT_DATABASE_URL`
- `NEXTAUTH_URL` = `https://nrbeurope.com` (your production domain)
- `NEXTAUTH_SECRET`
- All Sanity, Stripe, Resend, Google variables

If Vercel is missing `DIRECT_DATABASE_URL`, the build falls back to `DATABASE_URL` so `prisma migrate deploy` can still run. Keep `DIRECT_DATABASE_URL` configured in production when your provider uses pooled URLs.

### 3. Configure Build

The `vercel.json` handles build settings:
```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build"
}
```

### 4. Deploy

```bash
# Via CLI
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

### 5. Custom Domain

In Vercel Dashboard → Settings → Domains → Add `nrbeurope.com`

---

## Deploy to Netlify

### 1. Connect Repository

1. Go to [netlify.com](https://netlify.com) → Add New Site
2. Import from Git

### 2. Build Configuration

The `netlify.toml` handles everything:
```toml
[build]
  command = "npx prisma generate && npx prisma migrate deploy && npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"
```

### 3. Set Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables.

### 4. Deploy

```bash
# Via CLI
netlify deploy --prod

# Or push to main branch
git push origin main
```

---

## Post-Deployment Checklist

### Essential

- [ ] All environment variables set in deployment platform
- [ ] `NEXTAUTH_URL` matches production domain exactly (no trailing slash)
- [ ] Database migrations applied (`npm run db:migrate:prod`)
- [ ] Sanity schema deployed (`npm run deploy-schema`)
- [ ] Admin user seeded (`npm run seed`)
- [ ] Domain verified in Resend for email delivery
- [ ] Google OAuth redirect URIs include production domain
- [ ] Stripe webhook endpoint configured for production domain
- [ ] Stripe uses live keys (not test keys)

### Verification

- [ ] Homepage loads with articles from Sanity
- [ ] All 5 language routes work (`/en`, `/bn`, `/es`, `/de`, `/fr`)
- [ ] Google sign-in works
- [ ] Email/password registration works + verification email arrives
- [ ] Password reset flow works
- [ ] Stripe checkout creates subscription
- [ ] Admin dashboard accessible for admin users
- [ ] Sanity Studio loads at `/admin/studio`
- [ ] Breaking news ticker works
- [ ] Comments can be posted and moderated
- [ ] Newsletter subscription works
- [ ] RSS feed accessible at `/rss.xml`
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] PWA installs correctly

### Performance

- [ ] Lighthouse score checked (target: 90+ on all metrics)
- [ ] Images loading via Sanity CDN / Next.js optimization
- [ ] ISR working (pages refresh within 60 seconds)

### Security

- [ ] HTTPS enforced
- [ ] Security headers present (check via [securityheaders.com](https://securityheaders.com))
- [ ] `.env` files not accessible publicly
- [ ] Sentry capturing errors

---

## Monitoring & Maintenance

### Sentry

Error monitoring is integrated via `@sentry/nextjs`. Check:
- [sentry.io](https://sentry.io) dashboard for runtime errors
- Source maps uploaded during build for readable stack traces

### Vercel Analytics

Page view and Web Vitals tracking via `@vercel/analytics`.

### Regular Maintenance

| Task | Frequency |
|---|---|
| Check Sentry for new errors | Daily |
| Review comment moderation queue | Daily |
| Check Stripe subscription status | Weekly |
| Update npm dependencies | Monthly |
| Review security headers | Monthly |
| Run SEO audit (`npm run seo-audit`) | Monthly |
| Review rate limit thresholds | Quarterly |
| Rotate `NEXTAUTH_SECRET` | Annually |
| Update Google OAuth consent screen | As needed |

---

## Troubleshooting

### `redirect_uri_mismatch` (Google OAuth)
- Verify `NEXTAUTH_URL` has no trailing slash
- Add exact callback URL to Google Console: `{NEXTAUTH_URL}/api/auth/callback/google`
- Wait 5 minutes after updating Google Console settings

### Emails Not Sending (Resend)
- Check Resend dashboard for delivery logs
- Verify domain at resend.com/domains
- Ensure `RESEND_API_KEY` is set
- Without verified domain, can only send to your Resend account email

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if SSL is required (`?sslmode=require`)
- Ensure IP allowlisting if using hosted database
- Run `npx prisma db pull` to test connection

### Build Failures
- Run `npm install --legacy-peer-deps` (peer dependency conflicts)
- Ensure `prisma generate` runs before build
- Check for TypeScript errors: `npx tsc --noEmit`

### Sanity Studio Not Loading
- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` is set
- Check CORS origins in Sanity project settings
- Ensure user has admin role in the database
