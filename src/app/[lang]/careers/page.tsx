import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the NRB Europe team - Career opportunities in journalism and media',
}

export default async function CareersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">Careers at NRB Europe</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Join our growing team of journalists, editors, and media professionals dedicated to serving NRB communities across Europe.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Why Work With Us</h2>
        <ul className="list-disc pl-6 space-y-2 dark:text-gray-300">
          <li>Be part of an independent, mission-driven newsroom</li>
          <li>Cover stories that matter to communities across Europe</li>
          <li>Flexible remote-first work environment</li>
          <li>Opportunities for professional growth and development</li>
          <li>Collaborative and inclusive team culture</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Current Openings</h2>
        <div className="not-prose space-y-4">
          <div className="border dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold text-lg dark:text-white">Staff Reporter — Europe</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Full-time · Remote · EU-based</p>
            <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">Cover news affecting NRB communities across European countries. Strong writing skills and multilingual ability preferred.</p>
          </div>

          <div className="border dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold text-lg dark:text-white">Social Media Editor</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Part-time · Remote</p>
            <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">Manage our social media presence across platforms. Experience with news media and audience engagement required.</p>
          </div>

          <div className="border dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold text-lg dark:text-white">Freelance Contributors</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Freelance · Remote · All locations</p>
            <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">We welcome pitches from freelance journalists covering immigration, jobs, culture, and community stories across Europe.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4 dark:text-white">How to Apply</h2>
        <p className="dark:text-gray-300">
          Send your CV, portfolio or writing samples, and a brief cover letter to{' '}
          <a href="mailto:careers@nrbeurope.com" className="text-red-600 hover:underline">careers@nrbeurope.com</a>.
        </p>
        <p className="dark:text-gray-300 mt-4">
          Don&apos;t see a role that fits?{' '}
          <Link href={`/${lang}/contact`} className="text-red-600 hover:underline">Get in touch</Link> — we&apos;re always interested in hearing from talented people.
        </p>
      </div>
    </div>
  )
}
