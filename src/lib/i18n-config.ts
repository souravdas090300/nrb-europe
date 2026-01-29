export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'bn', 'es', 'de', 'fr'],
} as const

export type Locale = (typeof i18n)['locales'][number]
