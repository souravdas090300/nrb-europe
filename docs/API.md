# API Reference

Complete reference for all API routes in the NRB Europe application.

---

## Table of Contents

- [Authentication](#authentication)
- [Admin](#admin)
- [Content](#content)
- [Comments](#comments)
- [Newsletter](#newsletter)
- [Stripe / Payments](#stripe--payments)
- [Webhooks](#webhooks)
- [Miscellaneous](#miscellaneous)

---

## Authentication

All auth routes are under `/api/auth/`.

### NextAuth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler (sign in, sign out, session, CSRF, providers) |

NextAuth automatically provides:
- `GET /api/auth/session` — Current session
- `GET /api/auth/csrf` — CSRF token
- `GET /api/auth/providers` — Available providers
- `POST /api/auth/signin/{provider}` — Start sign-in flow
- `POST /api/auth/signout` — Sign out
- `GET /api/auth/callback/{provider}` — OAuth callback

### Register

```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123"
}
```

**Validation:**
- Email required, sanitized & lowercased
- Name required (1-100 characters), sanitized
- Password: 8-128 characters, must include uppercase, lowercase, and number

**Responses:**
- `201` — Account created, verification email sent
- `400` — Validation error
- `409` — Email already exists
- `429` — Rate limited (10 attempts / 15 minutes)
- `500` — Server error

### Verify Email

```
GET /api/auth/verify?token={token}
```

**Query Parameters:**
- `token` (required) — Verification token from email

**Responses:**
- `200` — Email verified, `emailVerified` timestamp set
- `400` — Missing or invalid/expired token
- `500` — Server error

### Forgot Password

```
POST /api/auth/forgot-password
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**
- `200` — Reset email sent (always returns success for security, even if email doesn't exist)
- `429` — Rate limited

### Reset Password

```
POST /api/auth/reset-password
```

**Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123"
}
```

**Responses:**
- `200` — Password updated
- `400` — Invalid/expired token or weak password
- `500` — Server error

### Change Password

```
POST /api/auth/change-password
```

**Headers:** Requires authenticated session.

**Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Responses:**
- `200` — Password changed
- `400` — Validation error
- `401` — Not authenticated
- `500` — Server error

### Profile

```
GET /api/auth/profile
PUT /api/auth/profile
```

**PUT Body:**
```json
{
  "name": "Updated Name"
}
```

**Responses:**
- `200` — Profile data or updated profile
- `401` — Not authenticated

---

## Admin

All admin routes require authentication and `admin` role. Routes are under `/api/admin/`.

### Stats

```
GET /api/admin/stats
```

Returns dashboard summary statistics (user count, subscription count, revenue, etc.).

### Analytics

```
GET /api/admin/analytics
```

Returns detailed analytics data for the admin dashboard.

### Users

```
GET /api/admin/users
```

Returns paginated list of all users.

```
GET /api/admin/users/{id}
PUT /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

User CRUD operations (update role, delete user).

### Categories

```
GET /api/admin/categories
POST /api/admin/categories
```

List and create categories.

```
GET /api/admin/categories/{id}
PUT /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

Category CRUD operations.

```
POST /api/admin/categories/seed
```

Seed default categories from constants.

### Newsletter Management

```
GET /api/admin/newsletter/subscribers
```

List all newsletter subscribers.

```
POST /api/admin/newsletter/send
```

**Body:**
```json
{
  "subject": "Newsletter Subject",
  "html": "<h1>Newsletter Content</h1>"
}
```

Send newsletter to all active subscribers.

### Subscriptions

```
GET /api/admin/subscriptions
```

List all Stripe subscriptions with user data.

---

## Content

### Search

```
GET /api/search?q={query}&page={page}
```

**Query Parameters:**
- `q` (required) — Search query
- `page` (optional, default: 1) — Page number

**Rate limit:** 30 requests/minute

### Breaking News

```
GET /api/breaking-news
```

Returns current breaking news from Sanity (live update type).

### Live Updates

```
GET /api/live-updates
```

Returns live updates feed.

---

## Comments

```
GET /api/comments?articleId={articleId}
POST /api/comments
```

**POST Body:**
```json
{
  "articleId": "sanity-article-id",
  "content": "My comment text",
  "parentId": null
}
```

- `parentId` — For nested/reply comments
- Requires authenticated session
- New comments default to `pending` status

### Moderation (Admin)

```
POST /api/comments/moderate
```

**Body:**
```json
{
  "commentId": "comment-id",
  "status": "approved"
}
```

Status options: `approved`, `spam`, `pending`

---

## Newsletter

### Public Subscribe

```
POST /api/newsletter/subscribe
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John"
}
```

### Unsubscribe

```
GET /api/newsletter/unsubscribe?email={email}
```

---

## Stripe / Payments

### Create Checkout Session

```
POST /api/stripe/create-checkout
```

**Headers:** Requires authenticated session.

**Body:**
```json
{
  "priceId": "price_xxx"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Customer Portal

```
POST /api/stripe/portal
```

Creates a Stripe Customer Portal session for self-service subscription management.

### Webhook

```
POST /api/stripe/webhook
```

Handles Stripe webhook events:
- `checkout.session.completed` — New subscription
- `customer.subscription.updated` — Subscription changes
- `customer.subscription.deleted` — Cancellation
- `invoice.payment_succeeded` — Payment recorded

**Requires:** `STRIPE_WEBHOOK_SECRET` for signature verification.

---

## Webhooks

### Sanity Webhook

```
POST /api/webhooks/sanity
```

Handles Sanity content webhook events (revalidation, etc.).

### Breaking News Webhook

```
POST /api/webhooks/breaking-news
```

Triggered by Sanity when breaking news is published.

---

## Miscellaneous

### Push Notifications

```
POST /api/push/subscribe
POST /api/push/unsubscribe
```

Web Push notification subscription management.

### Scheduled Publishing (Cron)

```
GET /api/cron/publish-scheduled
```

Cron endpoint to publish scheduled Sanity posts. Typically called by a cron service.

---

## Rate Limits

| Route Group | Limit |
|---|---|
| Auth routes | 10 requests / 15 minutes |
| Search | 30 requests / minute |
| General API | 60 requests / minute |
| Admin routes | 100 requests / minute |
| Webhooks | 50 requests / minute |
| Sensitive (password reset) | 5 requests / minute |

Rate limits are per-IP using an in-memory sliding window.

---

## Error Responses

All API errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` — Bad Request (validation error)
- `401` — Unauthorized (not authenticated)
- `403` — Forbidden (insufficient role)
- `404` — Not Found
- `409` — Conflict (duplicate resource)
- `429` — Too Many Requests (rate limited)
- `500` — Internal Server Error
