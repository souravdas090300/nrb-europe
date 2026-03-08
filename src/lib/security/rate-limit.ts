/**
 * @file rate-limit.ts — In-memory sliding window rate limiting
 *
 * Implements a token-bucket rate limiter stored entirely in process memory
 * (no Redis dependency). Each unique token (typically a client IP) gets a
 * counter that resets after the configured interval.
 *
 * Memory is bounded by `uniqueTokenPerInterval` — when the limit is
 * reached, expired entries are cleaned up before rejecting.
 *
 * Pre-configured limiters are exported for common use cases:
 *  - `apiLimiter`     — 60 req/min  (general API)
 *  - `authLimiter`    — 10 req/15min (login / register)
 *  - `searchLimiter`  — 30 req/min  (search endpoints)
 *  - `adminLimiter`   — 100 req/min (admin dashboard)
 *  - `webhookLimiter` — 50 req/min  (Stripe / CMS webhooks)
 *  - `strictLimiter`  — 5 req/min   (password reset, etc.)
 *
 * @example
 * ```ts
 * import { rateLimit } from '@/lib/security/rate-limit'
 * const limiter = rateLimit({ interval: 60_000, limit: 10 })
 * const { success } = limiter.check(clientIp)
 * ```
 *
 * @note In a multi-instance deployment, replace with a Redis-based
 *       limiter (e.g. `@upstash/ratelimit`) for shared state.
 */

/** Tracks request counts per token within a time window. */
interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  /** Time window in milliseconds (default: 60_000 = 1 minute) */
  interval?: number
  /** Max unique tokens (IPs) tracked per interval (default: 500) */
  uniqueTokenPerInterval?: number
  /** Default max requests per interval per token (default: 10) */
  limit?: number
}

/** Outcome of a rate-limit check, including remaining quota info. */
interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Global map of all rate-limiter buckets.
 * Key = composite of config values, Value = Map<token, entry>.
 * Shared across all rate-limiter instances in the same process.
 */
const tokenBuckets = new Map<string, Map<string, RateLimitEntry>>()

/**
 * Create a rate limiter with the given configuration.
 * Returns an object with `check(token)` and `reset(token)` methods.
 */
export function rateLimit(config: RateLimitConfig = {}) {
  const {
    interval = 60_000,
    uniqueTokenPerInterval = 500,
    limit: defaultLimit = 10,
  } = config

  const bucketKey = `${interval}-${uniqueTokenPerInterval}-${defaultLimit}`

  if (!tokenBuckets.has(bucketKey)) {
    tokenBuckets.set(bucketKey, new Map())
  }

  const bucket = tokenBuckets.get(bucketKey)!

  // Periodic cleanup of expired entries
  const cleanup = () => {
    const now = Date.now()
    bucket.forEach((entry, key) => {
      if (now > entry.resetTime) {
        bucket.delete(key)
      }
    })
  }

  return {
    check(token: string, limitOverride?: number): RateLimitResult {
      cleanup()

      const limit = limitOverride ?? defaultLimit
      const now = Date.now()
      const entry = bucket.get(token)

      // First request from this token
      if (!entry || now > entry.resetTime) {
        // Enforce max unique tokens
        if (bucket.size >= uniqueTokenPerInterval) {
          cleanup()
          if (bucket.size >= uniqueTokenPerInterval) {
            return { success: false, limit, remaining: 0, resetTime: now + interval }
          }
        }

        bucket.set(token, { count: 1, resetTime: now + interval })
        return { success: true, limit, remaining: limit - 1, resetTime: now + interval }
      }

      // Existing token — increment
      entry.count += 1

      if (entry.count > limit) {
        return { success: false, limit, remaining: 0, resetTime: entry.resetTime }
      }

      return { success: true, limit, remaining: limit - entry.count, resetTime: entry.resetTime }
    },

    /** Reset a specific token (e.g., after successful auth) */
    reset(token: string) {
      bucket.delete(token)
    },
  }
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for common API use cases
// ---------------------------------------------------------------------------

/** General API: 60 requests per minute */
export const apiLimiter = rateLimit({ interval: 60_000, limit: 60 })
/** Auth endpoints: 10 attempts per 15 minutes */
export const authLimiter = rateLimit({ interval: 15 * 60_000, limit: 10 })
/** Search endpoints: 30 searches per minute */
export const searchLimiter = rateLimit({ interval: 60_000, limit: 30 })
/** Admin endpoints: 100 requests per minute */
export const adminLimiter = rateLimit({ interval: 60_000, limit: 100 })
/** Webhook endpoints: 50 calls per minute */
export const webhookLimiter = rateLimit({ interval: 60_000, limit: 50 })
/** Strict endpoints (password reset, etc.): 5 requests per minute */
export const strictLimiter = rateLimit({ interval: 60_000, limit: 5 })
