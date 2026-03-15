# API Reference

Current API surface for NRB Europe, based on the route handlers under `src/app/api`.

## Conventions

- Most endpoints return JSON
- Some endpoints return HTML or plain text where that is part of the UX, such as newsletter unsubscribe
- Authenticated routes use the NextAuth session
- Admin routes require an authenticated admin user
- Several routes are wrapped with shared security helpers for rate limiting and auth checks

## Route Inventory

### Authentication

| Method | Route | Notes |
|---|---|---|
| `GET`, `POST` | `/api/auth/[...nextauth]` | NextAuth handler |
| `POST` | `/api/auth/register` | Create a user account |
| `GET` | `/api/auth/verify` | Verify email token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `POST` | `/api/auth/change-password` | Change password for authenticated user |
| `GET`, `PUT` | `/api/auth/profile` | Read or update the current profile |

### Admin

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard summary |
| `GET` | `/api/admin/analytics` | Dashboard analytics |
| `GET` | `/api/admin/users` | List users |
| `GET`, `PUT`, `DELETE` | `/api/admin/users/[id]` | User management |
| `GET`, `POST` | `/api/admin/categories` | List or create DB categories |
| `GET`, `PUT`, `DELETE` | `/api/admin/categories/[id]` | Category management |
| `POST` | `/api/admin/categories/seed` | Seed default categories |
| `POST` | `/api/admin/categories/sync` | Sync DB categories into Sanity |
| `GET` | `/api/admin/subscriptions` | List subscriptions |
| `GET` | `/api/admin/newsletter/subscribers` | List newsletter subscribers |
| `POST` | `/api/admin/newsletter/send` | Send a newsletter blast |

### Public content and discovery

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/categories` | Public active categories from Prisma |
| `GET` | `/api/search?q=...` | Search Sanity posts by title and excerpt |
| `GET` | `/api/breaking-news` | Return current breaking-news content |
| `GET` | `/api/live-updates` | Return live updates feed |

### Comments

| Method | Route | Notes |
|---|---|---|
| `GET`, `POST` | `/api/comments` | Fetch approved comments or create a comment |
| `POST` | `/api/comments/moderate` | Admin moderation action |

`POST /api/comments` expects:

```json
{
  "articleId": "sanity-document-id",
  "content": "Comment text",
  "parentId": null
}
```

New comments from `admin` or `editor` users are auto-approved. Other users create `pending` comments.

### Newsletter

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/newsletter/subscribe` | Create or reactivate a subscriber |
| `GET` | `/api/newsletter/unsubscribe?token=...` | HTML unsubscribe confirmation page |

`POST /api/newsletter/subscribe` accepts:

```json
{
  "email": "user@example.com",
  "name": "Optional Name"
}
```

Important detail: unsubscribe uses a `token` query parameter, not an email address.

### Stripe and billing

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/stripe/create-checkout` | Start subscription checkout |
| `POST` | `/api/stripe/portal` | Open Stripe billing portal |
| `POST` | `/api/stripe/webhook` | Handle Stripe events |

`POST /api/stripe/create-checkout` expects:

```json
{
  "plan": "monthly"
}
```

Valid plans are `monthly` and `yearly`, resolved from environment-backed Stripe price IDs in `src/lib/stripe.ts`.

The route currently returns:

```json
{
  "sessionId": "cs_test_..."
}
```

That return shape is important because the current subscribe page expects a `url`, which is a separate application bug.

Stripe webhook handling includes these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

### Push and scheduled work

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/push/subscribe` | Store push subscription |
| `POST` | `/api/push/unsubscribe` | Remove push subscription |
| `GET` | `/api/cron/publish-scheduled` | Scheduled publish hook |

### External webhooks

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/webhooks/sanity` | Sanity content webhook |
| `POST` | `/api/webhooks/breaking-news` | Breaking-news webhook |

## Error Shapes

Most error responses follow a simple form:

```json
{
  "error": "Human-readable message"
}
```

Common status codes used in this codebase:

- `400` invalid input
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `409` duplicate or already exists
- `429` rate limited
- `500` unhandled server error

## Rate Limiting

Security helpers define per-route-group rate limits used across the API layer:

| Group | Limit |
|---|---|
| Auth | 10 requests / 15 minutes |
| Search | 30 requests / minute |
| General API | 60 requests / minute |
| Admin | 100 requests / minute |
| Webhooks | 50 requests / minute |
| Strict / sensitive operations | 5 requests / minute |