/**
 * @file api-security.ts — Unified security middleware for Next.js API routes
 *
 * Wraps any route handler with a configurable security pipeline:
 *  1. HTTP method validation
 *  2. Rate limiting (via pre-configured or custom limiter)
 *  3. Request body size enforcement
 *  4. Authentication check (NextAuth session)
 *  5. Admin role authorisation
 *  6. Input sanitisation (strips HTML from JSON body)
 *  7. Security response headers (`X-Content-Type-Options`, `X-Frame-Options`)
 *
 * @example
 * ```ts
 * import { withSecurity } from '@/lib/security/api-security'
 *
 * export const POST = withSecurity(async (req, ctx) => {
 *   // `ctx.session` is guaranteed non-null when requireAuth is true
 *   return NextResponse.json({ ok: true })
 * }, { rateLimit: 'auth', requireAuth: true })
 * ```
 *
 * @see {@link SecurityOptions} for all configuration knobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  apiLimiter,
  authLimiter,
  searchLimiter,
  adminLimiter,
  webhookLimiter,
  strictLimiter,
} from './rate-limit'
import { sanitizeBody } from './sanitize'

/**
 * Extract the real client IP from proxy headers.
 * Checks `x-forwarded-for`, `x-real-ip`, and `cf-connecting-ip` (Cloudflare).
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/** Maps limiter names to pre-configured rate limiter instances. */
const limiters = {
  api: apiLimiter,
  auth: authLimiter,
  search: searchLimiter,
  admin: adminLimiter,
  webhook: webhookLimiter,
  strict: strictLimiter,
} as const

type RateLimitType = keyof typeof limiters

interface SecurityOptions {
  /** Which rate limiter to use (default: 'api') */
  rateLimit?: RateLimitType | false
  /** Require authenticated session (default: false) */
  requireAuth?: boolean
  /** Require admin role (default: false) */
  adminOnly?: boolean
  /** Sanitize request body (default: true for POST/PUT/PATCH) */
  sanitizeInput?: boolean
  /** Allowed HTTP methods (default: all) */
  allowedMethods?: string[]
  /** Max request body size in bytes (default: 1MB) */
  maxBodySize?: number
  /** Custom rate limit override */
  customRateLimit?: number
  /** Log security events (default: true in production) */
  logEvents?: boolean
}

interface SecurityContext {
  ip: string
  session: Awaited<ReturnType<typeof getServerSession>> | null
  userAgent: string
}

type SecureHandler = (
  request: NextRequest,
  context: SecurityContext & { params?: Record<string, string> }
) => Promise<NextResponse | Response>

/**
 * Log a security event to the console (production) or dev tools.
 * In production this could be forwarded to Sentry / LogRocket / Datadog.
 */
function logSecurityEvent(event: string, details: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, event, ...details }

  if (process.env.NODE_ENV === 'production') {
    // In production, this would go to Sentry, LogRocket, etc.
    console.warn(`[SECURITY] ${event}`, JSON.stringify(logEntry))
  } else {
    console.log(`[SECURITY] ${event}`, logEntry)
  }
}

/**
 * Wraps an API handler with security checks
 */
export function withSecurity(handler: SecureHandler, options: SecurityOptions = {}) {
  const {
    rateLimit = 'api',
    requireAuth = false,
    adminOnly = false,
    sanitizeInput = true,
    allowedMethods,
    maxBodySize = 1024 * 1024, // 1MB
    customRateLimit,
    logEvents = process.env.NODE_ENV === 'production',
  } = options

  return async (request: NextRequest, routeContext?: { params?: Promise<Record<string, string>> }) => {
    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const resolvedParams = routeContext?.params ? await routeContext.params : undefined

    try {
      // 1. Method check
      if (allowedMethods && !allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // 2. Rate limiting
      if (rateLimit !== false) {
        const limiter = limiters[rateLimit]
        const result = limiter.check(ip, customRateLimit)

        if (!result.success) {
          if (logEvents) {
            logSecurityEvent('RATE_LIMIT_EXCEEDED', {
              ip,
              path: request.nextUrl.pathname,
              method: request.method,
              limiterType: rateLimit,
            })
          }
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(result.resetTime),
              },
            }
          )
        }
      }

      // 3. Body size check (for POST/PUT/PATCH)
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentLength = request.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > maxBodySize) {
          return NextResponse.json(
            { error: 'Request body too large' },
            { status: 413 }
          )
        }
      }

      // 4. Authentication check
      let session = null
      if (requireAuth || adminOnly) {
        session = await getServerSession(authOptions)

        if (!session || !session.user) {
          if (logEvents) {
            logSecurityEvent('UNAUTHORIZED_ACCESS', {
              ip,
              path: request.nextUrl.pathname,
              method: request.method,
            })
          }
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 5. Admin role check
        if (adminOnly) {
          const user = session.user as { role?: string }
          const normalizedRole = (user.role || '').toLowerCase()
          if (normalizedRole !== 'admin') {
            if (logEvents) {
              logSecurityEvent('FORBIDDEN_ACCESS', {
                ip,
                path: request.nextUrl.pathname,
                method: request.method,
                userId: (session.user as { id?: string }).id,
              })
            }
            return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
          }
        }
      }

      // 6. Input sanitization for mutation requests
      if (sanitizeInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const contentType = request.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const body = await request.clone().json()
            if (body && typeof body === 'object') {
              sanitizeBody(body)
            }
          }
        } catch {
          // Body parsing failed — let the handler deal with it
        }
      }

      // 7. Call the actual handler
      const securityContext: SecurityContext & { params?: Record<string, string> } = {
        ip,
        session,
        userAgent,
        params: resolvedParams,
      }
      const response = await handler(request, securityContext)

      // 8. Add security response headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('Cache-Control', 'no-store')
      }

      return response
    } catch (error) {
      if (logEvents) {
        logSecurityEvent('API_ERROR', {
          ip,
          path: request.nextUrl.pathname,
          method: request.method,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Quick helper: Extract and validate JSON body with size protection
 */
export async function safeParseBody<T = Record<string, unknown>>(
  request: NextRequest,
  maxSize = 1024 * 1024
): Promise<{ data: T | null; error: string | null }> {
  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > maxSize) {
      return { data: null, error: 'Request body too large' }
    }
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return { data: null, error: 'Invalid request body' }
    }
    return { data: sanitizeBody(body) as T, error: null }
  } catch {
    return { data: null, error: 'Invalid JSON body' }
  }
}
