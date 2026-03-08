/**
 * @file csrf.ts — CSRF protection using the double-submit cookie pattern
 *
 * How it works:
 *  1. Server generates a random CSRF token and sets it as a **non-httpOnly** cookie.
 *  2. Client-side JS reads the cookie and sends it in the `X-CSRF-Token` header.
 *  3. Server compares cookie vs. header using constant-time comparison.
 *
 * GET / HEAD / OPTIONS requests are exempt (safe methods).
 * Cookie lifetime: 24 hours. Token length: 32 bytes (64 hex chars).
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CSRF_COOKIE_NAME = '__csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/** Generate a cryptographically secure CSRF token */
export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
}

/** Validate CSRF token from request (double-submit cookie pattern) */
export function validateCsrfToken(request: NextRequest): boolean {
  // Safe methods don't need CSRF protection
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(request.method)) return true

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) return false

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
  } catch {
    return false
  }
}

/** Set CSRF cookie on a response */
export function setCsrfCookie(response: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateCsrfToken()
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Client-side JS needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  return response
}

/** Extract CSRF token from cookies (for client-side retrieval) */
export function getCsrfTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME }
