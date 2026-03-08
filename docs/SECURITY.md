# Security Documentation

Comprehensive security implementation details for NRB Europe.

---

## Overview

NRB Europe implements **defense-in-depth** security across multiple layers:

1. **Middleware Layer** — Request filtering before reaching the application
2. **API Security Layer** — Per-route protection via `withSecurity()` wrapper
3. **Authentication Layer** — NextAuth with brute-force protection
4. **Input Validation** — Sanitization and injection detection
5. **HTTP Headers** — Browser security via response headers

---

## 1. Middleware Security (`src/middleware.ts`)

The middleware runs on every request before it reaches any page or API route.

### Bot Blocking
Known malicious user-agents are blocked with `403 Forbidden`:
- SQL injection tools: `sqlmap`, `havij`
- Vulnerability scanners: `nikto`, `nmap`, `masscan`, `zgrab`
- Aggressive crawlers: `semrush`, `ahrefs`, `mj12bot`, `dotbot`, `blexbot`

### Path Blocking
Requests matching known attack patterns return `404 Not Found`:
- Path traversal: `../`
- WordPress probes: `/wp-admin`, `/wp-login`, `/wp-content`, `/wp-includes`, `/xmlrpc.php`
- Config exposure: `/.env`, `/.git`, `/.htaccess`, `/config.php`, `/phpmyadmin`
- SQL injection in URL: `UNION SELECT`, `INSERT INTO`, `DROP TABLE`

### Additional Protections
- **URL length limit:** Requests with paths > 2048 characters return `414 URI Too Long`
- **Null byte rejection:** Paths containing `\0` or `%00` return `400 Bad Request`
- **Request tracing:** Every response gets a unique `X-Request-Id` header (UUID) for debugging

---

## 2. API Security Module (`src/lib/security/`)

### Rate Limiting (`rate-limit.ts`)

In-memory sliding-window rate limiter with configurable limits per route group.

| Limiter | Requests | Window | Use Case |
|---|---|---|---|
| `apiLimiter` | 60 | 1 minute | General API endpoints |
| `authLimiter` | 10 | 15 minutes | Login, register |
| `searchLimiter` | 30 | 1 minute | Search queries |
| `adminLimiter` | 100 | 1 minute | Admin API routes |
| `webhookLimiter` | 50 | 1 minute | External webhooks |
| `strictLimiter` | 5 | 1 minute | Password reset, sensitive ops |

**Features:**
- Per-IP tracking
- Automatic cleanup of expired entries (every 5 minutes)
- Returns `retryAfter` time for `429` responses

### Brute-Force Protection (`brute-force.ts`)

Account lockout system to prevent credential stuffing.

| Parameter | Value |
|---|---|
| Max attempts per IP | 20 |
| Max attempts per email | 5 |
| Lockout duration | 15 minutes |
| Sliding window | 30 minutes |

**Progressive delays after failed attempts:**
| Attempt | Delay |
|---|---|
| 1-3 | 0ms |
| 4 | 1,000ms |
| 5 | 2,000ms |
| 6+ | 5,000ms |

On successful login, all counters reset for that IP/email pair.

### CSRF Protection (`csrf.ts`)

Double-submit cookie pattern:

1. Server generates a cryptographic token (32 random bytes, hex-encoded)
2. Token stored in `__csrf_token` cookie (HttpOnly, SameSite=Strict)
3. Client must send the same token in `x-csrf-token` header
4. Server compares using **constant-time comparison** (prevents timing attacks)
5. Safe methods (GET, HEAD, OPTIONS) bypass CSRF checks

### Input Sanitization (`sanitize.ts`)

All user input is sanitized before processing:

| Function | Purpose |
|---|---|
| `stripHtml(input)` | Remove all HTML tags |
| `escapeHtml(input)` | Escape `<`, `>`, `&`, `"`, `'` to HTML entities |
| `sanitizeString(input)` | Strip null bytes, control characters, trim |
| `sanitizeEmail(input)` | Lowercase, trim, validate format |
| `sanitizeSlug(input)` | Allow only alphanumeric, hyphens, underscores |
| `validateLength(input, min, max)` | Length bounds checking |
| `sanitizeBody(body)` | Deep recursive sanitization of request body objects |
| `hasSqlInjection(input)` | Detect SQL injection patterns (UNION, SELECT, DROP, etc.) |
| `hasNoSqlInjection(input)` | Detect NoSQL injection (`$gt`, `$ne`, `$where`, etc.) |
| `isSafeUrl(url)` | Reject `javascript:`, `data:`, `vbscript:` protocols |

