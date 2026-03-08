# Architecture

System architecture and design decisions for NRB Europe.

---

## High-Level Architecture

```
                       ┌───────────────────────────┐
                       │      CDN / Edge Layer      │
                       │   (Vercel / Netlify Edge)  │
                       └─────────────┬─────────────┘
                                     │
                       ┌─────────────▼─────────────┐
                       │     Next.js 16 Runtime     │
                       │      (App Router, SSR)     │
                       │                            │
                       │  ┌──────────────────────┐  │
                       │  │   Middleware Layer    │  │
                       │  │ Security + i18n + ID  │  │
                       │  └──────────┬───────────┘  │
                       │             │              │
                       │  ┌──────────▼───────────┐  │
                       │  │   App Router Pages   │  │
                       │  │  Server Components   │  │
                       │  │  Client Components   │  │
                       │  └──────────┬───────────┘  │
                       │             │              │
                       │  ┌──────────▼───────────┐  │
                       │  │    API Routes Layer   │  │
                       │  │  REST API Handlers    │  │
                       │  └──────────┬───────────┘  │
                       └─────────────┼─────────────┘
                                     │
            ┌─────────┬──────────┬───┴────┬──────────┬──────────┐
            │         │          │        │          │          │
    ┌───────▼───┐ ┌───▼────┐ ┌──▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼────┐
    │  Sanity   │ │Prisma/ │ │Stripe│ │Resend│ │ Redis │ │ Sentry │
    │  (CMS)    │ │Postgres│ │(Pay) │ │(Mail)│ │(Cache)│ │ (Logs) │
    └───────────┘ └────────┘ └──────┘ └──────┘ └───────┘ └────────┘
```

---

## Design Principles

### 1. Server-First Rendering
- Pages use **React Server Components** by default
- Client components (`'use client'`) only where interactivity is needed (Header, forms, theme toggle)
- **ISR** (Incremental Static Regeneration) for content pages with 60-second revalidation
- **Static generation** for locale pages via `generateStaticParams()`

### 2. Separation of Concerns
- **CMS (Sanity):** All editorial content — articles, authors, categories, SEO metadata
- **Database (Prisma/PostgreSQL):** User data, auth, subscriptions, payments, comments, newsletter subscribers
- **No content duplication:** Sanity is the source of truth for articles; Prisma for user/transactional data

### 3. Security by Default
Every API route can be wrapped with `withSecurity()` which provides rate limiting, auth checks, input sanitization, CSRF protection, and security headers in a single composable wrapper.

### 4. Internationalization as a First-Class Concern
- URL-based locale routing (`/en/`, `/bn/`, etc.) — not query params or cookies alone
- Middleware-level locale detection and redirect
- Type-safe dictionaries with full coverage

---

## Request Lifecycle

```
1. Client Request
       │
2. Edge/CDN (cached static assets returned here)
       │
3. Middleware (src/middleware.ts)
   ├── Block malicious bots
   ├── Block attack paths
   ├── Reject oversized URLs / null bytes
   ├── Add X-Request-Id
   ├── Skip locale routing for /api, /admin, /login, etc.
   └── Redirect to locale if missing (/about → /en/about)
       │
4. Route Handler
   ├── [Page Route] → Server Component → Fetch from Sanity/Prisma → Render
   └── [API Route] → withSecurity() → Business Logic → JSON Response
       │
5. Response with security headers
```

---

## Data Flow

### Content (Read Path)
```
Sanity CMS ──GROQ Query──► Next.js Server Component ──HTML──► Browser
                                    │
                            (ISR cache: 60s)
```

### User Actions (Write Path)
```
Browser ──POST──► API Route ──withSecurity()──► Prisma/Stripe/Resend ──► Response
```

### Real-time
```
Sanity Webhook ──POST──► /api/webhooks/sanity ──► Revalidate ISR cache
Sanity Webhook ──POST──► /api/webhooks/breaking-news ──► Push update
```

