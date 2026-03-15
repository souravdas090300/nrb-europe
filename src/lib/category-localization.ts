import { Locale, i18n } from '@/lib/i18n-config'

export type CategoryTranslationMap = Partial<Record<Locale, string>>

export const CATEGORY_TRANSLATION_LOCALES = i18n.locales.filter((locale) => locale !== 'en')

function normalizeValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function normalizeCategoryTranslations(input: unknown): CategoryTranslationMap | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null
  }

  const normalizedEntries = Object.entries(input as Record<string, unknown>)
    .map(([locale, value]) => [locale, normalizeValue(value)] as const)
    .filter((entry): entry is readonly [Locale, string] => i18n.locales.includes(entry[0] as Locale) && Boolean(entry[1]))

  if (normalizedEntries.length === 0) {
    return null
  }

  return Object.fromEntries(normalizedEntries) as CategoryTranslationMap
}

export function readCategoryTranslations(input: unknown): CategoryTranslationMap {
  return normalizeCategoryTranslations(input) ?? {}
}

export function getLocalizedCategoryValue(defaultValue: string | null | undefined, translations: unknown, locale: Locale): string {
  const translationMap = readCategoryTranslations(translations)
  return translationMap[locale] || defaultValue || ''
}

export function getLocalizedOptionalCategoryValue(defaultValue: string | null | undefined, translations: unknown, locale: Locale): string | null {
  const localized = getLocalizedCategoryValue(defaultValue, translations, locale)
  return localized || null
}