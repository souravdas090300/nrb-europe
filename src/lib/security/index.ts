/**
 * @file security/index.ts — Barrel export for the security module
 *
 * Import everything from `@/lib/security` instead of individual files.
 *
 * @example
 * ```ts
 * import { withSecurity, sanitizeEmail, authLimiter } from '@/lib/security'
 * ```
 */

export { rateLimit, apiLimiter, authLimiter, searchLimiter, adminLimiter, webhookLimiter, strictLimiter } from './rate-limit'
export { withSecurity, safeParseBody } from './api-security'
export {
  stripHtml,
  escapeHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizeSlug,
  validateLength,
  sanitizeBody,
  hasSqlInjection,
  hasNoSqlInjection,
  isSafeUrl,
} from './sanitize'
export {
  generateCsrfToken,
  validateCsrfToken,
  setCsrfCookie,
  getCsrfTokenFromCookies,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from './csrf'
export {
  checkBruteForce,
  recordFailedAttempt,
  recordSuccessfulLogin,
  getLockoutStatus,
} from './brute-force'
