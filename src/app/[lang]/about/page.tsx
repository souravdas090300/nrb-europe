import { Metadata } from 'next'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'

export const metadata: Metadata = {
  title: 'About NRB Europe',
  description: 'Learn about NRB Europe - Your trusted news source for NRB communities in Europe',
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const t = dictionary.about

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">{t.title}</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          {t.intro}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">{t.missionTitle}</h2>
        <p className="dark:text-gray-300">
          {t.missionText}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">{t.standardsTitle}</h2>
        <ul className="list-disc pl-6 space-y-2 dark:text-gray-300">
          <li>{t.standard1}</li>
          <li>{t.standard2}</li>
          <li>{t.standard3}</li>
          <li>{t.standard4}</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">{t.contactTitle}</h2>
        <p className="dark:text-gray-300">
          <strong>Editorial Inquiries:</strong> editor@nrbeurope.com<br />
          <strong>General Contact:</strong> info@nrbeurope.com<br />
          <strong>Address:</strong> London, United Kingdom
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">{t.teamTitle}</h2>
        <p className="dark:text-gray-300">
          {t.teamText}
        </p>
      </div>
    </div>
  )
}
