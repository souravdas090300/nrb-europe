'use client'

import { usePathname, useRouter } from 'next/navigation'
import { i18n, type Locale } from '@/lib/i18n-config'

const languageNames = {
  en: 'English',
  bn: 'বাংলা',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
}

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split('/')[1] as Locale

  const handleLanguageChange = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    router.push(newPath)
  }

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {i18n.locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageNames[locale]}
          </option>
        ))}
      </select>
    </div>
  )
}
