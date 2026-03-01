/**
 * Rate Limiter — In-memory sliding window rate limiting for API routes
 * 
 * Usage:
 *   import { rateLimit } from '@/lib/security/rate-limit'
 *   const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500, limit: 10 })
 *   const { success } = await limiter.check(ip, limit?)
 */

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

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

const tokenBuckets = new Map<string, Map<string, RateLimitEntry>>()

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

// Pre-configured limiters for common use cases
export const apiLimiter = rateLimit({ interval: 60_000, limit: 60 })              // 60 req/min general API
export const authLimiter = rateLimit({ interval: 15 * 60_000, limit: 10 })         // 10 attempts per 15 min
export const searchLimiter = rateLimit({ interval: 60_000, limit: 30 })            // 30 searches/min
export const adminLimiter = rateLimit({ interval: 60_000, limit: 100 })            // 100 req/min admin API
export const webhookLimiter = rateLimit({ interval: 60_000, limit: 50 })           // 50 webhook calls/min
export const strictLimiter = rateLimit({ interval: 60_000, limit: 5 })             // 5 req/min (password reset, etc.)