---

## Component Architecture

### Page Components (Server)
```
[lang]/page.tsx (Server Component)
  ├── Fetches data from Sanity (parallel GROQ queries)
  ├── Passes data to section components
  └── Renders:
       ├── HeroSection (server)
       ├── LatestStories (server)
       ├── TrendingStories (server)
       ├── VideoSection (server)
       └── Newsletter (client — form interactivity)
```

### Layout Hierarchy
```
RootLayout (src/app/layout.tsx)
  └── Providers (SessionProvider)
       └── LangLayout (src/app/[lang]/layout.tsx)
            ├── ThemeProvider
            ├── GoogleAnalytics
            ├── BreakingNewsTicker
            ├── Header (client — state, menus)
            ├── {children} (page content)
            ├── Footer
            ├── PWAInstallPrompt
            └── ServiceWorkerRegistration
```

### Admin Layout
```
AdminLayout (src/app/admin/layout.tsx)
  └── RequireAdmin (client — session check)
       ├── AdminSidebar
       └── {children} (admin page)
```

---

## Database Schema Relationships

```
User
 ├── 1:N → Account (OAuth providers)
 ├── 1:N → Session
 ├── 1:N → Subscription (Stripe)
 ├── 1:N → Payment (Stripe)
 └── 1:N → Comment
          └── self-referential (parent/replies)

Category
 └── self-referential (parent/children)

VerificationToken (standalone)
NewsletterSubscriber (standalone)
```

---

## Sanity Schema Relationships

```
Post
 ├── N:1 → Author (reference)
 ├── N:M → Category (array of references)
 └── 1:1 → SEO (embedded object)

Author (standalone)
Category (standalone)
```

---

## Authentication Architecture

```
┌─────────┐     ┌──────────────┐     ┌─────────┐
│ Browser  │────►│  NextAuth    │────►│ Prisma  │
│          │     │  (JWT mode)  │     │ (Users) │
└─────────┘     └──────┬───────┘     └─────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐
    │ Google  │  │Credentials│  │ Brute  │
    │ OAuth   │  │ (bcrypt)  │  │ Force  │
    └─────────┘  └───────────┘  │ Guard  │
                                └────────┘
```

**Session Strategy:** JWT (not database sessions) for better serverless performance.

**Token Payload:**
```typescript
{
  id: string      // User ID
  email: string   // User email
  name: string    // User name
  role: string    // admin | editor | subscriber
}
```

---

## Caching Strategy

| Layer | Mechanism | TTL |
|---|---|---|
| **Page Cache** | Next.js ISR | 60 seconds |
| **Static Assets** | CDN / `_next/static` | 1 year (immutable) |
| **Images** | Next.js Image Optimization | 24 hours |
| **API Responses** | No caching (dynamic) | — |
| **Redis** | Session/rate-limit data | Varies |
| **Sanity CDN** | Sanity managed | Instant on publish |

---

## Error Handling

| Layer | Strategy |
|---|---|
| **API Routes** | try/catch → Sentry capture → JSON error response |
| **Server Components** | error.tsx boundaries, not-found.tsx |
| **Client Components** | React error boundaries |
| **Middleware** | Status code responses (403, 404, 400, 414) |
| **External Services** | Graceful degradation (email failure doesn't block registration) |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Sanity for CMS, Prisma for users** | Sanity excels at content modeling; Prisma for relational user/payment data |
| **JWT sessions** | Serverless-friendly, no DB lookup per request |
| **URL-based i18n** | SEO-friendly, each locale has unique URLs for indexing |
| **In-memory rate limiting** | Simple, no external dependency needed for moderate traffic |
| **Defense-in-depth security** | Multiple layers (middleware + API wrapper + headers) |
| **Resend for email** | Modern API, good DX, simple integration |
| **App Router** | Latest Next.js patterns, server components, streaming |
