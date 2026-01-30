// @ts-ignore - ioredis types may not be resolved in IDE
import Redis from 'ioredis'

// @ts-ignore
const redis: any = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export async function getCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  try {
    const cached = await redis.get(key)
    
    if (cached) {
      return JSON.parse(cached)
    }
    
    const data = await fetchFunction()
    await redis.setex(key, ttl, JSON.stringify(data))
    
    return data
  } catch (error) {
    console.error('Redis error, falling back to direct fetch:', error)
    return fetchFunction()
  }
}

export function invalidateCache(key: string) {
  return redis.del(key)
}

export function invalidateCachePattern(pattern: string) {
  return redis.keys(pattern).then((keys: string[]) => {
    if (keys.length > 0) {
      return redis.del(...keys)
    }
  })
}

export default redis
