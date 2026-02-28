import type { Metadata } from 'next'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'

export const metadata: Metadata = {
  title: 'Contact NRB Europe',
  description: 'Get in touch with NRB Europe editorial team',
}

export default async function ContactPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const t = dictionary.contact

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">{t.title}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">{t.editorialTeam}</h2>
          <div className="space-y-4 dark:text-gray-300">
            <div>
              <h3 className="font-semibold dark:text-gray-100">{t.editorInChief}</h3>
              <p>editor@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold dark:text-gray-100">{t.newsDesk}</h3>
              <p>news@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold dark:text-gray-100">{t.tipsSubmissions}</h3>
              <p>tips@nrbeurope.com</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">{t.otherDepartments}</h2>
          <div className="space-y-4 dark:text-gray-300">
            <div>
              <h3 className="font-semibold dark:text-gray-100">{t.advertising}</h3>
              <p>ads@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold dark:text-gray-100">{t.technicalSupport}</h3>
              <p>support@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold dark:text-gray-100">{t.generalInquiries}</h3>
              <p>info@nrbeurope.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl font-bold mb-4 dark:text-white">{t.correctionPolicy}</h3>
        <p className="dark:text-gray-300">
          {t.correctionText} <strong>corrections@nrbeurope.com</strong> {t.correctionSuffix}
        </p>
      </div>
    </div>
  )
}
