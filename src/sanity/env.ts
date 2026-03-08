/**
 * @file sanity/env.ts — Sanity project environment variables
 *
 * Exports the Sanity project ID, dataset name, and API version.
 * All values fall back to sensible defaults if env vars are missing.
 * These are consumed by the Sanity client, Studio config, and GROQ queries.
 */

/** Sanity Content Lake API version (date-based). */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-01-29'

/** Sanity dataset to query ("production" by default). */
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

/** Sanity project ID (set via `NEXT_PUBLIC_SANITY_PROJECT_ID`). */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
