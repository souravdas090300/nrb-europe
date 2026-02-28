import { Metadata } from 'next'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for NRB Europe',
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const t = dictionary.privacy

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">{t.title}</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          {t.intro}
        </p>

        <h2>{t.collectTitle}</h2>
        <p>
          {t.collectText}
        </p>

        <h2>{t.useTitle}</h2>
        <p>
          {t.useText}
        </p>

        <h2>{t.contactTitle}</h2>
        <p>
          {t.contactText}{' '}
          <a href="mailto:contact@nrbeurope.com" className="text-red-600 hover:underline">
            contact@nrbeurope.com
          </a>
        </p>
      </div>
    </div>
  )
}
