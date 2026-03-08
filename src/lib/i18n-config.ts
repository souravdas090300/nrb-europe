/**
 * @file i18n-config.ts — Internationalisation configuration
 *
 * Defines supported locales and the default language.
 * Used by the middleware (URL-based locale routing) and by
 * `getDictionary()` to load the correct translation file.
 *
 * Supported locales:
 *  - `en` — English (default)
 *  - `bn` — Bengali (বাংলা)
 *  - `es` — Spanish
 *  - `de` — German
 *  - `fr` — French
 */

export const i18n = {
  /** Fallback locale when none is detected from URL or headers. */
  defaultLocale: 'en',
  /** All locales the site supports. Adding a locale here requires a matching dictionary file. */
  locales: ['en', 'bn', 'es', 'de', 'fr'],
} as const

/** Union type of all supported locale codes (e.g. `'en' | 'bn' | 'es' | ...`). */
export type Locale = (typeof i18n)['locales'][number]
