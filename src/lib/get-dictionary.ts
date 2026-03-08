/**
 * @file get-dictionary.ts — Server-side dictionary loader
 *
 * Dynamically imports the translation dictionary for the requested locale.
 * Uses `import()` for code-splitting so only the active locale bundle is loaded.
 *
 * This module is marked `'server-only'` — it cannot be imported from
 * Client Components. Pass the dictionary (or individual strings) as props.
 *
 * @example
 * ```ts
 * // In a Server Component or page
 * const dict = await getDictionary('bn')
 * return <h1>{dict.homepage.title}</h1>
 * ```
 *
 * @see {@link src/lib/dictionaries/} for the JSON translation files
 */

import 'server-only'
import type { Locale } from './i18n-config'

/**
 * Lazy-import map for each supported locale.
 * Each entry returns a Promise that resolves to the dictionary object.
 */
const dictionaries = {
  en: () => import('./dictionaries/en').then((module) => module.default),
  bn: () => import('./dictionaries/bn').then((module) => module.default),
  es: () => import('./dictionaries/es').then((module) => module.default),
  de: () => import('./dictionaries/de').then((module) => module.default),
  fr: () => import('./dictionaries/fr').then((module) => module.default),
}

/**
 * Load the translation dictionary for a given locale.
 * Falls back to English if the locale is not found.
 *
 * @param locale - One of the supported locale codes
 * @returns The dictionary object containing all translated strings
 */
export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en()
