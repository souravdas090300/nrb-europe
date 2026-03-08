/**
 * @file sanitize.ts — Input sanitization & XSS / injection prevention
 *
 * Pure functions for cleansing user input before storage or rendering.
 * No side-effects, no I/O — safe to call anywhere.
 *
 * Categories:
 *  - **HTML**: `stripHtml`, `escapeHtml`
 *  - **Strings**: `sanitizeString`, `sanitizeEmail`, `sanitizeSlug`, `validateLength`
 *  - **Objects**: `sanitizeBody` (recursive, strips HTML from all string fields)
 *  - **Injection detection**: `hasSqlInjection`, `hasNoSqlInjection`
 *  - **URL validation**: `isSafeUrl`
 */

/** Strip HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  }
  return input.replace(/[&<>"'/`]/g, (char) => map[char])
}

/** Remove null bytes and other dangerous control characters */
export function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, '')           // null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars (keep \t \n \r)
    .trim()
}

/** Sanitize and validate an email address */
export function sanitizeEmail(email: string): string | null {
  const cleaned = sanitizeString(email).toLowerCase()
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(cleaned) ? cleaned : null
}

/** Sanitize a slug — only allow lowercase letters, numbers, and hyphens */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Validate and constrain a string length */
export function validateLength(input: string, min: number, max: number): boolean {
  return input.length >= min && input.length <= max
}

/** Sanitize a full request body object — strips HTML from all string values */
export function sanitizeBody<T extends Record<string, unknown>>(body: T): T {
  const sanitized = { ...body }
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key]
    if (typeof value === 'string') {
      ;(sanitized as Record<string, unknown>)[key] = sanitizeString(stripHtml(value))
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      ;(sanitized as Record<string, unknown>)[key] = sanitizeBody(value as Record<string, unknown>)
    }
  }
  return sanitized
}

/** Detect potential SQL injection patterns */
export function hasSqlInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE|GRANT|REVOKE)\b)/i,
    /(--)|(\/\*)|(\*\/)/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER))/i,
  ]
  return patterns.some((pattern) => pattern.test(input))
}

/** Detect potential NoSQL injection patterns */
export function hasNoSqlInjection(input: string): boolean {
  const patterns = [
    /\$(?:gt|gte|lt|lte|ne|eq|in|nin|or|and|not|regex|where|exists|type)/i,
    /\{\s*['"]?\$\w+/,
  ]
  return patterns.some((pattern) => pattern.test(input))
}

/** Validate a URL is safe (no javascript:, data:, etc.) */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
