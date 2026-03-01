/**
 * CSRF Protection — Token-based CSRF prevention for API routes
 * 
 * Uses double-submit cookie pattern:
 * 1. Server generates a CSRF token and sets it as a cookie
 * 2. Client reads the cookie and sends as X-CSRF-Token header
 * 3. Server verifies header matches cookie
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
