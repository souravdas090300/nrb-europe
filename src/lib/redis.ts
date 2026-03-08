/**
 * @file redis.ts — Redis caching layer (optional, gracefully degrades)
 *
 * Provides a singleton ioredis client and cache-aside helpers used
 * throughout the app (comments, search results, article data).
 *
 * Key design choices:
 *  - **Graceful degradation**: if `REDIS_URL` is unset or the connection
 *    fails, every helper silently falls through to the underlying data
 *    source. The app works fine without Redis — it just won’t cache.
 *  - **SCAN-based invalidation**: pattern-based cache busting uses
 *    `SCAN` instead of `KEYS` to avoid blocking the Redis event loop.
 *  - **Lazy connect**: the client is created with `lazyConnect: true` so
 *    the connection is only established on the first command.
 *
 * Environment:
 *  - `REDIS_URL` — full Redis connection string (e.g. `redis://...`)
 *
 * @see {@link src/app/api/comments/route.ts} for usage example
 */

import Redis from 'ioredis'

/** Singleton Redis instance (null if REDIS_URL is not configured). */
let redis: Redis | null = null

/**
 * Get (or create) the singleton Redis client.
 * Returns `null` if `REDIS_URL` is not set, allowing the app to run without Redis.
 */
export function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.REDIS_URL
  if (!url) return null

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000)
      },
      connectTimeout: 5000,
      lazyConnect: true,
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message)
    })

    return redis
  } catch {
    console.error('Failed to create Redis client')
    return null
  }
}

/**
 * Cache-aside helper: returns cached value or fetches fresh data and caches it.
 * Falls back to fetcher if Redis is unavailable — never blocks the app.
 *
 * @param key - Cache key
 * @param fetcher - Async function that returns fresh data
 * @param ttlSeconds - Time-to-live in seconds (default: 60)
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60,
): Promise<T> {
  const client = getRedis()

  if (client) {
    try {
      const hit = await client.get(key)
      if (hit) {
        return JSON.parse(hit) as T
      }
    } catch {
      // Redis read failed — fall through to fetcher
    }
  }

  const data = await fetcher()

  if (client) {
    try {
      await client.set(key, JSON.stringify(data), 'EX', ttlSeconds)
    } catch {
      // Redis write failed — non-blocking
    }
  }

  return data
}

/**
 * Invalidate one or more cache keys (e.g. after a webhook or mutation).
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const client = getRedis()
  if (!client || keys.length === 0) return

  try {
    await client.del(...keys)
  } catch {
    // Non-blocking
  }
}

/**
 * Invalidate all keys matching a pattern (e.g. "search:*").
 * Uses SCAN instead of KEYS to avoid blocking Redis in production.
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      )
      cursor = nextCursor
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } while (cursor !== '0')
  } catch {
    // Non-blocking
  }
}
