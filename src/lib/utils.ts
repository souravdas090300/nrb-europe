/**
 * @file utils.ts — General-purpose utility functions
 *
 * Lightweight helpers shared across components and pages.
 * No side-effects, no external API calls — purely functional.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS class names with conflict resolution.
 * Combines `clsx` (conditional classes) + `tailwind-merge` (deduplication).
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
 * // → 'py-2 bg-blue-500 px-6'  (px-4 is overridden by px-6)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as a human-readable string (e.g. "March 8, 2025").
 * Uses the `en-US` locale for consistent formatting across the site.
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date with time (e.g. "Mar 8, 2025, 2:30 PM").
 * Used for timestamps on comments, payments, etc.
 */
export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Truncate text to a maximum length, appending ‘...’ if truncated.
 * Useful for article excerpts and meta descriptions.
 */
export function truncateText(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Generate a URL-safe slug from a text string.
 * Lowercases, strips special chars, and replaces spaces with hyphens.
 *
 * @example
 * ```ts
 * generateSlug('Hello World!') // → 'hello-world'
 * ```
 */
export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * Estimate reading time for an article body.
 * Assumes an average reading speed of 200 words per minute.
 *
 * @param text - Plain text content (HTML should be stripped first)
 * @returns Reading time in minutes (rounded up)
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
