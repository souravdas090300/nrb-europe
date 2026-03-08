# NRB Europe

> A multilingual, full-stack news platform for Non-Resident Bangladeshis (NRBs) in Europe — built with Next.js 16, Sanity CMS, Prisma, Stripe, and more.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Sanity](https://img.shields.io/badge/Sanity-v5-F03E2F?logo=sanity)](https://sanity.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)

---

## App Screenshots

![NRB Europe Screenshot 1](src/app/nrb-europe%20project%201.png)

![NRB Europe Screenshot 2](src/app/nrb-europe%20project2.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Content Management (Sanity)](#content-management-sanity)
- [Database (Prisma)](#database-prisma)
- [Internationalization (i18n)](#internationalization-i18n)
- [Payments (Stripe)](#payments-stripe)
- [Email (Resend)](#email-resend)
- [Security](#security)
- [SEO & Performance](#seo--performance)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

**NRB Europe** is a production-grade multilingual news platform serving the NRB (Non-Resident Bangladeshi) community across Europe. It features a full editorial system powered by Sanity CMS, subscription billing via Stripe, Google OAuth + credentials authentication, real-time breaking news, comments, newsletters, PWA support, and comprehensive SEO optimizations.

**Live URL:** [https://nrbeurope.com](https://nrbeurope.com)

---

## Features

### Content & Editorial
- **Sanity CMS** with embedded Studio at `/admin/studio`
- **14 news categories** (Europe, World, Politics, Business, Technology, Health, Science, Entertainment, Sports, Climate, Immigration, Jobs, Lifestyle, Travel)
- **Rich text** via Portable Text with custom block content
- **Hero, trending, latest & video** article sections
- **Breaking news ticker** with live updates
- **Scheduled content publishing** via cron API
- **SEO metadata** per article (custom Sanity schema)

### Multilingual (5 Languages)
- English (default), Bengali (বাংলা), Spanish, German, French
- URL-based locale routing (`/en/`, `/bn/`, `/es/`, `/de/`, `/fr/`)
- Full dictionary-based translations for all UI text

### Authentication & Users
- **Google OAuth** + **email/password** credentials via NextAuth v4
- Email verification flow (Resend)
- Password reset with secure token
- Brute-force protection & progressive delays
- Role-based access: `admin`, `editor`, `subscriber`

### Subscriptions & Payments
- **Stripe Checkout** for monthly/yearly subscriptions
- Stripe Customer Portal for self-service management
- Webhook-driven payment lifecycle
- Payment history tracking

### Engagement
- **Nested comments** with moderation (pending/approved/spam)
- **Newsletter** subscriptions with send/unsubscribe flow
- **PWA** — installable, offline page, service worker

### Admin Dashboard
- Analytics & stats overview
- User management (list, edit, delete)
- Category management (CRUD, hierarchical)
- Subscription management
- Newsletter composer & subscriber management
- Embedded Sanity Studio

### Security (Defense in Depth)
- Rate limiting (per-API configurable)
- Brute-force account lockout
- CSRF double-submit cookie protection
- Input sanitization (HTML, SQL injection, NoSQL injection)
- Security headers (HSTS, CSP, COOP, CORP, X-Frame-Options)
- Malicious bot/path blocking in middleware
- Request ID tracing

### SEO & Performance
- Dynamic sitemap & news sitemap
- RSS feed
- Google News publisher page
- Structured data (JSON-LD)
- ISR (60-second revalidation)
- Image optimization (AVIF/WebP, Sanity CDN + Unsplash)
- Google Analytics integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS 3, Headless UI, Radix UI, Lucide Icons |
| **CMS** | Sanity v5 + next-sanity 12 |
| **Database** | PostgreSQL via Prisma 5 |
| **Auth** | NextAuth v4 (Google OAuth + Credentials) |
| **Payments** | Stripe (Checkout, Portal, Webhooks) |
| **Email** | Resend |
| **Cache** | Redis (ioredis) |
| **Monitoring** | Sentry, Vercel Analytics |
| **Charts** | Recharts |
| **Testing** | Jest 29, React Testing Library, Playwright |
| **Deployment** | Vercel / Netlify |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                      Client (Browser)                │
│  React 19 · Tailwind · PWA · i18n (5 locales)       │
└──────────────┬───────────────────────┬───────────────┘
               │                       │
       SSR / ISR / CSR          REST API Routes
               │                       │
┌──────────────▼───────────────────────▼───────────────┐
│              Next.js 16 (App Router)                 │
│  Middleware (security + i18n) · Server Components    │
│  API Routes · Sentry · Vercel Analytics              │
├──────────────────────────────────────────────────────┤
│                    Service Layer                      │
│  NextAuth · Stripe · Resend · Redis · Security       │
├──────────┬─────────────┬──────────────┬──────────────┤
│ Sanity   │  PostgreSQL  │   Stripe     │   Resend     │
│ (CMS)    │  (Prisma)    │   (Payments) │   (Email)    │
└──────────┴─────────────┴──────────────┴──────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 9+
- **PostgreSQL** database (local or hosted, e.g. Supabase, Neon)
- **Sanity** project (free at [sanity.io](https://sanity.io))
- **Stripe** account (for payments)
- **Resend** account (for emails)
- **Google Cloud** OAuth credentials (for Google sign-in)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nrb-europe.git
cd nrb-europe

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.dev.example .env.dev   # Edit with your values (see below)

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npm run db:migrate

# 6. (Optional) Seed admin user
npm run seed

# 7. Deploy Sanity schema
npm run deploy-schema

# 8. Start development server
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## Environment Variables

Create a `.env.dev` file for local development (loaded via `dotenv-cli`):

```env
# ── Database ──
DATABASE_URL="postgresql://user:pass@host:5432/nrb_europe"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/nrb_europe"

# ── NextAuth ──
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# ── Google OAuth ──
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ── Sanity CMS ──
NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-sanity-api-token"

# ── Stripe ──
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."

# ── Email (Resend) ──
RESEND_API_KEY="re_..."
EMAIL_FROM="NRB Europe <newsletter@nrbeurope.com>"

# ── Redis ──
REDIS_URL="redis://localhost:6379"

# ── Sentry ──
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."

# ── Analytics ──
GOOGLE_ANALYTICS_ID="G-..."
```

For production, create `.env.prod` with production values.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (loads `.env.dev`) |
| `npm run build` | Production build |
| `npm run build:dev` | Build with dev env vars |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright with UI mode |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:push` | Push schema to DB without migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate:prod` | Deploy migrations (production) |
| `npm run deploy-schema` | Deploy Sanity schema to cloud |
| `npm run seed` | Create admin user |
| `npm run seo-audit` | Run SEO audit script |

---

## Project Structure

```
nrb-europe/
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma           # Prisma schema (9 models)
│   └── migrations/             # SQL migration files
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # Robots rules
│   ├── sw.js                   # Service worker
│   └── sitemap.xml             # Generated sitemap
├── scripts/                    # Utility scripts
│   ├── create-admin.ts         # Admin user seeder
│   ├── deploy.sh               # Deployment helper
│   ├── seo-audit.js            # SEO audit tool
│   └── setup-admin.js          # Admin setup wizard
├── src/
│   ├── middleware.ts            # Security + i18n middleware
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Providers wrapper)
│   │   ├── not-found.tsx       # Custom 404 page
│   │   ├── robots.ts           # Dynamic robots.txt
│   │   ├── sitemap.ts          # Dynamic sitemap
│   │   ├── [lang]/             # Localized pages (5 locales)
│   │   │   ├── layout.tsx      # Lang layout (Header, Footer, SEO)
│   │   │   ├── page.tsx        # Homepage (ISR, 60s)
│   │   │   ├── about/          # About page
│   │   │   ├── accessibility/  # Accessibility statement
│   │   │   ├── careers/        # Careers page
│   │   │   ├── category/       # Category listing
│   │   │   ├── contact/        # Contact form
│   │   │   ├── cookies/        # Cookie policy
│   │   │   ├── editorial-policy/
│   │   │   ├── news/           # Article detail pages
│   │   │   ├── privacy/        # Privacy policy
│   │   │   ├── search/         # Search results
│   │   │   └── terms/          # Terms of service
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── page.tsx        # Admin home
│   │   │   ├── dashboard/      # Analytics dashboard
│   │   │   ├── categories/     # Category management
│   │   │   ├── newsletter/     # Newsletter management
│   │   │   ├── settings/       # Settings
│   │   │   ├── subscriptions/  # Subscription management
│   │   │   ├── users/          # User management
│   │   │   └── studio/         # Embedded Sanity Studio
│   │   ├── api/                # API routes (see API Reference below)
│   │   ├── login/              # Sign-in page
│   │   ├── register/           # Sign-up page
│   │   ├── verify/             # Email verification
│   │   ├── forgot-password/    # Password reset request
│   │   ├── reset-password/     # Password reset form
│   │   ├── profile/            # User profile
│   │   ├── subscribe/          # Subscription plans
│   │   ├── offline/            # PWA offline page
│   │   ├── rss.xml/            # RSS feed
│   │   └── news-sitemap.xml/   # Google News sitemap
│   ├── components/
│   │   ├── Analytics/          # Analytics components
│   │   ├── auth/               # Providers, RequireAdmin
│   │   ├── categories/         # Category UI components
│   │   ├── comments/           # Comment system
│   │   ├── layout/             # Header, Footer, AdminSidebar
│   │   ├── media/              # Media/video components
│   │   ├── newsletter/         # Newsletter signup
│   │   ├── pwa/                # PWA install prompt, SW registration
│   │   ├── sections/           # Hero, Trending, Latest, Video sections
│   │   ├── seo/                # Structured data, meta tags
│   │   ├── ui/                 # Shared UI (ThemeProvider, Logo, etc.)
│   │   └── __tests__/          # Component tests
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── constants.ts        # Site constants & categories
│   │   ├── email.ts            # Resend email helpers
│   │   ├── get-dictionary.ts   # Dictionary loader
│   │   ├── i18n-config.ts      # i18n locale configuration
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── redis.ts            # Redis client
│   │   ├── stripe.ts           # Stripe client
│   │   ├── utils.ts            # Utility functions
│   │   ├── dictionaries/       # Translation files (en, bn, es, de, fr)
│   │   ├── data/               # Data helpers
│   │   ├── sanity/             # Sanity client & helpers
│   │   ├── security/           # Security module (6 files)
│   │   └── __tests__/          # Library tests
│   ├── sanity/
│   │   ├── env.ts              # Sanity env variables
│   │   ├── structure.ts        # Desk structure
│   │   ├── admin/              # Custom document actions
│   │   ├── lib/                # Sanity client library
│   │   ├── queries/            # GROQ queries
│   │   ├── schemaTypes/        # Schema definitions
│   │   └── shared/             # Shared Sanity utilities
│   ├── styles/
│   │   └── globals.css         # Global styles + Tailwind
│   └── types/                  # TypeScript type definitions
├── tests/
│   └── e2e/                    # Playwright E2E tests
│       ├── homepage.spec.ts
│       ├── language-switching.spec.ts
│       ├── navigation.spec.ts
│       ├── responsive.spec.ts
│       └── search.spec.ts
├── sanity.config.ts            # Sanity Studio configuration
├── sanity.cli.ts               # Sanity CLI configuration
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── playwright.config.ts        # Playwright configuration
├── jest.config.js              # Jest configuration
├── vercel.json                 # Vercel deployment config
├── netlify.toml                # Netlify deployment config
└── package.json                # Dependencies & scripts
```

---

## Authentication

Powered by **NextAuth v4** with JWT session strategy.

### Providers

| Provider | Flow |
|---|---|
| **Google OAuth** | One-click sign-in via Google |
| **Credentials** | Email + password with bcrypt hashing |

### Auth Flow

1. **Registration** (`POST /api/auth/register`): Validates input → hashes password (bcrypt, 12 rounds) → creates user → generates verification token → sends verification email
2. **Email Verification** (`GET /api/auth/verify?token=xxx`): Validates token → marks `emailVerified` → deletes token
3. **Sign In** (`POST /api/auth/[...nextauth]`): Brute-force check → progressive delay → password comparison → email verification check → JWT issued
4. **Password Reset**: Request (`POST /api/auth/forgot-password`) → email with token → reset (`POST /api/auth/reset-password`)

### Roles

| Role | Access |
|---|---|
| `subscriber` | Read articles, comment, manage profile |
| `editor` | Subscriber + Sanity Studio access |
| `admin` | Full access: dashboard, user mgmt, settings |

---

## Content Management (Sanity)

### Sanity Studio

Embedded at `/admin/studio` with custom desk structure.

**Project:** `j28hbvrr` · **Dataset:** `production` · **API Version:** `2026-01-29`

### Schema Types

| Type | Description |
|---|---|
| `post` | News articles with rich text, categories, authors, SEO |
| `author` | Journalist/author profiles |
| `category` | News categories |
| `seo` | Reusable SEO metadata (title, description, OG image) |
| `blockContent` | Portable Text block definitions |

### Queries

GROQ queries are centralized in `src/sanity/queries/articleQueries.ts`.

---

## Database (Prisma)

**PostgreSQL** with 9 models:

| Model | Purpose |
|---|---|
| `User` | Users with roles, Stripe customer ID, newsletter opt-in |
| `Account` | NextAuth OAuth accounts (Google) |
| `Session` | NextAuth sessions |
| `VerificationToken` | Email verification & password reset tokens |
| `Subscription` | Stripe subscription state (plan, status, period) |
| `Payment` | Stripe payment records |
| `Comment` | Nested comments with moderation status |
| `NewsletterSubscriber` | Independent newsletter subscriptions |
| `Category` | Hierarchical categories (parent/child) |

### Useful Commands

```bash
npm run db:migrate       # Create & apply new migration
npm run db:push          # Push schema without migration
npm run db:studio        # Open Prisma Studio GUI
npm run db:migrate:prod  # Deploy migrations to production
```

---

## Internationalization (i18n)

### Supported Locales

| Code | Language |
|---|---|
| `en` | English (default) |
| `bn` | Bengali (বাংলা) |
| `es` | Spanish (Español) |
| `de` | German (Deutsch) |
| `fr` | French (Français) |

### How It Works

- URL-based routing: `/en/about`, `/bn/about`, `/de/about`
- Middleware detects locale from: cookie (`NEXT_LOCALE`) → `Accept-Language` header → fallback `en`
- Dictionary files in `src/lib/dictionaries/{locale}.ts`
- Pages load dictionaries via `getDictionary(lang)` and pass to components
- System routes (`/api`, `/admin`, `/login`, etc.) bypass locale routing

---

## Payments (Stripe)

### Subscription Plans

- **Monthly** and **Yearly** plans configured via Stripe Price IDs
- Checkout via Stripe Checkout Sessions
- Self-service management via Stripe Customer Portal

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/stripe/create-checkout` | POST | Create Stripe Checkout session |
| `/api/stripe/portal` | POST | Create Customer Portal session |
| `/api/stripe/webhook` | POST | Handle Stripe webhook events |

---

## Email (Resend)

Email sending via [Resend](https://resend.com).

### Email Types

| Function | Purpose |
|---|---|
| `sendVerificationEmail()` | Account email verification |
| `sendWelcomeEmail()` | Welcome message after verification |
| `sendPasswordResetEmail()` | Password reset link |
| `sendEmail()` | Generic email sender |

### Configuration

- Set `RESEND_API_KEY` in environment
- Set `EMAIL_FROM` for sender address (requires verified domain in Resend)
- Default fallback: `onboarding@resend.dev` (for testing only)

> **Important:** You must verify your domain at [resend.com/domains](https://resend.com/domains) to send emails to addresses other than your Resend account email.

---

## Security

The application implements defense-in-depth security across multiple layers:

### Middleware Layer (`src/middleware.ts`)
- Malicious user-agent blocking (sqlmap, nikto, nmap, etc.)
- Attack path blocking (path traversal, WordPress probes, SQL injection in URLs)
- URL length limits (2048 chars) and null byte rejection
- Request ID tracing (`X-Request-Id`)

### API Security (`src/lib/security/`)

| Module | Description |
|---|---|
| `rate-limit.ts` | Sliding-window rate limiting (configurable per route) |
| `brute-force.ts` | Account lockout after failed attempts (20/IP, 5/email) |
| `csrf.ts` | Double-submit cookie CSRF protection |
| `sanitize.ts` | Input sanitization (HTML, SQL/NoSQL injection, URL validation) |
| `api-security.ts` | Unified `withSecurity()` wrapper combining all protections |

### HTTP Security Headers
- `Strict-Transport-Security` (HSTS, 2 years, preload)
- `Content-Security-Policy` (strict CSP with allowed origins)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`
- `Permissions-Policy` (camera, microphone, geolocation disabled)

---

## SEO & Performance

- **ISR** — Incremental Static Regeneration (60-second revalidation on homepage)
- **Dynamic Sitemap** — `sitemap.ts` generates XML sitemap
- **News Sitemap** — `/news-sitemap.xml` for Google News
- **RSS Feed** — `/rss.xml` for feed readers
- **Structured Data** — Organization JSON-LD on all pages
- **OpenGraph & Twitter Cards** — Full metadata per page/article
- **Image Optimization** — AVIF/WebP, Sanity CDN + Unsplash, responsive sizes
- **Google Analytics** — Integrated via `GoogleAnalytics` component
- **robots.txt** — Dynamic generation via `robots.ts`
- **SEO Audit** — Run `npm run seo-audit` for automated checks

---

## Testing

### Unit Tests (Jest)

```bash
npm test                  # Run all unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

- **Environment:** jsdom
- **Libraries:** React Testing Library, jest-dom
- **Coverage:** Source files in `src/` (excluding types, stories, test files)

### E2E Tests (Playwright)

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive UI mode
```

- **5 test suites:** Homepage, Navigation, Language Switching, Search, Responsive
- **5 browser targets:** Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- Auto-starts dev server on `http://localhost:3000`
- 2 retries on CI, HTML reporter

---

## Deployment

### Vercel (Primary)

The project includes a `vercel.json`:

```bash
# Deploy
vercel --prod
```

**Required:** Set all environment variables in Vercel dashboard.

### Netlify (Alternative)

The project includes a `netlify.toml` with:
- Build: `prisma generate && prisma migrate deploy && npm run build`
- Node 20, API redirect to Netlify Functions
- Security headers and static asset caching

```bash
# Deploy
netlify deploy --prod
```

### Production Checklist

- [ ] Set all environment variables (see [Environment Variables](#environment-variables))
- [ ] Verify domain in Resend for email delivery
- [ ] Add OAuth redirect URIs in Google Cloud Console
- [ ] Configure Stripe webhook endpoint
- [ ] Run `npm run db:migrate:prod` for database migrations
- [ ] Run `npm run deploy-schema` to deploy Sanity schema
- [ ] Verify `NEXTAUTH_URL` matches your production domain exactly

---

## Documentation

Detailed documentation is available in the [docs/](docs/) folder:

| Document | Description |
|---|---|
| [docs/API.md](docs/API.md) | Complete API reference (all endpoints) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & design decisions |
| [docs/SECURITY.md](docs/SECURITY.md) | Security implementation details |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guide & checklist |

---

## License

This project is private and proprietary.

---

<p align="center">Built with ❤️ by the NRB Europe team</p>
