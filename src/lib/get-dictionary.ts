import 'server-only'
import type { Locale } from './i18n-config'

const dictionaries = {
  en: () => import('./dictionaries/en').then((module) => module.default),
  bn: () => import('./dictionaries/bn').then((module) => module.default),
  es: () => import('./dictionaries/es').then((module) => module.default),
  de: () => import('./dictionaries/de').then((module) => module.default),
  fr: () => import('./dictionaries/fr').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en()