### Unified Security Wrapper (`api-security.ts`)

The `withSecurity()` function wraps API handlers with all protections:

```typescript
export const POST = withSecurity(handler, {
  methods: ['POST'],
  rateLimit: authLimiter,
  requireAuth: true,
  requireAdmin: false,
  maxBodySize: 1024 * 1024, // 1MB
  sanitizeInput: true,
})
```

**Execution order:**
1. Method validation
2. Rate limit check
3. Body size check (default: 1MB)
4. Authentication check (if required)
5. Admin role check (if required)
6. Input sanitization (if enabled)
7. Handler execution
8. Security headers added to response

**Security headers added by wrapper:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

**IP extraction priority:**
1. `cf-connecting-ip` (Cloudflare)
2. `x-real-ip` (Nginx)
3. `x-forwarded-for` (first IP in chain)
4. Fallback: `'unknown'`

---

## 3. Authentication Security

### Password Handling
- Hashed with **bcrypt** (12 salt rounds — higher than default 10)
- Passwords are never sanitized (to allow special characters)
- Minimum 8 characters, maximum 128 characters
- Must contain: uppercase, lowercase, and number

### Email Verification
- 32-byte cryptographic token (hex-encoded)
- 24-hour expiration
- Token deleted after successful verification
- Expired tokens are cleaned up on verification attempt

### Password Reset
- Same token approach as email verification
- Token identifier prefixed with `reset:` for differentiation
- Token deleted after successful password change

### OAuth (Google)
- Uses NextAuth Google Provider
- PrismaAdapter stores accounts, linking OAuth to user records
- Callback URL: `{NEXTAUTH_URL}/api/auth/callback/google`

### Session Security
- JWT strategy (no server-side session storage)
- `NEXTAUTH_SECRET` used for JWT signing
- Minimal payload: `id`, `email`, `name`, `role`

---

## 4. HTTP Security Headers (`next.config.mjs`)

Applied to all routes via Next.js `headers()`:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS for 2 years |
| `X-DNS-Prefetch-Control` | `on` | Allow DNS prefetching |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable sensitive APIs |
| `Cross-Origin-Opener-Policy` | `same-origin` (prod) / `unsafe-none` (dev) | Isolate browsing context |
| `Cross-Origin-Resource-Policy` | `same-origin` | Prevent cross-origin reads |
| `Cross-Origin-Embedder-Policy` | `unsafe-none` | Allow embedding (for Sanity CDN) |

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.sanity.io js.stripe.com *.vercel-scripts.com *.vercel-analytics.com;
style-src 'self' 'unsafe-inline' fonts.googleapis.com;
img-src 'self' data: blob: cdn.sanity.io images.unsplash.com *.googleusercontent.com;
font-src 'self' fonts.gstatic.com;
connect-src 'self' cdn.sanity.io *.sanity.io api.stripe.com *.sentry.io *.vercel-analytics.com;
frame-src 'self' js.stripe.com *.vercel.app;
frame-ancestors 'self' *.vercel.app;
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests; (production only)
```

---

## 5. Additional Security Measures

### Middleware Matcher
System routes are excluded from locale redirect to prevent redirect loops:
```
/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|robots.txt|sw.js|admin|login|register|verify|forgot-password|reset-password|profile|subscribe).*)
```

### Registration Security
- Generic error for existing emails ("Unable to create account") — doesn't reveal whether email exists
- Rate limited: 10 attempts per 15 minutes per IP

### Webhook Verification
- Stripe webhooks verified via `STRIPE_WEBHOOK_SECRET` signature
- Sanity webhooks validated at the endpoint level

### Data Protection
- `poweredByHeader: false` in Next.js config (hides technology stack)
- ETags enabled for cache validation
- Source maps hidden in production (Sentry-only access)

---

## Security Checklist for Deployment

- [ ] `NEXTAUTH_SECRET` is a strong random value (min 32 characters)
- [ ] `NEXTAUTH_URL` exactly matches production domain
- [ ] Google OAuth redirect URIs configured correctly
- [ ] Stripe webhook secret configured
- [ ] `RESEND_API_KEY` set and domain verified
- [ ] PostgreSQL connection uses SSL in production
- [ ] All environment variables are set in deployment platform (not in code)
- [ ] `.env.dev` and `.env.prod` are in `.gitignore`
- [ ] CSP header reviewed for production domains
- [ ] Rate limits adjusted for expected traffic
